/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");

require("gpii-testem");

// TODO: Remove this
var os = require("os");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    // testPages: "tests/framework-tests/core/html/FluidJS-test.html",
    testPages:  "tests/all-tests.html",
    sourceDirs: ["src"],
    coverageDir: "coverage",
    serveDirs:  ["src", "node_modules"],
    // TODO: Move this to gpii-testem once we confirm that it addresses the problem.
    diskCacheDir: {
        expander: {
            funcName: "gpii.testem.generateUniqueDirName",
            args:     [os.tmpdir(), "chrome_cache_dir", "{that}.id"] // basePath, prefix, suffix
        }
    },
    testemOptions: {
        browser_disconnect_timeout: 300, // Five minutes
        browser_start_timeout:300,
        timeout: 300,
        // https://github.com/testem/testem/issues/777
        // TODO: Make it possible to define this as a yargs-style map, and use an expander to reduce it to what testem expects.
        "browser_args": {
            "Chrome": ["--memory-pressure-threshholds 1 --disk-cache-dir ", "{that}.options.diskCacheDir"]
            // Try --memory-pressure-off  ?
        },
        "framework":   "qunit",
        "parallel":    1
    }
});

module.exports = fluid.tests.testem().getTestemOptions();

