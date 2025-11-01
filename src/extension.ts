import * as vscode from 'vscode';
import { MarkdownPreviewProvider } from './markdownPreviewProvider';
import { ThemeManager } from './themeManager';

export function activate(context: vscode.ExtensionContext) {
    // Instantiate ThemeManager
    const themeManager = new ThemeManager(context);

    // Pass themeManager to MarkdownPreviewProvider
    const provider = new MarkdownPreviewProvider(context.extensionUri, themeManager);

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

    // Listen for active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            void provider.updatePreview();
        })
    );

    // Listen for document changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const activeDocument = vscode.window.activeTextEditor?.document;
            if (event.document === activeDocument || provider.isPinnedDocument(event.document.uri)) {
                void provider.updatePreview();
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

    // Cleanup ThemeManager
    context.subscriptions.push(themeManager);
}

export function deactivate() { }
