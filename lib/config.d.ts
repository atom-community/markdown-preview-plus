export declare const config: {
    breakOnSingleNewline: {
        type: string;
        default: boolean;
        order: number;
    };
    liveUpdate: {
        type: string;
        default: boolean;
        order: number;
    };
    openPreviewInSplitPane: {
        type: string;
        default: boolean;
        order: number;
    };
    previewSplitPaneDir: {
        title: string;
        type: string;
        default: string;
        enum: string[];
        order: number;
    };
    grammars: {
        type: string;
        default: string[];
        order: number;
    };
    enableLatexRenderingByDefault: {
        title: string;
        type: string;
        default: boolean;
        order: number;
    };
    useLazyHeaders: {
        title: string;
        description: string;
        type: string;
        default: boolean;
        order: number;
    };
    useGitHubStyle: {
        title: string;
        type: string;
        default: boolean;
        order: number;
    };
    enablePandoc: {
        type: string;
        default: boolean;
        title: string;
        order: number;
    };
    useNativePandocCodeStyles: {
        type: string;
        default: boolean;
        description: string;
        order: number;
    };
    pandocPath: {
        type: string;
        default: string;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocFilters: {
        type: string;
        default: never[];
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocArguments: {
        type: string;
        default: never[];
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocMarkdownFlavor: {
        type: string;
        default: string;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocBibliography: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocRemoveReferences: {
        type: string;
        default: boolean;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocBIBFile: {
        type: string;
        default: string;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocBIBFileFallback: {
        type: string;
        default: string;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocCSLFile: {
        type: string;
        default: string;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
    pandocCSLFileFallback: {
        type: string;
        default: string;
        title: string;
        description: string;
        dependencies: string[];
        order: number;
    };
};
