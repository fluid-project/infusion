/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");
fluid.setLogging(true);

require("fluid-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["fluid.testem.instrumentation"],
    coverageDir: "coverage",
    reportsDir: "reports",
    testPages:  ["tests/all-tests.html"],
    instrumentationOptions: {
        nonSources: [
            "./**/*.!(js)",
            "./lib/**/*",
            "./**/lib/**/*",
            "./buildModules.js"
        ]
    },
    sourceDirs: {
        src: "%infusion/src"
    },
    contentDirs: {
        tests:   "%infusion/tests"
    },
    testemOptions: {
        launch: "Headless Firefox",
        ignore_missing_launchers: true,
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.testem().getTestemOptions();
