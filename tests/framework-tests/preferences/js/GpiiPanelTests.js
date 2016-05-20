/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * GPII Integration
     *******************************************************************************/

    jqUnit.test("Test fluid.prefs.panel.gpii.consolidateGPIIPrefs()", function () {
        var testCases = {
            case1: {
                message: "Empty GPII prefs object",
                local: {
                    contrast: "default",
                    fontSize: 2
                },
                gpii: {},
                expected: {
                    contrast: "default",
                    fontSize: 2
                }
            },
            case2: {
                message: "GPII prefs object is a subset of the local prefs object",
                local: {
                    contrast: "default",
                    fontSize: 2
                },
                gpii: {
                    contrast: "bw"
                },
                expected: {
                    contrast: "bw",
                    fontSize: 2
                }
            },
            case3: {
                message: "GPII prefs object contains same prefs as the local prefs object but with different values",
                local: {
                    contrast: "default",
                    fontSize: 2
                },
                gpii: {
                    contrast: "bw",
                    fontSize: 1
                },
                expected: {
                    contrast: "bw",
                    fontSize: 1
                }
            },
            case4: {
                message: "GPII prefs object has more prefs than the local prefs object",
                local: {
                    contrast: "default",
                    fontSize: 2
                },
                gpii: {
                    contrast: "bw",
                    fontSize: 1,
                    magnifier: true
                },
                expected: {
                    contrast: "bw",
                    fontSize: 1
                }
            },
            case5: {
                message: "The local prefs object is empty",
                local: {
                },
                gpii: {
                    contrast: "bw",
                    fontSize: 1,
                    magnifier: true
                },
                expected: {
                }
            }
        };

        fluid.each(testCases, function (oneCase) {
            jqUnit.assertDeepEq(oneCase.message, oneCase.expected, fluid.prefs.panel.gpii.consolidateGPIIPrefs(oneCase.gpii, oneCase.local));
        });
    });

    fluid.defaults("fluid.tests.prefs.panel.gpii", {
        gradeNames: ["fluid.prefs.panel.gpii", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        messageBase: {
            "gpiiLabel": "GPII preference syncing",
            "importLabel": "import & apply my GPII preferences",
            "importTooltipContent": "your existing GPII preferences will be applied to this site",
            "exportLabel": "export my new preferences to GPII",
            "exportTooltipContent": "your new preferences will be stored in your GPII account",
            "autoLabel": "automatially sync my preferences"
        },
        model: {
            auto: true
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-gpii.html"
            }
        }
    });

    fluid.defaults("fluid.tests.gpiiPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            gpii: {
                type: "fluid.tests.prefs.panel.gpii",
                container: ".flc-gpii",
                createOnEvent: "{gpiiTester}.events.onTestCaseStart"
            },
            gpiiTester: {
                type: "fluid.tests.gpiiTester"
            }
        }
    });

    fluid.tests.gpiiPanel.testDefault = function (that) {
        var messageBase = that.options.messageBase;

        jqUnit.assertEquals("The gpii title text is expected", messageBase.gpiiLabel, that.locate("gpiiLabel").text());
        jqUnit.assertEquals("The export button text is expected", messageBase.exportLabel, that.locate("exportButton").text());
        jqUnit.assertEquals("The import button text is expected", messageBase.importLabel, that.locate("importButton").text());
        jqUnit.assertEquals("The text for the automatical syncing checkbox is expected", messageBase.autoLabel, that.locate("autoLabel").text());
        jqUnit.assertTrue("The checkbox for the automatical syncing is checked", that.locate("auto").attr("checked"));
        jqUnit.assertEquals("The tooltip component for the import button is instantiated with the proper content", messageBase.importTooltipContent, that.tooltipForImport.options.content);
        jqUnit.assertEquals("The tooltip component for the export button is instantiated with the proper content", messageBase.exportTooltipContent, that.tooltipForExport.options.content);
    };

    fluid.defaults("fluid.tests.gpiiTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Test the gpii settings panel",
            tests: [{
                expect: 9,
                name: "Test the rendering of the gpii panel",
                sequence: [{
                    listener: "fluid.tests.gpiiPanel.testDefault",
                    args: ["{gpii}"],
                    priority: "last:testing",
                    event: "{gpiiPanel gpii}.events.afterRender"
                }, {
                    jQueryTrigger: "click",
                    element: "{gpii}.dom.exportButton"
                }, {
                    listener: "jqUnit.assertTrue",
                    args: ["The onExport event is triggered", true],
                    event: "{gpii}.events.onExport"
                }, {
                    jQueryTrigger: "click",
                    element: "{gpii}.dom.importButton"
                }, {
                    listener: "jqUnit.assertTrue",
                    args: ["The onImport event is triggered", true],
                    event: "{gpii}.events.onImport"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.gpiiPanel"
        ]);
    });

})(jQuery);
