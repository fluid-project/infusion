/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};

(function ($) {
    fluid.registerNamespace("demo.cssFixApplier");
    
    demo.cssFixApplier.preInit = function (that) {
        var opts = that.options;
        
        that.setFixDescription = function (fix) {
            that.locate("fixDescription").text(opts.strings[fix] || "");
        };
        
        that.addFixStyle = function (fix) {
            that.locate("fixContainer").addClass(opts.styles[fix]);
        };
        
        that.removeFixStyles = function (fix) {
            var styles = [];
            fluid.each(opts.styles, function (style) {
                styles.push(style);
            });
            that.locate("fixContainer").removeClass(styles.join(" "));
        };
        
        that.setFix = function (fix) {
            that.removeFixStyles(fix);
            that.addFixStyle(fix);
            that.setFixDescription(fix);
        };
    };
    
    demo.cssFixApplier.finalInit = function (that) {
        // bind event listener for fix selectbox
        that.applier.modelChanged.addListener("selection", function (newModel, oldModel) {
            that.events.afterFixSelectionChanged.fire(newModel.selection, oldModel.selection);
        });
        
        that.setFix(that.model.selection);
    };
    
    demo.cssFixApplier.produceTree = function (that) {
        var tree = {
            fixChoice: {
                "selection": "${selection}",
                "optionlist": "${choices}",
                "optionnames": "${names}"
            },
            fixLabel: {
                messagekey: "fixLabel"
            }
        };
        
        return tree;
    };
    
    fluid.defaults("demo.cssFixApplier", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "demo.cssFixApplier.preInit",
        finalInitFunction: "demo.cssFixApplier.finalInit",
        produceTree: "demo.cssFixApplier.produceTree",
        components: {
            tabs: {
                type: "fluid.tabs",
                container: "{demo.cssFixApplier}.container"
            }          
        },        
        selectors: {
            fixLabel: ".democ-cssFix-fixLabel",
            fixChoice: ".democ-cssFix-fixChoice",
            fixContainer: ".democ-cssFix-fixContainer",
            fixDescription: ".democ-cssFix-fixDescription"
        },
        selectorsToIgnore: ["fixContainer", "fixDescription"],
        styles: {
            "fl-fix": "fl-fix",
            "fl-clearfix": "fl-clearfix"
        },
        strings: {
            fixLabel: "CSS Fixes:",
            "fl-fix": "FSS: .fl-fix",
            "fl-clearfix": "FSS: .fl-clearfix",
            "none": "No Fix Applied"
        },
        events: {
            afterFixSelectionChanged: null
        },
        listeners: {
            afterFixSelectionChanged: "{demo.cssFixApplier}.setFix"
        },
        model: {
            selection: "none",
            choices: ["none", "fl-fix", "fl-clearfix"],
            names: ["none", "fl-fix", "fl-clearfix"]
        },
        renderOnInit: true
    });
})(jQuery);