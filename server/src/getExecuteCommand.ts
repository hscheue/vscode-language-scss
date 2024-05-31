import {
  ExecuteCommandParams,
  Position,
  Range,
  TextDocumentEdit,
  TextEdit,
} from "vscode-languageserver";
import { getDocument } from "./_shared/getDocument";
import { connection } from "./_shared/connection";
import {
  CommandShared,
  MixinDiagnostics,
  VariableDiagnostics,
  theme_fix_mixin,
  theme_fix_variable,
} from "./_commands/quickFix";

export function getExecuteCommand(params: ExecuteCommandParams): void {
  if (params.arguments === undefined) return;

  if (params.command === theme_fix_variable) {
    const args: CommandShared<VariableDiagnostics> = params.arguments[0];
    const doc = getDocument(args.uri);
    if (doc === undefined) return;

    connection.workspace.applyEdit({
      documentChanges: [
        TextDocumentEdit.create({ uri: doc.uri, version: doc.version }, [
          TextEdit.replace(args.range, args.value),
        ]),
      ],
    });
    return;
  }

  if (params.command === theme_fix_mixin) {
    const args: CommandShared<MixinDiagnostics> = params.arguments[0];
    const doc = getDocument(args.uri);
    if (doc === undefined) return;

    const removeLines = args.lineRanges.map((range) => {
      const modifiedRange = Range.create(range.start, range.end);
      modifiedRange.start.character = 0;
      modifiedRange.end.character = 0;
      modifiedRange.end.line += 1;
      return TextEdit.del(modifiedRange);
    });

    "\t".repeat(args.range.start.character / 2);

    const include = `\t@include ${args.label};\n\n`;
    const position = Position.create(args.range.start.line + 1, 0);
    const addImport = TextEdit.insert(position, include);

    connection.workspace.applyEdit({
      documentChanges: [
        TextDocumentEdit.create({ uri: doc.uri, version: doc.version }, [
          ...removeLines,
          addImport,
        ]),
      ],
    });
    return;
  }
}
