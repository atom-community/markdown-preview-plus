export declare class WrappedDomTree {
    readonly shownTree?: WrappedDomTree;
    readonly dom: Element;
    private textData;
    private children;
    private size;
    private diffHash;
    private className;
    private tagName;
    private rep?;
    private isText;
    private hash;
    private clone;
    constructor(dom: Element, clone: true);
    constructor(dom: Element, clone: false, rep?: WrappedDomTree);
    diffTo(otherTree: WrappedDomTree): {
        possibleReplace?: {
            cur?: Node;
            prev?: Element;
        };
        inserted: Node[];
        last?: Node;
    };
    insert(i: number, tree: WrappedDomTree, rep?: WrappedDomTree): Node;
    remove(i: number): Node;
    private diff(otherTree, tmax?);
    equalTo(otherTree: WrappedDomTree): boolean;
    cannotReplaceWith(otherTree: WrappedDomTree): boolean;
    getContent(): string;
    removeSelf(): void;
}
