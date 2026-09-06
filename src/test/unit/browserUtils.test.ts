/**
 * Unit tests for the URL helpers used by the preview's link context menu.
 * These have no VS Code / DOM dependency and run directly under Mocha.
 */
import * as assert from 'assert';
import { DEFAULT_BROWSER_URL, normalizeUrl, isExternalUrl } from '../../browserUtils';

describe('browserUtils', () => {

    describe('normalizeUrl', () => {
        it('keeps a URL that already has a scheme', () => {
            assert.strictEqual(normalizeUrl('https://example.com'), 'https://example.com');
            assert.strictEqual(normalizeUrl('http://example.com/path'), 'http://example.com/path');
        });

        it('keeps non-http schemes such as about:blank', () => {
            assert.strictEqual(normalizeUrl('about:blank'), 'about:blank');
            assert.strictEqual(normalizeUrl('vscode:extension/nacn.markdown'), 'vscode:extension/nacn.markdown');
        });

        it('prepends http:// when the scheme is omitted', () => {
            assert.strictEqual(normalizeUrl('example.com'), 'http://example.com');
            assert.strictEqual(normalizeUrl('example.com/path?a=b'), 'http://example.com/path?a=b');
        });

        it('treats a host:port form as an existing scheme (left untouched)', () => {
            // 'localhost:' matches the scheme pattern, so no prefix is added
            assert.strictEqual(normalizeUrl('localhost:3000'), 'localhost:3000');
        });

        it('trims surrounding whitespace before normalizing', () => {
            assert.strictEqual(normalizeUrl('  example.com  '), 'http://example.com');
            assert.strictEqual(normalizeUrl(' https://example.com '), 'https://example.com');
        });

        it('falls back to the default URL for empty input', () => {
            assert.strictEqual(normalizeUrl(''), DEFAULT_BROWSER_URL);
            assert.strictEqual(normalizeUrl('   '), DEFAULT_BROWSER_URL);
        });

        it('falls back to the default URL for null or undefined input', () => {
            assert.strictEqual(normalizeUrl(undefined as unknown as string), DEFAULT_BROWSER_URL);
            assert.strictEqual(normalizeUrl(null as unknown as string), DEFAULT_BROWSER_URL);
        });

        it('exposes about:blank as the default URL', () => {
            assert.strictEqual(DEFAULT_BROWSER_URL, 'about:blank');
        });
    });

    describe('isExternalUrl', () => {
        it('accepts http and https URLs', () => {
            assert.strictEqual(isExternalUrl('http://example.com'), true);
            assert.strictEqual(isExternalUrl('https://example.com/a/b?c=d#e'), true);
        });

        it('accepts URLs regardless of scheme casing', () => {
            assert.strictEqual(isExternalUrl('HTTPS://example.com'), true);
            assert.strictEqual(isExternalUrl('Http://example.com'), true);
        });

        it('ignores surrounding whitespace', () => {
            assert.strictEqual(isExternalUrl('  https://example.com '), true);
        });

        it('rejects relative links and in-document anchors', () => {
            assert.strictEqual(isExternalUrl('./docs/readme.md'), false);
            assert.strictEqual(isExternalUrl('../images/logo.png'), false);
            assert.strictEqual(isExternalUrl('#heading-1'), false);
        });

        it('rejects other schemes', () => {
            assert.strictEqual(isExternalUrl('about:blank'), false);
            assert.strictEqual(isExternalUrl('mailto:someone@example.com'), false);
            assert.strictEqual(isExternalUrl('file:///tmp/a.md'), false);
        });

        it('rejects empty, null and undefined input', () => {
            assert.strictEqual(isExternalUrl(''), false);
            assert.strictEqual(isExternalUrl('   '), false);
            assert.strictEqual(isExternalUrl(undefined as unknown as string), false);
            assert.strictEqual(isExternalUrl(null as unknown as string), false);
        });
    });
});
