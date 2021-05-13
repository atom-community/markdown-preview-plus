import { Disposable } from 'atom'
export interface LanguageMode {
  readonly fullyTokenized?: boolean
  readonly tree?: boolean
  onDidTokenize(cb: () => void): Disposable
  buildHighlightIterator(): HighlightIterator
  classNameForScopeId(id: ScopeId): string
  startTokenizing?(): void
}
export interface HighlightIterator {
  seek(pos: { row: number; column: number }): void
  getPosition(): { row: number; column: number }
  getOpenScopeIds?(): ScopeId[]
  getCloseScopeIds?(): ScopeId[]
  moveToSuccessor(): void
}
export interface ScopeId {}
