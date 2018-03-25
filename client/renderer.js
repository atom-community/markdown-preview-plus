"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highlight = require("atom-highlight");
const extension_helper_1 = require("../lib/extension-helper");
function highlightCodeBlocks(domFragment, defaultLanguage = 'text', fontFamily = '') {
    if (fontFamily) {
        for (const codeElement of Array.from(domFragment.querySelectorAll('code'))) {
            codeElement.style.fontFamily = fontFamily;
        }
    }
    for (const preElement of Array.from(domFragment.querySelectorAll('pre'))) {
        const codeBlock = preElement.firstElementChild !== null
            ? preElement.firstElementChild
            : preElement;
        const cbClass = codeBlock.className;
        const fenceName = cbClass
            ? cbClass.replace(/^(lang-|sourceCode )/, '')
            : defaultLanguage;
        preElement.outerHTML = highlight({
            fileContents: codeBlock.textContent.replace(/\n$/, ''),
            scopeName: extension_helper_1.scopeForFenceName(fenceName),
            nbsp: false,
            lineDivs: true,
            editorDiv: true,
            editorDivTag: 'atom-text-editor',
            editorDivClass: fenceName ? `lang-${fenceName}` : '',
        });
    }
    return domFragment;
}
exports.highlightCodeBlocks = highlightCodeBlocks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMtY2xpZW50L3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQTRDO0FBQzVDLDhEQUEyRDtBQUUzRCw2QkFDRSxXQUFvQixFQUNwQixrQkFBMEIsTUFBTSxFQUNoQyxhQUFxQixFQUFFO0lBRXZCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDZixHQUFHLENBQUMsQ0FBQyxNQUFNLFdBQVcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUNsQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBQ0YsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO1FBQzNDLENBQUM7SUFDSCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQUMsTUFBTSxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekUsTUFBTSxTQUFTLEdBQ2IsVUFBVSxDQUFDLGlCQUFpQixLQUFLLElBQUk7WUFDbkMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUI7WUFDOUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQTtRQUNoQixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFBO1FBQ25DLE1BQU0sU0FBUyxHQUFHLE9BQU87WUFDdkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDO1lBQzdDLENBQUMsQ0FBQyxlQUFlLENBQUE7UUFFbkIsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDL0IsWUFBWSxFQUFFLFNBQVMsQ0FBQyxXQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDdkQsU0FBUyxFQUFFLG9DQUFpQixDQUFDLFNBQVMsQ0FBQztZQUN2QyxJQUFJLEVBQUUsS0FBSztZQUNYLFFBQVEsRUFBRSxJQUFJO1lBQ2QsU0FBUyxFQUFFLElBQUk7WUFDZixZQUFZLEVBQUUsa0JBQWtCO1lBRWhDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7U0FDckQsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUE7QUFDcEIsQ0FBQztBQXBDRCxrREFvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaGlnaGxpZ2h0ID0gcmVxdWlyZSgnYXRvbS1oaWdobGlnaHQnKVxuaW1wb3J0IHsgc2NvcGVGb3JGZW5jZU5hbWUgfSBmcm9tICcuLi9saWIvZXh0ZW5zaW9uLWhlbHBlcidcblxuZXhwb3J0IGZ1bmN0aW9uIGhpZ2hsaWdodENvZGVCbG9ja3MoXG4gIGRvbUZyYWdtZW50OiBFbGVtZW50LFxuICBkZWZhdWx0TGFuZ3VhZ2U6IHN0cmluZyA9ICd0ZXh0JyxcbiAgZm9udEZhbWlseTogc3RyaW5nID0gJycsXG4pIHtcbiAgaWYgKGZvbnRGYW1pbHkpIHtcbiAgICBmb3IgKGNvbnN0IGNvZGVFbGVtZW50IG9mIEFycmF5LmZyb20oXG4gICAgICBkb21GcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdjb2RlJyksXG4gICAgKSkge1xuICAgICAgY29kZUVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IGZvbnRGYW1pbHlcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHByZUVsZW1lbnQgb2YgQXJyYXkuZnJvbShkb21GcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdwcmUnKSkpIHtcbiAgICBjb25zdCBjb2RlQmxvY2sgPVxuICAgICAgcHJlRWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZCAhPT0gbnVsbFxuICAgICAgICA/IHByZUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgOiBwcmVFbGVtZW50XG4gICAgY29uc3QgY2JDbGFzcyA9IGNvZGVCbG9jay5jbGFzc05hbWVcbiAgICBjb25zdCBmZW5jZU5hbWUgPSBjYkNsYXNzXG4gICAgICA/IGNiQ2xhc3MucmVwbGFjZSgvXihsYW5nLXxzb3VyY2VDb2RlICkvLCAnJylcbiAgICAgIDogZGVmYXVsdExhbmd1YWdlXG5cbiAgICBwcmVFbGVtZW50Lm91dGVySFRNTCA9IGhpZ2hsaWdodCh7XG4gICAgICBmaWxlQ29udGVudHM6IGNvZGVCbG9jay50ZXh0Q29udGVudCEucmVwbGFjZSgvXFxuJC8sICcnKSxcbiAgICAgIHNjb3BlTmFtZTogc2NvcGVGb3JGZW5jZU5hbWUoZmVuY2VOYW1lKSxcbiAgICAgIG5ic3A6IGZhbHNlLFxuICAgICAgbGluZURpdnM6IHRydWUsXG4gICAgICBlZGl0b3JEaXY6IHRydWUsXG4gICAgICBlZGl0b3JEaXZUYWc6ICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgIC8vIFRoZSBgZWRpdG9yYCBjbGFzcyBtZXNzZXMgdGhpbmdzIHVwIGFzIGAuZWRpdG9yYCBoYXMgYWJzb2x1dGVseSBwb3NpdGlvbmVkIGxpbmVzXG4gICAgICBlZGl0b3JEaXZDbGFzczogZmVuY2VOYW1lID8gYGxhbmctJHtmZW5jZU5hbWV9YCA6ICcnLFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gZG9tRnJhZ21lbnRcbn1cbiJdfQ==