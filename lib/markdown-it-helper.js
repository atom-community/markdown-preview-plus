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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLDBEQUEwRCxJQUFJLGtCQUFrQixDQUFBO0FBQ3pGLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE9BQU8seUVBQXlFLElBQUksa0JBQWtCLENBQUE7QUFDeEcsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQVc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsaUJBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFBO0lBQzVDLE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ2xCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUTtRQUN0QixNQUFNLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDcEMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO1FBQ3hCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtLQUNo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QztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFZLEVBQUUsRUFBVztJQUNqRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBSEQsOEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWFya2Rvd25JdE1vZHVsZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JylcbmltcG9ydCAqIGFzIHR3ZW1vamkgZnJvbSAndHdlbW9qaSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHBhaXJVcCwgYXRvbUNvbmZpZyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGlzRXF1YWwgfSBmcm9tICdsb2Rhc2gnXG5cbnR5cGUgSW5pdFN0YXRlID0gUmVhZG9ubHk8UmV0dXJuVHlwZTx0eXBlb2YgY3VycmVudENvbmZpZz4+XG5cbmZ1bmN0aW9uIG1hdGhJbmxpbmUodGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiBgPHNwYW4gY2xhc3M9J21hdGggaW5saW5lLW1hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBtYXRoQmxvY2sodGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiBgPHNwYW4gY2xhc3M9J21hdGggZGlzcGxheS1tYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25zKGJyZWFrczogYm9vbGVhbikge1xuICByZXR1cm4ge1xuICAgIGh0bWw6IHRydWUsXG4gICAgeGh0bWxPdXQ6IGZhbHNlLFxuICAgIGJyZWFrcyxcbiAgICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICAgIGxpbmtpZnk6IHRydWUsXG4gICAgdHlwb2dyYXBoZXI6IHRydWUsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3VycmVudENvbmZpZyhyTDogYm9vbGVhbikge1xuICBjb25zdCBjb25maWcgPSBhdG9tQ29uZmlnKCkubWFya2Rvd25JdENvbmZpZ1xuICByZXR1cm4ge1xuICAgIHJlbmRlckxhVGVYOiByTCxcbiAgICBsYXp5SGVhZGVyczogY29uZmlnLnVzZUxhenlIZWFkZXJzLFxuICAgIGNoZWNrQm94ZXM6IGNvbmZpZy51c2VDaGVja0JveGVzLFxuICAgIHRvYzogY29uZmlnLnVzZVRvYyxcbiAgICBlbW9qaTogY29uZmlnLnVzZUVtb2ppLFxuICAgIGJyZWFrczogY29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lLFxuICAgIGNyaXRpY01hcmt1cDogY29uZmlnLnVzZUNyaXRpY01hcmt1cCxcbiAgICBpbXNpemU6IGNvbmZpZy51c2VJbXNpemUsXG4gICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IGNvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBjb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0KGluaXRTdGF0ZTogSW5pdFN0YXRlKTogbWFya2Rvd25JdE1vZHVsZS5NYXJrZG93bkl0IHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IG1hcmtkb3duSXRNb2R1bGUoZ2V0T3B0aW9ucyhpbml0U3RhdGUuYnJlYWtzKSlcblxuICBpZiAoaW5pdFN0YXRlLnJlbmRlckxhVGVYKSB7XG4gICAgY29uc3QgaW5saW5lRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgICAnaW5saW5lTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICBjb25zdCBibG9ja0RlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gICAgICAnYmxvY2tNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnNhZmUtYW55XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnLi9tYXJrZG93bi1pdC1tYXRoJykubWF0aF9wbHVnaW4sIHtcbiAgICAgIGlubGluZURlbGltLFxuICAgICAgYmxvY2tEZWxpbSxcbiAgICAgIGlubGluZVJlbmRlcmVyOiBtYXRoSW5saW5lLFxuICAgICAgYmxvY2tSZW5kZXJlcjogbWF0aEJsb2NrLFxuICAgIH0pXG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmxhenlIZWFkZXJzKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1sYXp5LWhlYWRlcnMnKSlcbiAgaWYgKGluaXRTdGF0ZS5jaGVja0JveGVzKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC10YXNrLWxpc3RzJykpXG4gIGlmIChpbml0U3RhdGUudG9jKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC10YWJsZS1vZi1jb250ZW50cycpKVxuXG4gIGlmIChpbml0U3RhdGUuZW1vamkpIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1lbW9qaScpKVxuICAgIG1hcmtkb3duSXQucmVuZGVyZXIucnVsZXMuZW1vamkgPSBmdW5jdGlvbih0b2tlbiwgaWR4KSB7XG4gICAgICByZXR1cm4gdHdlbW9qaS5wYXJzZSh0b2tlbltpZHhdLmNvbnRlbnQsIHtcbiAgICAgICAgZm9sZGVyOiAnc3ZnJyxcbiAgICAgICAgZXh0OiAnLnN2ZycsXG4gICAgICAgIGJhc2U6IHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJ3R3ZW1vamknKSkgKyBwYXRoLnNlcCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5jcml0aWNNYXJrdXApIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCcuL21hcmtkb3duLWl0LWNyaXRpY21hcmt1cCcpKVxuICB9XG4gIGlmIChpbml0U3RhdGUuaW1zaXplKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1pbXNpemUnKSlcblxuICByZXR1cm4gbWFya2Rvd25JdFxufVxuXG5mdW5jdGlvbiB3cmFwSW5pdElmTmVlZGVkKGluaXRmOiB0eXBlb2YgaW5pdCk6IHR5cGVvZiBpbml0IHtcbiAgbGV0IG1hcmtkb3duSXQ6IG1hcmtkb3duSXRNb2R1bGUuTWFya2Rvd25JdCB8IG51bGwgPSBudWxsXG4gIGxldCBpbml0U3RhdGU6IEluaXRTdGF0ZSB8IG51bGwgPSBudWxsXG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5ld1N0YXRlOiBJbml0U3RhdGUpIHtcbiAgICBpZiAobWFya2Rvd25JdCA9PT0gbnVsbCB8fCAhaXNFcXVhbChpbml0U3RhdGUsIG5ld1N0YXRlKSkge1xuICAgICAgaW5pdFN0YXRlID0gbmV3U3RhdGVcbiAgICAgIG1hcmtkb3duSXQgPSBpbml0ZihuZXdTdGF0ZSlcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtkb3duSXRcbiAgfVxufVxuXG5jb25zdCBpbml0SWZOZWVkZWQgPSB3cmFwSW5pdElmTmVlZGVkKGluaXQpXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIodGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdC5yZW5kZXIodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2Vucyh0ZXh0OiBzdHJpbmcsIHJMOiBib29sZWFuKSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBpbml0SWZOZWVkZWQoY3VycmVudENvbmZpZyhyTCkpXG4gIHJldHVybiBtYXJrZG93bkl0IS5wYXJzZSh0ZXh0LCB7fSlcbn1cbiJdfQ==