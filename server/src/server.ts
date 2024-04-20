import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { registerLogger } from "./log";
import { settings } from "./settings";
import { getCompletions } from "./postcss-migration/getCompletions";
import { postcssListen } from "./postcss-migration/documents";
import { getHover } from "./postcss-migration/getHover";

const connection = createConnection(ProposedFeatures.all);

export type Connection = typeof connection;

connection.onInitialize((params) => {
  settings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.None,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
      // definitionProvider: true,
    },
  };
});

connection.onInitialized(async () => {
  const workspaceSettings = await connection.workspace.getConfiguration({
    scopeUri: settings.baseURL,
    section: "vscode-language-scss",
  });
  settings.workspaceSettings = workspaceSettings;
});

connection.onHover(async (hover) => {
  return getHover(hover);
});

connection.onCompletion((completion) =>
  getCompletions(completion.textDocument.uri)
);

// connection.onDefinition(async (definition) => {
//   await scan(definition.textDocument.uri);
//   const symbols = getConcatenatedSymbols(definition.textDocument.uri);
//   return getDefinitionFromSymbols(symbols, definition);
// });

registerLogger(connection);
postcssListen(connection);
connection.listen();
