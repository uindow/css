/**
 * Uindow's CSS Selector Generator
 *
 * @architect Mark Jivko <mark@uindow.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

/**
 * Prepend text to file
 *
 * @param {string} filePath File path
 * @param {string} text     Text
 */
const filePrepend = (filePath, text) => {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const filePathTemp = `${filePath}.tmp`;

    // Prepare the buffer
    const bufferSize = 64 * 1024;
    const buffer = Buffer.alloc(bufferSize);

    // Open the original file
    const readFd = fs.openSync(filePath, "r");
    const writeFd = fs.openSync(filePathTemp, "a");

    // Prepend the text
    fs.writeSync(writeFd, Buffer.from(`${text}`), 0);

    // Append the rest of the file
    do {
        const bytesRead = fs.readSync(readFd, buffer, 0, bufferSize, null);
        if (bytesRead < 1) {
            break;
        }

        fs.writeSync(writeFd, buffer, 0, bytesRead);
    } while (true);

    // Close file descriptors
    fs.closeSync(readFd);
    fs.closeSync(writeFd);

    // Replace the original file
    fs.renameSync(filePathTemp, filePath, { overwrite: true });
};

(async () => {
    const startTime = performance.now();
    const rootPath = path.dirname(__dirname);

    const copyrightYear = new Date().getFullYear() > 2026 ? `2026-${new Date().getFullYear()}` : 2026;
    const copyright = `
Uindow's CSS Selector Generator

@architect Mark Jivko <mark@uindow.com>
@copyright © ${copyrightYear} Uindow™ (https://uindow.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`.trim();

    // Prepare exports
    const outputs = [
        {
            // Npm: @uindow/css
            file: "index.js",
            config: { format: "esm" }
        },
        {
            // Web: uindow.github.io/css/selector.js
            file: "docs/selector.js",
            config: { format: "iife", globalName: "Uindow_CSS" }
        }
    ];
    for (const output of outputs) {
        await esbuild.build({
            entryPoints: [path.join(rootPath, "src", "index.ts")],
            outfile: path.join(rootPath, output.file),
            minifyIdentifiers: false,
            target: ["es2020"],
            sourcemap: false,
            minify: true,
            ...output.config
        });
        filePrepend(path.join(rootPath, output.file), "/**\n" + copyright.replace(/^/gm, " * ") + "\n */\n");
    }

    const logMessage = `Assets exported in ${Math.floor(1000 * (performance.now() - startTime)) / 1000}ms`;
    console.log(`\n\x1b[32m${logMessage}\x1b[0m\n`);
})();
