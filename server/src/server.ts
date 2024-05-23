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
import { getCodeActions } from "./getCodeActions";
import { getExecuteCommand } from "./getExecuteCommand";

export type Connection = typeof connection;

connection.onInitialize((params) => {
  settings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: TextDocumentSyncKind.Incremental,
      },
      completionProvider: { resolveProvider: false },
      codeActionProvider: true,
      hoverProvider: true,
      definitionProvider: true,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      executeCommandProvider: {
        commands: ["theme.quickFix"],
      },
    },
  };
});

connection.onHover((h) => getHover(h));
connection.onCompletion(async (c) => await getCompletions(c));
connection.onDefinition((d) => getDefinition(d));
connection.onCodeAction((c) => getCodeActions(c));
connection.onExecuteCommand((e) => getExecuteCommand(e));

connection.languages.diagnostics.on(async (params) => ({
  kind: DocumentDiagnosticReportKind.Full,
  items: await validateDocument(params.textDocument.uri),
}));

postcssListen(connection);
connection.listen();
