import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "index.html"), "utf8");
const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
const serviceWorker = await readFile(path.join(root, "sw.js"), "utf8");

test("the app declares all five independent data collections and a schema version", () => {
  for (const field of ["habits", "habitEntries", "focusSessions", "checkins", "learningLogs"]) {
    assert.match(html, new RegExp(`\\b${field}:\\s*\\[\\]`), `${field} collection is missing`);
  }
  assert.match(html, /SCHEMA_VERSION\s*=\s*"1\.0\.0"/);
  assert.match(html, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(html, /localStorage\.getItem\(STORAGE_KEY/);
});

test("every MVP module has a reachable navigation entry and rendered section", () => {
  const pages = ["home", "habits", "focus", "checkin", "learning"];
  for (const page of pages) {
    assert.match(html, new RegExp(`data-page="${page}"`), `${page} navigation is missing`);
    assert.match(html, new RegExp(`data-section="${page}"`), `${page} section is missing`);
  }
});

test("untrusted text is rendered as text and imported JSON is validated before use", () => {
  assert.doesNotMatch(html, /\.innerHTML\b/);
  assert.doesNotMatch(html, /\son(?:click|change|submit)\s*=/i);
  assert.match(html, /textContent\s*=/);
  assert.match(html, /function validateData\(value\)/);
  assert.match(html, /Unsupported schema version/);
  assert.match(html, /Backup not imported:/);
  assert.match(html, /confirm\("Importing will replace all Daymark data/);
});

test("the manifest and offline shell use local, root-deployable assets", () => {
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(manifest.icons.some(icon => icon.src === "./icon.svg"));
  assert.match(serviceWorker, /const APP_SHELL = \["\.\/", "\.\/index\.html", "\.\/manifest\.json", "\.\/icon\.svg"\]/);
  assert.match(serviceWorker, /request\.method !== "GET"/);
  assert.match(serviceWorker, /new URL\(request\.url\)\.origin !== self\.location\.origin/);
  assert.match(serviceWorker, /APP_SHELL\.some/);
  assert.match(serviceWorker, /daymark-shell-v\d+/);
});

test("the quality log records verification before a commit", async () => {
  const log = await readFile(path.join(root, "QUALITY_LOG.md"), "utf8");
  assert.match(log, /Change summary/);
  assert.match(log, /Checks run/);
  assert.match(log, /Results/);
});
