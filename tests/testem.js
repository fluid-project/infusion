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

/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");
fluid.setLogging(true);

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.instrumentation"],
    coverageDir: "coverage",
    reportsDir: "reports",
    testPages:  ["tests/all-tests.html"],
    instrumentationOptions: {
        nonSources: [
            "./**/*.!(js)",
            "./lib/**/*",
            "./**/lib/**/*",
            "./Gruntfile.js"
        ]
    },
    sourceDirs: {
        src: "%infusion/src"
    },
    contentDirs: {
        tests:   "%infusion/tests"
    },
    testemOptions: {
        launch: "Chrome,Firefox",
        ignore_missing_launchers: true,
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.testem().getTestemOptions();
