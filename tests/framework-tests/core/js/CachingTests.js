/*
Copyright 2010-2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.tests.cacheTestUrl = "/test/url";
    fluid.tests.cacheTestUrl2 = "/test/url2";
    fluid.tests.cacheTestUrl3 = "/test/url3";
    fluid.tests.cacheTestUrl4 = "/test/url4";

    fluid.defaults("fluid.tests.cacheComponent", {
        resources: {
            template: {
                dataType: "json",
                url: fluid.tests.cacheTestUrl,
                forceCache: true
            }
        }
    });

    fluid.tests.testResponse = {
        status: "success",
        fortune: "Are you a turtle?"
    };

    fluid.tests.setMock = function (responseTime, url, callback) {
        $.mockjaxClear();
        $.mockjax(function (settings) {
            if (settings.url === url) {
                callback();
                return {
                    responseTime: responseTime,
                    responseText: fluid.tests.testResponse
                };
            }
        });
    };

    fluid.tests.testResources = {
        cacheTestUrl: {
            template: {
                dataType: "json",
                url: fluid.tests.cacheTestUrl,
                forceCache: true,
                fetchClass: "slowTemplate"
            }
        },
        cacheTestUrl2: {
            template: {
                dataType: "json",
                url: fluid.tests.cacheTestUrl2,
                forceCache: true,
                fetchClass: "fastTemplate"
            }
        },
        cacheTestUrl3: {
            template: {
                dataType: "json",
                url: fluid.tests.cacheTestUrl3,
                forceCache: true,
                fetchClass: "joinlessTemplate"
            }
        }
    };

    fluid.tests.finalResources = {
        template: {
            dataType: "json",
            url: fluid.tests.cacheTestUrl4,
            forceCache: true
        }
    };

    fluid.setLogging(true);

    fluid.tests.testCaching = function () {
        jqUnit.module("Caching Tests");

        function testSimpleCache(message, invoker, requestDelay) {
            jqUnit.test(message + ": Simple caching test with delay " + requestDelay, function () {
                invoker(function () {
                    fluid.log("Begin with delay " + requestDelay);
                    fluid.fetchResources.clearResourceCache(fluid.tests.cacheTestUrl);
                    var fetches = 0;
                    function countCallback() {
                        ++fetches;
                    }
                    function finalCallback(specs) {
                        jqUnit.assertEquals("Just one fetch", 1, fetches);
                        jqUnit.assertEquals("Success", "success", specs.template.resourceText.status);
                        jqUnit.start();
                    }
                    fluid.tests.setMock(requestDelay, fluid.tests.cacheTestUrl, countCallback);
                    fluid.fetchResources.primeCacheFromResources("fluid.tests.cacheComponent");
                    var defaults = fluid.defaults("fluid.tests.cacheComponent");
                    window.setTimeout(function () {
                        fluid.fetchResources(fluid.copy(defaults.resources), finalCallback);
                    }, 100);
                    jqUnit.stop();
                });
            });
        }

        function testAllSimpleCache(message, invoker) {
            testSimpleCache(message, invoker, 0);
            testSimpleCache(message, invoker, 50);
            testSimpleCache(message, invoker, 150);
        }

        // "whitebox" testing to assess failure in the presence and absence of IoC
        // TODO: This test is getting increasingly silly
        function IoCCensorer(func) {
            var expandComponentOptions = fluid.expandComponentOptions;
            var deliverOptionsStrategy = fluid.deliverOptionsStrategy;
            var computeComponentAccessor = fluid.computeComponentAccessor;
            var computeDynamicComponents = fluid.computeDynamicComponents;
            delete fluid.expandComponentOptions;
            fluid.deliverOptionsStrategy = fluid.identity;
            fluid.computeComponentAccessor = fluid.identity;
            fluid.computeDynamicComponents = fluid.identity;
            try {
                func();
            } finally {
                fluid.expandComponentOptions = expandComponentOptions;
                fluid.deliverOptionsStrategy = deliverOptionsStrategy;
                fluid.computeComponentAccessor = computeComponentAccessor;
                fluid.computeDynamicComponents = computeDynamicComponents;
            }
        }

        function funcInvoker(func) {
            func();
        }

        testAllSimpleCache("No IoC", IoCCensorer);
        testAllSimpleCache("With IoC", funcInvoker);

        function testProleptickJoinset(delays, message, expectedFinal) {
            jqUnit.test("Test proleptick joinsets: " + message + " (" + delays.cacheTestUrl3 + ", " + delays.cacheTestUrl4 + ")" , function () {
                fluid.log("Begin test " + message);
                var fetches = {};
                function countCallback(key) {
                    return function () {
                        fetches[key]++;
                    };
                }
                function finalCallback(finalSpecs) {
                    fluid.each(fluid.tests.testResources, function (resources, key) {
                        jqUnit.assertEquals("Just one fetch for " + key, 1, fetches[key]);
                    });
                    var totalFinal = 0;
                    fluid.each(finalSpecs, function (spec) {
                        ++totalFinal;
                        jqUnit.assertEquals("Success", "success", spec.resourceText.status);
                    });
                    jqUnit.assertEquals("Expected count in final joinset", expectedFinal, totalFinal);
                    jqUnit.start();
                    fluid.log("Conclude test " + message);
                }
                fluid.fetchResources.clearResourceCache();
                fluid.each(fluid.tests.testResources, function (resources, key) {
                    fetches[key] = 0;
                    fluid.tests.setMock(delays[key], resources.template.url, countCallback(key));
                    fluid.fetchResources(fluid.copy(resources));
                });
                fluid.tests.setMock(delays.cacheTestUrl4, fluid.tests.cacheTestUrl4, countCallback("cacheTestUrl4"));
                window.setTimeout(function () {
                    fluid.fetchResources(fluid.copy(fluid.tests.finalResources), finalCallback, {
                        amalgamateClasses: ["slowTemplate", "fastTemplate"]
                    });
                }, 100); // TODO: Stability of tests seems to be very sensitive to this timeout
                jqUnit.stop();
            });
        }

        function testProleptickSet(mainDelay, collDelay) {
            testProleptickJoinset({cacheTestUrl:   0, cacheTestUrl2:   0, cacheTestUrl3: collDelay, cacheTestUrl4: mainDelay}, "Immediate", 1);
            testProleptickJoinset({cacheTestUrl: 200, cacheTestUrl2: 200, cacheTestUrl3: collDelay, cacheTestUrl4: mainDelay}, "All late",  3);
            testProleptickJoinset({cacheTestUrl:   0, cacheTestUrl2: 200, cacheTestUrl3: collDelay, cacheTestUrl4: mainDelay}, "One early", 2);
        }
        for (var mainDelay = 0; mainDelay < 200; mainDelay += 100) {
            for (var collDelay = 0; collDelay < 200; collDelay += 100) {
                testProleptickSet(mainDelay, collDelay);
            }
        }
    };

})(jQuery);
