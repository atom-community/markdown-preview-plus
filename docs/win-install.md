# Windows installation problems

Before you post a issue that this package cannot be installed, please execute `apm --version`, it should return something like:

``` bash
apm --version
apm  1.0.1
npm  2.5.1
node 0.10.35
python 2.7.9
git 1.9.5.msysgit.0
visual studio 2012
```

Please make sure that you are using `python 2.*` and `visual studio 2012` or `visual studio 2013`, all python versions >= 3 will fail, also visual studio versions 2008, 2010 and 2015.

The `node-gyp` [installation section][install-gyp] contains links and instructions for installation of python and Visual Studio.

If you have multiple versions of python installed you can set the path to python 2.7 with:
`
npm config set python "C:\path\to\python2.7"
`

If you have installed visual studio 2012 or 2013, set the following variable accordingly.

```bash
set GYP_MSVS_VERSION=2012
# or
set GYP_MSVS_VERSION=2013
```

The ourput of `apm --version` should now look like the the one at the top of this page. Now try running `apm install markdown-preview-plus` again.

If something still fails, please open an [issue][issue] and paste the output of both:

*   `apm --version`
*   `apm install markdown-preview-plus`

[issue]: https://github.com/Galadirith/markdown-preview-plus/issues
[install-gyp]: https://github.com/nodejs/node-gyp#installation
