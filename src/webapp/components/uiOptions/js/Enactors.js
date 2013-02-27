/*
Copyright 2013 OCAD University

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

    fluid.defaults("fluid.uiOptions.actionAnts", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    /*******************************************************************************
     * Adds or removes the classname to/from the elements based upon the setting.
     * The grade component used by emphasizeLinksEnactor and inputsLargerEnactor
     *******************************************************************************/
    fluid.defaults("fluid.uiOptions.styleElements", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        setting: false,
        cssClass: null,
        invokers: {
            getElements: {}
        },
    });
    
    fluid.uiOptions.styleElements.finalInit = function (that) {
        if (typeof that.getElements !== 'function') return;
        
        var elements = that.getElements();
        
        if (that.options.setting) {
            elements.addClass(that.options.cssClass);
        } else {
            $("." + that.options.cssClass, elements).andSelf().removeClass(that.options.cssClass);
        }        
    };

    /*******************************************************************************
     * The enactor to emphasize links in the container according to the setting
     *******************************************************************************/
    fluid.defaults("fluid.uiOptions.actionAnts.emphasizeLinksEnactor", {
        gradeNames: ["fluid.uiOptions.styleElements", "autoInit"],
        container: null,
        setting: false,
        cssClass: "fl-link-enhanced",
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.actionAnts.getLinks",
                args: ["{that}.options.container"]
            }
        }
    });
    
    fluid.uiOptions.actionAnts.getLinks = function (container) {
        return $("a", container);
    };
    
    /*******************************************************************************
     * The enactor to enlarge inputs in the container according to the setting
     *******************************************************************************/
    fluid.defaults("fluid.uiOptions.actionAnts.inputsLargerEnactor", {
        gradeNames: ["fluid.uiOptions.styleElements", "autoInit"],
        container: null,
        setting: false,
        cssClass: "fl-text-larger",
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.actionAnts.getInputs",
                args: ["{that}.options.container"]
            }
        }
    });
    
    fluid.uiOptions.actionAnts.getInputs = function (container) {
        return $("input, button", container);
    };
    
})(jQuery, fluid_1_5);
