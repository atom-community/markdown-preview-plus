"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scopesByFenceName = {
    sh: 'source.shell',
    bash: 'source.shell',
    c: 'source.c',
    'c++': 'source.cpp',
    cpp: 'source.cpp',
    coffee: 'source.coffee',
    coffeescript: 'source.coffee',
    'coffee-script': 'source.coffee',
    cs: 'source.cs',
    csharp: 'source.cs',
    css: 'source.css',
    scss: 'source.css.scss',
    sass: 'source.sass',
    erlang: 'source.erl',
    go: 'source.go',
    html: 'text.html.basic',
    java: 'source.java',
    js: 'source.js',
    javascript: 'source.js',
    json: 'source.json',
    less: 'source.less',
    mustache: 'text.html.mustache',
    objc: 'source.objc',
    'objective-c': 'source.objc',
    php: 'text.html.php',
    py: 'source.python',
    python: 'source.python',
    rb: 'source.ruby',
    ruby: 'source.ruby',
    text: 'text.plain',
    toml: 'source.toml',
    xml: 'text.xml',
    yaml: 'source.yaml',
    yml: 'source.yaml',
};
function scopeForFenceName(fenceName) {
    const lcfn = fenceName.toLowerCase();
    return scopesByFenceName[lcfn] || `source.${lcfn}`;
}
exports.scopeForFenceName = scopeForFenceName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixFQUFFLEVBQUUsY0FBYztJQUNsQixJQUFJLEVBQUUsY0FBYztJQUNwQixDQUFDLEVBQUUsVUFBVTtJQUNiLEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLEVBQUUsRUFBRSxXQUFXO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixNQUFNLEVBQUUsWUFBWTtJQUNwQixFQUFFLEVBQUUsV0FBVztJQUNmLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsRUFBRSxFQUFFLFdBQVc7SUFDZixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLElBQUksRUFBRSxhQUFhO0lBQ25CLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEdBQUcsRUFBRSxlQUFlO0lBQ3BCLEVBQUUsRUFBRSxlQUFlO0lBQ25CLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLEVBQUUsRUFBRSxhQUFhO0lBQ2pCLElBQUksRUFBRSxhQUFhO0lBQ25CLElBQUksRUFBRSxZQUFZO0lBQ2xCLElBQUksRUFBRSxhQUFhO0lBQ25CLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLGFBQWE7SUFDbkIsR0FBRyxFQUFFLGFBQWE7Q0FDNEIsQ0FBQTtBQUVoRCwyQkFBa0MsU0FBaUI7SUFDakQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLElBQUksRUFBRSxDQUFBO0FBQ3BELENBQUM7QUFIRCw4Q0FHQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNjb3Blc0J5RmVuY2VOYW1lID0ge1xuICBzaDogJ3NvdXJjZS5zaGVsbCcsXG4gIGJhc2g6ICdzb3VyY2Uuc2hlbGwnLFxuICBjOiAnc291cmNlLmMnLFxuICAnYysrJzogJ3NvdXJjZS5jcHAnLFxuICBjcHA6ICdzb3VyY2UuY3BwJyxcbiAgY29mZmVlOiAnc291cmNlLmNvZmZlZScsXG4gIGNvZmZlZXNjcmlwdDogJ3NvdXJjZS5jb2ZmZWUnLFxuICAnY29mZmVlLXNjcmlwdCc6ICdzb3VyY2UuY29mZmVlJyxcbiAgY3M6ICdzb3VyY2UuY3MnLFxuICBjc2hhcnA6ICdzb3VyY2UuY3MnLFxuICBjc3M6ICdzb3VyY2UuY3NzJyxcbiAgc2NzczogJ3NvdXJjZS5jc3Muc2NzcycsXG4gIHNhc3M6ICdzb3VyY2Uuc2FzcycsXG4gIGVybGFuZzogJ3NvdXJjZS5lcmwnLFxuICBnbzogJ3NvdXJjZS5nbycsXG4gIGh0bWw6ICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICBqYXZhOiAnc291cmNlLmphdmEnLFxuICBqczogJ3NvdXJjZS5qcycsXG4gIGphdmFzY3JpcHQ6ICdzb3VyY2UuanMnLFxuICBqc29uOiAnc291cmNlLmpzb24nLFxuICBsZXNzOiAnc291cmNlLmxlc3MnLFxuICBtdXN0YWNoZTogJ3RleHQuaHRtbC5tdXN0YWNoZScsXG4gIG9iamM6ICdzb3VyY2Uub2JqYycsXG4gICdvYmplY3RpdmUtYyc6ICdzb3VyY2Uub2JqYycsXG4gIHBocDogJ3RleHQuaHRtbC5waHAnLFxuICBweTogJ3NvdXJjZS5weXRob24nLFxuICBweXRob246ICdzb3VyY2UucHl0aG9uJyxcbiAgcmI6ICdzb3VyY2UucnVieScsXG4gIHJ1Ynk6ICdzb3VyY2UucnVieScsXG4gIHRleHQ6ICd0ZXh0LnBsYWluJyxcbiAgdG9tbDogJ3NvdXJjZS50b21sJyxcbiAgeG1sOiAndGV4dC54bWwnLFxuICB5YW1sOiAnc291cmNlLnlhbWwnLFxuICB5bWw6ICdzb3VyY2UueWFtbCcsXG59IGFzIHsgW2ZlbmNlTmFtZTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkIH1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjb3BlRm9yRmVuY2VOYW1lKGZlbmNlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbGNmbiA9IGZlbmNlTmFtZS50b0xvd2VyQ2FzZSgpXG4gIHJldHVybiBzY29wZXNCeUZlbmNlTmFtZVtsY2ZuXSB8fCBgc291cmNlLiR7bGNmbn1gXG59XG4iXX0=