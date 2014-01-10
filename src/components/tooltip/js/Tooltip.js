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
    
    fluid.tooltip.computeContentFunc = function (that) {
        that.contentFunc = that.options.contentFunc ? that.options.contentFunc : that.modelToContentFunc;
    };
    
    fluid.tooltip.updateContent = function (that, content) {
        that.computeContentFunc();
        if (that.initialised) {
            that.container.tooltip("option", "content", that.contentFunc);
        }
        // FLUID-4780:
        // The following line is a workaround for an issue we found in the VideoPlayer (FLUID-4743).
        // jQuery UI has a fix for it: http://bugs.jqueryui.com/ticket/8544
        // When we upgrade jQuery UI, we should clean out this workaround
        // Update: Although the jQuery UI update is now complete, we are leaving this comment material here
        // until we can verify this fix with the VideoPlayer implementation.
        //that.container.data("ui-tooltip").tooltip.html(content);
    };
    
    fluid.tooltip.idSearchFunc = function (idToContentFunc) {
        return function (target) {
            var idToContent = idToContentFunc();
            var ancestor = fluid.findAncestor(target, function (element) {
                return idToContent[element.id];
            });
            return ancestor ? idToContent[ancestor.id] : null;
        };
    };
    
    fluid.tooltip.modelToContentFunc = function (that) {
        var model = that.model;
        if (model.idToContent) {
            return fluid.tooltip.idSearchFunc(function () {
                return that.model.idToContent;
            });
        } else if (model.content) {
            return model.content;
        } 
    };
    
    fluid.tooltip.makeOpenHandler = function (that) {
        return function (event, tooltip) {
           if (that.initialised) {
               that.events.afterOpen.fire(that, event.target, tooltip.tooltip, event);
           }
        };
    };
    
    fluid.tooltip.makeCloseHandler = function (that) {
        return function (event, tooltip) {
            if (that.initialised) { // underlying jQuery UI component will fire various spurious close events after it has been destroyed
                that.events.afterClose.fire(that, event.target, tooltip.tooltip, event);
            }
        };
    };

    fluid.tooltip.setup = function (that) {
        that.updateContent();
        that.container.tooltip({
            content: that.contentFunc,
            position: that.options.position,
            items: that.options.items,
            tooltipClass: that.options.styles.tooltip,
            open: fluid.tooltip.makeOpenHandler(that),
            close: fluid.tooltip.makeCloseHandler(that),
            hide: {
                duration: that.options.delay
            },
            show: {
                duration: that.options.delay
            }
        });
        that.initialised = true;
        that.elm = that.container.tooltip("widget");
        //that.elm.addClass(that.options.styles.tooltip);
    };
    
    
    fluid.tooltip.doDestroy = function (that) {
        if (that.initialised) {
            // jQuery UI framework will throw a fit if we have instantiated a widget on a DOM element and then
            // removed it from the DOM. This apparently can't be detected via the jQuery UI API itself.
            if ($.contains(document, that.container[0])) {
                that.container.tooltip("destroy");
            }
            that.initialised = false; // TODO: proper framework facility for this coming with FLUID-4890  
        }
    };
    
    fluid.defaults("fluid.tooltip", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
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
           * Updates the contents displayed in the tooltip. Deprecated - use the
           * ChangeApplier API for this component instead.
           * @param {Object} content, the content to be displayed in the tooltip
           */
            updateContent: {
                funcName: "fluid.tooltip.updateContent",
                args: ["{that}"]
            },
            computeContentFunc: {
                funcName: "fluid.tooltip.computeContentFunc",
                args: ["{that}"]
            },
            modelToContentFunc: {
                funcName: "fluid.tooltip.modelToContentFunc",
                args: "{that}"
            }
        },
        model: {
            // backward compatibility for pre-1.5 users of Tooltip
            content: "{that}.options.content" 
            // content: String,
            // idToContent: Object {String -> String}
        },
        styles: {
            tooltip: ""
        },
        events: {
            afterOpen: null,  // arguments: that, event.target, tooltip, event
            afterClose: null  // arguments: that, event.target, tooltip, event
        },
        listeners: {
            onCreate: "fluid.tooltip.setup",
            onDestroy: "fluid.tooltip.doDestroy"
        },
        modelListeners: {
            "": "{that}.updateContent" // TODO: better scheme when FLUID-3674 is merged
        },
        position: {
            my: "left top",
            at: "left bottom",
            offset: "0 5"
        },
        items: "*",
        delay: 300
    });

})(jQuery, fluid_1_5);
