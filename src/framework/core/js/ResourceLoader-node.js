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

/* eslint-env node */
/* eslint strict: ["error", "global"] */

"use strict";

var fs = require("fs"),
    urlModule = require("url"),
    // TODO: External dependency on Kettle - it is not practical to operate Infusion in node without this dependency in any case
    kettle = fluid.registerNamespace("kettle");

fluid.resourceLoader.UrlClass = urlModule.URL;

fluid.resourceLoader.loaders.path = function (resourceSpec) {
    var resourcePath = fluid.module.resolvePath(resourceSpec.path);
    var promise = fluid.promise();
    fs.readFile(resourcePath, resourceSpec.charEncoding || "utf8", function (err, data) {
        if (err) {
            promise.reject(err);
        } else {
            promise.resolve(data);
        }
    });
    return promise;
};

fluid.resourceLoader.loaders.url = function (resourceSpec) {
    var promise = fluid.promise();
    // Use Kettle's request modules so that we get access to follow-redirects
    var lib = resourceSpec.url.startsWith("https") ? kettle.npm.https : kettle.npm.http;
    // TODO: Unify with kettle.dataSource.URL.handle.http once i) components are cheap enough we can have them everywhere,
    // ii) infusion, kettle and others are reorganised into a monorepo
    var request = lib.get(resourceSpec.url, resourceSpec.options, function (response) {
        if (fluid.dataSource.URL.isErrorStatus(response.statusCode)) {
            promise.reject({
                isError: true,
                status: response.statusCode,
                textStatus: response.statusMessage
            });
        } else {
            var body = [];
            response.on("data", function (chunk) {
                body.push(chunk);
            });
            response.on("end", function () {
                promise.resolve(body.join(""));
            });
        }
    });
    request.on("error", function (err) {
        err.isError = true;
        promise.reject(err);
    });
    return promise;
};

/** TODO: port the rest of kettle.dataSource up here **/
