declare const _default: {
    loadMathJax(listener?: (() => any) | undefined): void;
    attachMathJax(): HTMLScriptElement;
    resetMathJax(): void;
    mathProcessor(domElements: Node[]): void;
    processHTMLString(html: string, callback: (proHTML: string) => any): void;
};
export = _default;
