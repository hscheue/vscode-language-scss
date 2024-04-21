import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { settings } from "./_shared/settings";
import { getCompletions } from "./getCompletions";
import { postcssListen } from "./_shared/getDocument";
import { getHover } from "./getHover";
import { getDefinition } from "./getDefinition";

const connection = createConnection(ProposedFeatures.all);
export type Connection = typeof connection;

connection.onInitialize((params) => {
  settings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
      definitionProvider: true,
    },
  };
});

connection.onInitialized(async () => {
  settings.workspaceSettings = await connection.workspace.getConfiguration({
    scopeUri: settings.baseURL,
    section: "vscode-language-scss",
  });
});

connection.onHover((h) => getHover(h));
connection.onCompletion((c) => getCompletions(c));
connection.onDefinition((d) => getDefinition(d));

postcssListen(connection);
connection.listen();
