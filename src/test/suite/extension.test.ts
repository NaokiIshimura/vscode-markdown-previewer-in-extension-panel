import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('VS Code API should be available', () => {
        assert.ok(vscode.version, 'VS Code API should be available');
        console.log('VS Code version:', vscode.version);
    });

    test('Basic assertion works', () => {
        assert.strictEqual(1 + 1, 2, '1 + 1 should equal 2');
    });
});
