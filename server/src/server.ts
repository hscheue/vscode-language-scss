import {
  createConnection,
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
import {
  getNodeAtOffset,
  NodeType,
  Variable,
} from "./css-languageserver-cloned/cssNodes";
import { resolveSettings } from "./resolveReference";

const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((params) => {
  resolveSettings.baseURL = params.workspaceFolders?.[0].uri ?? "";
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: { resolveProvider: false },
      hoverProvider: true,
    },
  };
});

connection.onHover(async (hover) => {
  await scan(hover.textDocument.uri);
  const data = getDocumentAST(hover.textDocument.uri);
  if (!data) return null;

  const offset = data.textDocument.offsetAt(hover.position);
  const symbols = getConcatenatedSymbols(hover.textDocument.uri);
  const node = getNodeAtOffset(data.ast, offset);
  if (!node) return null;

  if (node.type === NodeType.VariableName) {
    const variableNode = node as Variable;
    const symbol = symbols.find(
      (symbol) => symbol.name === variableNode.getName()
    );
    return {
      contents: `${symbol?.name}`,
    };
  }

  return null;
});

connection.onCompletion(async (completion) => {
  await scan(completion.textDocument.uri);
  const symbols = getConcatenatedSymbols(completion.textDocument.uri);
  return getCompletionsFromSymbols(symbols);
});

listen(connection);
connection.listen();
