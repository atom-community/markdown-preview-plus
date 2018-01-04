declare module 'pathwatcher' {
    function watch(filename: string, listener?: (event: TEvent, path: string) => void): PathWatcher;
    type TEvent = 'rename' | 'delete' | 'change';
}
export declare function removeFile(file: string): void;
export declare function getVersion(image: string, file?: string): Promise<number | false>;
export {};
