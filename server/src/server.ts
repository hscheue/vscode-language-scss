import {
  DocumentDiagnosticReportKind,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { settings } from "./_shared/settings";
import { getCompletions } from "./getCompletions";
import { postcssListen } from "./_shared/getDocument";
import { getHover } from "./getHover";
import { getDefinition } from "./getDefinition";
import { validateDocument } from "./_diagnostics/validateDocument";
import { connection } from "./_shared/connection";

export type Connection = typeof connection;

connection.onInitialize((params) => {
  settings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
      definitionProvider: true,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
    },
  };
});

connection.onHover((h) => getHover(h));
connection.onCompletion((c) => getCompletions(c));
connection.onDefinition((d) => getDefinition(d));
connection.languages.diagnostics.on(async (params) => ({
  kind: DocumentDiagnosticReportKind.Full,
  items: await validateDocument(params.textDocument.uri),
}));

postcssListen(connection);
connection.listen();
