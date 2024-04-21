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

export async function getNodeSymbolsDocs(
  uri: string,
  set?: Set<string>
): Promise<NodeSymbolDoc[]> {
  const textDocument = getDocument(uri);
  if (!textDocument) return [];
  const text = textDocument.getText();
  const root = parse(text);
  const docs = await parseDocs(text);

  const symbols: NodeSymbolDoc[] = [];

  const initSet = set ? set : new Set<string>();
  const links = getLinks(root, uri, initSet);

  const linkedSymbols = await Promise.all(
    links.flatMap(async (link) => {
      const values = await getNodeSymbolsDocs(link);
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
