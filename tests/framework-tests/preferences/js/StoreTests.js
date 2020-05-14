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

/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.prefs.store");

    fluid.tests.prefs.store.testSettings1 = {
        textSize: "1.5",
        textFont: "verdana",
        theme: "bw",
        layout: false
    };

    fluid.tests.prefs.store.testSettings2 = {
        lineSpace: "1.1",
        theme: "yb"
    };

    fluid.tests.prefs.store.cookieName = "fluid-cookieStore-test";
    fluid.tests.prefs.store.cookieName2 = "fluid-cookieStore-test2";

    fluid.tests.prefs.store.dropCookie = function (cookieName) {
        document.cookie = cookieName + "=; max-age=-1; path=/";
    };

    // Assemble Cookie Tests

    jqUnit.module("Assemble Cookie Tests");

    fluid.tests.prefs.store.cookieAssemblyTestcases = [
        {
            testName: "all cookieOptions set",
            cookieName: "cookieName",
            payload: "cookieValue",
            cookieOpts: {
                domain: "example.com",
                expires: "Fri, 15 Jul 2011 16:44:24 GMT",
                "max-age": 1000,
                path: "/",
                samesite: "strict",
                secure: true
            },
            expected: "cookieName=cookieValue; domain=example.com; expires=Fri, 15 Jul 2011 16:44:24 GMT; max-age=1000; path=/; samesite=strict; secure"
        }, {
            testName: "cookie attributes with capitals",
            cookieName: "cookieName",
            payload: "cookieValue",
            cookieOpts: {
                Domain: "example.com",
                Expires: "Fri, 15 Jul 2011 16:44:24 GMT",
                "Max-Age": 1000,
                Path: "/",
                SameSite: "strict",
                Secure: true
            },
            expected: "cookieName=cookieValue; Domain=example.com; Expires=Fri, 15 Jul 2011 16:44:24 GMT; Max-Age=1000; Path=/; SameSite=strict; Secure"
        }, {
            testName: "secure set to false",
            cookieName: "cookieName",
            payload: "cookieValue",
            cookieOpts: {
                secure: false
            },
            expected: "cookieName=cookieValue"
        }, {
            testName: "Secure set to false",
            cookieName: "cookieName",
            payload: "cookieValue",
            cookieOpts: {
                Secure: false
            },
            expected: "cookieName=cookieValue"
        }, {
            testName: "only name set",
            cookieName: "cookieName",
            payload: "cookieValue",
            expected: "cookieName=cookieValue"
        }, {
            testName: "name attribute in cookie options",
            cookieName: "cookieName",
            payload: "cookieValue",
            cookieOpts: {
                name: "ignoreName"
            },
            expected: "cookieName=cookieValue"
        }
    ];

    fluid.tests.prefs.store.assembleCookieTest = function (cookieName, payload, cookieOptions, expectedAssembledCookie) {
        var assembledCookie = fluid.prefs.cookieStore.assembleCookie(cookieName, payload, cookieOptions);
        jqUnit.assertEquals("The expected cookie string should have been assembled", expectedAssembledCookie, assembledCookie);
    };

    fluid.each(fluid.tests.prefs.store.cookieAssemblyTestcases, function (testcase) {
        jqUnit.test(testcase.testName, function () {
            fluid.tests.prefs.store.assembleCookieTest(testcase.cookieName, testcase.payload, testcase.cookieOpts, testcase.expected);
        });
    });

    // Cookie Store Tests

    fluid.defaults("fluid.tests.prefs.cookieStore", {
        gradeNames: ["fluid.prefs.cookieStore", "fluid.dataSource.writable"],
        cookie: {
            name: fluid.tests.prefs.store.cookieName
        }
    });

    fluid.defaults("fluid.prefs.cookieStore.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            cookieStore: {
                type: "fluid.tests.prefs.cookieStore"
            },
            tester: {
                type: "fluid.prefs.cookieStore.tester"
            }
        }
    });

    fluid.defaults("fluid.prefs.cookieStore.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Cookie Store",
            tests: [{
                expect: 14,
                name: "Get and Set",
                sequence: [{
                    task: "{cookieStore}.get",
                    resolve: "jqUnit.assertUndefined",
                    resolveArgs: ["There shouldn't be a cookie to start with", "{arguments}.0"]
                }, {
                    // set the cookie
                    task: "{cookieStore}.set",
                    args: [null, fluid.tests.prefs.store.testSettings1],
                    resolve: "fluid.prefs.cookieStore.tester.assertCookie",
                    resolveArgs: ["set cookie - name from options", "{arguments}.0", fluid.tests.prefs.store.cookieName, fluid.tests.prefs.store.testSettings1]
                }, {
                    task: "{cookieStore}.get",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["get cookie - name from options: The model should be fetched from the cookie", fluid.tests.prefs.store.testSettings1, "{arguments}.0"]
                }, {
                    // update the cookie
                    task: "{cookieStore}.set",
                    args: [null, fluid.tests.prefs.store.testSettings2],
                    resolve: "fluid.prefs.cookieStore.tester.assertCookie",
                    resolveArgs: ["update cookie - name from options", "{arguments}.0", fluid.tests.prefs.store.cookieName, fluid.tests.prefs.store.testSettings2]
                }, {
                    task: "{cookieStore}.get",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["update cookie - name from options: The updated model should be fetched from the cookie", fluid.tests.prefs.store.testSettings2, "{arguments}.0"]
                }, {
                    // set new cookie using directModel
                    task: "{cookieStore}.set",
                    args: [{cookieName: fluid.tests.prefs.store.cookieName2}, fluid.tests.prefs.store.testSettings1],
                    resolve: "fluid.prefs.cookieStore.tester.assertCookie",
                    resolveArgs: ["set new cookie - name from directModel", "{arguments}.0", fluid.tests.prefs.store.cookieName2, fluid.tests.prefs.store.testSettings1]
                }, {
                    task: "{cookieStore}.get",
                    args: [{cookieName: fluid.tests.prefs.store.cookieName2}],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["get new cookie - name from directModel: The model should be returned from the new cookie", fluid.tests.prefs.store.testSettings1, "{arguments}.0"]
                }, {
                    task: "{cookieStore}.get",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["get first cookie - name from options: The correct model should be returned from the first cookie", fluid.tests.prefs.store.testSettings2, "{arguments}.0"]
                }, {
                    funcName: "fluid.tests.prefs.store.dropCookie",
                    args: [fluid.tests.prefs.store.cookieName]
                }, {
                    funcName: "fluid.tests.prefs.store.dropCookie",
                    args: [fluid.tests.prefs.store.cookieName2]
                }]
            }]
        }]
    });

    fluid.prefs.cookieStore.tester.cookieToJSON = function (cookieName, cookie) {
        var cookiePrefix = cookieName + "=";
        var startIndex = cookie.indexOf(cookiePrefix);
        if (startIndex < 0) {
            return;
        }

        startIndex = startIndex + cookiePrefix.length;
        var endIndex = cookie.indexOf(";", startIndex);
        if (endIndex < startIndex) {
            endIndex = cookie.length;
        }
        var cookieSection = cookie.substring(startIndex, endIndex);
        return JSON.parse(decodeURIComponent(cookieSection));
    };

    fluid.prefs.cookieStore.tester.assertCookie = function (testName, writeResponse, cookieName, model) {
        var cookie = document.cookie;
        jqUnit.assertTrue(testName + ": A cookie was found", cookie.length >= 0);
        jqUnit.assertDeepEq(testName + ": The cookie write response matches the model", model, writeResponse);
        var cookieData = fluid.prefs.cookieStore.tester.cookieToJSON(cookieName, cookie);
        jqUnit.assertDeepEq(testName + ": The model was stored in the cookie", model, cookieData);
    };

    // Temp Store Tests

    fluid.defaults("fluid.tests.prefs.tempStore", {
        gradeNames: ["fluid.prefs.tempStore", "fluid.dataSource.writable"],
        model: {
            orig: "orig"
        }
    });

    fluid.defaults("fluid.prefs.tempStore.tests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            tempStore: {
                type: "fluid.tests.prefs.tempStore"
            },
            tester: {
                type: "fluid.prefs.tempStore.tester"
            }
        }
    });

    fluid.tests.prefs.tempStore.models = {
        orig: {
            orig: "orig"
        },
        other: {
            other: "other"
        }
    };

    fluid.defaults("fluid.prefs.tempStore.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Temp Store",
            tests: [{
                expect: 3,
                name: "Get and Set",
                sequence: [{
                    task: "{tempStore}.get",
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["The current model should be returned", fluid.tests.prefs.tempStore.models.orig, "{arguments}.0"]
                }, {
                    task: "{tempStore}.set",
                    args: [null, fluid.tests.prefs.tempStore.models.other],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["The new model should be returned", fluid.tests.prefs.tempStore.models.other, "{arguments}.0"]
                }, {
                    funcName: "jqUnit.assertDeepEq",
                    args: ["The model should be updated", fluid.tests.prefs.tempStore.models.other, "{tempStore}.model"]
                }]
            }]
        }]
    });

    fluid.test.runTests([
        "fluid.prefs.cookieStore.tests",
        "fluid.prefs.tempStore.tests"
    ]);

})(jQuery);
