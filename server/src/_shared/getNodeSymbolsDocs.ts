import { parse } from "postcss-scss";
import type { ChildNode } from "postcss";
import { getDocument } from "./getDocument";
import { getLinks } from "./resolveReference";
import { ParseResult, parse as parseDocs } from "scss-sassdoc-parser";

export type NodeSymbolDoc = {
  node: ChildNode;
  doc: ParseResult | undefined;
  label: string;
  uri: string;
};

const store = new Map<string, NodeSymbolDoc[]>();

export async function getNodeSymbolsDocs(
  uri: string
): Promise<NodeSymbolDoc[]> {
  const symbols = await _getNodeSymbolsDocsRec(uri, new Set<string>());
  store.set(uri, symbols);
  return symbols;
}

async function _getNodeSymbolsDocsRec(
  uri: string,
  set: Set<string>
): Promise<NodeSymbolDoc[]> {
  const textDocument = getDocument(uri);
  if (!textDocument) return [];
  const text = textDocument.getText();
  const root = parse(text);
  const docs = await parseDocs(text);

  const symbols: NodeSymbolDoc[] = [];

  const links = getLinks(root, uri, set);

  const linkedSymbols = await Promise.all(
    links.flatMap(async (link) => {
      const values = await _getNodeSymbolsDocsRec(link, set);
      return values;
    })
  );

  root.walk((node) => {
    if (node.type === "decl" && node.variable) {
      const doc = docs.find((d) => `$${d.name}` === node.prop);
      symbols.push({
        node,
        doc,
        label: node.prop,
        uri,
      });
    }

    if (node.type === "atrule" && node.name === "mixin") {
      const doc = docs.find((d) => d.name === node.params);
      symbols.push({
        node,
        doc,
        label: node.params,
        uri,
      });
    }
  });

  return [...linkedSymbols.flat(), ...symbols];
}
