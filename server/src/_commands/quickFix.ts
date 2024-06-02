import { Range } from "vscode-languageserver/node";

export class VariableDiagnostic {
  static command = "theme.quickFix";
  readonly type = VariableDiagnostic.command;
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

  static is(value: unknown): value is VariableDiagnostic {
    if (!value) return false;
    if (typeof value !== "object") return false;
    if (!("type" in value)) return false;
    if (value.type === this.command) return true;
    return false;
  }
}

export class MixinDiagnostic {
  static command = "theme.quickFix.mixin";
  readonly type = MixinDiagnostic.command;
  range: Range;
  label: string;
  lines: string[];
  lineRanges: Range[];
  uri?: string;

  constructor(
    range: Range,
    label: string,
    lines: string[],
    lineRanges: Range[]
  ) {
    this.range = range;
    this.label = label;
    this.lines = lines;
    this.lineRanges = lineRanges;
  }

  static create(
    range: Range,
    label: string,
    lines: string[],
    lineRanges: Range[]
  ) {
    return new MixinDiagnostic(range, label, lines, lineRanges);
  }

  static is(value: unknown): value is MixinDiagnostic {
    if (!value) return false;
    if (typeof value !== "object") return false;
    if (!("type" in value)) return false;
    if (value.type === this.command) return true;
    return false;
  }
}

export type CommandShared<T> = T & { uri: string };
