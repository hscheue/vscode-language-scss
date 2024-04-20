import { Location, Range } from "vscode-css-languageservice";
import { getDocument } from "./documents";
import { parse } from "postcss";
import { DefinitionParams } from "vscode-languageserver";
import { getSymbols } from "./getCompletions";
import { getNameAtPosition } from "./utils";

export function getDefinition(definition: DefinitionParams): Location | null {
  const doc = getDocument(definition.textDocument.uri);
  if (!doc) return null;

  const root = parse(doc.getText());
  const value = getNameAtPosition(root, definition.position);
  const symbols = getSymbols(definition.textDocument.uri);

  const symbol = symbols.find((c) => c.label === value);
  if (!symbol) return null;

  const startLine = symbol.node.source?.start?.line;
  const startColumn = symbol.node.source?.start?.column;
  const endLine = symbol.node.source?.end?.line;
  const endColumn = symbol.node.source?.end?.column;
  if (
    startLine === undefined ||
    startColumn === undefined ||
    endLine === undefined ||
    endColumn === undefined
  ) {
    return null;
  }

  // check off by one from ast to textdocument starting index
  return Location.create(
    symbol.uri,
    Range.create(startLine - 1, startColumn, endLine - 1, endColumn)
  );
}
