import { getDocument } from "./getDocument";
import { parse } from "postcss-scss";
import { DefinitionParams, Location, Range } from "vscode-languageserver";
import { getNameAtPosition } from "./getNameAtPosition";
import { getNodeSymbols } from "./getNodeSymbols";

export function getDefinition(definition: DefinitionParams): Location | null {
  const doc = getDocument(definition.textDocument.uri);
  if (!doc) return null;

  const root = parse(doc.getText());
  const value = getNameAtPosition(root, definition.position);
  const symbols = getNodeSymbols(definition.textDocument.uri);

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

  return Location.create(
    symbol.uri,
    Range.create(startLine - 1, startColumn, endLine - 1, endColumn)
  );
}
