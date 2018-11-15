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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixFQUFFLEVBQUUsY0FBYztJQUNsQixJQUFJLEVBQUUsY0FBYztJQUNwQixDQUFDLEVBQUUsVUFBVTtJQUNiLEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLEVBQUUsRUFBRSxXQUFXO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixNQUFNLEVBQUUsWUFBWTtJQUNwQixFQUFFLEVBQUUsV0FBVztJQUNmLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsRUFBRSxFQUFFLFdBQVc7SUFDZixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLElBQUksRUFBRSxhQUFhO0lBQ25CLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEdBQUcsRUFBRSxlQUFlO0lBQ3BCLEVBQUUsRUFBRSxlQUFlO0lBQ25CLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLEVBQUUsRUFBRSxhQUFhO0lBQ2pCLElBQUksRUFBRSxhQUFhO0lBQ25CLElBQUksRUFBRSxZQUFZO0lBQ2xCLElBQUksRUFBRSxhQUFhO0lBQ25CLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLGFBQWE7SUFDbkIsR0FBRyxFQUFFLGFBQWE7Q0FDNEIsQ0FBQTtBQUVoRCxTQUFnQixpQkFBaUIsQ0FBQyxTQUFpQjtJQUNqRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDcEMsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLElBQUksRUFBRSxDQUFBO0FBQ3BELENBQUM7QUFIRCw4Q0FHQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNjb3Blc0J5RmVuY2VOYW1lID0ge1xyXG4gIHNoOiAnc291cmNlLnNoZWxsJyxcclxuICBiYXNoOiAnc291cmNlLnNoZWxsJyxcclxuICBjOiAnc291cmNlLmMnLFxyXG4gICdjKysnOiAnc291cmNlLmNwcCcsXHJcbiAgY3BwOiAnc291cmNlLmNwcCcsXHJcbiAgY29mZmVlOiAnc291cmNlLmNvZmZlZScsXHJcbiAgY29mZmVlc2NyaXB0OiAnc291cmNlLmNvZmZlZScsXHJcbiAgJ2NvZmZlZS1zY3JpcHQnOiAnc291cmNlLmNvZmZlZScsXHJcbiAgY3M6ICdzb3VyY2UuY3MnLFxyXG4gIGNzaGFycDogJ3NvdXJjZS5jcycsXHJcbiAgY3NzOiAnc291cmNlLmNzcycsXHJcbiAgc2NzczogJ3NvdXJjZS5jc3Muc2NzcycsXHJcbiAgc2FzczogJ3NvdXJjZS5zYXNzJyxcclxuICBlcmxhbmc6ICdzb3VyY2UuZXJsJyxcclxuICBnbzogJ3NvdXJjZS5nbycsXHJcbiAgaHRtbDogJ3RleHQuaHRtbC5iYXNpYycsXHJcbiAgamF2YTogJ3NvdXJjZS5qYXZhJyxcclxuICBqczogJ3NvdXJjZS5qcycsXHJcbiAgamF2YXNjcmlwdDogJ3NvdXJjZS5qcycsXHJcbiAganNvbjogJ3NvdXJjZS5qc29uJyxcclxuICBsZXNzOiAnc291cmNlLmxlc3MnLFxyXG4gIG11c3RhY2hlOiAndGV4dC5odG1sLm11c3RhY2hlJyxcclxuICBvYmpjOiAnc291cmNlLm9iamMnLFxyXG4gICdvYmplY3RpdmUtYyc6ICdzb3VyY2Uub2JqYycsXHJcbiAgcGhwOiAndGV4dC5odG1sLnBocCcsXHJcbiAgcHk6ICdzb3VyY2UucHl0aG9uJyxcclxuICBweXRob246ICdzb3VyY2UucHl0aG9uJyxcclxuICByYjogJ3NvdXJjZS5ydWJ5JyxcclxuICBydWJ5OiAnc291cmNlLnJ1YnknLFxyXG4gIHRleHQ6ICd0ZXh0LnBsYWluJyxcclxuICB0b21sOiAnc291cmNlLnRvbWwnLFxyXG4gIHhtbDogJ3RleHQueG1sJyxcclxuICB5YW1sOiAnc291cmNlLnlhbWwnLFxyXG4gIHltbDogJ3NvdXJjZS55YW1sJyxcclxufSBhcyB7IFtmZW5jZU5hbWU6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZCB9XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2NvcGVGb3JGZW5jZU5hbWUoZmVuY2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IGxjZm4gPSBmZW5jZU5hbWUudG9Mb3dlckNhc2UoKVxyXG4gIHJldHVybiBzY29wZXNCeUZlbmNlTmFtZVtsY2ZuXSB8fCBgc291cmNlLiR7bGNmbn1gXHJcbn1cclxuIl19