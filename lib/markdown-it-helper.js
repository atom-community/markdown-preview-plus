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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBa0M7QUFDbEMsNkJBQTRCO0FBQzVCLGlDQUEyQztBQUMzQyw0QkFBMkI7QUFJM0Isb0JBQW9CLElBQVk7SUFDOUIsT0FBTyw4Q0FBOEMsSUFBSSxrQkFBa0IsQ0FBQTtBQUM3RSxDQUFDO0FBRUQsbUJBQW1CLElBQVk7SUFDN0IsT0FBTyw0REFBNEQsSUFBSSxrQkFBa0IsQ0FBQTtBQUMzRixDQUFDO0FBRUQsb0JBQW9CLE1BQWU7SUFDakMsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLEtBQUs7UUFDZixNQUFNO1FBQ04sVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFBO0FBQ0gsQ0FBQztBQUVELHVCQUF1QixFQUFXO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGlCQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQTtJQUM1QyxPQUFPO1FBQ0wsV0FBVyxFQUFFLEVBQUU7UUFDZixXQUFXLEVBQUUsTUFBTSxDQUFDLGNBQWM7UUFDbEMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1FBQ2hDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTTtRQUNsQixLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVE7UUFDdEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDbkMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLG9CQUFvQjtRQUNqRCxtQkFBbUIsRUFBRSxNQUFNLENBQUMsbUJBQW1CO0tBQ2hELENBQUE7QUFDSCxDQUFDO0FBRUQsY0FBYyxTQUFvQjtJQUNoQyxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFFakUsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLGFBQU0sQ0FDeEIsU0FBUyxDQUFDLG9CQUFvQixFQUM5QixzQkFBc0IsQ0FDdkIsQ0FBQTtRQUNELE1BQU0sVUFBVSxHQUFHLGFBQU0sQ0FDdkIsU0FBUyxDQUFDLG1CQUFtQixFQUM3QixxQkFBcUIsQ0FDdEIsQ0FBQTtRQUVELFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsV0FBVyxFQUFFO1lBQ3hELFdBQVc7WUFDWCxVQUFVO1lBQ1YsY0FBYyxFQUFFLFVBQVU7WUFDMUIsYUFBYSxFQUFFLFNBQVM7U0FDekIsQ0FBQyxDQUFBO0tBQ0g7SUFFRCxJQUFJLFNBQVMsQ0FBQyxXQUFXO1FBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFBO0lBQzlFLElBQUksU0FBUyxDQUFDLFVBQVU7UUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7SUFDM0UsSUFBSSxTQUFTLENBQUMsR0FBRztRQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQTtJQUUzRSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7UUFDbkIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFBO1FBQzVDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFTLEtBQUssRUFBRSxHQUFHO1lBQ25ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsTUFBTTtnQkFDWCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUc7YUFDMUQsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0tBQ0Y7SUFFRCxPQUFPLFVBQVUsQ0FBQTtBQUNuQixDQUFDO0FBRUQsMEJBQTBCLEtBQWtCO0lBQzFDLElBQUksVUFBVSxHQUF1QyxJQUFJLENBQUE7SUFDekQsSUFBSSxTQUFTLEdBQXFCLElBQUksQ0FBQTtJQUV0QyxPQUFPLFVBQVMsUUFBbUI7UUFDakMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDMUQsU0FBUyxHQUFHLFFBQVEsQ0FBQTtZQUNwQixVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQzdCO1FBQ0QsT0FBTyxVQUFVLENBQUE7SUFDbkIsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQUVELE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBRTNDLGdCQUF1QixJQUFZLEVBQUUsRUFBVztJQUM5QyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2hDLENBQUM7QUFIRCx3QkFHQztBQUVELG1CQUEwQixJQUFZLEVBQUUsRUFBVztJQUNqRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbEQsT0FBTyxVQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBSEQsOEJBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWFya2Rvd25JdE1vZHVsZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JylcbmltcG9ydCAqIGFzIHR3ZW1vamkgZnJvbSAndHdlbW9qaSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHBhaXJVcCwgYXRvbUNvbmZpZyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJ1xuXG50eXBlIEluaXRTdGF0ZSA9IFJlYWRvbmx5PFJldHVyblR5cGU8dHlwZW9mIGN1cnJlbnRDb25maWc+PlxuXG5mdW5jdGlvbiBtYXRoSW5saW5lKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gbWF0aEJsb2NrKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25zKGJyZWFrczogYm9vbGVhbikge1xuICByZXR1cm4ge1xuICAgIGh0bWw6IHRydWUsXG4gICAgeGh0bWxPdXQ6IGZhbHNlLFxuICAgIGJyZWFrcyxcbiAgICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICAgIGxpbmtpZnk6IHRydWUsXG4gICAgdHlwb2dyYXBoZXI6IHRydWUsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3VycmVudENvbmZpZyhyTDogYm9vbGVhbikge1xuICBjb25zdCBjb25maWcgPSBhdG9tQ29uZmlnKCkubWFya2Rvd25JdENvbmZpZ1xuICByZXR1cm4ge1xuICAgIHJlbmRlckxhVGVYOiByTCxcbiAgICBsYXp5SGVhZGVyczogY29uZmlnLnVzZUxhenlIZWFkZXJzLFxuICAgIGNoZWNrQm94ZXM6IGNvbmZpZy51c2VDaGVja0JveGVzLFxuICAgIHRvYzogY29uZmlnLnVzZVRvYyxcbiAgICBlbW9qaTogY29uZmlnLnVzZUVtb2ppLFxuICAgIGJyZWFrczogY29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lLFxuICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBjb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgYmxvY2tNYXRoU2VwYXJhdG9yczogY29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdChpbml0U3RhdGU6IEluaXRTdGF0ZSk6IG1hcmtkb3duSXRNb2R1bGUuTWFya2Rvd25JdCB7XG4gIGNvbnN0IG1hcmtkb3duSXQgPSBtYXJrZG93bkl0TW9kdWxlKGdldE9wdGlvbnMoaW5pdFN0YXRlLmJyZWFrcykpXG5cbiAgaWYgKGluaXRTdGF0ZS5yZW5kZXJMYVRlWCkge1xuICAgIGNvbnN0IGlubGluZURlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2lubGluZU1hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgY29uc3QgYmxvY2tEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2Jsb2NrTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5zYWZlLWFueVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtbWF0aCcpLm1hdGhfcGx1Z2luLCB7XG4gICAgICBpbmxpbmVEZWxpbSxcbiAgICAgIGJsb2NrRGVsaW0sXG4gICAgICBpbmxpbmVSZW5kZXJlcjogbWF0aElubGluZSxcbiAgICAgIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9jayxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5sYXp5SGVhZGVycykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtbGF6eS1oZWFkZXJzJykpXG4gIGlmIChpbml0U3RhdGUuY2hlY2tCb3hlcykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFzay1saXN0cycpKVxuICBpZiAoaW5pdFN0YXRlLnRvYykgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFibGUtb2YtY29udGVudHMnKSlcblxuICBpZiAoaW5pdFN0YXRlLmVtb2ppKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtZW1vamknKSlcbiAgICBtYXJrZG93bkl0LnJlbmRlcmVyLnJ1bGVzLmVtb2ppID0gZnVuY3Rpb24odG9rZW4sIGlkeCkge1xuICAgICAgcmV0dXJuIHR3ZW1vamkucGFyc2UodG9rZW5baWR4XS5jb250ZW50LCB7XG4gICAgICAgIGZvbGRlcjogJ3N2ZycsXG4gICAgICAgIGV4dDogJy5zdmcnLFxuICAgICAgICBiYXNlOiBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCd0d2Vtb2ppJykpICsgcGF0aC5zZXAsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXJrZG93bkl0XG59XG5cbmZ1bmN0aW9uIHdyYXBJbml0SWZOZWVkZWQoaW5pdGY6IHR5cGVvZiBpbml0KTogdHlwZW9mIGluaXQge1xuICBsZXQgbWFya2Rvd25JdDogbWFya2Rvd25JdE1vZHVsZS5NYXJrZG93bkl0IHwgbnVsbCA9IG51bGxcbiAgbGV0IGluaXRTdGF0ZTogSW5pdFN0YXRlIHwgbnVsbCA9IG51bGxcblxuICByZXR1cm4gZnVuY3Rpb24obmV3U3RhdGU6IEluaXRTdGF0ZSkge1xuICAgIGlmIChtYXJrZG93bkl0ID09PSBudWxsIHx8ICFfLmlzRXF1YWwoaW5pdFN0YXRlLCBuZXdTdGF0ZSkpIHtcbiAgICAgIGluaXRTdGF0ZSA9IG5ld1N0YXRlXG4gICAgICBtYXJrZG93bkl0ID0gaW5pdGYobmV3U3RhdGUpXG4gICAgfVxuICAgIHJldHVybiBtYXJrZG93bkl0XG4gIH1cbn1cblxuY29uc3QgaW5pdElmTmVlZGVkID0gd3JhcEluaXRJZk5lZWRlZChpbml0KVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgY29uc3QgbWFya2Rvd25JdCA9IGluaXRJZk5lZWRlZChjdXJyZW50Q29uZmlnKHJMKSlcbiAgcmV0dXJuIG1hcmtkb3duSXQucmVuZGVyKHRleHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbnModGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBjb25zdCBtYXJrZG93bkl0ID0gaW5pdElmTmVlZGVkKGN1cnJlbnRDb25maWcockwpKVxuICByZXR1cm4gbWFya2Rvd25JdCEucGFyc2UodGV4dCwge30pXG59XG4iXX0=