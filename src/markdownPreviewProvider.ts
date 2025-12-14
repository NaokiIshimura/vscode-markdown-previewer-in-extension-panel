import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
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

interface FileListInfo {
    files: string[];
    currentIndex: number;
    currentFile: string;
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
    private _sidebarVisible = false;
    private _sidebarActiveTab: 'headings' | 'files' | 'help' = 'headings';

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _themeManager: ThemeManager
    ) {
        this._zoomLevel = this.getDefaultZoomLevel();
        this._md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
            highlight: (code: string, lang: string) => this.highlightCodeBlock(code, lang)
        });

        const defaultFenceRenderer = this._md.renderer.rules.fence ?? ((tokens, idx, options, env, self) => {
            return self.renderToken(tokens, idx, options);
        });

        this._md.renderer.rules.fence = (tokens, idx, options, env, self) => {
            tokens[idx].attrJoin('class', 'hljs');
            return defaultFenceRenderer(tokens, idx, options, env, self);
        };

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
                case 'resetZoom':
                    this.resetZoom();
                    break;
                case 'toggleTheme':
                    this.toggleTheme();
                    break;
                case 'refresh':
                    this.refresh();
                    break;
                case 'showSearch':
                    // Search is handled in webview
                    break;
                case 'copySuccess':
                    vscode.window.showInformationMessage(
                        `Copied file path: ${message.filePath}`
                    );
                    break;
                case 'copyFailed':
                    vscode.window.showErrorMessage(
                        `Failed to copy file path: ${message.error}`
                    );
                    break;
                case 'quoteSuccess':
                    vscode.window.showInformationMessage('Copied as quote');
                    break;
                case 'quoteFailed':
                    vscode.window.showErrorMessage(
                        `Failed to copy as quote: ${message.error}`
                    );
                    break;
                case 'quoteNoSelection':
                    vscode.window.showInformationMessage('Select text to copy as quote');
                    break;
                case 'copySelectionSuccess':
                    vscode.window.showInformationMessage('Copied');
                    break;
                case 'copySelectionFailed':
                    vscode.window.showErrorMessage(
                        `Failed to copy: ${message.error}`
                    );
                    break;
                case 'copyNoSelection':
                    vscode.window.showInformationMessage('Select text to copy');
                    break;
                case 'navigateToFile':
                    void this.navigateToFileByName(message.fileName);
                    break;
                case 'saveMermaidPng':
                    void this.saveMermaidPng(message.data);
                    break;
                case 'sidebarStateChanged':
                    this._sidebarVisible = message.visible;
                    this._sidebarActiveTab = message.activeTab;
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

    public showSearch(): void {
        if (!this._view) {
            return;
        }
        this._view.webview.postMessage({ command: 'showSearch' });
    }

    public useLightTheme(): void {
        this.setTheme('light');
    }

    public useDarkTheme(): void {
        this.setTheme('dark');
    }

    public toggleTheme(): void {
        const newTheme = this._theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        void vscode.window.showInformationMessage(`Theme: ${newTheme === 'light' ? 'Light' : 'Dark'}`);
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
        this.applyZoomChange(100);
        void vscode.window.showInformationMessage('Zoom: 100%');
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
        const fileList = await this.getMarkdownFilesInDirectory(targetDocument.uri);
        const currentFileName = path.basename(targetDocument.uri.fsPath);
        this.setCanPin(true);
        this._view.webview.html = this.getWebviewContent(this._view.webview, htmlContent, relativePath, fileIcon, headings, fileList, currentFileName);

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

    public async navigateToFileByName(fileName: string): Promise<void> {
        // Invalidate cache to get latest directory state
        this.invalidateFileListCache();

        // Get current URI
        const currentUri = this._currentPreviewUri ?? vscode.window.activeTextEditor?.document.uri;
        if (!currentUri) {
            return;
        }

        // Get file list
        const files = await this.getMarkdownFilesInDirectory(currentUri);
        if (!files.includes(fileName)) {
            void vscode.window.showErrorMessage(`File not found: ${fileName}`);
            return;
        }

        // Navigate to selected file
        const dirUri = vscode.Uri.joinPath(currentUri, '..');
        const targetUri = vscode.Uri.joinPath(dirUri, fileName);
        await this.updatePreviewWithUri(targetUri);
        // Update pin target if pinned
        if (this._isPinned) {
            this._pinnedUri = targetUri;
            this._pinnedFileName = fileName;
        }
        void vscode.window.showInformationMessage(`Switched preview to ${fileName}`);
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
        // Match code blocks with language-mermaid class (may have additional classes like hljs)
        return html.replace(
            /<pre><code class="[^"]*language-mermaid[^"]*">([\s\S]*?)<\/code><\/pre>/g,
            (_match, code) => {
                // Decode HTML entities for the data attribute
                const decodedCode = code
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");
                // Encode for safe HTML attribute storage
                const encodedCode = Buffer.from(decodedCode).toString('base64');
                return `<div class="mermaid-wrapper"><div class="mermaid" data-mermaid-source="${encodedCode}">${code}</div><div class="mermaid-toolbar"><button class="mermaid-copy-button" title="Copy Mermaid code">Copy</button><button class="mermaid-save-button" title="Save as PNG">Save</button></div></div>`;
            }
        );
    }

    private highlightCodeBlock(code: string, lang: string): string {
        const normalizedLang = (lang ?? '').trim().split(/\s+/)[0].toLowerCase();

        // Skip highlighting for mermaid blocks - they will be handled by mermaid.js
        if (normalizedLang === 'mermaid') {
            return '';
        }

        if (normalizedLang && hljs.getLanguage(normalizedLang)) {
            try {
                const result = hljs.highlight(code, {
                    language: normalizedLang,
                    ignoreIllegals: true
                });
                return result.value;
            } catch {
                // Fallback to escaped HTML when highlighting fails
                return this._md.utils.escapeHtml(code);
            }
        }

        return this._md.utils.escapeHtml(code);
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

    public async saveMermaidPng(base64Data: string): Promise<void> {
        try {
            const homeDir = process.env.HOME || process.env.USERPROFILE || '';
            const downloadsPath = path.join(homeDir, 'Downloads', 'mermaid-diagram.png');
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(downloadsPath),
                filters: {
                    'PNG Image': ['png']
                }
            });

            if (uri) {
                const data = Buffer.from(base64Data, 'base64');
                await vscode.workspace.fs.writeFile(uri, data);
                void vscode.window.showInformationMessage(`Saved: ${path.basename(uri.fsPath)}`);
            }
        } catch (error) {
            console.warn('Failed to save Mermaid PNG:', error);
            void vscode.window.showErrorMessage('Failed to save the diagram.');
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

    private getWebviewContent(webview: vscode.Webview, htmlContent: string, relativePath: string, fileIcon: string, headings: HeadingInfo[], fileList: string[], currentFileName: string): string {
        const themeClass = this.getThemeClass();
        const colorScheme = this._theme === 'dark' ? 'dark' : 'light';
        const fontSize = Math.max(this._minZoom, Math.min(this._maxZoom, this._zoomLevel)) / 100;
        const mermaidTheme = this.getMermaidTheme();
        const convertedHtml = this.convertMermaidBlocks(htmlContent);
        const headingsJson = JSON.stringify(headings);
        const fileListJson = JSON.stringify(fileList);
        const currentFileNameJson = JSON.stringify(currentFileName);
        const sidebarVisibleJson = JSON.stringify(this._sidebarVisible);
        const sidebarActiveTabJson = JSON.stringify(this._sidebarActiveTab);
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: http: data: blob:; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} https://cdn.jsdelivr.net 'unsafe-inline'; font-src ${webview.cspSource} data:;">
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
            --hljs-comment: #6a737d;
            --hljs-keyword: #d73a49;
            --hljs-number: #005cc5;
            --hljs-string: #22863a;
            --hljs-title: #6f42c1;
            --hljs-meta: #b08800;
            --scrollbar-track: #eff2f6;
            --scrollbar-thumb: #c5c9cf;
            --scrollbar-thumb-hover: #aeb3bb;
            --copy-button-background: rgba(255, 255, 255, 0.9);
            --copy-button-foreground: #1e1e1e;
            --copy-button-border: #cbd0d8;
            --copy-button-background-hover: #e7eaee;
            --copy-button-shadow: rgba(15, 23, 42, 0.1);
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
            --hljs-comment: #8b949e;
            --hljs-keyword: #ff7b72;
            --hljs-number: #a5d6ff;
            --hljs-string: #7ee787;
            --hljs-title: #d2a8ff;
            --hljs-meta: #e3b341;
            --scrollbar-track: #1c1c1c;
            --scrollbar-thumb: #3f3f46;
            --scrollbar-thumb-hover: #5f6570;
            --copy-button-background: rgba(37, 37, 38, 0.9);
            --copy-button-foreground: #d4d4d4;
            --copy-button-border: #3f3f46;
            --copy-button-background-hover: #2f2f31;
            --copy-button-shadow: rgba(0, 0, 0, 0.3);
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

        * {
            scrollbar-width: thin;
            scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
        }

        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--scrollbar-track);
        }

        ::-webkit-scrollbar-thumb {
            background-color: var(--scrollbar-thumb);
            border-radius: 8px;
            border: 2px solid var(--scrollbar-track);
        }

        ::-webkit-scrollbar-thumb:hover {
            background-color: var(--scrollbar-thumb-hover);
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
            font-size: 1em;
            line-height: 1.5;
            position: relative;
        }

        pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            white-space: pre;
        }

        pre code.hljs {
            display: block;
            overflow-x: auto;
        }

        .hljs {
            background-color: var(--md-code-background);
            color: var(--md-code-foreground);
        }

        .hljs-comment,
        .hljs-quote {
            color: var(--hljs-comment);
            font-style: italic;
        }

        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-literal,
        .hljs-section,
        .hljs-link,
        .hljs-deletion {
            color: var(--hljs-keyword);
        }

        .hljs-title,
        .hljs-title.class_,
        .hljs-class .hljs-title,
        .hljs-function .hljs-title {
            color: var(--hljs-title);
        }

        .hljs-string,
        .hljs-subst,
        .hljs-symbol,
        .hljs-addition,
        .hljs-doctag {
            color: var(--hljs-string);
        }

        .hljs-number,
        .hljs-attr,
        .hljs-attribute,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-bullet {
            color: var(--hljs-number);
        }

        .hljs-meta,
        .hljs-meta .hljs-keyword,
        .hljs-meta .hljs-string {
            color: var(--hljs-meta);
        }

        .hljs-emphasis {
            font-style: italic;
        }

        .hljs-strong {
            font-weight: 600;
        }

        .code-block-wrapper {
            position: relative;
            margin: 16px 0;
        }

        .code-block-wrapper pre {
            margin: 0;
        }

        .copy-code-button {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 8px;
            font-size: 12px;
            background-color: var(--copy-button-background);
            color: var(--copy-button-foreground);
            border: 1px solid var(--copy-button-border);
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease, background-color 0.2s ease;
            box-shadow: 0 2px 4px var(--copy-button-shadow);
        }

        .code-block-wrapper:hover .copy-code-button {
            opacity: 1;
        }

        .copy-code-button:hover {
            background-color: var(--copy-button-background-hover);
        }

        .copy-code-button:active {
            transform: scale(0.95);
        }

        /* Mermaid diagram wrapper and toolbar */
        .mermaid-wrapper {
            position: relative;
            margin: 16px 0;
        }

        .mermaid-toolbar {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .mermaid-wrapper:hover .mermaid-toolbar {
            opacity: 1;
        }

        .mermaid-copy-button,
        .mermaid-save-button {
            padding: 4px 8px;
            font-size: 12px;
            background-color: var(--copy-button-background);
            color: var(--copy-button-foreground);
            border: 1px solid var(--copy-button-border);
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            box-shadow: 0 2px 4px var(--copy-button-shadow);
        }

        .mermaid-copy-button:hover,
        .mermaid-save-button:hover {
            background-color: var(--copy-button-background-hover);
        }

        .mermaid-copy-button:active,
        .mermaid-save-button:active {
            transform: scale(0.95);
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .file-path-section {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1 1 auto;
            min-width: 0;
        }

        .file-path {
            color: var(--file-path-foreground);
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.95em;
        }

        .file-path-label {
            margin-right: 8px;
        }

        .file-path.clickable {
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            position: relative;
            padding-right: 22px;
        }

        .file-path.clickable:hover {
            background-color: var(--copy-button-background-hover);
            border-radius: 3px;
        }

        .file-path.clickable .copy-icon {
            display: inline-block;
            font-size: 0.85em;
            opacity: 0;
            margin-left: 4px;
            transition: opacity 0.2s;
        }

        .file-path.clickable:hover .copy-icon {
            opacity: 1;
        }

        .file-path.clickable.copied {
            color: var(--md-link);
        }

        .file-path.clickable.copied .copy-icon {
            opacity: 1;
        }

        .header-panels {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .file-path-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .search-section {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 0 1 auto;
            min-width: 300px;
            max-width: 500px;
        }

        .search-section.hidden {
            display: none;
        }

        .search-input {
            width: 160px;
            padding: 3px 6px;
            border: 1px solid var(--file-path-border);
            border-radius: 3px;
            background-color: var(--md-background);
            color: var(--md-foreground);
            font-size: 0.85em;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--md-link);
        }

        .search-input::placeholder {
            color: var(--hljs-comment);
        }

        .search-controls {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .search-results {
            font-size: 0.8em;
            color: var(--md-foreground);
            min-width: 50px;
            text-align: center;
        }

        .search-button {
            padding: 2px 6px;
            background-color: var(--copy-button-background);
            color: var(--copy-button-foreground);
            border: 1px solid var(--copy-button-border);
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.85em;
            line-height: 1;
        }

        .search-button:hover {
            background-color: var(--copy-button-background-hover);
        }

        .search-button:active {
            transform: scale(0.95);
        }

        .search-option {
            display: flex;
            align-items: center;
            gap: 2px;
            cursor: pointer;
            padding: 2px 4px;
            font-size: 0.8em;
        }

        .search-option input[type="checkbox"] {
            margin: 0;
            cursor: pointer;
        }

        mark.search-highlight {
            background-color: rgba(255, 255, 0, 0.3);
            color: inherit;
            padding: 1px 2px;
            border-radius: 2px;
        }

        body.theme-dark mark.search-highlight {
            background-color: rgba(255, 255, 0, 0.2);
        }

        mark.search-highlight-current {
            background-color: rgba(255, 165, 0, 0.5);
            font-weight: 600;
        }

        body.theme-dark mark.search-highlight-current {
            background-color: rgba(255, 165, 0, 0.4);
        }

        /* File List Panel Styles */
        .filelist-container {
            position: relative;
            background: transparent;
            border: none;
            padding: 0;
            margin-left: 8px;
        }

        .filelist-header {
            margin: 0;
            padding: 0;
            border: none;
            cursor: pointer;
        }

        .filelist-title {
            font-weight: bold;
            font-size: 0.9em;
            color: var(--md-foreground);
        }

        .filelist-dropdown {
            position: fixed;
            top: 45px;
            left: 16px;
            max-width: 300px;
            max-height: calc(100vh - 60px);
            overflow-y: auto;
            background-color: var(--file-path-background);
            border: 1px solid var(--file-path-border);
            border-radius: 6px;
            padding: 12px;
            z-index: 99;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: none;
        }

        .filelist-dropdown.show {
            display: block;
        }

        body.theme-dark .filelist-dropdown {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .filelist-info {
            font-size: 0.8em;
            color: var(--md-foreground);
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--file-path-border);
        }

        .filelist-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .filelist-item {
            margin: 2px 0;
        }

        .filelist-link {
            display: block;
            color: var(--md-foreground);
            text-decoration: none;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 0.85em;
            line-height: 1.4;
            cursor: pointer;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .filelist-link:hover {
            background-color: var(--md-code-background);
        }

        .filelist-item.current .filelist-link {
            background-color: var(--md-link);
            color: #ffffff;
            font-weight: 600;
        }

        .filelist-item.current .filelist-link:hover {
            background-color: var(--md-link);
            opacity: 0.9;
        }

        .filelist-item.selected .filelist-link {
            outline: 2px solid var(--md-link);
            outline-offset: -2px;
        }

        .filelist-item.selected:not(.current) .filelist-link {
            background-color: var(--md-code-background);
        }

        .filelist-dropdown::-webkit-scrollbar {
            width: 8px;
        }

        .filelist-dropdown::-webkit-scrollbar-track {
            background: transparent;
        }

        .filelist-dropdown::-webkit-scrollbar-thumb {
            background: var(--md-quote-border);
            border-radius: 4px;
        }

        .filelist-dropdown::-webkit-scrollbar-thumb:hover {
            background: var(--md-heading-border);
        }

        /* Sidebar Styles */
        .main-container {
            display: flex;
            flex-direction: row;
            min-height: calc(100vh - 60px);
        }

        .preview-content {
            flex: 1;
            min-width: 0;
            overflow-x: auto;
        }

        .sidebar {
            width: 220px;
            min-width: 220px;
            max-width: 220px;
            background-color: var(--file-path-background);
            border-left: 1px solid var(--file-path-border);
            display: none;
            flex-direction: column;
            overflow: hidden;
            position: sticky;
            top: 45px;
            height: calc(100vh - 60px);
            margin-right: -16px;
            margin-top: -16px;
            margin-bottom: -16px;
        }

        .sidebar.show {
            display: flex;
        }

        .sidebar-tabs {
            display: flex;
            border-bottom: 1px solid var(--file-path-border);
            background-color: var(--md-background);
        }

        .sidebar-tab {
            flex: 1;
            padding: 8px 12px;
            background: none;
            border: none;
            color: var(--md-foreground);
            font-size: 0.85em;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s, background-color 0.2s;
        }

        .sidebar-tab:hover {
            opacity: 0.8;
            background-color: var(--md-code-background);
        }

        .sidebar-tab.active {
            opacity: 1;
            font-weight: 600;
            border-bottom: 2px solid var(--md-link);
            margin-bottom: -1px;
        }

        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        .sidebar-panel {
            display: none;
        }

        .sidebar-panel.active {
            display: block;
        }

        .sidebar-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .sidebar-list-item {
            margin: 2px 0;
        }

        .sidebar-list-link {
            display: block;
            color: var(--md-foreground);
            text-decoration: none;
            padding: 6px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            line-height: 1.4;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .sidebar-list-link:hover {
            background-color: var(--md-code-background);
        }

        .sidebar-list-item.current .sidebar-list-link {
            background-color: var(--md-link);
            color: #ffffff;
            font-weight: 600;
        }

        .sidebar-list-item.selected .sidebar-list-link {
            outline: 2px solid var(--md-link);
            outline-offset: -2px;
        }

        .sidebar-list-item.selected:not(.current) .sidebar-list-link {
            background-color: var(--md-code-background);
        }

        /* Sidebar headings indentation */
        .sidebar-list-item.level-1 .sidebar-list-link {
            padding-left: 8px;
            font-weight: 600;
        }

        .sidebar-list-item.level-2 .sidebar-list-link {
            padding-left: 16px;
        }

        .sidebar-list-item.level-3 .sidebar-list-link {
            padding-left: 24px;
        }

        .sidebar-list-item.level-4 .sidebar-list-link {
            padding-left: 32px;
        }

        .sidebar-list-item.level-5 .sidebar-list-link {
            padding-left: 40px;
        }

        .sidebar-list-item.level-6 .sidebar-list-link {
            padding-left: 48px;
        }

        .sidebar-content::-webkit-scrollbar {
            width: 8px;
        }

        .sidebar-content::-webkit-scrollbar-track {
            background: transparent;
        }

        .sidebar-content::-webkit-scrollbar-thumb {
            background: var(--md-quote-border);
            border-radius: 4px;
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover {
            background: var(--md-heading-border);
        }

        .sidebar-toggle {
            background: none;
            border: none;
            color: var(--md-foreground);
            cursor: pointer;
            padding: 4px 8px;
            font-size: 0.9em;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .sidebar-toggle:hover {
            opacity: 1;
        }

        .sidebar-toggle.active {
            opacity: 1;
            color: var(--md-link);
        }

        /* Help Panel Styles */
        .help-content {
            padding: 8px;
            font-size: 0.85em;
            line-height: 1.6;
        }

        .help-content h3 {
            font-size: 1em;
            margin-top: 16px;
            margin-bottom: 8px;
            color: var(--md-foreground);
            border-bottom: 1px solid var(--file-path-border);
            padding-bottom: 4px;
        }

        .help-content h3:first-child {
            margin-top: 0;
        }

        .help-feature-list {
            list-style: none;
            padding: 0;
            margin: 8px 0;
        }

        .help-feature-list li {
            margin: 6px 0;
            padding-left: 8px;
        }

        .help-feature-list strong {
            color: var(--md-link);
            font-weight: 600;
        }

        .help-shortcuts-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 0.9em;
        }

        .help-shortcuts-table th,
        .help-shortcuts-table td {
            padding: 6px 8px;
            border: 1px solid var(--file-path-border);
            text-align: left;
        }

        .help-shortcuts-table th {
            background-color: var(--md-code-background);
            font-weight: 600;
            color: var(--md-foreground);
        }

        .help-shortcuts-table td:first-child {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-weight: 600;
            color: var(--md-link);
        }

        .help-shortcuts-table code {
            background-color: transparent;
            padding: 0;
            font-size: 1em;
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
            } else if (message.command === 'showSearch') {
                showSearch();
            }
        });

        // Initialize headings
        const headings = ${headingsJson};

        // Initialize file list
        const fileList = ${fileListJson};
        const currentFileName = ${currentFileNameJson};

        // Sidebar state management
        let sidebarVisible = ${sidebarVisibleJson};
        let sidebarActiveTab = ${sidebarActiveTabJson};
        let sidebarSelectedIndex = -1;

        function notifySidebarStateChanged() {
            vscode.postMessage({
                command: 'sidebarStateChanged',
                visible: sidebarVisible,
                activeTab: sidebarActiveTab
            });
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (!sidebar) return;

            sidebarVisible = !sidebarVisible;
            if (sidebarVisible) {
                sidebar.classList.add('show');
                if (sidebarToggle) sidebarToggle.classList.add('active');
                initSidebarContent();
            } else {
                sidebar.classList.remove('show');
                if (sidebarToggle) sidebarToggle.classList.remove('active');
                sidebarSelectedIndex = -1;
                updateSidebarSelection();
            }
            notifySidebarStateChanged();
        }

        function showSidebar() {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (!sidebar) return;

            sidebarVisible = true;
            sidebar.classList.add('show');
            if (sidebarToggle) sidebarToggle.classList.add('active');
            initSidebarContent();
            notifySidebarStateChanged();
        }

        function hideSidebar() {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (!sidebar) return;

            sidebarVisible = false;
            sidebar.classList.remove('show');
            if (sidebarToggle) sidebarToggle.classList.remove('active');
            sidebarSelectedIndex = -1;
            updateSidebarSelection();
            notifySidebarStateChanged();
        }

        function isSidebarVisible() {
            const sidebar = document.getElementById('sidebar');
            return sidebar && sidebar.classList.contains('show');
        }

        function switchSidebarTab(tab) {
            sidebarActiveTab = tab;
            // Set default selection based on tab
            if (tab === 'files') {
                // Set cursor to current file in file list
                const currentFileIndex = fileList.indexOf(currentFileName);
                sidebarSelectedIndex = currentFileIndex >= 0 ? currentFileIndex : -1;
            } else {
                sidebarSelectedIndex = -1;
            }
            updateSidebarSelection();

            const headingsTab = document.getElementById('sidebar-tab-headings');
            const filesTab = document.getElementById('sidebar-tab-files');
            const helpTab = document.getElementById('sidebar-tab-help');
            const headingsPanel = document.getElementById('sidebar-panel-headings');
            const filesPanel = document.getElementById('sidebar-panel-files');
            const helpPanel = document.getElementById('sidebar-panel-help');

            // Remove active class from all tabs and panels
            if (headingsTab) headingsTab.classList.remove('active');
            if (filesTab) filesTab.classList.remove('active');
            if (helpTab) helpTab.classList.remove('active');
            if (headingsPanel) headingsPanel.classList.remove('active');
            if (filesPanel) filesPanel.classList.remove('active');
            if (helpPanel) helpPanel.classList.remove('active');

            // Add active class to selected tab and panel
            if (tab === 'headings') {
                if (headingsTab) headingsTab.classList.add('active');
                if (headingsPanel) headingsPanel.classList.add('active');
            } else if (tab === 'files') {
                if (filesTab) filesTab.classList.add('active');
                if (filesPanel) filesPanel.classList.add('active');
            } else if (tab === 'help') {
                if (helpTab) helpTab.classList.add('active');
                if (helpPanel) helpPanel.classList.add('active');
            }
            notifySidebarStateChanged();
        }

        function initSidebarContent() {
            initSidebarHeadings();
            initSidebarFiles();
        }

        function initSidebarHeadings() {
            const list = document.getElementById('sidebar-headings-list');
            if (!list) return;

            list.innerHTML = '';

            if (headings.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'sidebar-list-item';
                emptyItem.innerHTML = '<span class="sidebar-list-link" style="opacity: 0.5; cursor: default;">No headings</span>';
                list.appendChild(emptyItem);
                return;
            }

            headings.forEach((heading, index) => {
                const li = document.createElement('li');
                li.className = 'sidebar-list-item level-' + heading.level;
                li.setAttribute('data-index', index);

                const link = document.createElement('a');
                link.className = 'sidebar-list-link';
                link.textContent = heading.text;
                link.href = '#' + heading.id;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(heading.id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });

                li.appendChild(link);
                list.appendChild(li);
            });
        }

        function initSidebarFiles() {
            const list = document.getElementById('sidebar-files-list');
            if (!list) return;

            list.innerHTML = '';

            if (fileList.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'sidebar-list-item';
                emptyItem.innerHTML = '<span class="sidebar-list-link" style="opacity: 0.5; cursor: default;">No files</span>';
                list.appendChild(emptyItem);
                return;
            }

            fileList.forEach((file, index) => {
                const li = document.createElement('li');
                li.className = 'sidebar-list-item';
                li.setAttribute('data-index', index);

                if (file === currentFileName) {
                    li.classList.add('current');
                }

                const link = document.createElement('a');
                link.className = 'sidebar-list-link';
                link.textContent = file;
                link.href = '#';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (file !== currentFileName) {
                        vscode.postMessage({ command: 'navigateToFile', fileName: file });
                    }
                });

                li.appendChild(link);
                list.appendChild(li);
            });
        }

        function updateSidebarSelection() {
            const listId = sidebarActiveTab === 'headings' ? 'sidebar-headings-list' : 'sidebar-files-list';
            const list = document.getElementById(listId);
            if (!list) return;

            const items = list.querySelectorAll('.sidebar-list-item');
            items.forEach((item, index) => {
                if (index === sidebarSelectedIndex) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });

            // Scroll selected item into view
            if (sidebarSelectedIndex >= 0 && sidebarSelectedIndex < items.length) {
                items[sidebarSelectedIndex].scrollIntoView({ block: 'nearest' });
            }
        }

        function navigateSidebarUp() {
            const maxIndex = sidebarActiveTab === 'headings' ? headings.length : fileList.length;
            if (maxIndex === 0) return;

            if (sidebarSelectedIndex <= 0) {
                sidebarSelectedIndex = maxIndex - 1;
            } else {
                sidebarSelectedIndex--;
            }
            updateSidebarSelection();
        }

        function navigateSidebarDown() {
            const maxIndex = sidebarActiveTab === 'headings' ? headings.length : fileList.length;
            if (maxIndex === 0) return;

            if (sidebarSelectedIndex >= maxIndex - 1) {
                sidebarSelectedIndex = 0;
            } else {
                sidebarSelectedIndex++;
            }
            updateSidebarSelection();
        }

        function selectSidebarItem() {
            if (sidebarSelectedIndex < 0) return;

            if (sidebarActiveTab === 'headings') {
                if (sidebarSelectedIndex >= headings.length) return;
                const heading = headings[sidebarSelectedIndex];
                const target = document.getElementById(heading.id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                if (sidebarSelectedIndex >= fileList.length) return;
                const selectedFileName = fileList[sidebarSelectedIndex];
                if (selectedFileName !== currentFileName) {
                    vscode.postMessage({ command: 'navigateToFile', fileName: selectedFileName });
                }
            }
        }

        function wrapCodeBlocks() {
            const preElements = document.querySelectorAll('pre');
            preElements.forEach(pre => {
                // Skip if already wrapped
                if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrapper')) {
                    return;
                }

                // Create wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';
                
                // Create copy button
                const button = document.createElement('button');
                button.className = 'copy-code-button';
                button.textContent = 'Copy';
                button.setAttribute('aria-label', 'Copy code to clipboard');
                
                // Add click handler
                button.addEventListener('click', async () => {
                    const code = pre.querySelector('code');
                    const text = code ? code.textContent : pre.textContent;
                    
                    if (!text) {
                        return;
                    }

                    try {
                        await navigator.clipboard.writeText(text);
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = 'Copy';
                        }, 2000);
                    } catch (err) {
                        button.textContent = 'Failed';
                        setTimeout(() => {
                            button.textContent = 'Copy';
                        }, 2000);
                    }
                });

                // Wrap the pre element
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);
                wrapper.appendChild(button);
            });
        }

        function initPreviewEnhancements() {
            wrapCodeBlocks();
            initMermaidButtons();
        }

        function initMermaidButtons() {
            // Copy buttons
            document.querySelectorAll('.mermaid-copy-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const wrapper = button.closest('.mermaid-wrapper');
                    const mermaidDiv = wrapper?.querySelector('.mermaid');
                    const encodedSource = mermaidDiv?.getAttribute('data-mermaid-source');

                    if (!encodedSource) {
                        button.textContent = 'Failed';
                        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
                        return;
                    }

                    try {
                        const source = atob(encodedSource);
                        const markdown = '\`\`\`mermaid\\n' + source + '\\n\`\`\`';
                        await navigator.clipboard.writeText(markdown);
                        button.textContent = 'Copied!';
                        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
                    } catch (err) {
                        button.textContent = 'Failed';
                        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
                    }
                });
            });

            // Save buttons
            document.querySelectorAll('.mermaid-save-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const wrapper = button.closest('.mermaid-wrapper');
                    const mermaidDiv = wrapper?.querySelector('.mermaid');
                    const svg = mermaidDiv?.querySelector('svg');

                    if (!svg) {
                        button.textContent = 'Failed';
                        setTimeout(() => { button.textContent = 'Save'; }, 2000);
                        return;
                    }

                    try {
                        button.textContent = 'Saving...';

                        // Detect current theme (dark or light)
                        const isDarkMode = document.body.classList.contains('theme-dark');
                        const bgColor = isDarkMode ? '#1e1e1e' : '#ffffff';
                        const textColor = isDarkMode ? '#ffffff' : '#000000';

                        // Get SVG dimensions from viewBox or bounding rect
                        const viewBox = svg.getAttribute('viewBox');
                        let width, height;
                        if (viewBox) {
                            const parts = viewBox.split(' ').map(Number);
                            width = parts[2] || 800;
                            height = parts[3] || 600;
                        } else {
                            const svgRect = svg.getBoundingClientRect();
                            width = Math.ceil(svgRect.width) || 800;
                            height = Math.ceil(svgRect.height) || 600;
                        }

                        // Clone SVG and prepare for export
                        const svgClone = svg.cloneNode(true);
                        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                        svgClone.setAttribute('width', width.toString());
                        svgClone.setAttribute('height', height.toString());

                        // Remove problematic attributes
                        svgClone.removeAttribute('style');

                        // Convert foreignObject elements to SVG text elements
                        // foreignObject causes tainted canvas issues
                        svgClone.querySelectorAll('foreignObject').forEach(fo => {
                            const foX = fo.getAttribute('x') || '0';
                            const foY = fo.getAttribute('y') || '0';
                            const foWidth = parseFloat(fo.getAttribute('width') || '100');
                            const foHeight = parseFloat(fo.getAttribute('height') || '50');

                            // Get text content from inside foreignObject
                            const textContent = fo.textContent?.trim() || '';

                            if (textContent) {
                                // Create SVG text element to replace foreignObject
                                const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                                textEl.setAttribute('x', (parseFloat(foX) + foWidth / 2).toString());
                                textEl.setAttribute('y', (parseFloat(foY) + foHeight / 2).toString());
                                textEl.setAttribute('text-anchor', 'middle');
                                textEl.setAttribute('dominant-baseline', 'middle');
                                textEl.setAttribute('fill', textColor);
                                textEl.setAttribute('font-family', 'arial, sans-serif');
                                textEl.setAttribute('font-size', '14');
                                textEl.textContent = textContent;

                                fo.parentNode?.replaceChild(textEl, fo);
                            } else {
                                fo.remove();
                            }
                        });

                        // Force text elements to use theme-appropriate color
                        svgClone.querySelectorAll('text, tspan').forEach(el => {
                            el.setAttribute('fill', textColor);
                        });

                        // Add background at the beginning
                        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        bgRect.setAttribute('x', '0');
                        bgRect.setAttribute('y', '0');
                        bgRect.setAttribute('width', width.toString());
                        bgRect.setAttribute('height', height.toString());
                        bgRect.setAttribute('fill', bgColor);

                        // Find the first non-style, non-defs element to insert before
                        let insertBefore = null;
                        for (const child of svgClone.children) {
                            const tag = child.tagName.toLowerCase();
                            if (tag !== 'style' && tag !== 'defs') {
                                insertBefore = child;
                                break;
                            }
                        }
                        if (insertBefore) {
                            svgClone.insertBefore(bgRect, insertBefore);
                        } else {
                            svgClone.appendChild(bgRect);
                        }

                        // Serialize SVG to string
                        const svgData = new XMLSerializer().serializeToString(svgClone);

                        // Create canvas and draw SVG
                        const canvas = document.createElement('canvas');
                        const scale = 2; // Higher resolution
                        canvas.width = width * scale;
                        canvas.height = height * scale;
                        const ctx = canvas.getContext('2d');
                        ctx.scale(scale, scale);
                        ctx.fillStyle = bgColor;
                        ctx.fillRect(0, 0, width, height);

                        // Create blob URL for the SVG
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(svgBlob);

                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0, width, height);
                            URL.revokeObjectURL(url);

                            // Convert to PNG and send to extension for saving
                            const pngDataUrl = canvas.toDataURL('image/png');
                            const base64Data = pngDataUrl.replace(/^data:image\\/png;base64,/, '');
                            vscode.postMessage({ command: 'saveMermaidPng', data: base64Data });
                            setTimeout(() => { button.textContent = 'Save'; }, 2000);
                        };
                        img.onerror = () => {
                            URL.revokeObjectURL(url);
                            button.textContent = 'Failed';
                            setTimeout(() => { button.textContent = 'Save'; }, 2000);
                        };
                        img.src = url;
                    } catch (err) {
                        console.error('Save error:', err);
                        button.textContent = 'Failed';
                        setTimeout(() => { button.textContent = 'Save'; }, 2000);
                    }
                });
            });
        }

        // Search functionality
        class SearchManager {
            constructor() {
                this.currentIndex = -1;
                this.matches = [];
                this.searchTerm = '';
                this.caseSensitive = false;
            }

            search(term, caseSensitive = false) {
                this.searchTerm = term;
                this.caseSensitive = caseSensitive;
                this.clearHighlights();

                if (!term) {
                    this.updateResults();
                    return;
                }

                this.highlightMatches();
                this.currentIndex = this.matches.length > 0 ? 0 : -1;
                this.updateResults();
                if (this.currentIndex >= 0) {
                    this.scrollToCurrentMatch();
                }
            }

            highlightMatches() {
                const content = document.body;
                const walker = document.createTreeWalker(
                    content,
                    NodeFilter.SHOW_TEXT,
                    null
                );

                const nodesToHighlight = [];
                let node;

                while (node = walker.nextNode()) {
                    if (this.shouldSkipNode(node)) continue;

                    const text = node.textContent;
                    const regex = new RegExp(
                        this.escapeRegExp(this.searchTerm),
                        this.caseSensitive ? 'g' : 'gi'
                    );

                    if (regex.test(text)) {
                        nodesToHighlight.push(node);
                    }
                }

                nodesToHighlight.forEach(node => {
                    this.highlightNode(node);
                });
            }

            highlightNode(node) {
                const text = node.textContent;
                const regex = new RegExp(
                    this.escapeRegExp(this.searchTerm),
                    this.caseSensitive ? 'g' : 'gi'
                );

                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                let match;

                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                        fragment.appendChild(
                            document.createTextNode(text.slice(lastIndex, match.index))
                        );
                    }

                    const mark = document.createElement('mark');
                    mark.className = 'search-highlight';
                    mark.textContent = match[0];
                    fragment.appendChild(mark);
                    this.matches.push(mark);

                    lastIndex = regex.lastIndex;
                }

                if (lastIndex < text.length) {
                    fragment.appendChild(
                        document.createTextNode(text.slice(lastIndex))
                    );
                }

                node.parentNode.replaceChild(fragment, node);
            }

            clearHighlights() {
                const marks = document.querySelectorAll('mark.search-highlight');
                marks.forEach(mark => {
                    const text = document.createTextNode(mark.textContent);
                    mark.parentNode.replaceChild(text, mark);
                });
                this.matches = [];
                this.currentIndex = -1;
            }

            nextMatch() {
                if (this.matches.length === 0) return;
                this.currentIndex = (this.currentIndex + 1) % this.matches.length;
                this.scrollToCurrentMatch();
                this.updateResults();
            }

            previousMatch() {
                if (this.matches.length === 0) return;
                this.currentIndex = this.currentIndex <= 0
                    ? this.matches.length - 1
                    : this.currentIndex - 1;
                this.scrollToCurrentMatch();
                this.updateResults();
            }

            scrollToCurrentMatch() {
                if (this.currentIndex < 0 || this.currentIndex >= this.matches.length) {
                    return;
                }

                const currentMatch = this.matches[this.currentIndex];

                this.matches.forEach((mark, i) => {
                    if (i === this.currentIndex) {
                        mark.classList.add('search-highlight-current');
                    } else {
                        mark.classList.remove('search-highlight-current');
                    }
                });

                currentMatch.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }

            updateResults() {
                const resultsEl = document.getElementById('search-results');
                if (!resultsEl) return;

                if (this.matches.length === 0) {
                    resultsEl.textContent = this.searchTerm ? 'No results' : '';
                } else {
                    resultsEl.textContent = \`\${this.currentIndex + 1}/\${this.matches.length}\`;
                }
            }

            shouldSkipNode(node) {
                let parent = node.parentElement;
                while (parent) {
                    const tag = parent.tagName?.toLowerCase();
                    if (tag === 'script' || tag === 'style' ||
                        parent.classList?.contains('search-container') ||
                        parent.classList?.contains('file-path-header') ||
                        parent.classList?.contains('headings-list-dropdown')) {
                        return true;
                    }
                    parent = parent.parentElement;
                }
                return false;
            }

            escapeRegExp(string) {
                return string.replace(/[.*+?^$\{\}()|[\\]\\\\]/g, '\\\\$&');
            }
        }

        const searchManager = new SearchManager();
        let searchTimeout;

        function initSearch() {
            const searchSection = document.getElementById('search-section');
            const searchInput = document.getElementById('search-input');
            const searchPrev = document.getElementById('search-prev');
            const searchNext = document.getElementById('search-next');
            const searchClose = document.getElementById('search-close');
            const caseSensitiveCheckbox = document.getElementById('search-case-sensitive');

            if (!searchSection || !searchInput || !searchPrev || !searchNext || !searchClose || !caseSensitiveCheckbox) {
                return;
            }

            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchManager.search(
                        searchInput.value,
                        caseSensitiveCheckbox.checked
                    );
                }, 300);
            });

            caseSensitiveCheckbox.addEventListener('change', () => {
                if (searchInput.value) {
                    searchManager.search(
                        searchInput.value,
                        caseSensitiveCheckbox.checked
                    );
                }
            });

            searchNext.addEventListener('click', () => {
                searchManager.nextMatch();
            });

            searchPrev.addEventListener('click', () => {
                searchManager.previousMatch();
            });

            searchClose.addEventListener('click', () => {
                hideSearch();
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        searchManager.previousMatch();
                    } else {
                        searchManager.nextMatch();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    hideSearch();
                }
            });
        }

        function showSearch() {
            const searchSection = document.getElementById('search-section');
            const searchInput = document.getElementById('search-input');
            if (!searchSection || !searchInput) return;

            searchSection.classList.remove('hidden');
            searchInput.focus();
            searchInput.select();
        }

        function hideSearch() {
            const searchSection = document.getElementById('search-section');
            const searchInput = document.getElementById('search-input');
            if (!searchSection || !searchInput) return;

            searchSection.classList.add('hidden');
            searchManager.clearHighlights();
            searchInput.value = '';
        }

        function copyFilePath() {
            const filePathElement = document.querySelector('.file-path');
            if (!filePathElement) return;

            const copyIcon = filePathElement.querySelector('.copy-icon');
            // Get file path by cloning the element and removing the copy icon
            const filePathClone = filePathElement.cloneNode(true);
            const clonedCopyIcon = filePathClone.querySelector('.copy-icon');
            if (clonedCopyIcon) {
                clonedCopyIcon.remove();
            }
            const filePath = filePathClone.textContent.trim();

            navigator.clipboard.writeText(filePath).then(() => {
                // Success - send message to VS Code to show notification
                vscode.postMessage({
                    command: 'copySuccess',
                    filePath: filePath
                });

                // Visual feedback in webview
                showCopyFeedback(filePathElement, copyIcon, true);
            }).catch(err => {
                console.error('Failed to copy file path:', err);

                // Error - send message to VS Code to show error notification
                vscode.postMessage({
                    command: 'copyFailed',
                    error: err.message
                });

                // Visual feedback in webview
                showCopyFeedback(filePathElement, copyIcon, false);
            });
        }

        function showCopyFeedback(element, iconElement, success) {
            if (success) {
                // Success feedback
                element.classList.add('copied');
                const originalTitle = element.title;
                const originalIcon = iconElement.textContent;
                element.title = 'Copied!';
                iconElement.textContent = '✓';

                setTimeout(() => {
                    element.classList.remove('copied');
                    element.title = originalTitle;
                    iconElement.textContent = originalIcon;
                }, 1500);
            } else {
                // Error feedback
                const originalTitle = element.title;
                const originalIcon = iconElement.textContent;
                element.title = 'Copy failed';
                iconElement.textContent = '✗';
                element.style.color = '#f44336';

                setTimeout(() => {
                    element.title = originalTitle;
                    iconElement.textContent = originalIcon;
                    element.style.color = '';
                }, 1500);
            }
        }

        function initFilePathCopy() {
            const filePathElement = document.querySelector('.file-path');

            if (!filePathElement) return;

            filePathElement.addEventListener('click', () => {
                copyFilePath();
            });
        }

        function copySelection() {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                vscode.postMessage({ command: 'copyNoSelection' });
                return;
            }

            const selectedText = selection.toString();
            if (!selectedText.trim()) {
                vscode.postMessage({ command: 'copyNoSelection' });
                return;
            }

            navigator.clipboard.writeText(selectedText).then(() => {
                vscode.postMessage({ command: 'copySelectionSuccess' });
            }).catch(err => {
                console.error('Failed to copy selection:', err);
                vscode.postMessage({
                    command: 'copySelectionFailed',
                    error: err.message
                });
            });
        }

        function copyAsQuote() {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                vscode.postMessage({ command: 'quoteNoSelection' });
                return;
            }

            const selectedText = selection.toString();
            if (!selectedText.trim()) {
                vscode.postMessage({ command: 'quoteNoSelection' });
                return;
            }

            // Add "> " prefix to each line
            const quotedText = selectedText
                .split('\\n')
                .map(line => '> ' + line)
                .join('\\n');

            navigator.clipboard.writeText(quotedText).then(() => {
                vscode.postMessage({ command: 'quoteSuccess' });
            }).catch(err => {
                console.error('Failed to copy as quote:', err);
                vscode.postMessage({
                    command: 'quoteFailed',
                    error: err.message
                });
            });
        }

        function initSidebarToggle() {
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', toggleSidebar);
            }
        }

        function restoreSidebarState() {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (!sidebar) return;

            if (sidebarVisible) {
                sidebar.classList.add('show');
                if (sidebarToggle) sidebarToggle.classList.add('active');
                initSidebarContent();
                switchSidebarTab(sidebarActiveTab);
            }
        }

        // Initialize enhancements when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initPreviewEnhancements();
                initSearch();
                initFilePathCopy();
                initSidebarToggle();
                restoreSidebarState();
            });
        } else {
            initPreviewEnhancements();
            initSearch();
            initFilePathCopy();
            initSidebarToggle();
            restoreSidebarState();
        }

        window.addEventListener('keydown', (event) => {
            // 検索入力がフォーカスされている場合はショートカットキーをスキップ
            const searchInput = document.getElementById('search-input');
            if (searchInput && document.activeElement === searchInput) {
                return;
            }

            // Handle arrow keys for sidebar navigation (up/down only)
            if (event.key === 'ArrowUp') {
                if (isSidebarVisible()) {
                    event.preventDefault();
                    navigateSidebarUp();
                    return;
                }
            } else if (event.key === 'ArrowDown') {
                if (isSidebarVisible()) {
                    event.preventDefault();
                    navigateSidebarDown();
                    return;
                }
            } else if (event.key === 'Enter') {
                if (isSidebarVisible() && sidebarSelectedIndex >= 0) {
                    event.preventDefault();
                    selectSidebarItem();
                    return;
                }
            } else if (event.key === 'Escape') {
                if (isSidebarVisible()) {
                    event.preventDefault();
                    hideSidebar();
                    return;
                }
            } else if (event.key === 'Tab' && isSidebarVisible()) {
                event.preventDefault();
                // Switch sidebar tabs with Tab key
                if (sidebarActiveTab === 'headings') {
                    switchSidebarTab('files');
                } else if (sidebarActiveTab === 'files') {
                    switchSidebarTab('help');
                } else {
                    switchSidebarTab('headings');
                }
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                // Navigate to next file directly
                if (fileList.length > 1) {
                    const currentIndex = fileList.indexOf(currentFileName);
                    if (currentIndex < fileList.length - 1) {
                        vscode.postMessage({ command: 'navigateNext' });
                    }
                }
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                // Navigate to previous file directly
                if (fileList.length > 1) {
                    const currentIndex = fileList.indexOf(currentFileName);
                    if (currentIndex > 0) {
                        vscode.postMessage({ command: 'navigatePrevious' });
                    }
                }
            } else if (event.key === 'h') {
                event.preventDefault();
                showSidebar();
                switchSidebarTab('headings');
            } else if (event.key === 'f') {
                event.preventDefault();
                showSidebar();
                switchSidebarTab('files');
            } else if (event.key === 'c' && !event.metaKey && !event.ctrlKey) {
                event.preventDefault();
                copySelection();
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
                vscode.postMessage({ command: 'resetZoom' });
            } else if (event.key === 't') {
                event.preventDefault();
                vscode.postMessage({ command: 'toggleTheme' });
            } else if (event.key === 'q') {
                event.preventDefault();
                copyAsQuote();
            } else if (event.key === 's') {
                event.preventDefault();
                toggleSidebar();
            }
        });
    </script>
</head>
<body class="${themeClass}">
    <div class="file-path-header">
        <div class="file-path-section">
            <span class="file-path-label">${fileIcon}</span>
            <code class="file-path clickable" title="Click to copy (or press 'c')">${relativePath}<span class="copy-icon">📋</span></code>
        </div>
        <div id="search-section" class="search-section hidden">
            <input
                type="text"
                id="search-input"
                class="search-input"
                placeholder="Find..."
            >
            <div class="search-controls">
                <span id="search-results" class="search-results"></span>
                <button id="search-prev" class="search-button" title="Previous (Shift+Enter)">
                    <span>↑</span>
                </button>
                <button id="search-next" class="search-button" title="Next (Enter)">
                    <span>↓</span>
                </button>
                <label class="search-option" title="Case sensitive">
                    <input type="checkbox" id="search-case-sensitive">
                    <span>Aa</span>
                </label>
                <button id="search-close" class="search-button" title="Close (Esc)">
                    <span>✕</span>
                </button>
            </div>
        </div>
        <div class="header-panels">
            <button id="sidebar-toggle" class="sidebar-toggle" title="Toggle sidebar [s]">☰</button>
        </div>
    </div>
    <div class="main-container">
        <div class="preview-content">
    ${convertedHtml}
        </div>
        <aside id="sidebar" class="sidebar">
            <div class="sidebar-tabs">
                <button id="sidebar-tab-headings" class="sidebar-tab active" onclick="switchSidebarTab('headings')">Headings</button>
                <button id="sidebar-tab-files" class="sidebar-tab" onclick="switchSidebarTab('files')">Files</button>
                <button id="sidebar-tab-help" class="sidebar-tab" onclick="switchSidebarTab('help')">Help</button>
            </div>
            <div class="sidebar-content">
                <div id="sidebar-panel-headings" class="sidebar-panel active">
                    <ul id="sidebar-headings-list" class="sidebar-list"></ul>
                </div>
                <div id="sidebar-panel-files" class="sidebar-panel">
                    <ul id="sidebar-files-list" class="sidebar-list"></ul>
                </div>
                <div id="sidebar-panel-help" class="sidebar-panel">
                    <div class="help-content">
                        <h3>Features</h3>
                        <ul class="help-feature-list">
                            <li><strong>Pin/Unpin:</strong> Lock the preview to a specific file</li>
                            <li><strong>Search:</strong> Find text within the current markdown file</li>
                            <li><strong>Theme Toggle:</strong> Switch between light and dark themes</li>
                            <li><strong>Zoom:</strong> Adjust preview text size (50-200%)</li>
                            <li><strong>Edit:</strong> Open the previewed file in editor</li>
                            <li><strong>Refresh:</strong> Reload the preview content</li>
                            <li><strong>Open Settings:</strong> Access extension configuration</li>
                        </ul>
                        
                        <h3>Keyboard Shortcuts</h3>
                        <table class="help-shortcuts-table">
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td><code>h</code></td><td>Show sidebar (Headings tab)</td></tr>
                                <tr><td><code>f</code></td><td>Show sidebar (Files tab)</td></tr>
                                <tr><td><code>s</code></td><td>Toggle sidebar</td></tr>
                                <tr><td><code>Tab</code></td><td>Switch between sidebar tabs</td></tr>
                                <tr><td><code>↑/↓</code></td><td>Navigate sidebar items</td></tr>
                                <tr><td><code>Enter</code></td><td>Select sidebar item</td></tr>
                                <tr><td><code>Esc</code></td><td>Close sidebar</td></tr>
                                <tr><td><code>←/→</code></td><td>Previous/Next file</td></tr>
                                <tr><td><code>p</code></td><td>Toggle pin</td></tr>
                                <tr><td><code>e</code></td><td>Edit in editor</td></tr>
                                <tr><td><code>t</code></td><td>Toggle theme</td></tr>
                                <tr><td><code>+/-</code></td><td>Zoom in/out</td></tr>
                                <tr><td><code>r</code></td><td>Reset zoom</td></tr>
                                <tr><td><code>c</code></td><td>Copy selection</td></tr>
                                <tr><td><code>q</code></td><td>Copy selection as quote</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </aside>
    </div>
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
                // Include all heading levels (h1-h6) in TOC
                if (level <= 6) {
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
