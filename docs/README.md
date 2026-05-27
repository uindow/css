# @uindow/css - The Smarter CSS Selector Generator

Generate unique, human-readable CSS selectors for any DOM element.  
Clean output. Configurable penalty model. One selector or many, ranked by quality.

---

## Installation

**npm**

```bash
npm install @uindow/css
```

```js
const { findOne, findAll } = require("@uindow/css");
```

**Browser (standalone)**

```html
<script src="https://uindow.github.io/css/selector.js"></script>
<script>
    const { findOne, findAll } = Uindow_CSS;
</script>
```

---

## Usage

```js
// Best selector for an element
const { selector } = findOne(document.querySelector(".hero"));
// → '[data-id="42"] .hero'

// All viable selectors, ranked from most semantic to most specific
const results = findAll(document.querySelector(".hero"));
// → [
//     { selector: '[data-id="42"] .hero',     penalty: 1.3 },
//     { selector: '.hero',                    penalty: 1.3 },
//     { selector: 'main .hero',               penalty: 2.75 },
//   ]
```

---

## Highlights

- Returns **multiple ranked selectors**, not just one
- Supports **prefix and suffix attribute matching** - `[attr^="start"]`, `[attr$="end"]`
- Always emits **clean, readable** `[attr="value"]` - never CSS-escaped sequences
- Sensible defaults: filters out `style`, `width`, `height`, URLs, and runtime class hooks (`is-*`, `has-*`, `js-*`, `css-*`)
- Fully configurable: penalty weights, filters, path caps, fuzziness, and search timeout
- Full TypeScript support

For the full API and configuration reference, see the [documentation](https://github.com/uindow/css).

---

## License

Apache 2.0 © 2026 [Uindow™](https://uindow.com)
