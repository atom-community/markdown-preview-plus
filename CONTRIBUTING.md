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

## Hacking on the worker

When hacking on markdown-it worker, located in `src-worker`, the workflow is a little bit different, since only the actual bundle is loaded in runtime, not the source code. The package will however hot-reload the bundle if Atom is in dev-mode, so when hacking on the worker, you'll want to start a watch process with `npm run watch-worker` from the project directory (run it from the terminal for instance). So, essentially, an extra step is added to the list above after (3):

3. a) Start watcher by running `npm run watch-worker` from the project directory. This will automatically recompile the worker bundle when the source changes.

The good news is, you don't need to restart anything to see the changes, see below.

## Reload behaviour

Reload behaviour is a bit different between different components:

-   `src` is the main package code. This is only reloaded on Atom restart/reload. You can use `window:reload` Atom command to reload Atom.
-   `src-client` is the code for "client" script that runs inside the preview. This is loaded separately for each open preview window, and hence reloaded when preview is closed and reopened. Use `markdown-preview-plus:toggle` command to close/open the current preview.
-   `src-worker` is the markdown-it webworker code. This one is reloaded automatically when Atom is in dev-mode, so you'll see changes to the bundle immediately. However, changes to the sources are not bundled automatically, you need to start a dedicated process for that, see above.
