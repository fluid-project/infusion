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
     * Tabs *
     *********************/
     
    fluid.defaults("fluid.tabs", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        tabOptions: {},
        events: { 
            // These events are forwarded out of the jQueryUI Tabs' equivalents
            // with signature (that, event, ui)
            tabsselect: "preventable",
            tabsload: null,
            tabsshow: null  
        },
        finalInitFunction: "fluid.tabs.finalInit"
    });          
    
    fluid.tabs.finalInit = function (that) {
        that.container.tabs(that.options.tabOptions);  //jQuery UI Tabs
        fluid.each(that.options.events, function(value, eventName) {
            that.container.bind(eventName, function(event, ui) {
                return that.events[eventName].fire(that, event, ui);
            });
        });
    };

})(jQuery, fluid_1_4);
