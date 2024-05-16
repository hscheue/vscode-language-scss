import { Connection } from "../server";

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

export async function asyncThemeDiagnosticsFile(c: Connection) {
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
