/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 */

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        fluid.registerNamespace("fluid.tests");

        fluid.defaults("fluid.tests.mutationObserverTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            markupFixture: ".flc-mutationObserver",
            components: {
                mutationObserver: {
                    type: "fluid.mutationObserver",
                    container: ".flc-mutationObserver"
                },
                mutationObserverTester: {
                    type: "fluid.tests.mutationObserverTester"
                }
            }
        });

        fluid.defaults("fluid.tests.mutationObserverTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                markup: {
                    firstAddition: "<li class=\"flc-mutationObserver-firstAddition\">First Addition</li>"
                }
            },
            modules: [{
                name: "Mutation Observer Tests",
                tests: [{
                    name: "DOM Manipulations",
                    expect: 4,
                    sequence: [{
                        func: "{mutationObserver}.observe"
                    }, {
                        func: "fluid.tests.mutationObserverTester.insert",
                        args: ["{mutationObserver}", "{that}.options.testOpts.markup.firstAddition"]
                    }, {
                        event: "{mutationObserver}.events.onNodeAdded",
                        listener: "fluid.tests.mutationObserverTester.verifyReturnedNode",
                        args: ["Node Added", "{arguments}.0", ".flc-mutationObserver-firstAddition"]
                    }, {
                        func: "fluid.tests.mutationObserverTester.remove",
                        args: [".flc-mutationObserver-remove"]
                    }, {
                        event: "{mutationObserver}.events.onNodeRemoved",
                        listener: "fluid.tests.mutationObserverTester.verifyReturnedNode",
                        args: ["Node Removed", "{arguments}.0", ".flc-mutationObserver-remove"]
                    }, {
                        func: "fluid.tests.mutationObserverTester.changeAttr",
                        args: [".flc-mutationObserver-changeAttr", {"data-test": "test"}]
                    }, {
                        event: "{mutationObserver}.events.onAttributeChanged",
                        listener: "fluid.tests.mutationObserverTester.verifyAttributeChange",
                        args: ["Attribute Changed", "{arguments}.0", "{arguments}.1", ".flc-mutationObserver-changeAttr", "data-test"]
                    }, {
                        func: "{mutationObserver}.disconnect"
                    }]
                }]
            }]
        });

        fluid.tests.mutationObserverTester.insert = function (that, elm) {
            elm = $(elm);
            that.container.append(elm);
        };

        fluid.tests.mutationObserverTester.remove = function (elm) {
            $(elm).remove();
        };

        fluid.tests.mutationObserverTester.changeAttr = function (elm, attrs) {
            $(elm).attr(attrs);
        };

        fluid.tests.mutationObserverTester.verifyReturnedNode = function (prefix, node, expectedClass) {
            node = $(node);
            jqUnit.assertTrue(prefix + ": Returned the correct node", node.is(expectedClass));
        };

        fluid.tests.mutationObserverTester.verifyAttributeChange = function (prefix, node, mutationRecord, expectedClass, expectedAttribute) {
            fluid.tests.mutationObserverTester.verifyReturnedNode(prefix, node, expectedClass);
            jqUnit.assertEquals(prefix + ": The correct attribute was changed", expectedAttribute, mutationRecord.attributeName);
        };

        fluid.test.runTests([
            "fluid.tests.mutationObserverTests"
        ]);

    });
})(jQuery);
