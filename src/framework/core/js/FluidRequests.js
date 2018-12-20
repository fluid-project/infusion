/*
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2013 Raising the Floor - US
Copyright 2014-2015 Raising the Floor - International
Copyright 2010-2011, 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /** NOTE: All contents of this file are DEPRECATED and no entry point should be considered a supported API **/

    /** Explodes a localised filename, perhaps with extension, into a number of variants with the basename followed
     * by underscores and increasingly specialised locale names, taking into account a possible default locale.
     * E.g. if `filename` is `messages.json`, `locale` is `fr_CH` and `defaultLocale` is `en`, this function will return
     * `["messages_en.json", "messages_fr.json", "messages_fr_CH.json"]`.
     *
     * This is similar to the algorithm specified for localised resources in Java, e.g. documented at
     * https://docs.oracle.com/javase/6/docs/api/java/util/ResourceBundle.html#getBundle%28java.lang.String,%20java.util.Locale,%20java.lang.ClassLoader%29
     * @param {String} fileName - The base filename to be exploded
     * @param {String} locale - A locale name with respect to which to perform the explosion
     * @param {String} [defaultLocale] - An optional default locale to fall back on in the case none of the localised
     * variants could be located.
     * @return {String[]} An array of localised filenames to be fetched, in increasing order of specificity. In
     * practice, we expect the last member of this array which can be fetched to correspond to the most desirable
     * localised version of the resource.
     */
    fluid.explodeLocalisedName = function (fileName, locale, defaultLocale) {
        var lastDot = fileName.lastIndexOf(".");
        if (lastDot === -1 || lastDot === 0) {
            lastDot = fileName.length;
        }
        var baseName = fileName.substring(0, lastDot);
        var extension = fileName.substring(lastDot);

        var segs = locale.split("_");

        var exploded = fluid.transform(segs, function (seg, index) {
            var shortSegs = segs.slice(0, index + 1);
            return baseName + "_" + shortSegs.join("_") + extension;
        });
        if (defaultLocale) {
            exploded.unshift(baseName + "_" + defaultLocale + extension);
        }
        exploded.unshift(fileName);
        return exploded;
    };

    /** Accepts a hash of structures with free keys, where each entry has either
     * url or nodeId set - on completion, callback will be called with the populated
     * structure with fetched resource text in the field "resourceText" for each
     * entry. Each structure may contain "options" holding raw options to be forwarded
     * to jQuery.ajax().
     */

    fluid.fetchResources = function (resourceSpecs, callback, options) {
        var that = fluid.makeResourceFetcher(resourceSpecs, callback, options);
        that.fetchAll();
        return that;
    };

    /** The concept behind the "explode/condense" for Locales group of functions is to implement a straightforward
     * though unperformant model of client-side fallback localisation. Each user-supplied resourceSpec is exploded
     * into a series of progressively less refined locale fallback variants. Each of these is then fetched,
     * and then the results are recombined after fetching in order to only report a resource to the root user's
     * spec for the most specific localised variant that made a response
     */

    fluid.fetchResources.explodeForLocales = function (resourceFetcher, resourceSpecs) {
        fluid.each(resourceSpecs, function (resourceSpec) {
            // If options.defaultLocale is set, it will replace any
            // defaultLocale set on an individual resourceSpec
            if (resourceFetcher.options.defaultLocale && resourceSpec.defaultLocale === undefined) {
                resourceSpec.defaultLocale = resourceFetcher.options.defaultLocale;
            }
            if (resourceSpec.locale === undefined) {
                resourceSpec.locale = resourceSpec.defaultLocale;
            }

            resourceSpec.loader = fluid.resourceLoader.resolveResourceLoader(resourceSpec);
            if (resourceSpec.locale) {
                var pathKey = resourceSpec.loader.pathKey;
                resourceSpec.localeExploded = fluid.explodeLocalisedName(resourceSpec[pathKey], resourceSpec.locale, resourceSpec.defaultLocale);
                resourceSpec.localeExplodedSpecs = fluid.transform(resourceSpec.localeExploded, function (oneExploded) {
                    var togo = {
                        loader: resourceSpec.loader
                    };
                    togo[pathKey] = oneExploded;
                    return togo;
                }, fluid.fetchResources.prepareRequestOptions);
            }
        });
        return resourceSpecs;
    };

    // Returns an array of settled promises
    fluid.fetchResources.launchExplodedLocales = function (localeExplodedSpecs, loader) {
        var promiseArray = fluid.transform(localeExplodedSpecs, loader, function (promise) {
            var promiseToGo = fluid.promise();
            promise.then(function (resolve) {
                promiseToGo.resolve({resolved: resolve});
            }, function (error) {
                promiseToGo.resolve({rejected: error});
            });
            return promiseToGo;
        });
        var settledArrayPromise = fluid.promise.sequence(promiseArray);
        return settledArrayPromise;
    };

    fluid.fetchResources.condenseExplodedLocales = function (resourceSpec, settledArray) {
        var togo = fluid.promise();
        settledArray.reverse();
        var lastNonError = fluid.find(settledArray, function (settled) {
            return settled.resolved;
        });
        if (lastNonError) {
            togo.resolve(lastNonError);
        } else {
            togo.reject({
                isError: true,
                message: "No localised variants of the resource could be found at any of the paths "
                    + resourceSpec.localeExploded.join(", ")
            });
        }
        return togo;
    };

    fluid.fetchResources.resolveLoaderTask = function (resourceSpec, loader) {
        if (resourceSpec.localeExplodedSpecs) {
            return function () {
                var togo = fluid.promise();
                var settledArrayPromise = fluid.fetchResources.launchExplodedLocales(resourceSpec.localeExplodedSpecs, loader);
                settledArrayPromise.then(function (settledArray) {
                    var condensed = fluid.fetchResources.condenseExplodedLocales(resourceSpec, settledArray);
                    fluid.promise.follow(condensed, togo);
                });
                return togo;
            };
        } else {
            return function () {
                return loader(resourceSpec);
            };
        }
    };

    fluid.fetchResources.checkCompletion = function (resourceSpecs, resourceFetcher) {
        var incomplete = fluid.find_if(resourceSpecs, function (resourceSpec) {
            return !resourceSpec.promise.disposition;
        });
        if (!incomplete) {
            // Always defer notification in an anti-Zalgo scheme to ease problems like FLUID-6202
            fluid.invokeLater(function () {
                resourceFetcher.completionPromise.resolve(resourceSpecs);
            });
        }
    };

    fluid.fetchResources.noteResourceText = function (resourceText, options) {
        options.resourceSpec.resourceText = resourceText;
        return resourceText;
    };

    fluid.fetchResources.noteParsed = function (parsed, options) {
        options.resourceSpec.parsed = parsed;
        return parsed;
    };

    fluid.listenerForNamespace = function (event, namespace) {
        return fluid.find(event.sortedListeners, function (lisrec) {
            return lisrec.namespace === namespace;
        });
    };

    fluid.fetchResources.prepareRequestOptions = function (resourceSpec) {
        var pathKey = resourceSpec.loader.pathKey;
        var requestOptions = {};
        requestOptions[pathKey] = resourceSpec[pathKey];
        resourceSpec.options = $.extend(true, {}, resourceSpec.options, requestOptions);
        return resourceSpec;
    };

    fluid.fetchResources.subscribeOneResource = function (resourceFetcher, resourceSpec, key) {
        resourceSpec.event = fluid.makeEventFirer({name: "Transform chain for resource \"" + key + "\""});
        resourceSpec.event.addListener(fluid.fetchResources.noteParsed, "parsed", "last");
        var parser = fluid.resourceLoader.resolveResourceParser(resourceSpec);
        resourceSpec.event.addListener(parser, "parser", "before:parsed");
        resourceSpec.event.addListener(fluid.fetchResources.noteResourceText, "resourceText", "before:parser");
        resourceSpec.event.addListener(fluid.fetchResources.resolveLoaderTask(resourceSpec, resourceSpec.loader.loader),
            "loader", "before:resourceText");
        fluid.fetchResources.prepareRequestOptions(resourceSpec);
        resourceSpec.promise = fluid.promise();
        resourceSpec.launched = false;
    };

    fluid.makeResourceFetcher = function (resourceSpecs, callback, options) {
        var that = {
            options: fluid.copy(options || {})
        };
        that.fetchAll = function () {
            return fluid.fetchResources.fetchAll(that);
        };
        that.completionPromise = fluid.promise();
        that.resourceSpecs = fluid.fetchResources.explodeForLocales(that, resourceSpecs);

        fluid.each(resourceSpecs, function (resourceSpec, key) {
            fluid.fetchResources.subscribeOneResource(that, resourceSpec, key);
        });

        that.completionPromise.then(callback, callback);
        return that;
    };

    fluid.fetchResources.fetchAll = function (resourceFetcher) {
        fluid.each(resourceFetcher.resourceSpecs, function (resourceSpec) {
            fluid.fetchResources.fetchOneResource(resourceSpec, resourceFetcher);
        });
        return resourceFetcher.completionPromise;
    };

    fluid.fetchResources.fetchOneResource = function (resourceSpec, resourceFetcher) {
        if (!resourceSpec.launched) {
            resourceSpec.launched = true;
            var transformPromise = fluid.promise.fireTransformEvent(resourceSpec.event, null, {
                resourceSpec: resourceSpec,
                resourceFetcher: resourceFetcher
            });
            fluid.promise.follow(transformPromise, resourceSpec.promise);
            // Add these at the last possible moment so that individual resource disposition can beat them
            // TODO: Convert all these to "new firers"
            resourceSpec.promise.then(function () {
                fluid.fetchResources.checkCompletion(resourceFetcher.resourceSpecs, resourceFetcher);
            }, function (error) {
                resourceSpec.fetchError = error;
                resourceFetcher.completionPromise.reject(error);
            });
        }
        return resourceSpec.promise;
    };

    fluid.registerNamespace("fluid.resourceLoader.loaders");
    fluid.registerNamespace("fluid.resourceLoader.parsers");

// From newRendererDemo, fluidNewRenderer.js


    fluid.resourceLoader.resolveResourceLoader = function (resourceSpec) {
        var loader = fluid.find(fluid.resourceLoader.loaders, function (loader, key) {
            if (resourceSpec[key]) {
                return {
                    loader: loader,
                    pathKey: key
                };
            }
        });
        var dataTypeOnly = $.isEmptyObject(fluid.censorKeys(resourceSpec, ["dataType"]));
        if (!loader && !dataTypeOnly) {
            fluid.fail("Couldn't locate resource loader for resource spec ", resourceSpec);
        }
        return loader;
    };

    fluid.resourceLoader.resolveResourceParser = function (resourceSpec) {
        return fluid.resourceLoader.parsers[resourceSpec.dataType] || fluid.identity;
    };

    /*
    // Quick synchronous mockup of file resource fetcher before we have FLUID-4982
    fluid.resourceLoader.loaders.path = function (resourceSpec) {
        var resourcePath = fluid.module.resolvePath(resourceSpec.path);
        var resourceText = fs.readFileSync(resourcePath, resourceSpec.charEncoding || "utf8");
        return resourceText;
    };
    */
    fluid.resourceLoader.loaders.jQueryAjax = function (resourceSpec) {
        var togo = fluid.promise();
        resourceSpec.jqXHR = $.ajax(resourceSpec.options).then(function (data, textStatus, jqXHR) {
            resourceSpec.jqXHR = jqXHR; // This is advertised to be the same object but it is not
            togo.resolve(jqXHR.responseText);
        }, function (jqXHR, textStatus, errorThrown) {
            resourceSpec.jqXHR = jqXHR;
            togo.reject({
                isError: true,
                status: jqXHR.status,
                textStatus: jqXHR.textStatus,
                errorThrown: errorThrown
            });
        });
        return togo;
    };

    fluid.resourceLoader.loaders.url = fluid.resourceLoader.loaders.jQueryAjax;

    fluid.resourceLoader.loaders.resourceText = function (resourceSpec) {
        return resourceSpec.resourceText;
    };

    fluid.resourceLoader.loaders.promise = function (resourceSpec) {
        return resourceSpec.promise;
    };

    // DISUSED
    fluid.resourceLoader.loaders.nodeId = function (resourceSpec) {
        var node = document.getElementById(resourceSpec.nodeId);
        // upgrade this to somehow detect whether node is "armoured" somehow
        // with comment or CDATA wrapping
        resourceSpec.resourceText = fluid.dom.getElementText(node);
    };

    fluid.resourceLoader.parsers.html = function (resourceText, options) {
        return fluid.htmlParser.parse(resourceText, options.resourceSpec.parseOptions);
    };

    fluid.resourceLoader.parsers.json = function (resourceText, options) {
        var jqXHR = options.resourceSpec.jqXHR;
        return jqXHR ? jqXHR.responseJSON : JSON.parse(resourceText);
    };

})(jQuery, fluid_3_0_0);
