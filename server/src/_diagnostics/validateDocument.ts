import { Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";
import { getThemeValues } from "./getThemeValues";
import { getDocument } from "../_shared/getDocument";
import { parse } from "postcss-scss";
import { convertRange } from "../_shared/getRangeFromNode";
import {
  asyncThemeMixinDiagnostics,
  asyncThemeSpacingPrefix,
  getThemeSrc,
} from "../_shared/settings";
import { MixinDiagnostic, VariableDiagnostic } from "../_commands/quickFix";

function _addDiagnostic(
  uri: string,
  theme: Record<string, string>,
  diagnostics: Diagnostic[],
  spacingPrefix: string | undefined
) {
  const doc = getDocument(uri);
  if (!doc) return;
  try {
    const root = parse(doc.getText());

    root.walk((node) => {
      if (node.type === "decl") {
        const themeVariable = theme[node.value];

        if (themeVariable) {
          const range = convertRange(node.rangeBy({ word: node.value }));
          if (!range) return;

          if (spacingPrefix && themeVariable.startsWith(spacingPrefix)) {
            if (
              node.prop.startsWith("padding") ||
              node.prop.startsWith("margin") ||
              node.prop.endsWith("gap")
            ) {
              sendVariableDiagnostic(diagnostics, themeVariable, range);
            }
          } else {
            sendVariableDiagnostic(diagnostics, themeVariable, range);
          }
        } else {
          // partial theme value validation just for hex colors
          // i.e. border: 1px solid $color
          const value = /#([a-f0-9])+/i.exec(node.value)?.[0];
          if (value && theme[value]) {
            const prop = theme[value];
            const range = convertRange(node.rangeBy({ word: value }));

            diagnostics.push({
              severity: DiagnosticSeverity.Error,
              message: `${prop} exists in theme file`,
              source: "vscode-language-scss",
              data: VariableDiagnostic.create(range, prop),
              range,
            });
          }
        }
      }
    });

    return diagnostics;
  } catch (err) {
    return [];
  }
}

function sendVariableDiagnostic(
  diagnostics: Diagnostic[],
  themeVariable: string,
  range: Range
) {
  diagnostics.push({
    severity: DiagnosticSeverity.Error,
    message: `${themeVariable} exists in theme file`,
    source: "vscode-language-scss",
    data: VariableDiagnostic.create(range, themeVariable),
    range,
  });
}

function _addMixinDiagnostic(
  uri: string,
  mixins: { label: string; lines: Record<string, true> }[],
  diagnostics: Diagnostic[]
) {
  const doc = getDocument(uri);
  if (!doc) return;
  try {
    const root = parse(doc.getText());

    root.walk((node) => {
      if (node.type === "rule") {
        const lines = new Set<string>();
        node.nodes.forEach((n) => lines.add(n.toString()));

        for (const mixin of mixins) {
          const hasMixin = Object.keys(mixin.lines).every((line) => {
            return lines.has(line);
          });
          if (hasMixin) {
            const range = convertRange(node.rangeBy({ word: node.selector }));
            if (!range) return;
            const label = mixin.label;
            diagnostics.push({
              severity: DiagnosticSeverity.Error,
              message: `${label} exists in theme file\n${Object.keys(
                mixin.lines
              ).join("\n")}`,
              source: "vscode-language-scss",
              data: MixinDiagnostic.create(
                range,
                label,
                Object.keys(mixin.lines),
                Object.keys(mixin.lines).map((word) => {
                  return convertRange(node.rangeBy({ word }));
                })
              ),
              range,
            });
          }
        }
      }
    });

    return diagnostics;
  } catch (err) {
    return [];
  }
}

export async function validateDocument(uri: string): Promise<Diagnostic[]> {
  const theme = await getThemeSrc(uri);
  if (!theme) return [];
  const diagnostics: Diagnostic[] = [];
  const enabledMixins = await asyncThemeMixinDiagnostics();
  const spacingPrefix = await asyncThemeSpacingPrefix();

  const { record, mixins, files } = getThemeValues(theme.uri);
  if (
    !files.includes(uri) &&
    theme.uri !== uri &&
    !uri.includes("/node_modules/")
  ) {
    _addDiagnostic(uri, record, diagnostics, spacingPrefix);
    if (enabledMixins) {
      _addMixinDiagnostic(uri, mixins, diagnostics);
    }
  }

  return diagnostics;
}
