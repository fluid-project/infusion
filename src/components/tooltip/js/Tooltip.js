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
        that.contentFunc = that.options.contentFunc ? that.options.contentFunc : that.modelToContentFunc();
    };
    
    fluid.tooltip.updateContentImpl = function (that) {
        that.computeContentFunc();
        if (that.initialised) {
            that.container.tooltip("option", "content", that.contentFunc);
        }      
    }
    
    fluid.tooltip.updateContent = function (that, content) {
        if (that.model.content !== content) { // TODO: Remove with FLUID-3674 branch
            that.applier.requestChange("content", content);
        }
    };
    
    fluid.tooltip.idSearchFunc = function (idToContentFunc) {
        return function (callback) {
            var target = this;
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
            return function () {
                return model.content;
            }
        } 
    };
    
    // Note that fluid.resolveEventTarget is required 
    // because of strange dispatching within tooltip widget's "_open" method 
    // ->   this._trigger( "open", event, { tooltip: tooltip };
    // the target of the outer event will be incorrect

    
    fluid.tooltip.makeOpenHandler = function (that) {
        return function (event, tooltip) {
           fluid.tooltip.closeAll(that);
           var originalTarget = fluid.resolveEventTarget(event);
           that.openIdMap[fluid.allocateSimpleId(originalTarget)] = true;
           if (that.initialised) {
               that.events.afterOpen.fire(that, originalTarget, tooltip.tooltip, event);
           }
        };
    };
    
    fluid.tooltip.makeCloseHandler = function (that) {
        return function (event, tooltip) {
            if (that.initialised) { // underlying jQuery UI component will fire various spurious close events after it has been destroyed
                var originalTarget = fluid.resolveEventTarget(event);
                delete that.openIdMap[originalTarget.id];
                that.events.afterClose.fire(that, originalTarget, tooltip.tooltip, event);
            }
        };
    };
    
    fluid.tooltip.closeAll = function (that) {
        fluid.each(that.openIdMap, function (value, key) {
            var target = fluid.byId(key);
            // "white-box" behaviour - fabricating this fake event shell is the only way we can get the plugin to 
            // close a tooltip which was not opened on the root element. This will be very fragile to changes in
            // jQuery UI and the underlying widget code
            that.container.tooltip("close", {
                type: "close",
                currentTarget: target, 
                target: target
            });  
        });
        fluid.clear(that.openIdMap);
    };

    fluid.tooltip.setup = function (that) {
        fluid.tooltip.updateContentImpl(that);
        var directOptions = {
            content: that.contentFunc,
            open: fluid.tooltip.makeOpenHandler(that),
            close: fluid.tooltip.makeCloseHandler(that)
        };
        var fullOptions = $.extend(true, directOptions, that.options.widgetOptions);
        that.container.tooltip(fullOptions);
        that.initialised = true;
    };
    
    
    fluid.tooltip.doDestroy = function (that) {
        if (that.initialised) {
            fluid.tooltip.closeAll(that);
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
        widgetOptions: {
            tooltipClass: "{that}.options.styles.tooltip",
            position: "{that}.options.position",
            items: "{that}.options.items",
            show: {
                duration: "{that}.options.duration",
                delay: "{that}.options.delay"
            },
            hide: {
                duration: "{that}.options.duration",
                delay: "{that}.options.delay"
            }
        },
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
                funcName: "fluid.tooltip.closeAll",
                args: "{that}"
            },
          /**
           * Updates the contents displayed in the tooltip. Deprecated - use the
           * ChangeApplier API for this component instead.
           * @param {Object} content, the content to be displayed in the tooltip
           */
            updateContent: {
                funcName: "fluid.tooltip.updateContent",
                args: ["{that}", "{arguments}.0"]
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
        members: {
            openIdMap: {}  
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
            "": {
                funcName: "fluid.tooltip.updateContentImpl", // TODO: better scheme when FLUID-3674 is merged
                args: "{that}"
            }
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
