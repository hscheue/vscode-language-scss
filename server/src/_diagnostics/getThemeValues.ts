import { getNodeSymbols } from "../_shared/getNodeSymbols";

export function getThemeValues(
  uri: string | undefined
): Record<string, string> {
  const record: Record<string, string> = {};
  if (!uri) return record;

  getNodeSymbols(uri).forEach((symbol) => {
    if (symbol.node.type === "decl" && symbol.node.variable) {
      record[symbol.node.value] = symbol.node.prop;
    }
  });

  return record;
}
