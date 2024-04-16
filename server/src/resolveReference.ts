import { existsSync } from "fs";
import { join } from "path";
import { DocumentContext } from "vscode-css-languageservice";
import { logMessage } from "./log";

export const resolveSettings = {
  baseURL: "",
};

export const resolveReference: DocumentContext["resolveReference"] = (
  ref,
  baseUrl
) => {
  if (ref.startsWith("https://") || ref.startsWith("http://")) {
    logMessage(`ref: ${ref}; baseUrl: ${baseUrl};`);
    return undefined;
  }
  const r1 = resolveFor(getString(ref, baseUrl, true));
  // if (r1) logMessage(`resolved r1 ${r1}`);
  if (r1) return r1;
  const r2 = resolveFor(getString(ref, baseUrl, false));
  // if (r2) logMessage(`resolved r2 ${r2}`);
  if (r2) return r2;

  // poor solution to get resolveSettings.baseURL working
  const b1 = resolveFor(getString(ref, resolveSettings.baseURL + "/t", true));
  // if (b1) logMessage(`resolved b1 ${b1}`);
  if (b1) return b1;
  const b2 = resolveFor(getString(ref, resolveSettings.baseURL + "/t", false));
  // if (b2) logMessage(`resolved b2 ${b2}`);
  if (b2) return b2;

  // poor solution to get mono-repo absolute paths working
  const baseUrlPackages = baseUrl.match(/(.*\/packages\/[^/]+\/)/)?.[0];
  if (baseUrlPackages) {
    // logMessage(`baseUrlPackages ${baseUrlPackages}`);
    const a1 = resolveFor(getString(ref, baseUrlPackages, true));
    // if (a1) logMessage(`resolved a1 ${a1}`);
    if (a1) return a1;
    const a2 = resolveFor(getString(ref, baseUrlPackages, false));
    // if (a2) logMessage(`resolved a2 ${a2}`);
    if (a2) return a2;
  }

  // poor solution to get node_modules paths working
  const baseUrlModules = join(resolveSettings.baseURL, "node_modules", "src");
  if (baseUrlModules) {
    // logMessage(`baseUrlModules ${baseUrlModules}`);
    const m1 = resolveFor(getString(ref, baseUrlModules, true, true));
    // if (m1) logMessage(`resolved m1 ${m1}`);
    if (m1) return m1;
    const m2 = resolveFor(getString(ref, baseUrlModules, false, true));
    // if (m2) logMessage(`resolved m2 ${m2}`);
    if (m2) return m2;
  }
  // logMessage(`resolve missed`);
  return undefined;
};

function resolveFor(url: string): string | undefined {
  return existsSync(url.replace("file://", "")) ? url : undefined;
}

function getString(ref: string, baseUrl: string, slash: boolean, dist?: true) {
  if (!slash) return new URL(`${ref}.scss`, baseUrl).toString();
  const parts = ref.split("/");
  if (dist) {
    parts[parts.length - 1] = `dist/_${parts[parts.length - 1]}`;
  } else {
    parts[parts.length - 1] = `_${parts[parts.length - 1]}`;
  }
  ref = parts.join("/");
  return new URL(`${ref}.scss`, baseUrl).toString();
}
