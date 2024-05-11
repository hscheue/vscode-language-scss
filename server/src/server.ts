import { TextDocument } from "vscode-languageserver-textdocument";
import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextDocuments,
} from "vscode-languageserver/node";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: TextDocumentSyncKind.Incremental,
      },
    },
  };
});

documents.listen(connection);
connection.listen();
