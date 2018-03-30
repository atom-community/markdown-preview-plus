"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathJaxStub = {
    jaxConfigure(userMacros, renderer) {
        MathJax.Hub.Config({
            jax: ['input/TeX', `output/${renderer}`],
            extensions: [],
            TeX: {
                extensions: [
                    'AMSmath.js',
                    'AMSsymbols.js',
                    'noErrors.js',
                    'noUndefined.js',
                ],
                Macros: userMacros,
            },
            'HTML-CSS': {
                availableFonts: [],
                webFont: 'TeX',
            },
            messageStyle: 'none',
            showMathMenu: false,
            skipStartupTypeset: true,
        });
        MathJax.Hub.Configured();
    },
    async queueTypeset(domElements) {
        domElements.forEach((elem) => {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, elem]);
        });
        return new Promise((resolve) => {
            MathJax.Hub.Queue([resolve]);
        });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aGpheC1zdHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjLWNsaWVudC9tYXRoamF4LXN0dWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBYSxRQUFBLFdBQVcsR0FBRztJQUN6QixZQUFZLENBQUMsVUFBa0IsRUFBRSxRQUF5QjtRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUNqQixHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxRQUFRLEVBQUUsQ0FBQztZQUN4QyxVQUFVLEVBQUUsRUFBRTtZQUNkLEdBQUcsRUFBRTtnQkFDSCxVQUFVLEVBQUU7b0JBQ1YsWUFBWTtvQkFDWixlQUFlO29CQUNmLGFBQWE7b0JBQ2IsZ0JBQWdCO2lCQUNqQjtnQkFDRCxNQUFNLEVBQUUsVUFBVTthQUNuQjtZQUNELFVBQVUsRUFBRTtnQkFDVixjQUFjLEVBQUUsRUFBRTtnQkFDbEIsT0FBTyxFQUFFLEtBQUs7YUFDZjtZQUNELFlBQVksRUFBRSxNQUFNO1lBQ3BCLFlBQVksRUFBRSxLQUFLO1lBQ25CLGtCQUFrQixFQUFFLElBQUk7U0FDekIsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUMxQixDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFtQjtRQUNwQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ25ELENBQUMsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBQzlCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgbWF0aEpheFN0dWIgPSB7XG4gIGpheENvbmZpZ3VyZSh1c2VyTWFjcm9zOiBvYmplY3QsIHJlbmRlcmVyOiBNYXRoSmF4UmVuZGVyZXIpIHtcbiAgICBNYXRoSmF4Lkh1Yi5Db25maWcoe1xuICAgICAgamF4OiBbJ2lucHV0L1RlWCcsIGBvdXRwdXQvJHtyZW5kZXJlcn1gXSxcbiAgICAgIGV4dGVuc2lvbnM6IFtdLFxuICAgICAgVGVYOiB7XG4gICAgICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgICAgICAnQU1TbWF0aC5qcycsXG4gICAgICAgICAgJ0FNU3N5bWJvbHMuanMnLFxuICAgICAgICAgICdub0Vycm9ycy5qcycsXG4gICAgICAgICAgJ25vVW5kZWZpbmVkLmpzJyxcbiAgICAgICAgXSxcbiAgICAgICAgTWFjcm9zOiB1c2VyTWFjcm9zLFxuICAgICAgfSxcbiAgICAgICdIVE1MLUNTUyc6IHtcbiAgICAgICAgYXZhaWxhYmxlRm9udHM6IFtdLFxuICAgICAgICB3ZWJGb250OiAnVGVYJyxcbiAgICAgIH0sXG4gICAgICBtZXNzYWdlU3R5bGU6ICdub25lJyxcbiAgICAgIHNob3dNYXRoTWVudTogZmFsc2UsXG4gICAgICBza2lwU3RhcnR1cFR5cGVzZXQ6IHRydWUsXG4gICAgfSlcbiAgICBNYXRoSmF4Lkh1Yi5Db25maWd1cmVkKClcbiAgfSxcblxuICBhc3luYyBxdWV1ZVR5cGVzZXQoZG9tRWxlbWVudHM6IE5vZGVbXSkge1xuICAgIGRvbUVsZW1lbnRzLmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgIE1hdGhKYXguSHViLlF1ZXVlKFsnVHlwZXNldCcsIE1hdGhKYXguSHViLCBlbGVtXSlcbiAgICB9KVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgTWF0aEpheC5IdWIuUXVldWUoW3Jlc29sdmVdKVxuICAgIH0pXG4gIH0sXG59XG5cbmV4cG9ydCB0eXBlIE1hdGhKYXhTdHViID0gdHlwZW9mIG1hdGhKYXhTdHViXG4iXX0=