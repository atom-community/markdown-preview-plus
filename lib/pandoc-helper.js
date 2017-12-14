"use strict";
const _ = require("lodash");
const CP = require("child_process");
const fs = require("fs");
const path = require("path");
const atomConfig = () => atom.config.get('markdown-preview-plus');
const getMathJaxPath = (function () {
    let cached = null;
    return function () {
        if (cached != null) {
            return cached;
        }
        try {
            return (cached = require.resolve('MathJax'));
        }
        catch (e) {
            return '';
        }
    };
})();
function findFileRecursive(filePath, fileName) {
    const bibFile = path.join(filePath, '../', fileName);
    if (fs.existsSync(bibFile)) {
        return bibFile;
    }
    else {
        const newPath = path.join(bibFile, '..');
        if (newPath !== filePath && !_.includes(atom.project.getPaths(), newPath)) {
            return findFileRecursive(newPath, fileName);
        }
        else {
            return false;
        }
    }
}
function setPandocOptions(filePath, renderMath) {
    const opts = { maxBuffer: Infinity };
    if (filePath != null) {
        opts.cwd = path.dirname(filePath);
    }
    const mathjaxPath = getMathJaxPath();
    const args = {
        from: atomConfig().pandocMarkdownFlavor,
        to: 'html',
        mathjax: renderMath ? mathjaxPath : undefined,
        filter: atomConfig().pandocFilters,
    };
    if (atomConfig().pandocBibliography) {
        args.filter.push('pandoc-citeproc');
        let bibFile = filePath && findFileRecursive(filePath, atomConfig().pandocBIBFile);
        if (!bibFile) {
            bibFile = atomConfig().pandocBIBFileFallback;
        }
        args.bibliography = bibFile ? bibFile : undefined;
        let cslFile = filePath && findFileRecursive(filePath, atomConfig().pandocCSLFile);
        if (!cslFile) {
            cslFile = atomConfig().pandocCSLFileFallback;
        }
        args.csl = cslFile ? cslFile : undefined;
    }
    return { args, opts };
}
function handleError(error, html, renderMath) {
    html = `<h1>Pandoc Error:</h1><pre>${error}</pre><hr>${html}`;
    return handleSuccess(html, renderMath);
}
function handleMath(html) {
    const doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('.math').forEach(function (elem) {
        let math = elem.innerText;
        const mode = math.indexOf('\\[') > -1 ? '; mode=display' : '';
        math = math.replace(/\\[[()\]]/g, '');
        return (elem.outerHTML =
            '<span class="math">' +
                `<script type='math/tex${mode}'>${math}</script>` +
                '</span>');
    });
    return doc.innerHTML;
}
function removeReferences(html) {
    const doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('.references').forEach((elem) => elem.remove());
    return doc.innerHTML;
}
function handleSuccess(html, renderMath) {
    if (renderMath) {
        html = handleMath(html);
    }
    if (atomConfig().pandocRemoveReferences) {
        html = removeReferences(html);
    }
    return html;
}
function handleResponse(error, html, renderMath) {
    if (error) {
        return handleError(error, html, renderMath);
    }
    else {
        return handleSuccess(html, renderMath);
    }
}
function renderPandoc(text, filePath, renderMath, cb) {
    const { args, opts } = setPandocOptions(filePath, renderMath);
    const cp = CP.execFile(atomConfig().pandocPath, getArguments(args), opts, function (error, stdout, stderr) {
        if (error) {
            atom.notifications.addError(error.toString(), {
                stack: error.stack,
                dismissable: true,
            });
        }
        const result = handleResponse(stderr || '', stdout || '', renderMath);
        return cb(null, result);
    });
    cp.stdin.write(text);
    cp.stdin.end();
}
function getArguments(iargs) {
    const args = _.reduce(iargs, function (res, val, key) {
        if (val && !_.isEmpty(val)) {
            const nval = _.flatten([val]);
            _.forEach(nval, function (v) {
                if (!_.isEmpty(v)) {
                    res.push(`--${key}=${v}`);
                }
            });
        }
        return res;
    }, []);
    const res = [];
    for (const val of [
        ...args,
        ...atom.config.get('markdown-preview-plus.pandocArguments'),
    ]) {
        const newval = val.replace(/^(--[\w\-]+)\s(.+)$/i, '$1=$2');
        if (newval.substr(0, 1) === '-') {
            res.push(newval);
        }
    }
    console.warn(res);
    return res;
}
module.exports = {
    renderPandoc,
    __testing__: {
        findFileRecursive,
        setPandocOptions,
        getArguments,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZG9jLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYW5kb2MtaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFPQSw0QkFBNEI7QUFDNUIsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFFN0IsTUFBTSxVQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUUsQ0FBQTtBQUtsRSxNQUFNLGNBQWMsR0FBRyxDQUFDO0lBQ3RCLElBQUksTUFBTSxHQUFrQixJQUFJLENBQUE7SUFDaEMsTUFBTSxDQUFDO1FBQ0wsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQTtRQUNmLENBQUM7UUFDRCxJQUFJLENBQUM7WUFDSCxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBQzlDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLEVBQUUsQ0FBQTtRQUNYLENBQUM7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUMsRUFBRSxDQUFBO0FBRUosMkJBQTJCLFFBQWdCLEVBQUUsUUFBZ0I7SUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3BELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUE7SUFDaEIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUs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LENBQUMsQ0FBQTtJQUNqQixNQUFNLENBQUMsR0FBRyxDQUFBO0FBQ1osQ0FBQztBQUVELGlCQUFTO0lBQ1AsWUFBWTtJQUNaLFdBQVcsRUFBRTtRQUNYLGlCQUFpQjtRQUNqQixnQkFBZ0I7UUFDaEIsWUFBWTtLQUNiO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBkZWNhZmZlaW5hdGUgc3VnZ2VzdGlvbnM6XG4gKiBEUzEwMTogUmVtb3ZlIHVubmVjZXNzYXJ5IHVzZSBvZiBBcnJheS5mcm9tXG4gKiBEUzEwMjogUmVtb3ZlIHVubmVjZXNzYXJ5IGNvZGUgY3JlYXRlZCBiZWNhdXNlIG9mIGltcGxpY2l0IHJldHVybnNcbiAqIERTMjA3OiBDb25zaWRlciBzaG9ydGVyIHZhcmlhdGlvbnMgb2YgbnVsbCBjaGVja3NcbiAqIEZ1bGwgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL2RlY2FmZmVpbmF0ZS9kZWNhZmZlaW5hdGUvYmxvYi9tYXN0ZXIvZG9jcy9zdWdnZXN0aW9ucy5tZFxuICovXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5pbXBvcnQgQ1AgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbmNvbnN0IGF0b21Db25maWcgPSAoKSA9PiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cycpIVxuXG4vKipcbiAqIFNldHMgbG9jYWwgbWF0aGpheFBhdGggaWYgYXZhaWxhYmxlXG4gKi9cbmNvbnN0IGdldE1hdGhKYXhQYXRoID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgY2FjaGVkOiBzdHJpbmcgfCBudWxsID0gbnVsbFxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGNhY2hlZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gY2FjaGVkXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGNhY2hlZCA9IHJlcXVpcmUucmVzb2x2ZSgnTWF0aEpheCcpKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgfVxufSkoKVxuXG5mdW5jdGlvbiBmaW5kRmlsZVJlY3Vyc2l2ZShmaWxlUGF0aDogc3RyaW5nLCBmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgZmFsc2Uge1xuICBjb25zdCBiaWJGaWxlID0gcGF0aC5qb2luKGZpbGVQYXRoLCAnLi4vJywgZmlsZU5hbWUpXG4gIGlmIChmcy5leGlzdHNTeW5jKGJpYkZpbGUpKSB7XG4gICAgcmV0dXJuIGJpYkZpbGVcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBuZXdQYXRoID0gcGF0aC5qb2luKGJpYkZpbGUsICcuLicpXG4gICAgaWYgKG5ld1BhdGggIT09IGZpbGVQYXRoICYmICFfLmluY2x1ZGVzKGF0b20ucHJvamVjdC5nZXRQYXRocygpLCBuZXdQYXRoKSkge1xuICAgICAgcmV0dXJuIGZpbmRGaWxlUmVjdXJzaXZlKG5ld1BhdGgsIGZpbGVOYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuaW50ZXJmYWNlIEFyZ3Mge1xuICBmcm9tOiBzdHJpbmdcbiAgdG86ICdodG1sJ1xuICBtYXRoamF4Pzogc3RyaW5nXG4gIGZpbHRlcjogc3RyaW5nW11cbiAgYmlibGlvZ3JhcGh5Pzogc3RyaW5nXG4gIGNzbD86IHN0cmluZ1xufVxuXG5mdW5jdGlvbiBzZXRQYW5kb2NPcHRpb25zKGZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsIHJlbmRlck1hdGg6IGJvb2xlYW4pIHtcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tLWNvbW11bml0eS9tYXJrZG93bi1wcmV2aWV3LXBsdXMvaXNzdWVzLzMxNlxuICBjb25zdCBvcHRzOiBDUC5FeGVjRmlsZU9wdGlvbnMgPSB7IG1heEJ1ZmZlcjogSW5maW5pdHkgfVxuICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgIG9wdHMuY3dkID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICB9XG4gIGNvbnN0IG1hdGhqYXhQYXRoID0gZ2V0TWF0aEpheFBhdGgoKVxuICBjb25zdCBhcmdzOiBBcmdzID0ge1xuICAgIGZyb206IGF0b21Db25maWcoKS5wYW5kb2NNYXJrZG93bkZsYXZvcixcbiAgICB0bzogJ2h0bWwnLFxuICAgIG1hdGhqYXg6IHJlbmRlck1hdGggPyBtYXRoamF4UGF0aCA6IHVuZGVmaW5lZCxcbiAgICBmaWx0ZXI6IGF0b21Db25maWcoKS5wYW5kb2NGaWx0ZXJzLFxuICB9XG4gIGlmIChhdG9tQ29uZmlnKCkucGFuZG9jQmlibGlvZ3JhcGh5KSB7XG4gICAgYXJncy5maWx0ZXIucHVzaCgncGFuZG9jLWNpdGVwcm9jJylcbiAgICBsZXQgYmliRmlsZSA9XG4gICAgICBmaWxlUGF0aCAmJiBmaW5kRmlsZVJlY3Vyc2l2ZShmaWxlUGF0aCwgYXRvbUNvbmZpZygpLnBhbmRvY0JJQkZpbGUpXG4gICAgaWYgKCFiaWJGaWxlKSB7XG4gICAgICBiaWJGaWxlID0gYXRvbUNvbmZpZygpLnBhbmRvY0JJQkZpbGVGYWxsYmFja1xuICAgIH1cbiAgICBhcmdzLmJpYmxpb2dyYXBoeSA9IGJpYkZpbGUgPyBiaWJGaWxlIDogdW5kZWZpbmVkXG4gICAgbGV0IGNzbEZpbGUgPVxuICAgICAgZmlsZVBhdGggJiYgZmluZEZpbGVSZWN1cnNpdmUoZmlsZVBhdGgsIGF0b21Db25maWcoKS5wYW5kb2NDU0xGaWxlKVxuICAgIGlmICghY3NsRmlsZSkge1xuICAgICAgY3NsRmlsZSA9IGF0b21Db25maWcoKS5wYW5kb2NDU0xGaWxlRmFsbGJhY2tcbiAgICB9XG4gICAgYXJncy5jc2wgPSBjc2xGaWxlID8gY3NsRmlsZSA6IHVuZGVmaW5lZFxuICB9XG4gIHJldHVybiB7IGFyZ3MsIG9wdHMgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBlcnJvciByZXNwb25zZSBmcm9tIFBhbmRvY1xuICogQHBhcmFtIHtlcnJvcn0gUmV0dXJuZWQgZXJyb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBSZXR1cm5lZCBIVE1MXG4gKiBAcmV0dXJuIHthcnJheX0gd2l0aCBBcmd1bWVudHMgZm9yIGNhbGxiYWNrRnVuY3Rpb24gKGVycm9yIHNldCB0byBudWxsKVxuICovXG5mdW5jdGlvbiBoYW5kbGVFcnJvcihlcnJvcjogc3RyaW5nLCBodG1sOiBzdHJpbmcsIHJlbmRlck1hdGg6IGJvb2xlYW4pIHtcbiAgaHRtbCA9IGA8aDE+UGFuZG9jIEVycm9yOjwvaDE+PHByZT4ke2Vycm9yfTwvcHJlPjxocj4ke2h0bWx9YFxuICByZXR1cm4gaGFuZGxlU3VjY2VzcyhodG1sLCByZW5kZXJNYXRoKVxufVxuXG4vKipcbiAqIEFkanVzdHMgYWxsIG1hdGggZW52aXJvbm1lbnRzIGluIEhUTUxcbiAqIEBwYXJhbSB7c3RyaW5nfSBIVE1MIHRvIGJlIGFkanVzdGVkXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEhUTUwgd2l0aCBhZGp1c3RlZCBtYXRoIGVudmlyb25tZW50c1xuICovXG5mdW5jdGlvbiBoYW5kbGVNYXRoKGh0bWw6IHN0cmluZykge1xuICBjb25zdCBkb2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkb2MuaW5uZXJIVE1MID0gaHRtbFxuICBkb2MucXVlcnlTZWxlY3RvckFsbCgnLm1hdGgnKS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW0pIHtcbiAgICBsZXQgbWF0aCA9IChlbGVtIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHRcbiAgICAvLyBTZXQgbW9kZSBpZiBpdCBpcyBibG9jayBtYXRoXG4gICAgY29uc3QgbW9kZSA9IG1hdGguaW5kZXhPZignXFxcXFsnKSA+IC0xID8gJzsgbW9kZT1kaXNwbGF5JyA6ICcnXG5cbiAgICAvLyBSZW1vdmUgc291cnJvdW5kaW5nIFxcWyBcXF0gYW5kIFxcKCBcXClcbiAgICBtYXRoID0gbWF0aC5yZXBsYWNlKC9cXFxcW1soKVxcXV0vZywgJycpXG4gICAgcmV0dXJuIChlbGVtLm91dGVySFRNTCA9XG4gICAgICAnPHNwYW4gY2xhc3M9XCJtYXRoXCI+JyArXG4gICAgICBgPHNjcmlwdCB0eXBlPSdtYXRoL3RleCR7bW9kZX0nPiR7bWF0aH08L3NjcmlwdD5gICtcbiAgICAgICc8L3NwYW4+JylcbiAgfSlcblxuICByZXR1cm4gZG9jLmlubmVySFRNTFxufVxuXG5mdW5jdGlvbiByZW1vdmVSZWZlcmVuY2VzKGh0bWw6IHN0cmluZykge1xuICBjb25zdCBkb2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkb2MuaW5uZXJIVE1MID0gaHRtbFxuICBkb2MucXVlcnlTZWxlY3RvckFsbCgnLnJlZmVyZW5jZXMnKS5mb3JFYWNoKChlbGVtKSA9PiBlbGVtLnJlbW92ZSgpKVxuICByZXR1cm4gZG9jLmlubmVySFRNTFxufVxuXG4vKipcbiAqIEhhbmRsZSBzdWNjZXNzZnVsIHJlc3BvbnNlIGZyb20gUGFuZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gUmV0dXJuZWQgSFRNTFxuICogQHJldHVybiB7YXJyYXl9IHdpdGggQXJndW1lbnRzIGZvciBjYWxsYmFja0Z1bmN0aW9uIChlcnJvciBzZXQgdG8gbnVsbClcbiAqL1xuZnVuY3Rpb24gaGFuZGxlU3VjY2VzcyhodG1sOiBzdHJpbmcsIHJlbmRlck1hdGg6IGJvb2xlYW4pIHtcbiAgaWYgKHJlbmRlck1hdGgpIHtcbiAgICBodG1sID0gaGFuZGxlTWF0aChodG1sKVxuICB9XG4gIGlmIChhdG9tQ29uZmlnKCkucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcykge1xuICAgIGh0bWwgPSByZW1vdmVSZWZlcmVuY2VzKGh0bWwpXG4gIH1cbiAgcmV0dXJuIGh0bWxcbn1cblxuLyoqXG4gKiBIYW5kbGUgcmVzcG9uc2UgZnJvbSBQYW5kb2NcbiAqIEBwYXJhbSB7T2JqZWN0fSBlcnJvciBpZiB0aHJvd25cbiAqIEBwYXJhbSB7c3RyaW5nfSBSZXR1cm5lZCBIVE1MXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKGVycm9yOiBzdHJpbmcsIGh0bWw6IHN0cmluZywgcmVuZGVyTWF0aDogYm9vbGVhbikge1xuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4gaGFuZGxlRXJyb3IoZXJyb3IsIGh0bWwsIHJlbmRlck1hdGgpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGhhbmRsZVN1Y2Nlc3MoaHRtbCwgcmVuZGVyTWF0aClcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlcnMgbWFya2Rvd24gd2l0aCBwYW5kb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBkb2N1bWVudCBpbiBtYXJrZG93blxuICogQHBhcmFtIHtib29sZWFufSB3aGV0aGVyIHRvIHJlbmRlciB0aGUgbWF0aCB3aXRoIG1hdGhqYXhcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrRnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gcmVuZGVyUGFuZG9jKFxuICB0ZXh0OiBzdHJpbmcsXG4gIGZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHJlbmRlck1hdGg6IGJvb2xlYW4sXG4gIGNiOiAoZXJyOiBFcnJvciB8IG51bGwsIHJlc3VsdDogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG4gIGNvbnN0IHsgYXJncywgb3B0cyB9ID0gc2V0UGFuZG9jT3B0aW9ucyhmaWxlUGF0aCwgcmVuZGVyTWF0aClcbiAgY29uc3QgY3AgPSBDUC5leGVjRmlsZShcbiAgICBhdG9tQ29uZmlnKCkucGFuZG9jUGF0aCxcbiAgICBnZXRBcmd1bWVudHMoYXJncyksXG4gICAgb3B0cyxcbiAgICBmdW5jdGlvbihlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IudG9TdHJpbmcoKSwge1xuICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGhhbmRsZVJlc3BvbnNlKHN0ZGVyciB8fCAnJywgc3Rkb3V0IHx8ICcnLCByZW5kZXJNYXRoKVxuICAgICAgcmV0dXJuIGNiKG51bGwsIHJlc3VsdClcbiAgICB9LFxuICApXG4gIGNwLnN0ZGluLndyaXRlKHRleHQpXG4gIGNwLnN0ZGluLmVuZCgpXG59XG5cbmZ1bmN0aW9uIGdldEFyZ3VtZW50cyhpYXJnczogQXJncykge1xuICBjb25zdCBhcmdzID0gXy5yZWR1Y2UoXG4gICAgaWFyZ3MsXG4gICAgZnVuY3Rpb24ocmVzOiBzdHJpbmdbXSwgdmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgJiYgIV8uaXNFbXB0eSh2YWwpKSB7XG4gICAgICAgIGNvbnN0IG52YWw6IHN0cmluZ1tdID0gXy5mbGF0dGVuKFt2YWxdKVxuICAgICAgICBfLmZvckVhY2gobnZhbCwgZnVuY3Rpb24odjogc3RyaW5nKSB7XG4gICAgICAgICAgaWYgKCFfLmlzRW1wdHkodikpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKGAtLSR7a2V5fT0ke3Z9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfSxcbiAgICBbXSxcbiAgKVxuICBjb25zdCByZXM6IHN0cmluZ1tdID0gW11cbiAgZm9yIChjb25zdCB2YWwgb2YgW1xuICAgIC4uLmFyZ3MsXG4gICAgLi4uYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQXJndW1lbnRzJykhLFxuICBdKSB7XG4gICAgY29uc3QgbmV3dmFsID0gdmFsLnJlcGxhY2UoL14oLS1bXFx3XFwtXSspXFxzKC4rKSQvaSwgJyQxPSQyJylcbiAgICBpZiAobmV3dmFsLnN1YnN0cigwLCAxKSA9PT0gJy0nKSB7XG4gICAgICByZXMucHVzaChuZXd2YWwpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUud2FybihyZXMpXG4gIHJldHVybiByZXNcbn1cblxuZXhwb3J0ID0ge1xuICByZW5kZXJQYW5kb2MsXG4gIF9fdGVzdGluZ19fOiB7XG4gICAgZmluZEZpbGVSZWN1cnNpdmUsXG4gICAgc2V0UGFuZG9jT3B0aW9ucyxcbiAgICBnZXRBcmd1bWVudHMsXG4gIH0sXG59XG4iXX0=