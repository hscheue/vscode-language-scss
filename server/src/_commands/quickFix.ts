import { Range } from "vscode-languageserver/node";

export const keyVariableThemeQuickFix = "theme.quickFix";

export type FixMeCommand = {
  type: typeof keyVariableThemeQuickFix;
  uri: string;
  range: Range;
  value: string;
};

export const keyMixinThemeQuickFix = "theme.quickFix.mixin";

export type FixMeCommandMixin = {
  type: typeof keyMixinThemeQuickFix;
  uri: string;
  range: Range;
  label: string;
  lines: string;
};
