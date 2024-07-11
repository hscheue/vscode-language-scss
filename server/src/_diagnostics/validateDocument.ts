import { Diagnostic } from "vscode-languageserver";
import { getThemeValues } from "./getThemeValues";
import { getDocument } from "../_shared/getDocument";
import { parse } from "postcss-scss";
import { asyncThemeSpacingPrefix, getThemeSrc } from "../_shared/settings";
import {
  simpleMixinDiagnostic,
  simpleVariableDiagnostic,
} from "./diagnostics-rules";

export async function validateDocument(uri: string): Promise<Diagnostic[]> {
  const theme = await getThemeSrc(uri);
  if (!theme) return [];

  const diagnostics: Diagnostic[] = [];
  const spacingPrefix = await asyncThemeSpacingPrefix();
  const { record, mixins, files } = getThemeValues(theme.uri);

  if (
    !files.includes(uri) &&
    theme.uri !== uri &&
    !uri.includes("/node_modules/")
  ) {
    const doc = getDocument(uri);
    if (!doc) return [];

    try {
      const root = parse(doc.getText());

      root.walk((node) => {
        if (node.type === "decl") {
          simpleVariableDiagnostic(record, node, diagnostics, spacingPrefix);
        }
        if (node.type === "rule") {
          simpleMixinDiagnostic(node, mixins, diagnostics);
        }
      });

      return diagnostics;
    } catch (err) {
      return [];
    }
  }

  return diagnostics;
}
