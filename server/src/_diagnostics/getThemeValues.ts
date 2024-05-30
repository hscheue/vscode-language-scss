import { getNodeSymbols } from "../_shared/getNodeSymbols";

export function getThemeValues(uri: string | undefined) {
  const record: Record<string, string> = {};
  const mixins: { label: string; lines: Record<string, true> }[] = [];

  if (!uri) return { record: {}, mixins: [], files: [] };
  const { symbols, files } = getNodeSymbols(uri);

  symbols.forEach((symbol) => {
    if (symbol.node.type === "decl" && symbol.node.variable) {
      record[symbol.node.value] = symbol.node.prop;
    }
    if (
      symbol.node.type === "atrule" &&
      symbol.node.name === "mixin" &&
      /^[a-z-]+$/i.test(symbol.node.params) &&
      symbol.node.nodes?.every((s) => s.type === "decl")
    ) {
      const lines: Record<string, true> = {};

      symbol.node.nodes.forEach((n) => {
        lines[n.toString()] = true;
      });

      mixins.push({
        label: symbol.node.params,
        lines,
      });
    }
  });

  return { record, mixins, files };
}
