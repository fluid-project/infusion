This directory contains a simple test fixture to verify the basic packaging of Fluid Infusion as a node module
performed by the material in src/module/fluid.js . 

To run the tests, execute 

    node basic-node-tests.js 

from the command line. They must terminate with the message

    Infusion node.js internal tests OK - n/n tests passed
    
(for some n) - if the last line of the process output isn't of this form,
the tests are a failure.

The comprehensive test suite for Infusion should be run in the browser by loading the markup file `tests/all-tests.html`
