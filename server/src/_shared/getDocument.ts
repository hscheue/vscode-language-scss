import { readFileSync } from "fs";
import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";

/** Only use directly in server */
export const documents: TextDocuments<TextDocument> = new TextDocuments(
  TextDocument
);

export function getDocument(uri: string): TextDocument | undefined {
  try {
    const d = documents.get(uri);
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
