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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLDhDQUE4QyxJQUFJLGtCQUFrQixDQUFBO0FBQzdFLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE9BQU8sNERBQTRELElBQUksa0JBQWtCLENBQUE7QUFDM0YsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQVc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsaUJBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFBO0lBQzVDLE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ2xCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUTtRQUN0QixNQUFNLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDcEMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO1FBQ3hCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtLQUNo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QztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFZLEVBQUUsRUFBVztJQUNqRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBSEQsOEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWFya2Rvd25JdE1vZHVsZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JylcbmltcG9ydCAqIGFzIHR3ZW1vamkgZnJvbSAndHdlbW9qaSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHBhaXJVcCwgYXRvbUNvbmZpZyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGlzRXF1YWwgfSBmcm9tICdsb2Rhc2gnXG5cbnR5cGUgSW5pdFN0YXRlID0gUmVhZG9ubHk8UmV0dXJuVHlwZTx0eXBlb2YgY3VycmVudENvbmZpZz4+XG5cbmZ1bmN0aW9uIG1hdGhJbmxpbmUodGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiBgPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBtYXRoQmxvY2sodGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiBgPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXg7IG1vZGU9ZGlzcGxheSc+JHt0ZXh0fTwvc2NyaXB0Pjwvc3Bhbj5gXG59XG5cbmZ1bmN0aW9uIGdldE9wdGlvbnMoYnJlYWtzOiBib29sZWFuKSB7XG4gIHJldHVybiB7XG4gICAgaHRtbDogdHJ1ZSxcbiAgICB4aHRtbE91dDogZmFsc2UsXG4gICAgYnJlYWtzLFxuICAgIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gICAgbGlua2lmeTogdHJ1ZSxcbiAgICB0eXBvZ3JhcGhlcjogdHJ1ZSxcbiAgfVxufVxuXG5mdW5jdGlvbiBjdXJyZW50Q29uZmlnKHJMOiBib29sZWFuKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGF0b21Db25maWcoKS5tYXJrZG93bkl0Q29uZmlnXG4gIHJldHVybiB7XG4gICAgcmVuZGVyTGFUZVg6IHJMLFxuICAgIGxhenlIZWFkZXJzOiBjb25maWcudXNlTGF6eUhlYWRlcnMsXG4gICAgY2hlY2tCb3hlczogY29uZmlnLnVzZUNoZWNrQm94ZXMsXG4gICAgdG9jOiBjb25maWcudXNlVG9jLFxuICAgIGVtb2ppOiBjb25maWcudXNlRW1vamksXG4gICAgYnJlYWtzOiBjb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUsXG4gICAgY3JpdGljTWFya3VwOiBjb25maWcudXNlQ3JpdGljTWFya3VwLFxuICAgIGltc2l6ZTogY29uZmlnLnVzZUltc2l6ZSxcbiAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogY29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IGNvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoaW5pdFN0YXRlOiBJbml0U3RhdGUpOiBtYXJrZG93bkl0TW9kdWxlLk1hcmtkb3duSXQge1xuICBjb25zdCBtYXJrZG93bkl0ID0gbWFya2Rvd25JdE1vZHVsZShnZXRPcHRpb25zKGluaXRTdGF0ZS5icmVha3MpKVxuXG4gIGlmIChpbml0U3RhdGUucmVuZGVyTGFUZVgpIHtcbiAgICBjb25zdCBpbmxpbmVEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdpbmxpbmVNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIGNvbnN0IGJsb2NrRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdibG9ja01hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCcuL21hcmtkb3duLWl0LW1hdGgnKS5tYXRoX3BsdWdpbiwge1xuICAgICAgaW5saW5lRGVsaW0sXG4gICAgICBibG9ja0RlbGltLFxuICAgICAgaW5saW5lUmVuZGVyZXI6IG1hdGhJbmxpbmUsXG4gICAgICBibG9ja1JlbmRlcmVyOiBtYXRoQmxvY2ssXG4gICAgfSlcbiAgfVxuXG4gIGlmIChpbml0U3RhdGUubGF6eUhlYWRlcnMpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWxhenktaGVhZGVycycpKVxuICBpZiAoaW5pdFN0YXRlLmNoZWNrQm94ZXMpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhc2stbGlzdHMnKSlcbiAgaWYgKGluaXRTdGF0ZS50b2MpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhYmxlLW9mLWNvbnRlbnRzJykpXG5cbiAgaWYgKGluaXRTdGF0ZS5lbW9qaSkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWVtb2ppJykpXG4gICAgbWFya2Rvd25JdC5yZW5kZXJlci5ydWxlcy5lbW9qaSA9IGZ1bmN0aW9uKHRva2VuLCBpZHgpIHtcbiAgICAgIHJldHVybiB0d2Vtb2ppLnBhcnNlKHRva2VuW2lkeF0uY29udGVudCwge1xuICAgICAgICBmb2xkZXI6ICdzdmcnLFxuICAgICAgICBleHQ6ICcuc3ZnJyxcbiAgICAgICAgYmFzZTogcGF0aC5kaXJuYW1lKHJlcXVpcmUucmVzb2x2ZSgndHdlbW9qaScpKSArIHBhdGguc2VwLFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmNyaXRpY01hcmt1cCkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtY3JpdGljbWFya3VwJykpXG4gIH1cbiAgaWYgKGluaXRTdGF0ZS5pbXNpemUpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWltc2l6ZScpKVxuXG4gIHJldHVybiBtYXJrZG93bkl0XG59XG5cbmZ1bmN0aW9uIHdyYXBJbml0SWZOZWVkZWQoaW5pdGY6IHR5cGVvZiBpbml0KTogdHlwZW9mIGluaXQge1xuICBsZXQgbWFya2Rvd25JdDogbWFya2Rvd25JdE1vZHVsZS5NYXJrZG93bkl0IHwgbnVsbCA9IG51bGxcbiAgbGV0IGluaXRTdGF0ZTogSW5pdFN0YXRlIHwgbnVsbCA9IG51bGxcblxuICByZXR1cm4gZnVuY3Rpb24obmV3U3RhdGU6IEluaXRTdGF0ZSkge1xuICAgIGlmIChtYXJrZG93bkl0ID09PSBudWxsIHx8ICFpc0VxdWFsKGluaXRTdGF0ZSwgbmV3U3RhdGUpKSB7XG4gICAgICBpbml0U3RhdGUgPSBuZXdTdGF0ZVxuICAgICAgbWFya2Rvd25JdCA9IGluaXRmKG5ld1N0YXRlKVxuICAgIH1cbiAgICByZXR1cm4gbWFya2Rvd25JdFxuICB9XG59XG5cbmNvbnN0IGluaXRJZk5lZWRlZCA9IHdyYXBJbml0SWZOZWVkZWQoaW5pdClcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcih0ZXh0OiBzdHJpbmcsIHJMOiBib29sZWFuKSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBpbml0SWZOZWVkZWQoY3VycmVudENvbmZpZyhyTCkpXG4gIHJldHVybiBtYXJrZG93bkl0LnJlbmRlcih0ZXh0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9rZW5zKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IGluaXRJZk5lZWRlZChjdXJyZW50Q29uZmlnKHJMKSlcbiAgcmV0dXJuIG1hcmtkb3duSXQhLnBhcnNlKHRleHQsIHt9KVxufVxuIl19