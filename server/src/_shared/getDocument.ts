import { readFileSync } from "fs";
import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { Connection } from "../server";
import { validateDocument } from "../_diagnostics/validateDocument";
import { settings } from "./settings";

const textDocuments: TextDocuments<TextDocument> = new TextDocuments(
  TextDocument
);

export function getDocument(uri: string): TextDocument | undefined {
  try {
    const d = textDocuments.get(uri);
    if (d) return d;
    const path = URI.parse(uri).fsPath;
    const content = readFileSync(path).toString();
    const textDocument = TextDocument.create(uri, "scss", 1, content);
    return textDocument;
  } catch {
    console.log(`error on _getTextDocument: ${uri}`);
    return undefined;
  }
}

/** Attach to connection in server.ts */
export function postcssListen(connection: Connection) {
  textDocuments.listen(connection);

  const themeSetting =
    settings.workspaceSettings?.experimental?.themeDiagnosticsFile;

  if (themeSetting) {
    textDocuments.onDidChangeContent((e) => {
      validateDocument(connection, e.document.uri, themeSetting);
    });
  }
}
