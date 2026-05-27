/**
 * Uindow's CSS Selector Generator
 *
 * @architect Mark Jivko <mark@uindow.com>
 * @copyright © 2026 Uindow™ (https://uindow.com)
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

/**
 * Configuration options for the CSS selector generator.
 */
export interface Uindow_CSS_Config {
    /**
     * The root element to search from. Selectors will be built relative to this
     * element; nothing above it will appear in any generated selector.
     *
     * @default document.documentElement
     */
    root: HTMLElement | Document;

    /**
     * Function that decides whether an HTML ID attribute may be used in a selector.
     * Defaults to allowing all IDs.
     */
    idNameFilter: (name: string) => boolean;

    /**
     * Penalty applied to id selectors.
     * Example: `#id`
     *
     * A lower value tends to yield more ID-based CSS selectors.
     *
     * @default 1
     */
    idPenalty: number;

    /**
     * Function that decides whether an HTML tag name may be used in a selector.
     * Defaults to allowing all tags.
     */
    tagNameFilter: (name: string) => boolean;

    /**
     * Penalty applied to tag selectors.
     * Example: `div`
     *
     * A lower value tends to yield more tag-based CSS selectors.
     *
     * @default 1.1
     */
    tagPenalty: number;

    /**
     * Function that decides whether a CSS class name may be used in a selector.
     * Defaults to disallowing `is-*|has-*|js-*|css-*` classes.
     */
    classNameFilter: (name: string) => boolean;

    /**
     * Penalty applied to class name selectors.
     * Example: `.button`
     *
     * A lower value tends to yield more class-based CSS selectors.
     *
     * @default 1.3
     */
    classPenalty: number;

    /**
     * Function that decides whether an attribute `(name, value)` pair may be used
     * in a selector. Defaults to allowing any attribute except `*style|*width|*height`
     * that is shorter than 32 characters, and not a URL.
     */
    attrFilter: (name: string, value: string) => boolean;

    /**
     * Penalty applied to attribute selectors.
     * Example: `[name]`, `[value="1"]`
     *
     * A lower value tends to yield more attribute-based CSS selectors.
     *
     * @default 1.25
     */
    attrPenalty: number;

    /**
     * Penalty applied to prefix-matched and suffix-matched attribute selectors.
     * Example: `[name^="x"]`, `[value$="5"]`
     *
     * A lower value tends to yield more CSS selectors that contain
     * attribute values prefixes or suffixes.
     *
     * @default 1.2
     */
    attrMatchPenalty: number;

    /**
     * Penalty applied to nth-of-type selectors.
     * Example: `div:nth-of-type(1)`
     *
     * A lower value tends to yield more nth-of-type CSS selectors.
     *
     * @default 3
     */
    nthOfTypePenalty: number;

    /**
     * Penalty applied to nth-child selectors.
     * Example: `:nth-child(1)`
     *
     * A lower value tends to yield more nth-child CSS selectors.
     *
     * @default 6
     */
    nthChildPenalty: number;

    /**
     * Apply a penalty to CSS selectors whose length exceeds this number of characters.
     *
     * A lower value tends to yield shorter CSS selectors.
     *
     * @default 32
     */
    lengthPenaltyThreshold: number;

    /**
     * Hard cap on the number of candidates yielded per level.
     * Useful for very deep or very wide DOMs where the search space is large.
     *
     * @default 2500
     */
    maxCandidatesPerLevel: number;

    /**
     * Hard cap on the number of unique paths yielded per level.
     * Useful for very deep or very wide DOMs where the search space is large.
     *
     * @default 50
     */
    maxPathsPerLevel: number;

    /**
     * Hard cap on the number of unique paths yielded in total.
     * Useful for very deep or very wide DOMs where the search space is large.
     *
     * This value should always be lower than `maxResults`.
     *
     * @default 1000
     */
    maxPathsTotal: number;

    /**
     * Maximum number of distinct selectors to return, sorted by increasing penalty.
     *
     * @default 25
     */
    maxResults: number;

    /**
     * Percentage of CSS selectors that match the target element first, while potentially
     * also matching additional elements on the page. Set to `0` to ensure CSS selectors
     * match the target element exclusively.
     *
     * A higher value tends to yield shorter CSS selectors.
     *
     * @default 5
     */
    fuzziness: number;

    /**
     * Maximum time in milliseconds to spend searching before giving up and
     * returning however many results have been found so far (or the nth-of-type
     * fallback if none were found).
     *
     * @default 1500
     */
    timeout: number;
}

/**
 * Document root.
 */
export type Uindow_CSS_Root = Document | ShadowRoot | HTMLElement;

/**
 * CSS selector node.
 */
export interface Uindow_CSS_Node {
    /**
     * Compound CSS selector for this node.
     * Multiple nodes are merged to form the final (complex) CSS selector.
     */
    compound: string;

    /**
     * CSS selector penalty - the lower, the better.
     */
    penalty: number;

    /**
     * Node level starting at `0` for the target element, incremented with each ancestor.
     */
    level: number;
}

/**
 * CSS selector path.
 */
export type Uindow_CSS_Path = Uindow_CSS_Node[];

/**
 * CSS selector.
 */
export interface Uindow_CSS_Result {
    /**
     * Full CSS selector.
     */
    selector: string;

    /**
     * CSS selector penalty - the lower, the better.
     */
    penalty: number;
}

/**
 * @namespace Uindow_CSS
 */
class Uindow_CSS {
    /**
     * Return the single best CSS selector for the target element.
     *
     * @param element Target element
     * @param options Search configuration
     *
     * @returns The best matching selector with its penalty score
     * @throws {Error} If no selector can be generated
     */
    static findOne(element: HTMLElement, options: Partial<Uindow_CSS_Config> = {}): Uindow_CSS_Result {
        if ("object" !== typeof options || null === options) {
            options = {};
        }

        return Uindow_CSS.findAll(element, { ...options, maxResults: 1 })[0];
    }

    /**
     * Returns up to `maxResults` unique CSS selectors for `element`, ranked from
     * lowest penalty (shortest / most semantic) to highest (longest / nth-child).
     *
     * @param element Target element
     * @param options Search configuration
     *
     * @returns Array of selectors sorted by ascending penalty
     * @throws {Error} If no selector can be generated
     */
    static findAll(element: HTMLElement, options: Partial<Uindow_CSS_Config> = {}): Uindow_CSS_Result[] {
        // Invalid element
        if (Node.ELEMENT_NODE !== element?.nodeType) {
            throw new Error("Cannot generate a CSS selector for this element");
        }

        // Reached the ceiling
        if ("html" === element.tagName.toLowerCase()) {
            return [{ selector: "html", penalty: 0 }];
        }

        // Sanitize configuration options
        const config = Uindow_CSS.#config(options);
        const startTime = performance.now();

        // Prepare the root
        const root = ((): Uindow_CSS_Root => {
            const shadowRoot = element.getRootNode?.();

            if ("ShadowRoot" === shadowRoot?.constructor?.name) {
                return shadowRoot as ShadowRoot;
            }

            if (Node.DOCUMENT_NODE === (config.root as Node).nodeType) {
                return config.root as Document;
            }

            return (config.root as HTMLElement).ownerDocument ?? config.root;
        })();

        // Limit the number candidates per level
        const pathsPerLevel: Record<number, number> = {};

        // Collect candidate paths
        const candidates: Uindow_CSS_Path[] = [];
        for (const { candidate, level } of Uindow_CSS.#find(element, config, root)) {
            if (performance.now() - startTime > config.timeout) {
                break;
            }

            // Initialize the hashmap
            if ("undefined" === typeof pathsPerLevel[level]) {
                pathsPerLevel[level] = 0;
            }

            // Skip until the next level
            if (pathsPerLevel[level] >= config.maxPathsPerLevel) {
                continue;
            }

            if (Uindow_CSS.#matches(element, config, candidate, root)) {
                // Store the candidate
                candidates.push(candidate);

                // Increment paths per level
                pathsPerLevel[level]++;

                // Total number of paths reached
                if (candidates.length >= config.maxPathsTotal) {
                    break;
                }
            }
        }

        // Fallback: if the generator produced nothing, use a full nth-of-type chain
        if (0 === candidates.length) {
            const fallbackPath = (() => {
                const path: Uindow_CSS_Path = [];

                let level = 0;
                let current: HTMLElement | null = element;
                while (current && current !== root) {
                    const tag = current.tagName.toLowerCase();
                    const index = Uindow_CSS.#indexOf(current, tag);

                    // Out of DOM
                    if (-1 === index) {
                        return [];
                    }

                    path.push({
                        compound: `${tag}:nth-of-type(${index})`,
                        penalty: config.nthOfTypePenalty,
                        level
                    });

                    current = current.parentElement;
                    level++;
                }

                return Uindow_CSS.#matches(element, config, path, root) ? path : [];
            })();
            if (!fallbackPath.length) {
                throw new Error("No fallback CSS selector was not found");
            }

            return [
                {
                    selector: Uindow_CSS.#selector(fallbackPath),
                    penalty: Uindow_CSS.#penalty(fallbackPath, config.lengthPenaltyThreshold)
                }
            ];
        }

        // Prepare the results
        const results: Uindow_CSS_Result[] = [];

        // Hashmap of unique selectors
        const selectors = new Set<string>();
        const append = (path: Uindow_CSS_Path): void => {
            const selector = Uindow_CSS.#selector(path);
            if (!selector || selectors.has(selector)) {
                return;
            }

            selectors.add(selector);
            results.push({ selector, penalty: Uindow_CSS.#penalty(path, config.lengthPenaltyThreshold) });
        };

        // Walk through the candidates
        treatRaw: for (const candidate of candidates) {
            for (const path of Uindow_CSS.#optimize(candidate, element, config, root)) {
                append(path);

                // Wider base
                if (results.length >= config.maxResults * 25) {
                    break treatRaw;
                }
            }

            append(candidate);
        }

        // Sort by penalty
        results.sort((a, b) => a.penalty - b.penalty);

        return results.slice(0, config.maxResults);
    }

    /**
     * Sanitize configuration options.
     *
     * @param options Unsanitized options object
     *
     * @returns Sanitized config
     */
    static #config(options: Partial<Uindow_CSS_Config> = {}): Uindow_CSS_Config {
        if ("object" !== typeof options || null === options) {
            options = {};
        }

        const config = {} as Uindow_CSS_Config;

        // Sanitize inputs
        config.root = options.root instanceof HTMLElement ? options.root : document.documentElement;
        config.idNameFilter = "function" === typeof options.idNameFilter ? options.idNameFilter : () => true;
        config.tagNameFilter = "function" === typeof options.tagNameFilter ? options.tagNameFilter : () => true;
        config.classNameFilter =
            "function" === typeof options.classNameFilter
                ? options.classNameFilter
                : (n: string) => !n.match(/^(is-|has-|js-|css-)/);
        config.attrFilter =
            "function" === typeof options.attrFilter
                ? options.attrFilter
                : (n: string, v: string) => !/(?:width|height|style)$/i.test(n) && 32 >= v.length && !/^(?:\w+:)?\/\/?/i.test(v);

        // Default integers
        const integers: Record<string, number> = {
            lengthPenaltyThreshold: 32,
            maxCandidatesPerLevel: 2500,
            maxPathsPerLevel: 50,
            maxPathsTotal: 1000,
            maxResults: 25,
            fuzziness: 5,
            timeout: 1500
        };
        for (const key of Object.keys(integers) as (keyof typeof integers)[]) {
            const val = (options as Record<string, unknown>)[key];
            (config as unknown as Record<string, number>)[key] = Number.isInteger(val) ? Math.abs(val as number) : integers[key];
        }

        // Default floats
        const floats: Record<string, number> = {
            idPenalty: 1,
            tagPenalty: 1.1,
            classPenalty: 1.3,
            attrPenalty: 1.25,
            attrMatchPenalty: 1.2,
            nthOfTypePenalty: 3,
            nthChildPenalty: 6
        };
        for (const key of Object.keys(floats) as (keyof typeof floats)[]) {
            const val = (options as Record<string, unknown>)[key];
            (config as unknown as Record<string, number>)[key] = Number.isFinite(val) ? Math.abs(val as number) : floats[key];
        }

        return config;
    }

    /**
     * Generator that walks the DOM upward from `element`, yielding candidate
     * paths (arrays of nodes) sorted by ascending penalty at each depth level.
     *
     * @param element Target element
     * @param config  Configuration object
     * @param root    Document root
     *
     * @returns Generator of candidate paths with their level
     */
    static *#find(
        element: HTMLElement,
        config: Uindow_CSS_Config,
        root: Uindow_CSS_Root
    ): Generator<{
        candidate: Uindow_CSS_Path;
        level: number;
    }> {
        let curr: HTMLElement | null = element;
        let level = 0;

        function* combine(
            paths: Uindow_CSS_Path[],
            path: Uindow_CSS_Path = [],
            counter: { count: number } = { count: 0 }
        ): Generator<Uindow_CSS_Path> {
            if (counter.count >= config.maxCandidatesPerLevel) {
                return;
            }

            if (!(0 < paths.length)) {
                counter.count++;
                yield path;
                return;
            }

            for (const node of paths[0]) {
                if (counter.count >= config.maxCandidatesPerLevel) {
                    return;
                }

                yield* combine(paths.slice(1), path.concat(node), counter);
            }
        }

        const pathList: Uindow_CSS_Path[] = [];
        while (curr && curr !== root) {
            pathList.push(Uindow_CSS.#path(curr, config, level));

            // Prepare path
            const path = [...combine(pathList)];
            path.sort(
                (a, b) =>
                    Uindow_CSS.#penalty(a, config.lengthPenaltyThreshold) - Uindow_CSS.#penalty(b, config.lengthPenaltyThreshold)
            );

            // Yield candidates one by one
            for (const candidate of path) {
                yield { candidate, level };
            }

            // Move up one level
            curr = curr.parentElement;
            level++;
        }
    }

    /**
     * Recursively tries dropping intermediate nodes from a path to produce
     * shorter selectors that still uniquely match `element`.
     *
     * @param path    Current path
     * @param element Target element
     * @param config  Configuration object
     * @param root    Document root
     *
     * @returns Generator of optimized paths
     */
    static *#optimize(
        path: Uindow_CSS_Path,
        element: HTMLElement,
        config: Uindow_CSS_Config,
        root: Uindow_CSS_Root
    ): Generator<Uindow_CSS_Path> {
        if (2 >= path.length) {
            return;
        }

        for (let index = 1; index < path.length - 1; index++) {
            const shorter = [...path];
            shorter.splice(index, 1);

            if (!Uindow_CSS.#matches(element, config, shorter, root)) {
                continue;
            }

            yield* Uindow_CSS.#optimize(shorter, element, config, root);
            yield shorter;
        }
    }

    /**
     * Build a path (an array of nodes) for the current element.
     * Covers id, classes, attributes, tag, nth-of-type, and nth-child.
     *
     * @param element Target element
     * @param config  Configuration object
     * @param level   Current level
     *
     * @returns Array of nodes for this element
     */
    static #path(element: HTMLElement, config: Uindow_CSS_Config, level = 0): Uindow_CSS_Path {
        const path: Uindow_CSS_Path = [];

        // ID
        const elementId = element.getAttribute("id");
        if (elementId && config.idNameFilter(elementId)) {
            path.push({ compound: "#" + CSS.escape(elementId), penalty: config.idPenalty, level });
        }

        // Tag
        const tag = element.tagName.toLowerCase();
        if (config.tagNameFilter(tag)) {
            path.push({ compound: tag, penalty: config.tagPenalty, level });

            // tag:nth-of-type()
            const idxOfType = Uindow_CSS.#indexOf(element, tag);
            if (-1 !== idxOfType) {
                path.push({ compound: `${tag}:nth-of-type(${idxOfType})`, penalty: config.nthOfTypePenalty, level });
            }

            // :nth-child()
            const nthIdx = Uindow_CSS.#indexOf(element);
            if (-1 !== nthIdx) {
                path.push({ compound: `:nth-child(${nthIdx})`, penalty: config.nthChildPenalty, level });
            }
        }

        const mergeTwo = (items: string[], penalty: number): void => {
            if (!Array.isArray(items) || 2 > items.length) {
                return;
            }

            if (!Number.isFinite(penalty)) {
                return;
            }

            // Limit list size ( N**2 combinations )
            const end = Math.min(8, items.length);

            // Prepare the combinations
            for (let i = 0; i < end; i++) {
                path.push({ compound: `${tag}${items[i]}`, penalty, level });
                for (let j = i + 1; j < end; j++) {
                    const selector = `${items[i]}${items[j]}`;
                    path.push({ compound: selector, penalty, level });
                    path.push({ compound: `${tag}${selector}`, penalty, level });
                }
            }
        };

        const mergeThree = (items: string[], penalty: number): void => {
            if (!Array.isArray(items) || 3 > items.length) {
                return;
            }

            if (!Number.isFinite(penalty)) {
                return;
            }

            // Limit list size ( N*(N-1)*(N-2)/3 combinations )
            const end = Math.min(8, items.length);

            // Prepare the combinations
            for (let i = 0; i < end; i++) {
                for (let j = i + 1; j < end; j++) {
                    for (let k = j + 1; k < end; k++) {
                        const selector = `${items[i]}${items[j]}${items[k]}`;
                        path.push({ compound: selector, penalty, level });
                        path.push({ compound: `${tag}${selector}`, penalty, level });
                    }
                }
            }
        };

        // Classes
        const classSelectors: string[] = [];
        for (let i = 0; i < element.classList.length; i++) {
            if (config.classNameFilter(element.classList[i])) {
                const selector = `.${CSS.escape(element.classList[i])}`;
                classSelectors.push(selector);
                path.push({ compound: selector, penalty: config.classPenalty, level });
            }
        }
        mergeTwo(classSelectors, config.classPenalty);

        // Attributes
        const attrSelectors: string[] = [];
        const safeValue = (val: string): string => val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

        for (let i = 0; i < element.attributes.length; i++) {
            const attrName = element.attributes[i].name.toLowerCase();
            const attrValue = `${element.attributes[i].value}`;

            // Skip `#id` and `.class` attributes
            if ("id" === attrName || "class" === attrName) {
                continue;
            }

            // Passed attribute checks
            if (config.attrFilter(attrName, attrValue)) {
                // Standard selector
                const selector = `[${CSS.escape(attrName)}${attrValue.length ? `="${safeValue(attrValue)}"` : ""}]`;
                attrSelectors.push(selector);
                path.push({ compound: selector, penalty: config.attrPenalty, level });

                // Prefix match selector
                const startWord = attrValue.match(/^(\w{2,12})/g);
                if (startWord && startWord[0].length < attrValue.length) {
                    const startSelector = `[${CSS.escape(attrName)}^="${safeValue(startWord[0])}"]`;
                    path.push({ compound: startSelector, penalty: config.attrMatchPenalty, level });
                }

                // Suffix match selector
                const endWord = attrValue.match(/(\w{2,12})$/g);
                if (endWord && endWord[0].length < attrValue.length) {
                    const endSelector = `[${CSS.escape(attrName)}$="${safeValue(endWord[0])}"]`;
                    path.push({ compound: endSelector, penalty: config.attrMatchPenalty, level });
                }
            }
        }
        mergeTwo(attrSelectors, config.attrPenalty);

        // Merge classes and attributes
        mergeThree(
            [...classSelectors.slice(0, 4), ...attrSelectors.slice(0, 4)],
            Math.min(config.attrPenalty, config.classPenalty)
        );

        return path;
    }

    /**
     * Build a full (complex) CSS selector from a list of nodes
     * that contain compound CSS selectors.
     *
     * @param path Array of nodes
     *
     * @returns Full CSS selector
     */
    static #selector(path: Uindow_CSS_Path): string {
        if (!path.length) {
            return "";
        }

        let node = path[0];
        let selector = node.compound;

        for (let i = 1; i < path.length; i++) {
            const isParent = (path[i].level ?? 0) - 1 === node.level;
            selector = `${path[i].compound} ${isParent ? "> " : ""}${selector}`;
            node = path[i];
        }

        return selector;
    }

    /**
     * Calculate penalties across all nodes in a path.
     *
     * @param path Path
     * @param lpt  Length Penalty Threshold
     *
     * @returns Total penalty score
     */
    static #penalty(path: Uindow_CSS_Path, lpt = 32): number {
        // Penalty by total length
        const length = path.reduce((acc, node) => acc + node.compound.length, 0);
        const pLength = length > lpt ? length / lpt : 1;

        // Round to 3 digits
        return Math.round(1000 * path.reduce((acc, node) => acc * node.penalty * 1, 1) * pLength) / 1000;
    }

    /**
     * Get the position of `element` among its siblings, optionally filtered
     * to siblings matching `filterTag`.
     *
     * @param element   Target element
     * @param filterTag Optional tag name to filter siblings by
     *
     * @returns 1-based position or `-1` if not found
     */
    static #indexOf(element: HTMLElement, filterTag?: string): number {
        if (!element.parentNode) {
            return -1;
        }

        // Find the first child
        let child: ChildNode | null = element.parentNode.firstChild;
        if (!child) {
            return -1;
        }

        // Loop through siblings
        let index = 0;
        while (child) {
            if (
                Node.ELEMENT_NODE === child.nodeType &&
                ("undefined" === typeof filterTag || (child as HTMLElement).tagName.toLowerCase() === filterTag)
            ) {
                index++;
            }

            if (child === element) {
                break;
            }

            child = child.nextSibling;
        }

        return index;
    }

    /**
     * Returns true if the element matches the CSS selector described by nodes.
     *
     *  * If `config.fuzziness` is `0`, return true if element is the only match.
     *  * If `config.fuzziness` is `100`, return true if element is the first match.
     *
     * Using an intermediary value shifts the strategy probabilistically between the two.
     *
     * @param element Target element
     * @param config  Configuration object
     * @param path    Array of nodes
     * @param root    Document root
     *
     * @returns Whether the element matches the path
     */
    static #matches(element: HTMLElement, config: Uindow_CSS_Config, path: Uindow_CSS_Path, root: Uindow_CSS_Root): boolean {
        try {
            const domElements = (root as ParentNode).querySelectorAll(Uindow_CSS.#selector(path));

            // Decide strategy
            const firstMatch =
                100 <= config.fuzziness || (0 < config.fuzziness && Math.floor(Math.random() * 100) < config.fuzziness);

            // Fuzzy match - true if first element matched by CSS is ours
            if (firstMatch) {
                return domElements[0] === element;
            }

            // Exact match - true if the only matched element is ours
            return 1 === domElements.length;
        } catch (_) {}

        return false;
    }
}

export const { findOne, findAll } = Uindow_CSS;
