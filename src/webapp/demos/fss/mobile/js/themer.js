/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, fluid:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid = fluid || {};

(function ($, fluid) {

    var setupThemer = function (that) {
        // add a click delegate to the container
        that.container.bind("click", function (e) {
            var el = $(e.target);
            that.currentTheme = that.getTheme(el);
            that.switchThemes();
        });
        // first time automatic theming
        that.switchThemes();
    };
    
    /***************************************/
    fluid.themer = function (container, options) {
        var that = fluid.initView("fluid.themer", container, options);
        var themeStyles = that.options.styles.themes;
        var themeSelectors = that.options.selectors.themes;
        that.currentTheme = that.options.startupTheme;


        // hilight the element clicked
        var hilightTheme = function (theme) {
            var sels = that.options.selectors;
            var className = that.options.styles.activeEl;

            $(sels.activeEl).removeClass(className);
            $(sels.themes[theme]).closest(sels.activeEl).addClass(className);
        };

        that.switchThemes = function () {
            that.setTheme(that.currentTheme);
            hilightTheme(that.currentTheme);
        };

        // match the theme to the selector
        that.getTheme = function (el) {
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
        that.setTheme = function (theme) {
            that.locate("themeDestination", $(document)).removeClass().addClass(themeStyles[theme]);
        };
        
        setupThemer(that);
        return that;

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