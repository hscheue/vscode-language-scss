import { getDocument } from "./_shared/getDocument";
import { parse } from "postcss-scss";
import { Hover, HoverParams, MarkupKind } from "vscode-languageserver";
import { getNameAtPosition } from "./_shared/getNameAtPosition";
import { getNodeSymbols } from "./_shared/getNodeSymbols";

export async function getHover(hover: HoverParams): Promise<Hover | null> {
  try {
    const doc = getDocument(hover.textDocument.uri);
    if (!doc) return null;
    const root = parse(doc.getText());
    const value = getNameAtPosition(root, hover.position);
    const ast = await getNodeSymbols(hover.textDocument.uri);

    const symbol = ast.symbols.find((c) => c.label === value);
    if (!symbol) return null;

    if (symbol.node.type === "decl") {
      return {
        contents: {
          value: ["```scss", `${symbol.label}: ${symbol.node.value}`, "```"]
            .filter(Boolean)
            .join("\n"),
          kind: MarkupKind.Markdown,
        },
      };
    }

    return {
      contents: {
        value: ["```scss", `${symbol.label}`, "```"].filter(Boolean).join("\n"),
        kind: MarkupKind.Markdown,
      },
    };
  } catch {
    return null;
  }
}
