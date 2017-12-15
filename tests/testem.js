/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");
fluid.setLogging(true);

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    // Add a 500ms pause between when our fixtures are ready and when we let Testem know it's safe to start the test run.
    // Seems to help with spurious browser test failures in Windows.
    // startupPause: 500,
    // invokers: {
    //     pauseOnStartup: {
    //         funcName: "setTimeout",
    //         args:     ["{that}.handleTestemStart", "{that}.options.startupPause", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
    //     }
    // },
    // testemOptions: {
    //     on_start: "{that}.pauseOnStartup"
    // },
    // listeners: {
        // "onTestemStart.pause": {
        //     priority: "after:instrument",
        //     funcName: "{that}.events.constructFixtures.fire"
        // },
        // "onTestemStart.constructFixtures": {
        //     priority: "after:pause",
        //     func:     "{that}.events.constructFixtures.fire"
        // },
    // },
    instrumentSource: false,
    coverageDir: "coverage",
    reportsDir: "reports",
    testemOptions: {
        skip: "PhantomJS,Opera,Safari",
        disable_watching: true,
        test_page:  "tests/all-tests.html",
        tap_quiet_logs: true,
        serve_files: ["instrumented", "tests", "node_modules"],
        routes: {
            "/src": "instrumented/src"
        }
    }
});

module.exports = fluid.tests.testem().getTestemOptions();

