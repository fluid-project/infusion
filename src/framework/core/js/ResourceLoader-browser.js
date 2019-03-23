/*
Copyright 2019 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {

    "use strict";

    fluid.resourceLoader.loaders.XHR = function (resourceSpec) {
        var togo = fluid.promise();
        var xhr = resourceSpec.xhr = new XMLHttpRequest();
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
            var isError = fluid.resourceLoader.isErrorStatus(xhr.status);
            isError ? sendError() : sendSuccess();
        });
        xhr.addEventListener("error", sendError);
        var options = $.extend({async: true}, resourceSpec.options);
        xhr.open(options.method || "GET", resourceSpec.url, options.async, options.username, options.password);
        fluid.resourceLoader.loaders.XHR.copyProps.forEach(function (prop) {
            if (fluid.isValue(options.prop)) {
                xhr[prop] = options.prop;
            }
        });
        fluid.each(options.requestHeaders, function (value, key) {
            var values = fluid.makeArray(value);
            values.forEach(function (oneValue) {
                xhr.setRequestHeader(key, oneValue);
            });
        });
        xhr.send();
        return togo;
    };

    fluid.resourceLoader.loaders.XHR.copyProps = ["contentType", "responseType", "timeout"];

    fluid.resourceLoader.loaders.url = fluid.resourceLoader.loaders.XHR;

})(jQuery, fluid_3_0_0);
