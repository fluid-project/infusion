/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");
fluid.setLogging(true);

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    testPages:  "tests/all-tests.html",
    // Add a 150ms pause between when our fixtures are ready and when we let Testem know it's safe to start the test run.
    // Seems to help with spurious browser test failures in Windows.
    startupPause: 150,
    invokers: {
        pauseOnStartup: {
            funcName: "setTimeout",
            args:     ["{that}.handleTestemStart", "{that}.options.startupPause", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    testemOptions: {
        on_start: "{that}.pauseOnStartup"
    },
    sourceDirs: ["src"],
    coverageDir: "coverage",
    serveDirs:  ["src", "node_modules"]
});

module.exports = fluid.tests.testem().getTestemOptions();

