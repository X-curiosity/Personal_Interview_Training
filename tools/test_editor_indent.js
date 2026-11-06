#!/usr/bin/env node
/* tools/test_editor_indent.js — verifies the code editor's automatic
   indentation (Python blocks, brackets, Tab/Shift+Tab) in a real DOM.
   Run: node tools/test_editor_indent.js */
"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png"
};

function startServer() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    const file = path.join(ROOT, url === "/" ? "index.html" : url.replace(/^\/+/, ""));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

async function waitFor(check, label, timeout = 15000) {
  const started = Date.now();
  for (;;) {
    if (check()) return;
    if (Date.now() - started > timeout) throw new Error("timed out waiting for " + label);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function openProblem(port, id) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/problem.html?id=${id}`, {
    resources: "usable", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("load timed out")), 15000);
    dom.window.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
  });
  await waitFor(() => dom.window.document.querySelector("textarea[data-editor]"), id + " editor");
  assert.deepStrictEqual(errors, [], id + " loaded without script errors");
  return dom;
}

/* Type at the caret by setting the selection then sending a keydown; the
   editor inserts the text itself, exactly as it would for a real key press. */
function press(window, editor, key, opts) {
  opts = opts || {};
  const event = new window.KeyboardEvent("keydown", {
    key, bubbles: true, cancelable: true,
    shiftKey: !!opts.shiftKey, ctrlKey: !!opts.ctrlKey, metaKey: !!opts.metaKey
  });
  editor.dispatchEvent(event);
  return event;
}

function setText(editor, text, caret) {
  editor.value = text;
  editor.selectionStart = editor.selectionEnd = caret == null ? text.length : caret;
}

async function main() {
  const { server, port } = await startServer();
  try {
    /* ---------------- Python: block openers ---------------- */
    let dom = await openProblem(port, "py-901");
    const { window } = dom;
    let editor = window.document.querySelector("textarea[data-editor]");

    assert(editor.getAttribute("aria-describedby"), "editor references its keyboard hint");
    assert.match(window.document.querySelector(".editor-hint").textContent, /Tab indents/);

    setText(editor, "def find_pair(nums, target):");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "def find_pair(nums, target):\n    ", "def block indents");

    setText(editor, "if x:\n    pass", editor.value.length);
    setText(editor, "if x:", 5);
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "if x:\n    ", "if block indents");

    setText(editor, "for i in range(10):");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "for i in range(10):\n    ", "for block indents");

    setText(editor, "    for row in grid:");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "    for row in grid:\n        ", "nested block adds a level");

    setText(editor, "    while stack:");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "    while stack:\n        ", "while block indents");

    setText(editor, "class Node:");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "class Node:\n    ", "class block indents");

    setText(editor, "    else:");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "    else:\n        ", "else keeps and adds indentation");

    setText(editor, "try:");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "try:\n    ", "try block indents");

    /* trailing spaces after the colon must not defeat the rule (the user's
       own text is left untouched, only the new line is indented) */
    setText(editor, "if x:   ");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "if x:   \n    ", "trailing spaces ignored for indentation");

    /* a plain indented line continues at the same level */
    setText(editor, "    return total");
    press(window, editor, "Enter");
    assert.strictEqual(editor.value, "    return total\n    ", "indent continues, no extra level");

    /* an unindented plain line is left to the browser */
    setText(editor, "print(x)");
    const plain = press(window, editor, "Enter");
    assert.strictEqual(plain.defaultPrevented, false, "plain line uses native newline");

    /* Shift+Enter is a plain newline (used for running selections in some IDEs) */
    setText(editor, "if x:");
    const shifted = press(window, editor, "Enter", { shiftKey: true });
    assert.strictEqual(shifted.defaultPrevented, false, "Shift+Enter is untouched");

    /* ---------------- Tab and Shift+Tab ---------------- */
    setText(editor, "ab", 0);
    press(window, editor, "Tab");
    assert.strictEqual(editor.value, "    ab", "Tab inserts four spaces at column zero");
    assert.strictEqual(editor.selectionStart, 4, "caret follows the inserted indentation");

    setText(editor, "x = 1", 1);
    press(window, editor, "Tab");
    assert.strictEqual(editor.value, "x    = 1", "Tab fills to the next four-column stop");

    setText(editor, "if x:\nreturn y");
    editor.selectionStart = 0;
    editor.selectionEnd = editor.value.length;
    press(window, editor, "Tab");
    assert.strictEqual(editor.value, "    if x:\n    return y", "Tab indents a whole selection");

    setText(editor, "    if x:\n    return y");
    editor.selectionStart = 0;
    editor.selectionEnd = editor.value.length;
    press(window, editor, "Tab", { shiftKey: true });
    assert.strictEqual(editor.value, "if x:\nreturn y", "Shift+Tab outdents a selection");

    setText(editor, "        deep", 8);
    press(window, editor, "Tab", { shiftKey: true });
    assert.strictEqual(editor.value, "    deep", "Shift+Tab removes one level only");

    /* Escape then Tab keeps normal keyboard navigation working */
    setText(editor, "abc", 0);
    press(window, editor, "Escape");
    const navigational = press(window, editor, "Tab");
    assert.strictEqual(navigational.defaultPrevented, false, "Escape then Tab moves focus");
    assert.strictEqual(editor.value, "abc", "navigational Tab does not edit code");

    /* ---------------- C braces ---------------- */
    const cdom = await openProblem(port, "sys-801");
    const ceditor = cdom.window.document.querySelector("textarea[data-editor]");
    setText(ceditor, "int main(void) {");
    press(cdom.window, ceditor, "Enter");
    assert.strictEqual(ceditor.value, "int main(void) {\n    ", "C block indents");

    setText(ceditor, "    for (int i = 0; i < n; i++) {");
    press(cdom.window, ceditor, "Enter");
    assert.strictEqual(ceditor.value, "    for (int i = 0; i < n; i++) {\n        ",
      "nested C block adds a level");

    setText(ceditor, "struct A {", 10); /* caret right after the brace, before nothing */
    setText(ceditor, "struct A {}", 10); /* caret between { and } */
    press(cdom.window, ceditor, "Enter");
    assert.strictEqual(ceditor.value, "struct A {\n    \n}", "braces expand into a block");
    assert.strictEqual(ceditor.selectionStart, "struct A {\n    ".length,
      "caret lands on the new inner line");

    dom.window.close();
    cdom.window.close();
    console.log("editor indentation OK — python blocks, brackets, Tab, Shift+Tab, Escape+Tab");
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
