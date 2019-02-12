/* eslint-env node */
"use strict";
var fluid = require("../../src/module/fluid");
fluid.setLogging(true);

require("gpii-testem");

fluid.defaults("fluid.tests.bundle.testem", {
    gradeNames: ["gpii.testem.coverage"],
    testPages:  ["tests/bundle-tests/all-bundle-tests.html"],
    sourceDirs: {
        src: "%infusion/src"
    },
    contentDirs: {
        tests:   "%infusion/tests"
    },
    testemOptions: {
        skip: "PhantomJS,Opera,Safari",
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.bundle.testem().getTestemOptions();
