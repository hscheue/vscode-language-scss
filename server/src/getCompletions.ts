import validateColor from "validate-color";
import { basename } from "path";
import { getNodeSymbols } from "./_shared/getNodeSymbols";
import {
  CompletionItem,
  CompletionItemKind as CIK,
  CompletionParams,
  CompletionItemKind,
} from "vscode-languageserver";
import { getThemeSrc } from "./_shared/settings";

export async function getCompletions(
  completion: CompletionParams
): Promise<CompletionItem[]> {
  const uri = completion.textDocument.uri;
  const completions: CompletionItem[] = [];
  const { symbols } = getNodeSymbols(uri);

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

  addThemeCompletion(completions, uri);

  return completions;
}

async function addThemeCompletion(completions: CompletionItem[], uri: string) {
  const theme = await getThemeSrc(uri);

  if (!theme) return;

  completions.push({
    label: "theme",
    kind: CompletionItemKind.Snippet,
    insertText: `@use '${theme.src}' as *;`,
  });
}
