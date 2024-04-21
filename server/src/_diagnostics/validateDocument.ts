import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { Connection } from "../server";
import { getThemeValues } from "./getThemeValues";
import { resolveReference } from "../_shared/resolveReference";
import { getDocument } from "../_shared/getDocument";
import { parse } from "postcss-scss";
import { getRangeFromNode } from "../_shared/getRangeFromNode";

function _addDiagnostic(
  uri: string,
  theme: Record<string, string>,
  diagnostics: Diagnostic[]
) {
  const doc = getDocument(uri);
  if (!doc) return;
  const root = parse(doc.getText());

  root.walk((node) => {
    if (node.type === "decl" && theme[node.value]) {
      const range = getRangeFromNode(node);
      if (!range) return;
      const prop = theme[node.value];
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        message: `${prop} exists in theme file`,
        source: "ex",
        range,
      });
    }
  });

  return diagnostics;
}

export function validateDocument(
  c: Connection,
  uri: string,
  themeSetting: string
): void {
  const diagnostics: Diagnostic[] = [];
  const theme = getThemeValues(resolveReference(themeSetting, uri));
  _addDiagnostic(uri, theme, diagnostics);
  c.sendDiagnostics({ uri, diagnostics });
}