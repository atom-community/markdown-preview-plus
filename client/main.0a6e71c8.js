parcelRequire=function(e,r,n){var t="function"==typeof parcelRequire&&parcelRequire,i="function"==typeof require&&require;function u(n,o){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!o&&f)return f(n,!0);if(t)return t(n,!0);if(i&&"string"==typeof n)return i(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}a.resolve=function(r){return e[n][1][r]||r};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,a,l,l.exports)}return r[n].exports;function a(e){return u(a.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=t;for(var o=0;o<n.length;o++)u(n[o]);return u}({7:[function(require,module,exports) {
"use strict";function e(e){e&&e.catch(function(e){console.error(e)})}exports.__esModule=!0,exports.handlePromise=e;var r=require("fs");function t(e){return!!r.existsSync(e)&&r.lstatSync(e).isFile()}function n(e,r){for(var t=e,n=0,o=r;n<o.length;n++){var s=o[n],i=t.querySelectorAll(":scope > "+s.tag).item(s.index);if(!i)break;t=i}if(t!==e)return t}exports.isFileSync=t,exports.resolveElement=n;
},{}],6:[function(require,module,exports) {
"use strict";var e=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))(function(o,a){function i(e){try{s(r.next(e))}catch(e){a(e)}}function u(e){try{s(r.throw(e))}catch(e){a(e)}}function s(e){e.done?o(e.value):new n(function(t){t(e.value)}).then(i,u)}s((r=r.apply(e,t||[])).next())})},t=this&&this.__generator||function(e,t){var n,r,o,a,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function u(a){return function(u){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,r&&(o=r[2&a[0]?"return":a[0]?"throw":"next"])&&!(o=o.call(r,a[1])).done)return o;switch(r=0,o&&(a=[0,o.value]),a[0]){case 0:case 1:o=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,r=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(o=(o=i.trys).length>0&&o[o.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){i.label=a[1];break}if(6===a[0]&&i.label<o[1]){i.label=o[1],o=a;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(a);break}o[2]&&i.ops.pop(),i.trys.pop();continue}a=t.call(e,i)}catch(e){a=[6,e],r=0}finally{n=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}};exports.__esModule=!0;var n,r=require("path"),o=require("season"),a=require("fs"),i=require("./util"),u=global.require.resolve("mathjax")+"?delayStartupUntil=configured",s="HTML-CSS";function c(n,r){return e(this,void 0,void 0,function(){return t(this,function(e){switch(e.label){case 0:return[4,d()];case 1:return e.sent(),[4,J(n,r)];case 2:return e.sent(),[2]}})})}function l(n){return e(this,void 0,void 0,function(){var e,r;return t(this,function(t){return e=document.getElementById("MathJax_SVG_Hidden"),null!==(r=e&&e.parentElement)?[2,r.innerHTML+n.innerHTML]:[2,n.innerHTML]})})}function d(){return e(this,void 0,void 0,function(){return t(this,function(e){return n?[2,n]:[2,n=M()]})})}function h(){n=void 0;var e=document.head.querySelector("script[src='"+u+"']");e&&e.remove()}function f(){return e(this,void 0,void 0,function(){var e,n,r;return t(this,function(t){switch(t.label){case 0:return[4,v()];case 1:return e=(e=t.sent())?x(e):{},[4,window.atomVars.numberEqns];case 2:return n=t.sent(),r={},[4,window.atomVars.mjxTeXExtensions];case 3:return[2,(r.extensions=t.sent(),r.Macros=e,r.equationNumbers=n?{autoNumber:"AMS",useLabelIds:!1}:{},r)]}})})}function m(){return e(this,void 0,void 0,function(){var e,n;return t(this,function(t){switch(t.label){case 0:return[4,window.atomVars.home];case 1:return e=t.sent(),[2,null!=(n=o.resolve(r.join(e,"markdown-preview-plus")))?n:r.join(e,"markdown-preview-plus.cson")]}})})}function p(e){return o.isObjectPath(e)?o.readFileSync(e,function(t,n){return void 0===n&&(n={}),void 0!==t&&(console.warn("Error reading Latex Macros file '"+e+"': "+(void 0!==t.stack?t.stack:t)),console.error("Failed to load Latex Macros from '"+e+"'",{detail:t.message,dismissable:!0})),n}):{}}function v(){return e(this,void 0,void 0,function(){var e;return t(this,function(t){switch(t.label){case 0:return[4,m()];case 1:return e=t.sent(),i.isFileSync(e)?[2,p(e)]:(console.debug("Creating markdown-preview-plus.cson, this is a one-time operation."),b(e),[2,p(e)])}})})}function b(e){var t=r.join(__dirname,"../assets/macros-template.cson"),n=a.readFileSync(t,"utf8");a.writeFileSync(e,n)}function x(e){var t=/^[^a-zA-Z\d\s]$|^[a-zA-Z]*$/;for(var n in e){var r=e[n];n.match(t)&&w(r)||(delete e[n],console.error("Failed to load LaTeX macro named '"+n+"'. Please see the [LaTeX guide](https://github.com/atom-community/markdown-preview-plus/blob/master/docs/math.md#macro-names)"))}return e}function w(e){if(Array.isArray(e)){var t=e[0],n=e[1];return"number"==typeof n&&(n%1==0&&"string"==typeof t)}return"string"==typeof e}function y(){return e(this,void 0,void 0,function(){var e,n,r,o,a;return t(this,function(t){switch(t.label){case 0:return n=(e=MathJax.Hub).Config,r={jax:["input/TeX","output/"+s],extensions:[]},[4,f()];case 1:return r.TeX=t.sent(),o="HTML-CSS",a={availableFonts:[],webFont:"TeX",imageFont:null,mtextFontInherit:!0},[4,window.atomVars.mjxUndefinedFamily];case 2:return n.apply(e,[(r[o]=(a.undefinedFamily=t.sent(),a),r.messageStyle="none",r.showMathMenu=!1,r.skipStartupTypeset=!0,r)]),MathJax.Hub.Configured(),console.log("Loaded maths rendering engine MathJax"),[2]}})})}function M(){return e(this,void 0,void 0,function(){return t(this,function(e){switch(e.label){case 0:return console.log("Loading maths rendering engine MathJax"),[4,Promise.all([g(u)])];case 1:return e.sent(),[4,y()];case 2:return e.sent(),[2]}})})}function g(n){return e(this,void 0,void 0,function(){var e;return t(this,function(t){return(e=document.createElement("script")).src=n,e.type="text/javascript",document.head.appendChild(e),[2,new Promise(function(t){e.addEventListener("load",function(){return t()})})]})})}function J(n,r){return e(this,void 0,void 0,function(){var e;return t(this,function(t){switch(t.label){case 0:return Array.from(document.querySelectorAll('script[type^="math/tex"]')).some(function(e){return!e.id})?[4,window.atomVars.numberEqns]:[2];case 1:return e=t.sent(),[2,new Promise(function(t){MathJax.InputJax.TeX&&(MathJax.Hub.Queue(["resetEquationNumbers",MathJax.InputJax.TeX]),e&&(MathJax.Hub.Queue(["PreProcess",MathJax.Hub]),MathJax.Hub.Queue(["Reprocess",MathJax.Hub]))),MathJax.Hub.Queue(["setRenderer",MathJax.Hub,r]),MathJax.Hub.Queue(["Typeset",MathJax.Hub,n]),MathJax.Hub.Queue(["setRenderer",MathJax.Hub,s]),MathJax.Hub.Queue([t])})]}})})}exports.mathProcessor=c,exports.processHTMLString=l,exports.unloadMathJax=h,exports.jaxTeXConfig=f;
},{"./util":7}],5:[function(require,module,exports) {
"use strict";var e=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))(function(o,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function u(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?o(e.value):new n(function(t){t(e.value)}).then(a,u)}c((r=r.apply(e,t||[])).next())})},t=this&&this.__generator||function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=r[2&i[0]?"return":i[0]?"throw":"next"])&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[0,o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}};exports.__esModule=!0;var n=require("morphdom"),r=require("./mathjax-helper"),o=function(){function o(e){this.dom=e}return o.prototype.update=function(o,i,a){return e(this,void 0,void 0,function(){var e,u,c,l,s;return t(this,function(t){for(e=void 0===this.cachedMJRenderer?a:this.cachedMJRenderer,this.cachedMJRenderer=a,u=function(t){var n=t.firstElementChild;if(!n||"SCRIPT"!==n.nodeName)return"continue";t.isSameNode=function(t){if(e!==a)return!1;if("SPAN"!==t.nodeName)return!1;var r=t;if(!r.classList.contains("math"))return!1;var o=r.querySelector("script");return!!o&&n.innerHTML===o.innerHTML}},c=0,l=Array.from(o.querySelectorAll("span.math"));c<l.length;c++)s=l[c],u(s);return n(this.dom,o,{childrenOnly:!0,onElUpdated:function(e){"LI"===e.tagName&&(e.innerHTML=e.innerHTML)}}),i?[2,r.mathProcessor(this.dom,a)]:[2]})})},o}();exports.UpdatePreview=o;
},{"./mathjax-helper":6}],8:[function(require,module,exports) {
"use strict";function e(e){return e.querySelectorAll("img[src],audio[src],video[src]")}Object.defineProperty(exports,"__esModule",{value:!0}),exports.getMedia=e;
},{}],2:[function(require,module,exports) {
"use strict";var e=this&&this.__awaiter||function(e,r,t,n){return new(t||(t=Promise))(function(o,i){function a(e){try{s(n.next(e))}catch(e){i(e)}}function u(e){try{s(n.throw(e))}catch(e){i(e)}}function s(e){e.done?o(e.value):new t(function(r){r(e.value)}).then(a,u)}s((n=n.apply(e,r||[])).next())})},r=this&&this.__generator||function(e,r){var t,n,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;a;)try{if(t=1,n&&(o=n[2&i[0]?"return":i[0]?"throw":"next"])&&!(o=o.call(n,i[1])).done)return o;switch(n=0,o&&(i=[0,o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,n=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=r.call(e,a)}catch(e){i=[6,e],n=0}finally{t=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}},t=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var t in e)Object.hasOwnProperty.call(e,t)&&(r[t]=e[t]);return r.default=e,r},n=this;exports.__esModule=!0;var o,i=require("electron"),a=require("./update-preview"),u=require("./mathjax-helper"),s=t(require("./util")),c=require("../src/util-common");function d(){var e,r=new Promise(function(r){return e=r});return r.resolve=e,r}window.atomVars={home:d(),numberEqns:d(),mjxTeXExtensions:d(),mjxUndefinedFamily:d(),sourceLineMap:new Map,revSourceMap:new WeakMap},i.ipcRenderer.on("init",function(e,r){var t=r.atomHome,n=r.numberEqns,o=r.mjxTeXExtensions,i=r.mjxUndefinedFamily;window.atomVars.home.resolve(t),window.atomVars.numberEqns.resolve(n),window.atomVars.mjxTeXExtensions.resolve(o),window.atomVars.mjxUndefinedFamily.resolve(i)}),i.ipcRenderer.on("set-source-map",function(e,r){var t=r.map,n=document.querySelector("div.update-preview");if(!n)throw new Error("No root element!");for(var o=new Map,i=new WeakMap,a=0,u=Object.keys(t);a<u.length;a++){var c=u[a],d=parseInt(c,10),l=t[d],p=s.resolveElement(n,l);if(p){o.set(d,p);var m=i.get(p);m?m.push(d):i.set(p,[d])}}window.atomVars.sourceLineMap=o,window.atomVars.revSourceMap=i}),i.ipcRenderer.on("scroll-sync",function(e,r){var t,n,o=r.firstLine,i=r.lastLine,a=Math.floor(.5*(o+i)),u=window.atomVars.sourceLineMap;for(t=a;t>=0&&!(n=u.get(t));t-=1);if(n){var s,c,d=Math.max.apply(Math,Array.from(u.keys()));for(s=a+1;s<d&&!(c=u.get(s));s+=1);if(c){var l=n.getBoundingClientRect().top,p=c.getBoundingClientRect().top,m=(a-o)/(i-o),f=document.documentElement.scrollTop-document.documentElement.clientHeight/2+l+m*(p-l);window.scroll({top:f})}}}),i.ipcRenderer.on("style",function(e,r){var t=r.styles,n=document.head.querySelector("style#atom-styles");n||((n=document.createElement("style")).id="atom-styles",document.head.appendChild(n)),n.innerHTML=t.join("\n")}),i.ipcRenderer.on("update-images",function(e,r){for(var t=r.oldsrc,n=r.v,o=c.getMedia(document),i=0,a=Array.from(o);i<a.length;i++){var u=a[i],s=void 0,d=void 0,l=u.getAttribute("src"),p=l.match(/^(.*)\?v=(\d+)$/);p&&(l=p[1],s=p[2]),l===t&&(void 0!==s&&(d=parseInt(s,10)),n!==d&&(u.src=n?l+"?v="+n:""+l))}}),i.ipcRenderer.on("sync",function(e,r){var t=r.line;if(document.querySelector("div.update-preview")){var n=window.atomVars.sourceLineMap.get(t);if(!n)for(var o=t-1;o>=0&&!(n=window.atomVars.sourceLineMap.get(t));o-=1);n&&(n.scrollIntoViewIfNeeded(!0),n.classList.add("flash"),setTimeout(function(){return n.classList.remove("flash")},1e3))}}),i.ipcRenderer.on("use-github-style",function(e,r){var t=r.value,n=document.querySelector("markdown-preview-plus-view");if(!n)throw new Error("Can't find MPP-view");t?n.setAttribute("data-use-github-style",""):n.removeAttribute("data-use-github-style")}),i.ipcRenderer.on("update-preview",function(t,c){var d=c.id,l=c.html,p=c.renderLaTeX,m=c.mjrenderer,f=document.querySelector("div.update-preview");if(f){o||(o=new a.UpdatePreview(f));var v=(new DOMParser).parseFromString(l,"text/html");s.handlePromise(o.update(v.body,p,m).then(function(){return e(n,void 0,void 0,function(){var e,t,n,o;return r(this,function(r){switch(r.label){case 0:return t=(e=i.ipcRenderer).sendToHost,n=["request-reply"],o={id:d,request:"update-preview"},[4,u.processHTMLString(f)];case 1:return t.apply(e,n.concat([(o.result=r.sent(),o)])),[2]}})})}));var h=document;if(h&&v.head.hasChildNodes){var w=h.head.querySelector("original-elements");w||(w=h.createElement("original-elements"),h.head.appendChild(w)),w.innerHTML="";for(var y=0,g=Array.from(v.head.childNodes);y<g.length;y++){var b=g[y];w.appendChild(b)}}}});var l,p=document.createElement("base");document.head.appendChild(p),i.ipcRenderer.on("set-base-path",function(e,r){var t=r.path;p.href=t||""}),i.ipcRenderer.on("error",function(e,r){var t=r.msg,n=document.querySelector("div.update-preview");if(n){var o=document.createElement("div");o.innerHTML="<h2>Previewing Markdown Failed</h2><h3>"+t+"</h3>",n.appendChild(o)}}),document.addEventListener("mousewheel",function(e){e.ctrlKey&&(e.wheelDeltaY>0?i.ipcRenderer.sendToHost("zoom-in",void 0):e.wheelDeltaY<0&&i.ipcRenderer.sendToHost("zoom-out",void 0),e.preventDefault(),e.stopPropagation())}),document.addEventListener("scroll",function(e){var r=document.documentElement.clientHeight,t=Array.from(window.atomVars.sourceLineMap.entries()).filter(function(e){e[0];var t=e[1].getBoundingClientRect(),n=t.top,o=t.bottom;return n>0&&o<r}).map(function(e){var r=e[0];e[1];return r});i.ipcRenderer.sendToHost("did-scroll-preview",{max:Math.max.apply(Math,t),min:Math.min.apply(Math,t)})}),document.addEventListener("contextmenu",function(e){l=e.target}),i.ipcRenderer.on("sync-source",function(e,r){for(var t=r.id,n=l,o=window.atomVars.revSourceMap,a=o.get(n);!a&&n.parentElement;)n=n.parentElement,a=o.get(n);a&&i.ipcRenderer.sendToHost("request-reply",{id:t,request:"sync-source",result:Math.min.apply(Math,a)})}),i.ipcRenderer.on("reload",function(e,r){var t=r.id;window.onbeforeunload=null,i.ipcRenderer.sendToHost("request-reply",{id:t,request:"reload",result:void 0})}),window.onbeforeunload=function(){return!1},i.ipcRenderer.on("get-tex-config",function(t,o){var a=o.id;return e(n,void 0,void 0,function(){var e,t,n,o;return r(this,function(r){switch(r.label){case 0:return t=(e=i.ipcRenderer).sendToHost,n=["request-reply"],o={id:a,request:"get-tex-config"},[4,u.jaxTeXConfig()];case 1:return t.apply(e,n.concat([(o.result=r.sent(),o)])),[2]}})})});
},{"./update-preview":5,"./mathjax-helper":6,"./util":7,"../src/util-common":8}]},{},[2])
//# sourceMappingURL=main.0a6e71c8.map