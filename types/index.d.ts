/**
 * Uindow's CSS Selector Generator
 *
 * @architect Mark Jivko <mark@uindow.com>
 * @copyright © 2026-present Uindow™ (https://uindow.com)
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Configuration options for the CSS selector generator
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
	idFilter: (name: string) => boolean;
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
	tagFilter: (name: string) => boolean;
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
	classFilter: (name: string) => boolean;
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
	 * Example prefix-matched attribute selector: `[name^="a"]`
	 * Example suffix-matched attribute selector: `[name$="z"]`
	 *
	 * A lower value tends to yield more CSS selectors that contain
	 * prefix-matched and suffix-matched attribute selectors.
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
	 * Must be greater than or equal to 1.
	 *
	 * @default 32
	 */
	lengthPenaltyThreshold: number;
	/**
	 * Hard cap on the number of candidates yielded per level.
	 * Useful for very deep or very wide DOMs where the search space is large.
	 *
	 * Must be greater than or equal to `maxPathsPerLevel`.
	 *
	 * @default 2500
	 */
	maxCandidatesPerLevel: number;
	/**
	 * Hard cap on the number of unique paths yielded per level.
	 * Useful for very deep or very wide DOMs where the search space is large.
	 *
	 * Must be greater than or equal to `maxResults`.
	 *
	 * @default 50
	 */
	maxPathsPerLevel: number;
	/**
	 * Hard cap on the number of unique paths yielded in total.
	 * Useful for very deep or very wide DOMs where the search space is large.
	 *
	 * Must be greater than or equal to `maxResults`.
	 *
	 * @default 1000
	 */
	maxPathsTotal: number;
	/**
	 * Maximum number of optimized selectors to return, sorted by increasing penalty.
	 *
	 * Must be greater than or equal to 1.
	 *
	 * @default 25
	 */
	maxResults: number;
	/**
	 * Trade exclusivity for shorter selectors.
	 * Fuzziness defines the percentage of CSS selectors that match the target element first,
	 * while potentially also matching additional elements on the page.
	 * Set to `0` to ensure CSS selectors match the target element exclusively.
	 * Must be a positive integer between `0` and `100`.
	 *
	 * A higher value tends to yield shorter CSS selectors.
	 *
	 * @default 0
	 */
	fuzziness: number;
	/**
	 * Trade processing time for shorter selectors.
	 * Spend more time optimizing candidate selectors for shorter and more desirable paths.
	 * Must be a positive integer between `0` and `100`.
	 *
	 * A higher value tends to yield shorter CSS selectors at the cost of extra processing time.
	 *
	 * @default 50
	 */
	effort: number;
	/**
	 * Maximum time in milliseconds to spend searching before giving up and
	 * returning however many results have been found so far, or the nth-of-type fallback
	 * if none were found.
	 *
	 * An small additional delay will be incurred after the search, during the
	 * CSS path optimization phase.
	 *
	 * @default 1500
	 */
	timeout: number;
}
/**
 * CSS selector result
 */
export interface Uindow_CSS_Result {
	/**
	 * Optimized CSS selector
	 */
	selector: string;
	/**
	 * CSS selector penalty (the lower, the better)
	 */
	penalty: number;
}
export declare const findOne: (element: HTMLElement, options?: Partial<Uindow_CSS_Config>) => Uindow_CSS_Result;
export declare const findAll: (element: HTMLElement, options?: Partial<Uindow_CSS_Config>) => Uindow_CSS_Result[];
