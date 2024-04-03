import { readFileSync } from "fs";
import { URI } from "vscode-uri";
import { TextDocuments } from "vscode-languageserver";
import {
  DocumentLink,
  DocumentSymbol,
  TextDocument,
  getSCSSLanguageService,
} from "vscode-css-languageservice";
import { Node } from "./css-languageserver-cloned/cssNodes";
import { resolveReference } from "./resolveReference";

type DocumentAST = {
  ast: Node;
  symbols: DocumentSymbol[];
  links: DocumentLink[];
  textDocument: TextDocument;
};

type State = DocumentAST & {
  version: number;
};

const storage = new Map<string, State>();

const languageService = getSCSSLanguageService();
languageService.configure({ validate: false });

const textDocuments: TextDocuments<TextDocument> = new TextDocuments(
  TextDocument
);

function _store({ ast, links, symbols, textDocument }: DocumentAST) {
  storage.set(textDocument.uri, {
    ast,
    links,
    symbols,
    textDocument: textDocument,
    version: textDocument.version,
  });
}

function _skip(textDocument: TextDocument): boolean {
  const state = storage.get(textDocument.uri);
  if (typeof state?.version !== "number") return false;
  if (state.version === textDocument.version) return false;
  return true;
}

export function _getTextDocument(uri: string) {
  const d = textDocuments.get(uri);
  if (d) return d;
  const path = URI.parse(uri).fsPath;
  const content = readFileSync(path).toString();
  const textDocument = TextDocument.create(uri, "scss", 1, content);
  return textDocument;
}

/** When a file changes, check all dependent scss state */
export async function scan(uri: string): Promise<void> {
  const textDocument = _getTextDocument(uri);
  if (_skip(textDocument)) return;

  const ast = languageService.parseStylesheet(textDocument) as Node;
  const symbols = languageService.findDocumentSymbols2(textDocument, ast);
  const links = await languageService.findDocumentLinks2(textDocument, ast, {
    resolveReference,
  });

  console.log(links);

  _store({ ast, symbols, links, textDocument });

  for (const link of links) {
    if (link.target) {
      scan(link.target);
    }
  }
}

export function getDocumentAST(uri: string) {
  return storage.get(uri);
}

export function getConcatenatedSymbols(uri: string) {
  const symbols: DocumentSymbol[] = [];
  const linkURIs = [uri];
  const set = new Set<string>();

  for (const linkURI of linkURIs) {
    if (!set.has(linkURI)) {
      symbols.push(..._getSymbols(linkURI));
      linkURIs.push(..._getLinksURI(linkURI));
      set.add(linkURI);
    }
  }

  return symbols;
}

function _getLinksURI(uri: string): string[] {
  const data = storage.get(uri);
  if (!data) return [];
  return data.links
    .map((l) => l.target)
    .filter((l) => typeof l === "string") as string[];
}

function _getSymbols(uri: string): DocumentSymbol[] {
  const data = storage.get(uri);
  if (!data) return [];
  return data.symbols;
}

/** Attach to connection in server.ts */
export function listen(connection: any) {
  textDocuments.listen(connection);
}
