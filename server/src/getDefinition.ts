import { getDocument } from "./_shared/getDocument";
import { DefinitionParams, Location } from "vscode-languageserver";
import { getNameAtPosition } from "./_shared/getNameAtPosition";
import { getNodeSymbols } from "./_shared/getNodeSymbols";
import { getRangeFromNode } from "./_shared/getRangeFromNode";
import { parse } from "../lib/scss-syntax";

export function getDefinition(definition: DefinitionParams): Location | null {
  const doc = getDocument(definition.textDocument.uri);
  if (!doc) return null;

  const root = parse(doc.getText());
  const value = getNameAtPosition(root, definition.position);
  const { symbols } = getNodeSymbols(definition.textDocument.uri);

  const symbol = symbols.find((c) => c.label === value);
  if (!symbol) return null;

  const range = getRangeFromNode(symbol.node);
  if (!range) return null;

  return Location.create(symbol.uri, range);
}
