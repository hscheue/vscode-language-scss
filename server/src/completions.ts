import {
  CompletionItem,
  SymbolKind,
  CompletionItemKind,
} from "vscode-css-languageservice";
import { EnhancedSymbol } from "./enhanceSymbol";
import validateColor from "validate-color";

/** Get completions from symbols */
export async function getCompletionsFromSymbols(symbols: EnhancedSymbol[]) {
  const completionItems: CompletionItem[] = [];
  for (const symbol of symbols) {
    _addVariableCompletions(completionItems, symbol);
    _addMixinCompletions(completionItems, symbol);
  }
  return completionItems;
}

async function _addVariableCompletions(
  completionItems: CompletionItem[],
  symbol: EnhancedSymbol
) {
  if (symbol.kind !== SymbolKind.Variable) return;

  completionItems.push({
    label: symbol.name,
    kind: validateColor(symbol.value ?? "")
      ? CompletionItemKind.Color
      : CompletionItemKind.Variable,
    labelDetails: {
      detail: ` ${symbol.value}`,
      description: symbol.filename,
    },
    detail: symbol.value, // this powers CompletionItemKind.Color
  });
}

async function _addMixinCompletions(
  completionItems: CompletionItem[],
  symbol: EnhancedSymbol
) {
  if (symbol.kind !== SymbolKind.Method) return;

  completionItems.push({
    label: symbol.name,
    kind: CompletionItemKind.Function,
    labelDetails: {
      detail: ` ${symbol.value}`,
      description: symbol.filename,
    },
  });
}
