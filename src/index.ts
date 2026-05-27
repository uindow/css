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
     * @default document.documentElement
     */
    root: HTMLElement | Document;

    /**
     * Predicate that decides whether an HTML ID attribute may be used in a selector.
     * Defaults to allowing all IDs.
     */
    idName: (name: string) => boolean;

    /**
     * Predicate that decides whether an HTML tag name may be used in a selector.
     * Defaults to allowing all tags.
     */
    tagName: (name: string) => boolean;

    /**
     * Predicate that decides whether a CSS class name may be used in a selector.
     * Defaults to disallowing `is-*|has-*|js-*|css-*` classes.
     */
    className: (name: string) => boolean;

    /**
     * Predicate that decides whether an attribute `(name, value)` pair may be used
     * in a selector. Defaults to allowing any attribute except `*style|*width|*height`
     * that is shorter than 32 characters and not a URL.
     */
    attr: (name: string, value: string) => boolean;

    /**
     * Maximum time in milliseconds to spend searching before giving up and
     * returning however many results have been found so far (or the nth-of-type
     * fallback if none were found).
     * @default 1500
     */
    timeout: number;

    /**
     * Percentage of CSS selectors that are fuzzy i.e. they yield a list of multiple
     * elements, and the first element is our target. Set to `0` so that CSS selectors
     * match our target element uniquely.
     * @default 5
     */
    fuzziness: number;

    /**
     * Penalize CSS selectors that have more than this number of characters.
     * @default 32
     */
    lengthPenalty: number;

    /**
     * Hard cap on the number of unique paths yielded in total.
     * Useful for very deep or very wide DOMs where the search space is large.
     * @default 1000
     */
    maxPathsTotal: number;

    /**
     * Hard cap on the number of unique paths yielded per level.
     * Useful for very deep or very wide DOMs where the search space is large.
     * @default 50
     */
    maxPathsPerLevel: number;

    /**
     * Hard cap on the number of candidates yielded per level.
     * Useful for very deep or very wide DOMs where the search space is large.
     * @default 2500
     */
    maxCandidatesPerLevel: number;

    /**
     * Maximum number of unique selectors to return, ordered from lowest penalty
     * (shortest / most semantic) to highest (longest / nth-child fallback).
     * @default 25
     */
    maxResults: number;
}

/**
 * CSS selector node
 */
export interface Uindow_CSS_Node {
    name: string;
    level: number;
    penalty: number;
}

/**
 * CSS selector result
 */
export interface Uindow_CSS_Result {
    selector: string;
    penalty: number;
}

/**
 * @namespace Uindow_CSS
 */
class Uindow_CSS {
    /**
     * Penalties are multiplicative
     */
    static readonly #PENALTY_ID = 1;
    static readonly #PENALTY_TAG = 1.1;
    static readonly #PENALTY_ATTR_MOD = 1.2;
    static readonly #PENALTY_ATTR = 1.25;
    static readonly #PENALTY_CLASS = 1.3;
    static readonly #PENALTY_NTH_OF_TYPE = 3;
    static readonly #PENALTY_NTH_CHILD = 6;

    /**
     * Returns the single best CSS selector string.
     *
     * @param element Target element
     * @param options Optional configuration
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
     * @param options Optional configuration
     *
     * @returns Array of selectors sorted by ascending penalty
     * @throws {Error} If no selector can be generated
     */
    static findAll(element: HTMLElement, options: Partial<Uindow_CSS_Config> = {}): Uindow_CSS_Result[] {
        const startTime = performance.now();

        // Invalid element
        if (Node.ELEMENT_NODE !== element?.nodeType) {
            throw new Error("Cannot generate CSS selector for this element");
        }

        // Can't go up
        if ("html" === element.tagName.toLowerCase()) {
            return [{ selector: "html", penalty: 0 }];
        }

        // Sanitize configuration options
        const config = Uindow_CSS.#config(options);

        // Prepare the root
        const root = ((): Document | ShadowRoot | HTMLElement => {
            const shadowRoot = element.getRootNode?.();

            if ("ShadowRoot" === shadowRoot?.constructor?.name) {
                return shadowRoot as ShadowRoot;
            }

            if (Node.DOCUMENT_NODE === (config.root as Node).nodeType) {
                return config.root as Document;
            }

            return (config.root as HTMLElement).ownerDocument ?? config.root;
        })();

        // Count paths per level
        const pathsPerLevel: Record<number, number> = {};

        // Collect candidate paths from the search generator
        const candidates: Uindow_CSS_Node[][] = [];
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
            const fallbackPath = Uindow_CSS.#fallback(element, config, root);
            if (!fallbackPath.length) {
                throw new Error("No fallback CSS selector was not found");
            }

            return [
                {
                    selector: Uindow_CSS.#selector(fallbackPath),
                    penalty: Uindow_CSS.#penalty(fallbackPath, config.lengthPenalty)
                }
            ];
        }

        const seen = new Set<string>();
        const selectors: Uindow_CSS_Result[] = [];

        const append = (path: Uindow_CSS_Node[]): void => {
            const css = Uindow_CSS.#selector(path);
            if (seen.has(css)) {
                return;
            }

            seen.add(css);
            selectors.push({ selector: css, penalty: Uindow_CSS.#penalty(path, config.lengthPenalty) });
        };

        treatRaw: for (const candidate of candidates) {
            for (const path of Uindow_CSS.#optimize(candidate, element, config, root)) {
                append(path);

                // Wider base
                if (selectors.length >= config.maxResults * 25) {
                    break treatRaw;
                }
            }

            append(candidate);
        }

        // Sort by penalty
        selectors.sort((a, b) => a.penalty - b.penalty);

        return selectors.slice(0, config.maxResults);
    }

    /**
     * Sanitize configuration options.
     *
     * @param options Unsanitized options object
     * @returns Sanitized config
     */
    static #config(options: Partial<Uindow_CSS_Config> = {}): Uindow_CSS_Config {
        if ("object" !== typeof options || null === options) {
            options = {};
        }

        const config = {} as Uindow_CSS_Config;

        // Sanitize inputs
        config.root = options.root instanceof HTMLElement ? options.root : document.documentElement;
        config.idName = "function" === typeof options.idName ? options.idName : () => true;
        config.tagName = "function" === typeof options.tagName ? options.tagName : () => true;
        config.className =
            "function" === typeof options.className ? options.className : (n: string) => !n.match(/^(is-|has-|js-|css-)/);
        config.attr =
            "function" === typeof options.attr
                ? options.attr
                : (n: string, v: string) => !/(?:width|height|style)$/i.test(n) && 32 >= v.length && !/^(?:\w+:)?\/\/?/i.test(v);

        // Default integers
        const integers: Record<string, number> = {
            timeout: 1500,
            fuzziness: 5,
            lengthPenalty: 32,
            maxPathsTotal: 1000,
            maxPathsPerLevel: 50,
            maxCandidatesPerLevel: 2500,
            maxResults: 25
        };

        for (const key of Object.keys(integers) as (keyof typeof integers)[]) {
            const val = (options as Record<string, unknown>)[key];
            (config as unknown as Record<string, number>)[key] = Number.isInteger(val) ? Math.abs(val as number) : integers[key];
        }

        return config;
    }

    /**
     * Generator that walks the DOM upward from `element`, yielding candidate
     * paths (arrays of nodes) sorted by ascending penalty at each depth level.
     *
     * @param element - Target element
     * @param config - Configuration object
     * @param root - Document root
     * @returns Generator of candidate paths with their level
     */
    static *#find(
        element: HTMLElement,
        config: Uindow_CSS_Config,
        root: Document | ShadowRoot | HTMLElement
    ): Generator<{
        candidate: Uindow_CSS_Node[];
        level: number;
    }> {
        let curr: HTMLElement | null = element;
        let level = 0;

        function* combine(
            paths: Uindow_CSS_Node[][],
            path: Uindow_CSS_Node[] = [],
            counter: { count: number } = { count: 0 }
        ): Generator<Uindow_CSS_Node[]> {
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

        const stack: Uindow_CSS_Node[][] = [];
        while (curr && curr !== root) {
            stack.push(Uindow_CSS.#path(curr, config, level));

            // Prepare path
            const path = [...combine(stack)];
            path.sort((a, b) => Uindow_CSS.#penalty(a, config.lengthPenalty) - Uindow_CSS.#penalty(b, config.lengthPenalty));

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
     * @param path - Current path
     * @param element - Target element
     * @param config - Configuration object
     * @param root - Document root
     * @returns Generator of optimized paths
     */
    static *#optimize(
        path: Uindow_CSS_Node[],
        element: HTMLElement,
        config: Uindow_CSS_Config,
        root: Document | ShadowRoot | HTMLElement
    ): Generator<Uindow_CSS_Node[]> {
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
     * Build a path for the current element.
     * Covers id, classes, attributes, tag, nth-of-type, and nth-child.
     *
     * @param element - Target element
     * @param config - Configuration object
     * @param level - Current level
     * @returns Array of candidate nodes for this element
     */
    static #path(element: HTMLElement, config: Uindow_CSS_Config, level = 0): Uindow_CSS_Node[] {
        const nodes: Uindow_CSS_Node[] = [];

        // ID
        const elementId = element.getAttribute("id");
        if (elementId && config.idName(elementId)) {
            nodes.push({ name: "#" + CSS.escape(elementId), penalty: Uindow_CSS.#PENALTY_ID, level });
        }

        // Tag
        const tag = element.tagName.toLowerCase();
        if (config.tagName(tag)) {
            nodes.push({ name: tag, penalty: Uindow_CSS.#PENALTY_TAG, level });

            // tag:nth-of-type()
            const idxOfType = Uindow_CSS.#indexOf(element, tag);
            if (-1 !== idxOfType) {
                nodes.push({ name: `${tag}:nth-of-type(${idxOfType})`, penalty: Uindow_CSS.#PENALTY_NTH_OF_TYPE, level });
            }

            // :nth-child()
            const nthIdx = Uindow_CSS.#indexOf(element);
            if (-1 !== nthIdx) {
                nodes.push({ name: `:nth-child(${nthIdx})`, penalty: Uindow_CSS.#PENALTY_NTH_CHILD, level });
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
                nodes.push({ name: `${tag}${items[i]}`, penalty, level });
                for (let j = i + 1; j < end; j++) {
                    const selector = `${items[i]}${items[j]}`;
                    nodes.push({ name: selector, penalty, level });
                    nodes.push({ name: `${tag}${selector}`, penalty, level });
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
                        nodes.push({ name: selector, penalty, level });
                        nodes.push({ name: `${tag}${selector}`, penalty, level });
                    }
                }
            }
        };

        // Classes
        const classSelectors: string[] = [];
        for (let i = 0; i < element.classList.length; i++) {
            if (config.className(element.classList[i])) {
                const selector = `.${CSS.escape(element.classList[i])}`;
                classSelectors.push(selector);
                nodes.push({ name: selector, penalty: Uindow_CSS.#PENALTY_CLASS, level });
            }
        }
        mergeTwo(classSelectors, Uindow_CSS.#PENALTY_CLASS);

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
            if (config.attr(attrName, attrValue)) {
                // Standard selector
                const selector = `[${CSS.escape(attrName)}${attrValue.length ? `="${safeValue(attrValue)}"` : ""}]`;
                attrSelectors.push(selector);
                nodes.push({ name: selector, penalty: Uindow_CSS.#PENALTY_ATTR, level });

                // Prefix match selector
                const startWord = attrValue.match(/^(\w{2,12})/g);
                if (startWord && startWord[0].length < attrValue.length) {
                    const startSelector = `[${CSS.escape(attrName)}^="${safeValue(startWord[0])}"]`;
                    nodes.push({ name: startSelector, penalty: Uindow_CSS.#PENALTY_ATTR_MOD, level });
                }

                // Suffix match selector
                const endWord = attrValue.match(/(\w{2,12})$/g);
                if (endWord && endWord[0].length < attrValue.length) {
                    const endSelector = `[${CSS.escape(attrName)}$="${safeValue(endWord[0])}"]`;
                    nodes.push({ name: endSelector, penalty: Uindow_CSS.#PENALTY_ATTR_MOD, level });
                }
            }
        }
        mergeTwo(attrSelectors, Uindow_CSS.#PENALTY_ATTR);

        // Merge classes and attributes
        mergeThree(
            [...classSelectors.slice(0, 4), ...attrSelectors.slice(0, 4)],
            Math.min(Uindow_CSS.#PENALTY_ATTR, Uindow_CSS.#PENALTY_CLASS)
        );

        return nodes;
    }

    /**
     * Last-resort fallback: builds a full nth-of-type chain from `element` to root.
     *
     * @param element - Target element
     * @param config - Configuration object
     * @param root - Document root
     * @returns Fallback path — may be empty
     */
    static #fallback(
        element: HTMLElement,
        config: Uindow_CSS_Config,
        root: Document | ShadowRoot | HTMLElement
    ): Uindow_CSS_Node[] {
        let level = 0;
        let current: HTMLElement | null = element;

        const nodes: Uindow_CSS_Node[] = [];
        while (current && current !== root) {
            const tag = current.tagName.toLowerCase();
            const index = Uindow_CSS.#indexOf(current, tag);
            if (-1 === index) {
                return [];
            }

            nodes.push({ name: `${tag}:nth-of-type(${index})`, penalty: Uindow_CSS.#PENALTY_NTH_OF_TYPE, level });

            current = current.parentElement;
            level++;
        }

        return Uindow_CSS.#matches(element, config, nodes, root) ? nodes : [];
    }

    /**
     * Builds a CSS selector string from a path.
     *
     * @param path Array of nodes
     * @returns CSS selector string
     */
    static #selector(path: Uindow_CSS_Node[]): string {
        let node = path[0];
        let query = node.name;

        for (let i = 1; i < path.length; i++) {
            const parent = (path[i].level ?? 0) - 1 === node.level;
            query = `${path[i].name} ${parent ? "> " : ""}${query}`;
            node = path[i];
        }

        return query;
    }

    /**
     * Sum of penalties across all nodes in a path.
     *
     * @param path - Array of nodes
     * @param lengthPenalty - Length penalty threshold
     * @returns Total penalty score
     */
    static #penalty(path: Uindow_CSS_Node[], lengthPenalty = 10): number {
        // Penalty by total length
        const length = path.reduce((acc, node) => acc + node.name.length, 0);
        const pLength = length > lengthPenalty ? length / lengthPenalty : 1;

        // Round to 3 digits
        return Math.round(1000 * path.reduce((acc, node) => acc * node.penalty * 1, 1) * pLength) / 1000;
    }

    /**
     * Get the position of `element` among its siblings, optionally filtered
     * to siblings matching `filterTag`.
     *
     * @param element - Target element
     * @param filterTag - Optional tag name to filter siblings by
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
     * @param element - Target element
     * @param config - Configuration object
     * @param path - Array of nodes
     * @param root - Document root
     * @returns Whether the element matches the path
     */
    static #matches(
        element: HTMLElement,
        config: Uindow_CSS_Config,
        path: Uindow_CSS_Node[],
        root: Document | ShadowRoot | HTMLElement
    ): boolean {
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
