import { Connection } from "../server";
import { connection } from "./connection";
import { resolveReference } from "./resolveReference";

type Settings = {
  baseURL: string;
  workspaceSettings?: {
    experimental: {
      themeDiagnosticsFile?: string | string[];
    };
  };
};

export const settings: Settings = {
  baseURL: "",
};

async function asyncThemeDiagnosticsFile(c: Connection) {
  if (settings.workspaceSettings) {
    return settings.workspaceSettings.experimental?.themeDiagnosticsFile;
  } else {
    settings.workspaceSettings = await c.workspace.getConfiguration({
      scopeUri: settings.baseURL,
      section: "vscode-language-scss",
    });
    return settings.workspaceSettings?.experimental.themeDiagnosticsFile;
  }
}

/** Get resolved theme config value */
export async function getThemeSrc(
  uri: string
): Promise<{ src: string; uri: string } | null> {
  const themeSetting = await asyncThemeDiagnosticsFile(connection);
  if (!themeSetting) return null;

  if (Array.isArray(themeSetting)) {
    for (const theme of themeSetting) {
      const themeUri = resolveReference(theme, uri);
      if (!themeUri) continue;
      return { src: theme, uri: themeUri };
    }

    return null;
  }

  const themeUri = resolveReference(themeSetting, uri);
  if (!themeUri) return null;
  return { src: themeSetting, uri: themeUri };
}
