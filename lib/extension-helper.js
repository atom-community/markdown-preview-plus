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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixFQUFFLEVBQUUsY0FBYztJQUNsQixJQUFJLEVBQUUsY0FBYztJQUNwQixDQUFDLEVBQUUsVUFBVTtJQUNiLEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLEVBQUUsRUFBRSxXQUFXO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixNQUFNLEVBQUUsWUFBWTtJQUNwQixFQUFFLEVBQUUsV0FBVztJQUNmLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsRUFBRSxFQUFFLFdBQVc7SUFDZixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLElBQUksRUFBRSxhQUFhO0lBQ25CLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEdBQUcsRUFBRSxlQUFlO0lBQ3BCLEVBQUUsRUFBRSxlQUFlO0lBQ25CLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLEVBQUUsRUFBRSxhQUFhO0lBQ2pCLElBQUksRUFBRSxhQUFhO0lBQ25CLElBQUksRUFBRSxZQUFZO0lBQ2xCLElBQUksRUFBRSxhQUFhO0lBQ25CLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLGFBQWE7SUFDbkIsR0FBRyxFQUFFLGFBQWE7Q0FDNEIsQ0FBQTtBQUVoRCwyQkFBa0MsU0FBaUI7SUFDakQsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3BDLE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxJQUFJLEVBQUUsQ0FBQTtBQUNwRCxDQUFDO0FBSEQsOENBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzY29wZXNCeUZlbmNlTmFtZSA9IHtcbiAgc2g6ICdzb3VyY2Uuc2hlbGwnLFxuICBiYXNoOiAnc291cmNlLnNoZWxsJyxcbiAgYzogJ3NvdXJjZS5jJyxcbiAgJ2MrKyc6ICdzb3VyY2UuY3BwJyxcbiAgY3BwOiAnc291cmNlLmNwcCcsXG4gIGNvZmZlZTogJ3NvdXJjZS5jb2ZmZWUnLFxuICBjb2ZmZWVzY3JpcHQ6ICdzb3VyY2UuY29mZmVlJyxcbiAgJ2NvZmZlZS1zY3JpcHQnOiAnc291cmNlLmNvZmZlZScsXG4gIGNzOiAnc291cmNlLmNzJyxcbiAgY3NoYXJwOiAnc291cmNlLmNzJyxcbiAgY3NzOiAnc291cmNlLmNzcycsXG4gIHNjc3M6ICdzb3VyY2UuY3NzLnNjc3MnLFxuICBzYXNzOiAnc291cmNlLnNhc3MnLFxuICBlcmxhbmc6ICdzb3VyY2UuZXJsJyxcbiAgZ286ICdzb3VyY2UuZ28nLFxuICBodG1sOiAndGV4dC5odG1sLmJhc2ljJyxcbiAgamF2YTogJ3NvdXJjZS5qYXZhJyxcbiAganM6ICdzb3VyY2UuanMnLFxuICBqYXZhc2NyaXB0OiAnc291cmNlLmpzJyxcbiAganNvbjogJ3NvdXJjZS5qc29uJyxcbiAgbGVzczogJ3NvdXJjZS5sZXNzJyxcbiAgbXVzdGFjaGU6ICd0ZXh0Lmh0bWwubXVzdGFjaGUnLFxuICBvYmpjOiAnc291cmNlLm9iamMnLFxuICAnb2JqZWN0aXZlLWMnOiAnc291cmNlLm9iamMnLFxuICBwaHA6ICd0ZXh0Lmh0bWwucGhwJyxcbiAgcHk6ICdzb3VyY2UucHl0aG9uJyxcbiAgcHl0aG9uOiAnc291cmNlLnB5dGhvbicsXG4gIHJiOiAnc291cmNlLnJ1YnknLFxuICBydWJ5OiAnc291cmNlLnJ1YnknLFxuICB0ZXh0OiAndGV4dC5wbGFpbicsXG4gIHRvbWw6ICdzb3VyY2UudG9tbCcsXG4gIHhtbDogJ3RleHQueG1sJyxcbiAgeWFtbDogJ3NvdXJjZS55YW1sJyxcbiAgeW1sOiAnc291cmNlLnlhbWwnLFxufSBhcyB7IFtmZW5jZU5hbWU6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZCB9XG5cbmV4cG9ydCBmdW5jdGlvbiBzY29wZUZvckZlbmNlTmFtZShmZW5jZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxjZm4gPSBmZW5jZU5hbWUudG9Mb3dlckNhc2UoKVxuICByZXR1cm4gc2NvcGVzQnlGZW5jZU5hbWVbbGNmbl0gfHwgYHNvdXJjZS4ke2xjZm59YFxufVxuIl19