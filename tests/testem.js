/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.commonTestDefs", "gpii.testem.coverageDataOnly"],
    testDefFile: "%infusion/testDefs.json",
    sourceDirs: ["src"],
    coverageDir: "coverage",
    serveDirs:  ["src", "node_modules"],
    // We have a lot more data than usual, so we have to relax the POST limits.
    distributeOptions: {
        record: 125000000000,
        target: "{that gpii.express.middleware.wrappedMiddleware}.options.middlewareOptions.limit"
    },
    testemOptions: {
        browser_disconnect_timeout: 300, // Five minutes
        browser_start_timeout:      300,
        timeout: 300,
        // https://github.com/testem/testem/issues/777
        // TODO: Make it possible to define this as a yargs-style map, and use an expander to reduce it to what testem expects.
        "browser_args": {
            "Chrome": ["--memory-pressure-threshholds 1"]
            // ,
            // Try --memory-pressure-off  ?
            // "Firefox": ["-safe-mode"]
        },
        "framework":   "qunit",
        "parallel":    3
    }
});

module.exports = fluid.tests.testem().getTestemOptions();

