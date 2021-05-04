/* eslint-env node */
"use strict";
var fluid = require("../../src/module/fluid");
fluid.setLogging(true);

require("fluid-testem");

fluid.defaults("fluid.tests.bundle.testem", {
    gradeNames: ["fluid.testem.coverage"],
    testPages:  [
        "tests/bundle-tests/infusion-all.html",
        "tests/bundle-tests/infusion-all-no-jquery.html",
        "tests/bundle-tests/infusion-framework.html",
        "tests/bundle-tests/infusion-framework-no-jquery.html",
        "tests/bundle-tests/infusion-uio.html",
        "tests/bundle-tests/infusion-uio-no-jquery.html"
    ],
    sourceDirs: {
        src: "%infusion/src"
    },
    contentDirs: {
        tests:   "%infusion/tests"
    },
    testemOptions: {
        launch: "Headless Chrome",
        disable_watching: true,
        tap_quiet_logs: true
    }
});

module.exports = fluid.tests.bundle.testem().getTestemOptions();
