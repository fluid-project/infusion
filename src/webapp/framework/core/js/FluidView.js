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
            generateLabelId: "fluid.ariaLabeller.generateLabelId",
            getLabelElement: "fluid.ariaLabeller.getLabelElement",
            generateLabelElement: "fluid.ariaLabeller.generateLabelElement"
        }
    });
 
    fluid.ariaLabeller = function(element, options) {
        var that = fluid.initView("fluid.ariaLabeller", element, options);
        fluid.initDependents(that);

        that.update = function(newOptions) {
            newOptions = newOptions || that.options;
            var element = that.getLabelElement(that);
            element.text(newOptions.text);
        }
        that.update();
    };
    
    fluid.ariaLabeller.generateLabelId = function(that, baseId) {
        return that.typeName + "-" + baseId;
    };
    
    fluid.ariaLabeller.generateLabelElement = function(that, labelId) {
        var labEl = $(that.options.labelMarkup);
        labEl.attr("id", labelId);
         $("body").append(labEl);
        return labEl;
    };
    
    fluid.ariaLabeller.getLabelElement = function(that) {
        var labelId = that.container.attr(that.options.labelAttribute);
        if (!labelId) {
            var ourId = fluid.allocateSimpleId(that.container);
            labelId = that.generateLabelId(that, ourId);
            that.container.attr(that.options.labelAttribute, labelId);
        }
        var labEl = fluid.byId(labelId);
        if (!labEl) {
            labEl = that.generateLabelElement(that, labelId);
        }
        return labEl;
    };
    
    var LABEL_KEY = "aria-labelling";
    
    fluid.updateAriaLabel = function(element, text, options) {
        var options = $.extend({}, options || {}, {text: text});
        element = $(element);
        var that = fluid.getScopedData(element, LABEL_KEY);
        if (!that) {
            that = fluid.ariaLabeller(element, options);
            fluid.setScopedData(element, LABEL_KEY);
        }
        else that.update(options);
        return that;
    };
    
})(jQuery, fluid_1_2);
