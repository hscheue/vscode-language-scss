import { getNodeSymbols } from "../_shared/getNodeSymbols";

export function getThemeValues(uri: string | undefined) {
  const record: Record<string, string> = {};

  if (!uri) return { record: {}, files: [] };
  const { symbols, files } = getNodeSymbols(uri);

  symbols.forEach((symbol) => {
    if (symbol.node.type === "decl" && symbol.node.variable) {
      record[symbol.node.value] = symbol.node.prop;
    }
  });

  return { record, files };
}
