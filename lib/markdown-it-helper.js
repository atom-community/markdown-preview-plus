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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyxtQ0FBZ0M7QUFJaEMsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLDhDQUE4QyxJQUFJLGtCQUFrQixDQUFBO0FBQzdFLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE9BQU8sNERBQTRELElBQUksa0JBQWtCLENBQUE7QUFDM0YsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQVc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsaUJBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFBO0lBQzVDLE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNO1FBQ2xCLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUTtRQUN0QixNQUFNLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNuQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDcEMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXO1FBQzVCLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUztRQUN4QixvQkFBb0IsRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ2pELG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxtQkFBbUI7S0FDaEQsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLElBQUksQ0FBQyxTQUFvQjtJQUNoQyxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFFakUsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLGFBQU0sQ0FDeEIsU0FBUyxDQUFDLG9CQUFvQixFQUM5QixzQkFBc0IsQ0FDdkIsQ0FBQTtRQUNELE1BQU0sVUFBVSxHQUFHLGFBQU0sQ0FDdkIsU0FBUyxDQUFDLG1CQUFtQixFQUM3QixxQkFBcUIsQ0FDdEIsQ0FBQTtRQUVELFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsV0FBVyxFQUFFO1lBQ3hELFdBQVc7WUFDWCxVQUFVO1lBQ1YsY0FBYyxFQUFFLFVBQVU7WUFDMUIsYUFBYSxFQUFFLFNBQVM7U0FDekIsQ0FBQyxDQUFBO0tBQ0g7SUFFRCxJQUFJLFNBQVMsQ0FBQyxXQUFXO1FBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFBO0lBQzlFLElBQUksU0FBUyxDQUFDLFVBQVU7UUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7SUFDM0UsSUFBSSxTQUFTLENBQUMsR0FBRztRQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQTtJQUUzRSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7UUFDbkIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFBO1FBQzVDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFTLEtBQUssRUFBRSxHQUFHO1lBQ25ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsTUFBTTtnQkFDWCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUc7YUFDMUQsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0tBQ0Y7SUFFRCxJQUFJLFNBQVMsQ0FBQyxZQUFZLEVBQUU7UUFDMUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFBO0tBQ3REO0lBQ0QsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO1FBQ3RCLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtLQUNoRDtJQUNELElBQUksU0FBUyxDQUFDLE1BQU07UUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUE7SUFFbkUsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsS0FBa0I7SUFDMUMsSUFBSSxVQUFVLEdBQXVDLElBQUksQ0FBQTtJQUN6RCxJQUFJLFNBQVMsR0FBcUIsSUFBSSxDQUFBO0lBRXRDLE9BQU8sVUFBUyxRQUFtQjtRQUNqQyxJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRTtZQUN4RCxTQUFTLEdBQUcsUUFBUSxDQUFBO1lBQ3BCLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDN0I7UUFDRCxPQUFPLFVBQVUsQ0FBQTtJQUNuQixDQUFDLENBQUE7QUFDSCxDQUFDO0FBRUQsTUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7QUFFM0MsU0FBZ0IsTUFBTSxDQUFDLElBQVksRUFBRSxFQUFXO0lBQzlDLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRCxPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsQ0FBQztBQUhELHdCQUdDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQVksRUFBRSxFQUFXO0lBQ2pELE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRCxPQUFPLFVBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLENBQUM7QUFIRCw4QkFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYXJrZG93bkl0TW9kdWxlID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKVxuaW1wb3J0ICogYXMgdHdlbW9qaSBmcm9tICd0d2Vtb2ppJ1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgcGFpclVwLCBhdG9tQ29uZmlnIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgaXNFcXVhbCB9IGZyb20gJ2xvZGFzaCdcblxudHlwZSBJbml0U3RhdGUgPSBSZWFkb25seTxSZXR1cm5UeXBlPHR5cGVvZiBjdXJyZW50Q29uZmlnPj5cblxuZnVuY3Rpb24gbWF0aElubGluZSh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+JHt0ZXh0fTwvc2NyaXB0Pjwvc3Bhbj5gXG59XG5cbmZ1bmN0aW9uIG1hdGhCbG9jayh0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyhicmVha3M6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHtcbiAgICBodG1sOiB0cnVlLFxuICAgIHhodG1sT3V0OiBmYWxzZSxcbiAgICBicmVha3MsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmctJyxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICAgIHR5cG9ncmFwaGVyOiB0cnVlLFxuICB9XG59XG5cbmZ1bmN0aW9uIGN1cnJlbnRDb25maWcockw6IGJvb2xlYW4pIHtcbiAgY29uc3QgY29uZmlnID0gYXRvbUNvbmZpZygpLm1hcmtkb3duSXRDb25maWdcbiAgcmV0dXJuIHtcbiAgICByZW5kZXJMYVRlWDogckwsXG4gICAgbGF6eUhlYWRlcnM6IGNvbmZpZy51c2VMYXp5SGVhZGVycyxcbiAgICBjaGVja0JveGVzOiBjb25maWcudXNlQ2hlY2tCb3hlcyxcbiAgICB0b2M6IGNvbmZpZy51c2VUb2MsXG4gICAgZW1vamk6IGNvbmZpZy51c2VFbW9qaSxcbiAgICBicmVha3M6IGNvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSxcbiAgICBjcml0aWNNYXJrdXA6IGNvbmZpZy51c2VDcml0aWNNYXJrdXAsXG4gICAgZm9vdG5vdGU6IGNvbmZpZy51c2VGb290bm90ZSxcbiAgICBpbXNpemU6IGNvbmZpZy51c2VJbXNpemUsXG4gICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IGNvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyxcbiAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBjb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyxcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0KGluaXRTdGF0ZTogSW5pdFN0YXRlKTogbWFya2Rvd25JdE1vZHVsZS5NYXJrZG93bkl0IHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IG1hcmtkb3duSXRNb2R1bGUoZ2V0T3B0aW9ucyhpbml0U3RhdGUuYnJlYWtzKSlcblxuICBpZiAoaW5pdFN0YXRlLnJlbmRlckxhVGVYKSB7XG4gICAgY29uc3QgaW5saW5lRGVsaW0gPSBwYWlyVXAoXG4gICAgICBpbml0U3RhdGUuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgICAnaW5saW5lTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICBjb25zdCBibG9ja0RlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gICAgICAnYmxvY2tNYXRoU2VwYXJhdG9ycycsXG4gICAgKVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnNhZmUtYW55XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnLi9tYXJrZG93bi1pdC1tYXRoJykubWF0aF9wbHVnaW4sIHtcbiAgICAgIGlubGluZURlbGltLFxuICAgICAgYmxvY2tEZWxpbSxcbiAgICAgIGlubGluZVJlbmRlcmVyOiBtYXRoSW5saW5lLFxuICAgICAgYmxvY2tSZW5kZXJlcjogbWF0aEJsb2NrLFxuICAgIH0pXG4gIH1cblxuICBpZiAoaW5pdFN0YXRlLmxhenlIZWFkZXJzKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1sYXp5LWhlYWRlcnMnKSlcbiAgaWYgKGluaXRTdGF0ZS5jaGVja0JveGVzKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC10YXNrLWxpc3RzJykpXG4gIGlmIChpbml0U3RhdGUudG9jKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC10YWJsZS1vZi1jb250ZW50cycpKVxuXG4gIGlmIChpbml0U3RhdGUuZW1vamkpIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1lbW9qaScpKVxuICAgIG1hcmtkb3duSXQucmVuZGVyZXIucnVsZXMuZW1vamkgPSBmdW5jdGlvbih0b2tlbiwgaWR4KSB7XG4gICAgICByZXR1cm4gdHdlbW9qaS5wYXJzZSh0b2tlbltpZHhdLmNvbnRlbnQsIHtcbiAgICAgICAgZm9sZGVyOiAnc3ZnJyxcbiAgICAgICAgZXh0OiAnLnN2ZycsXG4gICAgICAgIGJhc2U6IHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJ3R3ZW1vamknKSkgKyBwYXRoLnNlcCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5jcml0aWNNYXJrdXApIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCcuL21hcmtkb3duLWl0LWNyaXRpY21hcmt1cCcpKVxuICB9XG4gIGlmIChpbml0U3RhdGUuZm9vdG5vdGUpIHtcbiAgICBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1mb290bm90ZScpKVxuICB9XG4gIGlmIChpbml0U3RhdGUuaW1zaXplKSBtYXJrZG93bkl0LnVzZShyZXF1aXJlKCdtYXJrZG93bi1pdC1pbXNpemUnKSlcblxuICByZXR1cm4gbWFya2Rvd25JdFxufVxuXG5mdW5jdGlvbiB3cmFwSW5pdElmTmVlZGVkKGluaXRmOiB0eXBlb2YgaW5pdCk6IHR5cGVvZiBpbml0IHtcbiAgbGV0IG1hcmtkb3duSXQ6IG1hcmtkb3duSXRNb2R1bGUuTWFya2Rvd25JdCB8IG51bGwgPSBudWxsXG4gIGxldCBpbml0U3RhdGU6IEluaXRTdGF0ZSB8IG51bGwgPSBudWxsXG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5ld1N0YXRlOiBJbml0U3RhdGUpIHtcbiAgICBpZiAobWFya2Rvd25JdCA9PT0gbnVsbCB8fCAhaXNFcXVhbChpbml0U3RhdGUsIG5ld1N0YXRlKSkge1xuICAgICAgaW5pdFN0YXRlID0gbmV3U3RhdGVcbiAgICAgIG1hcmtkb3duSXQgPSBpbml0ZihuZXdTdGF0ZSlcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtkb3duSXRcbiAgfVxufVxuXG5jb25zdCBpbml0SWZOZWVkZWQgPSB3cmFwSW5pdElmTmVlZGVkKGluaXQpXG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIodGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdC5yZW5kZXIodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRva2Vucyh0ZXh0OiBzdHJpbmcsIHJMOiBib29sZWFuKSB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBpbml0SWZOZWVkZWQoY3VycmVudENvbmZpZyhyTCkpXG4gIHJldHVybiBtYXJrZG93bkl0IS5wYXJzZSh0ZXh0LCB7fSlcbn1cbiJdfQ==