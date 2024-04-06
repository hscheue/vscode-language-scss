import * as path from "path";
import { ExtensionContext, window } from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient;

const outputChannel = window.createOutputChannel("vscode-language-scss");

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  client = new LanguageClient(
    "languageServerExample",
    "Language Server Example",
    {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    {
      documentSelector: [{ scheme: "file", language: "scss" }],
    }
  );

  client.onNotification("logMessage", (message) => {
    outputChannel.appendLine(message);
  });

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
