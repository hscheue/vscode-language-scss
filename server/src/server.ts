import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextDocuments,
} from "vscode-languageserver/node";
import {
  CompletionItem,
  TextDocument,
  getSCSSLanguageService,
} from "vscode-css-languageservice";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const languageService = getSCSSLanguageService();
languageService.configure({ validate: false });

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

  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) return [];

  const ast = languageService.parseStylesheet(document);

  return completionItems;
});

documents.listen(connection);
connection.listen();
