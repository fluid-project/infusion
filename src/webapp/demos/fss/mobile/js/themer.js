/*global fluid, jQuery, window*/

var fluid = fluid || {};

(function ($, fluid) {

	/***************************************/
	fluid.themer = function (container, options) {
		var that = fluid.initView("fluid.themer", container, options);
		var themeStyles = that.options.styles.themes;
		var themeSelectors = that.options.selectors.themes;		
		that.currentTheme = that.options.startupTheme;		
		
		var switchThemes = function () {
			setTheme(that.currentTheme);
			hilightTheme(that.currentTheme);
		}
		
		// match the theme to the selector
		var getTheme = function (el) {
			var theme = false;
			$.each(themeSelectors, function (t, s) {
				if (el.is(s)) {					
					theme = t;
					return false;
				}
			});
			return theme;
		};
		
		// set the theme class name onto an element
		var setTheme = function (theme) {
			that.locate("themeDestination", $(document)).removeClass().addClass(themeStyles[theme]);
		};
		
		// hilight the element clicked
		var hilightTheme = function (theme) {
			var sels = that.options.selectors;
			var className = that.options.styles.activeEl;
			
			$(sels.activeEl).removeClass(className);
			$(sels.themes[theme]).closest(sels.activeEl).addClass(className);
		};

		///////////////		SETUP		/////////////////////////////////////
		var init = (function () {
			// add a click delegate to the container
			that.locate(container).bind("click", function (e) {
				var el = $(e.target);
				that.currentTheme = getTheme(el);
				switchThemes();
			});
			// first time automatic theming
			switchThemes();
		}());
		
	};

	fluid.defaults("fluid.themer", {
		startupTheme : "iphone",
        selectors: {
			themeDestination: "body",
			activeEl: "li",
			themes : {
				iphone: "[href=#iphone]",
				android: "[href=#android]",
				noTheme: "[href=#none]"
			}
        },
        styles: {
            activeEl: "fl-tabs-active",
			themes: {
				iphone: "fl-theme-iphone",
				android: "fl-theme-android",
				noTheme: "noTheme"
			}
        }
    });
	/***************************************/

})(jQuery, fluid);