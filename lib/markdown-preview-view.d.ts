/// <reference types="markdown-it" />
import { Token } from 'markdown-it';
import { Disposable, TextEditor, Grammar } from 'atom';
export interface MPVParamsEditor {
    editorId: number;
    filePath?: undefined;
}
export interface MPVParamsPath {
    editorId?: undefined;
    filePath: string;
}
export declare type MPVParams = MPVParamsEditor | MPVParamsPath;
export declare class MarkdownPreviewView {
    private loading;
    private resolve;
    readonly renderPromise: Promise<void>;
    readonly element: HTMLElement;
    private preview;
    private emitter;
    private updatePreview?;
    private renderLaTeX;
    private disposables;
    private loaded;
    private editorId?;
    private filePath?;
    private file?;
    private editor?;
    constructor({editorId, filePath}: MPVParams);
    text(): string;
    find(what: string): Element | null;
    findAll(what: string): NodeListOf<Element>;
    serialize(): {
        deserializer: string;
        filePath: string | undefined;
        editorId: number | undefined;
    };
    destroy(): void;
    onDidChangeTitle(callback: () => void): Disposable;
    onDidChangeModified(_callback: any): Disposable;
    onDidChangeMarkdown(callback: () => void): Disposable;
    subscribeToFilePath(filePath: string): void;
    resolveEditor(editorId: number): void;
    editorForId(editorId: number): TextEditor | undefined;
    handleEvents(): void;
    renderMarkdown(): Promise<void>;
    refreshImages(oldsrc: string): Promise<(string | undefined)[]>;
    getMarkdownSource(): Promise<string | undefined>;
    getHTML(callback: (error: Error | null, htmlBody: string) => void): Promise<void>;
    renderMarkdownText(text: string): Promise<void>;
    getTitle(): string;
    getIconName(): string;
    getURI(): string;
    getPath(): string | undefined;
    getGrammar(): Grammar | undefined;
    getDocumentStyleSheets(): StyleSheetList;
    getTextEditorStyles(): string[];
    getMarkdownPreviewCSS(): string;
    showError(result: Error): void;
    showLoading(): void;
    copyToClipboard(): boolean;
    saveAs(): Promise<void>;
    isEqual(other: null | [Node]): boolean;
    bubbleToContainerElement(element: HTMLElement): HTMLElement;
    bubbleToContainerToken(pathToToken: Array<{
        tag: string;
        index: number;
    }>): {
        tag: string;
        index: number;
    }[];
    encodeTag(element: HTMLElement): string;
    decodeTag(token: Token): string | null;
    getPathToElement(element: HTMLElement): Array<{
        tag: string;
        index: number;
    }>;
    syncSource(text: string, element: HTMLElement): number | null;
    getPathToToken(tokens: Token[], line: number): {
        tag: string;
        index: number;
    }[];
    syncPreview(text: string, line: number): HTMLElement | undefined;
}
