import { readFileSync } from "fs";
import {
  CompletionItem,
  CompletionItemKind,
  DocumentLink,
  DocumentSymbol,
  MarkupKind,
  Range,
  SymbolKind,
  TextDocument,
  getSCSSLanguageService,
} from "vscode-css-languageservice";
import { TextDocuments } from "vscode-languageserver";
import { URI } from "vscode-uri";

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const languageService = getSCSSLanguageService();
languageService.configure({ validate: false });

/** Attach to connection in server.ts */
export function listen(connection: any) {
  documents.listen(connection);
}

/** Get ast symbols from anywhere */
export async function getSymbols(
  options: { uri: string } | { link: DocumentLink }
): Promise<{
  symbols: DocumentSymbol[];
  links: DocumentLink[];
}> {
  if ("uri" in options) {
    const textDocument = documents.get(options.uri);
    if (!textDocument) return { links: [], symbols: [] };
    return await _parseSymbols(textDocument);
  }

  if ("link" in options) {
    const target = options.link.target;
    if (!target) return { links: [], symbols: [] };
    const uri = URI.parse(target).fsPath;
    const content = readFileSync(uri).toString();
    const textDocument = TextDocument.create(uri, "scss", 1, content);
    return await _parseSymbols(textDocument);
  }

  return { links: [], symbols: [] };
}

async function _parseSymbols(textDocument: TextDocument) {
  const ast = languageService.parseStylesheet(textDocument);
  const symbols = languageService.findDocumentSymbols2(textDocument, ast);
  const links = await languageService.findDocumentLinks2(textDocument, ast, {
    resolveReference: (ref) => new URL(ref, textDocument.uri).toString(),
  });

  return {
    symbols,
    links,
  };
}

/** Get completions from symbols */
export async function getCompletionsFromSymbols(symbols: DocumentSymbol[]) {
  const completionItems: CompletionItem[] = [];
  for (const symbol of symbols) {
    _addVariableCompletions(completionItems, symbol);
    _addMixinCompletions(completionItems, symbol);
  }
  return completionItems;
}

async function _addVariableCompletions(
  completionItems: CompletionItem[],
  symbol: DocumentSymbol
) {
  if (symbol.kind !== SymbolKind.Variable) return;

  completionItems.push({
    label: symbol.name,
    kind: CompletionItemKind.Variable,
    labelDetails: {
      detail: " labelDetails detail ",
      description: " labelDetails description",
    },
  });
}

async function _addMixinCompletions(
  completionItems: CompletionItem[],
  symbol: DocumentSymbol
) {
  if (symbol.kind !== SymbolKind.Method) return;

  completionItems.push({
    label: symbol.name,
    kind: CompletionItemKind.Function,
    labelDetails: {
      detail: " labelDetails detail ",
      description: " labelDetails description",
    },
  });
}
