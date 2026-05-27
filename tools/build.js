const esbuild = require("esbuild");
const path = require("path");

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
    fs.moveSync(filePathTemp, filePath, { overwrite: true });
};

(async () => {
    const startTime = performance.now();
    const rootPath = path.dirname(__dirname);

    const copyrightYear = new Date().getFullYear() > 2026 ? `2026-${new Date().getFullYear()}` : 2026;
    const copyright = `
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

    // Build the

    // filePrepend(path.join(), "/*!\n" + copyright.replace(/^/gm, " * ") + "\n */\n");

    console.log(`  • Added copyright headers in ${performance.now() - startTime}ms`);
})();
