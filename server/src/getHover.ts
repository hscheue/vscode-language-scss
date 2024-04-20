import { getDocument } from "./getDocument";
import { parse } from "postcss";
import { Hover, HoverParams, MarkupKind } from "vscode-languageserver";
import { getNameAtPosition } from "./getNameAtPosition";
import { getNodeSymbols } from "./getNodeSymbols";

export function getHover(hover: HoverParams): Hover | null {
  const doc = getDocument(hover.textDocument.uri);
  if (!doc) return null;
  const root = parse(doc.getText());
  const value = getNameAtPosition(root, hover.position);
  const symbols = getNodeSymbols(hover.textDocument.uri);

  const symbol = symbols.find((c) => c.label === value);

  if (!symbol) return null;

  return {
    contents: {
      value: ["```scss", `${symbol.label}`, "```"].filter(Boolean).join("\n"),
      kind: MarkupKind.Markdown,
    },
  };
}
