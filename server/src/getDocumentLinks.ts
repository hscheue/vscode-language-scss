import { DocumentLink, DocumentLinkParams } from "vscode-languageserver";
import { getLinks, getLinks2 } from "./_shared/resolveReference";
import { getDocument } from "./_shared/getDocument";
import { parse } from "postcss-scss";
import { convertRange } from "./_shared/getRangeFromNode";

export default function getDocumentLinks(
  params: DocumentLinkParams
): DocumentLink[] {
  const d = getDocument(params.textDocument.uri);
  if (!d) return [];

  const text = d.getText();
  const root = parse(text);

  const links = getLinks2(root, d.uri, new Set());

  return [];
}
