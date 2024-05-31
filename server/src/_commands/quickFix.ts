import { Range } from "vscode-languageserver/node";

export const theme_fix_variable = "theme.quickFix";

export type VariableDiagnostics = {
  range: Range;
  value: string;
};

export const theme_fix_mixin = "theme.quickFix.mixin";

export type MixinDiagnostics = {
  range: Range;
  label: string;
  lines: string[];
  lineRanges: Range[];
};

export type CommandShared<T> = T & { uri: string };
