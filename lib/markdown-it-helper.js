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
                folder: path.join('assets', 'svg'),
                ext: '.svg',
                base: path.dirname(require.resolve('twemoji-assets')) + path.sep,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUVoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLDBEQUEwRCxJQUFJLGtCQUFrQixDQUFBO0FBQ3pGLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE9BQU8seUVBQXlFLElBQUksa0JBQWtCLENBQUE7QUFDeEcsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQVc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsaUJBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFBO0lBQzVDLE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ2xCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUTtRQUN0QixNQUFNLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDcEMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXO1FBQzVCLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUztRQUN4QixvQkFBb0IsRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ2pELG1C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LENBQUMsQ0FBQTtBQUNILENBQUM7QUFFRCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUUzQyxTQUFnQixNQUFNLENBQUMsSUFBWSxFQUFFLEVBQVc7SUFDOUMsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xELE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBSEQsd0JBR0M7QUFFRCxTQUFnQixTQUFTLENBQUMsSUFBWSxFQUFFLEVBQVc7SUFDakQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xELE9BQU8sVUFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDcEMsQ0FBQztBQUhELDhCQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1hcmtkb3duSXRNb2R1bGUgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpXG5pbXBvcnQgVG9rZW4gPSByZXF1aXJlKCdtYXJrZG93bi1pdC9saWIvdG9rZW4nKVxuaW1wb3J0ICogYXMgdHdlbW9qaSBmcm9tICd0d2Vtb2ppJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgcGFpclVwLCBhdG9tQ29uZmlnIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgaXNFcXVhbCB9IGZyb20gJ2xvZGFzaCdcblxudHlwZSBJbml0U3RhdGUgPSBSZWFkb25seTxSZXR1cm5UeXBlPHR5cGVvZiBjdXJyZW50Q29uZmlnPj5cblxuZnVuY3Rpb24gbWF0aElubGluZSh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCBpbmxpbmUtbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+JHt0ZXh0fTwvc2NyaXB0Pjwvc3Bhbj5gXG59XG5cbmZ1bmN0aW9uIG1hdGhCbG9jayh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCBkaXNwbGF5LW1hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXg7IG1vZGU9ZGlzcGxheSc+JHt0ZXh0fTwvc2NyaXB0Pjwvc3Bhbj5gXG59XG5cbmZ1bmN0aW9uIGdldE9wdGlvbnMoYnJlYWtzOiBib29sZWFuKSB7XG4gIHJldHVybiB7XG4gICAgaHRtbDogdHJ1ZSxcbiAgICB4aHRtbE91dDogZmFsc2UsXG4gICAgYnJlYWtzLFxuICAgIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gICAgbGlua2lmeTogdHJ1ZSxcbiAgICB0eXBvZ3JhcGhlcjogdHJ1ZSxcbiAgfVxufVxuXG5mdW5jdGlvbiBjdXJyZW50Q29uZmlnKHJMOiBib29sZWFuKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGF0b21Db25maWcoKS5tYXJrZG93bkl0Q29uZmlnXG4gIHJldHVybiB7XG4gICAgcmVuZGVyTGFUZVg6IHJMLFxuICAgIGxhenlIZWFkZXJzOiBjb25maWcudXNlTGF6eUhlYWRlcnMsXG4gICAgY2hlY2tCb3hlczogY29uZmlnLnVzZUNoZWNrQm94ZXMsXG4gICAgdG9jOiBjb25maWcudXNlVG9jLFxuICAgIGVtb2ppOiBjb25maWcudXNlRW1vamksXG4gICAgYnJlYWtzOiBjb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUsXG4gICAgY3JpdGljTWFya3VwOiBjb25maWcudXNlQ3JpdGljTWFya3VwLFxuICAgIGZvb3Rub3RlOiBjb25maWcudXNlRm9vdG5vdGUsXG4gICAgaW1zaXplOiBjb25maWcudXNlSW1zaXplLFxuICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBjb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgYmxvY2tNYXRoU2VwYXJhdG9yczogY29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdChpbml0U3RhdGU6IEluaXRTdGF0ZSk6IG1hcmtkb3duSXRNb2R1bGUge1xuICBjb25zdCBtYXJrZG93bkl0ID0gbWFya2Rvd25JdE1vZHVsZShnZXRPcHRpb25zKGluaXRTdGF0ZS5icmVha3MpKVxuXG4gIGlmIChpbml0U3RhdGUucmVuZGVyTGFUZVgpIHtcbiAgICBjb25zdCBpbmxpbmVEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdpbmxpbmVNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIGNvbnN0IGJsb2NrRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdibG9ja01hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCcuL21hcmtkb3duLWl0LW1hdGgnKS5tYXRoX3BsdWdpbiwge1xuICAgICAgaW5saW5lRGVsaW0sXG4gICAgICBibG9ja0RlbGltLFxuICAgICAgaW5saW5lUmVuZGVyZXI6IG1hdGhJbmxpbmUsXG4gICAgICBibG9ja1JlbmRlcmVyOiBtYXRoQmxvY2ssXG4gICAgfSlcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLXVuc2FmZS1hbnlcbiAgaWYgKGluaXRTdGF0ZS5sYXp5SGVhZGVycykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtbGF6eS1oZWFkZXJzJykpXG4gIGlmIChpbml0U3RhdGUuY2hlY2tCb3hlcykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFzay1saXN0cycpKVxuICBpZiAoaW5pdFN0YXRlLnRvYykge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWFuY2hvcicpKVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhYmxlLW9mLWNvbnRlbnRzJykpXG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmVtb2ppKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtZW1vamknKSlcbiAgICBtYXJrZG93bkl0LnJlbmRlcmVyLnJ1bGVzLmVtb2ppID0gZnVuY3Rpb24odG9rZW4sIGlkeCkge1xuICAgICAgcmV0dXJuIHR3ZW1vamkucGFyc2UodG9rZW5baWR4XS5jb250ZW50LCB7XG4gICAgICAgIGZvbGRlcjogcGF0aC5qb2luKCdhc3NldHMnLCAnc3ZnJyksXG4gICAgICAgIGV4dDogJy5zdmcnLFxuICAgICAgICBiYXNlOiBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCd0d2Vtb2ppLWFzc2V0cycpKSArIHBhdGguc2VwLFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmNyaXRpY01hcmt1cCkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtY3JpdGljbWFya3VwJykpXG4gIH1cbiAgaWYgKGluaXRTdGF0ZS5mb290bm90ZSkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWZvb3Rub3RlJykpXG4gIH1cbiAgaWYgKGluaXRTdGF0ZS5pbXNpemUpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWltc2l6ZScpKVxuICAvLyB0c2xpbnQ6ZW5hYmxlOm5vLXVuc2FmZS1hbnlcblxuICByZXR1cm4gbWFya2Rvd25JdFxufVxuXG5mdW5jdGlvbiB3cmFwSW5pdElmTmVlZGVkKGluaXRmOiB0eXBlb2YgaW5pdCk6IHR5cGVvZiBpbml0IHtcbiAgbGV0IG1hcmtkb3duSXQ6IG1hcmtkb3duSXRNb2R1bGUgfCBudWxsID0gbnVsbFxuICBsZXQgaW5pdFN0YXRlOiBJbml0U3RhdGUgfCBudWxsID0gbnVsbFxuXG4gIHJldHVybiBmdW5jdGlvbihuZXdTdGF0ZTogSW5pdFN0YXRlKSB7XG4gICAgaWYgKG1hcmtkb3duSXQgPT09IG51bGwgfHwgIWlzRXF1YWwoaW5pdFN0YXRlLCBuZXdTdGF0ZSkpIHtcbiAgICAgIGluaXRTdGF0ZSA9IG5ld1N0YXRlXG4gICAgICBtYXJrZG93bkl0ID0gaW5pdGYobmV3U3RhdGUpXG4gICAgfVxuICAgIHJldHVybiBtYXJrZG93bkl0XG4gIH1cbn1cblxuY29uc3QgaW5pdElmTmVlZGVkID0gd3JhcEluaXRJZk5lZWRlZChpbml0KVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IGluaXRJZk5lZWRlZChjdXJyZW50Q29uZmlnKHJMKSlcbiAgcmV0dXJuIG1hcmtkb3duSXQucmVuZGVyKHRleHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbnModGV4dDogc3RyaW5nLCByTDogYm9vbGVhbik6IFRva2VuW10ge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdCEucGFyc2UodGV4dCwge30pXG59XG4iXX0=