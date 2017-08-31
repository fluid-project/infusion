/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /************************************************************************************
     * Scrolling Panel Prefs Editor:                                                    *
     * This is a mixin grade to be applied to a fluid.prefs.prefsEditor type component. *
     * Typically used for responsive small screen presentations of the separated panel  *
     * to allow for scrolling by clicking on left/right arrows                          *
     ************************************************************************************/

    fluid.defaults("fluid.prefs.arrowScrolling", {
        selectors: {
            scrollContainer: ".flc-prefsEditor-scrollContainer"
        },
        listeners: {
            "onReady.windowResize": {
                "this": window,
                method: "addEventListener",
                args: ["resize", "{that}.events.onSignificantDOMChange.fire"]
            }
        },
        invokers: {
            scrollToPanel: {
                funcName: "fluid.prefs.arrowScrolling.scrollToPanel",
                args: ["{that}", "{arguments}.0"]
            },
            translateToScroll: {
                funcName: "fluid.prefs.arrowScrolling.translateToScroll",
                args: ["{that}", "{arguments}.0"]
            }
        },
        distributeOptions: [{
            record: {
                "afterRender.bindScrollArrows": {
                    "this": "{that}.dom.header",
                    method: "click",
                    args: ["{prefsEditor}.translateToScroll"]
                }
            },
            target: "{that > fluid.prefs.panel}.options.listeners"
        }]

    });

    fluid.prefs.arrowScrolling.translateToScroll = function (that, event) {
        event.preventDefault();
        var target = $(event.target);
        var midPoint = target.width() / 2;
        var currentIndex = target.closest(that.options.selectors.panels).index();
        var scrollIndex = currentIndex + (event.offsetX < midPoint ? -1 : 1);

        that.scrollToPanel(scrollIndex);
    };

    fluid.prefs.arrowScrolling.scrollToPanel = function (that, panelIndex) {
        var panels = that.locate("panels");
        var scrollContainer = that.locate("scrollContainer");

        if (panelIndex >= 0 && panelIndex < panels.length) {
            scrollContainer.scrollLeft(scrollContainer.scrollLeft() + panels.eq(panelIndex).offset().left);
        }
    };

})(jQuery, fluid_3_0_0);
