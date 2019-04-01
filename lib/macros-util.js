"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const CSON = require("season");
const fs = require("fs");
const util_1 = require("./util");
function getUserMacrosPath(atomHome) {
    const userMacrosPath = CSON.resolve(path.join(atomHome, 'markdown-preview-plus'));
    return userMacrosPath != null
        ? userMacrosPath
        : path.join(atomHome, 'markdown-preview-plus.cson');
}
function loadMacrosFile(filePath) {
    if (!CSON.isObjectPath(filePath))
        return {};
    const macros = CSON.readFileSync(filePath, function (error, object) {
        if (error !== undefined) {
            console.warn(`Error reading Latex Macros file '${filePath}': ${error.stack !== undefined ? error.stack : error}`);
            console.error(`Failed to load Latex Macros from '${filePath}'`, {
                detail: error.message,
                dismissable: true,
            });
        }
        return object;
    });
    return checkMacros(macros || {});
}
function loadUserMacros(atomHome = atom.getConfigDirPath()) {
    const userMacrosPath = getUserMacrosPath(atomHome);
    if (util_1.isFileSync(userMacrosPath)) {
        return loadMacrosFile(userMacrosPath);
    }
    else {
        console.debug('Creating markdown-preview-plus.cson, this is a one-time operation.');
        createMacrosTemplate(userMacrosPath);
        return loadMacrosFile(userMacrosPath);
    }
}
exports.loadUserMacros = loadUserMacros;
function createMacrosTemplate(filePath) {
    const templatePath = path.join(__dirname, '../assets/macros-template.cson');
    const templateFile = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(filePath, templateFile);
}
function checkMacros(macrosObject) {
    const namePattern = /^[^a-zA-Z\d\s]$|^[a-zA-Z]*$/;
    const result = {};
    for (const name of Object.keys(macrosObject)) {
        const value = macrosObject[name];
        if (name.match(namePattern) && valueMatchesPattern(value)) {
            result[name] = value;
        }
        else {
            atom.notifications.addWarning(`Markdown-Preview-Plus failed to load LaTeX macro named '${name}'.` +
                ` Please see the [LaTeX guide](https://github.com/atom-community/markdown-preview-plus/blob/master/docs/math.md#macro-names)`);
        }
    }
    return result;
}
function valueMatchesPattern(value) {
    if (Array.isArray(value)) {
        const macroDefinition = value[0];
        const numberOfArgs = value[1];
        if (typeof numberOfArgs === 'number') {
            return numberOfArgs % 1 === 0 && typeof macroDefinition === 'string';
        }
        else {
            return false;
        }
    }
    else if (typeof value === 'string') {
        return true;
    }
    else {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjcm9zLXV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFjcm9zLXV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLHlCQUF5QjtBQUN6QixpQ0FBbUM7QUFFbkMsU0FBUyxpQkFBaUIsQ0FBQyxRQUFnQjtJQUN6QyxNQUFNLGNBQWMsR0FBOEIsSUFBSSxDQUFDLE9BQU8sQ0FDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsdUJBQXVCLENBQUMsQ0FDN0MsQ0FBQTtJQUNELE9BQU8sY0FBYyxJQUFJLElBQUk7UUFDM0IsQ0FBQyxDQUFDLGNBQWM7UUFDaEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLDRCQUE0QixDQUFDLENBQUE7QUFDdkQsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLFFBQWdCO0lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztRQUFFLE9BQU8sRUFBRSxDQUFBO0lBRTNDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQ3pDLEtBQWEsRUFDYixNQUFlO1FBRWYsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQ1Ysb0NBQW9DLFFBQVEsTUFDMUMsS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQzVDLEVBQUUsQ0FDSCxDQUFBO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsUUFBUSxHQUFHLEVBQUU7Z0JBQzlELE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDckIsV0FBVyxFQUFFLElBQUk7YUFDbEIsQ0FBQyxDQUFBO1NBQ0g7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxXQUFXLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ2xDLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtJQUMvRCxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNsRCxJQUFJLGlCQUFVLENBQUMsY0FBYyxDQUFDLEVBQUU7UUFDOUIsT0FBTyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUE7S0FDdEM7U0FBTTtRQUNMLE9BQU8sQ0FBQyxLQUFLLENBQ1gsb0VBQW9FLENBQ3JFLENBQUE7UUFDRCxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUNwQyxPQUFPLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtLQUN0QztBQUNILENBQUM7QUFYRCx3Q0FXQztBQUVELFNBQVMsb0JBQW9CLENBQUMsUUFBZ0I7SUFDNUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQTtJQUMzRSxNQUFNLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUMxRCxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUMxQyxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsWUFBb0I7SUFDdkMsTUFBTSxXQUFXLEdBQUcsNkJBQTZCLENBQUE7SUFDakQsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUM1QyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDaEMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUE7U0FDckI7YUFBTTtZQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUMzQiwyREFBMkQsSUFBSSxJQUFJO2dCQUNqRSw2SEFBNkgsQ0FDaEksQ0FBQTtTQUNGO0tBQ0Y7SUFDRCxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLEtBQVU7SUFFckMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQyxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7WUFDcEMsT0FBTyxZQUFZLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLENBQUE7U0FDckU7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFBO1NBQ2I7S0FDRjtTQUFNLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQ3BDLE9BQU8sSUFBSSxDQUFBO0tBQ1o7U0FBTTtRQUNMLE9BQU8sS0FBSyxDQUFBO0tBQ2I7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmltcG9ydCBDU09OID0gcmVxdWlyZSgnc2Vhc29uJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmltcG9ydCB7IGlzRmlsZVN5bmMgfSBmcm9tICcuL3V0aWwnXG5cbmZ1bmN0aW9uIGdldFVzZXJNYWNyb3NQYXRoKGF0b21Ib21lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB1c2VyTWFjcm9zUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCA9IENTT04ucmVzb2x2ZShcbiAgICBwYXRoLmpvaW4oYXRvbUhvbWUsICdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKSxcbiAgKVxuICByZXR1cm4gdXNlck1hY3Jvc1BhdGggIT0gbnVsbFxuICAgID8gdXNlck1hY3Jvc1BhdGhcbiAgICA6IHBhdGguam9pbihhdG9tSG9tZSwgJ21hcmtkb3duLXByZXZpZXctcGx1cy5jc29uJylcbn1cblxuZnVuY3Rpb24gbG9hZE1hY3Jvc0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IG9iamVjdCB7XG4gIGlmICghQ1NPTi5pc09iamVjdFBhdGgoZmlsZVBhdGgpKSByZXR1cm4ge31cblxuICBjb25zdCBtYWNyb3MgPSBDU09OLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgZnVuY3Rpb24oXG4gICAgZXJyb3I/OiBFcnJvcixcbiAgICBvYmplY3Q/OiBvYmplY3QsXG4gICkge1xuICAgIGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBFcnJvciByZWFkaW5nIExhdGV4IE1hY3JvcyBmaWxlICcke2ZpbGVQYXRofSc6ICR7XG4gICAgICAgICAgZXJyb3Iuc3RhY2sgIT09IHVuZGVmaW5lZCA/IGVycm9yLnN0YWNrIDogZXJyb3JcbiAgICAgICAgfWAsXG4gICAgICApXG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBMYXRleCBNYWNyb3MgZnJvbSAnJHtmaWxlUGF0aH0nYCwge1xuICAgICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdFxuICB9KVxuICByZXR1cm4gY2hlY2tNYWNyb3MobWFjcm9zIHx8IHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFVzZXJNYWNyb3MoYXRvbUhvbWUgPSBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSkge1xuICBjb25zdCB1c2VyTWFjcm9zUGF0aCA9IGdldFVzZXJNYWNyb3NQYXRoKGF0b21Ib21lKVxuICBpZiAoaXNGaWxlU3luYyh1c2VyTWFjcm9zUGF0aCkpIHtcbiAgICByZXR1cm4gbG9hZE1hY3Jvc0ZpbGUodXNlck1hY3Jvc1BhdGgpXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5kZWJ1ZyhcbiAgICAgICdDcmVhdGluZyBtYXJrZG93bi1wcmV2aWV3LXBsdXMuY3NvbiwgdGhpcyBpcyBhIG9uZS10aW1lIG9wZXJhdGlvbi4nLFxuICAgIClcbiAgICBjcmVhdGVNYWNyb3NUZW1wbGF0ZSh1c2VyTWFjcm9zUGF0aClcbiAgICByZXR1cm4gbG9hZE1hY3Jvc0ZpbGUodXNlck1hY3Jvc1BhdGgpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFjcm9zVGVtcGxhdGUoZmlsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCB0ZW1wbGF0ZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vYXNzZXRzL21hY3Jvcy10ZW1wbGF0ZS5jc29uJylcbiAgY29uc3QgdGVtcGxhdGVGaWxlID0gZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlUGF0aCwgJ3V0ZjgnKVxuICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCB0ZW1wbGF0ZUZpbGUpXG59XG5cbmZ1bmN0aW9uIGNoZWNrTWFjcm9zKG1hY3Jvc09iamVjdDogb2JqZWN0KSB7XG4gIGNvbnN0IG5hbWVQYXR0ZXJuID0gL15bXmEtekEtWlxcZFxcc10kfF5bYS16QS1aXSokLyAvLyBsZXR0ZXJzLCBidXQgbm8gbnVtZXJhbHMuXG4gIGNvbnN0IHJlc3VsdCA9IHt9XG4gIGZvciAoY29uc3QgbmFtZSBvZiBPYmplY3Qua2V5cyhtYWNyb3NPYmplY3QpKSB7XG4gICAgY29uc3QgdmFsdWUgPSBtYWNyb3NPYmplY3RbbmFtZV1cbiAgICBpZiAobmFtZS5tYXRjaChuYW1lUGF0dGVybikgJiYgdmFsdWVNYXRjaGVzUGF0dGVybih2YWx1ZSkpIHtcbiAgICAgIHJlc3VsdFtuYW1lXSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICBgTWFya2Rvd24tUHJldmlldy1QbHVzIGZhaWxlZCB0byBsb2FkIExhVGVYIG1hY3JvIG5hbWVkICcke25hbWV9Jy5gICtcbiAgICAgICAgICBgIFBsZWFzZSBzZWUgdGhlIFtMYVRlWCBndWlkZV0oaHR0cHM6Ly9naXRodWIuY29tL2F0b20tY29tbXVuaXR5L21hcmtkb3duLXByZXZpZXctcGx1cy9ibG9iL21hc3Rlci9kb2NzL21hdGgubWQjbWFjcm8tbmFtZXMpYCxcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB2YWx1ZU1hdGNoZXNQYXR0ZXJuKHZhbHVlOiBhbnkpIHtcbiAgLy8gRGlmZmVyZW50IGNoZWNrIGJhc2VkIG9uIHdoZXRoZXIgdmFsdWUgaXMgc3RyaW5nIG9yIGFycmF5XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGNvbnN0IG1hY3JvRGVmaW5pdGlvbiA9IHZhbHVlWzBdXG4gICAgY29uc3QgbnVtYmVyT2ZBcmdzID0gdmFsdWVbMV1cbiAgICBpZiAodHlwZW9mIG51bWJlck9mQXJncyA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiBudW1iZXJPZkFyZ3MgJSAxID09PSAwICYmIHR5cGVvZiBtYWNyb0RlZmluaXRpb24gPT09ICdzdHJpbmcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIl19