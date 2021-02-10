/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {

    "use strict";

    fluid.resourceLoader.UrlClass = URL;

    fluid.resourceLoader.configureXHR = function (xhr, options) {
        fluid.resourceLoader.loaders.XHR.copyProps.forEach(function (prop) {
            if (fluid.isValue(options[prop])) {
                xhr[prop] = options[prop];
            }
        });
        fluid.each(options.requestHeaders, function (value, key) {
            var values = fluid.makeArray(value);
            values.forEach(function (oneValue) {
                xhr.setRequestHeader(key, oneValue);
            });
        });
    };

    fluid.resourceLoader.loaders.XHR = function (resourceSpec) {
        var togo = fluid.promise();
        var xhr = resourceSpec.xhr = new XMLHttpRequest();
        togo.then(null, null, function () {
            xhr.abort();
        });
        var sendSuccess = function () {
            fluid.invokeLater(function () {
                var response = !xhr.responseType || xhr.responseType === "text" ? xhr.responseText : xhr.response;
                togo.resolve(response);
            });
        };
        var sendError = function () {
            fluid.invokeLater(function () {
                togo.reject({
                    isError: true,
                    status: xhr.status,
                    textStatus: xhr.statusText
                });
            });
        };
        xhr.addEventListener("load", function () {
            var isError = fluid.dataSource.URL.isErrorStatus(xhr.status);
            isError ? sendError() : sendSuccess();
        });
        xhr.addEventListener("error", sendError);
        var options = $.extend({async: true}, resourceSpec.options);
        xhr.open(options.method || "GET", resourceSpec.url, options.async, options.username, options.password);
        fluid.resourceLoader.configureXHR(xhr, options);
        xhr.send();
        return togo;
    };

    fluid.resourceLoader.loaders.XHR.copyProps = ["contentType", "responseType", "timeout"];

    fluid.resourceLoader.loaders.url = fluid.resourceLoader.loaders.XHR;

    /** Central strategy point for all HTTP-backed DataSource operations (both read and write) in the browser.
     * Accumulates options to be sent to the underlying XMLHttpRequest primitives, collects and interprets the
     * results back into promise resolutions.
     * @param {fluid.dataSource} that - The DataSource itself
     * @param {Object} baseOptions - A partially merged form of the options sent to the top-level `dataSource.get` method together with relevant
     * static options configured on the component. Information in the `directModel` argument has already been encoded into the url member.
     * @param {String} data - The `model` argument sent to top-level `dataSource.get/set` after it has been pushed through the transform chain
     * @return {Promise} A promise for the resolution of the I/O
     */
    fluid.dataSource.URL.handleHttp = function (that, baseOptions, data) {
        var promise = fluid.promise();
        var defaultOptions = {
            method: "GET",
            port: 80,
            async: true
        };

        if (baseOptions.operation === "set") {
            defaultOptions.headers = {
                "Content-Type": that.encoding.options.contentType
            };
            defaultOptions.method = baseOptions.writeMethod;
        }
        var requestOptions = fluid.extend(true, defaultOptions, baseOptions);
        var whileMsg = " while executing HTTP " + requestOptions.method + " on url " + requestOptions.url;
        fluid.log("DataSource Issuing " + (requestOptions.protocol.toUpperCase()).slice(0, -1) + " request with options ", requestOptions);
        promise.accumulateRejectionReason = function (originError) {
            return fluid.upgradeError(originError, whileMsg);
        };

        var xhr = promise.xhr = new XMLHttpRequest();

        var sendError = function () {
            var relayed = fluid.dataSource.URL.relayError(xhr.status, xhr.statusText, whileMsg);
            if (requestOptions.notFoundIsEmpty && relayed.statusCode === 404) {
                promise.resolve(undefined);
            } else {
                promise.reject(relayed);
            }
        };

        xhr.addEventListener("load", function () {
            if (fluid.dataSource.URL.isErrorStatus(xhr.status)) {
                sendError();
            } else {
                var response = !xhr.responseType || xhr.responseType === "text" ? xhr.responseText : xhr.response;
                promise.resolve(response);
            }
        });

        xhr.addEventListener("error", sendError);

        var url = fluid.dataSource.URL.condenseUrl(requestOptions);
        // username and password in XHR open has sometimes been criticised https://bugs.chromium.org/p/chromium/issues/detail?id=707761
        xhr.open(requestOptions.method || "GET", url.toString(), requestOptions.async);
        fluid.resourceLoader.configureXHR(xhr, requestOptions);
        xhr.send(data);
        return promise;
    };

})(jQuery, fluid_3_0_0);
