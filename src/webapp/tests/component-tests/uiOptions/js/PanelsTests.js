/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.textFont
     *******************************************************************************/
    var classnameMap = {
            "textFont": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            },
            "theme": {
                "default": "fl-uio-default-theme",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            }
        };

    /*******************************************************************************
     * Functions shared by panel tests
     *******************************************************************************/
    fluid.tests.checkModel = function (path, expectedValue) {
        return function (newModel) {
            var newval = fluid.get(newModel, path);
            jqUnit.assertEquals("Expected model value " + expectedValue + " at path " + path, expectedValue, newval);
        };
    };

    /*******************************************************************************
     * textFontPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.textFontPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textFont: {
                type: "fluid.uiOptions.panels.textFont",
                container: ".flc-textFont",
                options: {
                    model: {
                        value: 1
                    },
                    classnameMap: classnameMap
                }
            },
            textFontTester: {
                type: "fluid.tests.textFontTester"
            }
        }
    });

    fluid.tests.textFontPanel.testDefault = function (that, expectedNumOfOptions, expectedFont) {
        return function () {
            var options = that.container.find("option");
            jqUnit.assertEquals("There are " + expectedNumOfOptions + " text fonts in the control", expectedNumOfOptions, options.length);
            jqUnit.assertEquals("The first text font is " + expectedFont, expectedFont, options.filter(":selected").val());

            fluid.each(options, function (option, index) {
                var css = that.options.classnameMap.textFont[option.value];
                if (css) {
                    jqUnit.assertTrue("The option has appropriate css applied", $(option).hasClass(css));
                }
            });
        };
    };

    fluid.tests.textFontPanel.changeSelection = function (element, newValue) {
        element.val(newValue).change();
    };

    fluid.defaults("fluid.tests.textFontTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfOptions: 5,
            defaultValue: "default",
            newValue: "comic"
        },
        modules: [{
            name: "Test the text font settings panel",
            tests: [{
                expect: 7,
                name: "Test the rendering of the text font panel",
                sequence: [{
                    func: "{textFont}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.textFontPanel.testDefault",
                    makerArgs: ["{textFont}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textFont}.events.afterRender"
                }, {
                    func: "fluid.tests.textFontPanel.changeSelection",
                    args: ["{textFont}.dom.textFont", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textFont}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Contrast
     *******************************************************************************/
    fluid.defaults("fluid.tests.contrastPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            contrast: {
                type: "fluid.uiOptions.panels.contrast",
                container: ".flc-contrast",
                options: {
                    model: {
                        value: "default"
                    },
                    classnameMap: classnameMap
                }
            },
            contrastTester: {
                type: "fluid.tests.contrastTester"
            }
        }
    });

    fluid.tests.contrastPanel.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
        return function () {
            var inputs = that.locate("themeInput");
            var labels = that.locate("themeLabel");

            jqUnit.assertEquals("There are " + expectedNumOfOptions + " contrast selections in the control", expectedNumOfOptions, inputs.length);
            jqUnit.assertEquals("The first contrast is " + expectedContrast, expectedContrast, inputs.filter(":checked").val());

            var inputValue, label;
            fluid.each(inputs, function (input, index) {
                inputValue = input.value;
                label = labels.eq(index);
                jqUnit.assertTrue("The contrast label has appropriate css applied", label.hasClass(that.options.classnameMap.theme[inputValue]));
            });
        };
    };

    fluid.tests.contrastPanel.changeChecked = function (inputs, newValue) {
        inputs.removeAttr("checked");
        inputs.filter("[value='" + newValue + "']").attr("checked", "checked").change();
    };

    fluid.defaults("fluid.tests.contrastTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedNumOfOptions: 5,
            defaultValue: "default",
            newValue: "bw"
        },
        modules: [{
            name: "Test the contrast settings panel",
            tests: [{
                expect: 8,
                name: "Test the rendering of the contrast panel",
                sequence: [{
                    func: "{contrast}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.contrastPanel.testDefault",
                    makerArgs: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    spec: {priority: "last"},
                    event: "{contrast}.events.afterRender"
                }, {
                    func: "fluid.tests.contrastPanel.changeChecked",
                    args: ["{contrast}.dom.themeInput", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{contrast}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Test functions shared by text field slider unit tests
     *******************************************************************************/
    fluid.tests.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
        return function () {
            var inputValue = that.container.find("input").val();
            jqUnit.assertEquals("The default input value has been set to the min value", that.options.range.min, inputValue);
        };
    };

    fluid.tests.changeInput = function (textSlider, newValue) {
        textSlider.find("input").val(newValue).change();
    };

    /*******************************************************************************
     * textSize
     *******************************************************************************/
    fluid.defaults("fluid.tests.textSizePanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textSize: {
                type: "fluid.uiOptions.panels.textSize",
                container: ".flc-textSize",
                options: {
                    model: {
                        value: 1
                    }
                }
            },
            textSizeTester: {
                type: "fluid.tests.textSizeTester"
            }
        }
    });

    fluid.defaults("fluid.tests.textSizeTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newValue: 1.2
        },
        modules: [{
            name: "Test the text sizer settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the text size panel",
                sequence: [{
                    func: "{textSize}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testDefault",
                    makerArgs: ["{textSize}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textSize}.events.afterRender"
                }, {
                    func: "fluid.tests.changeInput",
                    args: ["{textSize}.dom.textSize", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textSize}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * lineSpace
     *******************************************************************************/
    fluid.defaults("fluid.tests.lineSpacePanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            lineSpace: {
                type: "fluid.uiOptions.panels.lineSpace",
                container: ".flc-lineSpace",
                options: {
                    model: {
                        value: 1
                    }
                }
            },
            lineSpaceTester: {
                type: "fluid.tests.lineSpaceTester"
            }
        }
    });

    fluid.defaults("fluid.tests.lineSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newValue: 1.2
        },
        modules: [{
            name: "Test the line space settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the line space panel",
                sequence: [{
                    func: "{lineSpace}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.testDefault",
                    makerArgs: ["{lineSpace}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{lineSpace}.events.afterRender"
                }, {
                    func: "fluid.tests.changeInput",
                    args: ["{lineSpace}.dom.textSize", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{lineSpace}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Test functions shared by checkbox panels: layoutPanel & linkPanel
     *******************************************************************************/
    fluid.tests.changeCheckboxSelection = function (element) {
        element.attr("checked", "checked").change();
    };

    /*******************************************************************************
     * layoutPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.layoutPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            layout: {
                type: "fluid.uiOptions.panels.layoutControls",
                container: ".flc-layout",
                options: {
                    model: {
                        toc: false,
                        layout: false
                    }
                }
            },
            layoutTester: {
                type: "fluid.tests.layoutTester"
            }
        }
    });

    fluid.tests.layoutPanel.testDefault = function (checkbox, expectedValue) {
        return function () {
            var inputValue = checkbox.attr("checked");
            jqUnit.assertEquals("The toc option is not checked by default", expectedValue, inputValue);
        };
    };

    fluid.defaults("fluid.tests.layoutTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: undefined,
            newValue: true
        },
        modules: [{
            name: "Test the layout settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the layout panel",
                sequence: [{
                    func: "{layout}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.layoutPanel.testDefault",
                    makerArgs: ["{layout}.dom.toc", "{that}.options.testOptions.defaultInputStatus"],
                    event: "{layout}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{layout}.dom.toc"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["toc", "{that}.options.testOptions.newValue"],
                    spec: {path: "toc", priority: "last"},
                    changeEvent: "{layout}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * linksPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.linksPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            links: {
                type: "fluid.uiOptions.panels.linksControls",
                container: ".flc-links",
                options: {
                    model: {
                        links: false,
                        inputsLarger: false
                    }
                }
            },
            linksTester: {
                type: "fluid.tests.linksTester"
            }
        }
    });

    fluid.tests.linksPanel.testDefault = function (linksPanel, expectedValue) {
        return function () {
            var linksValue = linksPanel.locate("links").attr("checked");
            jqUnit.assertEquals("The links option is not checked by default", expectedValue, linksValue);
            var inputsLargerValue = linksPanel.locate("inputsLarger").attr("checked");
            jqUnit.assertEquals("The links option is not checked by default", expectedValue, inputsLargerValue);
        };
    };


    fluid.defaults("fluid.tests.linksTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: undefined,
            newValue: true
        },
        modules: [{
            name: "Test the links settings panel",
            tests: [{
                expect: 4,
                name: "Test the rendering of the links panel",
                sequence: [{
                    func: "{links}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.linksPanel.testDefault",
                    makerArgs: ["{links}", "{that}.options.testOptions.defaultInputStatus"],
                    event: "{links}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{links}.dom.links"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["links", "{that}.options.testOptions.newValue"],
                    spec: {path: "links", priority: "last"},
                    changeEvent: "{links}.applier.modelChanged"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{links}.dom.inputsLarger"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["inputsLarger", "{that}.options.testOptions.newValue"],
                    spec: {path: "inputsLarger", priority: "last"},
                    changeEvent: "{links}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.textFontPanel",
            "fluid.tests.contrastPanel",
            "fluid.tests.textSizePanel",
            "fluid.tests.lineSpacePanel",
            "fluid.tests.layoutPanel",
            "fluid.tests.linksPanel"
        ]);
    });

})(jQuery);
