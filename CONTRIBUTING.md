This project is developed in TypeScript. TypeScript isn't directly
supported by Atom, so it requires transpilation into JavaScript. Atom
packages are just git tags, so transpiled sources have to be included
into version control.

Consequently, **please avoid editing files in `lib/` directly**, since
those are generated and your changes will be gone after the next build.

Also see the [Atom contributing
guide](https://github.com/atom/atom/blob/master/CONTRIBUTING.md)

## Hacking on MPP

Is rather simple. Here are 10 steps to get you running:

1.  Fork the repo
2.  Clone your fork
3.  Run `npm install --only=dev` in addition to `apm install` in the
    root of the working copy. Optionally `apm link` if you want to test
    your changes in Atom.
4.  Hack on it using your favorite TypeScript package. There are a
    couple packages in Atom to select from:
    -   <https://atom.io/packages/atom-typescript>
    -   <https://atom.io/packages/ide-typescript>
5.  Prettify the code by running `npm run prettier`
6.  Transpile to JavaScript by running `npm run build`
7.  Run static checks with `npm run test` (this will run typecheck and
    linter, and check if formatting is OK)
8.  Run dynamic test-suite with `apm test`
9.  Commit your changes. Don't forget to commit transpiled source in
    `lib/`. Repeat steps 4-9 until satisfied.
10. Create a pull request.

**Note**: feel free to create pull requests at any stage of the process.
Earlier is usually better. For one, creating PRs early is a good way of
letting people know you're working on something, which helps avoid
effort duplication. Also it will allow maintainers to chime in early and
help you avoid pitfalls and common mistakes.
