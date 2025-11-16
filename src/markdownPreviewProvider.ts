import * as vscode from 'vscode';
import * as MarkdownIt from 'markdown-it';
import * as path from 'path';
import anchor from 'markdown-it-anchor';
import { ThemeManager, EffectiveTheme } from './themeManager';

interface MarkdownRenderEnv {
    webview?: vscode.Webview;
    documentUri?: vscode.Uri;
}

interface HeadingInfo {
    level: number;
    text: string;
    id: string;
}

type PreviewTheme = 'light' | 'dark';

export class MarkdownPreviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'markdownPreview';
    private _view?: vscode.WebviewView;
    private _md: MarkdownIt;
    private _isPinned = false;
    private _pinnedUri?: vscode.Uri;
    private _pinnedFileName?: string;
    private _canPin = false;
    private _currentPreviewUri?: vscode.Uri;
    private _canEdit = false;
    private _theme: PreviewTheme;
    private _zoomLevel: number;
    private readonly _minZoom = 50;
    private readonly _maxZoom = 200;
    private readonly _zoomStep = 10;
    private _fileListCache: { dirUri: string; files: string[] } | undefined;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _themeManager: ThemeManager
    ) {
        this._zoomLevel = this.getDefaultZoomLevel();
        this._md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true
        });

        // Add anchor plugin for heading IDs
        this._md.use(anchor, {
            permalink: false,
            slugify: (s: string) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'))
        });

        this._theme = this.getInitialTheme();
        this.updateThemeContext();

        // Listen for theme change events
        _themeManager.onThemeChanged((effectiveTheme) => {
            this.applyTheme(effectiveTheme);
        });

        const defaultImageRender = this._md.renderer.rules.image ?? ((tokens, idx, options, env, self) => {
            return self.renderToken(tokens, idx, options);
        });

        this._md.renderer.rules.image = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const src = token.attrGet('src');

            if (src) {
                const resolvedSrc = this.resolveImageSource(src, env as MarkdownRenderEnv);
                if (resolvedSrc) {
                    token.attrSet('src', resolvedSrc);
                }
            }

            return defaultImageRender(tokens, idx, options, env, self);
        };
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        console.log('Resolving webview view');
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: this.getLocalResourceRoots()
        };

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'navigateNext':
                    void this.navigateToNextFile();
                    break;
                case 'navigatePrevious':
                    void this.navigateToPreviousFile();
                    break;
                case 'togglePin':
                    void this.togglePin();
                    break;
                case 'edit':
                    void this.edit();
                    break;
                case 'zoomIn':
                    this.zoomIn();
                    break;
                case 'zoomOut':
                    this.zoomOut();
                    break;
                case 'refresh':
                    this.refresh();
                    break;
            }
        });

        this.updateCanPinContext();
        this.updateCanEditContext();
        this.updatePinContext();
        void this.updatePreview();
    }

    public refresh() {
        void this.updatePreview();
    }

    public useLightTheme(): void {
        this.setTheme('light');
    }

    public useDarkTheme(): void {
        this.setTheme('dark');
    }

    public zoomIn(): void {
        const targetZoom = this._zoomLevel + this._zoomStep;
        const clamped = this.clampZoom(targetZoom);

        if (clamped === this._maxZoom && this._zoomLevel === this._maxZoom) {
            void vscode.window.showInformationMessage('Already at maximum zoom level');
            return;
        }

        this.applyZoomChange(targetZoom);
        void vscode.window.showInformationMessage(`Zoom: ${clamped}%`);
    }

    public zoomOut(): void {
        const targetZoom = this._zoomLevel - this._zoomStep;
        const clamped = this.clampZoom(targetZoom);

        if (clamped === this._minZoom && this._zoomLevel === this._minZoom) {
            void vscode.window.showInformationMessage('Already at minimum zoom level');
            return;
        }

        this.applyZoomChange(targetZoom);
        void vscode.window.showInformationMessage(`Zoom: ${clamped}%`);
    }

    public resetZoom(): void {
        this.applyZoomChange(this.getDefaultZoomLevel());
    }

    public onConfigurationChanged(): void {
        // Set fromConfig=true to prevent re-saving the configuration
        this.applyZoomChange(this.getDefaultZoomLevel(), true);
    }

    public async updatePreview(targetUri?: vscode.Uri): Promise<void> {
        if (!this._view) {
            console.log('No webview available');
            return;
        }

        let targetDocument: vscode.TextDocument | undefined;

        // Use provided URI (for navigation)
        if (targetUri) {
            try {
                targetDocument = await vscode.workspace.openTextDocument(targetUri);
            } catch (error) {
                console.warn('Failed to open target document:', error);
            }
        }

        // Use pinned URI if pinned
        if (!targetDocument && this._isPinned && this._pinnedUri) {
            try {
                targetDocument = await vscode.workspace.openTextDocument(this._pinnedUri);
            } catch (error) {
                console.warn('Failed to open pinned document:', error);
                this.clearPin();
            }
        }

        // Check active editor
        if (!targetDocument) {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.languageId === 'markdown') {
                targetDocument = activeEditor.document;
            }
        }

        // If no target document yet, try to keep current preview or fallback to README.md
        if (!targetDocument) {
            // Try to keep current preview if exists
            if (this._currentPreviewUri) {
                try {
                    targetDocument = await vscode.workspace.openTextDocument(this._currentPreviewUri);
                    console.log('Keeping current preview');
                } catch (error) {
                    console.warn('Failed to keep current preview:', error);
                    this._currentPreviewUri = undefined;
                }
            }

            // If still no target, try to load README.md
            if (!targetDocument) {
                targetDocument = await this.findReadmeDocument();
                if (!targetDocument) {
                    console.log('No markdown document to preview');
                    this.setCanPin(false);
                    this.setCanEdit(false);
                    this.renderEmptyState();
                    return;
                }
            }
        }

        if (targetDocument.languageId !== 'markdown') {
            console.log('Document is not markdown:', targetDocument.languageId);

            // Keep current preview if exists
            if (this._currentPreviewUri) {
                try {
                    targetDocument = await vscode.workspace.openTextDocument(this._currentPreviewUri);
                    console.log('Keeping current preview (non-markdown active)');
                } catch (error) {
                    console.warn('Failed to keep current preview:', error);

                    // Try to load README.md as fallback
                    const readmeDoc = await this.findReadmeDocument();
                    if (readmeDoc) {
                        targetDocument = readmeDoc;
                    } else {
                        if (this._isPinned) {
                            this.clearPin();
                        }
                        this.setCanPin(false);
                        this.setCanEdit(false);
                        this.renderEmptyState();
                        return;
                    }
                }
            } else {
                // Try to load README.md as fallback
                const readmeDoc = await this.findReadmeDocument();
                if (readmeDoc) {
                    targetDocument = readmeDoc;
                } else {
                    if (this._isPinned) {
                        this.clearPin();
                    }
                    this.setCanPin(false);
                    this.setCanEdit(false);
                    this.renderEmptyState();
                    return;
                }
            }
        }

        console.log('Updating markdown preview');
        const fileName = path.basename(targetDocument.fileName) || 'Untitled';
        if (this._isPinned) {
            this._pinnedFileName = fileName;
        }
        this.updateViewTitle(fileName);

        // Check if document has changed to reset scroll position
        const isDocumentChanged = this._currentPreviewUri?.toString() !== targetDocument.uri.toString();
        this._currentPreviewUri = targetDocument.uri;
        this.updateEditAvailability(targetDocument.uri);

        this._view.webview.options = {
            enableScripts: true,
            localResourceRoots: this.getLocalResourceRoots(targetDocument.uri)
        };

        const markdownContent = targetDocument.getText();
        const env: MarkdownRenderEnv = {
            webview: this._view.webview,
            documentUri: targetDocument.uri
        };
        const htmlContent = this._md.render(markdownContent, env);
        const headings = this.extractHeadings(markdownContent);
        const relativePath = this.getRelativeFilePath(targetDocument.uri);
        const isOpenInEditor = this.isFileOpenInEditor(targetDocument.uri);
        const fileIcon = isOpenInEditor ? '📝' : '📄';
        this.setCanPin(true);
        this._view.webview.html = this.getWebviewContent(this._view.webview, htmlContent, relativePath, fileIcon, headings);

        // Reset scroll position if document has changed
        if (isDocumentChanged) {
            // Use setTimeout to ensure the HTML is updated before sending the message
            setTimeout(() => {
                this._view?.webview.postMessage({ command: 'resetScroll' });
            }, 100);
        }
    }

    public async navigateToNextFile(): Promise<void> {
        // Invalidate cache to get latest directory state
        this.invalidateFileListCache();

        // Get current URI
        const currentUri = this._currentPreviewUri ?? vscode.window.activeTextEditor?.document.uri;
        if (!currentUri) {
            return;
        }

        // Get file list
        const files = await this.getMarkdownFilesInDirectory(currentUri);
        if (files.length <= 1) {
            return;
        }

        // Get current index
        const currentIndex = this.getCurrentFileIndex(files, currentUri);
        if (currentIndex === -1) {
            // Fallback to first file
            const dirUri = vscode.Uri.joinPath(currentUri, '..');
            const nextUri = vscode.Uri.joinPath(dirUri, files[0]);
            await this.updatePreviewWithUri(nextUri);
            // Update pin target if pinned
            if (this._isPinned) {
                this._pinnedUri = nextUri;
                this._pinnedFileName = path.basename(nextUri.fsPath);
            }
            const fileName = path.basename(nextUri.fsPath);
            void vscode.window.showInformationMessage(`Switched preview to ${fileName}`);
            return;
        }

        // Check if next index is valid
        if (currentIndex >= files.length - 1) {
            void vscode.window.showInformationMessage('Already at the last markdown file');
            return;
        }

        // Navigate to next file
        const dirUri = vscode.Uri.joinPath(currentUri, '..');
        const nextUri = vscode.Uri.joinPath(dirUri, files[currentIndex + 1]);
        await this.updatePreviewWithUri(nextUri);
        // Update pin target if pinned
        if (this._isPinned) {
            this._pinnedUri = nextUri;
            this._pinnedFileName = path.basename(nextUri.fsPath);
        }
        const fileName = path.basename(nextUri.fsPath);
        void vscode.window.showInformationMessage(`Switched preview to ${fileName}`);
    }

    public async navigateToPreviousFile(): Promise<void> {
        // Invalidate cache to get latest directory state
        this.invalidateFileListCache();

        // Get current URI
        const currentUri = this._currentPreviewUri ?? vscode.window.activeTextEditor?.document.uri;
        if (!currentUri) {
            return;
        }

        // Get file list
        const files = await this.getMarkdownFilesInDirectory(currentUri);
        if (files.length <= 1) {
            return;
        }

        // Get current index
        const currentIndex = this.getCurrentFileIndex(files, currentUri);
        if (currentIndex === -1) {
            // Fallback to first file
            const dirUri = vscode.Uri.joinPath(currentUri, '..');
            const prevUri = vscode.Uri.joinPath(dirUri, files[0]);
            await this.updatePreviewWithUri(prevUri);
            // Update pin target if pinned
            if (this._isPinned) {
                this._pinnedUri = prevUri;
                this._pinnedFileName = path.basename(prevUri.fsPath);
            }
            const fileName = path.basename(prevUri.fsPath);
            void vscode.window.showInformationMessage(`Switched preview to ${fileName}`);
            return;
        }

        // Check if previous index is valid
        if (currentIndex <= 0) {
            void vscode.window.showInformationMessage('Already at the first markdown file');
            return;
        }

        // Navigate to previous file
        const dirUri = vscode.Uri.joinPath(currentUri, '..');
        const prevUri = vscode.Uri.joinPath(dirUri, files[currentIndex - 1]);
        await this.updatePreviewWithUri(prevUri);
        // Update pin target if pinned
        if (this._isPinned) {
            this._pinnedUri = prevUri;
            this._pinnedFileName = path.basename(prevUri.fsPath);
        }
        const fileName = path.basename(prevUri.fsPath);
        void vscode.window.showInformationMessage(`Switched preview to ${fileName}`);
    }

    private async updatePreviewWithUri(uri: vscode.Uri): Promise<void> {
        try {
            await this.updatePreview(uri);
        } catch (error) {
            console.error('Failed to open document:', error);
            void vscode.window.showErrorMessage('Failed to open file');
        }
    }

    public async togglePin(): Promise<void> {
        if (this._isPinned) {
            await this.unpin();
            return;
        }

        await this.pin();
    }

    public isPinnedDocument(uri: vscode.Uri): boolean {
        return this._isPinned && !!this._pinnedUri && this._pinnedUri.toString() === uri.toString();
    }

    public async pin(): Promise<void> {
        if (!this._currentPreviewUri) {
            void vscode.window.showInformationMessage('Pinning is only available for Markdown files.');
            return;
        }

        this._isPinned = true;
        this._pinnedUri = this._currentPreviewUri;
        this._pinnedFileName = path.basename(this._currentPreviewUri.fsPath);
        this.updatePinContext();
        void vscode.window.showInformationMessage(`Pinned preview to ${this._pinnedFileName}`);
        await this.updatePreview();
    }

    public async unpin(): Promise<void> {
        if (!this._isPinned) {
            return;
        }

        this.clearPin();
        void vscode.window.showInformationMessage('Unpinned preview');
        await this.updatePreview();
    }

    private clearPin(): void {
        if (!this._isPinned && !this._pinnedUri) {
            return;
        }
        this._isPinned = false;
        this._pinnedUri = undefined;
        this._pinnedFileName = undefined;
        this._currentPreviewUri = undefined;
        this.setCanEdit(false);
        this.updatePinContext();
    }

    private updatePinContext(): void {
        void vscode.commands.executeCommand('setContext', 'markdownPreview:isPinned', this._isPinned);
    }

    private setCanPin(value: boolean): void {
        if (this._canPin === value) {
            return;
        }
        this._canPin = value;
        this.updateCanPinContext();
    }

    private updateCanPinContext(): void {
        void vscode.commands.executeCommand('setContext', 'markdownPreview:canPin', this._canPin);
    }

    private setCanEdit(value: boolean): void {
        if (this._canEdit === value) {
            return;
        }
        this._canEdit = value;
        this.updateCanEditContext();
    }

    private updateCanEditContext(): void {
        void vscode.commands.executeCommand('setContext', 'markdownPreview:canEdit', this._canEdit);
    }

    private updateEditAvailability(targetDocumentUri?: vscode.Uri): void {
        if (!targetDocumentUri) {
            this.setCanEdit(false);
            return;
        }

        // Always enable edit command when a document is being previewed
        this.setCanEdit(true);
    }

    private renderEmptyState(): void {
        if (!this._view) {
            return;
        }
        this.updateViewTitle();
        this._view.webview.options = {
            enableScripts: true,
            localResourceRoots: this.getLocalResourceRoots()
        };
        this.setCanPin(false);
        this.setCanEdit(false);
        this._currentPreviewUri = undefined;
        this._view.webview.html = this.getEmptyHtml(this._view.webview);
    }

    private applyZoomChange(targetZoom: number, fromConfig = false): void {
        const clamped = this.clampZoom(targetZoom);
        if (!fromConfig && this._zoomLevel === clamped) {
            return;
        }
        this._zoomLevel = clamped;

        // Persist the zoom setting when not triggered by a configuration change event
        if (!fromConfig) {
            void this.saveZoomLevel(clamped);
        }

        void this.updatePreview();
    }

    private async saveZoomLevel(zoomLevel: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('markdownPreview');
        await config.update('defaultZoomLevel', zoomLevel, vscode.ConfigurationTarget.Global);
    }

    private clampZoom(value: number): number {
        if (Number.isNaN(value)) {
            return this.getDefaultZoomLevel();
        }
        return Math.max(this._minZoom, Math.min(this._maxZoom, value));
    }

    private setTheme(theme: PreviewTheme): void {
        if (this._theme === theme) {
            return;
        }
        this._theme = theme;
        this.updateThemeContext();
        void this.updatePreview();
    }

    private getInitialTheme(): PreviewTheme {
        // Resolve effective theme via ThemeManager
        return this._themeManager.resolveEffectiveTheme();
    }
    private applyTheme(theme: EffectiveTheme): void {
        this._theme = theme;
        this.updateThemeContext();
        void this.updatePreview();
    }

    private updateThemeContext(): void {
        void vscode.commands.executeCommand('setContext', 'markdownPreview:isDarkTheme', this._theme === 'dark');
    }

    private getThemeClass(): string {
        return this._theme === 'dark' ? 'theme-dark' : 'theme-light';
    }

    private getMermaidTheme(): string {
        return this._theme === 'dark' ? 'dark' : 'default';
    }

    private convertMermaidBlocks(html: string): string {
        return html.replace(
            /<code class="language-mermaid">([\s\S]*?)<\/code>/g,
            '<div class="mermaid">$1</div>'
        );
    }

    private getDefaultZoomLevel(): number {
        const config = vscode.workspace.getConfiguration('markdownPreview');
        const defaultZoom = config.get<number>('defaultZoomLevel', 100);
        return Math.max(this._minZoom, Math.min(this._maxZoom, defaultZoom));
    }

    public async edit(): Promise<void> {
        if (!this._currentPreviewUri) {
            void vscode.window.showInformationMessage('No Markdown preview available to edit.');
            return;
        }

        try {
            const document = await vscode.workspace.openTextDocument(this._currentPreviewUri);
            await vscode.window.showTextDocument(document, { preview: false });
            const fileName = path.basename(this._currentPreviewUri.fsPath);
            void vscode.window.showInformationMessage(`Opened ${fileName} in editor`);
        } catch (error) {
            console.warn('Failed to open document for editing:', error);
            void vscode.window.showErrorMessage('Unable to open the Markdown document for editing.');
        }
    }

    private updateViewTitle(fileName?: string): void {
        if (!this._view) {
            return;
        }

        if (this._isPinned) {
            const label = fileName ?? this._pinnedFileName ?? '';
            this._view.title = label;
            return;
        }

        const label = fileName ?? '';
        this._view.title = label;
    }

    private resolveImageSource(src: string, env: MarkdownRenderEnv): string | undefined {
        const webview = env.webview;
        const documentUri = env.documentUri;

        if (!webview || !documentUri) {
            return undefined;
        }

        if (/^(https?:|data:)/i.test(src)) {
            return src;
        }

        if (/^file:/i.test(src)) {
            try {
                const fileUri = vscode.Uri.parse(src);
                if (fileUri.scheme === 'file') {
                    return webview.asWebviewUri(fileUri).toString();
                }
            } catch (error) {
                console.warn('Failed to parse file URI for image src:', error);
                return src;
            }
        }

        if (documentUri.scheme !== 'file') {
            return src;
        }

        const fragmentSplit = src.split('#');
        const pathWithQuery = fragmentSplit.shift() ?? '';
        const fragment = fragmentSplit.length > 0 ? '#' + fragmentSplit.join('#') : '';

        const querySplit = pathWithQuery.split('?');
        const relativePath = querySplit.shift() ?? '';
        const query = querySplit.length > 0 ? '?' + querySplit.join('?') : '';

        if (!relativePath) {
            return src;
        }

        const docDir = path.dirname(documentUri.fsPath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);

        const ensureWorkspacePath = (inputPath: string): string | undefined => {
            if (!workspaceFolder) {
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    return undefined;
                }
                return path.join(workspaceFolders[0].uri.fsPath, inputPath);
            }
            return path.join(workspaceFolder.uri.fsPath, inputPath);
        };

        const normalizedRelativePath = relativePath.replace(/^[/\\]+/, '');

        let diskPath: string | undefined;
        if (relativePath.startsWith('/') || relativePath.startsWith('\\')) {
            diskPath = ensureWorkspacePath(normalizedRelativePath);
        }

        if (!diskPath) {
            diskPath = path.isAbsolute(relativePath)
                ? relativePath
                : path.resolve(docDir, relativePath);
        }

        if (!diskPath) {
            return src;
        }

        const fileUri = vscode.Uri.file(diskPath);
        const webviewUri = webview.asWebviewUri(fileUri).toString();

        return `${webviewUri}${query}${fragment}`;
    }

    private getLocalResourceRoots(documentUri?: vscode.Uri): vscode.Uri[] {
        const roots = [this._extensionUri];
        const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
        for (const folder of workspaceFolders) {
            roots.push(folder.uri);
        }
        if (documentUri?.scheme === 'file') {
            roots.push(vscode.Uri.file(path.dirname(documentUri.fsPath)));
        }
        return roots;
    }

    private getWebviewContent(webview: vscode.Webview, htmlContent: string, relativePath: string, fileIcon: string, headings: HeadingInfo[]): string {
        const themeClass = this.getThemeClass();
        const colorScheme = this._theme === 'dark' ? 'dark' : 'light';
        const fontSize = Math.max(this._minZoom, Math.min(this._maxZoom, this._zoomLevel)) / 100;
        const mermaidTheme = this.getMermaidTheme();
        const convertedHtml = this.convertMermaidBlocks(htmlContent);
        const headingsJson = JSON.stringify(headings);
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: http: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} https://cdn.jsdelivr.net 'unsafe-inline'; font-src ${webview.cspSource} data:;">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
    <title>Markdown Preview</title>
    <style>
        :root {
            color-scheme: ${colorScheme};
        }

        body.theme-light {
            --md-background: #ffffff;
            --md-foreground: #1e1e1e;
            --md-heading-border: #d0d4d9;
            --md-code-background: #f5f7fa;
            --md-code-foreground: #1e1e1e;
            --md-quote-border: #c8ccd0;
            --md-quote-background: #f0f3f6;
            --md-table-border: #d0d4d9;
            --md-table-header-background: #f5f7fa;
            --md-link: #115ea3;
            --file-path-background: #f5f7fa;
            --file-path-foreground: #1e1e1e;
            --file-path-border: #d0d4d9;
        }

        body.theme-dark {
            --md-background: #1e1e1e;
            --md-foreground: #d4d4d4;
            --md-heading-border: #303030;
            --md-code-background: #252526;
            --md-code-foreground: #dcdcdc;
            --md-quote-border: #3f3f46;
            --md-quote-background: #252526;
            --md-table-border: #3f3f46;
            --md-table-header-background: #2d2d2d;
            --md-link: #3794ff;
            --file-path-background: #252526;
            --file-path-foreground: #d4d4d4;
            --file-path-border: #3f3f46;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--md-foreground);
            background-color: var(--md-background);
            padding: 16px;
            margin: 0;
            font-size: ${fontSize}em;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: var(--md-foreground);
            margin-bottom: 16px;
            scroll-margin-top: 70px;
        }

        h1 {
            margin-top: 32px;
            border-bottom: 1px solid var(--md-heading-border);
        }

        h1:first-child {
            margin-top: 0;
        }

        h2 {
            margin-top: 28px;
            border-bottom: 1px solid var(--md-heading-border);
        }

        h3 {
            margin-top: 24px;
        }

        h4, h5, h6 {
            margin-top: 20px;
        }

        hr {
            margin-top: 28px;
            margin-bottom: 28px;
            border: none;
            border-top: 1px solid var(--md-heading-border);
        }
        
        code {
            background-color: var(--md-code-background);
            color: var(--md-code-foreground);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
        
        pre {
            background-color: var(--md-code-background);
            color: var(--md-code-foreground);
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            white-space: pre;
        }

        pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            white-space: pre;
        }

        blockquote {
            border-left: 4px solid var(--md-quote-border);
            background-color: var(--md-quote-background);
            margin: 16px 0;
            padding: 8px 16px;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        
        th, td {
            border: 1px solid var(--md-table-border);
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: var(--md-table-header-background);
            font-weight: bold;
        }
        
        a {
            color: var(--md-link);
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        img {
            max-width: 100%;
            height: auto;
        }
        
        ul, ol {
            padding-left: 24px;
        }

        li {
            margin: 4px 0;
        }

        .file-path-header {
            position: sticky;
            top: 0;
            background-color: var(--file-path-background);
            border-bottom: 1px solid var(--file-path-border);
            padding: 8px 16px;
            margin: -16px -16px 16px -16px;
            font-size: 0.9em;
            z-index: 100;
        }

        .file-path {
            color: var(--file-path-foreground);
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.95em;
        }

        .file-path-label {
            margin-right: 8px;
        }

        .toc-container {
            position: fixed;
            top: 60px;
            right: 16px;
            max-width: 300px;
            max-height: calc(100vh - 80px);
            overflow-y: auto;
            background-color: var(--file-path-background);
            border: 1px solid var(--file-path-border);
            border-radius: 6px;
            padding: 12px;
            z-index: 99;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        body.theme-dark .toc-container {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .toc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--file-path-border);
        }

        .toc-title {
            font-weight: bold;
            font-size: 0.9em;
            color: var(--md-foreground);
        }

        .toc-toggle {
            cursor: pointer;
            background: none;
            border: none;
            color: var(--md-foreground);
            font-size: 1em;
            padding: 0;
            line-height: 1;
        }

        .toc-toggle:hover {
            opacity: 0.7;
        }

        .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .toc-item {
            margin: 4px 0;
        }

        .toc-link {
            display: block;
            color: var(--md-link);
            text-decoration: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            line-height: 1.4;
            cursor: pointer;
        }

        .toc-link:hover {
            background-color: var(--md-code-background);
        }

        .toc-item.level-1 .toc-link {
            padding-left: 8px;
            font-weight: 600;
        }

        .toc-item.level-2 .toc-link {
            padding-left: 16px;
        }

        .toc-item.level-3 .toc-link {
            padding-left: 24px;
        }

        .toc-item.level-4 .toc-link {
            padding-left: 32px;
        }

        .toc-item.level-5 .toc-link {
            padding-left: 40px;
        }

        .toc-item.level-6 .toc-link {
            padding-left: 48px;
        }

        .toc-container.collapsed .toc-list {
            display: none;
        }

        .toc-container::-webkit-scrollbar {
            width: 8px;
        }

        .toc-container::-webkit-scrollbar-track {
            background: transparent;
        }

        .toc-container::-webkit-scrollbar-thumb {
            background: var(--md-quote-border);
            border-radius: 4px;
        }

        .toc-container::-webkit-scrollbar-thumb:hover {
            background: var(--md-heading-border);
        }
    </style>
    <script>
        const vscode = acquireVsCodeApi();

        mermaid.initialize({
            startOnLoad: true,
            theme: '${mermaidTheme}'
        });

        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'resetScroll') {
                window.scrollTo(0, 0);
            }
        });

        // Initialize table of contents
        const headings = ${headingsJson};

        function initTableOfContents() {
            const tocContainer = document.getElementById('toc-container');
            const tocList = document.getElementById('toc-list');
            const tocToggle = document.getElementById('toc-toggle');

            if (!tocContainer || !tocList || !tocToggle) {
                return;
            }

            // Hide TOC if no headings
            if (headings.length === 0) {
                tocContainer.style.display = 'none';
                return;
            }

            // Generate TOC items
            headings.forEach(heading => {
                const li = document.createElement('li');
                li.className = 'toc-item level-' + heading.level;

                const link = document.createElement('a');
                link.className = 'toc-link';
                link.textContent = heading.text;
                link.href = '#' + heading.id;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(heading.id);
                    if (target) {
                        // CSS scroll-margin-top will automatically handle the offset
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });

                li.appendChild(link);
                tocList.appendChild(li);
            });

            // Toggle TOC collapse/expand
            tocToggle.addEventListener('click', () => {
                tocContainer.classList.toggle('collapsed');
                tocToggle.textContent = tocContainer.classList.contains('collapsed') ? '▶' : '▼';
            });
        }

        // Initialize TOC when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTableOfContents);
        } else {
            initTableOfContents();
        }

        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                vscode.postMessage({ command: 'navigateNext' });
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                vscode.postMessage({ command: 'navigatePrevious' });
            } else if (event.key === 'p') {
                event.preventDefault();
                vscode.postMessage({ command: 'togglePin' });
            } else if (event.key === 'e') {
                event.preventDefault();
                vscode.postMessage({ command: 'edit' });
            } else if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                vscode.postMessage({ command: 'zoomIn' });
            } else if (event.key === '-' || event.key === '_') {
                event.preventDefault();
                vscode.postMessage({ command: 'zoomOut' });
            } else if (event.key === 'r') {
                event.preventDefault();
                vscode.postMessage({ command: 'refresh' });
            } else if (event.key === 't') {
                event.preventDefault();
                const tocContainer = document.getElementById('toc-container');
                const tocToggle = document.getElementById('toc-toggle');
                if (tocContainer && tocToggle) {
                    tocContainer.classList.toggle('collapsed');
                    tocToggle.textContent = tocContainer.classList.contains('collapsed') ? '▶' : '▼';
                }
            }
        });
    </script>
</head>
<body class="${themeClass}">
    <div class="file-path-header">
        <span class="file-path-label">${fileIcon}</span>
        <code class="file-path">${relativePath}</code>
    </div>
    <div id="toc-container" class="toc-container">
        <div class="toc-header">
            <span class="toc-title">Table of Contents</span>
            <button id="toc-toggle" class="toc-toggle" title="Toggle Table of Contents [t]">▼</button>
        </div>
        <ul id="toc-list" class="toc-list"></ul>
    </div>
    ${convertedHtml}
</body>
</html>`;
    }

    private getEmptyHtml(webview: vscode.Webview): string {
        const themeClass = this.getThemeClass();
        const colorScheme = this._theme === 'dark' ? 'dark' : 'light';
        const fontSize = Math.max(this._minZoom, Math.min(this._maxZoom, this._zoomLevel)) / 100;
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: http: data:; style-src ${webview.cspSource} 'unsafe-inline';">
    <title>Markdown Preview</title>
    <style>
        :root {
            color-scheme: ${colorScheme};
        }

        body.theme-light {
            --md-background: #ffffff;
            --md-foreground: #4a5568;
        }

        body.theme-dark {
            --md-background: #1e1e1e;
            --md-foreground: #a0aec0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--md-foreground);
            background-color: var(--md-background);
            padding: 16px;
            margin: 0;
            text-align: center;
            font-size: ${fontSize}em;
        }
    </style>
</head>
<body class="${themeClass}">
    <p>Open a Markdown file to display the preview.</p>
</body>
</html>`;
    }

    private async getMarkdownFilesInDirectory(uri: vscode.Uri): Promise<string[]> {
        try {
            // Calculate directory URI
            const dirUri = vscode.Uri.joinPath(uri, '..');
            const dirUriString = dirUri.toString();

            // Check cache
            if (this._fileListCache?.dirUri === dirUriString) {
                return this._fileListCache.files;
            }

            // Read directory
            const entries = await vscode.workspace.fs.readDirectory(dirUri);

            // Filter and sort markdown files
            const files = entries
                .filter(([name, type]) =>
                    type === vscode.FileType.File &&
                    (name.endsWith('.md') || name.endsWith('.markdown')) &&
                    !name.startsWith('.')
                )
                .map(([name]) => name)
                .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

            // Update cache
            this._fileListCache = { dirUri: dirUriString, files };

            return files;
        } catch (error) {
            console.error('Failed to read directory for markdown files:', error);
            void vscode.window.showErrorMessage('Failed to get file list');
            return [];
        }
    }

    private getCurrentFileIndex(files: string[], currentUri: vscode.Uri): number {
        const fileName = path.basename(currentUri.fsPath);
        return files.findIndex(file => file === fileName);
    }

    public invalidateFileListCache(): void {
        this._fileListCache = undefined;
    }

    private getRelativeFilePath(documentUri: vscode.Uri): string {
        // Handle non-file schemes
        if (documentUri.scheme !== 'file') {
            return path.basename(documentUri.fsPath);
        }

        // Get workspace folder
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
        if (!workspaceFolder) {
            // Fallback to just the filename
            return path.basename(documentUri.fsPath);
        }

        // Calculate relative path
        const relativePath = path.relative(
            workspaceFolder.uri.fsPath,
            documentUri.fsPath
        );

        return relativePath;
    }

    private extractHeadings(markdownContent: string): HeadingInfo[] {
        const headings: HeadingInfo[] = [];
        const tokens = this._md.parse(markdownContent, {});

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === 'heading_open') {
                const level = parseInt(token.tag.substring(1), 10);
                // Only include h1, h2, and h3 headings in TOC
                if (level <= 3) {
                    const contentToken = tokens[i + 1];
                    if (contentToken && contentToken.type === 'inline' && contentToken.content) {
                        const text = contentToken.content;
                        const id = token.attrGet('id') || this.slugify(text);
                        headings.push({ level, text, id });
                    }
                }
            }
        }

        return headings;
    }

    private slugify(text: string): string {
        return encodeURIComponent(String(text).trim().toLowerCase().replace(/\s+/g, '-'));
    }

    private isFileOpenInEditor(uri: vscode.Uri): boolean {
        // Check if the file is open in any visible text editor
        const openEditors = vscode.window.visibleTextEditors;
        return openEditors.some(editor => editor.document.uri.toString() === uri.toString());
    }

    private async findReadmeDocument(): Promise<vscode.TextDocument | undefined> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }

        // Try to find README.md in the first workspace folder
        const workspaceRoot = workspaceFolders[0].uri;
        const readmeVariants = ['README.md', 'readme.md', 'Readme.md', 'README.MD'];

        for (const variant of readmeVariants) {
            try {
                const readmeUri = vscode.Uri.joinPath(workspaceRoot, variant);
                const document = await vscode.workspace.openTextDocument(readmeUri);
                if (document.languageId === 'markdown') {
                    console.log(`Found README at ${variant}`);
                    return document;
                }
            } catch (error) {
                // File doesn't exist, try next variant
                continue;
            }
        }

        console.log('No README.md found in workspace root');
        return undefined;
    }
}
