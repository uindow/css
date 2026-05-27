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
    idName: (name: string) => boolean;
    /**
     * Function that decides whether an HTML tag name may be used in a selector.
     * Defaults to allowing all tags.
     */
    tagName: (name: string) => boolean;
    /**
     * Function that decides whether a CSS class name may be used in a selector.
     * Defaults to disallowing `is-*|has-*|js-*|css-*` classes.
     */
    className: (name: string) => boolean;
    /**
     * Function that decides whether an attribute `(name, value)` pair may be used
     * in a selector. Defaults to allowing any attribute except `*style|*width|*height`
     * that is shorter than 32 characters, and not a URL.
     */
    attr: (name: string, value: string) => boolean;
    /**
     * Maximum time in milliseconds to spend searching before giving up and
     * returning however many results have been found so far (or the nth-of-type
     * fallback if none were found).
     *
     * @default 1500
     */
    timeout: number;
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
     * Apply a penalty to CSS selectors whose length exceeds this number of characters.
     *
     * A lower value tends to yield shorter CSS selectors.
     *
     * @default 32
     */
    startLengthPenalty: number;
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
declare class Uindow_CSS {
    #private;
    /**
     * Return the single best CSS selector for the target element.
     *
     * @param element Target element
     * @param options Search configuration
     *
     * @returns The best matching selector with its penalty score
     * @throws {Error} If no selector can be generated
     */
    static findOne(element: HTMLElement, options?: Partial<Uindow_CSS_Config>): Uindow_CSS_Result;
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
    static findAll(element: HTMLElement, options?: Partial<Uindow_CSS_Config>): Uindow_CSS_Result[];
}
export declare const findOne: typeof Uindow_CSS.findOne, findAll: typeof Uindow_CSS.findAll;
export {};
