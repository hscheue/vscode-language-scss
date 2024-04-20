import { Hover, MarkupKind } from "vscode-css-languageservice";
import { getDocument } from "./documents";
import { parse } from "postcss";
import { HoverParams } from "vscode-languageserver";
import { getSymbols } from "./getCompletions";
import { getNameAtPosition } from "./utils";

export function getHover(hover: HoverParams): Hover | null {
  const doc = getDocument(hover.textDocument.uri);
  if (!doc) return null;
  const root = parse(doc.getText());
  const value = getNameAtPosition(root, hover.position);
  const symbols = getSymbols(hover.textDocument.uri);

  const symbol = symbols.find((c) => c.label === value);

  if (!symbol) return null;

  return {
    contents: {
      value: ["```scss", `${symbol.label}`, "```"].filter(Boolean).join("\n"),
      kind: MarkupKind.Markdown,
    },
  };
}
