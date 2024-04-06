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

const connection = createConnection(ProposedFeatures.all);

export type Connection = typeof connection;

connection.onInitialize((params) => {
  resolveSettings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
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

listen(connection);
registerLogger(connection);
connection.listen();
