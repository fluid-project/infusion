# Node module packaging test fixture for Infusion

This directory contains a simple test fixture to verify the basic packaging of Fluid Infusion as a node module
performed by the material in src/module/fluid.js .

To run the tests, execute

    `node basic-node-tests.js`

from the command line. They must terminate with the message

    `Infusion node.js internal tests OK - n/n tests passed`

(for some n) - if the last line of the process output isn't of this form,
the tests are a failure.

The comprehensive test suite for Infusion should be run in the browser by loading the markup file `tests/all-tests.html`

## TAP output for Testem Integration

The test can optionally output a TAP-formatted report in addition to its usual reporting, for integration with the Testem test runner
(https://github.com/testem/testem#processes-with-tap-output) that runs the browser-based tests (see the main README.md for details)

This mode is invoked by executing `node basic-node-tests.js --tap`
