import { Hover, MarkupKind } from "vscode-css-languageservice";
import { getDocument } from "./documents";
import { Root, parse } from "postcss";
import { HoverParams } from "vscode-languageserver";
import { getCompletions } from "./getCompletions";

export function getHover(hover: HoverParams): Hover | null {
  const doc = getDocument(hover.textDocument.uri);
  if (!doc) return null;
  const root = parse(doc.getText());
  const value = getHoveredSymbolName(root, hover);
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

function getHoveredSymbolName(root: Root, hover: HoverParams): string {
  let value: string = "";

  root.walk((node) => {
    const startLine = node.source?.start?.line;
    const endLine = node.source?.end?.line;
    if (
      startLine &&
      endLine &&
      startLine <= hover.position.line + 1 &&
      endLine >= hover.position.line + 1
    ) {
      if (node.type === "decl") {
        value = node.value;
      }
    }
  });

  return value;
}

/*
return 
*/
