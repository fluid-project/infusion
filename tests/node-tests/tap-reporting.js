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

/* eslint-env node */
/* global fluid */

"use strict";

// Expected to be available as a result of fluid.loadTestingSupport();
// in basic-node-tests.js
var QUnit = fluid.registerNamespace("QUnit");

fluid.registerNamespace("fluid.tests.tapOutput");

// Set boolean for the  presence of the --tap command line option to output a
// TAP report for consumption by testem when used as a custom launcher
fluid.tests.tapOutput.shouldOutputTAP = process.argv.findIndex(function (argument) {
    return argument.indexOf("--tap") > -1;
}) > -1;

// For accumulating TAP messages for parsing by testem custom launcher
var tapOutput = "";

// Function to output a TAP  failure report
// Assumed to be used with fluid.onUncaughtException.addListener
fluid.tests.tapOutput.outputTAPFailure = function (message) {
    if (!fluid.tests.expectFailure) {
        console.log("not ok -  " + message);
    }
};

if (fluid.tests.tapOutput.shouldOutputTAP) {
    // Register listener to output TAP failure report
    fluid.onUncaughtException.addListener(fluid.tests.tapOutput.outputTAPFailure, "outputTAPFailure",
        fluid.handlerPriorities.uncaughtException.log);

    // Additional handler for accumulating TAP output
    QUnit.testDone(function (data) {
        var tapResult = data.failed === 0 ? "ok" : "not ok";
        var tapMessage = tapResult + " " + fluid.tests.getTestMessage(data);
        tapOutput = tapOutput + tapMessage + "\n";
    });

    // Additional handler for outputting TAP
    QUnit.done(function () {
        // Output the TAP header
        console.log("1.." + fluid.tests.expectedTestCases);
        // Output the TAP report
        console.log(tapOutput);
    });
}
