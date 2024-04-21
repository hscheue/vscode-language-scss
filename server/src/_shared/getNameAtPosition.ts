import type { Root } from "postcss";
import { Position } from "vscode-languageserver-textdocument";

export function getNameAtPosition(root: Root, position: Position): string {
  let value: string = "";

  root.walk((node) => {
    const startLine = node.source?.start?.line;
    const endLine = node.source?.end?.line;
    if (
      startLine &&
      endLine &&
      startLine <= position.line + 1 &&
      endLine >= position.line + 1
    ) {
      if (node.type === "decl") {
        value = node.value;
      }
      if (node.type === "atrule" && node.name === "include") {
        value = node.params;
      }
    }
  });

  return value;
}
