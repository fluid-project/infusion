/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global fluid, jQuery*/

// Based off of https://css-tricks.com/ajaxing-svg-sprite/

var demo = demo || {};

(function ($) {
    "use strict";

    fluid.defaults("demo.injectSVG", {
        gradeNames: ["fluid.viewComponent"],
        svgSource: "",
        events: {
            onSuccess: null,
            onError: null
        },
        markup: {
            wrapper: "<div></div>"
        },
        listeners: {
            "onCreate.fetch": {
                listener: "demo.injectSVG.fetch",
                args: ["{that}"]
            },
            "onSuccess.inject": "{that}.inject"
        },
        invokers: {
            inject: {
                funcName: "demo.injectSVG.inject",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    demo.injectSVG.fetch = function (that) {
        $.ajax(that.options.svgSource, {
            dataType: "html",
            type: "GET",
            success: that.events.onSuccess.fire,
            error: that.events.onError.fire
        });
    };

    demo.injectSVG.inject = function (that, svgMarkup) {
        var wrapper = $(that.options.markup.wrapper);
        wrapper.html(svgMarkup);

        that.container.prepend(wrapper);
    };
})(jQuery);
