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
    const config = atom.config.get('markdown-preview-plus');
    return {
        renderLaTeX: rL,
        lazyHeaders: config.useLazyHeaders,
        checkBoxes: config.useCheckBoxes,
        toc: config.useToc,
        emoji: config.useEmoji,
        breaks: config.breakOnSingleNewline,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUErQjtBQUMvQiw0QkFBMkI7QUFJM0Isb0JBQW9CLElBQVk7SUFDOUIsT0FBTyw4Q0FBOEMsSUFBSSxrQkFBa0IsQ0FBQTtBQUM3RSxDQUFDO0FBRUQsbUJBQW1CLElBQVk7SUFDN0IsT0FBTyw0REFBNEQsSUFBSSxrQkFBa0IsQ0FBQTtBQUMzRixDQUFDO0FBRUQsb0JBQW9CLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELHVCQUF1QixFQUFXO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7SUFDdkQsT0FBTztRQUNMLFdBQVcsRUFBRSxFQUFFO1FBQ2YsV0FBVyxFQUFFLE1BQU0sQ0FBQyxjQUFjO1FBQ2xDLFVBQVUsRUFBRSxNQUFNLENBQUMsYUFBYTtRQUNoQyxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU07UUFDbEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRO1FBQ3RCLE1BQU0sRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ25DLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtLQUNoRCxDQUFBO0FBQ0gsQ0FBQztBQUVELGNBQWMsU0FBb0I7SUFDaEMsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBRWpFLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRTtRQUN6QixNQUFNLFdBQVcsR0FBRyxhQUFNLENBQ3hCLFNBQVMsQ0FBQyxvQkFBb0IsRUFDOUIsc0JBQXNCLENBQ3ZCLENBQUE7UUFDRCxNQUFNLFVBQVUsR0FBRyxhQUFNLENBQ3ZCLFNBQVMsQ0FBQyxtQkFBbUIsRUFDN0IscUJBQXFCLENBQ3RCLENBQUE7UUFFRCxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFdBQVcsRUFBRTtZQUN4RCxXQUFXO1lBQ1gsVUFBVTtZQUNWLGNBQWMsRUFBRSxVQUFVO1lBQzFCLGFBQWEsRUFBRSxTQUFTO1NBQ3pCLENBQUMsQ0FBQTtLQUNIO0lBRUQsSUFBSSxTQUFTLENBQUMsV0FBVztRQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQTtJQUM5RSxJQUFJLFNBQVMsQ0FBQyxVQUFVO1FBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFBO0lBQzNFLElBQUksU0FBUyxDQUFDLEdBQUc7UUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUE7SUFFM0UsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ25CLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQTtRQUM1QyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBUyxLQUFLLEVBQUUsR0FBRztZQUNuRCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDdkMsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsR0FBRyxFQUFFLE1BQU07Z0JBQ1gsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHO2FBQzFELENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtLQUNGO0lBRUQsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQztBQUVELDBCQUEwQixLQUFrQjtJQUMxQyxJQUFJLFVBQVUsR0FBdUMsSUFBSSxDQUFBO0lBQ3pELElBQUksU0FBUyxHQUFxQixJQUFJLENBQUE7SUFFdEMsT0FBTyxVQUFTLFFBQW1CO1FBQ2pDLElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQzFELFNBQVMsR0FBRyxRQUFRLENBQUE7WUFDcEIsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUM3QjtRQUNELE9BQU8sVUFBVSxDQUFBO0lBQ25CLENBQUMsQ0FBQTtBQUNILENBQUM7QUFFRCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUUzQyxnQkFBdUIsSUFBWSxFQUFFLEVBQVc7SUFDOUMsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xELE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBSEQsd0JBR0M7QUFFRCxtQkFBMEIsSUFBWSxFQUFFLEVBQVc7SUFDakQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xELE9BQU8sVUFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDcEMsQ0FBQztBQUhELDhCQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1hcmtkb3duSXRNb2R1bGUgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpXG5pbXBvcnQgKiBhcyB0d2Vtb2ppIGZyb20gJ3R3ZW1vamknXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBwYWlyVXAgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCdcblxudHlwZSBJbml0U3RhdGUgPSBSZWFkb25seTxSZXR1cm5UeXBlPHR5cGVvZiBjdXJyZW50Q29uZmlnPj5cblxuZnVuY3Rpb24gbWF0aElubGluZSh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+JHt0ZXh0fTwvc2NyaXB0Pjwvc3Bhbj5gXG59XG5cbmZ1bmN0aW9uIG1hdGhCbG9jayh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyhicmVha3M6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHtcbiAgICBodG1sOiB0cnVlLFxuICAgIHhodG1sT3V0OiBmYWxzZSxcbiAgICBicmVha3MsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICAgIHR5cG9ncmFwaGVyOiB0cnVlLFxuICB9XG59XG5cbmZ1bmN0aW9uIGN1cnJlbnRDb25maWcockw6IGJvb2xlYW4pIHtcbiAgY29uc3QgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKVxuICByZXR1cm4ge1xuICAgIHJlbmRlckxhVGVYOiByTCxcbiAgICBsYXp5SGVhZGVyczogY29uZmlnLnVzZUxhenlIZWFkZXJzLFxuICAgIGNoZWNrQm94ZXM6IGNvbmZpZy51c2VDaGVja0JveGVzLFxuICAgIHRvYzogY29uZmlnLnVzZVRvYyxcbiAgICBlbW9qaTogY29uZmlnLnVzZUVtb2ppLFxuICAgIGJyZWFrczogY29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lLFxuICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBjb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgYmxvY2tNYXRoU2VwYXJhdG9yczogY29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdChpbml0U3RhdGU6IEluaXRTdGF0ZSk6IG1hcmtkb3duSXRNb2R1bGUuTWFya2Rvd25JdCB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBtYXJrZG93bkl0TW9kdWxlKGdldE9wdGlvbnMoaW5pdFN0YXRlLmJyZWFrcykpXG5cbiAgaWYgKGluaXRTdGF0ZS5yZW5kZXJMYVRlWCkge1xuICAgIGNvbnN0IGlubGluZURlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2lubGluZU1hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgY29uc3QgYmxvY2tEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2Jsb2NrTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5zYWZlLWFueVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtbWF0aCcpLm1hdGhfcGx1Z2luLCB7XG4gICAgICBpbmxpbmVEZWxpbSxcbiAgICAgIGJsb2NrRGVsaW0sXG4gICAgICBpbmxpbmVSZW5kZXJlcjogbWF0aElubGluZSxcbiAgICAgIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9jayxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5sYXp5SGVhZGVycykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtbGF6eS1oZWFkZXJzJykpXG4gIGlmIChpbml0U3RhdGUuY2hlY2tCb3hlcykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFzay1saXN0cycpKVxuICBpZiAoaW5pdFN0YXRlLnRvYykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFibGUtb2YtY29udGVudHMnKSlcblxuICBpZiAoaW5pdFN0YXRlLmVtb2ppKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtZW1vamknKSlcbiAgICBtYXJrZG93bkl0LnJlbmRlcmVyLnJ1bGVzLmVtb2ppID0gZnVuY3Rpb24odG9rZW4sIGlkeCkge1xuICAgICAgcmV0dXJuIHR3ZW1vamkucGFyc2UodG9rZW5baWR4XS5jb250ZW50LCB7XG4gICAgICAgIGZvbGRlcjogJ3N2ZycsXG4gICAgICAgIGV4dDogJy5zdmcnLFxuICAgICAgICBiYXNlOiBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCd0d2Vtb2ppJykpICsgcGF0aC5zZXAsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXJrZG93bkl0XG59XG5cbmZ1bmN0aW9uIHdyYXBJbml0SWZOZWVkZWQoaW5pdGY6IHR5cGVvZiBpbml0KTogdHlwZW9mIGluaXQge1xuICBsZXQgbWFya2Rvd25JdDogbWFya2Rvd25JdE1vZHVsZS5NYXJrZG93bkl0IHwgbnVsbCA9IG51bGxcbiAgbGV0IGluaXRTdGF0ZTogSW5pdFN0YXRlIHwgbnVsbCA9IG51bGxcblxuICByZXR1cm4gZnVuY3Rpb24obmV3U3RhdGU6IEluaXRTdGF0ZSkge1xuICAgIGlmIChtYXJrZG93bkl0ID09PSBudWxsIHx8ICFfLmlzRXF1YWwoaW5pdFN0YXRlLCBuZXdTdGF0ZSkpIHtcbiAgICAgIGluaXRTdGF0ZSA9IG5ld1N0YXRlXG4gICAgICBtYXJrZG93bkl0ID0gaW5pdGYobmV3U3RhdGUpXG4gICAgfVxuICAgIHJldHVybiBtYXJrZG93bkl0XG4gIH1cbn1cblxuY29uc3QgaW5pdElmTmVlZGVkID0gd3JhcEluaXRJZk5lZWRlZChpbml0KVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IGluaXRJZk5lZWRlZChjdXJyZW50Q29uZmlnKHJMKSlcbiAgcmV0dXJuIG1hcmtkb3duSXQucmVuZGVyKHRleHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbnModGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdCEucGFyc2UodGV4dCwge30pXG59XG4iXX0=