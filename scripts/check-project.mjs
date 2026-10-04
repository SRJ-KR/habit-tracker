import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "index.html",
  "manifest.json",
  "sw.js",
  "icon.svg",
  ".nojekyll",
];

for (const file of requiredFiles) {
  await access(path.join(root, file), constants.R_OK);
}

const html = await readFile(path.join(root, "index.html"), "utf8");
const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
const serviceWorker = await readFile(path.join(root, "sw.js"), "utf8");
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

if (inlineScripts.length !== 1) {
  throw new Error(`Expected one inline application script; found ${inlineScripts.length}.`);
}

new vm.Script(inlineScripts[0][1], { filename: "index.html:inline-script" });
new vm.Script(serviceWorker, { filename: "sw.js" });

if (!manifest.name || !manifest.short_name || manifest.start_url !== "./" || manifest.scope !== "./") {
  throw new Error("The web app manifest is missing its name or root-relative Pages configuration.");
}

for (const icon of manifest.icons ?? []) {
  const iconPath = icon.src;
  if (!iconPath || iconPath.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(iconPath)) {
    throw new Error(`Manifest icon must use a relative local path: ${iconPath}`);
  }
  await access(path.resolve(root, iconPath), constants.R_OK);
}

for (const match of html.matchAll(/(?:href|src)="([^"#?]+)"/gi)) {
  const assetPath = match[1];
  if (assetPath.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(assetPath)) continue;
  await access(path.resolve(root, assetPath), constants.R_OK);
}

console.log("Project check passed: app shell assets, relative paths, manifest, and JavaScript syntax.");
