/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* eslint-env worker */

"use strict";

importScripts(
    "../../../../src/framework/core/js/jquery.standalone.js",
    "../../../../src/framework/core/js/Fluid.js",
    "../../../../src/framework/core/js/FluidPromises.js",
    "../../../../src/framework/core/js/FluidDebugging.js",
    "../../../../src/framework/core/js/FluidIoC.js",
    "../../../../src/framework/core/js/DataBinding.js"
);

fluid.defaults("fluid.test.workerTestComponent", {
    gradeNames: "fluid.modelComponent",

    model: {
        state: "sleepy"
    },

    invokers: {
        meow: {
            funcName: "fluid.test.workerTestComponent.meow"
        }
    }
});

fluid.test.workerTestComponent.meow = function () {
    return "raow!";
};


// Runs immediately when the worker is evaluated.
var cat = fluid.test.workerTestComponent();
self.postMessage(cat.meow());
