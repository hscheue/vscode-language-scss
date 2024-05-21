import { ChildNode } from "postcss";
import { Range } from "vscode-languageserver";

type NodeRange = ReturnType<ChildNode["rangeBy"]>;

export function convertRange(rangeBy: NodeRange): Range {
  return {
    start: {
      line: rangeBy.start.line - 1,
      character: rangeBy.start.column - 1,
    },
    end: {
      line: rangeBy.end.line - 1,
      character: rangeBy.end.column - 1,
    },
  };
}
