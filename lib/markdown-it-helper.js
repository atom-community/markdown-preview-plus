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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUVoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLDBEQUEwRCxJQUFJLGtCQUFrQixDQUFBO0FBQ3pGLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE9BQU8seUVBQXlFLElBQUksa0JBQWtCLENBQUE7QUFDeEcsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQVc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsaUJBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFBO0lBQzVDLE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ2xCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUTtRQUN0QixNQUFNLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDcEMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTO1FBQ3hCLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtLQUNo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QUE7SUFDbEQsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLENBQUM7QUFIRCx3QkFHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFZLEVBQUUsRUFBVztJQUNqRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBSEQsOEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWFya2Rvd25JdE1vZHVsZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JylcbmltcG9ydCBUb2tlbiA9IHJlcXVpcmUoJ21hcmtkb3duLWl0L2xpYi90b2tlbicpXG5pbXBvcnQgKiBhcyB0d2Vtb2ppIGZyb20gJ3R3ZW1vamknXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBwYWlyVXAsIGF0b21Db25maWcgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBpc0VxdWFsIH0gZnJvbSAnbG9kYXNoJ1xuXG50eXBlIEluaXRTdGF0ZSA9IFJlYWRvbmx5PFJldHVyblR5cGU8dHlwZW9mIGN1cnJlbnRDb25maWc+PlxuXG5mdW5jdGlvbiBtYXRoSW5saW5lKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoIGlubGluZS1tYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gbWF0aEJsb2NrKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoIGRpc3BsYXktbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyhicmVha3M6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHtcbiAgICBodG1sOiB0cnVlLFxuICAgIHhodG1sT3V0OiBmYWxzZSxcbiAgICBicmVha3MsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICAgIHR5cG9ncmFwaGVyOiB0cnVlLFxuICB9XG59XG5cbmZ1bmN0aW9uIGN1cnJlbnRDb25maWcockw6IGJvb2xlYW4pIHtcbiAgY29uc3QgY29uZmlnID0gYXRvbUNvbmZpZygpLm1hcmtkb3duSXRDb25maWdcbiAgcmV0dXJuIHtcbiAgICByZW5kZXJMYVRlWDogckwsXG4gICAgbGF6eUhlYWRlcnM6IGNvbmZpZy51c2VMYXp5SGVhZGVycyxcbiAgICBjaGVja0JveGVzOiBjb25maWcudXNlQ2hlY2tCb3hlcyxcbiAgICB0b2M6IGNvbmZpZy51c2VUb2MsXG4gICAgZW1vamk6IGNvbmZpZy51c2VFbW9qaSxcbiAgICBicmVha3M6IGNvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSxcbiAgICBjcml0aWNNYXJrdXA6IGNvbmZpZy51c2VDcml0aWNNYXJrdXAsXG4gICAgaW1zaXplOiBjb25maWcudXNlSW1zaXplLFxuICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBjb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgYmxvY2tNYXRoU2VwYXJhdG9yczogY29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdChpbml0U3RhdGU6IEluaXRTdGF0ZSk6IG1hcmtkb3duSXRNb2R1bGUge1xuICBjb25zdCBtYXJrZG93bkl0ID0gbWFya2Rvd25JdE1vZHVsZShnZXRPcHRpb25zKGluaXRTdGF0ZS5icmVha3MpKVxuXG4gIGlmIChpbml0U3RhdGUucmVuZGVyTGFUZVgpIHtcbiAgICBjb25zdCBpbmxpbmVEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdpbmxpbmVNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIGNvbnN0IGJsb2NrRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgICAgICdibG9ja01hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCcuL21hcmtkb3duLWl0LW1hdGgnKS5tYXRoX3BsdWdpbiwge1xuICAgICAgaW5saW5lRGVsaW0sXG4gICAgICBibG9ja0RlbGltLFxuICAgICAgaW5saW5lUmVuZGVyZXI6IG1hdGhJbmxpbmUsXG4gICAgICBibG9ja1JlbmRlcmVyOiBtYXRoQmxvY2ssXG4gICAgfSlcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLXVuc2FmZS1hbnlcbiAgaWYgKGluaXRTdGF0ZS5sYXp5SGVhZGVycykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtbGF6eS1oZWFkZXJzJykpXG4gIGlmIChpbml0U3RhdGUuY2hlY2tCb3hlcykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFzay1saXN0cycpKVxuICBpZiAoaW5pdFN0YXRlLnRvYykge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWFuY2hvcicpKVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LXRhYmxlLW9mLWNvbnRlbnRzJykpXG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmVtb2ppKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtZW1vamknKSlcbiAgICBtYXJrZG93bkl0LnJlbmRlcmVyLnJ1bGVzLmVtb2ppID0gZnVuY3Rpb24odG9rZW4sIGlkeCkge1xuICAgICAgcmV0dXJuIHR3ZW1vamkucGFyc2UodG9rZW5baWR4XS5jb250ZW50LCB7XG4gICAgICAgIGZvbGRlcjogJ3N2ZycsXG4gICAgICAgIGV4dDogJy5zdmcnLFxuICAgICAgICBiYXNlOiBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCd0d2Vtb2ppJykpICsgcGF0aC5zZXAsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbml0U3RhdGUuY3JpdGljTWFya3VwKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnLi9tYXJrZG93bi1pdC1jcml0aWNtYXJrdXAnKSlcbiAgfVxuICBpZiAoaW5pdFN0YXRlLmltc2l6ZSkgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtaW1zaXplJykpXG4gIC8vIHRzbGludDplbmFibGU6bm8tdW5zYWZlLWFueVxuXG4gIHJldHVybiBtYXJrZG93bkl0XG59XG5cbmZ1bmN0aW9uIHdyYXBJbml0SWZOZWVkZWQoaW5pdGY6IHR5cGVvZiBpbml0KTogdHlwZW9mIGluaXQge1xuICBsZXQgbWFya2Rvd25JdDogbWFya2Rvd25JdE1vZHVsZSB8IG51bGwgPSBudWxsXG4gIGxldCBpbml0U3RhdGU6IEluaXRTdGF0ZSB8IG51bGwgPSBudWxsXG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5ld1N0YXRlOiBJbml0U3RhdGUpIHtcbiAgICBpZiAobWFya2Rvd25JdCA9PT0gbnVsbCB8fCAhaXNFcXVhbChpbml0U3RhdGUsIG5ld1N0YXRlKSkge1xuICAgICAgaW5pdFN0YXRlID0gbmV3U3RhdGVcbiAgICAgIG1hcmtkb3duSXQgPSBpbml0ZihuZXdTdGF0ZSlcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtkb3duSXRcbiAgfVxufVxuXG5jb25zdCBpbml0SWZOZWVkZWQgPSB3cmFwSW5pdElmTmVlZGVkKGluaXQpXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIodGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdC5yZW5kZXIodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2Vucyh0ZXh0OiBzdHJpbmcsIHJMOiBib29sZWFuKTogVG9rZW5bXSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBpbml0SWZOZWVkZWQoY3VycmVudENvbmZpZyhyTCkpXG4gIHJldHVybiBtYXJrZG93bkl0IS5wYXJzZSh0ZXh0LCB7fSlcbn1cbiJdfQ==