/// <reference types="markdown-it" />
import * as mdIt from 'markdown-it';
export interface RenderingOptions {
    display?: 'block';
}
export interface PluginOptions {
    inlineDelim?: [[string, string]];
    blockDelim?: [[string, string]];
    inlineRenderer?: (data: string) => string;
    blockRenderer?: (data: string) => string;
    renderingOptions?: RenderingOptions;
}
export declare function math_plugin(md: mdIt.MarkdownIt, options?: PluginOptions): void;
