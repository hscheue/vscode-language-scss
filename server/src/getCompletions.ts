import validateColor from "validate-color";
import { basename } from "path";
import { getNodeSymbols } from "./_shared/getNodeSymbols";
import {
  CompletionItem,
  CompletionItemKind as CIK,
  CompletionParams,
  CompletionItemKind,
} from "vscode-languageserver";
import { asyncThemeDiagnosticsFile } from "./_shared/settings";
import { connection } from "./_shared/connection";
import { resolveReference } from "./_shared/resolveReference";
import { getThemeValues } from "./_diagnostics/getThemeValues";

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
  const src = await getThemeSrc(uri);

  if (!src) return;

  completions.push({
    label: "theme",
    kind: CompletionItemKind.Snippet,
    insertText: `@use '${src}' as *;`,
  });
}

async function getThemeSrc(uri: string) {
  const themeSetting = await asyncThemeDiagnosticsFile(connection);
  if (!themeSetting) return null;

  if (Array.isArray(themeSetting)) {
    for (const theme of themeSetting) {
      const themeUri = resolveReference(theme, uri);
      if (!themeUri) continue;
      return theme;
    }

    return null;
  }

  const themeUri = resolveReference(themeSetting, uri);
  if (!themeUri) return null;
  return themeSetting;
}
