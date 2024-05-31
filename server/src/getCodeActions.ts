import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Command,
  Range,
} from "vscode-languageserver";
import { getDocument } from "./_shared/getDocument";
import { FixMeCommand, keyVariableThemeQuickFix } from "./_commands/quickFix";

export function getCodeActions(codeAction: CodeActionParams): CodeAction[] {
  const doc = getDocument(codeAction.textDocument.uri);
  if (!doc) return [];

  const variableAction = getVariableCodeAction(codeAction, doc.uri);
  if (variableAction) return [variableAction];

  return [];
}

function getVariableCodeAction(
  codeAction: CodeActionParams,
  uri: string
): CodeAction | null {
  let range: Range | undefined;
  let value: string | undefined;

  if (
    "diagnostics" in codeAction.context &&
    codeAction.context.diagnostics.length
  ) {
    range = codeAction.context.diagnostics[0]?.range;
    value = codeAction.context.diagnostics[0]?.data?.value;
  }

  if (!range || !value || typeof value !== "string") return null;

  const title = "Replace with theme value";

  return CodeAction.create(
    title,
    Command.create(title, keyVariableThemeQuickFix, {
      type: "theme.quickFix",
      uri,
      range,
      value,
    } satisfies FixMeCommand),
    CodeActionKind.QuickFix
  );
}
