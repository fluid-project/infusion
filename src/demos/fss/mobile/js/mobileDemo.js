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
    fluid.registerNamespace("fluid.themer");

    fluid.themer.setupThemer = function (that) {
        // add a click delegate to the container
        that.container.bind("click", function (e) {
            var el = $(e.target);
            that.currentTheme = that.getTheme(el);
            that.switchThemes();
        });
        // first time automatic theming
        that.switchThemes();
    };
    
    fluid.themer.switchThemes = function (that) {
        that.setTheme(that.currentTheme);
        that.highlightTheme(that.currentTheme);
    };
    
    fluid.themer.highlightTheme = function (that, theme) {
        var sels = that.options.selectors;
        var className = that.options.styles.activeEl;

        $(sels.activeEl).removeClass(className);
        $(sels.themes[theme]).closest(sels.activeEl).addClass(className);
    };
    
    fluid.themer.getTheme = function (themeSelectors, el) {
        var theme = false;
        $.each(themeSelectors, function (t, s) {
            if (el.is(s)) {
                theme = t;
                return false;
            }
        });
        return theme;
    };
    
    fluid.themer.setTheme = function (that, theme) {
        var themeStyles = that.options.styles.themes;
        that.locate("themeDestination", $(document)).removeClass().addClass(themeStyles[theme]);
    };

    fluid.defaults("fluid.themer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        startupTheme: "iphone",
        members: {
            currentTheme: "{that}.options.startupTheme"  
        },
        listeners: {
            onCreate: [{
                funcName: "fluid.themer.setupThemer",
                args: "{that}"
            }] 
        },
        invokers: {
            switchThemes: {
                funcName: "fluid.themer.switchThemes",
                args: "{that}"
            },
            // hilight the element clicked
            highlightTheme: {
                funcName: "fluid.themer.highlightTheme",
                args: ["{that}", "{arguments}.0"] // theme
            },
            // match the theme to the selector
            getTheme: {
                funcName: "fluid.themer.getTheme",
                args: ["{that}.options.selectors.themes", "{arguments}.0"]
            },
            // set the theme class name onto an element
            setTheme: {
                funcName: "fluid.themer.setTheme",
                args: ["{that}", "{arguments}.0"] // theme
            },            
        },
        selectors: {
            themeDestination: "body",
            activeEl: "li",
            themes: {
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