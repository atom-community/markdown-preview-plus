/**
 * Download and uncompress tarball of MathJax from a GitHub release
 */

var request = require('request');
var zlib    = require('zlib');
var tar     = require('tar');
var path    = require('path');
var fs      = require('fs');

var url     = "https://github.com/mathjax/MathJax/archive/2.4.0.tar.gz";
var headers = {
  "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  "accept-language" : "en-US,en;q=0.8",
  "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent" : "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
  "accept-encoding" : "gzip,deflate"
}
var options = {
  url: url,
  headers: headers
}

if( !fs.existsSync(path.resolve('./MathJax')) ) {
  request( options )
      .pipe(zlib.Unzip())
      .pipe(tar.Extract( {path: path.resolve('./MathJax')} ))
}
