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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixFQUFFLEVBQUUsY0FBYztJQUNsQixJQUFJLEVBQUUsY0FBYztJQUNwQixDQUFDLEVBQUUsVUFBVTtJQUNiLEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLEVBQUUsRUFBRSxXQUFXO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixNQUFNLEVBQUUsWUFBWTtJQUNwQixFQUFFLEVBQUUsV0FBVztJQUNmLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsRUFBRSxFQUFFLFdBQVc7SUFDZixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLElBQUksRUFBRSxhQUFhO0lBQ25CLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEdBQUcsRUFBRSxlQUFlO0lBQ3BCLEVBQUUsRUFBRSxlQUFlO0lBQ25CLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLEVBQUUsRUFBRSxhQUFhO0lBQ2pCLElBQUksRUFBRSxhQUFhO0lBQ25CLElBQUksRUFBRSxZQUFZO0lBQ2xCLElBQUksRUFBRSxhQUFhO0lBQ25CLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLGFBQWE7SUFDbkIsR0FBRyxFQUFFLGFBQWE7Q0FDNEIsQ0FBQTtBQUVoRCwyQkFBa0MsU0FBaUI7SUFDakQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxJQUFJLEVBQUUsQ0FBQTtBQUNwRCxDQUFDO0FBSEQsOENBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzY29wZXNCeUZlbmNlTmFtZSA9IHtcclxuICBzaDogJ3NvdXJjZS5zaGVsbCcsXHJcbiAgYmFzaDogJ3NvdXJjZS5zaGVsbCcsXHJcbiAgYzogJ3NvdXJjZS5jJyxcclxuICAnYysrJzogJ3NvdXJjZS5jcHAnLFxyXG4gIGNwcDogJ3NvdXJjZS5jcHAnLFxyXG4gIGNvZmZlZTogJ3NvdXJjZS5jb2ZmZWUnLFxyXG4gIGNvZmZlZXNjcmlwdDogJ3NvdXJjZS5jb2ZmZWUnLFxyXG4gICdjb2ZmZWUtc2NyaXB0JzogJ3NvdXJjZS5jb2ZmZWUnLFxyXG4gIGNzOiAnc291cmNlLmNzJyxcclxuICBjc2hhcnA6ICdzb3VyY2UuY3MnLFxyXG4gIGNzczogJ3NvdXJjZS5jc3MnLFxyXG4gIHNjc3M6ICdzb3VyY2UuY3NzLnNjc3MnLFxyXG4gIHNhc3M6ICdzb3VyY2Uuc2FzcycsXHJcbiAgZXJsYW5nOiAnc291cmNlLmVybCcsXHJcbiAgZ286ICdzb3VyY2UuZ28nLFxyXG4gIGh0bWw6ICd0ZXh0Lmh0bWwuYmFzaWMnLFxyXG4gIGphdmE6ICdzb3VyY2UuamF2YScsXHJcbiAganM6ICdzb3VyY2UuanMnLFxyXG4gIGphdmFzY3JpcHQ6ICdzb3VyY2UuanMnLFxyXG4gIGpzb246ICdzb3VyY2UuanNvbicsXHJcbiAgbGVzczogJ3NvdXJjZS5sZXNzJyxcclxuICBtdXN0YWNoZTogJ3RleHQuaHRtbC5tdXN0YWNoZScsXHJcbiAgb2JqYzogJ3NvdXJjZS5vYmpjJyxcclxuICAnb2JqZWN0aXZlLWMnOiAnc291cmNlLm9iamMnLFxyXG4gIHBocDogJ3RleHQuaHRtbC5waHAnLFxyXG4gIHB5OiAnc291cmNlLnB5dGhvbicsXHJcbiAgcHl0aG9uOiAnc291cmNlLnB5dGhvbicsXHJcbiAgcmI6ICdzb3VyY2UucnVieScsXHJcbiAgcnVieTogJ3NvdXJjZS5ydWJ5JyxcclxuICB0ZXh0OiAndGV4dC5wbGFpbicsXHJcbiAgdG9tbDogJ3NvdXJjZS50b21sJyxcclxuICB4bWw6ICd0ZXh0LnhtbCcsXHJcbiAgeWFtbDogJ3NvdXJjZS55YW1sJyxcclxuICB5bWw6ICdzb3VyY2UueWFtbCcsXHJcbn0gYXMgeyBbZmVuY2VOYW1lOiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQgfVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNjb3BlRm9yRmVuY2VOYW1lKGZlbmNlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBsY2ZuID0gZmVuY2VOYW1lLnRvTG93ZXJDYXNlKClcclxuICByZXR1cm4gc2NvcGVzQnlGZW5jZU5hbWVbbGNmbl0gfHwgYHNvdXJjZS4ke2xjZm59YFxyXG59XHJcbiJdfQ==