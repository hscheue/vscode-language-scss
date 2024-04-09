import {
  createConnection,
  Location,
  ProposedFeatures,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import {
  getConcatenatedSymbols,
  getDocumentAST,
  listen,
  scan,
} from "./documents";
import { getCompletionsFromSymbols } from "./completions";
import { resolveSettings } from "./resolveReference";
import { getHoverFromSymbols } from "./hover";
import { registerLogger } from "./log";
import {
  getNodeAtOffset,
  NodeType,
  Variable,
} from "./css-languageserver-cloned/cssNodes";

const connection = createConnection(ProposedFeatures.all);

export type Connection = typeof connection;

connection.onInitialize((params) => {
  resolveSettings.baseURL = params.workspaceFolders?.[0].uri ?? "";

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
      definitionProvider: true,
    },
  };
});

connection.onHover(async (hover) => {
  await scan(hover.textDocument.uri);
  const symbols = getConcatenatedSymbols(hover.textDocument.uri);
  return getHoverFromSymbols(symbols, hover);
});

connection.onCompletion(async (completion) => {
  await scan(completion.textDocument.uri);
  const symbols = getConcatenatedSymbols(completion.textDocument.uri);
  return getCompletionsFromSymbols(symbols);
});

connection.onDefinition(async (definition) => {
  await scan(definition.textDocument.uri);

  const data = getDocumentAST(definition.textDocument.uri);
  if (!data) return null;

  const offset = data.textDocument.offsetAt(definition.position);
  const node = getNodeAtOffset(data.ast, offset);
  if (!node) return null;

  const symbols = getConcatenatedSymbols(definition.textDocument.uri);

  if (node.type === NodeType.VariableName) {
    const variableNode = node as Variable;
    const name = variableNode.getName();
    const symbol = symbols.find((s) => s.name === name);

    if (!symbol?.uri) return null;

    return Location.create(symbol.uri, symbol.selectionRange);
  }

  return null;
});

listen(connection);
registerLogger(connection);
connection.listen();
