/*
Copyright 2007-2010 University of Cambridge
Copyright 2007-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/** This file contains functions which depend on the presence of a DOM document
 *  and which depend on the contents of Fluid.js **/

// Declare dependencies.
/*global jQuery*/

var fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {

    fluid.defaults("fluid.ariaLabeller", {
        labelAttribute: "aria-labelledby",
        labelMarkup: "<span style='display: none'></span>",
        invokers: {
            generateLabelId: {funcName: "fluid.ariaLabeller.generateLabelId", args: ["{ariaLabeller}", "@0"]},
            getLabelElement: {funcName: "fluid.ariaLabeller.getLabelElement", args: ["{ariaLabeller}", "@0"]},
            generateLabelElement: {funcName: "fluid.ariaLabeller.generateLabelElement", args: ["{ariaLabeller}", "@0"]}
        }
    });
 
    fluid.ariaLabeller = function(element, options) {
        var that = fluid.initView("fluid.ariaLabeller", element, options);
        fluid.initDependents(that);
        that.freshLabel = true;

        that.update = function(newOptions) {
            newOptions = newOptions || that.options;
            var element = that.getLabelElement(true);
            if (!that.alreadyLabelled) {
                element.text(newOptions.text);
            }
         // various failed attempts here to achieve dynamic updates
         //    that.container.attr("role", "slider");
            //that.container.attr("aria-valuemin", 0);
            //that.container.attr("aria-valuemax", 1000);
            //window.setTimeout(function() {
         //      that.container.attr("aria-valuenow", fluid.allocateGuid());
         //      that.container.attr("aria-valuetext", newOptions.text);
         //    that.container.attr("title", newOptions.text);
         //   }, 1500);
        }
        that.update();
        that.freshLabel = false;
        return that;
    };
    
    fluid.ariaLabeller.generateLabelId = function(that, baseId) {
        return that.typeName + "-" + baseId; // + "-" + fluid.allocateGuid();
    };
    
    fluid.ariaLabeller.generateLabelElement = function(that, labelId) {
        var labEl = $(that.options.labelMarkup);
        labEl.attr("id", labelId);
        that.container.append(labEl);
         //$("body").append(labEl);
        return labEl;
    };
    
    fluid.ariaLabeller.getLabelElement = function(that, rebind) {
        var labelId = that.container.attr(that.options.labelAttribute);
        if (labelId && that.freshLabel) {
            that.alreadyLabelled = true;
        }
        if (!labelId) {
            var ourId = fluid.allocateSimpleId(that.container);
            labelId = that.generateLabelId(ourId);
            that.container.attr(that.options.labelAttribute, labelId);
        }
      /*  else if (rebind) {
            fluid.log("rebinding target");
            that.container.attr(that.options.labelAttribute, "");
            window.setTimeout(function() {
                that.container.attr(that.options.labelAttribute, labelId);
            }, 1000);
        }*/
        var labEl = fluid.jById(labelId);
        if (labEl.length === 0) {
            labEl = that.generateLabelElement(labelId);
        }
        return labEl;
    };
    
    var LABEL_KEY = "aria-labelling";
    
    fluid.getAriaLabeller = function(element) {
        element = $(element);
        var that = fluid.getScopedData(element, LABEL_KEY);
        return that;      
    };
    
    fluid.updateAriaLabel = function(element, text, options) {
        fluid.log("updateLabel: " + fluid.allocateSimpleId(element) + ": " + text);
        var options = $.extend({}, options || {}, {text: text});
        var that = fluid.getAriaLabeller(element);
        if (!that) {
            that = fluid.ariaLabeller(element, options);
            fluid.setScopedData(element, LABEL_KEY, that);
        }
        else that.update(options);
        return that;
    };
    
})(jQuery, fluid_1_2);
