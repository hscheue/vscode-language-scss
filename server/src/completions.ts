import {
  DocumentSymbol,
  CompletionItem,
  SymbolKind,
  CompletionItemKind,
} from "vscode-css-languageservice";

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
