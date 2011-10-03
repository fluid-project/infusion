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
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

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
        hideByDefault: true
    });
    
    fluid.slidingPanel.slideUp = function (element, callback, duration) {
        $(element).slideUp(duration || "400", callback);
    };
    
    fluid.slidingPanel.slideDown = function (element, callback, duration) {
        $(element).slideDown(duration || "400", callback);
    };
    
    fluid.slidingPanel.finalInit = function (that) {
        that.showPanel = function () {
            that.events.onPanelShow.fire(that);
            that.locate("toggleButton").text(that.options.strings.hideText);        
            that.operateShow(that.locate("panel"), that.events.afterPanelShow.fire);  
        };  
    
        that.hidePanel = function () {
            that.events.onPanelHide.fire(that);
            that.locate("toggleButton").text(that.options.strings.showText);        
            that.operateHide(that.locate("panel"), that.events.afterPanelHide.fire);
        };      
        
        that.togglePanel = function () {
            if (that.locate("panel").is(":hidden")) {                                       
                that.showPanel();
            } else {
                that.hidePanel();             
            }       
        };
        
        that.setPanelHeight = function (newHeight) {
            that.locate("panel").height(newHeight);
        };
    
        //Event binder
        that.locate("toggleButton").click(that.togglePanel);        
            
        //Start Up: hide panel
        if (that.options.hideByDefault) {
            //TODO: figure out how to remove duplicate code
            that.locate("toggleButton").text(that.options.strings.showText);        
            that.locate("panel").hide();
        }
    };    

})(jQuery, fluid_1_4);
