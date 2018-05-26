"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const util_1 = require("../util");
function editorForId(editorId) {
    for (const editor of atom.workspace.getTextEditors()) {
        if (editor.id === editorId) {
            return editor;
        }
    }
    return undefined;
}
exports.editorForId = editorForId;
let getStylesOverride = undefined;
function __setGetStylesOverride(f) {
    getStylesOverride = f;
}
exports.__setGetStylesOverride = __setGetStylesOverride;
function getStyles(context) {
    if (getStylesOverride)
        return getStylesOverride(context);
    const textEditorStyles = document.createElement('atom-styles');
    textEditorStyles.initialize(atom.styles);
    textEditorStyles.setAttribute('context', context);
    return Array.from(textEditorStyles.childNodes).map((styleElement) => styleElement.innerText);
}
exports.getStyles = getStyles;
function getMarkdownPreviewCSS() {
    const markdowPreviewRules = ['body { padding: 0; margin: 0; }'];
    const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;
    return markdowPreviewRules
        .concat(getStyles('markdown-preview-plus'))
        .concat(getStyles('atom-text-editor'))
        .join('\n')
        .replace(/\batom-text-editor\b/g, 'pre.editor-colors')
        .replace(/\bmarkdown-preview-plus-view\b/g, '.markdown-preview-plus-view')
        .replace(/\b\.\.markdown-preview-plus-view\b/g, '.markdown-preview-plus-view')
        .replace(cssUrlRefExp, function (_match, assetsName, _offset, _string) {
        const assetPath = path.join(__dirname, '../../assets', assetsName);
        const originalData = fs.readFileSync(assetPath, 'binary');
        const base64Data = new Buffer(originalData, 'binary').toString('base64');
        return `url('data:image/jpeg;base64,${base64Data}')`;
    });
}
function decodeTag(token) {
    if (token.tag === 'math') {
        return 'span';
    }
    if (token.tag === 'code') {
        return 'atom-text-editor';
    }
    if (token.tag === '') {
        return null;
    }
    return token.tag;
}
function buildLineMap(tokens) {
    const lineMap = {};
    const tokenTagCount = {};
    tokenTagCount[0] = {};
    for (const token of tokens) {
        if (token.hidden)
            continue;
        if (token.map == null)
            continue;
        const tag = decodeTag(token);
        if (tag === null)
            continue;
        if (token.nesting === 1) {
            for (let line = token.map[0]; line < token.map[1]; line += 1) {
                if (lineMap[line] == null)
                    lineMap[line] = [];
                lineMap[line].push({
                    tag: tag,
                    index: tokenTagCount[token.level][tag] || 0,
                });
            }
            tokenTagCount[token.level + 1] = {};
        }
        else if (token.nesting === 0) {
            for (let line = token.map[0]; line < token.map[1]; line += 1) {
                if (lineMap[line] == null)
                    lineMap[line] = [];
                lineMap[line].push({
                    tag: tag,
                    index: tokenTagCount[token.level][tag] || 0,
                });
            }
        }
        const ttc = tokenTagCount[token.level][tag];
        tokenTagCount[token.level][tag] = ttc ? ttc + 1 : 1;
    }
    return lineMap;
}
exports.buildLineMap = buildLineMap;
function mathJaxScript(texConfig) {
    return `\
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    jax: ["input/TeX","output/HTML-CSS"],
    extensions: ["[a11y]/accessibility-menu.js"],
    'HTML-CSS': {
      availableFonts: [],
      webFont: 'TeX',
      undefinedFamily: "${util_1.atomConfig().mathConfig.undefinedFamily.replace('"', "'")}",
      mtextFontInherit: true,
    },
    TeX: ${JSON.stringify(texConfig, undefined, 2)},
    showMathMenu: true
  });
</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js"></script>`;
}
function mkHtml(title, html, renderLaTeX, useGithubStyle, texConfig) {
    const githubStyle = useGithubStyle ? ' data-use-github-style' : '';
    let maybeMathJaxScript;
    if (renderLaTeX) {
        maybeMathJaxScript = mathJaxScript(texConfig);
    }
    else {
        maybeMathJaxScript = '';
    }
    return `\
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>${maybeMathJaxScript}
    <style>${getMarkdownPreviewCSS()}</style>
${html.head.innerHTML}
  </head>
  <body class="markdown-preview-plus-view"${githubStyle}>
    ${html.body.innerHTML}
  </body>
</html>
`;
}
exports.mkHtml = mkHtml;
function destroy(item) {
    const pane = atom.workspace.paneForItem(item);
    if (pane)
        util_1.handlePromise(pane.destroyItem(item));
}
exports.destroy = destroy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE0QjtBQUM1Qix5QkFBd0I7QUFFeEIsa0NBQW1EO0FBRW5ELHFCQUE0QixRQUFnQjtJQUMxQyxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUU7UUFDcEQsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLFFBQVEsRUFBRTtZQUMxQixPQUFPLE1BQU0sQ0FBQTtTQUNkO0tBQ0Y7SUFDRCxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBUEQsa0NBT0M7QUFHRCxJQUFJLGlCQUFpQixHQUFpQyxTQUFTLENBQUE7QUFFL0QsZ0NBQXVDLENBQW9CO0lBQ3pELGlCQUFpQixHQUFHLENBQUMsQ0FBQTtBQUN2QixDQUFDO0FBRkQsd0RBRUM7QUFFRCxtQkFBMEIsT0FBZTtJQUN2QyxJQUFJLGlCQUFpQjtRQUFFLE9BQU8saUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDeEQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUM3QyxhQUFhLENBQzhDLENBQUE7SUFDN0QsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN4QyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBR2pELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQ2hELENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBRSxZQUFpQyxDQUFDLFNBQVMsQ0FDL0QsQ0FBQTtBQUNILENBQUM7QUFaRCw4QkFZQztBQUVEO0lBQ0UsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7SUFDL0QsTUFBTSxZ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VyxFQUFFO1FBQ2Ysa0JBQWtCLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQzlDO1NBQU07UUFDTCxrQkFBa0IsR0FBRyxFQUFFLENBQUE7S0FDeEI7SUFDRCxPQUFPOzs7OzthQUtJLEtBQUssV0FBVyxrQkFBa0I7YUFDbEMscUJBQXFCLEVBQUU7RUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTOzs0Q0FFdUIsV0FBVztNQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7OztDQUd4QixDQUFBO0FBQ0QsQ0FBQztBQTVCRCx3QkE0QkM7QUFFRCxpQkFBd0IsSUFBWTtJQUNsQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxJQUFJLElBQUk7UUFBRSxvQkFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNqRCxDQUFDO0FBSEQsMEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUZXh0RWRpdG9yLCBTdHlsZU1hbmFnZXIgfSBmcm9tICdhdG9tJ1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJ1xyXG5pbXBvcnQgeyBUb2tlbiB9IGZyb20gJ21hcmtkb3duLWl0J1xyXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlLCBhdG9tQ29uZmlnIH0gZnJvbSAnLi4vdXRpbCdcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlZGl0b3JGb3JJZChlZGl0b3JJZDogbnVtYmVyKTogVGV4dEVkaXRvciB8IHVuZGVmaW5lZCB7XHJcbiAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xyXG4gICAgaWYgKGVkaXRvci5pZCA9PT0gZWRpdG9ySWQpIHtcclxuICAgICAgcmV0dXJuIGVkaXRvclxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdW5kZWZpbmVkXHJcbn1cclxuXHJcbi8vIHRoaXMgd2VpcmRuZXNzIGFsbG93cyBvdmVycmlkaW5nIGluIHRlc3RzXHJcbmxldCBnZXRTdHlsZXNPdmVycmlkZTogdHlwZW9mIGdldFN0eWxlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc2V0R2V0U3R5bGVzT3ZlcnJpZGUoZj86IHR5cGVvZiBnZXRTdHlsZXMpIHtcclxuICBnZXRTdHlsZXNPdmVycmlkZSA9IGZcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0eWxlcyhjb250ZXh0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcbiAgaWYgKGdldFN0eWxlc092ZXJyaWRlKSByZXR1cm4gZ2V0U3R5bGVzT3ZlcnJpZGUoY29udGV4dClcclxuICBjb25zdCB0ZXh0RWRpdG9yU3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcclxuICAgICdhdG9tLXN0eWxlcycsXHJcbiAgKSBhcyBIVE1MRWxlbWVudCAmIHsgaW5pdGlhbGl6ZShzdHlsZXM6IFN0eWxlTWFuYWdlcik6IHZvaWQgfVxyXG4gIHRleHRFZGl0b3JTdHlsZXMuaW5pdGlhbGl6ZShhdG9tLnN0eWxlcylcclxuICB0ZXh0RWRpdG9yU3R5bGVzLnNldEF0dHJpYnV0ZSgnY29udGV4dCcsIGNvbnRleHQpXHJcblxyXG4gIC8vIEV4dHJhY3Qgc3R5bGUgZWxlbWVudHMgY29udGVudFxyXG4gIHJldHVybiBBcnJheS5mcm9tKHRleHRFZGl0b3JTdHlsZXMuY2hpbGROb2RlcykubWFwKFxyXG4gICAgKHN0eWxlRWxlbWVudCkgPT4gKHN0eWxlRWxlbWVudCBhcyBIVE1MU3R5bGVFbGVtZW50KS5pbm5lclRleHQsXHJcbiAgKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNYXJrZG93blByZXZpZXdDU1MoKSB7XHJcbiAgY29uc3QgbWFya2Rvd1ByZXZpZXdSdWxlcyA9IFsnYm9keSB7IHBhZGRpbmc6IDA7IG1hcmdpbjogMDsgfSddXHJcbiAgY29uc3QgY3NzVXJsUmVmRXhwID0gL3VybFxcKGF0b206XFwvXFwvbWFya2Rvd24tcHJldmlldy1wbHVzXFwvYXNzZXRzXFwvKC4qKVxcKS9cclxuXHJcbiAgcmV0dXJuIG1hcmtkb3dQcmV2aWV3UnVsZXNcclxuICAgIC5jb25jYXQoZ2V0U3R5bGVzKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKSlcclxuICAgIC5jb25jYXQoZ2V0U3R5bGVzKCdhdG9tLXRleHQtZWRpdG9yJykpXHJcbiAgICAuam9pbignXFxuJylcclxuICAgIC5yZXBsYWNlKC9cXGJhdG9tLXRleHQtZWRpdG9yXFxiL2csICdwcmUuZWRpdG9yLWNvbG9ycycpXHJcbiAgICAucmVwbGFjZSgvXFxibWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdcXGIvZywgJy5tYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlldycpXHJcbiAgICAucmVwbGFjZShcclxuICAgICAgL1xcYlxcLlxcLm1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3XFxiL2csXHJcbiAgICAgICcubWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXcnLFxyXG4gICAgKVxyXG4gICAgLnJlcGxhY2UoY3NzVXJsUmVmRXhwLCBmdW5jdGlvbihcclxuICAgICAgX21hdGNoLFxyXG4gICAgICBhc3NldHNOYW1lOiBzdHJpbmcsXHJcbiAgICAgIF9vZmZzZXQsXHJcbiAgICAgIF9zdHJpbmcsXHJcbiAgICApIHtcclxuICAgICAgLy8gYmFzZTY0IGVuY29kZSBhc3NldHNcclxuICAgICAgY29uc3QgYXNzZXRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2Fzc2V0cycsIGFzc2V0c05hbWUpXHJcbiAgICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhc3NldFBhdGgsICdiaW5hcnknKVxyXG4gICAgICBjb25zdCBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcclxuICAgICAgcmV0dXJuIGB1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiYXNlNjREYXRhfScpYFxyXG4gICAgfSlcclxufVxyXG5cclxuLy9cclxuLy8gRGVjb2RlIHRhZ3MgdXNlZCBieSBtYXJrZG93bi1pdFxyXG4vL1xyXG4vLyBAcGFyYW0ge21hcmtkb3duLWl0LlRva2VufSB0b2tlbiBEZWNvZGUgdGhlIHRhZyBvZiB0b2tlbi5cclxuLy8gQHJldHVybiB7c3RyaW5nfG51bGx9IERlY29kZWQgdGFnIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaGFzIG5vIHRhZy5cclxuLy9cclxuZnVuY3Rpb24gZGVjb2RlVGFnKHRva2VuOiBUb2tlbik6IHN0cmluZyB8IG51bGwge1xyXG4gIGlmICh0b2tlbi50YWcgPT09ICdtYXRoJykge1xyXG4gICAgcmV0dXJuICdzcGFuJ1xyXG4gIH1cclxuICBpZiAodG9rZW4udGFnID09PSAnY29kZScpIHtcclxuICAgIHJldHVybiAnYXRvbS10ZXh0LWVkaXRvcidcclxuICB9XHJcbiAgaWYgKHRva2VuLnRhZyA9PT0gJycpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG4gIHJldHVybiB0b2tlbi50YWdcclxufVxyXG5cclxuLy9cclxuLy8gRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgdG9rZW4uXHJcbi8vXHJcbi8vIEBwYXJhbSB7KG1hcmtkb3duLWl0LlRva2VuKVtdfSB0b2tlbnMgQXJyYXkgb2YgdG9rZW5zIGFzIHJldHVybmVkIGJ5XHJcbi8vICAgYG1hcmtkb3duLWl0LnBhcnNlKClgLlxyXG4vLyBAcGFyYW0ge251bWJlcn0gbGluZSBMaW5lIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHRva2VuLlxyXG4vLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IHJlcHJlc2VudGluZyBhIHBhdGggdG8gdGhlXHJcbi8vICAgdGFyZ2V0IHRva2VuLiBUaGUgcm9vdCB0b2tlbiBpcyByZXByZXNlbnRlZCBieSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGVcclxuLy8gICBhcnJheSBhbmQgdGhlIHRhcmdldCB0b2tlbiBieSB0aGUgbGFzdCBlbG1lbnQuIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhXHJcbi8vICAgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIHRva2VucyBpblxyXG4vLyAgIGB0b2tlbnNgIG9mIHRoZSBzYW1lIGB0YWdgLiBgbGluZWAgd2lsbCBsaWUgYmV0d2VlbiB0aGUgcHJvcGVydGllc1xyXG4vLyAgIGBtYXBbMF1gIGFuZCBgbWFwWzFdYCBvZiB0aGUgdGFyZ2V0IHRva2VuLlxyXG4vL1xyXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRMaW5lTWFwKHRva2VuczogUmVhZG9ubHlBcnJheTxSZWFkb25seTxUb2tlbj4+KSB7XHJcbiAgY29uc3QgbGluZU1hcDogeyBbbGluZTogbnVtYmVyXTogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiB9ID0ge31cclxuICBjb25zdCB0b2tlblRhZ0NvdW50OiB7IFtsaW5lOiBudW1iZXJdOiB7IFt0YWc6IHN0cmluZ106IG51bWJlciB9IH0gPSB7fVxyXG4gIHRva2VuVGFnQ291bnRbMF0gPSB7fVxyXG5cclxuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xyXG4gICAgaWYgKHRva2VuLmhpZGRlbikgY29udGludWVcclxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vIFRPRE86IGNvbXBsYWluIG9uIERUXHJcbiAgICBpZiAodG9rZW4ubWFwID09IG51bGwpIGNvbnRpbnVlXHJcblxyXG4gICAgY29uc3QgdGFnID0gZGVjb2RlVGFnKHRva2VuKVxyXG4gICAgaWYgKHRhZyA9PT0gbnVsbCkgY29udGludWVcclxuXHJcbiAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xyXG4gICAgICAvLyBvcGVuaW5nIHRhZ1xyXG4gICAgICBmb3IgKGxldCBsaW5lID0gdG9rZW4ubWFwWzBdOyBsaW5lIDwgdG9rZW4ubWFwWzFdOyBsaW5lICs9IDEpIHtcclxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlc1xyXG4gICAgICAgIGlmIChsaW5lTWFwW2xpbmVdID09IG51bGwpIGxpbmVNYXBbbGluZV0gPSBbXVxyXG4gICAgICAgIGxpbmVNYXBbbGluZV0ucHVzaCh7XHJcbiAgICAgICAgICB0YWc6IHRhZyxcclxuICAgICAgICAgIGluZGV4OiB0b2tlblRhZ0NvdW50W3Rva2VuLmxldmVsXVt0YWddIHx8IDAsXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICB0b2tlblRhZ0NvdW50W3Rva2VuLmxldmVsICsgMV0gPSB7fVxyXG4gICAgfSBlbHNlIGlmICh0b2tlbi5uZXN0aW5nID09PSAwKSB7XHJcbiAgICAgIC8vIHNlbGYtY2xvc2luZyB0YWdcclxuICAgICAgZm9yIChsZXQgbGluZSA9IHRva2VuLm1hcFswXTsgbGluZSA8IHRva2VuLm1hcFsxXTsgbGluZSArPSAxKSB7XHJcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXNcclxuICAgICAgICBpZiAobGluZU1hcFtsaW5lXSA9PSBudWxsKSBsaW5lTWFwW2xpbmVdID0gW11cclxuICAgICAgICBsaW5lTWFwW2xpbmVdLnB1c2goe1xyXG4gICAgICAgICAgdGFnOiB0YWcsXHJcbiAgICAgICAgICBpbmRleDogdG9rZW5UYWdDb3VudFt0b2tlbi5sZXZlbF1bdGFnXSB8fCAwLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IHR0YyA9IHRva2VuVGFnQ291bnRbdG9rZW4ubGV2ZWxdW3RhZ11cclxuICAgIHRva2VuVGFnQ291bnRbdG9rZW4ubGV2ZWxdW3RhZ10gPSB0dGMgPyB0dGMgKyAxIDogMVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGxpbmVNYXBcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0aEpheFNjcmlwdCh0ZXhDb25maWc6IE1hdGhKYXguVGVYSW5wdXRQcm9jZXNzb3IpIHtcclxuICByZXR1cm4gYFxcXHJcbjxzY3JpcHQgdHlwZT1cInRleHQveC1tYXRoamF4LWNvbmZpZ1wiPlxyXG4gIE1hdGhKYXguSHViLkNvbmZpZyh7XHJcbiAgICBqYXg6IFtcImlucHV0L1RlWFwiLFwib3V0cHV0L0hUTUwtQ1NTXCJdLFxyXG4gICAgZXh0ZW5zaW9uczogW1wiW2ExMXldL2FjY2Vzc2liaWxpdHktbWVudS5qc1wiXSxcclxuICAgICdIVE1MLUNTUyc6IHtcclxuICAgICAgYXZhaWxhYmxlRm9udHM6IFtdLFxyXG4gICAgICB3ZWJGb250OiAnVGVYJyxcclxuICAgICAgdW5kZWZpbmVkRmFtaWx5OiBcIiR7YXRvbUNvbmZpZygpLm1hdGhDb25maWcudW5kZWZpbmVkRmFtaWx5LnJlcGxhY2UoJ1wiJywgXCInXCIpfVwiLFxyXG4gICAgICBtdGV4dEZvbnRJbmhlcml0OiB0cnVlLFxyXG4gICAgfSxcclxuICAgIFRlWDogJHtKU09OLnN0cmluZ2lmeSh0ZXhDb25maWcsIHVuZGVmaW5lZCwgMil9LFxyXG4gICAgc2hvd01hdGhNZW51OiB0cnVlXHJcbiAgfSk7XHJcbjwvc2NyaXB0PlxyXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9tYXRoamF4LzIuNy40L01hdGhKYXguanNcIj48L3NjcmlwdD5gXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBta0h0bWwoXHJcbiAgdGl0bGU6IHN0cmluZyxcclxuICBodG1sOiBIVE1MRG9jdW1lbnQsXHJcbiAgcmVuZGVyTGFUZVg6IGJvb2xlYW4sXHJcbiAgdXNlR2l0aHViU3R5bGU6IGJvb2xlYW4sXHJcbiAgdGV4Q29uZmlnOiBNYXRoSmF4LlRlWElucHV0UHJvY2Vzc29yLFxyXG4pIHtcclxuICBjb25zdCBnaXRodWJTdHlsZSA9IHVzZUdpdGh1YlN0eWxlID8gJyBkYXRhLXVzZS1naXRodWItc3R5bGUnIDogJydcclxuICBsZXQgbWF5YmVNYXRoSmF4U2NyaXB0OiBzdHJpbmdcclxuICBpZiAocmVuZGVyTGFUZVgpIHtcclxuICAgIG1heWJlTWF0aEpheFNjcmlwdCA9IG1hdGhKYXhTY3JpcHQodGV4Q29uZmlnKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBtYXliZU1hdGhKYXhTY3JpcHQgPSAnJ1xyXG4gIH1cclxuICByZXR1cm4gYFxcXHJcbjwhRE9DVFlQRSBodG1sPlxyXG48aHRtbD5cclxuICA8aGVhZD5cclxuICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiIC8+XHJcbiAgICA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPiR7bWF5YmVNYXRoSmF4U2NyaXB0fVxyXG4gICAgPHN0eWxlPiR7Z2V0TWFya2Rvd25QcmV2aWV3Q1NTKCl9PC9zdHlsZT5cclxuJHtodG1sLmhlYWQuaW5uZXJIVE1MfVxyXG4gIDwvaGVhZD5cclxuICA8Ym9keSBjbGFzcz1cIm1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3XCIke2dpdGh1YlN0eWxlfT5cclxuICAgICR7aHRtbC5ib2R5LmlubmVySFRNTH1cclxuICA8L2JvZHk+XHJcbjwvaHRtbD5cclxuYCAvLyBFbnN1cmUgdHJhaWxpbmcgbmV3bGluZVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveShpdGVtOiBvYmplY3QpIHtcclxuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcclxuICBpZiAocGFuZSkgaGFuZGxlUHJvbWlzZShwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pKVxyXG59XHJcbiJdfQ==