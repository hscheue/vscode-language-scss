import { readFileSync } from "fs";
import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { logMessage } from "../log";
import { Connection } from "../server";

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
    logMessage(`error on _getTextDocument: ${uri}`);
    return undefined;
  }
}

/** Attach to connection in server.ts */
export function postcssListen(connection: Connection) {
  textDocuments.listen(connection);
}
