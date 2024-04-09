import { Location } from "vscode-css-languageservice";
import {
  getNodeAtOffset,
  MixinReference,
  NodeType,
  Variable,
} from "./css-languageserver-cloned/cssNodes";
import { getDocumentAST } from "./documents";
import { EnhancedSymbol } from "./enhanceSymbol";
import { DefinitionParams } from "vscode-languageserver";

export async function getDefinitionFromSymbols(
  symbols: EnhancedSymbol[],
  definition: DefinitionParams
) {
  const data = getDocumentAST(definition.textDocument.uri);
  if (!data) return null;

  const offset = data.textDocument.offsetAt(definition.position);
  const node = getNodeAtOffset(data.ast, offset);
  if (!node) return null;

  if (node.type === NodeType.VariableName) {
    const variableNode = node as Variable;
    const name = variableNode.getName();
    const symbol = symbols.find((s) => s.name === name);

    if (!symbol?.uri) return null;

    return Location.create(symbol.uri, symbol.selectionRange);
  }

  if (
    node.type === NodeType.Identifier &&
    node.parent?.type === NodeType.MixinReference
  ) {
    const mixinReference = node.parent as MixinReference;
    const name = mixinReference.getName();
    const symbol = symbols.find((s) => s.name === name);

    if (!symbol?.uri) return null;

    return Location.create(symbol.uri, symbol.selectionRange);
  }

  return null;
}
