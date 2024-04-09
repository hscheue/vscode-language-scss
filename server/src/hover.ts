import { Hover, HoverParams, MarkupKind } from "vscode-languageserver";
import { EnhancedSymbol } from "./enhanceSymbol";
import {
  getNodeAtOffset,
  MixinReference,
  NodeType,
  Variable,
} from "./css-languageserver-cloned/cssNodes";
import { getDocumentAST } from "./documents";

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
      contents: {
        value: [
          "```scss",
          `${name} ${symbol?.value ?? ""}`,
          "```",
          `${symbol?.doc?.description ?? ""}`,
        ]
          .filter(Boolean)
          .join("\n"),
        kind: MarkupKind.Markdown,
      },
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
      contents: {
        value: [
          "```scss",
          `@mixin ${name}`,
          "```",
          `${symbol?.doc?.description ?? ""}`,
        ]
          .filter(Boolean)
          .join("\n"),
        kind: MarkupKind.Markdown,
      },
    };
  }

  return null;
}
