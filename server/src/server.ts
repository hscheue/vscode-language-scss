import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { settings } from "./settings";
import { getCompletions } from "./postcss-migration/getCompletions";
import { postcssListen } from "./postcss-migration/documents";
import { getHover } from "./postcss-migration/getHover";
import { getDefinition } from "./postcss-migration/getDefinition";

const connection = createConnection(ProposedFeatures.all);
export type Connection = typeof connection;

connection.onInitialize((params) => {
  settings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.None,
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
