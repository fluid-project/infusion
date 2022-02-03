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

/* global XHRMock */

"use strict";

fluid.defaults("fluid.test.mockXHR", {
    gradeNames: "fluid.component",
    mocks: {
        // A free hash of keys to structures including:
        // {
        //     url: String
        //     method: String
        //     body: Any
        //     status: Number
        // }
    },
    listeners: {
        "onCreate.registerMocks": "fluid.test.mockXHR.registerMocks",
        "onDestroy.deregisterMocks": "fluid.test.mockXHR.deregisterMocks"
    }
});

fluid.test.mockXHR.recordToMock = function (record) {
    var mockFunc = function (req, res) {
        res.status(record.status === undefined ? 200 : record.status);
        if (record.body !== undefined) {
            res.body(record.body);
        }
        return res;
    };
    if (record.delay) {
        return function (req, res) {
            var promise = fluid.promise();
            setTimeout(function () {
                promise.resolve(mockFunc(req, res));
            }, record.delay);
            return promise;
        };
    } else {
        return mockFunc;
    }
};

fluid.test.mockXHR.registerMocks = function (that) {
    XHRMock.setup();
    var mocks = that.options.mocks;
    fluid.each(mocks, function (oneMock) {
        XHRMock.use(oneMock.method || "GET", oneMock.url, fluid.test.mockXHR.recordToMock(oneMock));
    });
};

fluid.test.mockXHR.deregisterMocks = function () {
    XHRMock.teardown();
};
