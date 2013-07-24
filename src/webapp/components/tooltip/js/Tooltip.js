/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    fluid.registerNamespace("fluid.tooltip");
    
    fluid.tooltip.createContentFunc = function (content) {
        return typeof content === "function" ? content : function () {
            return content;
        };
    };
    
    fluid.tooltip.makeOpenHandler = function (that) {
        return function (event) {
            var tt = $(event.target).tooltip("widget");
            tt.stop(false, true);
            tt.hide();
            if (that.options.delay) {
                tt.delay(that.options.delay).fadeIn("default", that.events.afterOpen.fire());
            } else {
                tt.show();
                that.events.afterOpen.fire();
            }
        };
    };
    
    fluid.tooltip.makeCloseHandler = function (that) {
        return function (event) {
            var tt = $(event.target).tooltip("widget");
            tt.stop(false, true);
            tt.hide();
            tt.clearQueue();
            that.events.afterClose.fire();
        };
    };

    fluid.tooltip.setup = function (that) {
        that.container.tooltip({
            content: fluid.tooltip.createContentFunc(that.options.content),
            position: that.options.position,
            items: that.options.items,
            open: fluid.tooltip.makeOpenHandler(that),
            close: fluid.tooltip.makeCloseHandler(that)
        });
        that.elm = that.container.tooltip("widget");
        that.elm.addClass(that.options.styles.tooltip);
    };
    
    fluid.tooltip.updateContent = function (that, content) {
        that.container.tooltip("option", "content", fluid.tooltip.createContentFunc(content));
        // FLUID-4780:
        // The following line is a workaround for an issue we found in the VideoPlayer (FLUID-4743).
        // jQuery UI has a fix for it: http://bugs.jqueryui.com/ticket/8544
        // When we upgrade jQuery UI, we should clean out this workaround
        that.container.data("tooltip").tooltip.html(content);
    };
    
    fluid.defaults("fluid.tooltip", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
          /**
           * Destroys the underlying jquery ui tooltip
           */
            // NB - can't name this "destroy" due to collision with new fabricated "destroy" method - however API is
            // preserved since that method forwards to this one via listener
            doDestroy: {
                "this": "{that}.container",
                method: "tooltip",
                args: "destroy"
            },
          /**
           * Manually displays the tooltip
           */
            open: {
                "this": "{that}.container",
                method: "tooltip",
                args: "open"
            },
          /**
           * Manually hides the tooltip
           */
            close: {
                "this": "{that}.container",
                method: "tooltip",
                args: "close"
            },
          /**
           * Updates the contents displayed in the tooltip
           * 
           * @param {Object} content, the content to be displayed in the tooltip
           */
            updateContent: {
                funcName: "fluid.tooltip.updateContent",
                args: ["{that}", "{arguments}.0"]
            }
        },
        styles: {
            tooltip: ""
        },
        events: {
            afterOpen: null,
            afterClose: null  
        },
        listeners: {
            onCreate: "fluid.tooltip.setup",
            onDestroy: "{that}.doDestroy"
        },
        content: "",
        position: {
            my: "left top",
            at: "left bottom",
            offset: "0 5"
        },
        items: "*",
        delay: 300
    });

})(jQuery, fluid_1_5);
