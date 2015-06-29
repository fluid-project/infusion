/*
Copyright 2010-2011 OCAD University
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /** NOTE: All contents of this file are DEPRECATED and no entry point should be considered a supported API **/

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
        return exploded;
    };

    /** Framework-global caching state for fluid.fetchResources **/

    var resourceCache = {};

    var pendingClass = {};

    /** Accepts a hash of structures with free keys, where each entry has either
     * href/url or nodeId set - on completion, callback will be called with the populated
     * structure with fetched resource text in the field "resourceText" for each
     * entry. Each structure may contain "options" holding raw options to be forwarded
     * to jQuery.ajax().
     */

    fluid.fetchResources = function(resourceSpecs, callback, options) {
        var that = fluid.initLittleComponent("fluid.fetchResources", options);
        that.resourceSpecs = resourceSpecs;
        that.callback = callback;
        that.operate = function() {
            fluid.fetchResources.fetchResourcesImpl(that);
        };
        fluid.each(resourceSpecs, function(resourceSpec, key) {
            resourceSpec.recurseFirer = fluid.makeEventFirer({name: "I/O completion for resource \"" + key + "\""});
            resourceSpec.recurseFirer.addListener(that.operate);
            if (resourceSpec.url && !resourceSpec.href) {
                resourceSpec.href = resourceSpec.url;
            }
            if (that.options.defaultLocale) {
                resourceSpec.defaultLocale = that.options.defaultLocale;
                if (resourceSpec.locale === undefined) {
                    resourceSpec.locale = that.options.defaultLocale;
                }
            }
        });
        if (that.options.amalgamateClasses) {
            fluid.fetchResources.amalgamateClasses(resourceSpecs, that.options.amalgamateClasses, that.operate);
        }
        fluid.fetchResources.explodeForLocales(resourceSpecs);
        that.operate();
        return that;
    };

    fluid.fetchResources.explodeForLocales = function (resourceSpecs) {
        fluid.each(resourceSpecs, function (resourceSpec, key) {
            if (resourceSpec.locale) {
                var exploded = fluid.explodeLocalisedName(resourceSpec.href, resourceSpec.locale, resourceSpec.defaultLocale);
                for (var i = 0; i < exploded.length; ++ i) {
                    var newKey = key + "$localised-" + i;
                    var newRecord = $.extend(true, {}, resourceSpec, {
                        href: exploded[i],
                        localeExploded: true
                    });
                    resourceSpecs[newKey] = newRecord;
                }
                resourceSpec.localeExploded = exploded.length;
            }
        });
        return resourceSpecs;
    };

    fluid.fetchResources.condenseOneResource = function (resourceSpecs, resourceSpec, key, localeCount) {
        var localeSpecs = [resourceSpec];
        for (var i = 0; i < localeCount; ++ i) {
            var localKey = key + "$localised-" + i;
            localeSpecs.unshift(resourceSpecs[localKey]);
            delete resourceSpecs[localKey];
        }
        var lastNonError = fluid.find_if(localeSpecs, function (spec) {
            return !spec.fetchError;
        });
        if (lastNonError) {
            resourceSpecs[key] = lastNonError;
        }
    };

    fluid.fetchResources.condenseForLocales = function (resourceSpecs) {
        fluid.each(resourceSpecs, function (resourceSpec, key) {
            if (typeof(resourceSpec.localeExploded) === "number") {
                fluid.fetchResources.condenseOneResource(resourceSpecs, resourceSpec, key, resourceSpec.localeExploded);
            }
        });
    };

    fluid.fetchResources.notifyResources = function (that, resourceSpecs, callback) {
        fluid.fetchResources.condenseForLocales(resourceSpecs);
        callback(resourceSpecs);
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    // Add "synthetic" elements of *this* resourceSpec list corresponding to any
    // still pending elements matching the PROLEPTICK CLASS SPECIFICATION supplied
    fluid.fetchResources.amalgamateClasses = function(specs, classes, operator) {
        fluid.each(classes, function(clazz) {
            var pending = pendingClass[clazz];
            fluid.each(pending, function(pendingrec, canon) {
                specs[clazz+"!"+canon] = pendingrec;
                pendingrec.recurseFirer.addListener(operator);
            });
        });
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.fetchResources.timeSuccessCallback = function(resourceSpec) {
        if (resourceSpec.timeSuccess && resourceSpec.options && resourceSpec.options.success) {
            var success = resourceSpec.options.success;
            resourceSpec.options.success = function() {
                var startTime = new Date();
                var ret = success.apply(null, arguments);
                fluid.log("External callback for URL " + resourceSpec.href + " completed - callback time: " +
                        (new Date().getTime() - startTime.getTime()) + "ms");
                return ret;
            };
        }
    };

    // TODO: Integrate punch-through from old Engage implementation
    function canonUrl(url) {
        return url;
    }

    fluid.fetchResources.clearResourceCache = function(url) {
        if (url) {
            delete resourceCache[canonUrl(url)];
        }
        else {
            fluid.clear(resourceCache);
        }
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.fetchResources.handleCachedRequest = function(resourceSpec, response, fetchError) {
        var canon = canonUrl(resourceSpec.href);
        var cached = resourceCache[canon];
        if (cached.$$firer$$) {
            fluid.log("Handling request for " + canon + " from cache");
            var fetchClass = resourceSpec.fetchClass;
            if (fetchClass && pendingClass[fetchClass]) {
                fluid.log("Clearing pendingClass entry for class " + fetchClass);
                delete pendingClass[fetchClass][canon];
            }
            var result = {response: response, fetchError: fetchError};
            resourceCache[canon] = result;
            cached.fire(response, fetchError);
        }
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.fetchResources.completeRequest = function(thisSpec) {
        thisSpec.queued = false;
        thisSpec.completeTime = new Date();
        fluid.log("Request to URL " + thisSpec.href + " completed - total elapsed time: " +
            (thisSpec.completeTime.getTime() - thisSpec.initTime.getTime()) + "ms");
        thisSpec.recurseFirer.fire();
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.fetchResources.makeResourceCallback = function(thisSpec) {
        return {
            success: function(response) {
                thisSpec.resourceText = response;
                thisSpec.resourceKey = thisSpec.href;
                if (thisSpec.forceCache) {
                    fluid.fetchResources.handleCachedRequest(thisSpec, response);
                }
                fluid.fetchResources.completeRequest(thisSpec);
            },
            error: function(response, textStatus, errorThrown) {
                thisSpec.fetchError = {
                    status: response.status,
                    textStatus: response.textStatus,
                    errorThrown: errorThrown
                };
                if (thisSpec.forceCache) {
                    fluid.fetchResources.handleCachedRequest(thisSpec, null, thisSpec.fetchError);
                }
                fluid.fetchResources.completeRequest(thisSpec);
            }

        };
    };


    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.fetchResources.issueCachedRequest = function(resourceSpec, options) {
        var canon = canonUrl(resourceSpec.href);
        var cached = resourceCache[canon];
        if (!cached) {
            fluid.log("First request for cached resource with url " + canon);
            cached = fluid.makeEventFirer({name: "cache notifier for resource URL " + canon});
            cached.$$firer$$ = true;
            resourceCache[canon] = cached;
            var fetchClass = resourceSpec.fetchClass;
            if (fetchClass) {
                if (!pendingClass[fetchClass]) {
                    pendingClass[fetchClass] = {};
                }
                pendingClass[fetchClass][canon] = resourceSpec;
            }
            options.cache = false; // TODO: Getting weird "not modified" issues on Firefox
            $.ajax(options);
        }
        else {
            if (!cached.$$firer$$) {
                if (cached.response) {
                    options.success(cached.response);
                } else {
                    options.error(cached.fetchError);
                }
            }
            else {
                fluid.log("Request for cached resource which is in flight: url " + canon);
                cached.addListener(function(response, fetchError) {
                    if (response) {
                        options.success(response);
                    } else {
                        options.error(fetchError);
                    }
                });
            }
        }
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    // Compose callbacks in such a way that the 2nd, marked "external" will be applied
    // first if it exists, but in all cases, the first, marked internal, will be
    // CALLED WITHOUT FAIL
    fluid.fetchResources.composeCallbacks = function (internal, external) {
        return external ? (internal ?
        function () {
            try {
                external.apply(null, arguments);
            }
            catch (e) {
                fluid.log("Exception applying external fetchResources callback: " + e);
            }
            internal.apply(null, arguments); // call the internal callback without fail
        } : external ) : internal;
    };

    // unsupported, NON-API function
    fluid.fetchResources.composePolicy = function(target, source) {
        return fluid.fetchResources.composeCallbacks(target, source);
    };

    fluid.defaults("fluid.fetchResources.issueRequest", {
        mergePolicy: {
            success: fluid.fetchResources.composePolicy,
            error: fluid.fetchResources.composePolicy,
            url: "reverse"
        }
    });

    // unsupported, NON-API function
    fluid.fetchResources.issueRequest = function(resourceSpec, key) {
        var thisCallback = fluid.fetchResources.makeResourceCallback(resourceSpec);
        var options = {
            url:     resourceSpec.href,
            success: thisCallback.success,
            error:   thisCallback.error,
            dataType: resourceSpec.dataType || "text"
        };
        fluid.fetchResources.timeSuccessCallback(resourceSpec);
        options = fluid.merge(fluid.defaults("fluid.fetchResources.issueRequest").mergePolicy,
                      options, resourceSpec.options);
        resourceSpec.queued = true;
        resourceSpec.initTime = new Date();
        fluid.log("Request with key " + key + " queued for " + resourceSpec.href);

        if (resourceSpec.forceCache) {
            fluid.fetchResources.issueCachedRequest(resourceSpec, options);
        }
        else {
            $.ajax(options);
        }
    };


    fluid.fetchResources.fetchResourcesImpl = function(that) {
        var complete = true;
        var allSync = true;
        var resourceSpecs = that.resourceSpecs;
        for (var key in resourceSpecs) {
            var resourceSpec = resourceSpecs[key];
            if (!resourceSpec.options || resourceSpec.options.async) {
                allSync = false;
            }
            if (resourceSpec.href && !resourceSpec.completeTime) {
                if (!resourceSpec.queued) {
                    fluid.fetchResources.issueRequest(resourceSpec, key);
                }
                if (resourceSpec.queued) {
                    complete = false;
                }
            }
            else if (resourceSpec.nodeId && !resourceSpec.resourceText) {
                var node = document.getElementById(resourceSpec.nodeId);
                // upgrade this to somehow detect whether node is "armoured" somehow
                // with comment or CDATA wrapping
                resourceSpec.resourceText = fluid.dom.getElementText(node);
                resourceSpec.resourceKey = resourceSpec.nodeId;
            }
        }
        if (complete && that.callback && !that.callbackCalled) {
            that.callbackCalled = true;
            if ($.browser.mozilla && !allSync) {
                // Defer this callback to avoid debugging problems on Firefox
                setTimeout(function() {
                    fluid.fetchResources.notifyResources(that, resourceSpecs, that.callback);
                }, 1);
            }
            else {
                fluid.fetchResources.notifyResources(that, resourceSpecs, that.callback);
            }
        }
    };

    // TODO: This framework function is a stop-gap before the "ginger world" is capable of
    // asynchronous instantiation. It currently performs very poor fidelity expansion of a
    // component's options to discover "resources" only held in the static environment
    fluid.fetchResources.primeCacheFromResources = function(componentName) {
        var resources = fluid.defaults(componentName).resources;
        var expanded = (fluid.expandOptions ? fluid.expandOptions : fluid.identity)(fluid.copy(resources));
        fluid.fetchResources(expanded);
    };

    /** Utilities invoking requests for expansion **/
    fluid.registerNamespace("fluid.expander");

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.expander.makeDefaultFetchOptions = function (successdisposer, failid, options) {
        return $.extend(true, {dataType: "text"}, options, {
            success: function(response, environmentdisposer) {
                var json = JSON.parse(response);
                environmentdisposer(successdisposer(json));
            },
            error: function(response, textStatus) {
                fluid.log("Error fetching " + failid + ": " + textStatus);
            }
        });
    };

    /*
     * This function is unsupported: It is not really intended for use by implementors.
     */
    fluid.expander.makeFetchExpander = function (options) {
        return { expander: {
            type: "fluid.expander.deferredFetcher",
            href: options.url,
            options: fluid.expander.makeDefaultFetchOptions(options.disposer, options.url, options.options),
            resourceSpecCollector: "{resourceSpecCollector}",
            fetchKey: options.fetchKey
        }};
    };

    fluid.expander.deferredFetcher = function(deliverer, source, expandOptions) {
        var expander = source.expander;
        var spec = fluid.copy(expander);
        // fetch the "global" collector specified in the external environment to receive
        // this resourceSpec
        var collector = fluid.expand(expander.resourceSpecCollector, expandOptions);
        delete spec.type;
        delete spec.resourceSpecCollector;
        delete spec.fetchKey;
        var environmentdisposer = function(disposed) {
            deliverer(disposed);
        };
        // replace the callback which is there (taking 2 arguments) with one which
        // directly responds to the request, passing in the result and OUR "disposer" -
        // which once the user has processed the response (say, parsing JSON and repackaging)
        // finally deposits it in the place of the expander in the tree to which this reference
        // has been stored at the point this expander was evaluated.
        spec.options.success = function(response) {
            expander.options.success(response, environmentdisposer);
        };
        var key = expander.fetchKey || fluid.allocateGuid();
        collector[key] = spec;
        return fluid.NO_VALUE;
    };

    /** Start dataSource **/

    /*
     * A grade defining a DataSource.
     * This grade illustrates the expected structure a dataSource, as well as
     * providing a means for identifying dataSources in a component tree by type.
     *
     * The purpose of the "dataSource" abstraction is to express indexed access
     * to state. A REST/CRUD implementation is an example of a DataSource; however,
     * it is not limited to this method of interaction.
     */
    fluid.defaults("fluid.dataSource", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
        // Invokers should be defined for the typical CRUD functions and return
        // a promise.
        //
        // The "get" and "delete" methods require the signature (directModel).
        // The "set" method requires the signature (directModel, model)
        //
        // directModel: An object expressing an "index" into some set of
        //              state which can be read or written.
        //
        // model: The payload sent to the storage.
        //
        // options: An object expressing implementation specific details
        //          regarding the handling of a request. Note: this does not
        //          include details for identifying the resource. Those should be
        //          placed in the directModel.
        //
        // invokers: {
        //     "get": {}, // handles the Read function
        //     "set": {}, // handles the Create and Update functions
        //     "delete": {} // handles the Delete function
        // }
    });

    /*
     * Converts an object or array to string for use as a key.
     * The objects are sorted alphabetically to insure that they
     * result in the same string across executions.
     */
    fluid.objectToHashKey = function (obj) {
        var str = fluid.isArrayable(obj) ? "array " : "object ";
        var keys = fluid.keys(obj).sort();

        fluid.each(keys, function (key) {
            var val = obj[key];
            str += key + ":" + fluid.toHashKey(val);
        });

        return str;
    };

    /*
     * Generates a string for use as a key.
     * They typeof of the value passed in will be prepended
     * to ensure that (strings vs numbers) and (arrays vs objects)
     * are distinguishable.
     */
    fluid.toHashKey = function (val) {
        var str;
        if(fluid.isPlainObject(val)){
            str = "<" + fluid.objectToHashKey(val) + ">";
        } else {
            str = "|" + JSON.stringify(val) + "|";
        }
        return str;
    };

    /*
     * A dataSource wrapper providing a queuing mechanism for requests.
     * Requests are queued based on type (read/write) and resource (directModel).
     *
     * A fully implemented dataSource, following the structure outlined by fluid.dataSource,
     * must be provided in the wrappedDataSource subcomponent. The get, set, and delete methods
     * found on the queuedDataSource will call their counterparts in the wrappedDataSource, after
     * filtering through the appropriate queue.
     *
     * TODO: A fully realized implementation should provide a mechanism for working with a local
     *       cache. For example pending write requests could be used to service get requests directly.
     */
    fluid.defaults("fluid.queuedDataSource", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        members: {
            requests: {
                read: {},
                write: {}
            }
        },
        components: {
            wrappedDataSource: {
                // requires a dataSource that implements the standard set, get, and delete methods.
                type: "fluid.dataSource"
            }
        },
        events: {
            enqueued: null,
            afterRequestComplete: null
        },
        listeners: {
            "enqueued.start": {
                listener: "{that}.start",
                args: ["{arguments}.1"]
            },
            "afterRequestComplete.start": {
                listener: "{that}.start",
                args: ["{arguments}.1"]
            }
        },
        invokers: {
            // The add to queue method needs to be provided by the integrator
            // addToQueue: "",
            // addToQueue: {funcName: "fluid.identity"},
            set: {
                funcName: "fluid.queuedDataSource.enqueueWithModel",
                args: ["{that}", "{that}.requests.write", "{wrappedDataSource}.set", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            get: {
                funcName: "fluid.queuedDataSource.enqueue",
                args: ["{that}", "{that}.requests.read", "{wrappedDataSource}.get", "{arguments}.0", "{arguments}.1"]
            },
            "delete": {
                funcName: "fluid.queuedDataSource.enqueue",
                args: ["{that}", "{that}.requests.write", "{wrappedDataSource}.delete", "{arguments}.0", "{arguments}.1"]
            },
            start: {
                funcName: "fluid.queuedDataSource.start",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    fluid.queuedDataSource.start = function (that, queue) {
        if (!queue.isActive && queue.requests.length) {
            var request = queue.requests.shift();

            var requestComplete = function () {
                queue.isActive = false;
                that.events.afterRequestComplete.fire(request, queue);
            };

            queue.isActive = true;
            var args = "model" in request ? [request.directModel, request.model, request.options] : [request.directModel, request.options];
            var response = request.method.apply(null, args);

            response.then(requestComplete, requestComplete);
            fluid.promise.follow(response, request.promise);
        }
    };

    /*
     * Adds only one item to the queue at a time, new requests replace older ones
     *
     * The request object contains the request function and arguments.
     * In the form {method: requestFn, directModel: {}, model: {}, callback: callbackFn}
     */
    fluid.queuedDataSource.enqueueImpl = function (that, addToQueueFn, requestsQueue, request) {
        var promise = fluid.promise();
        var key = fluid.toHashKey(request.directModel);
        var queue = requestsQueue[key];

        // add promise to the request object
        // to be resolved in the start method
        // when the wrapped dataSource's request returns.
        request.promise = promise;

        // create a queue if one doesn't already exist
        if (!queue) {
            queue = {
                isActive: false,
                requests: []
            };
            requestsQueue[key] = queue;
        }

        if (typeof(addToQueueFn) === "string") {
            fluid.invokeGlobalFunction(addToQueueFn, [queue, request]);
        } else {
            addToQueueFn(queue, request);
        }

        that.events.enqueued.fire(request, queue);

        return promise;
    };

    fluid.queuedDataSource.enqueue = function (that, requestsQueue, method, directModel, options) {
        var request = {
            method: method,
            directModel: directModel,
            options: options
        };

        return fluid.queuedDataSource.enqueueImpl(that, that.addToQueue, requestsQueue, request);
    };

    fluid.queuedDataSource.enqueueWithModel = function (that, requestsQueue, method, directModel, model, options) {
        var request = {
            method: method,
            directModel: directModel,
            model: model,
            options: options
        };

        return fluid.queuedDataSource.enqueueImpl(that, that.addToQueue, requestsQueue, request);
    };

    fluid.queuedDataSource.replaceRequest = function (queue, request) {
        queue.requests[0] = request;
    };

    /*
     * A dataSource wrapper providing a debounce queuing mechanism for requests.
     * Requests are queued based on type (read/write) and resource (directModel).
     * Only 1 requested is queued at a time. New requests replace older ones.
     *
     * A fully implemented dataSource, following the structure outlined by fluid.dataSource,
     * must be provided in the wrappedDataSource subcomponent. The get, set, and delete methods
     * found on the queuedDataSource will call their counterparts in the wrappedDataSource, after
     * filtering through the appropriate queue.
     */
    fluid.defaults("fluid.debouncedDataSource", {
        gradeNames: ["fluid.queuedDataSource", "autoInit"],
        invokers: {
            addToQueue: "fluid.queuedDataSource.replaceRequest"
        }
    });

    /** End dataSource **/

})(jQuery, fluid_2_0);
