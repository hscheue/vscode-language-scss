import { Hover, HoverParams, MarkupKind } from "vscode-languageserver";
import { EnhancedSymbol } from "./enhanceSymbol";
import {
  getNodeAtOffset,
  MixinDeclaration,
  MixinReference,
  NodeType,
  Variable,
} from "./css-languageserver-cloned/cssNodes";
import { getDocumentAST } from "./documents";
import { validateHTMLColorHex } from "validate-color";

export function getHoverFromSymbols(
  symbols: EnhancedSymbol[],
  hover: HoverParams
): Hover | null {
  const data = getDocumentAST(hover.textDocument.uri);
  if (!data) return null;

  const offset = data.textDocument.offsetAt(hover.position);
  const node = getNodeAtOffset(data.ast, offset);
  if (!node) return null;

  if (node.type === NodeType.VariableName) {
    const variableNode = node as Variable;
    const name = variableNode.getName();
    const symbol = symbols.find((s) => s.name === name);

    return {
      contents: `${symbol?.value ?? ""} ${symbol?.doc?.description ?? ""}`,
    };
  }

  if (
    node.type === NodeType.Identifier &&
    node.parent?.type === NodeType.MixinReference
  ) {
    const mixinReference = node.parent as MixinReference;
    const name = mixinReference.getName();
    const symbol = symbols.find((s) => s.name === name);
    return {
      contents: symbol?.doc?.description ?? "",
    };
  }

  return null;
}
