/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    /**********************
     * Sliding Panel *
     *********************/
     
    fluid.defaults("fluid.slidingPanel", {
        gradeNames: ["fluid.viewComponent", "autoInit"],             
        selectors: {
            panel: ".flc-slidingPanel-panel",
            toggleButton: ".flc-slidingPanel-toggleButton"
        },
        strings: {
            showText: "+ Show Display Preferences",
            hideText: "- Hide"
        },          
        events: {
            onPanelHide: null,
            onPanelShow: null,
            afterPanelHide: null,
            afterPanelShow: null
        },
        finalInitFunction: "fluid.slidingPanel.finalInit",
        invokers: {
            operateHide: "fluid.slidingPanel.slideUp",
            operateShow: "fluid.slidingPanel.slideDown"
        },
        model: {
            isShowing: false
        },
        methods: {
            showPanel: {
                finalState: true,
                name: "Show"
            },
            hidePanel: {
                finalState: false,
                name: "Hide"
            }
        }
    });
    
    fluid.slidingPanel.slideUp = function (element, callback, duration) {
        $(element).slideUp(duration || "400", callback);
    };
    
    fluid.slidingPanel.slideDown = function (element, callback, duration) {
        $(element).slideDown(duration || "400", callback);
    };
    
    fluid.slidingPanel.finalInit = function (that) {
        fluid.each(that.options.methods, function (method, methodName) {
            that[methodName] = function () {
                that.events["onPanel" + method.name].fire(that);
                that.applier.requestChange("isShowing", method.finalState);
                that.refreshView();
                that["operate" + method.name](that.locate("panel"), that.events["afterPanel" + method.name].fire);
            };
        });
        
        that.togglePanel = function () {
            that[that.model.isShowing ? "hidePanel" : "showPanel"]();
        };
        
        that.setPanelHeight = function (newHeight) {
            that.locate("panel").height(newHeight);
        };
        
        that.refreshView = function () {
            that.locate("toggleButton").text(that.options.strings[that.model.isShowing ? "hideText" : "showText"]);         
        };
    
        that.locate("toggleButton").click(that.togglePanel);        
        
        that.refreshView();
    };    

})(jQuery, fluid_1_5);
