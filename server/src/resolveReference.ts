import { existsSync } from "fs";
import { DocumentContext } from "vscode-css-languageservice";

export const resolveReference: DocumentContext["resolveReference"] = (
  ref,
  baseUrl
) => {
  const r1 = resolveFor(getString(ref, baseUrl, true));
  if (r1) return r1;
  const r2 = resolveFor(getString(ref, baseUrl, false));
  if (r2) return r2;
  // poor solution to get mono-repo absolute paths working
  const baseUrlPackages = baseUrl.match(/(.*\/packages\/[^/]+\/)/)?.[0];
  if (!baseUrlPackages) return undefined;
  const a1 = resolveFor(getString(ref, baseUrlPackages, true));
  if (a1) return a1;
  const a2 = resolveFor(getString(ref, baseUrlPackages, false));
  if (a2) return a2;
  return undefined;
};

function resolveFor(url: string): string | undefined {
  return existsSync(url.replace("file://", "")) ? url : undefined;
}

function getString(ref: string, baseUrl: string, slash: boolean) {
  if (!slash) return new URL(`${ref}.scss`, baseUrl).toString();
  const parts = ref.split("/");
  parts[parts.length - 1] = `_${parts[parts.length - 1]}`;
  ref = parts.join("/");
  return new URL(`${ref}.scss`, baseUrl).toString();
}
