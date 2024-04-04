import { HoverParams } from "vscode-languageserver";
import { EnhancedSymbol } from "./enhanceSymbol";
import {
  getNodeAtOffset,
  NodeType,
  Variable,
} from "./css-languageserver-cloned/cssNodes";
import { getDocumentAST } from "./documents";

export function getHoverFromSymbols(
  symbols: EnhancedSymbol[],
  hover: HoverParams
) {
  const data = getDocumentAST(hover.textDocument.uri);
  if (!data) return null;

  const offset = data.textDocument.offsetAt(hover.position);
  const node = getNodeAtOffset(data.ast, offset);
  if (!node) return null;

  if (node.type === NodeType.VariableName) {
    const variableNode = node as Variable;
    const symbol = symbols.find(
      (symbol) => symbol.name === variableNode.getName()
    );
    return {
      contents: `${symbol?.name} ${symbol?.doc}`,
    };
  }

  return null;
}
