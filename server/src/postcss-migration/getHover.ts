import { Hover, MarkupKind } from "vscode-css-languageservice";
import { getDocument } from "./documents";
import { parse } from "postcss";
import { HoverParams } from "vscode-languageserver";
import { getCompletions } from "./getCompletions";
import { getNameAtPosition } from "./utils";

export function getHover(hover: HoverParams): Hover | null {
  const doc = getDocument(hover.textDocument.uri);
  if (!doc) return null;
  const root = parse(doc.getText());
  const value = getNameAtPosition(root, hover.position);
  const completions = getCompletions(hover.textDocument.uri);

  const completion = completions.find((c) => c.label === value);

  if (!completion) return null;

  return {
    contents: {
      value: ["```scss", `${completion.label}`, "```"]
        .filter(Boolean)
        .join("\n"),
      kind: MarkupKind.Markdown,
    },
  };
}
