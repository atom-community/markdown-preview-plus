"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scopesByFenceName = {
    'sh': 'source.shell',
    'bash': 'source.shell',
    'c': 'source.c',
    'c++': 'source.cpp',
    'cpp': 'source.cpp',
    'coffee': 'source.coffee',
    'coffeescript': 'source.coffee',
    'coffee-script': 'source.coffee',
    'cs': 'source.cs',
    'csharp': 'source.cs',
    'css': 'source.css',
    'scss': 'source.css.scss',
    'sass': 'source.sass',
    'erlang': 'source.erl',
    'go': 'source.go',
    'html': 'text.html.basic',
    'java': 'source.java',
    'js': 'source.js',
    'javascript': 'source.js',
    'json': 'source.json',
    'less': 'source.less',
    'mustache': 'text.html.mustache',
    'objc': 'source.objc',
    'objective-c': 'source.objc',
    'php': 'text.html.php',
    'py': 'source.python',
    'python': 'source.python',
    'rb': 'source.ruby',
    'ruby': 'source.ruby',
    'text': 'text.plain',
    'toml': 'source.toml',
    'xml': 'text.xml',
    'yaml': 'source.yaml',
    'yml': 'source.yaml'
};
function scopeForFenceName(fenceName) {
    return scopesByFenceName[fenceName] || `source.${fenceName}`;
}
exports.scopeForFenceName = scopeForFenceName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixJQUFJLEVBQUUsY0FBYztJQUNwQixNQUFNLEVBQUUsY0FBYztJQUN0QixHQUFHLEVBQUUsVUFBVTtJQUNmLEtBQUssRUFBRSxZQUFZO0lBQ25CLEtBQUssRUFBRSxZQUFZO0lBQ25CLFFBQVEsRUFBRSxlQUFlO0lBQ3pCLGNBQWMsRUFBRSxlQUFlO0lBQy9CLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLElBQUksRUFBRSxXQUFXO0lBQ2pCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLEtBQUssRUFBRSxZQUFZO0lBQ25CLE1BQU0sRUFBRSxpQkFBaUI7SUFDekIsTUFBTSxFQUFFLGFBQWE7SUFDckIsUUFBUSxFQUFFLFlBQVk7SUFDdEIsSUFBSSxFQUFFLFdBQVc7SUFDakIsTUFBTSxFQUFFLGlCQUFpQjtJQUN6QixNQUFNLEVBQUUsYUFBYTtJQUNyQixJQUFJLEVBQUUsV0FBVztJQUNqQixZQUFZLEVBQUUsV0FBVztJQUN6QixNQUFNLEVBQUUsYUFBYTtJQUNyQixNQUFNLEVBQUUsYUFBYTtJQUNyQixVQUFVLEVBQUUsb0JBQW9CO0lBQ2hDLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEtBQUssRUFBRSxlQUFlO0lBQ3RCLElBQUksRUFBRSxlQUFlO0lBQ3JCLFFBQVEsRUFBRSxlQUFlO0lBQ3pCLElBQUksRUFBRSxhQUFhO0lBQ25CLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLEtBQUssRUFBRSxVQUFVO0lBQ2pCLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLEtBQUssRUFBRSxhQUFhO0NBQ3JCLENBQUM7QUFFRiwyQkFBa0MsU0FBaUI7SUFDakQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFJLFVBQVUsU0FBUyxFQUFFLENBQUM7QUFDL0QsQ0FBQztBQUZELDhDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc2NvcGVzQnlGZW5jZU5hbWUgPSB7XG4gICdzaCc6ICdzb3VyY2Uuc2hlbGwnLFxuICAnYmFzaCc6ICdzb3VyY2Uuc2hlbGwnLFxuICAnYyc6ICdzb3VyY2UuYycsXG4gICdjKysnOiAnc291cmNlLmNwcCcsXG4gICdjcHAnOiAnc291cmNlLmNwcCcsXG4gICdjb2ZmZWUnOiAnc291cmNlLmNvZmZlZScsXG4gICdjb2ZmZWVzY3JpcHQnOiAnc291cmNlLmNvZmZlZScsXG4gICdjb2ZmZWUtc2NyaXB0JzogJ3NvdXJjZS5jb2ZmZWUnLFxuICAnY3MnOiAnc291cmNlLmNzJyxcbiAgJ2NzaGFycCc6ICdzb3VyY2UuY3MnLFxuICAnY3NzJzogJ3NvdXJjZS5jc3MnLFxuICAnc2Nzcyc6ICdzb3VyY2UuY3NzLnNjc3MnLFxuICAnc2Fzcyc6ICdzb3VyY2Uuc2FzcycsXG4gICdlcmxhbmcnOiAnc291cmNlLmVybCcsXG4gICdnbyc6ICdzb3VyY2UuZ28nLFxuICAnaHRtbCc6ICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICAnamF2YSc6ICdzb3VyY2UuamF2YScsXG4gICdqcyc6ICdzb3VyY2UuanMnLFxuICAnamF2YXNjcmlwdCc6ICdzb3VyY2UuanMnLFxuICAnanNvbic6ICdzb3VyY2UuanNvbicsXG4gICdsZXNzJzogJ3NvdXJjZS5sZXNzJyxcbiAgJ211c3RhY2hlJzogJ3RleHQuaHRtbC5tdXN0YWNoZScsXG4gICdvYmpjJzogJ3NvdXJjZS5vYmpjJyxcbiAgJ29iamVjdGl2ZS1jJzogJ3NvdXJjZS5vYmpjJyxcbiAgJ3BocCc6ICd0ZXh0Lmh0bWwucGhwJyxcbiAgJ3B5JzogJ3NvdXJjZS5weXRob24nLFxuICAncHl0aG9uJzogJ3NvdXJjZS5weXRob24nLFxuICAncmInOiAnc291cmNlLnJ1YnknLFxuICAncnVieSc6ICdzb3VyY2UucnVieScsXG4gICd0ZXh0JzogJ3RleHQucGxhaW4nLFxuICAndG9tbCc6ICdzb3VyY2UudG9tbCcsXG4gICd4bWwnOiAndGV4dC54bWwnLFxuICAneWFtbCc6ICdzb3VyY2UueWFtbCcsXG4gICd5bWwnOiAnc291cmNlLnlhbWwnXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2NvcGVGb3JGZW5jZU5hbWUoZmVuY2VOYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHNjb3Blc0J5RmVuY2VOYW1lW2ZlbmNlTmFtZV0gfHwgYHNvdXJjZS4ke2ZlbmNlTmFtZX1gO1xufVxuIl19