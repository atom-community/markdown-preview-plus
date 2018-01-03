/// <reference types="node" />
import CP = require('child_process');
export declare function findFileRecursive(filePath: string, fileName: string): string | false;
export interface Args {
    from: string;
    to: 'html';
    mathjax?: string;
    filter: string[];
    bibliography?: string;
    csl?: string;
}
export declare function setPandocOptions(filePath: string | undefined, renderMath: boolean): {
    args: Args;
    opts: CP.ExecFileOptions;
};
export declare function renderPandoc<T>(text: string, filePath: string | undefined, renderMath: boolean, cb: (err: Error | null, result: string) => T): Promise<T>;
export declare function getArguments(iargs: Args): string[];
