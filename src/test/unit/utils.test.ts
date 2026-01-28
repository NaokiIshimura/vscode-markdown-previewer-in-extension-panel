/**
 * VS Code APIに依存しないユーティリティ関数のユニットテスト
 * Mochaで直接実行可能
 */
import * as assert from 'assert';

// MarkdownPreviewProvider内のprivateメソッドをテストするためのヘルパー
// 実際の実装からロジックを抽出

/**
 * slugify関数のテスト用実装
 */
function slugify(text: string): string {
    return encodeURIComponent(String(text).trim().toLowerCase().replace(/\s+/g, '-'));
}

/**
 * clampZoom関数のテスト用実装
 */
function clampZoom(value: number, minZoom: number, maxZoom: number, defaultZoom: number): number {
    if (Number.isNaN(value)) {
        return defaultZoom;
    }
    return Math.max(minZoom, Math.min(maxZoom, value));
}

/**
 * validateThemeMode関数のテスト用実装
 */
type ThemeMode = 'auto' | 'light' | 'dark';

function validateThemeMode(value: string): ThemeMode {
    const validModes: ThemeMode[] = ['auto', 'light', 'dark'];
    if (validModes.includes(value as ThemeMode)) {
        return value as ThemeMode;
    }
    return 'auto';
}

/**
 * HTML entityデコード関数のテスト用実装
 */
function decodeHtmlEntities(code: string): string {
    return code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
}

describe('Utility Functions', () => {

    describe('slugify', () => {
        it('should convert text to lowercase', () => {
            assert.strictEqual(slugify('HELLO'), 'hello');
        });

        it('should replace spaces with hyphens', () => {
            assert.strictEqual(slugify('hello world'), 'hello-world');
        });

        it('should replace multiple spaces with single hyphen', () => {
            assert.strictEqual(slugify('hello   world'), 'hello-world');
        });

        it('should trim whitespace', () => {
            assert.strictEqual(slugify('  hello  '), 'hello');
        });

        it('should encode special characters', () => {
            const result = slugify('hello@world');
            assert.ok(result.includes('%40'), 'Should encode @ symbol');
        });

        it('should handle Japanese text', () => {
            const result = slugify('日本語テスト');
            assert.ok(result.length > 0, 'Should handle Japanese characters');
        });

        it('should handle empty string', () => {
            assert.strictEqual(slugify(''), '');
        });
    });

    describe('clampZoom', () => {
        const minZoom = 50;
        const maxZoom = 200;
        const defaultZoom = 100;

        it('should return value within range', () => {
            assert.strictEqual(clampZoom(150, minZoom, maxZoom, defaultZoom), 150);
        });

        it('should clamp value below minimum', () => {
            assert.strictEqual(clampZoom(30, minZoom, maxZoom, defaultZoom), 50);
        });

        it('should clamp value above maximum', () => {
            assert.strictEqual(clampZoom(250, minZoom, maxZoom, defaultZoom), 200);
        });

        it('should return minimum for negative values', () => {
            assert.strictEqual(clampZoom(-10, minZoom, maxZoom, defaultZoom), 50);
        });

        it('should return default for NaN', () => {
            assert.strictEqual(clampZoom(NaN, minZoom, maxZoom, defaultZoom), 100);
        });

        it('should accept boundary values', () => {
            assert.strictEqual(clampZoom(50, minZoom, maxZoom, defaultZoom), 50);
            assert.strictEqual(clampZoom(200, minZoom, maxZoom, defaultZoom), 200);
        });
    });

    describe('validateThemeMode', () => {
        it('should return auto for valid auto value', () => {
            assert.strictEqual(validateThemeMode('auto'), 'auto');
        });

        it('should return light for valid light value', () => {
            assert.strictEqual(validateThemeMode('light'), 'light');
        });

        it('should return dark for valid dark value', () => {
            assert.strictEqual(validateThemeMode('dark'), 'dark');
        });

        it('should fallback to auto for invalid value', () => {
            assert.strictEqual(validateThemeMode('invalid'), 'auto');
        });

        it('should fallback to auto for empty string', () => {
            assert.strictEqual(validateThemeMode(''), 'auto');
        });

        it('should be case sensitive', () => {
            assert.strictEqual(validateThemeMode('LIGHT'), 'auto');
            assert.strictEqual(validateThemeMode('Dark'), 'auto');
        });
    });

    describe('decodeHtmlEntities', () => {
        it('should decode &lt; to <', () => {
            assert.strictEqual(decodeHtmlEntities('&lt;div&gt;'), '<div>');
        });

        it('should decode &amp; to &', () => {
            assert.strictEqual(decodeHtmlEntities('a &amp; b'), 'a & b');
        });

        it('should decode &quot; to "', () => {
            assert.strictEqual(decodeHtmlEntities('&quot;hello&quot;'), '"hello"');
        });

        it('should decode multiple entities', () => {
            const input = '&lt;a href=&quot;test&quot;&gt;link&lt;/a&gt;';
            const expected = '<a href="test">link</a>';
            assert.strictEqual(decodeHtmlEntities(input), expected);
        });

        it('should handle text without entities', () => {
            assert.strictEqual(decodeHtmlEntities('plain text'), 'plain text');
        });

        it('should handle empty string', () => {
            assert.strictEqual(decodeHtmlEntities(''), '');
        });
    });
});
