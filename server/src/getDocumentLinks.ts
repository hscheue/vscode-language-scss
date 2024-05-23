import { DocumentLink, DocumentLinkParams } from "vscode-languageserver";
import { getLinks } from "./_shared/resolveReference";
import { getDocument } from "./_shared/getDocument";
import { parse } from "postcss-scss";
import { convertRange } from "./_shared/getRangeFromNode";

export default function getDocumentLinks(
  params: DocumentLinkParams
): DocumentLink[] {
  const d = getDocument(params.textDocument.uri);
  if (!d) return [];
  const root = parse(d.getText());

  const links = getLinks(root, d.uri, new Set());
  const documentLinks: DocumentLink[] = [];

  links.forEach((link) => {
    const next = {
      range: convertRange(link.node.rangeBy({ word: link.src })),
      target: link.uri,
    } satisfies DocumentLink;

    documentLinks.push(next);
  });

  return documentLinks;
}
