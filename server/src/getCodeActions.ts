import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Command,
  Range,
} from "vscode-languageserver";
import { getDocument } from "./_shared/getDocument";
import {
  CommandShared,
  MixinDiagnostics,
  theme_fix_mixin,
  VariableDiagnostic,
} from "./_commands/quickFix";

export function getCodeActions(params: CodeActionParams): CodeAction[] {
  const doc = getDocument(params.textDocument.uri);
  if (!doc) return [];

  const a = getFixMeCommand(params);
  if (a) {
    return [
      createCodeAction("Replace with theme value", VariableDiagnostic.command, {
        uri: doc.uri,
        ...a,
      }),
    ];
  }

  const b = getFixMeCommandMixin(params);
  if (b) {
    return [
      createCodeAction("Replace lines with mixin", theme_fix_mixin, {
        uri: doc.uri,
        ...b,
      }),
    ];
  }

  return [];
}

function createCodeAction(
  title: string,
  key: string,
  data: CommandShared<MixinDiagnostics | VariableDiagnostic>
) {
  return CodeAction.create(
    title,
    Command.create(title, key, {
      ...data,
    } satisfies CommandShared<MixinDiagnostics | VariableDiagnostic>),
    CodeActionKind.QuickFix
  );
}

function getFixMeCommand(params: CodeActionParams) {
  if (!("diagnostics" in params.context)) return null;
  if (!params.context.diagnostics.length) return null;
  const range = params.context.diagnostics[0]?.range;
  const type = params.context.diagnostics[0]?.data?.type;
  const value = params.context.diagnostics[0]?.data?.value;
  if (!value || typeof value !== "string") return null;
  if (!range || !type) return null;
  if (type !== VariableDiagnostic.command) return null;
  return VariableDiagnostic.create(range, value);
}

function getFixMeCommandMixin(
  params: CodeActionParams
): Omit<MixinDiagnostics, "uri"> | null {
  if (!("diagnostics" in params.context)) return null;
  if (!params.context.diagnostics.length) return null;

  const range = params.context.diagnostics[0]?.range;
  const type = params.context.diagnostics[0]?.data?.type;
  const label = params.context.diagnostics[0]?.data?.label;
  const lines = params.context.diagnostics[0]?.data?.lines;
  const lineRanges = params.context.diagnostics[0]?.data?.lineRanges as
    | undefined
    | Range[];

  if (!label || typeof label !== "string") return null;
  if (
    !lines ||
    !Array.isArray(lines) ||
    !lines.length ||
    lines.some((l) => typeof l !== "string")
  )
    return null;
  if (!lineRanges) return null;
  if (!range || !type) return null;
  if (type !== theme_fix_mixin) return null;

  return {
    range,
    label,
    lines,
    lineRanges,
  };
}
