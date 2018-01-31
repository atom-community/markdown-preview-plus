declare module 'mathjax-node' {
  export function start(): void
  export function config(config: object): void
  export function typeset(config: object): Promise<Result>
  export function typeset(
    config: object,
    callback: (result: Result, options: object) => void,
  ): void
  export interface Result {
    svg?: string
  }
}
