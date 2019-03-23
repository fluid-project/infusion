/*
Copyright 2019 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* eslint-env node */
/* eslint strict: ["error", "global"] */
/* global fluid */

"use strict";

var fs = require("fs"),
    http = require("http"),
    https = require("https");

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
    var lib = resourceSpec.url.startsWith("https") ? https : http;
    // TODO: Unify with kettle.dataSource.URL.handle.http once i) components are cheap enough we can have them everywhere,
    // ii) infusion, kettle and others are reorganised into a monorepo
    var request = lib.get(resourceSpec.url, function (response) {
        if (fluid.resourceLoader.isErrorStatus(response.statusCode)) {
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
