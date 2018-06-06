"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdownItModule = require("markdown-it");
const twemoji = require("twemoji");
const path = require("path");
const util_1 = require("./util");
const _ = require("lodash");
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
    if (initState.imsize)
        markdownIt.use(require('markdown-it-imsize'));
    return markdownIt;
}
function wrapInitIfNeeded(initf) {
    let markdownIt = null;
    let initState = null;
    return function (newState) {
        if (markdownIt === null || !_.isEqual(initState, newState)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyw0QkFBMkI7QUFJM0Isb0JBQW9CLElBQVk7SUFDOUIsT0FBTyw4Q0FBOEMsSUFBSSxrQkFBa0IsQ0FBQTtBQUM3RSxDQUFDO0FBRUQsbUJBQW1CLElBQVk7SUFDN0IsT0FBTyw0REFBNEQsSUFBSSxrQkFBa0IsQ0FBQTtBQUMzRixDQUFDO0FBRUQsb0JBQW9CLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELHVCQUF1QixFQUFXO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGlCQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQTtJQUM1QyxPQUFPO1FBQ0wsV0FBVyxFQUFFLEVBQUU7UUFDZixXQUFXLEVBQUUsTUFBTSxDQUFDLGNBQWM7UUFDbEMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1FBQ2hDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTTtRQUNsQixLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVE7UUFDdEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDbkMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO1FBQ3hCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtLQUNoRCxDQUFBO0FBQ0gsQ0FBQztBQUVELGNBQWMsU0FBb0I7SUFDaEMsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENB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Q29udGVudCI6WyJpbXBvcnQgbWFya2Rvd25JdE1vZHVsZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JylcbmltcG9ydCAqIGFzIHR3ZW1vamkgZnJvbSAndHdlbW9qaSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHBhaXJVcCwgYXRvbUNvbmZpZyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJ1xuXG50eXBlIEluaXRTdGF0ZSA9IFJlYWRvbmx5PFJldHVyblR5cGU8dHlwZW9mIGN1cnJlbnRDb25maWc+PlxuXG5mdW5jdGlvbiBtYXRoSW5saW5lKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gbWF0aEJsb2NrKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25zKGJyZWFrczogYm9vbGVhbikge1xuICByZXR1cm4ge1xuICAgIGh0bWw6IHRydWUsXG4gICAgeGh0bWxPdXQ6IGZhbHNlLFxuICAgIGJyZWFrcyxcbiAgICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICAgIGxpbmtpZnk6IHRydWUsXG4gICAgdHlwb2dyYXBoZXI6IHRydWUsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3VycmVudENvbmZpZyhyTDogYm9vbGVhbikge1xuICBjb25zdCBjb25maWcgPSBhdG9tQ29uZmlnKCkubWFya2Rvd25JdENvbmZpZ1xuICByZXR1cm4ge1xuICAgIHJlbmRlckxhVGVYOiByTCxcbiAgICBsYXp5SGVhZGVyczogY29uZmlnLnVzZUxhenlIZWFkZXJzLFxuICAgIGNoZWNrQm94ZXM6IGNvbmZpZy51c2VDaGVja0JveGVzLFxuICAgIHRvYzogY29uZmlnLnVzZVRvYyxcbiAgICBlbW9qaTogY29uZmlnLnVzZUVtb2ppLFxuICAgIGJyZWFrczogY29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lLFxuICAgIGltc2l6ZTogY29uZmlnLnVzZUltc2l6ZSxcbiAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogY29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IGNvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoaW5pdFN0YXRlOiBJbml0U3RhdGUpOiBtYXJrZG93bkl0TW9kdWxlLk1hcmtkb3duSXQge1xuICBjb25zdCBtYXJrZG93bkl0ID0gbWFya2Rvd25JdE1vZHVsZShnZXRPcHRpb25zKGluaXRTdGF0ZS5icmVha3MpKVxuXG4gIGlmIChpbml0U3RhdGUucmVuZGVyTGFUZVgpIHtcbiAgICBjb25zdCBpbmxpbmVEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdpbmxpbmVNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIGNvbnN0IGJsb2NrRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdibG9ja01hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCcuL21hcmtkb3duLWl0LW1hdGgnKS5tYXRoX3BsdWdpbiwge1xuICAgICAgaW5saW5lRGVsaW0sXG4gICAgICBibG9ja0RlbGltLFxuICAgICAgaW5saW5lUmVuZGVyZXI6IG1hdGhJbmxpbmUsXG4gICAgICBibG9ja1JlbmRlcmVyOiBtYXRoQmxvY2ssXG4gICAgfSlcbiAgfVxuXG4gIGlmIChpbml0U3RhdGUubGF6eUhlYWRlcnMpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWxhenktaGVhZGVycycpKVxuICBpZiAoaW5pdFN0YXRlLmNoZWNrQm94ZXMpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhc2stbGlzdHMnKSlcbiAgaWYgKGluaXRTdGF0ZS50b2MpIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhYmxlLW9mLWNvbnRlbnRzJykpXG5cbiAgaWYgKGluaXRTdGF0ZS5lbW9qaSkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWVtb2ppJykpXG4gICAgbWFya2Rvd25JdC5yZW5kZXJlci5ydWxlcy5lbW9qaSA9IGZ1bmN0aW9uKHRva2VuLCBpZHgpIHtcbiAgICAgIHJldHVybiB0d2Vtb2ppLnBhcnNlKHRva2VuW2lkeF0uY29udGVudCwge1xuICAgICAgICBmb2xkZXI6ICdzdmcnLFxuICAgICAgICBleHQ6ICcuc3ZnJyxcbiAgICAgICAgYmFzZTogcGF0aC5kaXJuYW1lKHJlcXVpcmUucmVzb2x2ZSgndHdlbW9qaScpKSArIHBhdGguc2VwLFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmltc2l6ZSkgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtaW1zaXplJykpXG5cbiAgcmV0dXJuIG1hcmtkb3duSXRcbn1cblxuZnVuY3Rpb24gd3JhcEluaXRJZk5lZWRlZChpbml0ZjogdHlwZW9mIGluaXQpOiB0eXBlb2YgaW5pdCB7XG4gIGxldCBtYXJrZG93bkl0OiBtYXJrZG93bkl0TW9kdWxlLk1hcmtkb3duSXQgfCBudWxsID0gbnVsbFxuICBsZXQgaW5pdFN0YXRlOiBJbml0U3RhdGUgfCBudWxsID0gbnVsbFxuXG4gIHJldHVybiBmdW5jdGlvbihuZXdTdGF0ZTogSW5pdFN0YXRlKSB7XG4gICAgaWYgKG1hcmtkb3duSXQgPT09IG51bGwgfHwgIV8uaXNFcXVhbChpbml0U3RhdGUsIG5ld1N0YXRlKSkge1xuICAgICAgaW5pdFN0YXRlID0gbmV3U3RhdGVcbiAgICAgIG1hcmtkb3duSXQgPSBpbml0ZihuZXdTdGF0ZSlcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtkb3duSXRcbiAgfVxufVxuXG5jb25zdCBpbml0SWZOZWVkZWQgPSB3cmFwSW5pdElmTmVlZGVkKGluaXQpXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIodGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdC5yZW5kZXIodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2Vucyh0ZXh0OiBzdHJpbmcsIHJMOiBib29sZWFuKSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBpbml0SWZOZWVkZWQoY3VycmVudENvbmZpZyhyTCkpXG4gIHJldHVybiBtYXJrZG93bkl0IS5wYXJzZSh0ZXh0LCB7fSlcbn1cbiJdfQ==