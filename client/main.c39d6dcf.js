parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"oWGu":[function(require,module,exports) {
"use strict";var e=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))(function(i,o){function l(e){try{a(r.next(e))}catch(t){o(t)}}function u(e){try{a(r.throw(e))}catch(t){o(t)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n(function(e){e(t)})).then(l,u)}a((r=r.apply(e,t||[])).next())})},t=this&&this.__generator||function(e,t){var n,r,i,o,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(o){return function(u){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;l;)try{if(n=1,r&&(i=2&o[0]?r.return:o[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,o[1])).done)return i;switch(r=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return l.label++,{value:o[1],done:!1};case 5:l.label++,r=o[1],o=[0];continue;case 7:o=l.ops.pop(),l.trys.pop();continue;default:if(!(i=(i=l.trys).length>0&&i[i.length-1])&&(6===o[0]||2===o[0])){l=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){l.label=o[1];break}if(6===o[0]&&l.label<i[1]){l.label=i[1],i=o;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(o);break}i[2]&&l.ops.pop(),l.trys.pop();continue}o=t.call(e,l)}catch(u){o=[6,u],r=0}finally{n=i=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,u])}}};Object.defineProperty(exports,"__esModule",{value:!0});var n=require("morphdom"),r=function(){function r(e,t){this.dom=e,this.mjController=t}return r.prototype.update=function(r,i){return e(this,void 0,Promise,function(){var e,o,l,u,a,s,c;return t(this,function(t){for(e=function(e){var t=e.firstElementChild;if(!t||"SCRIPT"!==t.nodeName)return"continue";e.isSameNode=function(e){if("SPAN"!==e.nodeName)return!1;var n=e;if(!n.classList.contains("math"))return!1;var r=n.querySelector("script");return!!r&&(t.innerHTML===r.innerHTML&&t.type===r.type)}},o=0,l=Array.from(r.querySelectorAll("span.math"));o<l.length;o++)u=l[o],e(u);for(n(this.dom,r,{childrenOnly:!0,onBeforeElUpdated:function(e,t){return!e.isEqualNode(t)},getNodeKey:function(e){return e.closest&&null!==e.closest("svg")?"":e.id}}),a=0,s=this.dom.querySelectorAll("li");a<s.length;a++)(c=s[a]).firstElementChild&&c.firstElementChild===c.lastElementChild&&"P"===c.firstElementChild.tagName&&c.firstChild&&c.firstChild.nodeType===Node.TEXT_NODE&&"\n"===c.firstChild.textContent&&c.removeChild(c.firstChild);return i?[2,this.mjController.queueTypeset(this.dom)]:[2]})})},r}();exports.UpdatePreview=r;
},{}],"gMOt":[function(require,module,exports) {
"use strict";var t=this&&this.__awaiter||function(t,e,n,r){return new(n||(n=Promise))(function(a,o){function u(t){try{s(r.next(t))}catch(e){o(e)}}function i(t){try{s(r.throw(t))}catch(e){o(e)}}function s(t){var e;t.done?a(t.value):(e=t.value,e instanceof n?e:new n(function(t){t(e)})).then(u,i)}s((r=r.apply(t,e||[])).next())})},e=this&&this.__generator||function(t,e){var n,r,a,o,u={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:i(0),throw:i(1),return:i(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function i(o){return function(i){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;u;)try{if(n=1,r&&(a=2&o[0]?r.return:o[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,o[1])).done)return a;switch(r=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return u.label++,{value:o[1],done:!1};case 5:u.label++,r=o[1],o=[0];continue;case 7:o=u.ops.pop(),u.trys.pop();continue;default:if(!(a=(a=u.trys).length>0&&a[a.length-1])&&(6===o[0]||2===o[0])){u=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){u.label=o[1];break}if(6===o[0]&&u.label<a[1]){u.label=a[1],a=o;break}if(a&&u.label<a[2]){u.label=a[2],u.ops.push(o);break}a[2]&&u.ops.pop(),u.trys.pop();continue}o=e.call(t,u)}catch(i){o=[6,i],r=0}finally{n=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,i])}}};function n(t){var e=document.getElementById("MathJax_SVG_Hidden"),n=e&&e.parentElement;return null!==n?n.outerHTML+t.innerHTML:t.innerHTML}Object.defineProperty(exports,"__esModule",{value:!0}),exports.processHTMLString=n;var r=function(){function n(t,e){this.userMacros=t,this.mathJaxConfig=e,this.readyPromise=this.attachMathJax()}return n.create=function(r,a){return t(this,void 0,void 0,function(){var t;return e(this,function(e){switch(e.label){case 0:return[4,(t=new n(r,a)).readyPromise];case 1:return e.sent(),[2,t]}})})},n.prototype.dispose=function(){var t=document.head.querySelector("script[src='"+n.mjSrc+"']");t&&t.remove()},n.prototype.jaxTeXConfig=function(){return{extensions:this.mathJaxConfig.texExtensions,Macros:this.userMacros,equationNumbers:this.mathJaxConfig.numberEquations?{autoNumber:"AMS",useLabelIds:!1}:{}}},n.prototype.queueTypeset=function(n){return t(this,void 0,void 0,function(){var t=this;return e(this,function(e){return Array.from(document.querySelectorAll('script[type^="math/tex"]')).some(function(t){return!t.id})?[2,new Promise(function(e){MathJax.InputJax.TeX&&(MathJax.Hub.Queue(["resetEquationNumbers",MathJax.InputJax.TeX]),t.mathJaxConfig.numberEquations&&(MathJax.Hub.Queue(["PreProcess",MathJax.Hub]),MathJax.Hub.Queue(["Reprocess",MathJax.Hub]))),MathJax.Hub.Queue(["Typeset",MathJax.Hub,n]),MathJax.Hub.Queue([e])})]:[2]})})},n.prototype.attachMathJax=function(){return t(this,void 0,Promise,function(){return e(this,function(t){switch(t.label){case 0:return[4,a(n.mjSrc)];case 1:return t.sent(),MathJax.Hub.Config({jax:["input/TeX","output/"+this.mathJaxConfig.latexRenderer],extensions:[],TeX:this.jaxTeXConfig(),"HTML-CSS":{availableFonts:[],webFont:"TeX",imageFont:null,undefinedFamily:this.mathJaxConfig.undefinedFamily,mtextFontInherit:!0},messageStyle:"none",showMathMenu:!1,skipStartupTypeset:!0}),MathJax.Hub.Configured(),[2]}})})},n.mjSrc=global.require.resolve("mathjax")+"?delayStartupUntil=configured",n}();function a(n){return t(this,void 0,void 0,function(){var t;return e(this,function(e){return(t=document.createElement("script")).src=n,t.type="text/javascript",document.head.appendChild(t),[2,new Promise(function(e){t.addEventListener("load",function(){return e()})})]})})}exports.MathJaxController=r;
},{}],"BHXf":[function(require,module,exports) {
"use strict";function e(e){e&&e.catch(function(e){console.error(e)})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.handlePromise=e;var r=require("fs");function t(e){return!!r.existsSync(e)&&r.lstatSync(e).isFile()}function n(e,r){for(var t=e,n=0,o=r;n<o.length;n++){var i=o[n],s=t.querySelectorAll(":scope > "+i.tag).item(i.index);if(!s)break;t=s}if(t!==e)return t}exports.isFileSync=t,exports.resolveElement=n;
},{}],"fQo0":[function(require,module,exports) {
"use strict";function e(e){return e.querySelectorAll("img[src],audio[src],video[src],link[href]")}Object.defineProperty(exports,"__esModule",{value:!0}),exports.getMedia=e;
},{}],"ZCfc":[function(require,module,exports) {
"use strict";var e=this&&this.__awaiter||function(e,t,r,n){return new(r||(r=Promise))(function(o,i){function a(e){try{d(n.next(e))}catch(t){i(t)}}function c(e){try{d(n.throw(e))}catch(t){i(t)}}function d(e){var t;e.done?o(e.value):(t=e.value,t instanceof r?t:new r(function(e){e(t)})).then(a,c)}d((n=n.apply(e,t||[])).next())})},t=this&&this.__generator||function(e,t){var r,n,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(r)throw new TypeError("Generator is already executing.");for(;a;)try{if(r=1,n&&(o=2&i[0]?n.return:i[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,i[1])).done)return o;switch(n=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,n=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(c){i=[6,c],n=0}finally{r=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,c])}}},r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)Object.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t.default=e,t};Object.defineProperty(exports,"__esModule",{value:!0});var n=require("electron"),o=require("./update-preview"),i=require("./mathjax-helper"),a=r(require("./util")),c=require("../src/util-common");function d(){var e,t=new Promise(function(t){return e=t});return t.resolve=e,t}window.addEventListener("error",function(e){var t=e.error;n.ipcRenderer.sendToHost("uncaught-error",{message:t.message,name:t.name,stack:t.stack})}),window.addEventListener("unhandledrejection",function(e){var t=e.reason;n.ipcRenderer.sendToHost("uncaught-error",{message:t.message,name:t.name,stack:t.stack})});var u,s={mathJax:d(),sourceLineMap:new Map,revSourceMap:new WeakMap};n.ipcRenderer.on("init",function(e,t){s.mathJax.resolve(i.MathJaxController.create(t.userMacros,t.mathJaxConfig)),document.documentElement.dataset.markdownPreviewPlusContext=t.context,"pdf-export"===t.context&&document.documentElement.style.setProperty("width",t.pdfExportOptions.width+"mm","important")}),n.ipcRenderer.on("set-source-map",function(e,t){var r=t.map,n=document.querySelector("div.update-preview");if(!n)throw new Error("No root element!");for(var o=new Map,i=new WeakMap,c=0,d=Object.keys(r);c<d.length;c++){var u=d[c],l=parseInt(u,10),p=r[l],f=a.resolveElement(n,p);if(f){o.set(l,f);var v=i.get(f);v?v.push(l):i.set(f,[l])}}s.sourceLineMap=o,s.revSourceMap=i}),n.ipcRenderer.on("scroll-sync",function(e,t){var r,n,o=t.firstLine,i=t.lastLine,a=Math.floor(.5*(o+i)),c=s.sourceLineMap;for(r=a;r>=0&&!(n=c.get(r));r-=1);if(n){var d,u,l=Math.max.apply(Math,Array.from(c.keys()));for(d=a+1;d<l&&!(u=c.get(d));d+=1);if(u){var p=n.getBoundingClientRect().top,f=u.getBoundingClientRect().top,v=(a-o)/(i-o),m=document.documentElement.scrollTop-document.documentElement.clientHeight/2+p+v*(f-p);window.scroll({top:m})}}}),n.ipcRenderer.on("style",function(e,t){var r=t.styles,n=document.head.querySelector("style#atom-styles");n||((n=document.createElement("style")).id="atom-styles",document.head.appendChild(n)),n.innerHTML=r.join("\n")}),n.ipcRenderer.on("update-images",function(e,t){for(var r=t.oldsrc,n=t.v,o=c.getMedia(document),i=0,a=Array.from(o);i<a.length;i++){var d=a[i],u=void 0,s=void 0,l=void 0;l="LINK"===d.tagName?"href":"src";var p=d.getAttribute(l),f=p.match(/^(.*)\?v=(\d+)$/);f&&(p=f[1],u=f[2]),p===r&&(void 0!==u&&(s=parseInt(u,10)),n!==s&&(d[l]=n?p+"?v="+n:""+p))}}),n.ipcRenderer.on("sync",function(e,t){var r=t.line,n=t.flash;if(document.querySelector("div.update-preview")){var o=s.sourceLineMap.get(r);if(!o)for(var i=r-1;i>=0&&!(o=s.sourceLineMap.get(r));i-=1);o&&(o.scrollIntoViewIfNeeded(!0),n&&(o.classList.add("flash"),setTimeout(function(){return o.classList.remove("flash")},1e3)))}}),n.ipcRenderer.on("update-preview",function(r,a){var c=a.id,d=a.html,l=a.renderLaTeX;return e(void 0,void 0,void 0,function(){var e,r,a,p,f,v,m,h,g,w;return t(this,function(t){switch(t.label){case 0:return(e=document.querySelector("div.update-preview"))?u?[3,2]:(r=o.UpdatePreview.bind,a=[void 0,e],[4,s.mathJax]):[2];case 1:u=new(r.apply(o.UpdatePreview,a.concat([t.sent()]))),t.label=2;case 2:if(p=new DOMParser,f=p.parseFromString(d,"text/html"),(v=document)&&f.head.hasChildNodes)for((m=v.head.querySelector("original-elements"))||(m=v.createElement("original-elements"),v.head.appendChild(m)),m.innerHTML="",h=0,g=Array.from(f.head.childNodes);h<g.length;h++)w=g[h],m.appendChild(w);return[4,u.update(f.body,l)];case 3:return t.sent(),n.ipcRenderer.sendToHost("request-reply",{id:c,request:"update-preview",result:i.processHTMLString(e)}),[2]}})})});var l,p=document.createElement("base");document.head.appendChild(p),n.ipcRenderer.on("set-base-path",function(e,t){var r=t.path;p.href=r||""}),n.ipcRenderer.on("error",function(e,t){var r=t.msg,n=document.querySelector("div.update-preview");if(n){var o=document.createElement("div");o.innerHTML="<h2>Previewing Markdown Failed</h2><h3>"+r+"</h3>",n.appendChild(o)}}),document.addEventListener("wheel",function(e){e.ctrlKey&&(e.deltaY>0?n.ipcRenderer.sendToHost("zoom-in",void 0):e.deltaY<0&&n.ipcRenderer.sendToHost("zoom-out",void 0),e.preventDefault(),e.stopPropagation())}),document.addEventListener("scroll",function(e){var t=document.documentElement.clientHeight,r=Array.from(s.sourceLineMap.entries()).filter(function(e){e[0];var r=e[1].getBoundingClientRect(),n=r.top,o=r.bottom;return n>0&&o<t}).map(function(e){var t=e[0];e[1];return t});n.ipcRenderer.sendToHost("did-scroll-preview",{max:Math.max.apply(Math,r),min:Math.min.apply(Math,r)})}),document.addEventListener("contextmenu",function(e){l=e.target,n.ipcRenderer.sendToHost("show-context-menu",void 0)}),n.ipcRenderer.on("sync-source",function(e,t){for(var r=t.id,o=l,i=s.revSourceMap,a=i.get(o);!a&&o.parentElement;)o=o.parentElement,a=i.get(o);a&&n.ipcRenderer.sendToHost("request-reply",{id:r,request:"sync-source",result:Math.min.apply(Math,a)})}),n.ipcRenderer.on("reload",function(e,t){var r=t.id;window.onbeforeunload=null,n.ipcRenderer.sendToHost("request-reply",{id:r,request:"reload",result:void 0})}),window.onbeforeunload=function(){return!1},n.ipcRenderer.on("get-tex-config",function(r,o){var i=o.id;return e(void 0,void 0,void 0,function(){var e,r,o,a;return t(this,function(t){switch(t.label){case 0:return r=(e=n.ipcRenderer).sendToHost,o=["request-reply"],a={id:i,request:"get-tex-config"},[4,s.mathJax];case 1:return r.apply(e,o.concat([(a.result=t.sent().jaxTeXConfig(),a)])),[2]}})})}),n.ipcRenderer.on("get-selection",function(r,o){var i=o.id;return e(void 0,void 0,void 0,function(){var e,r,o;return t(this,function(t){return e=window.getSelection(),r=e&&e.toString(),o=e&&e.anchorNode,n.ipcRenderer.sendToHost("request-reply",{id:i,request:"get-selection",result:r&&o?r:void 0}),[2]})})}),document.addEventListener("click",function(e){if(e.target){var t=e.target;if("A"===t.tagName){var r=t.getAttribute("href");if(r&&r.startsWith("#")){e.preventDefault();var n=document.getElementById(decodeURIComponent(r).slice(1));n&&n.scrollIntoView()}}}});
},{"./update-preview":"oWGu","./mathjax-helper":"gMOt","./util":"BHXf","../src/util-common":"fQo0"}]},{},["ZCfc"], null)
//# sourceMappingURL=main.c39d6dcf.js.map