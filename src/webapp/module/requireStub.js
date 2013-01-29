/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global window, require*/
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function (fluid, $) {

    if (typeof (fluid) === "undefined") {
        throw new Error("Please include requireStub.js after Fluid Infusion in the document's <head>");
    }

    var requireStub = function (moduleName) {
        var module = requireStub.modules[moduleName];
        if (!module) {
            throw new Error("Module " + moduleName + " is not loaded. Please edit your requireModules.json.");
        }
        return module;
    };

    $.ajax({
        url: "../js/requireModules.json",
        async: false,
        dataType: "json"
    }).done(function (modules) {
        requireStub.modules = {};
        $.each(modules, function (moduleName, modulePath) {
            var module = fluid.getGlobalValue(moduleName);
            if (module) {
                requireStub.modules[moduleName] = module;
                return;
            }
            module = fluid.getGlobalValue(modulePath);
            if (module) {
                requireStub.modules[moduleName] = module;
                return;
            }
            $.ajax({
                async: false,
                url: modulePath,
                dataType:"script"
            }).done(function () {
                requireStub.modules[moduleName] = fluid.getGlobalValue(moduleName);
            }).fail(function () {
                throw new Error("Error loading script.");
            });
        })
    }).fail(function () {
        throw new Error("Please provide requireModules.json along with your test.");
    });

    window.require = requireStub;
    fluid.require = requireStub;

}(fluid_1_5, jQuery));