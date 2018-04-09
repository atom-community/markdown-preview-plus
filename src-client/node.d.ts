declare namespace NodeJS {
  interface Global {
    require: NodeRequire
  }
}

declare interface NodeRequire {
  isParcelRequire?: boolean
}
