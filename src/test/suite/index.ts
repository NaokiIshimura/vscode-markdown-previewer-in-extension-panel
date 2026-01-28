import * as path from 'path';
import Mocha from 'mocha';
import * as fs from 'fs';

export async function run(): Promise<void> {
    console.log('Test runner starting...');

    const mocha = new Mocha({
        ui: 'bdd',
        color: true,
        timeout: 10000,
        reporter: 'spec',
    });

    const testsRoot = path.resolve(__dirname, '.');
    console.log('Tests root:', testsRoot);

    try {
        const testFiles = fs.readdirSync(testsRoot).filter(file => file.endsWith('.test.js'));
        console.log('Found test files:', testFiles);

        testFiles.forEach((f: string) => {
            const filePath = path.resolve(testsRoot, f);
            console.log('Adding test file:', filePath);
            mocha.addFile(filePath);
        });

        return new Promise((resolve, reject) => {
            try {
                mocha.run((failures: number) => {
                    console.log('Test run completed. Failures:', failures);
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error('Error running tests:', err);
                reject(err);
            }
        });
    } catch (err) {
        console.error('Error in test setup:', err);
        throw err;
    }
}
