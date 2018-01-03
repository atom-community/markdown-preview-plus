export declare class TwoDimArray<T> {
    readonly row: number;
    readonly col: number;
    private readonly _arr;
    constructor(row: number, col: number);
    getInd(row: number, col: number): number;
    get2DInd(ind: number): {
        r: number;
        c: number;
    };
    get(row: number, col: number): T | undefined;
    set(row: number, col: number, val: T): void;
    rawGet(ind: number): T | undefined;
}
