import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { getConcatenatedSymbols, listen, scan } from "./documents";
import { getCompletionsFromSymbols } from "./completions";

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize(() => {
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
  symbols.find((symbol) => {});

  // 	const offset = textDocument.offsetAt(hover.position);
  // getNodeAtOffset(ast, offset),

  return {
    contents: `**Hover this**`,
  };
});

connection.onCompletion(async (completion) => {
  await scan(completion.textDocument.uri);
  const symbols = getConcatenatedSymbols(completion.textDocument.uri);
  return getCompletionsFromSymbols(symbols);
});

listen(connection);
connection.listen();
