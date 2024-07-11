import { Diagnostic } from "vscode-languageserver";
import { getThemeValues } from "./getThemeValues";
import { getDocument } from "../_shared/getDocument";
import { parse } from "postcss-scss";
import {
  asyncThemeMixinDiagnostics,
  asyncThemeSpacingPrefix,
  getThemeSrc,
} from "../_shared/settings";
import {
  simpleMixinDiagnostic,
  simpleVariableDiagnostic,
} from "./diagnostics-rules";

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
        simpleVariableDiagnostic(theme, node, diagnostics, spacingPrefix);
      }
    });

    return diagnostics;
  } catch (err) {
    return [];
  }
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
        simpleMixinDiagnostic(node, mixins, diagnostics);
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
