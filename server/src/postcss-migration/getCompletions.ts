import { parse } from "postcss";
import { getDocument } from "./documents";
import {
  CompletionItem,
  CompletionItemKind as CIK,
} from "vscode-css-languageservice";
import validateColor from "validate-color";
import { basename } from "path";
import { getLinks } from "../resolveReference";

export function getCompletions(
  uri: string,
  set?: Set<string>
): CompletionItem[] {
  const textDocument = getDocument(uri);
  if (!textDocument) return [];
  const root = parse(textDocument.getText());

  const completions: CompletionItem[] = [];

  const initSet = set ? set : new Set<string>();
  const links = getLinks(root, uri, initSet);

  const linkedCompletions = links.flatMap((link) => getCompletions(link));

  root.walk((node) => {
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

  return [...linkedCompletions, ...completions];
}
