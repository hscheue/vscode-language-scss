import * as path from "path";
import { ExtensionContext } from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  client = new LanguageClient(
    "vscode-language-server",
    "vscode-language-server",
    {
      module: context.asAbsolutePath(path.join("server", "out", "server.js")),
      transport: TransportKind.ipc,
    },
    {
      documentSelector: [{ scheme: "file", language: "scss" }],
    }
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  return client.stop();
}
