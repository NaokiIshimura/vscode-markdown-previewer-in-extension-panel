/**
 * Pure scroll-sync mapping between source line numbers and preview pixel
 * offsets. No VS Code or DOM dependency — unit tested directly, and the
 * function source is also injected into the webview (via `.toString()`) so the
 * exact same logic runs in the browser. Keep these self-contained.
 */

export interface Anchor {
    /** Source line number (0-based) where the rendered block starts. */
    line: number;
    /** Pixel offset of the block's top within the preview scroll container. */
    offset: number;
}

/**
 * Editor -> Preview: given the anchors (ascending) and a source line, return
 * the preview scrollTop that aligns that line to the top of the viewport.
 */
export function lineToScrollTop(anchors: Anchor[], line: number): number {
    if (anchors.length === 0) {
        return 0;
    }
    if (line <= anchors[0].line) {
        return anchors[0].offset;
    }
    const last = anchors[anchors.length - 1];
    if (line >= last.line) {
        return last.offset;
    }
    let prev = anchors[0];
    for (let i = 1; i < anchors.length; i++) {
        const next = anchors[i];
        if (line < next.line) {
            const span = next.line - prev.line;
            const ratio = span === 0 ? 0 : (line - prev.line) / span;
            return prev.offset + ratio * (next.offset - prev.offset);
        }
        prev = next;
    }
    return last.offset;
}

/**
 * Preview -> Editor: given the anchors (ascending) and a preview scrollTop,
 * return the source line that should be revealed at the top of the editor.
 */
export function scrollTopToLine(anchors: Anchor[], scrollTop: number): number {
    if (anchors.length === 0) {
        return 0;
    }
    if (scrollTop <= anchors[0].offset) {
        return anchors[0].line;
    }
    const last = anchors[anchors.length - 1];
    if (scrollTop >= last.offset) {
        return last.line;
    }
    let prev = anchors[0];
    for (let i = 1; i < anchors.length; i++) {
        const next = anchors[i];
        if (scrollTop < next.offset) {
            const span = next.offset - prev.offset;
            const ratio = span === 0 ? 0 : (scrollTop - prev.offset) / span;
            return prev.line + ratio * (next.line - prev.line);
        }
        prev = next;
    }
    return last.line;
}
