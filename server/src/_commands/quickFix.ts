import { Range } from "vscode-languageserver/node";

export class VariableDiagnostic {
  static command = "theme.quickFix";
  readonly type = "theme.quickFix";
  range: Range;
  value: string;
  uri?: string;

  constructor(range: Range, value: string) {
    this.range = range;
    this.value = value;
  }

  static create(range: Range, value: string) {
    return new VariableDiagnostic(range, value);
  }

  static is(value: unknown) {
    if (!value) return false;
    if (typeof value !== "object") return false;
    if (!("type" in value)) return false;
    if (value.type === this.command) return true;
  }
}

export const theme_fix_mixin = "theme.quickFix.mixin";

export type MixinDiagnostics = {
  range: Range;
  label: string;
  lines: string[];
  lineRanges: Range[];
};

export type CommandShared<T> = T & { uri: string };
