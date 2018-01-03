export declare class UpdatePreview {
    private domFragment?;
    private tree;
    constructor(dom: Element);
    update(domFragment: Element, renderLaTeX: boolean): {
        possibleReplace?: {
            cur?: Node | undefined;
            prev?: Element | undefined;
        } | undefined;
        inserted: Node[];
        last?: Node | undefined;
    } | undefined;
    private updateOrderedListsStart(fragment);
}
