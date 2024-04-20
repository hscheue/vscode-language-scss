import { existsSync } from "fs";
import { join } from "path";

import { settings } from "./settings";
import { Root } from "postcss";

export function resolveReference(ref: string, baseUrl: string) {
  if (ref.startsWith("https://") || ref.startsWith("http://")) {
    console.log(`ref: ${ref}; baseUrl: ${baseUrl};`);
    return undefined;
  }
  const r1 = resolveFor(getString(ref, baseUrl, true));
  if (r1) return r1;
  const r2 = resolveFor(getString(ref, baseUrl, false));
  if (r2) return r2;

  // poor solution to get resolveSettings.baseURL working
  const b1 = resolveFor(getString(ref, settings.baseURL + "/t", true));
  if (b1) return b1;
  const b2 = resolveFor(getString(ref, settings.baseURL + "/t", false));
  if (b2) return b2;

  // poor solution to get mono-repo absolute paths working
  const baseUrlPackages = baseUrl.match(/(.*\/packages\/[^/]+\/)/)?.[0];
  if (baseUrlPackages) {
    const a1 = resolveFor(getString(ref, baseUrlPackages, true));
    if (a1) return a1;
    const a2 = resolveFor(getString(ref, baseUrlPackages, false));
    if (a2) return a2;
  }

  // poor solution to get node_modules paths working
  const baseUrlModules = join(settings.baseURL, "node_modules", "src");
  if (baseUrlModules) {
    const m1 = resolveFor(getString(ref, baseUrlModules, true, true));
    if (m1) return m1;
    const m2 = resolveFor(getString(ref, baseUrlModules, false, true));
    if (m2) return m2;
  }
  return undefined;
}

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

export function getLinks(root: Root, baseURL: string, set: Set<string>) {
  const linkURI: string[] = [];

  root.walk((node) => {
    if (node.type === "atrule" && node.name === "use") {
      /** FIXME */
      const path = node.params.split('"')[1];
      const link = resolveReference(path, baseURL);
      if (link && !set.has(link)) {
        set.add(link);
        linkURI.push(link);
      }
    }
  });

  return linkURI;
}
