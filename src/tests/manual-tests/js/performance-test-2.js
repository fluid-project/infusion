/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($, fluid) {

fluid.registerNamespace("fluid.tests");

// Test the relative performance of fast and slow invokers for FLUID-4922 - measurement was that
// fast invokers are approximately 200x faster

fluid.tests.addFunc = function (acc, a, b, c, d) {
    return acc + a + b + c + d;
};

fluid.defaults("fluid.tests.perfRoot", {
    gradeNames: ["fluid.littleComponent", "autoInit"],
    components: {
        child1: {
            type: "fluid.littleComponent",
            options: {
                members: {
                    value: 1
                }
            }
        },
        child2: {
            type: "fluid.littleComponent",
            options: {
                members: {
                    value: 2
                },
                components: {
                    child3: {
                        type: "fluid.littleComponent",
                        options: {
                            members: {
                                value: 3
                            },
                            invokers: {
                                addit: {
                                    funcName: "fluid.tests.addFunc",
                                    // dynamic: true,
                                    args: ["{arguments}.0", "{child1}.value", "{child2}.value", "{child3}.value", "{arguments}.1"]
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

var root = fluid.tests.perfRoot();

for (var j = 0; j < 5; ++ j) {

    var now = Date.now();
    
    var acc = 0; var its = 100000;
    
    for (var i = 0; i < its; ++ i) {
        // acc = fluid.tests.addFunc(acc, 1, 2, 3, 4);
        acc = root.child2.child3.addit(acc, 4);
    }
    
    var delay = (Date.now() - now);
    
    console.log(its + " iterations concluded in " + delay + " ms: " + 1000*(delay/its) 
        + " us/it");
}

console.log("Accumulates: " + acc);

})(jQuery, fluid);
  