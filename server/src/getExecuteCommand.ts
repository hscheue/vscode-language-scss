import {
  ExecuteCommandParams,
  TextDocumentEdit,
  TextEdit,
} from "vscode-languageserver";
import { getDocument } from "./_shared/getDocument";
import { connection } from "./_shared/connection";
import { FixMeCommand, keyVariableThemeQuickFix } from "./_commands/quickFix";

export function getExecuteCommand(params: ExecuteCommandParams): void {
  if (
    params.command !== keyVariableThemeQuickFix ||
    params.arguments === undefined
  )
    return;
  const args: FixMeCommand = params.arguments[0];
  const doc = getDocument(args.uri);
  if (doc === undefined) return;

  connection.workspace.applyEdit({
    documentChanges: [
      TextDocumentEdit.create({ uri: doc.uri, version: doc.version }, [
        TextEdit.replace(args.range, args.value),
      ]),
    ],
  });
}
