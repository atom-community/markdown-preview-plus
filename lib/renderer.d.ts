import { Grammar } from 'atom';
export declare function toDOMFragment<T>(text: string, filePath: string | undefined, _grammar: any, renderLaTeX: boolean, callback: (error: Error | null, domFragment?: Node) => T): Promise<T>;
export declare function toHTML(text: string | null, filePath: string | undefined, grammar: Grammar | undefined, renderLaTeX: boolean, copyHTMLFlag: boolean, callback: (error: Error | null, html: string) => void): Promise<void>;
export declare function convertCodeBlocksToAtomEditors(domFragment: Element, defaultLanguage?: string): Element;
