import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { getThemeValues } from "./getThemeValues";
import { resolveReference } from "../_shared/resolveReference";
import { getDocument } from "../_shared/getDocument";
import { parse } from "postcss-scss";
import { convertRange } from "../_shared/getRangeFromNode";
import { asyncThemeDiagnosticsFile } from "../_shared/settings";
import { connection } from "../_shared/connection";

function _addDiagnostic(
  uri: string,
  theme: Record<string, string>,
  diagnostics: Diagnostic[]
) {
  const doc = getDocument(uri);
  if (!doc) return;
  try {
    const root = parse(doc.getText());

    root.walk((node) => {
      if (node.type === "decl" && theme[node.value]) {
        const range = convertRange(node.rangeBy({ word: node.value }));
        if (!range) return;
        const prop = theme[node.value];
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          message: `${prop} exists in theme file`,
          source: "vscode-language-scss",
          data: { value: prop },
          range,
        });
      }
    });

    return diagnostics;
  } catch (err) {
    return [];
  }
}

export async function validateDocument(uri: string): Promise<Diagnostic[]> {
  const themeSetting = await asyncThemeDiagnosticsFile(connection);
  if (!themeSetting) return [];
  const diagnostics: Diagnostic[] = [];
  const themeUri = resolveReference(themeSetting, uri);
  const { record, files } = getThemeValues(themeUri);
  if (!files.includes(uri) && themeUri !== uri) {
    _addDiagnostic(uri, record, diagnostics);
  }
  return diagnostics;
}
