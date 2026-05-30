/**
 * Uindow's CSS Selector Generator
 *
 * @architect Mark Jivko <mark@uindow.com>
 * @copyright © 2026-present Uindow™ (https://uindow.com)
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the “Software”), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
		if (1 > bytesRead) {
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

	const copyrightYear = 2026 < new Date().getFullYear() ? `2026-${new Date().getFullYear()}` : 2026;
	const copyright = `
Uindow's CSS Selector Generator

@architect Mark Jivko <mark@uindow.com>
@copyright © ${copyrightYear} Uindow™ (https://uindow.com)
@license MIT

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files
(the “Software”), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.`.trim();

	// Prepare exports
	const outputs = [
		{
			// Npm: Common JS
			file: "index.js",
			config: { format: "cjs", platform: "node" }
		},
		{
			// Npm: Module
			file: "index.mjs",
			config: { format: "esm" }
		},
		{
			// Web: uindow.github.io/css/selector.js
			file: "docs/selector.js",
			config: { format: "iife", globalName: "Uindow_CSS", sourcesContent: true }
		}
	];
	for (const output of outputs) {
		await esbuild.build({
			entryPoints: [path.join(rootPath, "src", "index.ts")],
			outfile: path.join(rootPath, output.file),
			minify: true,
			keepNames: true,
			minifyIdentifiers: false,
			target: ["es2020"],
			sourcemap: true,
			sourcesContent: false,
			...output.config
		});
		filePrepend(path.join(rootPath, output.file), "/**\n" + copyright.replace(/^/gm, " * ") + "\n */\n");
	}

	const logMessage = `Assets exported in ${Math.floor(1000 * (performance.now() - startTime)) / 1000}ms`;
	console.log(`\n\x1b[32m${logMessage}\x1b[0m\n`);
})();
