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

test("all UI elements inherit one font family and include phone/tablet breakpoints", () => {
  assert.match(html, /--font-family:\s*system-ui,\s*sans-serif/);
  assert.match(html, /\*,\s*\*::before,\s*\*::after\s*\{\s*box-sizing:\s*border-box;\s*font-family:\s*inherit;/);
  assert.match(html, /@media\s*\(max-width:\s*760px\)/);
  assert.match(html, /@media\s*\(max-width:\s*430px\)/);
  assert.match(html, /@media\s*\(max-width:\s*410px\)/);
  assert.match(html, /\.field-grid\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(html, /env\(safe-area-inset-top\)/);
  assert.match(html, /body\s*\{[^}]*min-width:\s*0/);
  assert.match(html, /\.home-grid\s*>\s*\*,\s*\.focus-layout\s*>\s*\*,\s*\.checkin-layout\s*>\s*\*\s*\{\s*min-width:\s*0/);
  assert.match(html, /\.field\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(html, /\.mood-option\s*\{[^}]*min-width:\s*0/);
});

test("gameful progress rewards completed actions without scoring check-ins", () => {
  const pointsFunction = html.match(/function momentumPoints\(\) \{([\s\S]*?)\n      \}/);
  assert.ok(pointsFunction, "momentum points calculation is missing");
  assert.match(pointsFunction[1], /data\.habitEntries\.length \* 10/);
  assert.match(pointsFunction[1], /completedFocusSessions \* 25/);
  assert.match(pointsFunction[1], /data\.learningLogs\.length \* 15/);
  assert.doesNotMatch(pointsFunction[1], /checkins/);
  assert.match(html, /100 points to Level/);
  assert.match(html, /\+10 habit · \+25 focus · \+15 learning/);
  assert.match(html, /Check-ins aren't scored · points don't expire/);
  assert.match(html, /Earned · first habit complete/);
  assert.match(html, /\+10 Momentum points/);
  assert.match(html, /\+25 Momentum points/);
  assert.match(html, /\+15 Momentum points/);
  assert.match(html, /Today's tiny quest/);
  assert.match(html, /aria-label="Daily quest progress"/);
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
