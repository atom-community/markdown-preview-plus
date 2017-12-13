"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scopesByFenceName = {
    sh: "source.shell",
    bash: "source.shell",
    c: "source.c",
    "c++": "source.cpp",
    cpp: "source.cpp",
    coffee: "source.coffee",
    coffeescript: "source.coffee",
    "coffee-script": "source.coffee",
    cs: "source.cs",
    csharp: "source.cs",
    css: "source.css",
    scss: "source.css.scss",
    sass: "source.sass",
    erlang: "source.erl",
    go: "source.go",
    html: "text.html.basic",
    java: "source.java",
    js: "source.js",
    javascript: "source.js",
    json: "source.json",
    less: "source.less",
    mustache: "text.html.mustache",
    objc: "source.objc",
    "objective-c": "source.objc",
    php: "text.html.php",
    py: "source.python",
    python: "source.python",
    rb: "source.ruby",
    ruby: "source.ruby",
    text: "text.plain",
    toml: "source.toml",
    xml: "text.xml",
    yaml: "source.yaml",
    yml: "source.yaml"
};
function scopeForFenceName(fenceName) {
    return scopesByFenceName[fenceName] || `source.${fenceName}`;
}
exports.scopeForFenceName = scopeForFenceName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRlbnNpb24taGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxpQkFBaUIsR0FBRztJQUN4QixFQUFFLEVBQUUsY0FBYztJQUNsQixJQUFJLEVBQUUsY0FBYztJQUNwQixDQUFDLEVBQUUsVUFBVTtJQUNiLEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxZQUFZO0lBQ2pCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxlQUFlO0lBQ2hDLEVBQUUsRUFBRSxXQUFXO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsR0FBRyxFQUFFLFlBQVk7SUFDakIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixNQUFNLEVBQUUsWUFBWTtJQUNwQixFQUFFLEVBQUUsV0FBVztJQUNmLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsSUFBSSxFQUFFLGFBQWE7SUFDbkIsRUFBRSxFQUFFLFdBQVc7SUFDZixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsYUFBYTtJQUNuQixJQUFJLEVBQUUsYUFBYTtJQUNuQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLElBQUksRUFBRSxhQUFhO0lBQ25CLGFBQWEsRUFBRSxhQUFhO0lBQzVCLEdBQUcsRUFBRSxlQUFlO0lBQ3BCLEVBQUUsRUFBRSxlQUFlO0lBQ25CLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLEVBQUUsRUFBRSxhQUFhO0lBQ2pCLElBQUksRUFBRSxhQUFhO0lBQ25CLElBQUksRUFBRSxZQUFZO0lBQ2xCLElBQUksRUFBRSxhQUFhO0lBQ25CLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLGFBQWE7SUFDbkIsR0FBRyxFQUFFLGFBQWE7Q0FDbkIsQ0FBQTtBQUVELDJCQUFrQyxTQUFpQjtJQUNqRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksVUFBVSxTQUFTLEVBQUUsQ0FBQTtBQUM5RCxDQUFDO0FBRkQsOENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBzY29wZXNCeUZlbmNlTmFtZSA9IHtcbiAgc2g6IFwic291cmNlLnNoZWxsXCIsXG4gIGJhc2g6IFwic291cmNlLnNoZWxsXCIsXG4gIGM6IFwic291cmNlLmNcIixcbiAgXCJjKytcIjogXCJzb3VyY2UuY3BwXCIsXG4gIGNwcDogXCJzb3VyY2UuY3BwXCIsXG4gIGNvZmZlZTogXCJzb3VyY2UuY29mZmVlXCIsXG4gIGNvZmZlZXNjcmlwdDogXCJzb3VyY2UuY29mZmVlXCIsXG4gIFwiY29mZmVlLXNjcmlwdFwiOiBcInNvdXJjZS5jb2ZmZWVcIixcbiAgY3M6IFwic291cmNlLmNzXCIsXG4gIGNzaGFycDogXCJzb3VyY2UuY3NcIixcbiAgY3NzOiBcInNvdXJjZS5jc3NcIixcbiAgc2NzczogXCJzb3VyY2UuY3NzLnNjc3NcIixcbiAgc2FzczogXCJzb3VyY2Uuc2Fzc1wiLFxuICBlcmxhbmc6IFwic291cmNlLmVybFwiLFxuICBnbzogXCJzb3VyY2UuZ29cIixcbiAgaHRtbDogXCJ0ZXh0Lmh0bWwuYmFzaWNcIixcbiAgamF2YTogXCJzb3VyY2UuamF2YVwiLFxuICBqczogXCJzb3VyY2UuanNcIixcbiAgamF2YXNjcmlwdDogXCJzb3VyY2UuanNcIixcbiAganNvbjogXCJzb3VyY2UuanNvblwiLFxuICBsZXNzOiBcInNvdXJjZS5sZXNzXCIsXG4gIG11c3RhY2hlOiBcInRleHQuaHRtbC5tdXN0YWNoZVwiLFxuICBvYmpjOiBcInNvdXJjZS5vYmpjXCIsXG4gIFwib2JqZWN0aXZlLWNcIjogXCJzb3VyY2Uub2JqY1wiLFxuICBwaHA6IFwidGV4dC5odG1sLnBocFwiLFxuICBweTogXCJzb3VyY2UucHl0aG9uXCIsXG4gIHB5dGhvbjogXCJzb3VyY2UucHl0aG9uXCIsXG4gIHJiOiBcInNvdXJjZS5ydWJ5XCIsXG4gIHJ1Ynk6IFwic291cmNlLnJ1YnlcIixcbiAgdGV4dDogXCJ0ZXh0LnBsYWluXCIsXG4gIHRvbWw6IFwic291cmNlLnRvbWxcIixcbiAgeG1sOiBcInRleHQueG1sXCIsXG4gIHlhbWw6IFwic291cmNlLnlhbWxcIixcbiAgeW1sOiBcInNvdXJjZS55YW1sXCJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjb3BlRm9yRmVuY2VOYW1lKGZlbmNlTmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBzY29wZXNCeUZlbmNlTmFtZVtmZW5jZU5hbWVdIHx8IGBzb3VyY2UuJHtmZW5jZU5hbWV9YFxufVxuIl19