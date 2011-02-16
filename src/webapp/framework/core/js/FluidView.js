/*
Copyright 2010 Lucendo Development Ltd.

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

var fluid_1_3 = fluid_1_3 || {};

(function ($, fluid) {

    fluid.defaults("fluid.ariaLabeller", {
        labelAttribute: "aria-label",
        liveRegionMarkup: "<div class=\"liveRegion fl-offScreen-hidden\" aria-live=\"polite\"></div>",
        liveRegionId: "fluid-ariaLabeller-liveRegion",
        invokers: {
            generateLiveElement: {funcName: "fluid.ariaLabeller.generateLiveElement", args: ["{ariaLabeller}"]}
        }
    });
 
    fluid.ariaLabeller = function (element, options) {
        var that = fluid.initView("fluid.ariaLabeller", element, options);
        fluid.initDependents(that);

        that.update = function (newOptions) {
            newOptions = newOptions || that.options;
            that.container.attr(that.options.labelAttribute, newOptions.text);
            if (newOptions.dynamicLabel) {
                var live = fluid.jById(that.options.liveRegionId); 
                if (live.length === 0) {
                    live = that.generateLiveElement();
                }
                live.text(newOptions.text);
            }
        };
        
        that.update();
        return that;
    };
    
    fluid.ariaLabeller.generateLiveElement = function (that) {
        var liveEl = $(that.options.liveRegionMarkup);
        liveEl.attr("id", that.options.liveRegionId);
        $("body").append(liveEl);
        return liveEl;
    };
    
    var LABEL_KEY = "aria-labelling";
    
    fluid.getAriaLabeller = function (element) {
        element = $(element);
        var that = fluid.getScopedData(element, LABEL_KEY);
        return that;      
    };
    
    /** Manages an ARIA-mediated label attached to a given DOM element. An
     * aria-labelledby attribute and target node is fabricated in the document
     * if they do not exist already, and a "little component" is returned exposing a method
     * "update" that allows the text to be updated. */
    
    fluid.updateAriaLabel = function (element, text, options) {
        options = $.extend({}, options || {}, {text: text});
        var that = fluid.getAriaLabeller(element);
        if (!that) {
            that = fluid.ariaLabeller(element, options);
            fluid.setScopedData(element, LABEL_KEY, that);
        } else {
            that.update(options);
        }
        return that;
    };
    
    /** Sets an interation on a target control, which morally manages a "blur" for
     * a possibly composite region.
     * A timed blur listener is set on the control, which waits for a short period of
     * time (options.delay, defaults to 150ms) to discover whether the reason for the 
     * blur interaction is that either a focus or click is being serviced on a nominated
     * set of "exclusions" (options.exclusions, a free hash of elements or jQueries). 
     * If no such event is received within the window, options.handler will be called
     * with the argument "control", to service whatever interaction is required of the
     * blur.
     */
    
    fluid.deadMansBlur = function (control, options) {
        var that = fluid.initLittleComponent("fluid.deadMansBlur", options);
        that.blurPending = false;
        that.lastCancel = 0;
        $(control).bind("focusout", function (event) {
            fluid.log("Starting blur timer for element " + fluid.dumpEl(event.target));
            var now = new Date().getTime();
            fluid.log("back delay: " + (now - that.lastCancel));
            if (now - that.lastCancel > that.options.backDelay) {
                that.blurPending = true;
            }
            setTimeout(function () {
                if (that.blurPending) {
                    that.options.handler(control);
                }
            }, that.options.delay);
        });
        that.canceller = function (event) {
            fluid.log("Cancellation through " + event.type + " on " + fluid.dumpEl(event.target)); 
            that.lastCancel = new Date().getTime();
            that.blurPending = false;
        };
        fluid.each(that.options.exclusions, function (exclusion) {
            exclusion = $(exclusion);
            fluid.each(exclusion, function (excludeEl) {
                $(excludeEl).bind("focusin", that.canceller).
                    bind("fluid-focus", that.canceller).
                    click(that.canceller);
            });
        });
        return that;
    };

    fluid.defaults("fluid.deadMansBlur", {
        delay: 150,
        backDelay: 100
    });
    
    /**
     * Simple component cover for the jQuery scrollTo plugin. Provides roughly equivalent
     * functionality to Uploader's old Scroller plugin.
     *
     * @param {jQueryable} element the element to make scrollable
     * @param {Object} options for the component
     * @return the scrollable component
     */
    fluid.scrollable = function (element, options) {
        var that = fluid.initLittleComponent("fluid.scrollable", options);
        element = fluid.container(element);
        that.scrollable = that.options.makeScrollableFn(element, that.options);
        if (that.options.css) {
            that.scrollable.css(that.options.css);
        }
        that.maxHeight = that.scrollable.css("max-height");
                
        /**
         * Programmatically scrolls this scrollable element to the region specified.
         * This method is directly compatible with the underlying jQuery.scrollTo plugin.
         */
        that.scrollTo = function () {
            that.scrollable.scrollTo.apply(that.scrollable, arguments);
        };

        /* 
         * Updates the view of the scrollable region. This should be called when the content of the scrollable region is changed. 
         */
        that.refreshView = function () {
            if ($.browser.msie && $.browser.version === "6.0") {    
                that.scrollable.css("height", "");
                
                // Set height, if max-height is reached, to allow scrolling in IE6.
                if (that.scrollable.height() >= parseInt(that.maxHeight, 10)) {
                    that.scrollable.css("height", that.maxHeight);           
                }
            }
        };          
        
        that.refreshView();
                
        return that;
    };
    
    fluid.scrollable.makeSimple = function (element, options) {
        return fluid.container(element);
    };
    
    fluid.scrollable.makeTable =  function (table, options) {
        table.wrap(options.wrapperMarkup);
        return table.parent();
    };
    
    fluid.defaults("fluid.scrollable", {
        makeScrollableFn: fluid.scrollable.makeSimple
    });
    
    /** 
     * Wraps a table in order to make it scrollable with the jQuery.scrollTo plugin.
     * Container divs are injected to allow cross-browser support. 
     *
     * @param {jQueryable} table the table to make scrollable
     * @param {Object} options configuration options
     * @return the scrollable component
     */
    fluid.scrollableTable = function (table, options) {
        options = $.extend({}, fluid.defaults("fluid.scrollableTable"), options);
        return fluid.scrollable(table, options);
    };
    
    fluid.defaults("fluid.scrollableTable", {
        makeScrollableFn: fluid.scrollable.makeTable,
        wrapperMarkup: "<div class='fl-table-scrollable-container'><div class='fl-table-scrollable-scroller'></div></div>"
    });  
    
})(jQuery, fluid_1_3);
