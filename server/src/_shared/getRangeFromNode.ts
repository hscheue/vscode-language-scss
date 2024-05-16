import { ChildNode } from "postcss";
import { Range } from "vscode-languageserver";

type NodeRange = ReturnType<ChildNode["rangeBy"]>;

/**
 * @deprecated use node.rangeBy({word}) and convertRange
 * Gets vscode Range object using source field in postcss ChildNode (offsets to 0 based index)
 */
export function getRangeFromNode(node: ChildNode): Range | null {
  const startLine = node.source?.start?.line;
  const startColumn = node.source?.start?.column;
  const endLine = node.source?.end?.line;
  const endColumn = node.source?.end?.column;
  if (
    startLine === undefined ||
    startColumn === undefined ||
    endLine === undefined ||
    endColumn === undefined
  ) {
    return null;
  }

  return Range.create(
    startLine - 1,
    startColumn - 1,
    endLine - 1,
    endColumn - 1
  );
}

export function convertRange(range: NodeRange): Range {
  return {
    start: {
      line: range.start.line - 1,
      character: range.start.column - 1,
    },
    end: {
      line: range.end.line - 1,
      character: range.end.column - 1,
    },
  };
}
