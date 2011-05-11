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
    
    /****************
     * Tabs Wrapper *
     ****************/
    fluid.registerNamespace("demo.tabsWrapper");
    
    demo.tabsWrapper.finalInit = function (that) {
        $(that.container).tabs();
    };
    
    fluid.defaults("demo.tabsWrapper", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "demo.tabsWrapper.finalInit"
    });
    
    /*************
     * linearize * 
     *************/
    fluid.registerNamespace("demo.linearize");
    
    demo.linearize.finalInit = function (that) {
        var layoutSelector = that.locate("layout");
        
        // bind event listener for layout checkbox
        that.applier.modelChanged.addListener("layouts.selection", function (newModel) {
            that.events.afterLayoutChanged.fire(newModel.layouts.selection.length);
        });
        
        // bind event listener for alignment selectbox
        that.applier.modelChanged.addListener("alignments.selection", function (newModel, oldModel) {
            that.events.afterAlignmentChanged.fire(newModel.alignments.selection, oldModel.alignments.selection);
        });
        
        that.setLayout(layoutSelector.is(":checked"));
        that.refreshView();
    };
    
    demo.linearize.preInit = function (that) {
        that.setAlignmnet = function (newAlignmnet, oldAlignmnet) {
            var styles = that.options.styles;
            var styledElm = that.locate("styled");
            
            if (oldAlignmnet) {
                styledElm.removeClass(styles[oldAlignmnet]);
            }
            
            styledElm.addClass(styles[newAlignmnet]);
            that.currentAlignmnet = newAlignmnet;
        };
        
        that.addLinearization = function () {
            that.locate("alignment").removeClass(that.options.styles.alignmentDisabled);
            that.locate("styled").addClass(that.options.styles.linear);
            that.locate("alignmentChoice").removeAttr("disabled");
            that.setAlignmnet(that.locate("alignmentChoice").val());
        };
        
        that.removeLinearization = function () {
            that.locate("alignment").addClass(that.options.styles.alignmentDisabled);
            that.locate("styled").removeClass(that.options.styles.linear);
            that.locate("alignmentChoice").attr("disabled", true);
        };
        
        that.setLayout = function (linearize) {
            that[linearize ? "addLinearization" : "removeLinearization"]();
        };
    };
    
    demo.linearize.produceTree = function (that) {
        var tree = {
            "expander": {
                "type": "fluid.renderer.selection.inputs",
                "rowID": "layout",
                "labelID": "layoutLabel",
                "inputID": "layoutInput",
                "selectID": "layout-checkbox",
                "tree": {
                    "selection": "${layouts.selection}",
                    "optionlist": "${layouts.choices}",
                    "optionnames": "${layouts.names}"
                }
            },
            alignmentChoice: {
                "selection": "${alignments.selection}",
                "optionlist": "${alignments.choices}",
                "optionnames": "${alignments.names}"
            }
        };
        
        return tree;
    };
    
    fluid.defaults("demo.linearize", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "demo.linearize.preInit",
        finalInitFunction: "demo.linearize.finalInit",
        components: {
            divider: {
                type: "demo.tabsWrapper",
                container: "{demo.linearize}.dom.sections"
            }
        },
        selectors: {
            alignment: ".democ-linearize-alignment",
            alignmentChoice: ".democ-linearize-alignmentChoice",
            layout: ".democ-linearize-layout",
            layoutInput: ".democ-linearize-layoutInput",
            layoutLabel: ".democ-linearize-layoutLabel",
            styled: ".democ-linearize-styled",
            sections: ".democ-linearize-sections"
        },
        selectorsToIgnore: ["alignment", "styled", "sections"],
        repeatingSelectors: ["layout"],
        styles: {
            alignmentDisabled: "demo-linearize-alignmentDisabled",
            linear: "fl-layout-linear",
            left: "",
            centre: "fl-layout-align-center",
            right: "fl-layout-align-right"
        },
        events: {
            afterAlignmentChanged: null,
            afterLayoutChanged: null
        },
        listeners: {
            afterAlignmentChanged: "{demo.linearize}.setAlignmnet",
            afterLayoutChanged: "{demo.linearize}.setLayout"
        }, 
        model: {
            layouts: {
                selection: [],
                choices: ["linearize"],
                names: ["linearize"]
            },
            alignments: {
                selection: "left",
                choices: ["left", "centre", "right"],
                names: ["left", "centre", "right"]
            }
        },
        produceTree: "demo.linearize.produceTree"
    });
})(jQuery);