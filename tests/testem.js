/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    testPages:  "tests/all-tests.html",
    sourceDirs: ["src"],
    coverageDir: "%fluid/coverage",
    serveDirs:  ["src", "node_modules"],
    testemOptions: {
        "framework":   "qunit",
        "parallel":    1
    }
});
// {
//     "reporter": "tap",
//     "report_file": "report.tap",
//     "launchers": {
//         "Node Module Basic Packaging Tests": {
//             "command": "node tests/node-tests/basic-node-tests.js --tap",
//             "protocol": "tap"
//         }
//     }
// }

module.exports = fluid.tests.testem().getTestemOptions();

