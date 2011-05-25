/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

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
            afterPanelHidden: null,
            afterPanelShown: null
        },
        finalInitFunction: "fluid.slidingPanel.finalInit",
        invokers: {
            hide: "fluid.slidingPanel.slideUp",
            show: "fluid.slidingPanel.slideDown"
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
            that.locate("toggleButton").text(that.options.strings.hideText);        
            that.show(that.locate("panel"), that.events.afterPanelShown.fire);  
        };  
    
        that.hidePanel = function () {
            that.locate("toggleButton").text(that.options.strings.showText);        
            that.hide(that.locate("panel"), that.events.afterPanelHidden.fire);
        };      
        
        that.togglePanel = function () {
            if (that.locate("panel").is(":hidden")) {                                       
                that.showPanel();
            } else {
                that.hidePanel();             
            }       
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
