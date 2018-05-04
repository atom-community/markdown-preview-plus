"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdownItModule = require("markdown-it");
const twemoji = require("twemoji");
const path = require("path");
const util_1 = require("./util");
const _ = require("lodash");
let markdownIt = null;
let initState = null;
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
        emoji: config.useEmoji,
        breaks: config.breakOnSingleNewline,
        inlineMathSeparators: config.inlineMathSeparators,
        blockMathSeparators: config.blockMathSeparators,
    };
}
function init(rL) {
    initState = currentConfig(rL);
    markdownIt = markdownItModule(getOptions(initState.breaks));
    if (rL) {
        const inlineDelim = util_1.pairUp(initState.inlineMathSeparators, 'inlineMathSeparators');
        const blockDelim = util_1.pairUp(initState.blockMathSeparators, 'blockMathSeparators');
        markdownIt.use(require('./markdown-it-math').math_plugin, {
            inlineDelim,
            blockDelim,
            inlineRenderer: mathInline,
            blockRenderer: mathBlock,
        });
    }
    if (initState.lazyHeaders) {
        markdownIt.use(require('markdown-it-lazy-headers'));
    }
    if (initState.checkBoxes) {
        markdownIt.use(require('markdown-it-task-lists'));
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
}
function needsInit(rL) {
    return (markdownIt === null ||
        initState === null ||
        !_.isEqual(initState, currentConfig(rL)));
}
function render(text, rL) {
    if (needsInit(rL))
        init(rL);
    return markdownIt.render(text);
}
exports.render = render;
function decode(url) {
    if (!markdownIt)
        throw new Error('markdownIt not initialized');
    return markdownIt.normalizeLinkText(url);
}
exports.decode = decode;
function getTokens(text, rL) {
    if (needsInit(rL))
        init(rL);
    return markdownIt.parse(text, {});
}
exports.getTokens = getTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24taXQtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLWl0LWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUNoRCxtQ0FBbUM7QUFDbkMsNkJBQTRCO0FBQzVCLGlDQUErQjtBQUMvQiw0QkFBMkI7QUFFM0IsSUFBSSxVQUFVLEdBQXVDLElBQUksQ0FBQTtBQVd6RCxJQUFJLFNBQVMsR0FBcUIsSUFBSSxDQUFBO0FBRXRDLG9CQUFvQixJQUFZO0lBQzlCLE9BQU8sOENBQThDLElBQUksa0JBQWtCLENBQUE7QUFDN0UsQ0FBQztBQUVELG1CQUFtQixJQUFZO0lBQzdCLE9BQU8sNERBQTRELElBQUksa0JBQWtCLENBQUE7QUFDM0YsQ0FBQztBQUVELG9CQUFvQixNQUFlO0lBQ2pDLE9BQU87UUFDTCxJQUFJLEVBQUUsSUFBSTtRQUNWLFFBQVEsRUFBRSxLQUFLO1FBQ2YsTUFBTTtRQUNOLFVBQVUsRUFBRSxPQUFPO1FBQ25CLE9BQU8sRUFBRSxJQUFJO1FBQ2IsV0FBVyxFQUFFLElBQUk7S0FDbEIsQ0FBQTtBQUNILENBQUM7QUFFRCx1QkFBdUIsRUFBVztJQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO0lBQ3ZELE9BQU87UUFDTCxXQUFXLEVBQUUsRUFBRTtRQUNmLFdBQVcsRUFBRSxNQUFNLENBQUMsY0FBYztRQUNsQyxVQUFVLEVBQUUsTUFBTSxDQUFDLGFBQWE7UUFDaEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRO1FBQ3RCLE1BQU0sRUFBRSxNQUFNLENBQUMsb0JBQW9CO1FBQ25DLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtLQUNoRCxDQUFBO0FBQ0gsQ0FBQztBQUVELGNBQWMsRUFBVztJQUN2QixTQUFTLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzdCLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFFM0QsSUFBSSxFQUFFLEVBQUU7UUFDTixNQUFNLFdBQVcsR0FBRyxhQUFNLENBQ3hCLFNBQVMsQ0FBQyxvQkFBb0IsRUFDOUIsc0JBQXNCLENBQ3ZCLENBQUE7UUFDRCxNQUFNLFVBQVUsR0FBRyxhQUFNLENBQ3ZCLFNBQVMsQ0FBQyxtQkFBbUIsRUFDN0IscUJBQXFCLENBQ3RCLENBQUE7UUFFRCxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFdBQVcsRUFBRTtZQUN4RCxXQUFXO1lBQ1gsVUFBVTtZQUNWLGNBQWMsRUFBRSxVQUFVO1lBQzFCLGFBQWEsRUFBRSxTQUFTO1NBQ3pCLENBQUMsQ0FBQTtLQUNIO0lBRUQsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFO1FBQ3pCLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQTtLQUNwRDtJQUVELElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRTtRQUN4QixVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7S0FDbEQ7SUFFRCxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7UUFDbkIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFBO1FBQzVDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFTLEtBQUssRUFBRSxHQUFHO1lBQ25ELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsTUFBTTtnQkFDWCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUc7YUFDMUQsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsbUJBQW1CLEVBQVc7SUFDNUIsT0FBTyxDQUNMLFVBQVUsS0FBSyxJQUFJO1FBQ25CLFNBQVMsS0FBSyxJQUFJO1FBQ2xCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pDLENBQUE7QUFDSCxDQUFDO0FBRUQsZ0JBQXVCLElBQVksRUFBRSxFQUFXO0lBQzlDLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMzQixPQUFPLFVBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDakMsQ0FBQztBQUhELHdCQUdDO0FBRUQsZ0JBQXVCLEdBQVc7SUFDaEMsSUFBSSxDQUFDLFVBQVU7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUE7SUFDOUQsT0FBTyxVQUFVLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUMsQ0FBQztBQUhELHdCQUdDO0FBRUQsbUJBQTBCLElBQVksRUFBRSxFQUFXO0lBQ2pELElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMzQixPQUFPLFVBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLENBQUM7QUFIRCw4QkFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYXJrZG93bkl0TW9kdWxlID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKVxuaW1wb3J0IHR3ZW1vamkgPSByZXF1aXJlKCd0d2Vtb2ppJylcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHBhaXJVcCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgQ29uZmlnVmFsdWVzIH0gZnJvbSAnYXRvbSdcbmxldCBtYXJrZG93bkl0OiBtYXJrZG93bkl0TW9kdWxlLk1hcmtkb3duSXQgfCBudWxsID0gbnVsbFxudHlwZSBDb25maWcgPSBDb25maWdWYWx1ZXNbJ21hcmtkb3duLXByZXZpZXctcGx1cyddXG50eXBlIEluaXRTdGF0ZSA9IFJlYWRvbmx5PHtcbiAgcmVuZGVyTGFUZVg6IGJvb2xlYW5cbiAgbGF6eUhlYWRlcnM6IENvbmZpZ1sndXNlTGF6eUhlYWRlcnMnXVxuICBjaGVja0JveGVzOiBDb25maWdbJ3VzZUNoZWNrQm94ZXMnXVxuICBlbW9qaTogQ29uZmlnWyd1c2VFbW9qaSddXG4gIGJyZWFrczogQ29uZmlnWydicmVha09uU2luZ2xlTmV3bGluZSddXG4gIGlubGluZU1hdGhTZXBhcmF0b3JzOiBDb25maWdbJ2lubGluZU1hdGhTZXBhcmF0b3JzJ11cbiAgYmxvY2tNYXRoU2VwYXJhdG9yczogQ29uZmlnWydibG9ja01hdGhTZXBhcmF0b3JzJ11cbn0+XG5sZXQgaW5pdFN0YXRlOiBJbml0U3RhdGUgfCBudWxsID0gbnVsbFxuXG5mdW5jdGlvbiBtYXRoSW5saW5lKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz4ke3RleHR9PC9zY3JpcHQ+PC9zcGFuPmBcbn1cblxuZnVuY3Rpb24gbWF0aEJsb2NrKHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gYDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPiR7dGV4dH08L3NjcmlwdD48L3NwYW4+YFxufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25zKGJyZWFrczogYm9vbGVhbikge1xuICByZXR1cm4ge1xuICAgIGh0bWw6IHRydWUsXG4gICAgeGh0bWxPdXQ6IGZhbHNlLFxuICAgIGJyZWFrcyxcbiAgICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICAgIGxpbmtpZnk6IHRydWUsXG4gICAgdHlwb2dyYXBoZXI6IHRydWUsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3VycmVudENvbmZpZyhyTDogYm9vbGVhbik6IEluaXRTdGF0ZSB7XG4gIGNvbnN0IGNvbmZpZyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzJylcbiAgcmV0dXJuIHtcbiAgICByZW5kZXJMYVRlWDogckwsXG4gICAgbGF6eUhlYWRlcnM6IGNvbmZpZy51c2VMYXp5SGVhZGVycyxcbiAgICBjaGVja0JveGVzOiBjb25maWcudXNlQ2hlY2tCb3hlcyxcbiAgICBlbW9qaTogY29uZmlnLnVzZUVtb2ppLFxuICAgIGJyZWFrczogY29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lLFxuICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBjb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMsXG4gICAgYmxvY2tNYXRoU2VwYXJhdG9yczogY29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdChyTDogYm9vbGVhbikge1xuICBpbml0U3RhdGUgPSBjdXJyZW50Q29uZmlnKHJMKVxuICBtYXJrZG93bkl0ID0gbWFya2Rvd25JdE1vZHVsZShnZXRPcHRpb25zKGluaXRTdGF0ZS5icmVha3MpKVxuXG4gIGlmIChyTCkge1xuICAgIGNvbnN0IGlubGluZURlbGltID0gcGFpclVwKFxuICAgICAgaW5pdFN0YXRlLmlubGluZU1hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2lubGluZU1hdGhTZXBhcmF0b3JzJyxcbiAgICApXG4gICAgY29uc3QgYmxvY2tEZWxpbSA9IHBhaXJVcChcbiAgICAgIGluaXRTdGF0ZS5ibG9ja01hdGhTZXBhcmF0b3JzLFxuICAgICAgJ2Jsb2NrTWF0aFNlcGFyYXRvcnMnLFxuICAgIClcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5zYWZlLWFueVxuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJy4vbWFya2Rvd24taXQtbWF0aCcpLm1hdGhfcGx1Z2luLCB7XG4gICAgICBpbmxpbmVEZWxpbSxcbiAgICAgIGJsb2NrRGVsaW0sXG4gICAgICBpbmxpbmVSZW5kZXJlcjogbWF0aElubGluZSxcbiAgICAgIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9jayxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5sYXp5SGVhZGVycykge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWxhenktaGVhZGVycycpKVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5jaGVja0JveGVzKSB7XG4gICAgbWFya2Rvd25JdC51c2UocmVxdWlyZSgnbWFya2Rvd24taXQtdGFzay1saXN0cycpKVxuICB9XG5cbiAgaWYgKGluaXRTdGF0ZS5lbW9qaSkge1xuICAgIG1hcmtkb3duSXQudXNlKHJlcXVpcmUoJ21hcmtkb3duLWl0LWVtb2ppJykpXG4gICAgbWFya2Rvd25JdC5yZW5kZXJlci5ydWxlcy5lbW9qaSA9IGZ1bmN0aW9uKHRva2VuLCBpZHgpIHtcbiAgICAgIHJldHVybiB0d2Vtb2ppLnBhcnNlKHRva2VuW2lkeF0uY29udGVudCwge1xuICAgICAgICBmb2xkZXI6ICdzdmcnLFxuICAgICAgICBleHQ6ICcuc3ZnJyxcbiAgICAgICAgYmFzZTogcGF0aC5kaXJuYW1lKHJlcXVpcmUucmVzb2x2ZSgndHdlbW9qaScpKSArIHBhdGguc2VwLFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbmVlZHNJbml0KHJMOiBib29sZWFuKSB7XG4gIHJldHVybiAoXG4gICAgbWFya2Rvd25JdCA9PT0gbnVsbCB8fFxuICAgIGluaXRTdGF0ZSA9PT0gbnVsbCB8fFxuICAgICFfLmlzRXF1YWwoaW5pdFN0YXRlLCBjdXJyZW50Q29uZmlnKHJMKSlcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKHRleHQ6IHN0cmluZywgckw6IGJvb2xlYW4pIHtcbiAgaWYgKG5lZWRzSW5pdChyTCkpIGluaXQockwpXG4gIHJldHVybiBtYXJrZG93bkl0IS5yZW5kZXIodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZSh1cmw6IHN0cmluZykge1xuICBpZiAoIW1hcmtkb3duSXQpIHRocm93IG5ldyBFcnJvcignbWFya2Rvd25JdCBub3QgaW5pdGlhbGl6ZWQnKVxuICByZXR1cm4gbWFya2Rvd25JdC5ub3JtYWxpemVMaW5rVGV4dCh1cmwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2tlbnModGV4dDogc3RyaW5nLCByTDogYm9vbGVhbikge1xuICBpZiAobmVlZHNJbml0KHJMKSkgaW5pdChyTClcbiAgcmV0dXJuIG1hcmtkb3duSXQhLnBhcnNlKHRleHQsIHt9KVxufVxuIl19