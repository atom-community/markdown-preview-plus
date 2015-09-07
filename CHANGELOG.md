# Change Log

## [v2.0.1](https://github.com/Galadirith/markdown-preview-plus/tree/v2.0.1) (2015-09-03)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v2.0.0...v2.0.1)

**Fixed bugs:**

- Version 2.0.0: headings no longer work [\#88](https://github.com/Galadirith/markdown-preview-plus/issues/88)

**Closed issues:**

- Fails on linux mint \(I know why\) [\#91](https://github.com/Galadirith/markdown-preview-plus/issues/91)
- Updating to “markdown-preview-plus@2.0.0” failed [\#90](https://github.com/Galadirith/markdown-preview-plus/issues/90)

**Merged pull requests:**

- Added support for lazy headers \(missing space after \#\) [\#96](https://github.com/Galadirith/markdown-preview-plus/pull/96) ([leipert](https://github.com/leipert))
- Fix math regressions [\#95](https://github.com/Galadirith/markdown-preview-plus/pull/95) ([leipert](https://github.com/leipert))
- Correct instantiation conditions for markdown-it [\#92](https://github.com/Galadirith/markdown-preview-plus/pull/92) ([Galadirith](https://github.com/Galadirith))

## [v2.0.0](https://github.com/Galadirith/markdown-preview-plus/tree/v2.0.0) (2015-09-01)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.7.0...v2.0.0)

**Implemented enhancements:**

- Add CHANGELOG.md [\#79](https://github.com/Galadirith/markdown-preview-plus/issues/79)
- Shortcut to activate the preview of currently focused editor [\#74](https://github.com/Galadirith/markdown-preview-plus/issues/74)
- create pathwatcher version without runas [\#67](https://github.com/Galadirith/markdown-preview-plus/issues/67)
- Migrate from marked to markdown-it [\#47](https://github.com/Galadirith/markdown-preview-plus/issues/47)
- Implement Specs from Stress Test Document [\#18](https://github.com/Galadirith/markdown-preview-plus/issues/18)
- Allow defining new Tex Macros globally [\#11](https://github.com/Galadirith/markdown-preview-plus/issues/11)
- Inline Math Rendering with "\\(...\\)" [\#7](https://github.com/Galadirith/markdown-preview-plus/issues/7)

**Fixed bugs:**

- context menu option doesn't show in tree view on 1.7 [\#76](https://github.com/Galadirith/markdown-preview-plus/issues/76)
- See why wercker doesn't werck [\#65](https://github.com/Galadirith/markdown-preview-plus/issues/65)
- $$ in inline code interferes with display math separator [\#20](https://github.com/Galadirith/markdown-preview-plus/issues/20)
- $N\times N$ won't render properly [\#17](https://github.com/Galadirith/markdown-preview-plus/issues/17)

**Closed issues:**

- Can't preview if pandoc is activated [\#82](https://github.com/Galadirith/markdown-preview-plus/issues/82)
- Lists don't render when Pandoc Parser is enabled [\#71](https://github.com/Galadirith/markdown-preview-plus/issues/71)
- Make sure our macro extension works with pandoc [\#54](https://github.com/Galadirith/markdown-preview-plus/issues/54)
- Uncaught Error: Cannot find module 'pathwatcher' [\#45](https://github.com/Galadirith/markdown-preview-plus/issues/45)
- installation on atom failed. OS: win8 64bit [\#43](https://github.com/Galadirith/markdown-preview-plus/issues/43)

**Merged pull requests:**

- Activate non-active open preview and don't destory [\#83](https://github.com/Galadirith/markdown-preview-plus/pull/83) ([Galadirith](https://github.com/Galadirith))
- Sync source and preview on demand [\#80](https://github.com/Galadirith/markdown-preview-plus/pull/80) ([Galadirith](https://github.com/Galadirith))
- Improved CI testing \(appveyor builds and travis.ci false failures\) [\#78](https://github.com/Galadirith/markdown-preview-plus/pull/78) ([leipert](https://github.com/leipert))
- Prepare add macros merge [\#75](https://github.com/Galadirith/markdown-preview-plus/pull/75) ([Galadirith](https://github.com/Galadirith))
- Migration to markdown-it and markdown-it-math [\#70](https://github.com/Galadirith/markdown-preview-plus/pull/70) ([leipert](https://github.com/leipert))
- Migrated to pathwatcher-without-runas [\#69](https://github.com/Galadirith/markdown-preview-plus/pull/69) ([leipert](https://github.com/leipert))
- \[feat\] deactivated failing tests on wercker \(and only on wercker\) [\#68](https://github.com/Galadirith/markdown-preview-plus/pull/68) ([leipert](https://github.com/leipert))

## [v1.7.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.7.0) (2015-08-09)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.6.0...v1.7.0)

**Implemented enhancements:**

- Create continuous integration accounts.  [\#61](https://github.com/Galadirith/markdown-preview-plus/issues/61)
- Regression on image caching [\#60](https://github.com/Galadirith/markdown-preview-plus/issues/60)
- Support determinate citation file choosing [\#50](https://github.com/Galadirith/markdown-preview-plus/issues/50)
- previewed images are cached and only updated if atom is restarted [\#49](https://github.com/Galadirith/markdown-preview-plus/issues/49)
- Export to PDF [\#34](https://github.com/Galadirith/markdown-preview-plus/issues/34)

**Fixed bugs:**

- pandoc --filter option not recognized [\#48](https://github.com/Galadirith/markdown-preview-plus/issues/48)
- unable to save as html [\#38](https://github.com/Galadirith/markdown-preview-plus/issues/38)
- Uncaught TypeError: undefined is not a function [\#37](https://github.com/Galadirith/markdown-preview-plus/issues/37)
- Uncaught Error: error [\#35](https://github.com/Galadirith/markdown-preview-plus/issues/35)
- Uncaught Error: Module version mismatch. Expected 43, got 41. [\#32](https://github.com/Galadirith/markdown-preview-plus/issues/32)
- Square roots in fractions in display math don't render the overline [\#19](https://github.com/Galadirith/markdown-preview-plus/issues/19)

**Closed issues:**

- Displaying LaTeX Tables in the Preview [\#46](https://github.com/Galadirith/markdown-preview-plus/issues/46)
- Last table row does not respect alignment when rendering [\#42](https://github.com/Galadirith/markdown-preview-plus/issues/42)
- install failed on Atom 0.189.0 ,windows 7 [\#31](https://github.com/Galadirith/markdown-preview-plus/issues/31)
- Install failed on ubuntu 14.04 gnome [\#26](https://github.com/Galadirith/markdown-preview-plus/issues/26)
- Cannot make it works in windows 8.1 x64 [\#25](https://github.com/Galadirith/markdown-preview-plus/issues/25)

**Merged pull requests:**

- Fix bib support. [\#64](https://github.com/Galadirith/markdown-preview-plus/pull/64) ([leipert](https://github.com/leipert))
- Make image version query a timestamp fixes \#60 [\#63](https://github.com/Galadirith/markdown-preview-plus/pull/63) ([Galadirith](https://github.com/Galadirith))
- \[wip\] Feature/ci [\#59](https://github.com/Galadirith/markdown-preview-plus/pull/59) ([leipert](https://github.com/leipert))
- Preview most recent version of images [\#53](https://github.com/Galadirith/markdown-preview-plus/pull/53) ([Galadirith](https://github.com/Galadirith))
- Fixed strikethrough layout  [\#28](https://github.com/Galadirith/markdown-preview-plus/pull/28) ([leipert](https://github.com/leipert))

## [v1.6.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.6.0) (2015-07-09)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.5.0...v1.6.0)

**Closed issues:**

- Is there a easy to override font-family using atom custom stylesheet [\#44](https://github.com/Galadirith/markdown-preview-plus/issues/44)
- failed install [\#40](https://github.com/Galadirith/markdown-preview-plus/issues/40)
- Installing v1.4.0 on Mac OS X gives error [\#39](https://github.com/Galadirith/markdown-preview-plus/issues/39)

**Merged pull requests:**

- Implemented usage of pandoc renderer. [\#41](https://github.com/Galadirith/markdown-preview-plus/pull/41) ([leipert](https://github.com/leipert))

## [v1.5.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.5.0) (2015-05-29)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.4.0...v1.5.0)

**Closed issues:**

- Uncaught Error: Module did not self-register. [\#33](https://github.com/Galadirith/markdown-preview-plus/issues/33)
- Preview won't open on MBP with Atom 0.188 [\#30](https://github.com/Galadirith/markdown-preview-plus/issues/30)
- MPP wouldn't install in Windows 10 [\#29](https://github.com/Galadirith/markdown-preview-plus/issues/29)
- just a ping from the MathJax team [\#21](https://github.com/Galadirith/markdown-preview-plus/issues/21)
- Can't install plugin [\#10](https://github.com/Galadirith/markdown-preview-plus/issues/10)
- The module won't render latex document [\#5](https://github.com/Galadirith/markdown-preview-plus/issues/5)

## [v1.4.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.4.0) (2015-05-06)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.3.0...v1.4.0)

**Fixed bugs:**

- Uncaught Error: Module version mismatch. Expected 41, got 17. [\#22](https://github.com/Galadirith/markdown-preview-plus/issues/22)

## [v1.3.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.3.0) (2015-02-25)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.2.0...v1.3.0)

**Closed issues:**

- Installation failed via apm on OS Yosemite, and both via apm and GUI on OS Lion [\#23](https://github.com/Galadirith/markdown-preview-plus/issues/23)

## [v1.2.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.2.0) (2015-02-04)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.1.0...v1.2.0)

**Closed issues:**

- Cannot install, seems .NET issue [\#16](https://github.com/Galadirith/markdown-preview-plus/issues/16)
- Use the 'atom-text-editor' instead of the 'editor-colors' class [\#15](https://github.com/Galadirith/markdown-preview-plus/issues/15)

## [v1.1.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.1.0) (2015-01-26)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.0.1...v1.1.0)

**Implemented enhancements:**

- Equation Numbers? [\#8](https://github.com/Galadirith/markdown-preview-plus/issues/8)

**Fixed bugs:**

- latex rendering not working [\#12](https://github.com/Galadirith/markdown-preview-plus/issues/12)

**Closed issues:**

- Enter/return key breaks upon opening the preview pane [\#13](https://github.com/Galadirith/markdown-preview-plus/issues/13)

## [v1.0.1](https://github.com/Galadirith/markdown-preview-plus/tree/v1.0.1) (2015-01-10)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v1.0.0...v1.0.1)

## [v1.0.0](https://github.com/Galadirith/markdown-preview-plus/tree/v1.0.0) (2015-01-09)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v0.3.0...v1.0.0)

**Implemented enhancements:**

- An option to enable LaTeX rendering by default [\#4](https://github.com/Galadirith/markdown-preview-plus/issues/4)

**Fixed bugs:**

- The character sequence \$ renders as $ in code blocks and inline code [\#3](https://github.com/Galadirith/markdown-preview-plus/issues/3)
- LaTeX with $$ math $$ [\#2](https://github.com/Galadirith/markdown-preview-plus/issues/2)

**Closed issues:**

- Not installing correctly / working in spite of best efforts [\#6](https://github.com/Galadirith/markdown-preview-plus/issues/6)

## [v0.3.0](https://github.com/Galadirith/markdown-preview-plus/tree/v0.3.0) (2014-12-08)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v0.2.0...v0.3.0)

## [v0.2.0](https://github.com/Galadirith/markdown-preview-plus/tree/v0.2.0) (2014-11-24)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v0.1.2...v0.2.0)

## [v0.1.2](https://github.com/Galadirith/markdown-preview-plus/tree/v0.1.2) (2014-11-22)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v0.1.1...v0.1.2)

## [v0.1.1](https://github.com/Galadirith/markdown-preview-plus/tree/v0.1.1) (2014-11-22)
[Full Changelog](https://github.com/Galadirith/markdown-preview-plus/compare/v0.1.0...v0.1.1)

## [v0.1.0](https://github.com/Galadirith/markdown-preview-plus/tree/v0.1.0) (2014-11-21)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*