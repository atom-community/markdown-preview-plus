"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdownItModule = require("markdown-it");
const twemoji = require("twemoji");
const path = require("path");
const util_1 = require("./util");
const lodash_1 = require("lodash");
function mathInline(text) {
    return `<span class='math inline-math'><script type='math/tex'>${text}</script></span>`;
}
function mathBlock(text) {
    return `<span class='math display-math'><script type='math/tex; mode=display'>${text}</script></span>`;
}
function getOptions(breaks) {
    return {
        html: true,
        xhtmlOut: false,
        breaks,
        langPrefix: 'lang-',
        linkify: true,
        typographer: true,
    };
}
function currentConfig(rL) {
    const config = util_1.atomConfig().markdownItConfig;
    return {
        renderLaTeX: rL,
        lazyHeaders: config.useLazyHeaders,
        checkBoxes: config.useCheckBoxes,
        toc: config.useToc,
        emoji: config.useEmoji,
        breaks: config.breakOnSingleNewline,
        criticMarkup: config.useCriticMarkup,
        footnote: config.useFootnote,
        imsize: config.useImsize,
        inlineMathSeparators: config.inlineMathSeparators,
        blockMathSeparators: config.blockMathSeparators,
    };
}
function init(initState) {
    const markdownIt = markdownItModule(getOptions(initState.breaks));
    if (initState.renderLaTeX) {
        const inlineDelim = util_1.pairUp(initState.inlineMathSeparators, 'inlineMathSeparators');
        const blockDelim = util_1.pairUp(initState.blockMathSeparators, 'blockMathSeparators');
        markdownIt.use(require('./markdown-it-math').math_plugin, {
            inlineDelim,
            blockDelim,
            inlineRenderer: mathInline,
            blockRenderer: mathBlock,
        });
    }
    if (initState.lazyHeaders)
        markdownIt.use(require('markdown-it-lazy-headers'));
    if (initState.checkBoxes)
        markdownIt.use(require('markdown-it-task-lists'));
    if (initState.toc) {
        markdownIt.use(require('markdown-it-anchor'));
        markdownIt.use(require('markdown-it-table-of-contents'));
    }
    if (initState.emoji) {
        markdownIt.use(require('markdown-it-emoji'));
        markdownIt.renderer.rules.emoji = function (token, idx) {
            return twemoji.parse(token[idx].content, {
                folder: 'svg',
                ext: '.svg',
                base: path.dirname(require.resolve('twemoji')) + path.sep,
            });
        };
    }
    if (initState.criticMarkup) {
        markdownIt.use(require('./markdown-it-criticmarkup'));
    }
    if (initState.footnote) {
        markdownIt.use(require('markdown-it-footnote'));
    }
    if (initState.imsize)
        markdownIt.use(require('markdown-it-imsize'));
    return markdownIt;
}
function wrapInitIfNeeded(initf) {
    let markdownIt = null;
    let initState = null;
    return function (newState) {
        if (markdownIt === null || !lodash_1.isEqual(initState, newState)) {
            initState = newState;
            markdownIt = initf(newState);
        }
        return markdownIt;
    };
}
const initIfNeeded = wrapInitIfNeeded(init);
function render(text, rL) {
    const markdownIt = initIfNeeded(currentConfig(rL));
    return markdownIt.render(text);
}
exports.render = render;
function getTokens(text, rL) {
    const markdownIt = initIfNeeded(currentConfig(rL));
    return markdownIt.parse(text, {});
}
exports.getTokens = getTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUVoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLDBEQUEwRCxJQUFJLGtCQUFrQixDQUFBO0FBQ3pGLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE9BQU8seUVBQXlFLElBQUksa0JBQWtCLENBQUE7QUFDeEcsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQVc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsaUJBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFBO0lBQzVDLE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ2xCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUTtRQUN0QixNQUFNLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDcEMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXO1FBQzVCLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUztRQUN4QixvQkFBb0IsRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ2pELG1C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QUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFM0MsU0FBZ0IsTUFBTSxDQUFDLElBQVksRUFBRSxFQUFXO0lBQzlDLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRCxPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsQ0FBQztBQUhELHdCQUdDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQVksRUFBRSxFQUFXO0lBQ2pELE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRCxPQUFPLFVBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLENBQUM7QUFIRCw4QkFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYXJrZG93bkl0TW9kdWxlID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKVxuaW1wb3J0IFRva2VuID0gcmVxdWlyZSgnbWFya2Rvd24taXQvbGliL3Rva2VuJylcbmltcG9ydCAqIGFzIHR3ZW1vamkgZnJvbSAndHdlbW9qaSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHBhaXJVcCwgYXRvbUNvbmZpZyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGlzRXF1YWwgfSBmcm9tICdsb2Rhc2gnXG5cbnR5cGUgSW5pdFN0YXRlID0gUmVhZG9ubHk8UmV0dXJuVHlwZTx0eXBlb2YgY3VycmVudENvbmZpZz4+XG5cbmZ1bmN0aW9uIG1hdGhJbmxpbmUodGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiBgPHNwYW4gY2xhc3M9J21hdGggaW5saW5lLW1hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBtYXRoQmxvY2sodGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiBgPHNwYW4gY2xhc3M9J21hdGggZGlzcGxheS1tYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25zKGJyZWFrczogYm9vbGVhbikge1xuICByZXR1cm4ge1xuICAgIGh0bWw6IHRydWUsXG4gICAgeGh0bWxPdXQ6IGZhbHNlLFxuICAgIGJyZWFrcyxcbiAgICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICAgIGxpbmtpZnk6IHRydWUsXG4gICAgdHlwb2dyYXBoZXI6IHRydWUsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3VycmVudENvbmZpZyhyTDogYm9vbGVhbikge1xuICBjb25zdCBjb25maWcgPSBhdG9tQ29uZmlnKCkubWFya2Rvd25JdENvbmZpZ1xuICByZXR1cm4ge1xuICAgIHJlbmRlckxhVGVYOiByTCxcbiAgICBsYXp5SGVhZGVyczogY29uZmlnLnVzZUxhenlIZWFkZXJzLFxuICAgIGNoZWNrQm94ZXM6IGNvbmZpZy51c2VDaGVja0JveGVzLFxuICAgIHRvYzogY29uZmlnLnVzZVRvYyxcbiAgICBlbW9qaTogY29uZmlnLnVzZUVtb2ppLFxuICAgIGJyZWFrczogY29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lLFxuICAgIGNyaXRpY01hcmt1cDogY29uZmlnLnVzZUNyaXRpY01hcmt1cCxcbiAgICBmb290bm90ZTogY29uZmlnLnVzZUZvb3Rub3RlLFxuICAgIGltc2l6ZTogY29uZmlnLnVzZUltc2l6ZSxcbiAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogY29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IGNvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoaW5pdFN0YXRlOiBJbml0U3RhdGUpOiBtYXJrZG93bkl0TW9kdWxlIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IG1hcmtkb3duSXRNb2R1bGUoZ2V0T3B0aW9ucyhpbml0U3RhdGUuYnJlYWtzKSlcblxuICBpZiAoaW5pdFN0YXRlLnJlbmRlckxhVGVYKSB7XG4gICAgY29uc3QgaW5saW5lRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgICAnaW5saW5lTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICBjb25zdCBibG9ja0RlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gICAgICAnYmxvY2tNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnNhZmUtYW55XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnLi9tYXJrZG93bi1pdC1tYXRoJykubWF0aF9wbHVnaW4sIHtcbiAgICAgIGlubGluZURlbGltLFxuICAgICAgYmxvY2tEZWxpbSxcbiAgICAgIGlubGluZVJlbmRlcmVyOiBtYXRoSW5saW5lLFxuICAgICAgYmxvY2tSZW5kZXJlcjogbWF0aEJsb2NrLFxuICAgIH0pXG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby11bnNhZmUtYW55XG4gIGlmIChpbml0U3RhdGUubGF6eUhlYWRlcnMpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWxhenktaGVhZGVycycpKVxuICBpZiAoaW5pdFN0YXRlLmNoZWNrQm94ZXMpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhc2stbGlzdHMnKSlcbiAgaWYgKGluaXRTdGF0ZS50b2MpIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1hbmNob3InKSlcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC10YWJsZS1vZi1jb250ZW50cycpKVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5lbW9qaSkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWVtb2ppJykpXG4gICAgbWFya2Rvd25JdC5yZW5kZXJlci5ydWxlcy5lbW9qaSA9IGZ1bmN0aW9uKHRva2VuLCBpZHgpIHtcbiAgICAgIHJldHVybiB0d2Vtb2ppLnBhcnNlKHRva2VuW2lkeF0uY29udGVudCwge1xuICAgICAgICBmb2xkZXI6ICdzdmcnLFxuICAgICAgICBleHQ6ICcuc3ZnJyxcbiAgICAgICAgYmFzZTogcGF0aC5kaXJuYW1lKHJlcXVpcmUucmVzb2x2ZSgndHdlbW9qaScpKSArIHBhdGguc2VwLFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmNyaXRpY01hcmt1cCkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtY3JpdGljbWFya3VwJykpXG4gIH1cbiAgaWYgKGluaXRTdGF0ZS5mb290bm90ZSkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWZvb3Rub3RlJykpXG4gIH1cbiAgaWYgKGluaXRTdGF0ZS5pbXNpemUpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWltc2l6ZScpKVxuICAvLyB0c2xpbnQ6ZW5hYmxlOm5vLXVuc2FmZS1hbnlcblxuICByZXR1cm4gbWFya2Rvd25JdFxufVxuXG5mdW5jdGlvbiB3cmFwSW5pdElmTmVlZGVkKGluaXRmOiB0eXBlb2YgaW5pdCk6IHR5cGVvZiBpbml0IHtcbiAgbGV0IG1hcmtkb3duSXQ6IG1hcmtkb3duSXRNb2R1bGUgfCBudWxsID0gbnVsbFxuICBsZXQgaW5pdFN0YXRlOiBJbml0U3RhdGUgfCBudWxsID0gbnVsbFxuXG4gIHJldHVybiBmdW5jdGlvbihuZXdTdGF0ZTogSW5pdFN0YXRlKSB7XG4gICAgaWYgKG1hcmtkb3duSXQgPT09IG51bGwgfHwgIWlzRXF1YWwoaW5pdFN0YXRlLCBuZXdTdGF0ZSkpIHtcbiAgICAgIGluaXRTdGF0ZSA9IG5ld1N0YXRlXG4gICAgICBtYXJrZG93bkl0ID0gaW5pdGYobmV3U3RhdGUpXG4gICAgfVxuICAgIHJldHVybiBtYXJrZG93bkl0XG4gIH1cbn1cblxuY29uc3QgaW5pdElmTmVlZGVkID0gd3JhcEluaXRJZk5lZWRlZChpbml0KVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IGluaXRJZk5lZWRlZChjdXJyZW50Q29uZmlnKHJMKSlcbiAgcmV0dXJuIG1hcmtkb3duSXQucmVuZGVyKHRleHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbnModGV4dDogc3RyaW5nLCByTDogYm9vbGVhbik6IFRva2VuW10ge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdCEucGFyc2UodGV4dCwge30pXG59XG4iXX0=