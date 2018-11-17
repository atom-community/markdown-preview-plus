declare module 'season' {
  export function readFileSync<T = object>(
    path: string,
    callback?: (error?: Error, object?: object) => T,
  ): T | null
  export function resolve(path: string): string | undefined | null
  export function isObjectPath(path: string): boolean
}
