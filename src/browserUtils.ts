/**
 * URL handling helpers shared by the webview message handlers.
 * Kept free of VS Code / DOM dependencies so they can be unit tested directly.
 */

/**
 * Default URL used when the integrated browser is opened without a target.
 * `about:blank` opens an empty tab.
 */
export const DEFAULT_BROWSER_URL = 'about:blank';

/**
 * Prepends `http://` to a URL that omits its scheme.
 * URLs that already carry a scheme (such as `about:blank`) are returned as-is.
 */
export function normalizeUrl(url: string): string {
    const trimmed = (url ?? '').trim();
    if (!trimmed) {
        return DEFAULT_BROWSER_URL;
    }
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `http://${trimmed}`;
}

/**
 * Returns true for http/https URLs, which are the only links the preview
 * offers a browser choice for. Relative links and in-document anchors keep
 * the standard VS Code context menu.
 */
export function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test((url ?? '').trim());
}
