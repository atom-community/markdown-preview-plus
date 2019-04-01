declare module 'morphdom' {
  function morph(
    oldTree: Node,
    newTree: Node | string,
    options?: {
      /// If true then only the children of the fromNode and toNode nodes will be
      /// morphed (the containing element will be skipped). Defaults to false.
      childrenOnly?: boolean
      /// Called to get the Node's unique identifier. This is used by morphdom to rearrange elements
      /// rather than creating and destroying an element that already exists. This defaults to using
      /// the Node's id attribute.
      getNodeKey?(node: Node): string
      /// Called before a Node in the to tree is added to the from tree. If this function returns
      /// false then the node will not be added. Should return the node to be added.
      onBeforeNodeAdded?(node: Node): Node | false
      /// Called after a Node in the to tree has been added to the from tree.
      onNodeAdded?(node: Node): void
      /// Called before a HTMLElement in the from tree is updated. If this function
      /// returns false then the element will not be updated.
      onBeforeElUpdated?(fromEl: HTMLElement, toEl: HTMLElement): boolean
      /// Called after a HTMLElement in the from tree has been updated.
      onElUpdated?(el: HTMLElement): void
      /// Called before a Node in the from tree is discarded. If this function returns
      /// false then the node will not be discarded.
      onBeforeNodeDiscarded?(node: Node): boolean
      /// Called after a Node in the from tree has been discarded.
      onNodeDiscarded?(node: Node): void
      /// Called before the children of a HTMLElement in the from tree are updated. If this
      // function returns false then the child nodes will not be updated.
      onBeforeElChildrenUpdated?(
        fromEl: HTMLElement,
        toEl: HTMLElement,
      ): boolean
    },
  ): void
  export = morph
}
