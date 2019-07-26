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

    fluid.registerNamespace("fluid.tests");

    jqUnit.asyncTest("Instantiate Infusion in Web Worker", function () {
        var expectedMessage = "raow!";
        var worker = new Worker("../js/WebWorkerTests-Worker.js");

        worker.addEventListener("message", function (e) {
            jqUnit.assertEquals("A message should have been received from the Infusion component running in the Worker.",
                expectedMessage, e.data);
            jqUnit.start();
        }, true);
    });
})();
