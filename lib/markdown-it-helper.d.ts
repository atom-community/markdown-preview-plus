/// <reference types="markdown-it" />
import markdownItModule = require('markdown-it');
export declare function render(text: string, rL: boolean): string;
export declare function decode(url: string): string;
export declare function getTokens(text: string, rL: boolean): markdownItModule.Token[];
