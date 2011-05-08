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
        layoutSelector.change(function (e) {
            that.events.afterLayoutChanged.fire(e.target.checked);
        });
        
        // bind event listener for alignment selectbox
        that.locate("alignmentChoice").change(function (e) {
            that.events.afterAlignmentChanged.fire($(e.target).val(), that.currentAlignmnet);
        });
        
        that.setLayout(layoutSelector.is(":checked"));
    };
    
    demo.linearize.preInit = function (that) {
        that.setAlignmnet = function (newAlignmnet, oldAlignmnet) {
            var styledElm = that.locate("styled");
            if (oldAlignmnet) {
                styledElm.removeClass(oldAlignmnet);
            }
            
            styledElm.addClass(newAlignmnet);
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
    
    fluid.defaults("demo.linearize", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
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
            layout: ".democ-linearize-layoutLabel",
            styled: "#container",
            sections: "#tabs"
        },
        styles: {
            alignmentDisabled: "demo-linearize-alignmentDisabled",
            linear: "fl-layout-linear"
        },
        events: {
            afterAlignmentChanged: null,
            afterLayoutChanged: null
        },
        listeners: {
            afterAlignmentChanged: "{demo.linearize}.setAlignmnet",
            afterLayoutChanged: "{demo.linearize}.setLayout"
        }
    });
})(jQuery);