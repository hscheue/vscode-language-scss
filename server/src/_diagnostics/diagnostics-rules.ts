import { Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";
import { convertRange } from "../_shared/getRangeFromNode";
import { MixinDiagnostic, VariableDiagnostic } from "../_commands/quickFix";
import { Declaration, Rule } from "postcss";

export function simpleVariableDiagnostic(
  theme: Record<string, string>,
  node: Declaration,
  diagnostics: Diagnostic[],
  spacingPrefix: string | undefined
) {
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

export function simpleMixinDiagnostic(
  node: Rule,
  mixins: { label: string; lines: Record<string, true> }[],
  diagnostics: Diagnostic[]
) {
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
