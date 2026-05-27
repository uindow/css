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
declare class Uindow_CSS {
    #private;
    /**
     * Returns the single best CSS selector string.
     *
     * @param element Target element
     * @param options Optional configuration
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
     * @param options Optional configuration
     *
     * @returns Array of selectors sorted by ascending penalty
     * @throws {Error} If no selector can be generated
     */
    static findAll(element: HTMLElement, options?: Partial<Uindow_CSS_Config>): Uindow_CSS_Result[];
}
export declare const findOne: typeof Uindow_CSS.findOne, findAll: typeof Uindow_CSS.findAll;
export {};
