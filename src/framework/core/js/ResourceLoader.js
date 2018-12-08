/*
Copyright 2011-2016 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {

    "use strict";

    /**
     * A configurable component to allow users to load multiple resources via AJAX requests.
     * The resources can be localised by means of options `locale`, `defaultLocale`. Once all
     * resources are loaded, the event `onResourceLoaded` will be fired, which can be used
     * to time the creation of components dependent on the resources.
     *
     * @param {Object} options - The component options.
     */
    fluid.defaults("fluid.resourceLoader", {
        gradeNames: ["fluid.component"],
        listeners: {
            "onCreate.loadResources": {
                listener: "fluid.resourceLoader.loadResources",
                args: ["{that}", {expander: {func: "{that}.resolveResources"}}]
            }
        },
        defaultLocale: null,
        locale: null,
        terms: {},  // Must be supplied by integrators
        resources: {},  // Must be supplied by integrators
        resourceOptions: {},
        // Unsupported, non-API option
        invokers: {
            transformURL: {
                funcName: "fluid.stringTemplate",
                args: ["{arguments}.0", "{that}.options.terms"]
            },
            resolveResources: {
                funcName: "fluid.resourceLoader.resolveResources",
                args: "{that}"
            }
        },
        events: {
            onResourcesLoaded: null
        }
    });

    fluid.resourceLoader.resolveResources = function (that) {
        return fluid.transform(that.options.resources, function (record) {
            var userSpec = typeof(record) === "string" ? {url: record} : record;
            var resourceSpec = $.extend(true, {}, {
                defaultLocale: that.options.defaultLocale,
                locale: that.options.locale,
                options: that.options.resourceOptions}, userSpec);
            resourceSpec.url = that.transformURL(resourceSpec.url);
            return $.extend(resourceSpec, fluid.filterKeys(that.options, ["defaultLocale", "locale"]));
        });
    };

    fluid.resourceLoader.loadResources = function (that, resources) {
        fluid.fetchResources(resources, function () {
            that.resources = resources;
            that.events.onResourcesLoaded.fire(resources);
        });
    };

})(jQuery, fluid_3_0_0);
