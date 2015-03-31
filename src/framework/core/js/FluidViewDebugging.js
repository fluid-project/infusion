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
   
    
    fluid.defaults("fluid.debug.highlighter", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        selectors: {
            highlightRoot: "#fluid-debug-highlightRoot"
        },
        markup: {
            highlightRoot: "<div id=\"fluid-debug-highlightRoot\" class=\"fluid-debug-highlightRoot\"></div>",
            highlightElement: "<div class=\"fl-debug-highlightElement\"></div>"
        },
        listeners: {
            onCreate: "fluid.debug.highlighter.renderRoot"
        },
        invokers: {
            clear: "fluid.debug.highlighter.clear({that}.dom.highlightRoot)",
            highlight: "fluid.debug.highlighter.highlight({that}, {that}.dom.highlightRoot, {arguments}.0)" // dispositions
        }
    });
    
    fluid.debug.highlighter.renderRoot = function (that) {
        var highlightRoot = $(that.options.markup.highlightRoot);
        that.container.append(highlightRoot);
    };
    
    fluid.debug.highlighter.clear = function (highlightRoot) {
        highlightRoot.empty();
    };
    
    fluid.debug.highlighter.positionProps = ["width","height","marginLeft","marginTop","paddingLeft","paddingTop"];
    
    fluid.debug.highlighter.colours = [
        [0, 0, 0],    // black
        [255, 0, 0],  // red
        [255, 255, 0] // yellow
    ];
    
    fluid.debug.arrayToRGBA = function (array) {
        return "rgba(" + array.join(", ") + ")";
    };
    
    fluid.debug.highlighter.indexToColour = function (i, length) {
        var j = length - i;
        var c = fluid.debug.highlighter.colours;
        var base = fluid.makeArray(c[j % c.length]);
        base[3] = j > c.length ? 0.2 : 0.5;
        return fluid.debug.arrayToRGBA(base);
    };
    
    fluid.debug.highlighter.dispose = function (components) {
        return fluid.transform(components, function (component, i) {
            var container = component.container;
            var noHighlight = container.is("body");
            return {
                component: component,
                container: container,
                noHighlight: noHighlight,
                colour: fluid.debug.highlighter.indexToColour(i, components.length)
            };
        });
    };
    
    
    fluid.debug.highlighter.highlight = function (that, highlightRoot, dispositions) {
        var p = fluid.debug.highlighter.positionProps;
        for (var i = 0; i < dispositions.length; ++ i) {
            var disp = dispositions[i];
            var container = disp.container;
            if (disp.noHighlight) {
                continue;
            }
 
            var highlight = $(that.options.markup.highlightElement);
            highlightRoot.append(highlight);
                
            highlight.css("background-color", disp.colour);
            for (var j = 0; j < p.length; ++ j) {
                highlight.css(p[j], container.css(p[j] || ""));
            }
            var offset = container.offset();
            var containerBody = container[0].ownerDocument.body;
            if (containerBody !== document.body) { // TODO: This primitive algorithm will not account for nested iframes
                offset.left -= $(containerBody).scrollLeft();
                offset.top -= $(containerBody).scrollTop();
            }
            highlight.offset(offset);
            
        }
    };
    
    
    fluid.debug.renderInspecting = function (that, paneBody, paneRowTemplate, inspecting) {
        if (!paneBody || !that.highlighter) { // stupid ginger world failure
            return;
        }
        paneBody.empty();
        that.highlighter.clear();
        var ids = fluid.keys(inspecting);
        var components = fluid.transform(ids, function (inspectingId) {
            return that.viewMapper.domIdToEntry[inspectingId].component;
        });
        var dispositions = fluid.debug.highlighter.dispose(components);
        var rows = fluid.transform(dispositions, function (disp) {
            return {
                style: "background-color: " + disp.colour,
                grades: "Container id " + disp.component.container.prop("id") + ": " + fluid.dumpThat(disp.component),
                lines: ""
            };
        });
        var contents = fluid.transform(rows, function (row) {
            return fluid.stringTemplate(paneRowTemplate, row);
        });
        paneBody.html(contents.join(""));
        that.highlighter.highlight(dispositions);
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
                args: ["{that}", "{that}.dom.paneBody", "{that}.options.markup.paneRow", "{change}.value"]
            }
        },
        styles: {
            holderOpen: "fl-debug-holder-open",
            holderClosed: "fl-debug-holder-closed",
            inspecting: "fl-debug-inspect-active"
        },
        markup: {
            holder: "<div class=\"flc-debug-holder fl-debug-holder\"><div class=\"flc-debug-tab fl-debug-tab\"></div><div class=\"flc-debug-pane fl-debug-pane\"><div class=\"flc-debug-inspect-trigger fl-debug-inspect-trigger\"></div></div></div>",
            pane: "<table><tbody class=\"flc-debug-pane-body\"></tbody></table>",
            paneRow: "<tr><td class=\"flc-debug-pane-index\"><div class=\"flc-debug-pane-indexel\" style=\"%style\"></div></td><td class=\"flc-debug-pane-grades\">%grades</td><td class=\"flc-debug-pane-lines\">%lines</td></tr>"
        },
        selectors: {
            tab: ".fl-debug-tab",
            inspect: ".fl-debug-inspect",
            holder: ".fl-debug-holder",
            pane: ".fl-debug-pane",
            paneBody: ".flc-debug-pane-body"
        },
        events: {
            onNewDocument: null
        },
        listeners: {
            "onCreate.render": {
                priority: "first",
                funcName: "fluid.debug.browser.renderMarkup",
                args: ["{that}", "{that}.options.markup.holder", "{that}.options.markup.pane"]
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
                funcName: "fluid.debug.browser.bindHover",
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
    
            
    fluid.debug.browser.renderMarkup = function (that, holderMarkup, paneMarkup) {
        that.container.append(holderMarkup);
        var debugPane = that.locate("pane");
        debugPane.append(paneMarkup);
    };
    
    fluid.debug.browser.bindHover = function (that, dokkument) {
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