import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Command,
  Range,
} from "vscode-languageserver";
import { getDocument } from "./_shared/getDocument";
import { FixMeCommand } from "./_shared/connection";

export function getCodeActions(codeAction: CodeActionParams): CodeAction[] {
  const doc = getDocument(codeAction.textDocument.uri);
  if (!doc) return [];

  let range: Range | undefined;

  if (
    "diagnostics" in codeAction.context &&
    codeAction.context.diagnostics.length
  ) {
    range = codeAction.context.diagnostics[0]?.range;
  }

  if (!range) return [];

  const title = "Replace with theme value";
  const value: string = codeAction.context.diagnostics[0].data.value;

  return [
    CodeAction.create(
      title,
      Command.create(title, "theme.quickFix", {
        uri: doc.uri,
        range,
        value,
      } satisfies FixMeCommand),
      CodeActionKind.QuickFix
    ),
  ];
}
