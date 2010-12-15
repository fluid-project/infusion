/*
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, window, start, stop*/


fluid.registerNamespace("fluid.tests");

(function ($) {

    fluid.tests.cacheTestUrl = "/test/url";
    fluid.tests.cacheTestUrl2 = "/test/url2";
    fluid.tests.cacheTestUrl3 = "/test/url3";
    fluid.tests.cacheTestUrl4 = "/test/url4";

    fluid.defaults("fluid.tests.cacheComponent", {
        resources: {
            template: {
                url: fluid.tests.cacheTestUrl,
                forceCache: true
            }  
        }
    });

    fluid.tests.testResponse = {
        status: 'success',
        fortune: 'Are you a turtle?'
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
                url: fluid.tests.cacheTestUrl,
                forceCache: true,
                fetchClass: "slowTemplate"
            }
        },
        cacheTestUrl2: {
            template: {
                url: fluid.tests.cacheTestUrl2,
                forceCache: true,
                fetchClass: "fastTemplate"
            }
        },
        cacheTestUrl3: {
            template: {
                url: fluid.tests.cacheTestUrl3,
                forceCache: true,
                fetchClass: "joinlessTemplate"
            }
        }
    };

    fluid.tests.finalResources = {
        template: {
            url: fluid.tests.cacheTestUrl4,
            forceCache: true
        }
    };

    fluid.setLogging(true);

    fluid.tests.testCaching = function () {
        var cachingTests = new jqUnit.TestCase("Caching Tests");

        function testSimpleCache(message, invoker, requestDelay) {
            cachingTests.test("Simple caching test with delay " + requestDelay, function () {
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
                        start();
                    }
                    fluid.tests.setMock(requestDelay, fluid.tests.cacheTestUrl, countCallback);
                    fluid.fetchResources.primeCacheFromResources("fluid.tests.cacheComponent");
                    var defaults = fluid.defaults("fluid.tests.cacheComponent");
                    window.setTimeout(function () {
                        fluid.fetchResources(fluid.copy(defaults.resources), finalCallback);
                    }, 100);
                    stop();
                });
            });      
        }

        function testAllSimpleCache(message, invoker) {
            testSimpleCache(message, invoker, 0);
            testSimpleCache(message, invoker, 50);
            testSimpleCache(message, invoker, 150);
        }

        // "whitebox" testing to assess failure in the presence and absence of IoC
        function expandOptionsCensorer(func) {
            var expandOptions = fluid.expandOptions;
            delete fluid.expandOptions;
            try {
                func();
            }
            finally {
                fluid.expandOptions = expandOptions;
            }      
        }
         
        function funcInvoker(func) {
            func();
        }
        
        testAllSimpleCache("No IoC", expandOptionsCensorer);
        testAllSimpleCache("With IoC", funcInvoker);

        function testProleptickJoinset(delays, message, expectedFinal) {
            cachingTests.test("Test proleptick joinsets: " + message, function () {
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
                    fluid.each(finalSpecs, function (spec, key) {
                        ++totalFinal;
                        jqUnit.assertEquals("Success", "success", spec.resourceText.status);
                    });
                    jqUnit.assertEquals("Expected count in final joinset", expectedFinal, totalFinal);
                    start();
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
                }, 100);
                stop();
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