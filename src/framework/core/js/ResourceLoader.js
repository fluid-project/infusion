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
            "onCreate.loadResources": "fluid.resourceLoader.loadResources"
        },
        members: {
            resourceFetcher: {
                expander: {
                    funcName: "fluid.resourceLoader.makeResourceFetcher",
                    args: ["{that}", "{that}.options.resourceSpecs", "{that}.options.resourceOptions",
                        "{that}.resolveResources"]
                }
            }
        },
        // defaultLocale: "en", // May be supplied by integrators
        // locale: "en", // May be supplied by integrators
        terms: {},  // May be supplied by integrators
        resourceOptions: {},
        resources: {},  // Must be supplied by integrators
        invokers: {
            transformURL: {
                funcName: "fluid.stringTemplate",
                args: ["{arguments}.0", "{that}.options.terms"]
            },
            resolveResources: {
                funcName: "fluid.resourceLoader.resolveResources",
                args: ["{that}.options.resources", "{that}.options.locale", "{that}.options.defaultLocale",
                    "{that}.options.resourceOptions", "{that}.transformURL"]
            }
        },
        events: {
            onResourcesLoaded: null
        }
    });

    fluid.resourceLoader.makeResourceFetcher = function (that, resourceSpecs, resourceOptions, resolveResources) {
        var resolved = resolveResources();
        var fetcher = fluid.makeResourceFetcher(fluid.copy(resolved), null, resourceOptions);
        // Note that we beat the existing completion listener in the fetcher by "sheer luck"
        fluid.each(fetcher.resourceSpecs, function (resourceSpec, key) {
            resourceSpec.promise.then(function () {
                that.resources[key] = resourceSpec;
            });
        });
        return fetcher;
    };

    fluid.resourceLoader.resolveResources = function (resources, locale, defaultLocale, resourceOptions, transformURL) {
        return fluid.transform(resources, function (record) {
            var userSpec = typeof(record) === "string" ? {url: record} : record;
            var resourceSpec = $.extend(true, {}, resourceOptions, {
                defaultLocale: defaultLocale,
                locale: locale}, userSpec);
            resourceSpec.url = transformURL(resourceSpec.url);
            return resourceSpec;
        });
    };

    fluid.resourceLoader.loadResources = function (that) {
        var completionPromise = that.resourceFetcher.fetchAll();
        completionPromise.then(function () {
            that.events.onResourcesLoaded.fire(that.resources);
        }, function (error) {
            fluid.log("Failure loading resources for component at path " + fluid.dumpComponentPath(that) + ": ", error);
        });
    };

})(jQuery, fluid_3_0_0);
