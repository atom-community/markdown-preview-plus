"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdownItModule = require("markdown-it");
const twemoji = require("twemoji");
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
                folder: 'twemoji-svg',
                ext: '.svg',
                base: 'atom://markdown-preview-plus/assets/',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUVoRCxtQ0FBa0M7QUFDbEMsaUNBQTJDO0FBQzNDLG1DQUFnQztBQUloQyxTQUFTLFVBQVUsQ0FBQyxJQUFZO0lBQzlCLE9BQU8sMERBQTBELElBQUksa0JBQWtCLENBQUE7QUFDekYsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLElBQVk7SUFDN0IsT0FBTyx5RUFBeUUsSUFBSSxrQkFBa0IsQ0FBQTtBQUN4RyxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsTUFBZTtJQUNqQyxPQUFPO1FBQ0wsSUFBSSxFQUFFLElBQUk7UUFDVixRQUFRLEVBQUUsS0FBSztRQUNmLE1BQU07UUFDTixVQUFVLEVBQUUsT0FBTztRQUNuQixPQUFPLEVBQUUsSUFBSTtRQUNiLFdBQVcsRUFBRSxJQUFJO0tBQ2xCLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsRUFBVztJQUNoQyxNQUFNLE1BQU0sR0FBRyxpQkFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUE7SUFDNUMsT0FBTztRQUNMLFdBQVcsRUFBRSxFQUFFO1FBQ2YsV0FBVyxFQUFFLE1BQU0sQ0FBQyxjQUFjO1FBQ2xDLFVBQVUsRUFBRSxNQUFNLENBQUMsYUFBYTtRQUNoQyxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDbEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRO1FBQ3RCLE1BQU0sRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ25DLFlBQVksRUFBRSxNQUFNLENBQUMsZUFBZTtRQUNwQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFdBQVc7UUFDNUIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO1FBQ3hCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFB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QVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLENBQUM7QUFIRCx3QkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFZLEVBQUUsRUFBVztJQUNqRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBSEQsOEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWFya2Rvd25JdE1vZHVsZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JylcbmltcG9ydCBUb2tlbiA9IHJlcXVpcmUoJ21hcmtkb3duLWl0L2xpYi90b2tlbicpXG5pbXBvcnQgKiBhcyB0d2Vtb2ppIGZyb20gJ3R3ZW1vamknXG5pbXBvcnQgeyBwYWlyVXAsIGF0b21Db25maWcgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBpc0VxdWFsIH0gZnJvbSAnbG9kYXNoJ1xuXG50eXBlIEluaXRTdGF0ZSA9IFJlYWRvbmx5PFJldHVyblR5cGU8dHlwZW9mIGN1cnJlbnRDb25maWc+PlxuXG5mdW5jdGlvbiBtYXRoSW5saW5lKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoIGlubGluZS1tYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gbWF0aEJsb2NrKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoIGRpc3BsYXktbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyhicmVha3M6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHtcbiAgICBodG1sOiB0cnVlLFxuICAgIHhodG1sT3V0OiBmYWxzZSxcbiAgICBicmVha3MsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICAgIHR5cG9ncmFwaGVyOiB0cnVlLFxuICB9XG59XG5cbmZ1bmN0aW9uIGN1cnJlbnRDb25maWcockw6IGJvb2xlYW4pIHtcbiAgY29uc3QgY29uZmlnID0gYXRvbUNvbmZpZygpLm1hcmtkb3duSXRDb25maWdcbiAgcmV0dXJuIHtcbiAgICByZW5kZXJMYVRlWDogckwsXG4gICAgbGF6eUhlYWRlcnM6IGNvbmZpZy51c2VMYXp5SGVhZGVycyxcbiAgICBjaGVja0JveGVzOiBjb25maWcudXNlQ2hlY2tCb3hlcyxcbiAgICB0b2M6IGNvbmZpZy51c2VUb2MsXG4gICAgZW1vamk6IGNvbmZpZy51c2VFbW9qaSxcbiAgICBicmVha3M6IGNvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSxcbiAgICBjcml0aWNNYXJrdXA6IGNvbmZpZy51c2VDcml0aWNNYXJrdXAsXG4gICAgZm9vdG5vdGU6IGNvbmZpZy51c2VGb290bm90ZSxcbiAgICBpbXNpemU6IGNvbmZpZy51c2VJbXNpemUsXG4gICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IGNvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBjb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0KGluaXRTdGF0ZTogSW5pdFN0YXRlKTogbWFya2Rvd25JdE1vZHVsZSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBtYXJrZG93bkl0TW9kdWxlKGdldE9wdGlvbnMoaW5pdFN0YXRlLmJyZWFrcykpXG5cbiAgaWYgKGluaXRTdGF0ZS5yZW5kZXJMYVRlWCkge1xuICAgIGNvbnN0IGlubGluZURlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2lubGluZU1hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgY29uc3QgYmxvY2tEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2Jsb2NrTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5zYWZlLWFueVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtbWF0aCcpLm1hdGhfcGx1Z2luLCB7XG4gICAgICBpbmxpbmVEZWxpbSxcbiAgICAgIGJsb2NrRGVsaW0sXG4gICAgICBpbmxpbmVSZW5kZXJlcjogbWF0aElubGluZSxcbiAgICAgIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9jayxcbiAgICB9KVxuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGU6bm8tdW5zYWZlLWFueVxuICBpZiAoaW5pdFN0YXRlLmxhenlIZWFkZXJzKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1sYXp5LWhlYWRlcnMnKSlcbiAgaWYgKGluaXRTdGF0ZS5jaGVja0JveGVzKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC10YXNrLWxpc3RzJykpXG4gIGlmIChpbml0U3RhdGUudG9jKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtYW5jaG9yJykpXG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFibGUtb2YtY29udGVudHMnKSlcbiAgfVxuXG4gIGlmIChpbml0U3RhdGUuZW1vamkpIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1lbW9qaScpKVxuICAgIG1hcmtkb3duSXQucmVuZGVyZXIucnVsZXMuZW1vamkgPSBmdW5jdGlvbih0b2tlbiwgaWR4KSB7XG4gICAgICByZXR1cm4gdHdlbW9qaS5wYXJzZSh0b2tlbltpZHhdLmNvbnRlbnQsIHtcbiAgICAgICAgZm9sZGVyOiAndHdlbW9qaS1zdmcnLFxuICAgICAgICBleHQ6ICcuc3ZnJyxcbiAgICAgICAgYmFzZTogJ2F0b206Ly9tYXJrZG93bi1wcmV2aWV3LXBsdXMvYXNzZXRzLycsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbml0U3RhdGUuY3JpdGljTWFya3VwKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnLi9tYXJrZG93bi1pdC1jcml0aWNtYXJrdXAnKSlcbiAgfVxuICBpZiAoaW5pdFN0YXRlLmZvb3Rub3RlKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtZm9vdG5vdGUnKSlcbiAgfVxuICBpZiAoaW5pdFN0YXRlLmltc2l6ZSkgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtaW1zaXplJykpXG4gIC8vIHRzbGludDplbmFibGU6bm8tdW5zYWZlLWFueVxuXG4gIHJldHVybiBtYXJrZG93bkl0XG59XG5cbmZ1bmN0aW9uIHdyYXBJbml0SWZOZWVkZWQoaW5pdGY6IHR5cGVvZiBpbml0KTogdHlwZW9mIGluaXQge1xuICBsZXQgbWFya2Rvd25JdDogbWFya2Rvd25JdE1vZHVsZSB8IG51bGwgPSBudWxsXG4gIGxldCBpbml0U3RhdGU6IEluaXRTdGF0ZSB8IG51bGwgPSBudWxsXG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5ld1N0YXRlOiBJbml0U3RhdGUpIHtcbiAgICBpZiAobWFya2Rvd25JdCA9PT0gbnVsbCB8fCAhaXNFcXVhbChpbml0U3RhdGUsIG5ld1N0YXRlKSkge1xuICAgICAgaW5pdFN0YXRlID0gbmV3U3RhdGVcbiAgICAgIG1hcmtkb3duSXQgPSBpbml0ZihuZXdTdGF0ZSlcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtkb3duSXRcbiAgfVxufVxuXG5jb25zdCBpbml0SWZOZWVkZWQgPSB3cmFwSW5pdElmTmVlZGVkKGluaXQpXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIodGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdC5yZW5kZXIodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2Vucyh0ZXh0OiBzdHJpbmcsIHJMOiBib29sZWFuKTogVG9rZW5bXSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBpbml0SWZOZWVkZWQoY3VycmVudENvbmZpZyhyTCkpXG4gIHJldHVybiBtYXJrZG93bkl0IS5wYXJzZSh0ZXh0LCB7fSlcbn1cbiJdfQ==