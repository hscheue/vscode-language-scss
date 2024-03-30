import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  CompletionItem,
} from "vscode-languageserver/node";
import {
  getCompletionsFromSymbols,
  getSymbols,
  listen,
} from "./language-service";

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { resolveProvider: false },
    },
  };
});

connection.onCompletion(async (textDocumentPosition) => {
  const completionItems: CompletionItem[] = [];

  const { links, symbols } = await getSymbols({
    uri: textDocumentPosition.textDocument.uri,
  });

  completionItems.push(...(await getCompletionsFromSymbols(symbols)));

  for (const link of links) {
    const { links, symbols } = await getSymbols({ link });
    completionItems.push(...(await getCompletionsFromSymbols(symbols)));
  }

  return completionItems;
});

listen(connection);
connection.listen();
