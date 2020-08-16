!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=4)}([function(e,t,r){"use strict";const n=r(1),o=r(2),a=r(3);function c(e){if("string"!=typeof e||1!==e.length)throw new TypeError("arrayFormatSeparator must be single character string")}function i(e,t){return t.encode?t.strict?n(e):encodeURIComponent(e):e}function u(e,t){return t.decode?o(e):e}function l(e){const t=e.indexOf("#");return-1!==t&&(e=e.slice(0,t)),e}function s(e){const t=(e=l(e)).indexOf("?");return-1===t?"":e.slice(t+1)}function f(e,t){return t.parseNumbers&&!Number.isNaN(Number(e))&&"string"==typeof e&&""!==e.trim()?e=Number(e):!t.parseBooleans||null===e||"true"!==e.toLowerCase()&&"false"!==e.toLowerCase()||(e="true"===e.toLowerCase()),e}function p(e,t){c((t=Object.assign({decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1},t)).arrayFormatSeparator);const r=function(e){let t;switch(e.arrayFormat){case"index":return(e,r,n)=>{t=/\[(\d*)\]$/.exec(e),e=e.replace(/\[\d*\]$/,""),t?(void 0===n[e]&&(n[e]={}),n[e][t[1]]=r):n[e]=r};case"bracket":return(e,r,n)=>{t=/(\[\])$/.exec(e),e=e.replace(/\[\]$/,""),t?void 0!==n[e]?n[e]=[].concat(n[e],r):n[e]=[r]:n[e]=r};case"comma":case"separator":return(t,r,n)=>{const o="string"==typeof r&&r.split("").indexOf(e.arrayFormatSeparator)>-1?r.split(e.arrayFormatSeparator).map(t=>u(t,e)):null===r?r:u(r,e);n[t]=o};default:return(e,t,r)=>{void 0!==r[e]?r[e]=[].concat(r[e],t):r[e]=t}}}(t),n=Object.create(null);if("string"!=typeof e)return n;if(!(e=e.trim().replace(/^[?#&]/,"")))return n;for(const o of e.split("&")){let[e,c]=a(t.decode?o.replace(/\+/g," "):o,"=");c=void 0===c?null:["comma","separator"].includes(t.arrayFormat)?c:u(c,t),r(u(e,t),c,n)}for(const e of Object.keys(n)){const r=n[e];if("object"==typeof r&&null!==r)for(const e of Object.keys(r))r[e]=f(r[e],t);else n[e]=f(r,t)}return!1===t.sort?n:(!0===t.sort?Object.keys(n).sort():Object.keys(n).sort(t.sort)).reduce((e,t)=>{const r=n[t];return Boolean(r)&&"object"==typeof r&&!Array.isArray(r)?e[t]=function e(t){return Array.isArray(t)?t.sort():"object"==typeof t?e(Object.keys(t)).sort((e,t)=>Number(e)-Number(t)).map(e=>t[e]):t}(r):e[t]=r,e},Object.create(null))}t.extract=s,t.parse=p,t.stringify=(e,t)=>{if(!e)return"";c((t=Object.assign({encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:","},t)).arrayFormatSeparator);const r=r=>t.skipNull&&(e=>null==e)(e[r])||t.skipEmptyString&&""===e[r],n=function(e){switch(e.arrayFormat){case"index":return t=>(r,n)=>{const o=r.length;return void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,[i(t,e),"[",o,"]"].join("")]:[...r,[i(t,e),"[",i(o,e),"]=",i(n,e)].join("")]};case"bracket":return t=>(r,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,[i(t,e),"[]"].join("")]:[...r,[i(t,e),"[]=",i(n,e)].join("")];case"comma":case"separator":return t=>(r,n)=>null==n||0===n.length?r:0===r.length?[[i(t,e),"=",i(n,e)].join("")]:[[r,i(n,e)].join(e.arrayFormatSeparator)];default:return t=>(r,n)=>void 0===n||e.skipNull&&null===n||e.skipEmptyString&&""===n?r:null===n?[...r,i(t,e)]:[...r,[i(t,e),"=",i(n,e)].join("")]}}(t),o={};for(const t of Object.keys(e))r(t)||(o[t]=e[t]);const a=Object.keys(o);return!1!==t.sort&&a.sort(t.sort),a.map(r=>{const o=e[r];return void 0===o?"":null===o?i(r,t):Array.isArray(o)?o.reduce(n(r),[]).join("&"):i(r,t)+"="+i(o,t)}).filter(e=>e.length>0).join("&")},t.parseUrl=(e,t)=>{t=Object.assign({decode:!0},t);const[r,n]=a(e,"#");return Object.assign({url:r.split("?")[0]||"",query:p(s(e),t)},t&&t.parseFragmentIdentifier&&n?{fragmentIdentifier:u(n,t)}:{})},t.stringifyUrl=(e,r)=>{r=Object.assign({encode:!0,strict:!0},r);const n=l(e.url).split("?")[0]||"",o=t.extract(e.url),a=t.parse(o,{sort:!1}),c=Object.assign(a,e.query);let u=t.stringify(c,r);u&&(u=`?${u}`);let s=function(e){let t="";const r=e.indexOf("#");return-1!==r&&(t=e.slice(r)),t}(e.url);return e.fragmentIdentifier&&(s=`#${i(e.fragmentIdentifier,r)}`),`${n}${u}${s}`}},function(e,t,r){"use strict";e.exports=e=>encodeURIComponent(e).replace(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`)},function(e,t,r){"use strict";var n=new RegExp("%[a-f0-9]{2}","gi"),o=new RegExp("(%[a-f0-9]{2})+","gi");function a(e,t){try{return decodeURIComponent(e.join(""))}catch(e){}if(1===e.length)return e;t=t||1;var r=e.slice(0,t),n=e.slice(t);return Array.prototype.concat.call([],a(r),a(n))}function c(e){try{return decodeURIComponent(e)}catch(o){for(var t=e.match(n),r=1;r<t.length;r++)t=(e=a(t,r).join("")).match(n);return e}}e.exports=function(e){if("string"!=typeof e)throw new TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof e+"`");try{return e=e.replace(/\+/g," "),decodeURIComponent(e)}catch(t){return function(e){for(var t={"%FE%FF":"��","%FF%FE":"��"},r=o.exec(e);r;){try{t[r[0]]=decodeURIComponent(r[0])}catch(e){var n=c(r[0]);n!==r[0]&&(t[r[0]]=n)}r=o.exec(e)}t["%C2"]="�";for(var a=Object.keys(t),i=0;i<a.length;i++){var u=a[i];e=e.replace(new RegExp(u,"g"),t[u])}return e}(e)}}},function(e,t,r){"use strict";e.exports=(e,t)=>{if("string"!=typeof e||"string"!=typeof t)throw new TypeError("Expected the arguments to be of type `string`");if(""===t)return[e];const r=e.indexOf(t);return-1===r?[e]:[e.slice(0,r),e.slice(r+t.length)]}},function(e,t,r){"use strict";r.r(t);function n(e,t,r,n){return new(r||(r=Promise))((function(o,a){function c(e){try{u(n.next(e))}catch(e){a(e)}}function i(e){try{u(n.throw(e))}catch(e){a(e)}}function u(e){e.done?o(e.value):new r((function(t){t(e.value)})).then(c,i)}u((n=n.apply(e,t||[])).next())}))}function o(e,t){var r,n,o,a,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:i(0),throw:i(1),return:i(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function i(a){return function(i){return function(a){if(r)throw new TypeError("Generator is already executing.");for(;c;)try{if(r=1,n&&(o=2&a[0]?n.return:a[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,a[1])).done)return o;switch(n=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return c.label++,{value:a[1],done:!1};case 5:c.label++,n=a[1],a=[0];continue;case 7:a=c.ops.pop(),c.trys.pop();continue;default:if(!(o=(o=c.trys).length>0&&o[o.length-1])&&(6===a[0]||2===a[0])){c=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){c.label=a[1];break}if(6===a[0]&&c.label<o[1]){c.label=o[1],o=a;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(a);break}o[2]&&c.ops.pop(),c.trys.pop();continue}a=t.call(e,c)}catch(e){a=[6,e],n=0}finally{r=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,i])}}}var a=r(0);function c(e){var t=document.querySelector(e);if(!t)throw new Error("Cannot find element with selector "+e);return t}var i=[{title:"Incremental",type:"incremental"},{title:"Incremental Tracked",type:"incrementalTracked"},{title:"React",type:"react"}],u=[{title:"First render",type:"firstRender"},{title:"Update names",type:"updateNames"},{title:"Reorder children",type:"reorderChildren"}],l=[[2,4],[3,3],[2,5],[4,3],[3,4],[11,2],[5,3],[13,2],[14,2],[6,3],[17,2],[4,4],[3,5],[7,3],[21,2],[8,3],[5,4],[9,3],[3,6],[4,5],[6,4]];function s(){return l.map((function(e){var t,r=e[0],n=e[1];return(t={})[Math.pow(r,n)]=[],t})).reduce(Object.assign)}function f(){return{incremental:s(),incrementalTracked:s(),react:s()}}var p={firstRender:f(),updateNames:f(),reorderChildren:f()};function d(e){var t=document.createElement("template");t.innerHTML=e;var r=t.content.firstChild;if(!r)throw new Error("No child in html string");return r}function h(e,t,r,i){return n(this,void 0,void 0,(function(){var n,u,l,s;return o(this,(function(o){switch(o.label){case 0:return n={renderer:e,benchmark:t,childCount:r,childDepth:i},console.log("Starting benchmark",n),window.open("./run-benchmark.html?"+a.stringify(n)),s=(l=JSON).parse,[4,new Promise((function(e){var t=function(r){e(r.data),window.removeEventListener("message",t)};window.addEventListener("message",t)}))];case 1:return u=s.apply(l,[o.sent()]),p[t][e][Math.pow(r,i)].push(u.time),console.log("Benchmark finished",n,u.time),c("#"+function(e,t,r,n){return e+"-"+t+"-"+r+"-"+n+"-results"}(e,t,r,i)).textContent=p[t][e][Math.pow(r,i)].map((function(e){return(e/400).toFixed(2)+"ms"})).join(", "),[2]}}))}))}window.runBenchmark=h,window.runAllBenchmarks=function(){return n(this,void 0,void 0,(function(){var e,t,r,n,a,c,s,f,p,d,y;return o(this,(function(o){switch(o.label){case 0:e=0,o.label=1;case 1:if(!(e<3))return[3,11];t=0,r=u,o.label=2;case 2:if(!(t<r.length))return[3,10];n=r[t],a=0,c=l,o.label=3;case 3:if(!(a<c.length))return[3,9];s=c[a],f=s[0],p=s[1],d=0,y=i,o.label=4;case 4:return d<y.length?[4,h(y[d].type,n.type,f,p)]:[3,8];case 5:return o.sent(),[4,new Promise((function(e){return setTimeout(e,1e3)}))];case 6:o.sent(),o.label=7;case 7:return d++,[3,4];case 8:return a++,[3,3];case 9:return t++,[3,2];case 10:return e++,[3,1];case 11:return[2]}}))}))},window.logResultsCsv=function(){console.log(function(){for(var e={incremental:0,incrementalTracked:0,react:0},t=0,r=u;t<r.length;t++)for(var n=r[t],o=0,a=i;o<a.length;o++)for(var c=a[o],s=0,f=l;s<f.length;s++){var d=f[s],h=d[0],y=d[1];e[c.type]=Math.max(e[c.type],p[n.type][c.type][Math.pow(h,y)].length)}for(var m="Benchmark,Nodes,",g=0,b=i;g<b.length;g++){c=b[g];for(var v=0;v<e[c.type];v++)m+=c.title+" "+v+","}m+="\n";for(var w=0,j=u;w<j.length;w++){n=j[w];for(var k=0,x=l;k<x.length;k++){var O=x[k];h=O[0],y=O[1];m+=n.title+","+Math.pow(h,y)+",";for(var S=0,C=i;S<C.length;S++){c=C[S];var F=p[n.type][c.type][Math.pow(h,y)];for(v=0;v<e[c.type];v++)v<F.length?m+=F[v]/400+",":m+=","}m+="\n"}}return m}())},function(){var e=c("#benchmark-table");e.append(d('<tr class="header-row">\n    <th></th>\n    <th>Incremental</th>\n    <th>Incremental Tracked</th>\n    <th>React</th>\n  </tr>'));for(var t=0,r=u;t<r.length;t++){var n=r[t];e.append(d('<tr>\n      <th scope="row" colspan="'+(i.length+1)+'"><strong>'+n.title+"</strong></th>\n    </tr>"));for(var o=0,a=l;o<a.length;o++){var s=a[o],f=s[0],p=s[1],h=d('<tr>\n        <th scope="row">'+Math.pow(f,p)+" nodes</th>\n      </tr>");e.append(h);for(var y=0,m=i;y<m.length;y++){var g=m[y];h.appendChild(d('<td>\n          <button class="benchmark" onclick="runBenchmark(\''+g.type+"', '"+n.type+"', "+f+", "+p+')">Start</button>\n          <span id="'+g.type+"-"+n.type+"-"+f+"-"+p+'-results"></span>\n        </td>'))}}}}(),window.generateChildCounts=function(){var e,t=Array(20).fill(0).map((function(e,t){return t+2})),r=Array(20).fill(0).map((function(e,t){return t+2})),n=(e=[]).concat.apply(e,t.map((function(e){return r.map((function(t){return{childCount:e,childDepth:t,leaves:Math.pow(e,t),total:Array(t).fill(0).map((function(t,r){return Math.pow(e,r+1)})).reduce((function(e,t){return e+t}))+1}})).filter((function(e){return e.total<=4024}))})));return n.sort((function(e,t){return e.total-t.total})),n}}]);
//# sourceMappingURL=benchmark-index.js.map