/*
Copyright 2015 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";
    
    fluid.registerNamespace("fluid.debug");
    
    fluid.debug.toggleClass = function (styles, element, openStyle, closedStyle, state) {
        if (openStyle) {
            element.toggleClass(styles[openStyle], state);
        }
        if (closedStyle) {
            element.toggleClass(styles[closedStyle], !state);
        }
    };
    
    fluid.debug.bindToggleClick = function (element, applier, path) {
        element.click(function () {
            var state = fluid.get(applier.holder.model, path);
            applier.change(path, !state);
        });
    };
    
    fluid.debug.renderMarkup = function (element, markup) {
        element.append(markup);
    };
    
    
    fluid.defaults("fluid.debug.highlighter", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        markup: {
            highlightElement: "<div class=\"fl-debug-highlightElement\"></div>"
        },
        listeners: {
            onCreate: "fluid.debug.highlighter.renderRoot"
        },
        invokers: {
            clear: "fluid.debug.highlighter.clear({that})",
            highlight: "fluid.debug.highlighter.highlight({that}, {arguments}.0)"
        }
    });
    
    fluid.debug.highlighter.renderRoot = function (that) {
        that.highlights = $([]);
    };
    
    fluid.debug.highlighter.clear = function (that) {
        that.highlights.remove();
        that.highlights = $([]);
    };
    
    fluid.debug.highlighter.positionProps = ["width","height","left","top","marginLeft","marginTop","paddingLeft","paddingTop"];
    
    
    fluid.debug.highlighter.highlight = function (that, components) {
        var p = fluid.debug.highlighter.positionProps;
        var highlights = that.highlights;
        for (var i = 0; i < components.length; ++ i) {
            var component = components[i];
            var container = component.container;
            var parent = container[0].parentElement;
            if (parent) {
                var highlight = $(that.options.markup.highlightElement);
                $(parent).append(highlight);
                highlight.css("background-color", "black");
                for (var j = 0; j < p.length; ++ j) {
                    highlight.css(p[j], container.css(p[j] || ""));
                }
                highlights = highlights.add(highlight);
                console.log("highlights now contains ", highlights);
            }
        }
        that.highlights = highlights;
    };
    
    fluid.debug.renderInspecting = function (that, pane, inspecting) {
        if (!pane || !that.highlighter) { // stupid ginger world failure
            return;
        }
        pane.empty();
        that.highlighter.clear();
        var ids = fluid.keys(inspecting);
        var fulltext = [], components = [];
        for (var i = 0; i < ids.length; ++ i) {
            var inspectingId = ids[i];
            var component = that.viewMapper.domIdToEntry[inspectingId].component;
            var text = "Container id " + component.container.prop("id") + ": " + fluid.dumpThat(component);
            fulltext[i] = text;
            components[i] = component;
        }
        pane.html(fulltext.join("<br/>"));
        that.highlighter.highlight(components);
    };
    
    fluid.defaults("fluid.debug.browser", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        model: {
            isOpen: false,
            isInspecting: false,
            inspecting: {}
        },
        modelListeners: {
            isOpen: {
                funcName: "fluid.debug.toggleClass",
                args: ["{that}.options.styles", "{that}.dom.holder", "holderOpen", "holderClosed", "{change}.value"]
            },
            isInspecting: {
                funcName: "fluid.debug.toggleClass",
                args: ["{that}.options.styles", "{that}.dom.inspect", "inspecting", null, "{change}.value"]
            },
            inspecting: {
                funcName: "fluid.debug.renderInspecting",
                args: ["{that}", "{that}.dom.pane", "{change}.value"]
            }
        },
        styles: {
            holderOpen: "fl-debug-holder-open",
            holderClosed: "fl-debug-holder-closed",
            inspecting: "fl-debug-inspect-active"
        },
        markup: "<div class=\"flc-debug-holder fl-debug-holder\"><div class=\"flc-debug-tab fl-debug-tab\"></div><div class=\"flc-debug-pane fl-debug-pane\"><div class=\"flc-debug-inspect fl-debug-inspect\"></div></div></div>",
        selectors: {
            tab: ".fl-debug-tab",
            inspect: ".fl-debug-inspect",
            holder: ".fl-debug-holder",
            pane: ".fl-debug-pane"
        },
        events: {
            onNewDocument: null
        },
        listeners: {
            "onCreate.render": {
                priority: "first",
                funcName: "fluid.debug.renderMarkup",
                args: ["{that}.container", "{that}.options.markup"]
            },
            "onCreate.toggleTabClick": {
                funcName: "fluid.debug.bindToggleClick",
                args: ["{that}.dom.tab", "{that}.applier", "isOpen"]
            },
            "onCreate.toggleInspectClick": {
                funcName: "fluid.debug.bindToggleClick",
                args: ["{that}.dom.inspect", "{that}.applier", "isInspecting"]
            },
            onNewDocument: {
                funcName: "fluid.debug.bindHover",
                args: ["{that}", "{arguments}.0"]
            }
        },
        components: {
            viewMapper: {
                type: "fluid.debug.viewMapper",
                options: {
                    events: {
                        onNewDocument: "{fluid.debug.browser}.events.onNewDocument"
                    }
                }
            },
            highlighter: {
                type: "fluid.debug.highlighter",
                container: "{fluid.debug.browser}.container"
            }
        }
    });
    
    fluid.debug.bindHover = function (that, dokkument) {
        console.log("Binding to document " + dokkument.prop("id"));
        var listener = function (event) {
            var allParents = $(event.target).parents().addBack().get();
            for (var i = 0; i < allParents.length; ++ i) {
                var id = allParents[i].id;
                var entry = that.viewMapper.domIdToEntry[id];
                if (entry) {
                    if (event.type === "mouseleave") {
                        that.applier.change(["inspecting", id], null, "DELETE");
                    } else if (event.type === "mouseenter") {
                        that.applier.change(["inspecting", id], true);
                    }
                }
            }
        };
        dokkument.on("mouseenter mouseleave", "*", listener);
    };
    
    fluid.defaults("fluid.debug.listeningView", {
        listeners: {
            onCreate: {
                funcName: "fluid.debug.viewMapper.registerView",
                args: ["{fluid.debug.viewMapper}", "{that}", "add"]
            },
            onDestroy: {
                funcName: "fluid.debug.viewMapper.registerView",
                args: ["{fluid.debug.viewMapper}", "{that}", "remove"]
            }
        }
    });
    
    fluid.defaults("fluid.debug.listeningPanel", {
        listeners: {
            onDomBind: {
                funcName: "fluid.debug.viewMapper.registerView",
                args: ["{fluid.debug.viewMapper}", "{that}", "rebind"]
            }
        }
    });
    
    fluid.defaults("fluid.debug.viewMapper", {
        gradeNames: ["fluid.eventedComponent", "fluid.resolveRoot", "autoInit"],
        members: {
            seenDocuments: {},
            idToEntry: {},
            domIdToEntry: {}
        },
        distributeOptions: [{
            record: "fluid.debug.listeningView",
            target: "{/ fluid.commonViewComponent}.options.gradeNames"
        }, {
            record: "fluid.debug.listeningPanel",
            target: "{/ fluid.prefs.panel}.options.gradeNames"
        }],
        events: {
            onNewDocument: null
        },
        listeners: {
            onCreate: {
                funcName: "fluid.debug.viewMapper.scanInit"
            }
        }
    });
    
    fluid.debug.viewMapper.registerView = function (that, component, action) {
        var id = component.id;
        var containerId = fluid.allocateSimpleId(component.container);
        if (containerId) {
            var dokkument = $(component.container[0].ownerDocument);
            var dokkumentId = fluid.allocateSimpleId(dokkument);
            if (!that.seenDocuments[dokkumentId]) {
                that.seenDocuments[dokkumentId] = true;
                that.events.onNewDocument.fire(dokkument);
            }
        }
        console.log("***" + action + " of container ", component.container, " for component ", component);
        if (action === "add") {
            var entry = {
                component: component,
                containerId: containerId
            };
            that.idToEntry[id] = entry;
            that.domIdToEntry[containerId] = entry;
        } else if (action === "remove") {
            delete that.idToEntry[id];
        } else if (action === "rebind") {
            var oldRecord = that.idToEntry[id];
            delete that.domIdToEntry[oldRecord.containerId];
            oldRecord.containerId = containerId;
            if (containerId) {
                that.domIdToEntry[containerId] = oldRecord;
            }
        }
    };
        
    fluid.debug.viewMapper.scanInit = function (that) {
        var views = fluid.queryIoCSelector(fluid.rootComponent, "fluid.viewComponent");
        for (var i = 0; i < views.length; ++ i) {
            fluid.debug.viewMapper.registerView(that, views[i], true);
        }
    };
    
    $(document).ready(function () {
        fluid.debug.browser("body");
    });
    
})(jQuery, fluid_2_0);