/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    // Test the relative performance of fast and slow invokers for FLUID-4922 - measurement was that
    // fast invokers are approximately 200x faster

    fluid.tests.addFunc = function (acc, a, b, c, d) {
        return acc + a + b + c + d;
    };

    fluid.tests.addFuncEnd = function (acc, a, b, c, d, target) {
        target.total = acc + a + b + c + d;
    };

    fluid.defaults("fluid.tests.perfRoot", {
        gradeNames: ["fluid.component"],
        components: {
            child1: {
                type: "fluid.component",
                options: {
                    members: {
                        value: 1
                    }
                }
            },
            child2: {
                type: "fluid.component",
                options: {
                    members: {
                        value: 2
                    },
                    events: {
                        createIt: null
                    },
                    components: {
                        child3: {
                            type: "fluid.component",
                            createOnEvent: "createIt",
                            options: {
                                members: {
                                    value: 3,
                                    total: 0
                                },
                                events: {
                                    fireIt: null
                                },
                                invokers: {
                                    addit: {
                                        funcName: "fluid.tests.addFunc",
                                        args: ["{arguments}.0", "{child1}.value", "{child2}.value", "{child3}.value", "{arguments}.1"]
                                    }
                                },
                                listeners: {
                                    fireIt: {
                                        funcName: "fluid.tests.addFuncEnd",
                                        args: ["{child3}.total", "{child1}.value", "{child2}.value", "{child3}.value", "{arguments}.0", "{child3}"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Timings on Firefox 23 - 8/9/13
    // bare loop: 20ns/it
    // plain function call: 2us/it
    // full invoker: 1.7ms/call!
    // "fast invoker": 8.5us/it

    // on Chrome 29:
    // bare loop: 4ns/it
    // plain function call: 20ns
    // full invoker: 170us/call when warm (progressively improves)
    // "fast invoker": 1.4us

    // on Chrome 41 "old framework" 5/4/15:
    // full invoker: 220us/call when warm (progressively deteriorates)
    // "fast invoker": 1.7us
    // full invoker with old expandImmediate: 95us/call
    // full invoker with "fast" resolveContext: 40us/call
    // full invoker with fast resolve plus preExpand: 20us/call
    // full invoker with cached segs: 11us/call
    // full invoker with "monomorphic expanders": 4us/call -> 3us/call after irrelevant-seeming refactoring

    // on Chrome 46 "new framework" FLUID-5796 fast listener test
    // initial: 70us/call
    // final: 6.5us/call after "monomorphic expanders" etc.

    function runTests() {

        var results = [];
        var root = fluid.tests.perfRoot();
        var child2 = root.child2;
        child2.events.createIt.fire();
        var acc;
        for (var j = 0; j < 5; ++j) {

            var now = Date.now();
            var its = 50000;
            acc = 0;

            for (var i = 0; i < its; ++i) {
                // acc = fluid.tests.addFunc(acc, 1, 2, 3, 4);
                acc = child2.child3.addit(acc, 4);
                // child2.child3.events.fireIt.fire(4);
                // root.child2.events.createIt.fire();
            }

            var delay = (Date.now() - now);

            results.push(its + " iterations concluded in " + delay + " ms: " + 1000 * (delay / its) + " us/it");
        }

        // results.push("Accumulated: " + acc);
        results.push("Accumulated: " + child2.child3.total);

        fluid.each(results, function (result) {
            var resultElm = $("<li>").text(result);
            $(".results").append(resultElm);
        });
    }

    $(document).ready(function () {
        $("#run-tests").click(runTests);
    });

})(jQuery, fluid);
