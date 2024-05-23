import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { getThemeValues } from "./getThemeValues";
import { getDocument } from "../_shared/getDocument";
import { parse } from "postcss-scss";
import { convertRange } from "../_shared/getRangeFromNode";
import { getThemeSrc } from "../_shared/settings";

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
  const theme = await getThemeSrc(uri);
  if (!theme) return [];
  const diagnostics: Diagnostic[] = [];

  const { record, files } = getThemeValues(theme.uri);
  if (!files.includes(uri) && theme.uri !== uri) {
    _addDiagnostic(uri, record, diagnostics);
  }

  return diagnostics;
}
