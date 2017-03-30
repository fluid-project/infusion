/*

    A component to load test defs in a combined format that can be used with qunit-composite as well as gpii-testem,
    both of which are used in this package.

    This component loads test definitions from a known URL relative to the root of the package directory, namely
    `/testDefs.json`.  Each entry in this file looks something like:

    ```
    [
        {
            name: "The module name, which will be used with qunit-composite...",
            tests: ["path/relative/to/package/test-fixture1.html", "other/path/relative/to/package/test-fixture2.html"
        }
    ]
    ```

    To use this grade, you must include it as a client-side dependency, and instantiate the client-side component.

 */
var fluid_3_0_0 = fluid_3_0_0 || {};

/* globals QUnit */
(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.test.qunitCompositeUtils");

    fluid.test.qunitCompositeUtils.resolveRelativePath = function (basePath, relativePath) {
        return basePath ? [basePath, relativePath].join("/") : relativePath;
    };

    fluid.test.qunitCompositeUtils.resolveAllPaths = function (basePath, paths) {
        return fluid.transform(fluid.makeArray(paths), function (singlePath) {
            return fluid.test.qunitCompositeUtils.resolveRelativePath(basePath, singlePath);
        });
    };

    fluid.test.qunitCompositeUtils.informQUnit = function (that, testDefs) {
        fluid.each(fluid.makeArray(testDefs), function (testDef) {
            var argsForQUnit = [];
            var resolvedTestPaths = fluid.test.qunitCompositeUtils.resolveAllPaths(that.options.basePath, testDef.tests);
            argsForQUnit.push(resolvedTestPaths);

            if (testDef.name) { argsForQUnit.unshift(testDef.name); }
            QUnit.testSuites.apply(null, argsForQUnit);
        });
    };

    fluid.registerNamespace("fluid.test.qunitCompositeUtils.client");

    fluid.test.qunitCompositeUtils.client.getSettings = function (that, settingsUrl) {
        // Request a JSON payload and return it as an object.  See http://api.jquery.com/jquery.getjson/ for docs.
        var requestPromise = $.getJSON(settingsUrl);
        requestPromise.done(that.informQUnit);
        requestPromise.fail(fluid.fail);
    };

    fluid.defaults("fluid.test.qunitCompositeUtils.client", {
        gradeNames: ["fluid.component"],
        settingsUrl: "/testDefs.json",
        invokers: {
            "informQUnit": {
                funcName: "fluid.test.qunitCompositeUtils.informQUnit",
                args:     ["{that}", "{arguments}.0"]
            }
        },
        listeners: {
            "onCreate.getSettings": {
                funcName: "fluid.test.qunitCompositeUtils.client.getSettings",
                args:     ["{that}", "{that}.options.settingsUrl"]
            }
        }

    });
})(jQuery, fluid_3_0_0);
