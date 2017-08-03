/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");
fluid.setLogging(true);

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    testPages:  "tests/all-tests.html",
    sourceDirs: ["src"],
    coverageDir: "coverage",
    serveDirs:  ["src", "node_modules"]
});

module.exports = fluid.tests.testem().getTestemOptions();

