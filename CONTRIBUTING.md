This project is developed in TypeScript. TypeScript isn't directly
supported by Atom, so it requires transpilation into JavaScript. Atom
packages are just git tags, so transpiled sources have to be (eventually)
included into version control.

Consequently, `dist/main.js` and `client/main.js` are transpiled and minified. Don't try to edit those directly.

Also see the [Atom contributing
guide](https://github.com/atom/atom/blob/master/CONTRIBUTING.md)

## Hacking on MPP

Is rather simple. Here are 10 steps to get you running:

1.  Fork the repo
2.  Clone your fork
3.  Run `npm install --only=dev` in addition to `apm install` in the
    root of the working copy. Optionally `apm link --dev` if you want to test
    your changes in Atom. For testing, run Atom in dev-mode (start with `atom --dev` or run `application:open-dev` from command palette). Feel free to use the same Atom window for testing and hacking.
4.  Hack on it using your favorite TypeScript package. There are a
    couple packages in Atom to select from:
    -   <https://atom.io/packages/atom-typescript>
    -   <https://atom.io/packages/ide-typescript>
5.  Prettify the code by running `npm run prettier`
6.  Run static checks with `npm test` (this will run typecheck and
    linter, and check if formatting is OK)
7.  Run dynamic test-suite with `apm test`
8.  Commit your changes. Repeat steps 4-8 until satisfied.
9.  Transpile to JavaScript & bundle by running `npm run build` and commit
    transpiled source in `dist/` and `client/`.
10. Create a pull request.

**Note**: feel free to create pull requests at any stage of the process.
Earlier is usually better. For one, creating PRs early is a good way of
letting people know you're working on something, which helps avoid
effort duplication. Also it will allow maintainers to chime in early and
help you avoid pitfalls and common mistakes.
