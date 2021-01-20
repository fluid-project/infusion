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

    /** NOTE: Much of this work originated from
     * https://github.com/fluid-project/kettle/blob/main/lib/dataSource-core.js and
     * https://github.com/fluid-project/kettle/blob/main/lib/dataSource-url.js
     ***/

    /** Some common content encodings - suitable to appear as the "encoding" subcomponent of a dataSource **/

    fluid.defaults("fluid.dataSource.encoding.JSON", {
        gradeNames: "fluid.component",
        invokers: {
            parse: "fluid.dataSource.parseJSON",
            render: "fluid.dataSource.stringifyJSON"
        },
        contentType: "application/json"
    });

    fluid.defaults("fluid.dataSource.encoding.none", {
        gradeNames: "fluid.component",
        invokers: {
            parse: "fluid.identity",
            render: "fluid.identity"
        },
        contentType: "text/plain"
    });

    fluid.dataSource.parseJSON = function (string) {
        var togo = fluid.promise();
        if (!string) {
            togo.resolve(undefined);
        } else {
            try {
                togo.resolve(JSON.parse(string));
            } catch (err) {
                togo.reject(err);
            }
        }
        return togo;
    };

    fluid.dataSource.stringifyJSON = function (obj) {
        return obj === undefined ? "" : JSON.stringify(obj, null, 4);
    };

    /**
     * The head of the hierarchy of dataSource components. These abstract
     * over the process of read and write access to data, following a simple CRUD-type semantic, indexed by
     * a coordinate model (directModel) and which may be asynchronous.
     * Top-level methods are:
     *     get(directModel[, callback|options] -        to get the data from data resource
     *     set(directModel, model[, callback|options] - to set the data
     *
     *
     * directModel: An object expressing an "index" into some set of
     *              state which can be read or written.
     *
     * model: The payload sent to the storage.
     *
     * options: An object expressing implementation specific details
     *          regarding the handling of a request. Note: this does not
     *          include details for identifying the resource. Those should be
     *          placed in the directModel.
     */
    fluid.defaults("fluid.dataSource", {
        gradeNames: ["fluid.component", "fluid.contextAware"],
        contextAwareness: {
            writable: {
                checks: {
                    writableValue: {
                        contextValue: "{fluid.dataSource}.options.writable",
                        gradeNames: "{fluid.dataSource}.options.writableGrade"
                    }
                }
            }
        },
        writable: false,
        events: {
            // The "onRead" event is operated in a custom workflow by fluid.fireTransformEvent to
            // process dataSource payloads during the get process. Each listener receives the data returned by the last.
            onRead: null,
            onError: null
        },
        components: {
            encoding: {
                type: "fluid.dataSource.encoding.JSON"
            }
        },
        listeners: {
            // handler for "onRead.impl" must be implemented by a concrete subgrade
            // Note: The intial payload (first argument) will be undefined
            "onRead.impl": {
                func: "fluid.notImplemented",
                priority: "first"
            },
            "onRead.encoding": {
                func: "{encoding}.parse",
                priority: "after:impl"
            }
        },
        invokers: {
            get: {
                funcName: "fluid.dataSource.get",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // directModel, directOptions
            }
        }
    });


    /**
     * Base grade for adding write configuration to a dataSource. Because of issues like FLUID-5800, this is a pure
     * mixin grade. The related writable grade to a concrete DataSource grade is listed in its "writableGrade" options,
     * which response to the "writable: true" option via ContextAwareness.
     */
    fluid.defaults("fluid.dataSource.writable", {
        gradeNames: ["fluid.component"],
        events: {
            // events "onWrite" and "onWriteResponse" are operated in a custom workflow by fluid.fireTransformEvent to
            // process dataSource payloads during the set process. Each listener receives the data returned by the last.
            onWrite: null,
            onWriteResponse: null
        },
        listeners: {
            "onWrite.encoding": {
                func: "{encoding}.render"
            },
            // handler for "onWrite.impl" must be implemented by a concrete subgrade
            "onWrite.impl": {
                func: "fluid.notImplemented",
                priority: "after:encoding"
            },
            "onWriteResponse.encoding": {
                func: "{encoding}.parse"
            }
        },
        invokers: {
            set: {
                funcName: "fluid.dataSource.set",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // directModel, model, directOptions
            }
        }
    });

    // Registers the default promise handlers for a dataSource operation -
    // i) If the user has supplied a function in place of method `options`, register this function as a success handler
    // ii) if the user has supplied an onError handler in method `options`, this is registered - otherwise
    // we register the firer of the dataSource's own onError method.

    fluid.dataSource.registerStandardPromiseHandlers = function (that, promise, requestOptions) {
        promise.then(requestOptions.callback, requestOptions.onError ? requestOptions.onError : that.events.onError.fire);
    };

    fluid.dataSource.defaultiseOptions = function (componentOptions, directOptions, directModel, isSet) {
        var options = typeof(directOptions) === "function" ? {
            callback: directOptions
        } : fluid.copy(directOptions) || {};
        options.directModel = directModel;
        options.operation = isSet ? "set" : "get";
        options.notFoundIsEmpty = options.notFoundIsEmpty || componentOptions.notFoundIsEmpty;
        return options;
    };

    /** Operate the core "transforming promise workflow" of a dataSource's `get` method. The initial listener provides the initial payload;
     *  which then proceeds through the transform chain to arrive at the final payload.
     * @param {fluid.dataSource} that - The dataSource itself
     * @param {Object} [directModel] - The direct model expressing the "coordinates" of the model to be fetched
     * @param {Object|Function} [directOptions] - A success callback, or a structure of options configuring the action of this get request,  - many of these will be specific to the particular concrete DataSource
     * @return {Promise} A promise for the final resolved payload
     */
    fluid.dataSource.get = function (that, directModel, directOptions) {
        var requestOptions = fluid.dataSource.defaultiseOptions(that.options, directOptions, directModel);
        var promise = fluid.promise.fireTransformEvent(that.events.onRead, undefined, requestOptions);
        fluid.dataSource.registerStandardPromiseHandlers(that, promise, requestOptions);
        return promise;
    };

    /** Operate the core "transforming promise workflow" of a dataSource's `set` method.
     * Any return from this is then pushed forwards through a range of the transforms (typically, e.g. just decoding it as JSON)
     * on its way back to the user via the onWriteResponse event.
     * @param {fluid.dataSource} that - The dataSource itself
     * @param {Object} [directModel] - The direct model expressing the "coordinates" of the model to be written
     * @param {Any} model - The payload to be written to the dataSource
     * @param {Object|Function} [directOptions] - A success callback, or a structure of options configuring the action of this set request - many of these will be specific to the particular concrete DataSource
     * @return {Promise} A promise for the final resolved payload (not all DataSources will provide any for a `set` method)
     */
    fluid.dataSource.set = function (that, directModel, model, directOptions) {
        var requestOptions = fluid.dataSource.defaultiseOptions(that.options, directOptions, directModel, true); // shared and writeable between all participants
        var transformPromise = fluid.promise.fireTransformEvent(that.events.onWrite, model, requestOptions);
        var togo = fluid.promise();
        transformPromise.then(function (setResponse) {
            var options2 = fluid.dataSource.defaultiseOptions(that.options, fluid.copy(requestOptions), directModel);
            var retransformed = fluid.promise.fireTransformEvent(that.events.onWriteResponse, setResponse, options2);
            fluid.promise.follow(retransformed, togo);
        }, function (error) {
            togo.reject(error);
        });
        fluid.dataSource.registerStandardPromiseHandlers(that, togo, requestOptions);
        return togo;
    };


    /**** PORTABLE URL DATASOURCE SUPPORT ****/

    fluid.defaults("fluid.dataSource.URL", {
        gradeNames: ["fluid.dataSource"],
        writableGrade: "fluid.dataSource.URL.writable",
        invokers: {
            resolveUrl: "fluid.dataSource.URL.resolveUrl", // url, termMap, directModel, noencode
            handleHttp: "fluid.dataSource.URL.handleHttp" // that, options, model
        },
        listeners: {
            "onRead.impl": {
                funcName: "fluid.dataSource.URL.handle",
                args: ["{that}", "{that}.options.permittedRequestOptions", "{arguments}.0", "{arguments}.1"] // [model], options
            }
        },
        // Global name of an array of permitted requestOptions
        permittedRequestOptions: "fluid.dataSource.URL.requestOptions",
        components: {
            cookieJar: "{cookieJar}"
        },
        termMap: {}
    });

    fluid.defaults("fluid.dataSource.URL.writable", {
        gradeNames: ["fluid.dataSource.writable"],
        listeners: {
            "onWrite.impl": {
                funcName: "fluid.dataSource.URL.handle",
                args: ["{that}", "{that}.options.permittedRequestOptions", "{arguments}.0", "{arguments}.1"] // model, options
            }
        }
    });

    /**
     * Resolves (expands) a url or path with respect to the `directModel` supplied to a dataSource's API (get or set). There are three rounds of expansion - firstly, the string
     * entries as the values in "termMap" will be looked up as paths within `directModel`. The resulting values will then be URI Encoded, unless their value
     * the termMap is prefixed with `noencode:`. Secondly,
     * this resolved termMap will be used for a round of the standard fluid.stringTemplate algorithm applied to the supplied URL. Finally, any argument `expand` will be
     * used to expand the entire URL.
     * @param {String} url - A url or path to expand
     * @param {Object.<String, String>} termMap - A map of terms to be used for string interpolation. Any values which begin with the prefix `noencode:` will have this prefix stripped off, and
     * URI encoding will not be applied to the substituted value. After the value is normalised in this way, the remaining value may be used for indirection in the directModel if it
     * begins with the prefix "%", or else directly for interpolation.
     * @param {Object} directModel - a set of data used to expand the url template
     * @param {Boolean} noencode - `true` if URLencoding of each interpolated value in the URL should be defeated by default
     * @return {String} The resolved/expanded url
     */
    fluid.dataSource.URL.resolveUrl = function (url, termMap, directModel, noencode) {
        var map = fluid.transform(termMap, function resolve(entry) {
            entry = String(entry);
            var encode = !noencode;
            if (entry.indexOf("noencode:") === 0) {
                encode = false;
                entry = entry.substring("noencode:".length);
            }
            var value = entry.charAt(0) === "%" ? fluid.get(directModel, entry.substring(1)) : entry;
            if (encode) {
                value = encodeURIComponent(value);
            }
            return value;
        });
        var replaced = fluid.stringTemplate(url, map);
        return replaced;
    };

    fluid.dataSource.URL.urlFields = fluid.freezeRecursive(["protocol", "username", "password", "hostname", "port", "pathname", "search"]);

    /** Condenses a plain JSON object with the isomorphic format to a WhatWG URL object into an actual WhatWG URL object - this
     * object can then be rendered into a string via URL.toString().
     * @param {Object} requestOptions - A plain JSON object isomorphic to a URL - this may contain extra fields
     * @return {URL} The equivalent URL object
     */
    fluid.dataSource.URL.condenseUrl = function (requestOptions) {
        var togo = new fluid.resourceLoader.UrlClass("http://localhost/");
        fluid.dataSource.URL.urlFields.forEach(function (field) {
            if (requestOptions[field]) {
                togo[field] = requestOptions[field];
            }
        });
        return togo;
    };

    fluid.dataSource.URL.requestOptions = fluid.dataSource.URL.urlFields.concat(
        ["url", "method", "headers", "termMap"]);

    // TODO: Deal with the anomalous status of "charEncoding" - in theory it could be set per-request but currently can't be. Currently all
    // "requestOptions" have a common fate in that they end up as the arguments to http.request. We need to split these into two levels,
    // httpRequestOptions and the outer level with everything else. We also need to do something similar for kettle.dataSource.file

    /** Assemble the `requestOptions` structure that will be sent to `http.request` by `kettle.dataSource.URL` by fusing together values from the user, the component
     * with filtration by a list of permitted options, e.g. those listed in `kettle.dataSource.URL.requestOptions`. A poorly factored method that needs to be
     * reformed as a proper merge pipeline.
     */

    fluid.dataSource.URL.prepareRequestOptions = function (componentOptions, cookieJar, userOptions, permittedOptions, directModel, userStaticOptions) {
        var staticOptions = fluid.filterKeys(componentOptions, permittedOptions);
        var requestOptions = fluid.extend(true, {headers: {}}, userStaticOptions, staticOptions, userOptions);
        // GPII-2147: replace "localhost" with "127.0.0.1" to allow running without a network connection in windows
        if (fluid.contextAware.isNode()) { // only do this in node, in the browser it results in an XHR status 0
            if (requestOptions.hostname === "localhost") {
                requestOptions.hostname = "127.0.0.1";
            }
        }
        requestOptions.writeMethod = requestOptions.writeMethod || componentOptions.writeMethod || "PUT";
        // TODO: do the same for "search" too?
        requestOptions.pathname = fluid.dataSource.URL.resolveUrl(requestOptions.pathname, requestOptions.termMap, directModel);

        if (cookieJar && cookieJar.cookie && componentOptions.storeCookies) {
            requestOptions.headers.Cookie = cookieJar.cookie;
        }
        return requestOptions;
    };

    fluid.dataSource.URL.parse = function (url, permittedOptions) {
        var parsed = fluid.filterKeys(new fluid.resourceLoader.UrlClass(url, typeof(window) !== "undefined" && window.location || undefined), fluid.dataSource.URL.urlFields);
        permittedOptions.forEach(function (oneOption) {
        // The WhatWG algorithm is a big step backwards and produces empty string junk in the parsed URL
            if (!parsed[oneOption]) {
                delete parsed[oneOption];
            }
        });
        return parsed;
    };

    /** Given an HTTP status code as returned by node's `http.IncomingMessage` class (or otherwise), determine whether it corresponds to
     * an error status. This performs a simple-minded check to see if it a number outside the range [200, 300).
     * @param {Number} statusCode The HTTP status code to be tested
     * @return {Boolean} `true` if the status code represents an error status
     */
    fluid.dataSource.URL.isErrorStatus = function (statusCode) {
        return statusCode < 200 || statusCode >= 300;
    };

    /**
     * Handles calls to a URL data source's get and set.
     * @param {kettle.dataSource.urlResolver} that - A URLResolver that will convert the contents of the
     * <code>directModel</code> supplied as the 3rd argument into a concrete URL used for this
     * HTTP request.
     * @param {String} permittedRequestOptions - The global name of an array holding the list of permitted request options
     * @param {Object} [model] - [optional] the payload to be written by this write operation
     * @param {RequestOptions} userOptions - A structure of request-specific options, including:
     *     @param {Object}  userOptions.directModel - a model holding the coordinates of the data to be read or written
     *     @param {String}  userOptions.operation - "set"/"get"
     *     @param {Boolean} userOptions.notFoundIsEmpty - <code>true</code> if a missing file on read should count as a successful empty payload rather than a rejection
     *     writeMethod {String}: "PUT"/ "POST" (option - if not provided will be defaulted by the concrete dataSource implementation)
     * @return {Promise} a promise for the successful or failed datasource operation
     */
    fluid.dataSource.URL.handle = function (that, permittedRequestOptions, model, userOptions) {
        var permittedOptions = fluid.getGlobalValue(permittedRequestOptions);
        // TODO: Permit this component to be used during the I/O phase of tree startup - remove after FLUID-6372
        permittedOptions.forEach(function (oneOption) {
            fluid.getForComponent(that, ["options", oneOption]);
        });
        var directModel = userOptions.directModel;
        // cf.sequence in KettleTestUtils.http.js kettle.test.request.http.prepareRequestOptions
        var url = that.resolveUrl(that.options.url, that.options.termMap, directModel);
        var parsed = fluid.dataSource.URL.parse(url, permittedOptions);

        var finalRequestOptions = fluid.dataSource.URL.prepareRequestOptions(that.options, that.cookieJar, userOptions, permittedOptions, directModel, parsed);

        return that.handleHttp(that, finalRequestOptions, model);
    };

    /** After express 4.15.0 of 2017-03-01 error messages are packaged as HTML readable
     * in this stereotypical form.
     * @param {String} received - The body of an HTTP response (perhaps from express) which has completed with an error
     * @return {String} The inner error encoded within the HTML body of the response,
     * if it could be decoded, or else the original value of `received`.
     */
    fluid.extractHtmlError = function (received) {
        var matches = /<pre>(.*)<\/pre>/gm.exec(received);
        return matches ? matches[1] : received;
    };

    // Attempt to parse the error response as JSON, but if failed, just stick it into "message" quietly
    fluid.dataSource.URL.relayError = function (statusCode, received, whileMsg) {
        var rejectPayload;
        try {
            rejectPayload = JSON.parse(received);
        } catch (e) {
            var message = typeof(received) === "string" && received.indexOf("<html") !== -1 ?
                fluid.extractHtmlError(received) : received;
            rejectPayload = {message: message};
        }
        rejectPayload.message = rejectPayload.message || rejectPayload.error;
        delete rejectPayload.error;
        rejectPayload.isError = true;
        rejectPayload.statusCode = statusCode;
        return fluid.upgradeError(rejectPayload, whileMsg);
    };


})(jQuery, fluid_3_0_0);
