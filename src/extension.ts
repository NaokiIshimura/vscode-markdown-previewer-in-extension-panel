import * as vscode from 'vscode';
import { MarkdownPreviewProvider } from './markdownPreviewProvider';
import { ThemeManager } from './themeManager';

export function activate(context: vscode.ExtensionContext) {
    // Instantiate ThemeManager
    const themeManager = new ThemeManager(context);

    // Pass themeManager to MarkdownPreviewProvider
    const provider = new MarkdownPreviewProvider(context.extensionUri, themeManager);

    // Debounce timers
    let documentChangeTimer: NodeJS.Timeout | undefined;
    let editorChangeTimer: NodeJS.Timeout | undefined;
    const DOCUMENT_CHANGE_DEBOUNCE = 300; // 300ms
    const EDITOR_CHANGE_DEBOUNCE = 100; // 100ms

    // Register the webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('markdownPreview', provider, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.refresh', () => {
            provider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.edit', () => {
            void provider.edit();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.pin', () => {
            void provider.pin();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.unpin', () => {
            void provider.unpin();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.togglePin', () => {
            void provider.togglePin();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.useLightTheme', () => {
            void themeManager.setThemeMode('light');
            provider.useLightTheme();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.useDarkTheme', () => {
            void themeManager.setThemeMode('dark');
            provider.useDarkTheme();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.zoomIn', () => {
            provider.zoomIn();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.zoomOut', () => {
            provider.zoomOut();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.resetZoom', () => {
            provider.resetZoom();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markdownPreview.openSettings', () => {
            void vscode.commands.executeCommand('workbench.action.openSettings', 'markdownPreview');
        })
    );

    // Listen for active editor changes with debounce
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            if (editorChangeTimer) {
                clearTimeout(editorChangeTimer);
            }
            editorChangeTimer = setTimeout(() => {
                void provider.updatePreview();
                editorChangeTimer = undefined;
            }, EDITOR_CHANGE_DEBOUNCE);
        })
    );

    // Listen for document changes with debounce
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const activeDocument = vscode.window.activeTextEditor?.document;
            if (event.document === activeDocument || provider.isPinnedDocument(event.document.uri)) {
                if (documentChangeTimer) {
                    clearTimeout(documentChangeTimer);
                }
                documentChangeTimer = setTimeout(() => {
                    void provider.updatePreview();
                    documentChangeTimer = undefined;
                }, DOCUMENT_CHANGE_DEBOUNCE);
            }
        })
    );

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('markdownPreview.defaultZoomLevel')) {
                provider.onConfigurationChanged();
            }
        })
    );

    // Listen for file system changes to invalidate file list cache
    context.subscriptions.push(
        vscode.workspace.onDidCreateFiles(() => {
            provider.invalidateFileListCache();
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles(() => {
            provider.invalidateFileListCache();
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidRenameFiles(() => {
            provider.invalidateFileListCache();
        })
    );

    // Cleanup ThemeManager
    context.subscriptions.push(themeManager);
}

export function deactivate() { }
