# Scroll Sync Design — Markdown Preview in Extension Area

**Date:** 2026-06-13
**Status:** Approved (design), pending implementation plan

## Problem

The extension renders Markdown into a webview that lives in its own view
container (activity bar / panel), separate from the source editor. When the
source `.md` editor and the preview are placed side by side, their scroll
positions are independent — scrolling one does not move the other. Users
editing long documents cannot quickly find the preview region that corresponds
to the line they are editing (or vice versa).

## Goal

Add **bidirectional scroll synchronization** between the source Markdown editor
and the preview webview, matching the UX of VS Code's built-in Markdown preview:

- Scrolling the editor moves the preview to the corresponding content.
- Scrolling the preview moves the editor to the corresponding source line.

## Approach

**Line-anchor mapping** (the same technique VS Code's built-in preview uses).
At render time, each block element in the preview HTML is tagged with the
source line number it originated from. Scroll position is translated between
editor and preview by mapping line numbers to anchor element offsets.

Rejected alternatives:
- **Percentage-based** (`scrollTop / scrollHeight`): trivial but drifts badly
  because rendered height does not track source line distribution (e.g. a large
  Mermaid diagram or image is one source line but a tall rendered block).
- **Heading-only mapping**: reuses the existing outline anchors but only syncs
  at section boundaries — coarse and not smooth.

## Architecture

Three cooperating pieces.

### 1. Render-time source-line injection

**Where:** `src/markdownPreviewProvider.ts`, render path around `_md.render()`
(currently line 410).

Add a small `markdown-it` core rule that walks the parsed token stream and, for
every top-level block-opening token that carries a `.map` (source line range),
sets an attribute:

```js
token.attrSet('data-source-line', String(token.map[0]));
```

The existing custom `fence` and `image` renderer rules must be updated to
preserve / emit this attribute so code blocks and images remain anchorable.

Result: each `<p>`, `<h1..6>`, `<pre>`, `<blockquote>`, `<ul>/<ol>`, table,
etc. in the preview HTML knows which source line it starts at.

### 2. Editor → Preview sync

**Where:** `src/extension.ts` (event subscription) + webview script in
`getWebviewContent`.

- Subscribe to `vscode.window.onDidChangeTextEditorVisibleRanges`.
- When the event fires for the editor whose document is the one currently shown
  in the preview (and the file is not pinned to a different document, and
  `scrollSync` is enabled, and the echo lock is not held):
  - Compute the top visible source line from the editor's visible range.
  - `postMessage({ command: 'syncToLine', line })` to the webview.
- Webview handler: find the anchor element with the largest
  `data-source-line <= line` and the next anchor; interpolate the scroll offset
  between them by the fractional position within the line range; set
  `scrollTop`.

### 3. Preview → Editor sync

**Where:** webview script (scroll listener) + `onDidReceiveMessage` handler
(currently line 127).

- Webview listens to its own scroll, debounced (~50ms).
- Find the top-most anchor element currently in view; derive a fractional
  source line from its `data-source-line` and the next anchor.
- `postMessage({ command: 'revealLine', line })`.
- Extension handler: locate the `TextEditor` for the current document in
  `vscode.window.visibleTextEditors`; call
  `editor.revealRange(new vscode.Range(line,0,line,0), TextEditorRevealType.AtTop)`.
  If no visible editor for that document exists, no-op.

## Key processing concerns

- **Echo / feedback loop prevention.** Editor→preview sync triggers a preview
  scroll, which would fire preview→editor, which scrolls the editor, etc. Guard
  with an `isSyncing` lock plus a short timeout (the strategy the built-in
  preview uses): when one direction is actively driving, suppress the reverse
  message until the lock clears.
- **Pin state.** The extension supports pinning the preview to a file. If the
  preview is pinned to a document different from the active editor, do not sync.
- **Source editor not visible.** Preview→editor is a no-op when no visible
  editor shows the current document. Editor→preview resumes naturally once an
  editor becomes visible and scrolls.
- **Async-rendered content.** Mermaid diagrams and images change layout height
  after initial render. Recompute / re-read anchor offsets after render
  completion (and on resize) rather than caching offsets at render time.

## Configuration

Add one setting, following the existing `markdownPreviewInExtensionPanel.*`
pattern in `package.json`:

- `markdownPreviewInExtensionPanel.scrollSync` — boolean, default `true`.
  Enables/disables bidirectional scroll sync.

Direction-specific toggles are intentionally omitted (YAGNI). A single
on/off switch covers the stated need; finer control can be added later if asked.

## Testing

Automated tests are currently absent in this repo (per AGENTS.md). Verify
manually in the Extension Host (`F5`):

1. Open a long `.md` in the editor with the preview side by side.
2. Scroll the editor → preview follows to the matching content.
3. Scroll the preview → editor follows to the matching source line.
4. Document mixing headings, paragraphs, code fences, images, and a Mermaid
   diagram → anchors stay aligned through tall blocks.
5. Pin the preview to a different file → no sync occurs.
6. Set `scrollSync` to `false` → both directions stop; setting back to `true`
   resumes without reload.

If time allows, add a focused unit test for the line→anchor interpolation logic
(pure function, no VS Code APIs needed) under `src/test/unit/`.

## Out of scope

- Smooth/animated scrolling easing.
- Direction-specific configuration.
- Syncing cursor position (only viewport scroll is synced).
