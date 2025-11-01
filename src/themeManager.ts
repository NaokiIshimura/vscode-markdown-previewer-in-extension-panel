import * as vscode from 'vscode';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

export class ThemeManager {
    private cachedMode: ThemeMode | null = null;
    private onThemeChangedEmitter = new vscode.EventEmitter<EffectiveTheme>();

    public readonly onThemeChanged = this.onThemeChangedEmitter.event;

    constructor(private context: vscode.ExtensionContext) {
        // Listen for theme change events
        context.subscriptions.push(
            vscode.window.onDidChangeActiveColorTheme((theme) => {
                this.handleThemeChange(theme);
            })
        );

        // Listen for configuration change events
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration('markdownPreview.themeMode')) {
                    this.invalidateCache();
                    this.handleConfigChange();
                }
            })
        );
    }

    /**
     * Get current theme mode setting
     */
    public getCurrentThemeMode(): ThemeMode {
        if (this.cachedMode === null) {
            this.cachedMode = this.loadThemeModeFromConfig();
        }
        return this.cachedMode;
    }

    /**
     * Set theme mode
     */
    public async setThemeMode(mode: ThemeMode): Promise<void> {
        const config = vscode.workspace.getConfiguration('markdownPreview');
        await config.update('themeMode', mode, vscode.ConfigurationTarget.Global);
        this.invalidateCache();
    }

    /**
     * Resolve effective theme (light/dark)
     */
    public resolveEffectiveTheme(mode?: ThemeMode): EffectiveTheme {
        const themeMode = mode ?? this.getCurrentThemeMode();

        // Manual mode
        if (themeMode === 'light') return 'light';
        if (themeMode === 'dark') return 'dark';

        // Auto mode: determine from VS Code theme
        const vsCodeTheme = vscode.window.activeColorTheme;
        return this.isLightTheme(vsCodeTheme) ? 'light' : 'dark';
    }

    /**
     * Invalidate cache
     */
    private invalidateCache(): void {
        this.cachedMode = null;
    }

    /**
     * Load theme mode from configuration
     */
    private loadThemeModeFromConfig(): ThemeMode {
        const config = vscode.workspace.getConfiguration('markdownPreview');
        const value = config.get<string>('themeMode', 'auto');
        return this.validateThemeMode(value);
    }

    /**
     * Validate theme mode
     */
    private validateThemeMode(value: string): ThemeMode {
        const validModes: ThemeMode[] = ['auto', 'light', 'dark'];
        if (validModes.includes(value as ThemeMode)) {
            return value as ThemeMode;
        }
        console.error(`Invalid theme mode: "${value}", falling back to 'auto'`);
        return 'auto';
    }

    /**
     * Check if VS Code theme is light
     */
    private isLightTheme(theme: vscode.ColorTheme): boolean {
        return (
            theme.kind === vscode.ColorThemeKind.Light ||
            theme.kind === vscode.ColorThemeKind.HighContrastLight
        );
    }

    /**
     * Handle theme change event
     */
    private handleThemeChange(theme: vscode.ColorTheme): void {
        const mode = this.getCurrentThemeMode();
        if (mode === 'auto') {
            const effectiveTheme = this.resolveEffectiveTheme('auto');
            this.onThemeChangedEmitter.fire(effectiveTheme);
        }
    }

    /**
     * Handle configuration change event
     */
    private handleConfigChange(): void {
        const effectiveTheme = this.resolveEffectiveTheme();
        this.onThemeChangedEmitter.fire(effectiveTheme);
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.onThemeChangedEmitter.dispose();
    }
}
