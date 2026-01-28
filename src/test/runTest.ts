import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        console.log('Extension development path:', extensionDevelopmentPath);
        console.log('Extension tests path:', extensionTestsPath);

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            version: '1.85.0',
        });
    } catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}

main();





