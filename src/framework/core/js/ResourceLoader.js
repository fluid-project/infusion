/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";


    /** Explodes a localised filename, perhaps with extension, into a number of variants with the basename followed
     * by underscores and increasingly specialised locale names, taking into account a possible default locale.
     * E.g. if `filename` is `messages.json`, `locale` is `fr_CH` and `defaultLocale` is `en`, this function will return
     * `["messages_en.json", "messages_fr.json", "messages_fr_CH.json"]`.
     *
     * This is similar to the algorithm specified for localised resources in Java, e.g. documented at
     * https://docs.oracle.com/javase/6/docs/api/java/util/ResourceBundle.html#getBundle%28java.lang.String,%20java.util.Locale,%20java.lang.ClassLoader%29
     * @param {String} fileName - The base filename or URL to be exploded
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

    /** A specification for a (possibly asynchronously available) resource. This might be fetched a URL,
     * the filesystem, or some other source requiring an asynchronous interaction. These are duck-typed by the
     * presence of particular fields, such as `url` or `path` which signal to the decoder that a particular
     * implementation should be activated in a particular environment (e.g. an AJAX request or the node HTTP API)
     * @typedef {Object} ResourceSpec
     * @member {String} [locale] An optional locale which will be used to look for a localised variant of a resource
     * @member {String} [defaultLocale] A fallback locale to be used in the case that the variant localised to `locale`
     * cannot be loaded
     * @member {String} [dataType] An optional specification of a data type - this may be "JSON", "HTML" or some other
     * value indicating that the fetched resource will be parsed into some further representation before it is placed
     * into the `parsed` field of the resulting resource.
     */

    /** A ResourceSpec designating that a resource will be loaded from a URL via an HTTP or HTTPS request.
     * @typedef {ResourceSpec} UrlResourceSpec
     * @member {String} url - The full url from which the resource will be loaded.
     * @member {Object} options - A freeform options structure which will be forwarded without interpretation to the
     * underlying transport, e.g. XmlHttpRequest or node's http/https request
     */

    /** A ResourceSpec designating that a resource will be loaded from the filesystem
     * @typedef {ResourceSpec} PathResourceSpec
     * @member {String} path - The path in the filesystem from which the resource will be loaded. This will be sent
     * to `fluid.resolveModulePath` and so may begin with a module-relative specification such as "%infusion"
     * @member {String} charEncoding - The character encoding to be used when reading the file - this defaults to "utf-8"
     */

    /** A ResourceSpec designating that a resource will be loaded from a DataSource
     * @typedef {ResourceSpec} DataSourceResourceSpec
     * @member {String} dataSource - An IL reference to a DataSource whose `get` method will be used to fetch the resource
     * @member {Object} [directModel] - An optional argument to be sent to the DataSource's `get` method to specify the resource
     * to be loaded
     */

    /** A free hash of names to resourceSpec structures, the currency of many functions in this file
     * @typedef {Object.<String, ResourceSpec>} ResourceSpecs
     */

    /** The options provided to construct a ResourceFetcher
     * @typedef {Object} ResourceFetcherOptions
     * @member {String} defaultLocale - The value of `defaultLocale` to be imputed for any `ResourceSpec` entry that has
     * not filled it in
     */

    /** Accepts a hash of free keys to ResourceSpecs and a callback. The fetch of these will be initiated, and the
     * callback called with the fetched resources when they are all complete.
     * @param {Object.<String, ResourceSpec>} resourceSpecs - Hash of keys to ResourceSpecs designating resources to be fetched.
     * This will be modified tby this function
     * @param {Function} callback - A callback which will receive the filled-in resourceSpecs structure when I/O is complete
     * @param {ResourceFetcherOptions} options - A structure of options to a `ResourceFetcher`.
     * @return {ResourceFetcher} A lightweight component (not an Infusion component) coordinating the I/O process
     */
    fluid.fetchResources = function (resourceSpecs, callback, options) {
        var that = fluid.makeResourceFetcher(resourceSpecs, callback, options, fluid.identity);
        that.optionsReady.resolve();
        that.fetchAll();
        return that;
    };

    /** The concept behind the "explode/condense" for Locales group of functions is to implement a straightforward
     * though unperformant model of client-side fallback localisation. Each user-supplied resourceSpec is exploded
     * into a series of progressively less refined locale fallback variants. Each of these is then fetched,
     * and then the results are recombined after fetching in order to only report a resource to the root user's
     * spec for the most specific localised variant that made a response.
     */

    /** Explode the modifiable `resourceSpec` structures in ths supplied resourceFetcher into an expanded set holding
     * one entry for each localised variant that should be queried when using a fallback algorithm. For each
     * `resourceSpec` this will be generated by calling `fluid.explodeLocalisedName` on the resourceSpec's path/url
     * field, storing the results of this in a new `resourceSpec` field `localeExploded` and generating an array of
     * fresh resourceSpecs in a field `localeExplodedPaths`.
     * @param {resourceFetcher} resourceFetcher - The parent `resourceFetcher` holding the resourceSpecs. This houses
     * the writeable `resourceSpecs` structure, for which each element will be modified by this function,
     * to include new fields `localeExploded`, `localeExplodedSpecs` and in addition, the `locale` and `defaultLocale` fields
     * be filled in.
     */
    fluid.fetchResources.explodeForLocales = function (resourceFetcher) {
        fluid.each(resourceFetcher.resourceSpecs, function (resourceSpec) {
            // If options.defaultLocale is set, it will replace any
            // defaultLocale set on an individual resourceSpec
            if (resourceFetcher.options.defaultLocale && resourceSpec.defaultLocale === undefined) {
                resourceSpec.defaultLocale = resourceFetcher.options.defaultLocale;
            }
            if (resourceSpec.locale === undefined) {
                resourceSpec.locale = resourceFetcher.options.locale || resourceSpec.defaultLocale;
            }
            resourceSpec.dataType = resourceSpec.dataType || resourceFetcher.options.dataType;

            resourceSpec.loader = fluid.resourceLoader.resolveResourceLoader(resourceSpec);
            if (!resourceSpec.loader.loader.noPath) {
                var pathKey = resourceSpec.loader.pathKey;
                var path = resourceSpec[pathKey];
                var resolvedPath = resourceSpec[pathKey] = resourceFetcher.transformResourceURL(path);
                if (resourceSpec.locale) {
                    resourceSpec.localeExploded = fluid.explodeLocalisedName(resolvedPath, resourceSpec.locale, resourceSpec.defaultLocale);
                    resourceSpec.localeExplodedSpecs = fluid.transform(resourceSpec.localeExploded, function (oneExploded) {
                        var togo = {
                            loader: resourceSpec.loader
                        };
                        togo[pathKey] = oneExploded;
                        return togo;
                    }, fluid.fetchResources.prepareRequestOptions);
                }
            }
        });
    };

    /** Accepts an array of ResourceSpecs as exploded by `fluid.fetchResources.explodeForLocales` into a
     * member `localeExplodedSpecs" and sets up I/O to query them for the matching resource. The current implementation
     * will query each exploded spec regardless of error, and the results will be collated by `fluid.fetchResources.condenseExplodedLocales"
     * @param {ResourceSpec[]} localeExplodedSpecs - Array of ResourceSpecs to be queried for the appropriately localised
     * version of a resource
     * @param {OneResourceLoader} loader - a loader suitable for loading all specs in the array
     * @return {Promise} A promise which resolves to an array of structures each holding `{resolved: payload}` or
     * `{rejected: error}` for each queried resource
     */
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

    /** Accepts the settled promise array dispensed from `fluid.fetchResources.launchExplodedLocales` and the original
     * resourceSpec, and condenses back into a single promise picking either the first successfully resolved request,
     * if any, or a rolled-up error payload
     * @param {ResourceSpec} resourceSpec - The original resourceSpec that gave rise to the `localeExplodedSpecs` that
     * gave rise to the supplied `settledArray`
     * @param {Object[]} settledArray - The array of resolutions yielded by the promise returned from
     * `fluid.fetchResources.launchExplodedLocales`
     * @return {Promise} A promise yielding either the first successful fetch for a localised resource, or a rolled-up
     * error listing the paths which were queried
     */
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

    /** Given a resourceSpec and a suitable loader for its resource, return a task which yields either a localised
     * version of the reource, if it had been determined to require localisation by `fluid.fetchResources.explodeForLocales`,
     * or else just the simple action of the supplied loader on the resource
     * @param {ResourceSpec} resourceSpec - The resourceSpec for which a loader task is to be resolved
     * @param {OneResourceLoader} loader - A loader suitable for loading the supplied resource
     * @return {Task} A task which loads the resource
     */
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

    /** Invoked at the resolution of each individual I/O process in order to check whether the resource fetching process
     * as a whole has reached completion - if so, the overall `completionPromise` is fired.
     * @param {ResourceSpecs} resourceSpecs - The complete set of ResourceSpecs in the process of being fetched. The
     * promise disposition status of each of these will be checked to see if any of them is still pending.
     * @param {ResourceFetcher} resourceFetcher - The `resourceFetcher` managing the overall fetch process. Its
     * `completionPromise` will be resolved if no pending I/O remains.
     */
    fluid.fetchResources.checkCompletion = function (resourceSpecs, resourceFetcher) {
        var incomplete = fluid.find_if(resourceSpecs, function (resourceSpec) {
            return !resourceSpec.promise.disposition;
        });
        if (!incomplete) {
            // Close over this since it might get re-initialised
            var completionPromise = resourceFetcher.completionPromise;
            // Always defer notification in an anti-Zalgo scheme to ease problems like FLUID-6202
            fluid.invokeLater(function () {
                if (!completionPromise.disposition) {
                    completionPromise.resolve(resourceSpecs);
                }
            });
        }
    };

    /** The `options` structure fired to the transforming promise chain of the `resourceSpec`'s `event`.
     * @typedef {Object} ResourceSpecTransformOptions
     * @member {ResourceSpec} resourceSpec - The `resourceSpec` for which this chain is executing
     * @member {ResourceFetcher} resourceFetcher - The overall `resourceFetcher` governing the fetch process for the
     * complete set of loading resources
     */

    /** An impure member of the `transforming promise chain` for an individual `resourceSpec` that will stash the
     * resolved value of its predecessor (which will be the `OneResourceLoader`) into the `resourceText` member of the
     * `resourceSpec`
     * @param {String} resourceText - The resource text loaded by the previous transform chain element
     * @param {ResourceSpecTransformOptions} options - The transform chain's options structure
     * @return {String} resourceText - The unchanged value of the supplied resource text
     */
    fluid.fetchResources.noteResourceText = function (resourceText, options) {
        options.resourceSpec.resourceText = resourceText;
        return resourceText;
    };

    /** An impure member of the `transforming promise chain` for an individual `resourceSpec` that will stash the
     * resolved value of its predecessor (which will be the `ResourceParser`) into the `parser` member of the
     * `resourceSpec`
     * @param {Any} parsed - The parsed representation produced by the `ResourceParser`
     * @param {ResourceSpecTransformOptions} options - The transform chain's options structure
     * @return {Any} - The unchanged value of the parsed resource value
     */
    fluid.fetchResources.noteParsed = function (parsed, options) {
        options.resourceSpec.parsed = parsed;
        return parsed;
    };

    fluid.fetchResources.fireFetched = function (parsed, options) {
        options.resourceSpec.onFetched.fire(parsed);
        return parsed;
    };

    /** Prepare the `options` member of a `resourceSpec` by copying in the top-level element with the matching pathKey
     * TODO: Determine why on earth we still do this
     */

    fluid.fetchResources.prepareRequestOptions = function (resourceSpec) {
        var pathKey = resourceSpec.loader.pathKey;
        var requestOptions = {};
        requestOptions[pathKey] = resourceSpec[pathKey];
        resourceSpec.options = $.extend(true, {}, resourceSpec.options, requestOptions);
        return resourceSpec;
    };

    fluid.fetchResources.initOneResource = function (resourceSpec) {
        resourceSpec.promise = fluid.promise();
        resourceSpec.launched = false;
    };

    // TODO: We will have to split this up into two to allow resourceSpecs to be "rearmed" after construction.
    // The chain is reusable but the resulting promise is not.
    /** Subscribe one `resourceSpec` to the fetch process by constructing its pseudoevent `event` governing the
     * transforming promise chain, looking up its loader and parser, and adding them as listeners in this chain
     * together with other standard elements.
     * @param {ResourceSpec} resourceSpec - The `resourceSpec` to be subscribed
     * @param {String} key - The key by which the `resourceSpec` is index in its `resourceSpecs` structure
     * @param {String} ownerComponentId - The id of any component holding the overall ResourceFetcher structure (for debuggability)
     */
    fluid.fetchResources.subscribeOneResource = function (resourceSpec, key, ownerComponentId) {
        if (resourceSpec.transformEvent) {
            fluid.fail("Cannot subscribe resource ", resourceSpec, " which has already been subscribed for I/O");
        }
        resourceSpec.key = key; // To aid debuggability
        resourceSpec.transformEvent = fluid.makeEventFirer({
            name: "Transform chain for resource \"" + key + "\"",
            ownerId: ownerComponentId
        });
        resourceSpec.transformEvent.addListener(fluid.fetchResources.noteParsed, "noteParsed", "last");
        var parser = fluid.resourceLoader.resolveResourceParser(resourceSpec);
        resourceSpec.transformEvent.addListener(parser, "parser", "before:noteParsed");
        resourceSpec.transformEvent.addListener(function (parsed) {
            return fluid.resourceLoader.renderImmutable(parsed, resourceSpec);
        }, "renderImmutable", "after:parser");
        resourceSpec.transformEvent.addListener(fluid.fetchResources.noteResourceText, "resourceText", "before:parser");
        resourceSpec.transformEvent.addListener(fluid.fetchResources.resolveLoaderTask(resourceSpec, resourceSpec.loader.loader),
            "loader", "before:resourceText");
        resourceSpec.onFetched = fluid.makeEventFirer({
            name: "onFetched event for resources \"" + key + "\"",
            ownerId: ownerComponentId
        });
        resourceSpec.onError = fluid.makeEventFirer({
            name: "onError event for resources \"" + key + "\"",
            ownerId: ownerComponentId
        });

        resourceSpec.transformEvent.addListener(fluid.fetchResources.fireFetched, "fireFetched", "last");
        fluid.fetchResources.prepareRequestOptions(resourceSpec);
        fluid.fetchResources.initOneResource(resourceSpec);
    };

    /** @name fluid.fetchResources.FetchOne
     * @class
     * @member {Promise} promise - A promise for the resolved value nested within the resource indirected by the path segments
     * @member {ResourceSpec} resourceSpec - The resourceSpec designating the resource
     */

    /** A utility class (in the prototypal sense) to aid resolution of trailing path segments into an asynchronously
     * fetched resource. It returns a self-trundling series of instances that consume successive path segments until
     * the final value is dereferenced. From this instance, the members `promise`
     * @param {ResourceSpec} resourceSpec - The resourceSpec holding the resource that will be dereferenced into
     * @param {ResourceFetcher} resourceFetcher - The overall resourceFetcher governing the owning component's resources
     * @param {String[]} segs - The array of path segments to be resolved into the resource once it loads
     */
    fluid.fetchResources.FetchOne = function (resourceSpec, resourceFetcher, segs) {
        var FetchOne = this;
        FetchOne.resourceFetcher = resourceFetcher;
        FetchOne.resourceSpec = resourceSpec;
        FetchOne.segs = segs || [];
        // We don't add a rejection handler here since is a "leaf promise" which will give rise to an unhandled rejection warning.
        // The overall rejection of resources will surface at the component level.
        var thisPromise = FetchOne.promise = fluid.promise();
        fluid.fetchResources.fetchOneResource(resourceSpec, resourceFetcher).then(function () {
            thisPromise.resolve(fluid.fetchResources.resolveFetchOne(FetchOne));
        });
    };

    /** Resolve the referenced resource value inside a FetchOne holder. Note that this value will only be
     * resolvable once the parent resource has loaded.
     * @param {fluid.fetchResources.FetchOne} FetchOne - The FetchOne holder referencing an asynchronously available resource
     * @return {Any} The indirected resource value
     */
    fluid.fetchResources.resolveFetchOne = function (FetchOne) {
        return fluid.getImmediate(FetchOne.resourceSpec, FetchOne.segs);
    };

    /** Invoked by the framework when indirection into the unfetched resource is required
     * @param {String} seg - The path segment to be indirected into the resource
     * @return {fluid.fetchResources.FetchOne} A further FetchOne instance indirected further by the supplied path segment
     */
    fluid.fetchResources.FetchOne.prototype.resolvePathSegment = function (seg) {
        return new fluid.fetchResources.FetchOne(this.resourceSpec, this.resourceFetcher, this.segs.concat(fluid.makeArray(seg)));
    };

// Note: This strange style of applying JSDoc comments is described at https://stackoverflow.com/questions/23095975/jsdoc-object-methods-with-method-or-property
    /** The lightweight `resourceFetcher` component (not an Infusion component or a class) coordinating the fetch process
     * designated by a `resourceSpecs` structure.
     * @name ResourceFetcher
     * @class
     */

    /** Perform non-static initialisation of the supplied resourceFetcher - this will be repeated whenever
     * there is a call to `refetchAll`. Non-static members such as promises will be cancelled and reinitialised
     * @param {ResourceFetcher} resourceFetcher - The resourceFetcher to be initialised
     */
    fluid.initResourceFetcher = function (resourceFetcher) {
        /**
         * @name ResourceFetcher.completionPromise
         * @member {Promise} The `completionPromise` for the fetcher which will yield the full state of fetched `resourceSpecs`
         * in either success or failure
         */
        resourceFetcher.completionPromise = fluid.promise();
        fluid.fetchResources.explodeForLocales(resourceFetcher);
        resourceFetcher.onInit.fire(resourceFetcher.completionPromise);
    };

    // A function to tag the type of a Fluid resourceFetcher (primarily to mark it uncopyable)
    fluid.resourceFetcher = function () {};

    /** Construct a lightweight `resourceFetcher` component (not an Infusion component) coordinating the fetch process
     * designated by a `resourceSpecs` structure.
     * @param {resourceSpecs} sourceResourceSpecs - The resourceSpecs to be loaded. This will be copied into a modifiable
     * structure held at `resourceFetcher.resourceSpecs`
     * @param {Function} callback - An old-fashioned callback to be notified of the condition of the complete status
     * of the supplied `resourceSpecs` in either success or failure
     * @param {ResourceFetcherOptions} options - Options governing the entire fetch process (Can include
     * `locale, `defaultLocale`, `dataType`)
     * @param {Function} transformResourceURL - A function {String -> String} which maps URL/path entries in resource
     * specs, possibly by interpolating term values
     * @return {fluid.resourceFetcher} The constructed resourceFetcher, ready to have individual resources fetched by
     * an invocation of `fetchOneResource` or the entire set triggered via `fetchAll`
     */
    fluid.makeResourceFetcher = function (sourceResourceSpecs, callback, options, transformResourceURL) {
        options = options || {};
        var that = Object.create(fluid.resourceFetcher.prototype);
        fluid.extend(that, {
            sourceResourceSpecs: sourceResourceSpecs,
            options: fluid.copy(options),
            // We need to gate the launching of any requests on this promise, since resourceFetcher options arising from
            // models will arrive strictly later during construction.
            optionsReady: fluid.promise(),
            // This may fire multiple times during lifecycle if there are further calls to fetchAll - argument is completionPromise
            onInit: fluid.makeEventFirer({
                name: "onInit for resourceFetcher",
                ownerId: options.ownerComponentId
            }),
            transformResourceURL: transformResourceURL
        });
        /**
         * @name ResourceFetcher#fetchAll
         * @method
         * @see fluid.fetchResources.fetchAll
         * @return {Promise} The `completionPromise` for the fetcher which will yield the full state of fetched `resourceSpecs`
         * in either success or failure
         */
        that.fetchAll = function () {
            return fluid.fetchResources.fetchAll(that);
        };

        that.refetchAll = function () {
            return fluid.fetchResources.refetchAll(that);
        };

        /**
         * @name ResourceFetcher#fetchOneResource
         * @method
         * @see fluid.fetchResources.fetchOneResource
         * @param {String} key - The key within this fetcher's `resourceSpecs` for the resource to be fetched
         * @return {Promise} A promise for the resolution of the resourceSpec's fetched value
         */
        that.fetchOneResource = function (key) {
            return fluid.fetchResources.fetchOneResource(that.resourceSpecs[key], that);
        };

        /**
         * @name ResourceFetcher#refetchOneResource
         * @method
         * @see fluid.fetchResources.refetchOneResource
         * @param {String} key - The key within this fetcher's `resourceSpecs` for the resource to be fetched
         * @return {Promise} A promise for the resolution of the resourceSpec's fetched value
         */
        that.refetchOneResource = function (key) {
            return fluid.fetchResources.refetchOneResource(that.resourceSpecs[key], that);
        };

        /**
         * @name ResourceFetcher.resourceSpecs
         * @member {ResourceSpecs} The fully elaborated `resourceSpecs` structure that will be queried to fetch resources.
         * This should be considered as volatile and members such as, e.g., `locale` will be updated if the loader is
         * relocalised, and non-static members such as promises will be reinitialised
         */
        that.resourceSpecs = fluid.copy(that.sourceResourceSpecs);

        that.onInit.addListener(function (completionPromise) {
            completionPromise.then(callback, callback);
        });
        fluid.each(options.onInitListeners, function (args) {
            that.onInit.addListener.apply(null, args);
        });

        fluid.initResourceFetcher(that);

        fluid.each(that.resourceSpecs, function (resourceSpec, key) {
            fluid.fetchResources.subscribeOneResource(resourceSpec, key, that.options.ownerComponentId);
        });

        return that;
    };

    /** Trigger the fetching of all resources managed by this `resourceFetcher`. This is typically triggered by the
     * `onCreate` event of an owning `ResourceLoader`, or else by a standalone invocation of `fluid.fetchResources`.
     * It will start the process of fetching all resources which have not already been set in flight by individual
     * calls to `fetchOneResource`.
     * @param {resourceFetcher} resourceFetcher - The fetcher for which all resources will be loaded
     * @return {Promise} The `completionPromise` for the fetcher which will yield the full state of fetched `resourceSpecs`
     * in either success or failure
     */
    fluid.fetchResources.fetchAll = function (resourceFetcher) {
        fluid.each(resourceFetcher.resourceSpecs, function (resourceSpec) {
            fluid.fetchResources.fetchOneResource(resourceSpec, resourceFetcher);
        });
        // Deal with FLUID-6441 in case there are no outstanding resources
        fluid.fetchResources.checkCompletion(resourceFetcher.resourceSpecs, resourceFetcher);
        return resourceFetcher.completionPromise;
    };

    // A list of the resourceSpec fields which are considered mutable and modified during the fetch process.
    fluid.fetchResources.mutableResourceSpecFields = ["promise", "resourceText", "parsed", "locale", "defaultLocale"];

    /** Reinitialise a resourceFetcher and restart the process of fetching its resource. This will cancel the member `promise`,
     * and then delete it together with all the other mutable members listed in `mutableResourceSpecFields`.
     * If the flat `defeatInitiate` is not supplied this will also launch the overall process of refetching this resource
     * at the `resourceFetcher` level. If `defeatInitiate` is set to `true` it is assumed that the caller will call
     * `fluit.fetchResources.initiateRefetch` themselves once they have started the refetch for other resources.
     * @param {resourceSpec} resourceSpec - The `resourceSpec` designating the resource which will be refetched
     * @param {resourceFetcher} resourceFetcher - The fetcher holding the resource to be refetched
     * @param {Boolean} [defeatInitiate] - (optional) Unless this is set to `true`, this call will immediately start the
     * process of refetching the resource
     * @return {Promise} A promise for the resolution of the resource to be refetched
     */
    fluid.fetchResources.refetchOneResource = function (resourceSpec, resourceFetcher, defeatInitiate) {
        resourceSpec.promise.cancel();
        fluid.fetchResources.mutableResourceSpecFields.forEach(function (field) {
            delete resourceSpec[field];
        });
        fluid.fetchResources.initOneResource(resourceSpec);
        if (!defeatInitiate) {
            fluid.fetchResources.initiateRefetch(resourceFetcher);
        }
        return resourceSpec.promise;
    };

    /** Initiate the overall process of refetching any resources in the supplied `resourceFetcher` whose refetch has bee
     * scheduled with a previous call to `fluid.fetchResources.refetchOneResource`
     * @param {resourceFetcher} resourceFetcher - The fetcher for which all resources will be loaded
     */
    fluid.fetchResources.initiateRefetch = function (resourceFetcher) {
        resourceFetcher.completionPromise.cancel();
        delete resourceFetcher.completionPromise;
        fluid.initResourceFetcher(resourceFetcher);
        fluid.fetchResources.fetchAll(resourceFetcher);
        resourceFetcher.fetchAll();
    };

    /** Trigger the refetching of all resources managed by this `resourceFetcher`. By default, this will only fetch resources
     * which are localisable (that is, they have resource entries with a path field which can be interpolated for a locale)
     * @param {resourceFetcher} resourceFetcher - The fetcher for which all resources will be loaded
     * @param {Boolean} [withoutLocales] - (Optional) Set to `true` if this should also fetch resources which are not localisable
     * @return {Promise} The `completionPromise` for the fetcher which will yield the full state of fetched `resourceSpecs`
     * in either success or failure
     */
    fluid.fetchResources.refetchAll = function (resourceFetcher, withoutLocales) {
        var anyLaunched = false;
        fluid.each(resourceFetcher.resourceSpecs, function (resourceSpec) {
            if (resourceSpec.locale || withoutLocales) {
                anyLaunched = true;
                fluid.fetchResources.refetchOneResource(resourceSpec, resourceFetcher, true);
            }
        });
        if (anyLaunched) {
            fluid.fetchResources.initiateRefetch(resourceFetcher);
        }
        return resourceFetcher.completionPromise;
    };

    fluid.fetchResources.fireTransformEvent = function (resourceSpec, resourceFetcher) {
        return fluid.promise.fireTransformEvent(resourceSpec.transformEvent, null, {
            resourceSpec: resourceSpec,
            resourceFetcher: resourceFetcher
        });
    };

    /** Trigger the fetching of a single `resourceSpec` from a `resourceFetcher`. This is invoked, for example,
     * by the core framework on encountering a reference out from the main component's options demanding a value
     * dependent on the asynchronously resolved `resource` value.
     * @param {resourceSpec} resourceSpec - The `resourceSpec` designating the resource which will now be fetched
     * @param {resourceFetcher} resourceFetcher - The overall `resourceFetcher` governing the fetching of all
     * resources of which the supplied `resourceSpec` must be a member
     * @return {Promise} A promise for the resolution of the resourceSpec's fetched value
     */
    fluid.fetchResources.fetchOneResource = function (resourceSpec, resourceFetcher) {
        if (!resourceSpec.launched) {
            resourceSpec.launched = true;
            resourceFetcher.optionsReady.then(function () {
                var transformPromise = fluid.fetchResources.fireTransformEvent(resourceSpec, resourceFetcher);
                fluid.promise.follow(transformPromise, resourceSpec.promise);
                // Add these at the last possible moment so that individual resource disposition can beat them
                // TODO: Convert all these to "new firers"
                resourceSpec.promise.then(function () {
                    fluid.fetchResources.checkCompletion(resourceFetcher.resourceSpecs, resourceFetcher);
                }, function (error) {
                    resourceSpec.fetchError = error;
                    resourceSpec.onError.fire(error);
                    resourceFetcher.completionPromise.reject(error);
                });
            });
        }
        return resourceSpec.promise;
    };

    fluid.registerNamespace("fluid.resourceLoader.loaders");

    /** A function accepting a resourceSpec and yielding its fetched value
     * @callback OneResourceLoader
     * @param {ResourceSpec} resourceSpec - The resourceSpec to be loaded
     * @return {Promise|Any} A promise for the fetched value of the resource, or the value itself if it could be
     * loaded synchronously
     */

    /** A structure holding a resolved loader and also the `pathKey` determined to hold the structure member which
     * holds its path/url based on the duck typing inspection
     * @typedef {Object} ResolvedResourceLoader
     * @member {OneResourceLoader} loader - The loader to be used for fetching the resource
     * @member {String} pathKey - The key by which the field in the `resourceSpec` denoting the resource's path
     * can be looked up (in practice this will be "url" or "path")
     */

    /** The resourceLoader's listener to the `resourceLoader` area holding live updatable options (primarily locale)
     * governing refetching of resources.
     * @param {ResourceFetcher} resourceFetcher - The resourceLoader's `resourceFetcher` member
     * @param {ResourceFetcherOptions} modelOptions - The updated value of the modelised resourceFetcher options. These will be
     * re-overlayed on top of the statically configured options
     * @param {Boolean} early - `true` if this update results from the early initialisation phase of the `resourceLoader`'s model.
     * Note that this uses the special `earlyModelResolved` event of the ChangeApplier since we require to contribute back
     * into the model after resources are loaded, prior to the official model initialisation notification of modelListeners
     * during later construction.
     */
    fluid.resourceLoader.modelUpdated = function (resourceFetcher, modelOptions, early) {
        resourceFetcher.options = $.extend(true, {}, resourceFetcher.options, modelOptions);
        if (early) {
            resourceFetcher.optionsReady.resolve();
        } else {
            resourceFetcher.refetchAll();
        }
    };

    /** Render a resourceSpec into a form where it may be easily read in the console, primarily by censoring any
     * component instances such as DataSources that have been expanded into its definition
     * @param {ResourceSpec} resourceSpec - A resourceSpec to be rendered.
     * @return {ResourceSpec} A sanitised shallow clone of the resourceSpec
     */
    fluid.resourceLoader.sanitizeResourceSpec = function (resourceSpec) {
        return fluid.transform(resourceSpec, function (value) {
            return fluid.isPrimitive(value) || fluid.isPlainObject(value) && !fluid.isPromise(value) ? value : fluid.NO_VALUE;
        });
    };

    // "Immutable model resources" for FLUID-6581

    fluid.ImmutableArray = function () {};
    fluid.ImmutableArray.prototype = [];

    fluid.ImmutableObject = function () {};
    // fluid.ImmutableObject.prototype = {};

    fluid.resourceLoader.renderImmutable = function (parsed, resourceSpec) {
        if (resourceSpec.immutableModelResource) {
            var newContainer = fluid.isArrayable(parsed) ? new fluid.ImmutableArray() : new fluid.ImmutableObject();
            fluid.each(parsed, function (value, key) {
                newContainer[key] = value;
            });
            return newContainer;
        } else {
            return parsed;
        }
    };

    /** Given a resourceSpec, look up an appropriate `OneResourceLoader` function for fetching its value based on
     * inspecting the contents of `fluid.resourceLoader.loaders` for a matching processor for the duck typing field.
     * If no loader can be located, an exception will be thrown
     * @param {ResourceSpec} resourceSpec - The resourceSpec for which the loader is to be looked up
     * @return {ResolvedResourceLoader} A structure holding both the loader and also the key for the corresponding
     * duck typing field
     */
    fluid.resourceLoader.resolveResourceLoader = function (resourceSpec) {
        var loaders = [];
        fluid.each(fluid.resourceLoader.loaders, function (loader, key) {
            if (fluid.isValue(resourceSpec[key])) {
                loaders.push({
                    loader: loader,
                    pathKey: key
                });
            }
        });
        if (loaders.length === 0) {
            loaders.push({
                loader: fluid.resourceLoader.loaders.noLoader
            });
        } else if (loaders.length > 1) {
            fluid.fail("Resource spec ", fluid.resourceLoader.sanitizeResourceSpec(resourceSpec),
                " is ambiguous because it has fields for multiple resource loaders filled out: at most one of the fields ",
                fluid.getMembers(loaders, "pathKey"), " can be used");
        }
        return loaders[0];
    };

    /** A no-op `OneResourceLoader` which simply returns a pre-specified `resourceText`. Useful in the case the
     * real I/O has been done elsewhere and its results are simply to be relayed to another loader.
     * @param {ResourceSpec} resourceSpec - The `ResourceSpec` for which the `resourceText` field has already been filled in
     * @return {String} The `resourceSpec`'s `resourceText` member
     */
    fluid.resourceLoader.loaders.resourceText = function (resourceSpec) {
        return resourceSpec.resourceText;
    };

    fluid.resourceLoader.loaders.resourceText.noPath = true;

    /** A generalised 'promise' `OneResourceLoader` that allows some arbitrary asynchronous process to be
     * interpolated into the loader. The function `promiseFunc` is invoked with
     * arguments `promiseArg` yielding a promise representing successful or unsuccessful loading of the resource value
     * @param {ResourceSpec} resourceSpec - A `ResourceSpec` for which the `promiseFunc` field has already been filled in to hold
     * a function returning a promise
     * @return {Promise} The result of invoking `promiseFunc` with `promiseArgs`
     */
    fluid.resourceLoader.loaders.promiseFunc = function (resourceSpec) {
        var promiseFunc = fluid.event.resolveListener(resourceSpec.promiseFunc);
        return promiseFunc.apply(null, fluid.makeArray(resourceSpec.promiseArgs));
    };

    fluid.resourceLoader.loaders.promiseFunc.noPath = true;

    /** A `OneResourceLoader` which queries the `get` method of a DataSource in order to enact the required I/O
     * @param {ResourceSpec} resourceSpec - A `ResourceSpec` for which the `dataSource` field has already been filled in to hold
     * a reference to a `dataSource`, and perhaps also its `directModel` field.
     * @return {Promise} The resourceSpec's `promise` field
     */
    fluid.resourceLoader.loaders.dataSource = function (resourceSpec) {
        fluid.getForComponent(resourceSpec.dataSource, "get");
        return resourceSpec.dataSource.get(resourceSpec.directModel, resourceSpec.options);
    };

    fluid.resourceLoader.loaders.dataSource.noPath = true;
    fluid.resourceLoader.loaders.dataSource.parsed = true;

    /** A placeholder resource which always immediately resolves with a structured message reporting that no resource was
     * configured,
     * @param {ResourceSpec} resourceSpec - A `ResourceSpec` for which none of the fields designating another `OneResourceLoader`
     * have been filled out
     * @return {Promise} An already resolved promise holding a structured message
     */
    fluid.resourceLoader.loaders.noLoader = function (resourceSpec) {
        return fluid.promise().resolve({
            noResource: true,
            message: ["No resource was configured for resource spec ", fluid.resourceLoader.sanitizeResourceSpec(resourceSpec),
                "; since it had none of the fields fields ", Object.keys(fluid.resourceLoader.loaders) + " filled out"]
        });
    };

    fluid.resourceLoader.loaders.noLoader.noPath = true;
    fluid.resourceLoader.loaders.noLoader.parsed = true;

    fluid.registerNamespace("fluid.resourceLoader.parsers");

    /** A function accepting a fetched resource and parsing it into a more structured form. Given such a parser is
     * executed in an asynchronous chain, it should report failures as promise rejections rather than thrown exceptions.
     * @callback ResourceParser
     * @param {String} resourceText - The fetched value of the resource as a String
     * @return {Promise|Any} A parsed form of the resource
     */

    /** Looks up a suitable parser based on an inspection of the contents of `fluid.resourceLoader.parsers` for an
     * implementation matching the `dataType` field in the supplied `resourceSpec`. If there is no such field or
     * the lookup fails, returns `fluid.identity`
     * @param {ResourceSpec} resourceSpec - The resourceSpec for which a parser is to be looked up
     * @return {ResourceParser} An appropriate parser for the resource's dataType, or `fluid.identity` if no such
     * parser is appropriate
     */
    fluid.resourceLoader.resolveResourceParser = function (resourceSpec) {
        return !resourceSpec.loader.loader.parsed && fluid.resourceLoader.parsers[resourceSpec.dataType] || fluid.identity;
    };

    /** Parses a fetched resource text as JSON
     * @param {String} resourceText - The text to be parsed
     * @return {Promise} A promise yielding the `resourceText` parsed as JSON, or else a rejection holding a readable
     * description of the location of the parse failure
     */
    fluid.resourceLoader.parsers.json = function (resourceText) {
        return fluid.dataSource.parseJSON(resourceText);
    };

    // Note: near-copy of fluid.invokersMergePolicy
    fluid.resourcesMergePolicy = function (target, source) {
        target = target || {};
        fluid.each(source, function (oneResource, name) {
            if (!oneResource) {
                target[name] = oneResource;
                return;
            // Backwards compatibility for Infusion 2.x-style resources assumes that a string resource was meant to be a url
            } else if (fluid.isPrimitive(oneResource)) {
                oneResource = {url: oneResource};
            }
            var oneR = target[name];
            if (!oneR) {
                oneR = target[name] = {};
            }
            for (var key in fluid.resourceLoader.loaders) {
                if (key in oneResource) {
                    for (var key2 in fluid.resourceLoader.loaders) {
                        delete oneR[key2];
                    }
                }
            }
            $.extend(oneR, oneResource);
        });
        return target;
    };

    /*** The top-level grade fluid.resourceLoader itself ***/

    /**
     * A configurable component to allow users to load multiple resources by issuance of I/O.
     * The resources can be localised by means of options `locale`, `defaultLocale`. Once all
     * resources are loaded, the event `onResourcesLoaded` will be fired, which can be used
     * to time the creation of components dependent on the resources. In addition, any resources
     * requested during the construction of a component can be used to delay its construction until
     * they are consumed by some component workflow.
     */

    fluid.defaults("fluid.resourceLoader", {
        gradeNames: ["fluid.modelComponent"],
        listeners: {
            /* On construction of the resourceLoader, kick off the process of fetching all the resources configured
             * within its resourceFetcher. Note that some or all of these resources may already have been fetched by
             * demands occuring during component startup (e.g. as initial model values or renderer templates), and so
             * the `onResourcesLoaded` event may fire immediately
             */
            "onCreate.loadResources": "{that}.resourceFetcher.fetchAll",
            "onDestroy.destroyResourceEvents": "fluid.resourceLoader.destroyResourceEvents({that}.resourceFetcher)",
            "{that}.resourceFetcher.onInit": {
                namespace: "resourceLoaderCompletion",
                funcName: "fluid.resourceLoader.subscribeCompletion",
                args: ["{arguments}.0", "{that}"]
            },
            "{that}.applier.earlyModelResolved": {
                funcName: "fluid.resourceLoader.modelUpdated",
                args: ["{that}.resourceFetcher", "{arguments}.0.resourceLoader", true]
            }
        },
        modelListeners: {
            resourceLoader: {
                namespace: "resourceLoader",
                funcName: "fluid.resourceLoader.modelUpdated",
                excludeSource: "init",
                args: ["{that}.resourceFetcher", "{change}.value"]
            }
        },
        mergePolicy: {
            resources: fluid.resourcesMergePolicy
        },
        members: {
            resourceFetcher: {
                expander: {
                    funcName: "fluid.resourceLoader.makeResourceFetcher",
                    args: ["{that}", "{that}.options.resources", "{that}.options.resourceOptions", "{that}.transformResourceURL"]
                }
            }/*,
            // These arrive dynamically by means of the framework's workflow function
            resources: {}
            */
        },
        resourceOptions: {
            // defaultLocale: "en", // May be supplied by integrators
            // locale: "en", // May be supplied by integrators
            // dataType: "json" // May be supplied by integrators
            terms: {}  // May be supplied by integrators
        },
        resources: {},  // Must be supplied by integrators
        invokers: {
            transformResourceURL: {
                funcName: "fluid.stringTemplate",
                args: ["{arguments}.0", "{that}.options.resourceOptions.terms"]
            }
        },
        events: {
            onResourcesLoaded: null,
            onResourceError: null
        }
    });

    /** Constructs a `fluid.resourceLoader' component's own `resourceFetcher` machine. Given that component options
     * are immutable, it takes a copy of the supplied `resourceSpecs` option (taken from the `resources` top-level
     * component option) before passing them to the fetcher's mutable copy at `resourceFetcher.resourceSpecs`
     * @param {fluid.resourceLoader} that - The resourceLoader component for which the fetcher is to be constructed
     * (currently used to target the delivery of the delivered `that.resources` members, and relay resource errors)
     * @param {ResourceSpecs} resourceSpecs - The resourceSpecs structure held in `options.resources` of the
     * @param {ResourceFetcherOptions} userResourceOptions - Options governing the entire resource fetcher (currently
     * `locale`, `defaultLocale` and `terms`)
     * @param {Function} transformResourceURL - A function {String -> String} which maps URL/path entries in resource
     * specs, possibly by interpolating term values
     * @return {ResourceFetcher} The ResourceFetcher ready to be attached to the ResourceLoader's top level
     */
    fluid.resourceLoader.makeResourceFetcher = function (that, resourceSpecs, userResourceOptions, transformResourceURL) {
        var resourceOptions = $.extend({
            ownerComponentId: that.id, // For debuggability
            ownerComponentPath: fluid.pathForComponent(that),
            onInitListeners: [[function (completionPromise) {
                fluid.resourceLoader.subscribeCompletion(completionPromise, that);
            }, "resourceLoaderCompletion"]]
        }, userResourceOptions);
        var fetcher = fluid.makeResourceFetcher(resourceSpecs, null, resourceOptions, transformResourceURL);
        fluid.each(fetcher.resourceSpecs, function (resourceSpec, key) {
            resourceSpec.transformEvent.addListener(function (parsed) {
                that.resources[key] = resourceSpec;
                return parsed;
            }, "noteComponentResource", "after:parsed");
            resourceSpec.onError.addListener(that.events.onResourceError.fire);
        });
        return fetcher;
    };

    /* Subscribe for completion of a complete fetch of resources from the resourceLoader
     * @param {Promise} completionPromise - The completion promise to be subscribed to
     * @param {fluid.resourceLoader} that - The loader for which the I/O fetch process is to be started
     */
    fluid.resourceLoader.subscribeCompletion = function (completionPromise, resourceLoader) {
        completionPromise.then(function () {
            resourceLoader.events.onResourcesLoaded.fire(resourceLoader.resourceFetcher.resourceSpecs);
        }, function (error) {
            // Note that if the failure was for a resource demanded during startup, this component will already have
            // been destroyed.
            // Note that this failure may also be logged by initFreeComponent for a free construction without a rejection handler
            fluid.log("Failure loading resources for component at path " + fluid.dumpComponentPath(resourceLoader) + ": ", error);
        });
    };

    fluid.resourceLoader.destroyResourceEvents = function (resourceFetcher) {
        fluid.each(resourceFetcher.resourceSpecs, function (resourceSpec) {
            resourceSpec.transformEvent.destroy();
            resourceSpec.onFetched.destroy();
        });
    };

})(jQuery, fluid_3_0_0);
