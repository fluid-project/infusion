/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid = fluid || {};
fluid.build = fluid.build || {};

(function () {
        
    var prioritiesForRule = function (prioritySpec, rule) {
        var priorities = prioritySpec["fluid-cssGenerator-allRules"] || [];
        var prioritiesForRule = prioritySpec[rule.selectorText()];
        if (prioritiesForRule) {
            priorities = priorities.concat(prioritiesForRule);
        }
        return priorities;
    };
    
    var setupCSSGenerator = function (that) {
        // Concatenate an empty string with the file contents to ensure 
        // that we are passing in a Javascript string rather than a Java string
        that.cssText = "" + that.options.sheetStore.load();
        that.parser = new CSSParser();
        that.stylesheet = that.parser.parse(that.cssText, false, true);
    };
        
    fluid.build.cssGenerator = function (options) {        
        var that = {
            options: options
        };
        
        that.processRules = function (ops) {
            if (!ops) {
                return;
            }
            
            if (typeof (ops.length) !== "number") {
                ops = [ops];
            }
            
            // Bail right away if we have no rules or ops to process.
            if (!that.stylesheet.cssRules || that.stylesheet.cssRules.length < 1 || ops.length < 1) {
                return;
            }

            for (var i = 0; i < that.stylesheet.cssRules.length; i++) {
                var rule = that.stylesheet.cssRules[i];
                
                for (var j = 0; j < ops.length; j++) {
                    var opSpec = ops[j],
                        fn = opSpec.type,
                        options = opSpec.options;
                    fn.apply(null, [rule, options]);
                }
            }
        };
        
        that.prioritize = function (prioritySpec) {
            that.processRules({
                type: fluid.build.cssGenerator.prioritize,
                options: prioritySpec
            });
        };
        
        that.generate = function () {
            return that.stylesheet.cssText();
        };

        setupCSSGenerator(that);
        return that;
    };
    
    fluid.build.cssGenerator.expandRuleSpec = function (spec) {
        for (var selector in spec) {
            var priorities = spec[selector];
            spec[selector] = typeof (priorities) === "string" ? [priorities] : priorities;
        }
    };
    
    fluid.build.cssGenerator.prioritize = function (rule, prioritySpec) {
        fluid.build.cssGenerator.expandRuleSpec(prioritySpec);
        
        // If this rule doesn't have any declarations or priorities, keep on trucking.
        if (!rule.declarations || rule.declarations.length < 1) {
            return;
        }
        
        var priorities = prioritiesForRule(prioritySpec, rule);
        if (!priorities || priorities.length < 1) {
            return;
        }
        
        // Whip through each declaration's properties and see if they match one of our priorities.
        for (var i = 0; i < rule.declarations.length; i++) {
            var declaration = rule.declarations[i];
            for (var j = 0; j < priorities.length; j++) {
                var property = priorities[j];
                if (declaration.property === property) {
                    declaration.priority = true; // Prioritize this declaration as !important.
                }
            }
        }
    };
    
    fluid.build.cssGenerator.rewriteSelector = function (rule, options) {
        if (!rule.mSelectorText) {
            return;
        }
        rule.mSelectorText = rule.mSelectorText.replace(options.match, options.replace, "g");
    };
    
    fluid.build.cssGenerator.modifyValue = function (rule, modifyFunc) {
        if (!rule.declarations) {
            return;
        }

        for (var i = 0; i < rule.declarations.length; i++) {
            var values = rule.declarations[i].values;
            if (!values) {
                break;
            }
            for (var j = 0; j < values.length; j++) {
                modifyFunc(values[j]);
            }
        }
    };

    fluid.build.cssGenerator.rewriteRelativeUrls = function (rule, options) {
        fluid.build.cssGenerator.modifyValue(rule, 
            function (value) {
                if (value.url && value.url.indexOf("://") < 0) {
                    value.url = options.prefix + value.url;
                }
            });
    };
})();
