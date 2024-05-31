import { TextDocumentSyncKind } from "vscode-languageserver/node";
import { settings } from "./_shared/settings";
import { getCompletions } from "./getCompletions";
import { documents } from "./_shared/getDocument";
import { getHover } from "./getHover";
import { getDefinition } from "./getDefinition";
import { validateDocument } from "./_diagnostics/validateDocument";
import { connection } from "./_shared/connection";
import { getCodeActions } from "./getCodeActions";
import { getExecuteCommand } from "./getExecuteCommand";
import getDocumentLinks from "./getDocumentLinks";
import { theme_fix_mixin, theme_fix_variable } from "./_commands/quickFix";

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
      documentLinkProvider: { resolveProvider: false },
      executeCommandProvider: {
        commands: [theme_fix_variable, theme_fix_mixin],
      },
    },
  };
});

connection.onHover((h) => getHover(h));
connection.onCompletion(async (c) => await getCompletions(c));
connection.onDefinition((d) => getDefinition(d));
connection.onCodeAction((c) => getCodeActions(c));
connection.onExecuteCommand((e) => getExecuteCommand(e));
connection.onDocumentLinks((l) => getDocumentLinks(l));

documents.onDidChangeContent(async (e) => {
  connection.sendDiagnostics({
    uri: e.document.uri,
    diagnostics: await validateDocument(e.document.uri),
  });
});

documents.listen(connection);
connection.listen();
