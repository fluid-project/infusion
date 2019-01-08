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

var example = example || {};
(function () {
    "use strict";

    // Ensure that only the "IMPORTANT" log messages created by the enactor logging function are displayed
    fluid.setLogging(false);

    example.logModelValue = function (name, changeVal) {
        fluid.log(fluid.logLevel.IMPORTANT, name + " model changed to: " + changeVal);
    };

})();
