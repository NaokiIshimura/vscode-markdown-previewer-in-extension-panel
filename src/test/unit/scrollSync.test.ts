/**
 * Unit tests for the pure scroll-sync mapping functions.
 * These have no VS Code / DOM dependency and run directly under Mocha.
 */
import * as assert from 'assert';
import { lineToScrollTop, scrollTopToLine, Anchor } from '../../scrollSync';

// Anchors: each rendered block knows its source line and its pixel offset
// in the preview scroll container. Sorted ascending by both line and offset.
const anchors: Anchor[] = [
    { line: 0, offset: 0 },
    { line: 10, offset: 100 },
    { line: 20, offset: 400 }, // tall block between line 10 and 20 (e.g. image)
    { line: 30, offset: 500 },
];

describe('scrollSync mapping', () => {

    describe('lineToScrollTop (editor -> preview)', () => {
        it('returns 0 when there are no anchors', () => {
            assert.strictEqual(lineToScrollTop([], 5), 0);
        });

        it('clamps to the first anchor offset when the line is before it', () => {
            assert.strictEqual(lineToScrollTop(anchors, -3), 0);
        });

        it('returns the exact offset when the line matches an anchor', () => {
            assert.strictEqual(lineToScrollTop(anchors, 10), 100);
            assert.strictEqual(lineToScrollTop(anchors, 20), 400);
        });

        it('interpolates linearly between two anchors', () => {
            // halfway between line 10 (100px) and line 20 (400px) -> 250px
            assert.strictEqual(lineToScrollTop(anchors, 15), 250);
        });

        it('clamps to the last anchor offset when the line is past it', () => {
            assert.strictEqual(lineToScrollTop(anchors, 999), 500);
        });

        it('handles a fractional line', () => {
            // line 12 is 20% from 10->20 -> 100 + 0.2*300 = 160
            assert.strictEqual(lineToScrollTop(anchors, 12), 160);
        });
    });

    describe('scrollTopToLine (preview -> editor)', () => {
        it('returns 0 when there are no anchors', () => {
            assert.strictEqual(scrollTopToLine([], 250), 0);
        });

        it('clamps to the first anchor line when scrollTop is above it', () => {
            assert.strictEqual(scrollTopToLine(anchors, -50), 0);
        });

        it('returns the exact line when scrollTop matches an anchor offset', () => {
            assert.strictEqual(scrollTopToLine(anchors, 100), 10);
            assert.strictEqual(scrollTopToLine(anchors, 400), 20);
        });

        it('interpolates linearly between two anchors', () => {
            // 250px is halfway between 100px (line 10) and 400px (line 20) -> line 15
            assert.strictEqual(scrollTopToLine(anchors, 250), 15);
        });

        it('clamps to the last anchor line when scrollTop is past it', () => {
            assert.strictEqual(scrollTopToLine(anchors, 9999), 30);
        });
    });
});
