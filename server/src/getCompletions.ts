import {
  CompletionItem,
  CompletionItemKind as CIK,
} from "vscode-css-languageservice";
import validateColor from "validate-color";
import { basename } from "path";
import { getNodeSymbols } from "./getNodeSymbols";
import { CompletionParams } from "vscode-languageserver";

export function getCompletions(completion: CompletionParams): CompletionItem[] {
  const uri = completion.textDocument.uri;
  const completions: CompletionItem[] = [];
  const symbols = getNodeSymbols(uri);

  symbols.forEach((symbol) => {
    const node = symbol.node;
    if (node.type === "decl" && node.variable) {
      const kind = validateColor(node.value) ? CIK.Color : CIK.Variable;
      completions.push({
        kind,
        label: node.prop,
        detail: node.value,
        labelDetails: {
          detail: ` ${node.value}`,
          description: basename(uri),
        },
      });
    }

    if (node.type === "atrule" && node.name === "mixin") {
      completions.push({
        label: node.params,
        kind: CIK.Function,
        labelDetails: {
          description: basename(uri),
        },
      });
    }
  });

  return completions;
}
