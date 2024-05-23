import { parse } from "postcss-scss";
import type { ChildNode } from "postcss";
import { getDocument } from "./getDocument";
import { getLinks } from "./resolveReference";

export type NodeSymbol = {
  node: ChildNode;
  label: string;
  uri: string;
};

const store = new Map<string, NodeSymbol[]>();
const filesStore = new Map<string, string[]>();

export function getNodeSymbols(uri: string): {
  symbols: NodeSymbol[];
  files: string[];
} {
  try {
    const set = new Set<string>();
    const symbols = _getNodeSymbolsRec(uri, set);
    store.set(uri, symbols);
    const files = Array.from(set);
    filesStore.set(uri, files);
    return { symbols, files };
  } catch (err) {
    return { symbols: store.get(uri) ?? [], files: filesStore.get(uri) ?? [] };
  }
}

function _getNodeSymbolsRec(uri: string, set: Set<string>): NodeSymbol[] {
  const textDocument = getDocument(uri);
  if (!textDocument) return [];
  const text = textDocument.getText();
  const root = parse(text);

  const symbols: NodeSymbol[] = [];

  const links = getLinks(root, uri, set);

  const linkedSymbols = links.flatMap((link) =>
    _getNodeSymbolsRec(link.uri, set)
  );

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
