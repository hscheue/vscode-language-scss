import { getDocument } from "./_shared/getDocument";
import { parse } from "postcss-scss";
import { Hover, HoverParams, MarkupKind } from "vscode-languageserver";
import { getNameAtPosition } from "./_shared/getNameAtPosition";
import { getNodeSymbolsDocs } from "./_shared/getNodeSymbolsDocs";

export async function getHover(hover: HoverParams): Promise<Hover | null> {
  const doc = getDocument(hover.textDocument.uri);
  if (!doc) return null;

  const root = parse(doc.getText());
  const value = getNameAtPosition(root, hover.position);
  const symbols = await getNodeSymbolsDocs(hover.textDocument.uri);

  const symbol = symbols.find((c) => c.label === value);
  if (!symbol) return null;

  return {
    contents: {
      value: [
        "```scss",
        `${symbol.label}`,
        "```",
        `${symbol.doc?.description ?? ""}`,
      ]
        .filter(Boolean)
        .join("\n"),
      kind: MarkupKind.Markdown,
    },
  };
}
