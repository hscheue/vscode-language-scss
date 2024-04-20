import { parse } from "postcss-scss";
import type { ChildNode } from "postcss";
import { getDocument } from "./getDocument";
import { getLinks } from "./resolveReference";

export type NodeSymbol = {
  node: ChildNode;
  label: string;
  uri: string;
};

export function getNodeSymbols(uri: string, set?: Set<string>): NodeSymbol[] {
  const textDocument = getDocument(uri);
  if (!textDocument) return [];
  const text = textDocument.getText();
  const root = parse(text);

  const symbols: NodeSymbol[] = [];

  const initSet = set ? set : new Set<string>();
  const links = getLinks(root, uri, initSet);

  const linkedSymbols = links.flatMap((link) => getNodeSymbols(link));

  root.walk((node) => {
    if (node.type === "decl" && node.variable) {
      symbols.push({
        node,
        label: node.prop,
        uri,
      });
    }

    if (node.type === "atrule" && node.name === "mixin") {
      symbols.push({
        node,
        label: node.params,
        uri,
      });
    }
  });

  return [...linkedSymbols, ...symbols];
}
