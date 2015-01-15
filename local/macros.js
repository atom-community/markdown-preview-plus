MathJax.Hub.Register.StartupHook("TeX Jax Ready",function () {
  var TEX = MathJax.InputJax.TeX;
  // place macros here.  E.g.:
  //
  //   TEX.Macro("R","{\\bf R}");
  //   TEX.Macro("bold","{\\bf{#1}}",1); // a macro with 1 parameter
  //
  // Allows you to use \R to get a bold-faced R and \bold{text} to get bold-faced text
});

MathJax.Ajax.loadComplete("[Local]/macros.js");
