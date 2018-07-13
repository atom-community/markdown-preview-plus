"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdownItModule = require("markdown-it");
const twemoji = require("twemoji");
const path = require("path");
const util_1 = require("./util");
const lodash_1 = require("lodash");
function mathInline(text) {
    return `<span class='math'><script type='math/tex'>${text}</script></span>`;
}
function mathBlock(text) {
    return `<span class='math'><script type='math/tex; mode=display'>${text}</script></span>`;
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
    if (initState.toc)
        markdownIt.use(require('markdown-it-table-of-contents'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsb0JBQW9CLElBQVk7SUFDOUIsT0FBTyw4Q0FBOEMsSUFBSSxrQkFBa0IsQ0FBQTtBQUM3RSxDQUFDO0FBRUQsbUJBQW1CLElBQVk7SUFDN0IsT0FBTyw0REFBNEQsSUFBSSxrQkFBa0IsQ0FBQTtBQUMzRixDQUFDO0FBRUQsb0JBQW9CLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELHVCQUF1QixFQUFXO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGlCQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQTtJQUM1QyxPQUFPO1FBQ0wsV0FBVyxFQUFFLEVBQUU7UUFDZixXQUFXLEVBQUUsTUFBTSxDQUFDLGNBQWM7UUFDbEMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1FBQ2hDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTTtRQUNsQixLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVE7UUFDdEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDbkMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxlQUFlO1FBQ3BDLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUztRQUN4QixvQkFBb0IsRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ2pELG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxtQkFBbUI7S0FDaEQsQ0FBQTtBQUNILENBQUM7QUFFRCxjQUFjLFNBQW9C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QUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRCxPQUFPLFVBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLENBQUM7QUFIRCw4QkFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYXJrZG93bkl0TW9kdWxlID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKVxuaW1wb3J0ICogYXMgdHdlbW9qaSBmcm9tICd0d2Vtb2ppJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgcGFpclVwLCBhdG9tQ29uZmlnIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgaXNFcXVhbCB9IGZyb20gJ2xvZGFzaCdcblxudHlwZSBJbml0U3RhdGUgPSBSZWFkb25seTxSZXR1cm5UeXBlPHR5cGVvZiBjdXJyZW50Q29uZmlnPj5cblxuZnVuY3Rpb24gbWF0aElubGluZSh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+JHt0ZXh0fTwvc2NyaXB0Pjwvc3Bhbj5gXG59XG5cbmZ1bmN0aW9uIG1hdGhCbG9jayh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyhicmVha3M6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHtcbiAgICBodG1sOiB0cnVlLFxuICAgIHhodG1sT3V0OiBmYWxzZSxcbiAgICBicmVha3MsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICAgIHR5cG9ncmFwaGVyOiB0cnVlLFxuICB9XG59XG5cbmZ1bmN0aW9uIGN1cnJlbnRDb25maWcockw6IGJvb2xlYW4pIHtcbiAgY29uc3QgY29uZmlnID0gYXRvbUNvbmZpZygpLm1hcmtkb3duSXRDb25maWdcbiAgcmV0dXJuIHtcbiAgICByZW5kZXJMYVRlWDogckwsXG4gICAgbGF6eUhlYWRlcnM6IGNvbmZpZy51c2VMYXp5SGVhZGVycyxcbiAgICBjaGVja0JveGVzOiBjb25maWcudXNlQ2hlY2tCb3hlcyxcbiAgICB0b2M6IGNvbmZpZy51c2VUb2MsXG4gICAgZW1vamk6IGNvbmZpZy51c2VFbW9qaSxcbiAgICBicmVha3M6IGNvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSxcbiAgICBjcml0aWNNYXJrdXA6IGNvbmZpZy51c2VDcml0aWNNYXJrdXAsXG4gICAgaW1zaXplOiBjb25maWcudXNlSW1zaXplLFxuICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBjb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgYmxvY2tNYXRoU2VwYXJhdG9yczogY29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdChpbml0U3RhdGU6IEluaXRTdGF0ZSk6IG1hcmtkb3duSXRNb2R1bGUuTWFya2Rvd25JdCB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBtYXJrZG93bkl0TW9kdWxlKGdldE9wdGlvbnMoaW5pdFN0YXRlLmJyZWFrcykpXG5cbiAgaWYgKGluaXRTdGF0ZS5yZW5kZXJMYVRlWCkge1xuICAgIGNvbnN0IGlubGluZURlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2lubGluZU1hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgY29uc3QgYmxvY2tEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2Jsb2NrTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5zYWZlLWFueVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtbWF0aCcpLm1hdGhfcGx1Z2luLCB7XG4gICAgICBpbmxpbmVEZWxpbSxcbiAgICAgIGJsb2NrRGVsaW0sXG4gICAgICBpbmxpbmVSZW5kZXJlcjogbWF0aElubGluZSxcbiAgICAgIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9jayxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5sYXp5SGVhZGVycykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtbGF6eS1oZWFkZXJzJykpXG4gIGlmIChpbml0U3RhdGUuY2hlY2tCb3hlcykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFzay1saXN0cycpKVxuICBpZiAoaW5pdFN0YXRlLnRvYykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFibGUtb2YtY29udGVudHMnKSlcblxuICBpZiAoaW5pdFN0YXRlLmVtb2ppKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtZW1vamknKSlcbiAgICBtYXJrZG93bkl0LnJlbmRlcmVyLnJ1bGVzLmVtb2ppID0gZnVuY3Rpb24odG9rZW4sIGlkeCkge1xuICAgICAgcmV0dXJuIHR3ZW1vamkucGFyc2UodG9rZW5baWR4XS5jb250ZW50LCB7XG4gICAgICAgIGZvbGRlcjogJ3N2ZycsXG4gICAgICAgIGV4dDogJy5zdmcnLFxuICAgICAgICBiYXNlOiBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCd0d2Vtb2ppJykpICsgcGF0aC5zZXAsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbml0U3RhdGUuY3JpdGljTWFya3VwKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnLi9tYXJrZG93bi1pdC1jcml0aWNtYXJrdXAnKSlcbiAgfVxuICBpZiAoaW5pdFN0YXRlLmltc2l6ZSkgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtaW1zaXplJykpXG5cbiAgcmV0dXJuIG1hcmtkb3duSXRcbn1cblxuZnVuY3Rpb24gd3JhcEluaXRJZk5lZWRlZChpbml0ZjogdHlwZW9mIGluaXQpOiB0eXBlb2YgaW5pdCB7XG4gIGxldCBtYXJrZG93bkl0OiBtYXJrZG93bkl0TW9kdWxlLk1hcmtkb3duSXQgfCBudWxsID0gbnVsbFxuICBsZXQgaW5pdFN0YXRlOiBJbml0U3RhdGUgfCBudWxsID0gbnVsbFxuXG4gIHJldHVybiBmdW5jdGlvbihuZXdTdGF0ZTogSW5pdFN0YXRlKSB7XG4gICAgaWYgKG1hcmtkb3duSXQgPT09IG51bGwgfHwgIWlzRXF1YWwoaW5pdFN0YXRlLCBuZXdTdGF0ZSkpIHtcbiAgICAgIGluaXRTdGF0ZSA9IG5ld1N0YXRlXG4gICAgICBtYXJrZG93bkl0ID0gaW5pdGYobmV3U3RhdGUpXG4gICAgfVxuICAgIHJldHVybiBtYXJrZG93bkl0XG4gIH1cbn1cblxuY29uc3QgaW5pdElmTmVlZGVkID0gd3JhcEluaXRJZk5lZWRlZChpbml0KVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IGluaXRJZk5lZWRlZChjdXJyZW50Q29uZmlnKHJMKSlcbiAgcmV0dXJuIG1hcmtkb3duSXQucmVuZGVyKHRleHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbnModGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdCEucGFyc2UodGV4dCwge30pXG59XG4iXX0=