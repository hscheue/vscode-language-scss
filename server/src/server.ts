import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { getConcatenatedSymbols, listen, scan } from "./documents";
import { getCompletionsFromSymbols } from "./completions";
import { resolveSettings } from "./resolveReference";
import { getHoverFromSymbols } from "./hover";
import { registerLogger } from "./log";
import { getDefinitionFromSymbols } from "./definition";

const connection = createConnection(ProposedFeatures.all);

export type Connection = typeof connection;

connection.onInitialize((params) => {
  resolveSettings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
      definitionProvider: true,
    },
  };
});

connection.onHover(async (hover) => {
  await scan(hover.textDocument.uri);
  const symbols = getConcatenatedSymbols(hover.textDocument.uri);
  return getHoverFromSymbols(symbols, hover);
});

connection.onCompletion(async (completion) => {
  await scan(completion.textDocument.uri);
  const symbols = getConcatenatedSymbols(completion.textDocument.uri);
  return getCompletionsFromSymbols(symbols);
});

connection.onDefinition(async (definition) => {
  await scan(definition.textDocument.uri);
  const symbols = getConcatenatedSymbols(definition.textDocument.uri);
  return getDefinitionFromSymbols(symbols, definition);
});

listen(connection);
registerLogger(connection);
connection.listen();
