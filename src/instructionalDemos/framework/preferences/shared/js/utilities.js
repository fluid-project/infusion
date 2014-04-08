/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, console */

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function () {

    // Ensure that only the "IMPORTANT" log messages created by the enactor logging function are displayed
    fluid.setLogging(false);

    demo.logModelValue = function (name, changeVal) {
        fluid.log(fluid.logLevel.IMPORTANT, name + " model changed to: " + changeVal);
    };

})();
