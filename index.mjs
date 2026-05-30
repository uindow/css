/**
 * Uindow's CSS Selector Generator
 * 
 * @architect Mark Jivko <mark@uindow.com>
 * @copyright © 2026 Uindow™ (https://uindow.com)
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
var j=Object.defineProperty;var O=_=>{throw TypeError(_)};var y=(_,e)=>j(_,"name",{value:e,configurable:!0});var G=(_,e,t)=>e.has(_)||O("Cannot "+t);var v=(_,e,t)=>e.has(_)?O("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(_):e.set(_,t);var h=(_,e,t)=>(G(_,e,"access private method"),t);/**
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
 */var d,z,A,R,D,M,x,E,$;const u=class u{static findOne(e,t={}){return(typeof t!="object"||t===null)&&(t={}),u.findAll(e,{...t,maxResults:1})[0]}static findAll(e,t={}){var g,b,T,s,c,f,S;if(Node.ELEMENT_NODE!==e?.nodeType)throw new Error("Cannot generate a CSS selector for this element");if(e.tagName.toLowerCase()==="html")return[{selector:"html",penalty:0}];const n=h(g=u,d,z).call(g,t),a=performance.now(),r=(()=>{const o=e.getRootNode?.();return o?.constructor?.name==="ShadowRoot"?o:Node.DOCUMENT_NODE===n.root.nodeType?n.root:n.root.ownerDocument??n.root})(),i={},m=[];for(const{candidate:o,level:l}of h(b=u,d,A).call(b,e,n,r)){if(performance.now()-a>n.timeout)break;if(typeof i[l]>"u"&&(i[l]=0),!(i[l]>=n.maxPathsPerLevel)&&h(T=u,d,$).call(T,e,n,o,r)&&(m.push({path:o,penalty:h(s=u,d,x).call(s,o,n)}),i[l]++,m.length>=n.maxPathsTotal))break}if(m.length===0){const o=(()=>{var N,F;const l=[];let w=0,L=e;for(;L&&L!==r;){const k=L.tagName.toLowerCase(),H=h(N=u,d,E).call(N,L,k);if(H===-1)return[];l.push({compound:`${k}:nth-of-type(${H})`,penalty:n.nthOfTypePenalty,level:w}),L=L.parentElement,w++}return h(F=u,d,$).call(F,e,n,l,r)?l:[]})();if(!o.length)throw new Error("No fallback CSS selector was not found");return[{selector:h(c=u,d,M).call(c,o),penalty:h(f=u,d,x).call(f,o,n)}]}m.sort((o,l)=>o.penalty-l.penalty);const P=[],C=new Set,p=y(o=>{var w,L;const l=h(w=u,d,M).call(w,o);!l||C.has(l)||(C.add(l),P.push({selector:l,penalty:h(L=u,d,x).call(L,o,n)}))},"append");t:for(const{path:o}of m){for(const l of h(S=u,d,R).call(S,o,e,n,r))if(p(l),P.length>=n.maxResults*25)break t;p(o)}return P.sort((o,l)=>o.penalty-l.penalty),P.slice(0,n.maxResults)}};d=new WeakSet,z=y(function(e={}){(typeof e!="object"||e===null)&&(e={});const t={};t.root=e.root instanceof HTMLElement?e.root:document.documentElement,t.idFilter=typeof e.idFilter=="function"?e.idFilter:()=>!0,t.tagFilter=typeof e.tagFilter=="function"?e.tagFilter:()=>!0,t.classFilter=typeof e.classFilter=="function"?e.classFilter:r=>!r.match(/^(is-|has-|js-|css-)/),t.attrFilter=typeof e.attrFilter=="function"?e.attrFilter:(r,i)=>!/(?:width|height|style)$/i.test(r)&&i.length<=32&&!/^(?:\w+:)?\/\/?/i.test(i);const n={lengthPenaltyThreshold:32,maxCandidatesPerLevel:2500,maxPathsPerLevel:50,maxPathsTotal:1e3,maxResults:25,fuzziness:0,timeout:1500};for(const r of Object.keys(n))t[r]=Number.isInteger(e[r])?Math.abs(e[r]):n[r];t.lengthPenaltyThreshold<1&&(t.lengthPenaltyThreshold=1),t.maxResults<1&&(t.maxResults=1),t.maxPathsTotal<t.maxResults&&(t.maxPathsTotal=t.maxResults),t.maxPathsPerLevel<t.maxResults&&(t.maxPathsPerLevel=t.maxResults),t.maxCandidatesPerLevel<t.maxPathsPerLevel&&(t.maxCandidatesPerLevel=t.maxPathsPerLevel);const a={idPenalty:1,tagPenalty:1.1,classPenalty:1.3,attrPenalty:1.25,attrMatchPenalty:1.2,nthOfTypePenalty:3,nthChildPenalty:6};for(const r of Object.keys(a))t[r]=Number.isFinite(e[r])?Math.abs(e[r]):a[r];return t},"#config"),A=y(function*(e,t,n){var P;let a=e,r=0;function*i(C,p=[],g={count:0}){if(!(g.count>=t.maxCandidatesPerLevel)){if(!C.length){g.count++,yield p;return}for(const b of C[0]){if(g.count>=t.maxCandidatesPerLevel)return;yield*i(C.slice(1),p.concat(b),g)}}}y(i,"combine");const m=[];for(;a&&a!==n;){m.push(h(P=u,d,D).call(P,a,t,r));const C=[...i(m)];C.sort((p,g)=>{var b,T;return h(b=u,d,x).call(b,p,t)-h(T=u,d,x).call(T,g,t)});for(const p of C)yield{candidate:p,level:r};a=a.parentElement,r++}},"#find"),R=y(function*(e,t,n,a){var r,i;if(!(e.length<=2))for(let m=1;m<e.length-1;m++){const P=[...e];P.splice(m,1),h(r=u,d,$).call(r,t,n,P,a)&&(yield*h(i=u,d,R).call(i,P,t,n,a),yield P)}},"#optimize"),D=y(function(e,t,n=0){var b,T;const a=[],r=e.getAttribute("id");r&&t.idFilter(r)&&a.push({compound:"#"+CSS.escape(r),penalty:t.idPenalty,level:n});const i=e.tagName.toLowerCase();if(t.tagFilter(i)){a.push({compound:i,penalty:t.tagPenalty,level:n});const s=h(b=u,d,E).call(b,e,i);s!==-1&&a.push({compound:`${i}:nth-of-type(${s})`,penalty:t.nthOfTypePenalty,level:n});const c=h(T=u,d,E).call(T,e);c!==-1&&a.push({compound:`:nth-child(${c})`,penalty:t.nthChildPenalty,level:n})}const m=y((s,c)=>{if(!Array.isArray(s)||s.length<2||!Number.isFinite(c))return;const f=Math.min(8,s.length);for(let S=0;S<f;S++){a.push({compound:`${i}${s[S]}`,penalty:c,level:n});for(let o=S+1;o<f;o++){const l=`${s[S]}${s[o]}`;a.push({compound:l,penalty:c,level:n}),a.push({compound:`${i}${l}`,penalty:c,level:n})}}},"mergeTwo"),P=y((s,c)=>{if(!Array.isArray(s)||s.length<3||!Number.isFinite(c))return;const f=Math.min(8,s.length);for(let S=0;S<f;S++)for(let o=S+1;o<f;o++)for(let l=o+1;l<f;l++){const w=`${s[S]}${s[o]}${s[l]}`;a.push({compound:w,penalty:c,level:n}),a.push({compound:`${i}${w}`,penalty:c,level:n})}},"mergeThree"),C=[];for(let s=0;s<e.classList.length;s++)if(t.classFilter(e.classList[s])){const c=`.${CSS.escape(e.classList[s])}`;C.push(c),a.push({compound:c,penalty:t.classPenalty,level:n})}m(C,t.classPenalty);const p=[],g=y(s=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"'),"safeValue");for(let s=0;s<e.attributes.length;s++){const c=e.attributes[s].name.toLowerCase(),f=`${e.attributes[s].value}`;if(!(c==="id"||c==="class")&&t.attrFilter(c,f)){const S=`[${CSS.escape(c)}${f.length?`="${g(f)}"`:""}]`;p.push(S),a.push({compound:S,penalty:t.attrPenalty,level:n});const o=f.match(/^(\w{2,12})/g);if(o&&o[0].length<f.length){const w=`[${CSS.escape(c)}^="${g(o[0])}"]`;a.push({compound:w,penalty:t.attrMatchPenalty,level:n})}const l=f.match(/(\w{2,12})$/g);if(l&&l[0].length<f.length){const w=`[${CSS.escape(c)}$="${g(l[0])}"]`;a.push({compound:w,penalty:t.attrMatchPenalty,level:n})}}}return m(p,t.attrPenalty),P([...C.slice(0,4),...p.slice(0,4)],Math.min(t.attrPenalty,t.classPenalty)),a},"#path"),M=y(function(e){if(!e.length)return"";let t=e[0],n=t.compound;for(let a=1;a<e.length;a++){const r=(e[a].level??0)-1===t.level;n=`${e[a].compound} ${r?"> ":""}${n}`,t=e[a]}return n},"#selector"),x=y(function(e,t){const n=e.reduce((r,i)=>r+i.compound.length,0),a=t.lengthPenaltyThreshold>0&&n>t.lengthPenaltyThreshold?n/t.lengthPenaltyThreshold:1;return Math.round(1e3*e.reduce((r,i)=>r*i.penalty*1,1)*a)/1e3},"#penalty"),E=y(function(e,t){if(!e.parentNode)return-1;let n=e.parentNode.firstChild;if(!n)return-1;let a=0;for(;n&&(Node.ELEMENT_NODE===n.nodeType&&(typeof t!="string"||n.tagName.toLowerCase()===t)&&a++,n!==e);)n=n.nextSibling;return a},"#indexOf"),$=y(function(e,t,n,a){var r;try{const i=a.querySelectorAll(h(r=u,d,M).call(r,n));return t.fuzziness>=100||t.fuzziness>0&&Math.floor(Math.random()*100)<t.fuzziness?i[0]===e:i.length===1}catch{}return!1},"#matches"),v(u,d),y(u,"Uindow_CSS");let U=u;const V=U.findOne.bind(U),W=U.findAll.bind(U);export{W as findAll,V as findOne};
//# sourceMappingURL=index.mjs.map
