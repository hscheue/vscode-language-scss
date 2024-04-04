import { DocumentSymbol } from "vscode-css-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  Node,
  NodeType,
  getNodeAtOffset,
} from "./css-languageserver-cloned/cssNodes";
import { ParseResult } from "scss-sassdoc-parser";

export type EnhancedSymbol = DocumentSymbol & {
  value?: string;
  filename?: string;
  doc?: ParseResult;
};

export function enhanceSymbol(
  textDocument: TextDocument,
  symbol: DocumentSymbol,
  ast: Node,
  docs: ParseResult[]
): EnhancedSymbol {
  const offset = textDocument.offsetAt(symbol.range.start);
  const node = getNodeAtOffset(ast, offset)!;
  const parent = getNodeAtOffset(ast, offset)!.getParent()!;
  const filename = textDocument.uri.split("/").at(-1);

  if (parent.type === NodeType.VariableDeclaration) {
    const value = parent.getChild(1)?.getText();
    const doc = docs.find((d) => `$${d.name}` === symbol.name);

    return { ...symbol, filename, value, doc };
  }

  if (node.type === NodeType.MixinDeclaration) {
    const doc = docs.find((d) => d.name === symbol.name);

    const value =
      node.getChildren().length === 3 ? node.getChild(1)?.getText() : "";

    return {
      ...symbol,
      filename,
      value,
      doc,
    };
  }

  return symbol;
}
