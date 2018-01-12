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
    return scopesByFenceName[fenceName] || `source.${fenceName}`;
}
exports.scopeForFenceName = scopeForFenceName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixFQUFFLEVBQUUsY0FBYztJQUNsQixJQUFJLEVBQUUsY0FBYztJQUNwQixDQUFDLEVBQUUsVUFBVTtJQUNiLEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLEVBQUUsRUFBRSxXQUFXO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixNQUFNLEVBQUUsWUFBWTtJQUNwQixFQUFFLEVBQUUsV0FBVztJQUNmLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsRUFBRSxFQUFFLFdBQVc7SUFDZixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLElBQUksRUFBRSxhQUFhO0lBQ25CLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEdBQUcsRUFBRSxlQUFlO0lBQ3BCLEVBQUUsRUFBRSxlQUFlO0lBQ25CLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLEVBQUUsRUFBRSxhQUFhO0lBQ2pCLElBQUksRUFBRSxhQUFhO0lBQ25CLElBQUksRUFBRSxZQUFZO0lBQ2xCLElBQUksRUFBRSxhQUFhO0lBQ25CLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLGFBQWE7SUFDbkIsR0FBRyxFQUFFLGFBQWE7Q0FDNEIsQ0FBQTtBQUVoRCwyQkFBa0MsU0FBaUI7SUFDakQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFJLFVBQVUsU0FBUyxFQUFFLENBQUE7QUFDOUQsQ0FBQztBQUZELDhDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc2NvcGVzQnlGZW5jZU5hbWUgPSB7XG4gIHNoOiAnc291cmNlLnNoZWxsJyxcbiAgYmFzaDogJ3NvdXJjZS5zaGVsbCcsXG4gIGM6ICdzb3VyY2UuYycsXG4gICdjKysnOiAnc291cmNlLmNwcCcsXG4gIGNwcDogJ3NvdXJjZS5jcHAnLFxuICBjb2ZmZWU6ICdzb3VyY2UuY29mZmVlJyxcbiAgY29mZmVlc2NyaXB0OiAnc291cmNlLmNvZmZlZScsXG4gICdjb2ZmZWUtc2NyaXB0JzogJ3NvdXJjZS5jb2ZmZWUnLFxuICBjczogJ3NvdXJjZS5jcycsXG4gIGNzaGFycDogJ3NvdXJjZS5jcycsXG4gIGNzczogJ3NvdXJjZS5jc3MnLFxuICBzY3NzOiAnc291cmNlLmNzcy5zY3NzJyxcbiAgc2FzczogJ3NvdXJjZS5zYXNzJyxcbiAgZXJsYW5nOiAnc291cmNlLmVybCcsXG4gIGdvOiAnc291cmNlLmdvJyxcbiAgaHRtbDogJ3RleHQuaHRtbC5iYXNpYycsXG4gIGphdmE6ICdzb3VyY2UuamF2YScsXG4gIGpzOiAnc291cmNlLmpzJyxcbiAgamF2YXNjcmlwdDogJ3NvdXJjZS5qcycsXG4gIGpzb246ICdzb3VyY2UuanNvbicsXG4gIGxlc3M6ICdzb3VyY2UubGVzcycsXG4gIG11c3RhY2hlOiAndGV4dC5odG1sLm11c3RhY2hlJyxcbiAgb2JqYzogJ3NvdXJjZS5vYmpjJyxcbiAgJ29iamVjdGl2ZS1jJzogJ3NvdXJjZS5vYmpjJyxcbiAgcGhwOiAndGV4dC5odG1sLnBocCcsXG4gIHB5OiAnc291cmNlLnB5dGhvbicsXG4gIHB5dGhvbjogJ3NvdXJjZS5weXRob24nLFxuICByYjogJ3NvdXJjZS5ydWJ5JyxcbiAgcnVieTogJ3NvdXJjZS5ydWJ5JyxcbiAgdGV4dDogJ3RleHQucGxhaW4nLFxuICB0b21sOiAnc291cmNlLnRvbWwnLFxuICB4bWw6ICd0ZXh0LnhtbCcsXG4gIHlhbWw6ICdzb3VyY2UueWFtbCcsXG4gIHltbDogJ3NvdXJjZS55YW1sJyxcbn0gYXMgeyBbZmVuY2VOYW1lOiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQgfVxuXG5leHBvcnQgZnVuY3Rpb24gc2NvcGVGb3JGZW5jZU5hbWUoZmVuY2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc2NvcGVzQnlGZW5jZU5hbWVbZmVuY2VOYW1lXSB8fCBgc291cmNlLiR7ZmVuY2VOYW1lfWBcbn1cbiJdfQ==