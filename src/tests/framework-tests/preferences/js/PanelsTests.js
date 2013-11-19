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
     * Unit tests for fluid.prefs.textFont
     *******************************************************************************/
    var classnameMap = {
            "textFont": {
                "default": "",
                "times": "fl-font-prefsEditor-times",
                "comic": "fl-font-prefsEditor-comic-sans",
                "arial": "fl-font-prefsEditor-arial",
                "verdana": "fl-font-prefsEditor-verdana"
            },
            "theme": {
                "default": "fl-prefsEditor-default-theme",
                "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                "by": "fl-theme-prefsEditor-by fl-theme-by",
                "yb": "fl-theme-prefsEditor-yb fl-theme-yb",
                "lgdg": "fl-theme-prefsEditor-lgdg fl-theme-lgdg"
            }
        };

    var messages = {
        "textFont-default": "default",
        "textFont-times": "Times New Roman",
        "textFont-comic": "Comic Sans",
        "textFont-arial": "Arial",
        "textFont-verdana": "Verdana",
        "textFontLabel": "Text Style",
        "contrast": ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"],
        "contrastLabel": "Colour & Contrast"
    };

    var parentResolver = fluid.messageResolver({messageBase: messages});

    /*******************************************************************************
     * Functions shared by panel tests
     *******************************************************************************/
    fluid.tests.checkModel = function (path, expectedValue) {
        return function (newModel) {
            var newval = fluid.get(newModel, path);
            jqUnit.assertEquals("Expected model value " + expectedValue + " at path " + path, expectedValue, newval);
        };
    };

    fluid.defaults("fluid.prefs.defaultTestPanel", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        strings: {},
        parentBundle: {
            expander: {
                funcName: "fluid.messageResolver",
                args: [{messageBase: {}, parents: [parentResolver]}]
            }
        }
    });

    /*************************
     * composite panel tests *
     *************************/

    fluid.tests.assertPathsExist = function (root, paths) {
        fluid.each(paths, function (path) {
            jqUnit.assertValue("The path '" + path + "' should exist", fluid.get(root, path));
        });
    };

    fluid.tests.listenerFuncMaker = function (funcName, args, environment) {
        return function () {
            fluid.invokeGlobalFunction(funcName, args, environment);
        };
    };

    fluid.defaults("fluid.tests.subPanel", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        renderOnInit: true,
        selectors: {
            header: "h2"
        }
    });

    fluid.defaults("fluid.tests.subPanel1", {
        gradeNames: ["fluid.tests.subPanel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.sub1": {
                "model.value": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        listeners: {
            afterRender: {
                listener: "{compositePanel}.writeRecord",
                args: ["subPanel1"]
            }
        },
        repeatingSelectors: ["header"],
        protoTree: {
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "header",
                controlledBy: "value",
                pathAs: "modelPath",
                tree: {
                    value: "${{modelPath}}"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.subPanel2", {
        gradeNames: ["fluid.tests.subPanel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.sub2": {
                "model.value": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        listeners: {
            afterRender: {
                listener: "{compositePanel}.writeRecord",
                args: ["subPanel2"]
            }
        },
        rendererFnOptions: {
            noexpand: true
        },
        repeatingSelectors: [],
        produceTree: function (that) {
            return {
                children: [{
                    ID: "header",
                    componentType: "UIBound",
                    value: "subPanel2",
                    valuebinding: "value"
                }]
            };
        }
    });

    fluid.defaults("fluid.tests.compositePanel", {
        gradeNames: ["fluid.prefs.compositePanel", "autoInit"],
        selectors: {
            subPanel1: ".subPanel1",
            subPanel2: ".subPanel2",
            heading: ".heading"
        },
        strings: {
            heading: "Heading"
        },
        selectorsToIgnore: ["subPanel1", "subPanel2"],
        model: {
            "fluid_prefs_sub1": ["subPanel1", "subPanel1a"],
            "fluid_prefs_sub2": "subPanel2"
        },
        members: {
            fireRecord: {}
        },
        invokers: {
            writeRecord: {
                funcName: "fluid.tests.compositePanel.writeRecord",
                args: ["{that}.fireRecord", "{arguments}.0"]
            }
        },
        listeners: {
            afterRender: {
                listener: "{that}.writeRecord",
                args: ["compositePanel"]
            }
        },
        protoTree: {
            "heading": {
                messagekey: "heading"
            }
        },
        resources: {
            template: {
                resourceText: '<section><h1 class="heading"></h1><article class="subPanel1"></article><article class="subPanel2"></article></section>'
            },
            subPanel1: {
                resourceText: "<h2>subPanel1</h2>"
            },
            subPanel2: {
                resourceText: "<h2>subPanel2</h2>"
            }
        },
        components: {
            subPanel1: {
                type: "fluid.tests.subPanel1",
                container: "{compositePanel}.dom.subPanel1",
                createOnEvent: "initSubPanels"
            },
            subPanel2: {
                type: "fluid.tests.subPanel2",
                container: "{compositePanel}.dom.subPanel2",
                createOnEvent: "initSubPanels"
            }
        }
    });

    fluid.tests.compositePanel.writeRecord = function (fireRecord, id) {
        var currentVal = fluid.get(fireRecord, id);
        fluid.set(fireRecord, id, currentVal !== undefined ? ++currentVal : 1);
    };

    jqUnit.test("fluid.prefs.compositePanel", function () {
        jqUnit.expect(16);
        var that = fluid.tests.compositePanel(".flc-prefs-compositePanel");

        var expectedSubPanel1Rules = {
            "fluid_prefs_sub1": "value"
        };

        var expectedSubPanel2Rules = {
            "fluid_prefs_sub2": "value"
        };

        var expectedResourceText = '<section><h1 class="heading"></h1><article class="subPanel1"><h2>subPanel1</h2></article><article class="subPanel2"><h2>subPanel2</h2></article></section>';

        var expectedFireRecord = {
            compositePanel: 3,
            subPanel1: 3,
            subPanel2: 3
        };

        var expectedSupanel1Selector = ".subPanel1 h2";
        var expectedSupanel2Selector = ".subPanel2 h2";

        var expectedRepeatingSelectors = ["subPanel1_header"];

        var expectedTree = {
            "children": [{
                "ID": "heading",
                "componentType": "UIMessage",
                "messagekey": {
                    "value": "heading"
                }
            }, {
                "ID": "subPanel1_header:",
                "componentType": "UIBound",
                "value": "subPanel1",
                "valuebinding": "fluid_prefs_sub1.0"
            }, {
                "ID": "subPanel1_header:",
                "componentType": "UIBound",
                "value": "subPanel1a",
                "valuebinding": "fluid_prefs_sub1.1"
            }, {
                "ID": "subPanel2_header",
                "componentType": "UIBound",
                "value": "subPanel2",
                "valuebinding": "fluid_prefs_sub2"
            }]
        };

        that.refreshView();
        that.subPanel1.refreshView();
        that.subPanel2.refreshView();
        jqUnit.assertDeepEq("The events should have populated the fireRecord correctly", expectedFireRecord, that.fireRecord);

        jqUnit.assertFalse("The renderOnInit option for subPanel1 should be false", that.subPanel1.options.renderOnInit);
        jqUnit.assertFalse("The renderOnInit option for subPanel2 should be false", that.subPanel2.options.renderOnInit);
        jqUnit.assertDeepEq("The rules block for subPanel1 should be generated correctly", expectedSubPanel1Rules, that.subPanel1.options.rules);
        jqUnit.assertDeepEq("The rules block for subPanel2 should be generated correctly", expectedSubPanel2Rules, that.subPanel2.options.rules);
        jqUnit.assertEquals("The resourceText should have been combined correctly", expectedResourceText, that.options.resources.template.resourceText);
        jqUnit.assertEquals("subPanel1's selectors should be surfaced to the compositePanel correctly", expectedSupanel1Selector, that.options.selectors.subPanel1_header);
        jqUnit.assertEquals("subPanel2's selectors should be surfaced to the compositePanel correctly", expectedSupanel2Selector, that.options.selectors.subPanel2_header);
        jqUnit.assertDeepEq("The repeatingSelectors should have been surfaced correctly", expectedRepeatingSelectors, that.options.rendererFnOptions.subPanelRepeatingSelectors);
        jqUnit.assertDeepEq("The produceTree should have combined the subPanel protoTrees together correctly", expectedTree, that.produceTree());
        jqUnit.assertEquals("The markup for the compositePanel should have rendered correctly", that.options.strings.heading, that.locate("heading").text());
        that.subPanel1.locate("header").each(function (idx, elm) {
            var actual = $(elm).text();
            jqUnit.assertEquals("The markup for subPanel1 should have rendered correctly", that.subPanel1.model.value[idx], actual);
        });
        jqUnit.assertEquals("The markup for subPanel2 should have rendered correctly", that.subPanel2.model.value, that.subPanel2.locate("header").text());
        jqUnit.assertDeepEq("The model for the subPanel1 should be the same as the corresponding value in the compositePanel", that.model.fluid_prefs_sub1, that.subPanel1.model.value);
        jqUnit.assertEquals("The model for the subPanel2 should be the same as the corresponding value in the compositePanel", that.model.fluid_prefs_sub2, that.subPanel2.model.value);
    });

    /* FLUID-5201: renderer fluid decorator */

    fluid.defaults("fluid.tests.panel.sliderTest1", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        selectors: {
            textSize: ".flc-prefsEditor-min-val",
            label: ".flc-prefsEditor-min-val-label",
            smallIcon: ".flc-prefsEditor-min-val-smallIcon",
            largeIcon: ".flc-prefsEditor-min-val-largeIcon",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            smallIcon: {messagekey: "textSizeSmallIcon"},
            largeIcon: {messagekey: "textSizeLargeIcon"},
            multiplier: {messagekey: "multiplier"},
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider"
                }
            }
        }
    });

    jqUnit.test("FLUID-5201: renderer fluid decorator in a composite panel", function () {
        jqUnit.expect(1);
        var that = fluid.prefs.compositePanel(".fluid-5201", {
            selectors: {
                sliderTest1: ".flc-tests-panel-sliderTest1"
            },
            selectorsToIgnore: ["sliderTest1"],
            components: {
                sliderTest1: {
                    type: "fluid.tests.panel.sliderTest1",
                    createOnEvent: "initSubPanels",
                    container: "{that}.dom.sliderTest1"
                }
            },
            resources: {
                template: {
                    resourceText: '<ul><li class="flc-tests-panel-sliderTest1"></li></ul>'
                },
                sliderTest1: {
                    resourceText: '<div class="flc-prefsEditor-min-val"><div class="flc-textfieldSlider-slider"></div><input id="min-val" class="flc-textfieldSlider-field" type="text" /><span class="flc-prefsEditor-multiplier"></span></div>'
                }
            }
        });

        // the first call to refreshView does the initial rendeirng which includes
        // putting the component defined by the renderer decorator into the components block
        that.refreshView();

        // the second call to refresh view uses the new components block and should ignore
        // the renderer decorator component which isn't a panel
        that.refreshView();
        jqUnit.assert("The composite panel containing a panel with renderer fluid decorator should have instantiated", that);
    });

    /* end FLUID-5201 */

    /* FLUID-5202: rebase valuebinding in a renderer selection object */

    fluid.defaults("fluid.tests.panel.dropdownTest1", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "learning.dropdownTest1": {
                "model.ddVal": "default",
                "controlValues.ddStrings": "enum"
            }
        },
        strings: {
            "dropdownTest-en": "English",
            "dropdownTest-kl": "Klingon",
            "dropdownTest-bj": "Bajoran",
            "dropdownTest-rm": "Romulan",
            "dropdownTest-cd": "Cardassian"
        },
        selectors: {
            textFont: ".flc-prefsEditor-text-font",
        },
        stringArrayIndex: {
            dd: ["dropdownTest-en", "dropdownTest-kl", "dropdownTest-bj", "dropdownTest-rm", "dropdownTest-cd"]
        },
        controlValues: {
            ddStrings: ["en", "kl", "bj", "rm", "cd"]
        },
        protoTree: {
            textFont: {
                optionnames: "${{that}.stringBundle.dd}",
                optionlist: "${{that}.options.controlValues.ddStrings}",
                selection: "${ddVal}"
            }
        }
    });

    jqUnit.test("FLUID-5202: rebase valuebinding in renderer selection object", function () {
        var that = fluid.prefs.compositePanel(".fluid-5202", {
            selectors: {
                dropdownTest1: ".flc-tests-panel-dropdownTest1"
            },
            selectorsToIgnore: ["dropdownTest1"],
            model: {
                "learning_dropdownTest1": "kl"
            },
            components: {
                dropdownTest1: {
                    type: "fluid.tests.panel.dropdownTest1",
                    createOnEvent: "initSubPanels",
                    container: "{that}.dom.dropdownTest1"
                }
            },
            resources: {
                template: {
                    resourceText: '<ul><li class="flc-tests-panel-dropdownTest1"></li></ul>'
                },
                dropdownTest1: {
                    resourceText: '<select class="flc-prefsEditor-text-font" id="text-font"></select>'
                }
            }
        });

        var expectedTree = {
            "children": [{
                "ID": "dropdownTest1_textFont",
                "componentType": "UISelect",
                "optionlist": {
                    "value": [
                        "en",
                        "kl",
                        "bj",
                        "rm",
                        "cd"
                    ]
                },
                "optionnames": {
                    "value": [
                        "English",
                        "Klingon",
                        "Bajoran",
                        "Romulan",
                        "Cardassian"
                    ]
                },
                "selection": {
                    "value": "kl",
                    "valuebinding": "learning_dropdownTest1"
                }
            }]
        };

        jqUnit.assertDeepEq("The tree should be produced correctly, with all valuebinding rebased.", expectedTree, that.produceTree());
    });

    /* end FLUID-5202 */

    /* FLUID-5200: rebase parentRelativeID */

    fluid.defaults("fluid.tests.panel.radioTest1", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "learning.radioTest1": {
                "model.radioVal": "default",
                "controlValues.radioStrings": "enum"
            }
        },
        selectors: {
            frequencyRow: ".flc-prefsEditor-frequencyRow",
            frequencyLabel: ".flc-prefsEditor-frequency-label",
            frequencyInput: ".flc-prefsEditor-frequencyInput",
            label: ".flc-prefsEditor-contrast-label"
        },
        strings: {
            "radioTestKey-yes": "Yes",
            "radioTestKey-no": "No",
            "radioTestKey-maybe": "Maybe",
            "radioTestKey-sometimes": "Sometimes"
        },
        stringArrayIndex: {
            radioTestStrings: ["radioTestKey-yes", "radioTestKey-no", "radioTestKey-maybe", "radioTestKey-sometimes"]
        },
        controlValues: {
            radioStrings: ["yes", "no", "maybe", "sometimes"]
        },
        repeatingSelectors: ["frequencyRow"],
        protoTree: {
            label: {messagekey: "radioTestLabelKey"},
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "frequencyRow",
                labelID: "frequencyLabel",
                inputID: "frequencyInput",
                selectID: "frequency-radio",
                tree: {
                    optionnames: "${{that}.stringBundle.radioTestStrings}",
                    optionlist: "${{that}.options.controlValues.radioStrings}",
                    selection: "${radioVal}"
                }
            }
        }
    });

    jqUnit.test("FLUID-5200: rebase parentRelativeID", function () {
        var that = fluid.prefs.compositePanel(".fluid-5200", {
            selectors: {
                radioTest1: ".flc-tests-panel-radioTest1"
            },
            selectorsToIgnore: ["radioTest1"],
            model: {
                "learning_radioTest1": "maybe"
            },
            components: {
                radioTest1: {
                    type: "fluid.tests.panel.radioTest1",
                    createOnEvent: "initSubPanels",
                    container: "{that}.dom.radioTest1"
                }
            },
            resources: {
                template: {
                    resourceText: '<ul><li class="flc-tests-panel-radioTest1"></li></ul>'
                },
                radioTest1: {
                    resourceText: '<div class="flc-prefsEditor-frequencyRow"><input type="radio" class="flc-prefsEditor-frequencyInput" name="frequency" id="frequency"/><label for="frequency" class="flc-prefsEditor-frequency-label"></label></div>'
                }
            }
        });

        var expectedTree = {
            "children": [{
                "ID": "radioTest1_label",
                "componentType": "UIMessage",
                "messagekey": {
                    "value": "radioTestLabelKey"
                }
            }, {
                "ID": "radioTest1_frequency-radio",
                "componentType": "UISelect",
                "optionlist": {
                    "value": [
                        "yes",
                        "no",
                        "maybe",
                        "sometimes"
                    ]
                },
                "optionnames": {
                    "value": [
                        "Yes",
                        "No",
                        "Maybe",
                        "Sometimes"
                    ]
                },
                "selection": {
                    "value": "maybe",
                    "valuebinding": "learning_radioTest1"
                }
            }, {
                "ID": "radioTest1_frequencyRow:",
                "children": [{
                    "ID": "radioTest1_frequencyInput",
                    "choiceindex": 0,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }, {
                    "ID": "radioTest1_frequencyLabel",
                    "choiceindex": 0,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }]
            }, {
                "ID": "radioTest1_frequencyRow:",
                "children": [{
                    "ID": "radioTest1_frequencyInput",
                    "choiceindex": 1,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }, {
                    "ID": "radioTest1_frequencyLabel",
                    "choiceindex": 1,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }]
            }, {
                "ID": "radioTest1_frequencyRow:",
                "children": [{
                    "ID": "radioTest1_frequencyInput",
                    "choiceindex": 2,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }, {
                    "ID": "radioTest1_frequencyLabel",
                    "choiceindex": 2,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }]
            }, {
                "ID": "radioTest1_frequencyRow:",
                "children": [{
                    "ID": "radioTest1_frequencyInput",
                    "choiceindex": 3,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }, {
                    "ID": "radioTest1_frequencyLabel",
                    "choiceindex": 3,
                    "componentType": "UISelectChoice",
                    "parentRelativeID": "..::radioTest1_frequency-radio"
                }]
            }]
        };
        jqUnit.assertDeepEq("The tree should be produced correctly, with all valuebinding rebased.", expectedTree, that.produceTree());
    });

    /* end FLUID-5200 */

    /* FLUID-5203: support multiple text field sliders in one composite panel */

    fluid.defaults("fluid.tests.panel.slider1", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        selectors: {
            textSize: ".flc-prefsEditor-min-val",
            label: ".flc-prefsEditor-min-val-label",
            smallIcon: ".flc-prefsEditor-min-val-smallIcon",
            largeIcon: ".flc-prefsEditor-min-val-largeIcon",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        range: {
            min: 1,
            max: 10
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            smallIcon: {messagekey: "textSizeSmallIcon"},
            largeIcon: {messagekey: "textSizeLargeIcon"},
            multiplier: {messagekey: "multiplier"},
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            "slider1": "value"
                        },
                        model: "{fluid.tests.panel.slider1}.model",
                        sourceApplier: "{fluid.tests.panel.slider1}.applier",
                        range: "{fluid.tests.panel.slider1}.options.range",
                        sliderOptions: "{fluid.tests.panel.slider1}.options.sliderOptions"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.panel.slider2", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        selectors: {
            textSize: ".flc-prefsEditor-min-val",
            label: ".flc-prefsEditor-min-val-label",
            smallIcon: ".flc-prefsEditor-min-val-smallIcon",
            largeIcon: ".flc-prefsEditor-min-val-largeIcon",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        range: {
            min: 0,
            max: 20
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            smallIcon: {messagekey: "textSizeSmallIcon"},
            largeIcon: {messagekey: "textSizeLargeIcon"},
            multiplier: {messagekey: "multiplier"},
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            "slider2": "value"
                        },
                        model: "{fluid.tests.panel.slider2}.model",
                        sourceApplier: "{fluid.tests.panel.slider2}.applier",
                        range: "{fluid.tests.panel.slider2}.options.range",
                        sliderOptions: "{fluid.tests.panel.slider2}.options.sliderOptions"
                    }
                }
            }
        }
    });

    jqUnit.test("FLUID-5203: support multiple text field sliders in one composite panel", function () {
        jqUnit.expect(4);
        var that = fluid.prefs.compositePanel(".fluid-5203", {
            selectors: {
                slider1: ".flc-tests-panel-slider1",
                slider2: ".flc-tests-panel-slider2"
            },
            selectorsToIgnore: ["slider1", "slider2"],
            components: {
                slider1: {
                    type: "fluid.tests.panel.slider1",
                    createOnEvent: "initSubPanels",
                    container: "{that}.dom.slider1"
                },
                slider2: {
                    type: "fluid.tests.panel.slider2",
                    createOnEvent: "initSubPanels",
                    container: "{that}.dom.slider2"
                }
            },
            resources: {
                template: {
                    resourceText: '<ul><li class="flc-tests-panel-slider1"></li><li class="flc-tests-panel-slider2"></li></ul>'
                },
                slider1: {
                    resourceText: '<div class="flc-prefsEditor-min-val"><div class="flc-textfieldSlider-slider"></div><input id="min-val" class="flc-textfieldSlider-field" type="text" /><span class="flc-prefsEditor-multiplier"></span></div>'
                },
                slider2: {
                    resourceText: '<div class="flc-prefsEditor-min-val"><div class="flc-textfieldSlider-slider"></div><input id="min-val" class="flc-textfieldSlider-field" type="text" /><span class="flc-prefsEditor-multiplier"></span></div>'
                }
            }
        });

        // the first call to refreshView does the initial rendeirng which includes
        // putting the component defined by the renderer decorator into the components block
        that.refreshView();

        // the second call to refresh view uses the new components block and should ignore
        // the renderer decorator component which isn't a panel
        that.refreshView();

        jqUnit.assert("The initial state with the min value for slider1 has been set properly", 0, $(".flc-tests-panel-slider1 .flc-textfieldSlider-slider").slider("value"));
        jqUnit.assert("The initial state with the min value for slider2 has been set properly", 1, $(".flc-tests-panel-slider2 .flc-textfieldSlider-slider").slider("value"));

        that.slider1.applier.requestChange("value", 100);
        that.slider2.applier.requestChange("value", 100);
        that.refreshView();
        jqUnit.assert("The max value for slider1 has been set properly", 10, $(".flc-tests-panel-slider1 .flc-textfieldSlider-slider").slider("value"));
        jqUnit.assert("The max value for slider2 has been set properly", 100, $(".flc-tests-panel-slider2 .flc-textfieldSlider-slider").slider("value"));
    });

    /* end FLUID-5203 */

    /* start FLUID-5210 */

    fluid.defaults("fluid.tests.fluid_5210.compositePanel", {
        gradeNames: ["fluid.prefs.compositePanel", "autoInit"],
        selectors: {
            originalSelector: ""
        },
        selectorsToIgnore: ["originalSelector"],
        resources: {
            template: {
                resourceText: "<div></div>"
            }
        }
    });

    jqUnit.test("FLUID-5210: merge selectorsToIgnore", function () {
        var that = fluid.tests.fluid_5210.compositePanel(".fluid-5210", {
            selectors: {
                newSelector: ""
            },
            selectorsToIgnore: ["newSelector"]
        });

        var expected = ["originalSelector", "newSelector"];

        jqUnit.assertDeepEq("The selectorsToIgnore should be merged", expected, that.options.selectorsToIgnore);
    });

    /* end FLUID-5210 */

    /*******************************************************************************
     * textFontPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.textFontPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            textFont: {
                type: "fluid.prefs.panel.textFont",
                container: ".flc-textFont",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
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
                type: "fluid.prefs.panel.contrast",
                container: ".flc-contrast",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
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
            expectedNumOfOptions: 6,
            defaultValue: "default",
            newValue: "bw"
        },
        modules: [{
            name: "Test the contrast settings panel",
            tests: [{
                expect: 9,
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
    fluid.tests.testDefault = function (that) {
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
                type: "fluid.prefs.panel.textSize",
                container: ".flc-textSize",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
                    model: {
                        textSize: 1
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
                    makerArgs: ["{textSize}"],
                    event: "{textSize}.events.afterRender"
                }, {
                    func: "fluid.tests.changeInput",
                    args: ["{textSize}.dom.textSize", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["textSize", "{that}.options.testOptions.newValue"],
                    spec: {path: "textSize", priority: "last"},
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
                type: "fluid.prefs.panel.lineSpace",
                container: ".flc-lineSpace",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
                    model: {
                        lineSpace: 1
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
                    makerArgs: ["{lineSpace}"],
                    event: "{lineSpace}.events.afterRender"
                }, {
                    func: "fluid.tests.changeInput",
                    args: ["{lineSpace}.dom.textSize", "{that}.options.testOptions.newValue"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["lineSpace", "{that}.options.testOptions.newValue"],
                    spec: {path: "lineSpace", priority: "last"},
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

    fluid.tests.checkboxListenerTester = function (message, expectedState, checkbox) {
        return function () {
            jqUnit[expectedState ? "assertTrue" : "assertFalse"](message, checkbox.is(":checked"));
        };
    };

    /*******************************************************************************
     * layoutPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.layoutPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            layout: {
                type: "fluid.prefs.panel.layoutControls",
                container: ".flc-layout",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
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
                    listenerMaker: "fluid.tests.checkboxListenerTester",
                    makerArgs: ["The toc option is not checked by default", "{that}.options.testOptions.defaultInputStatus", "{layout}.dom.toc"],
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
     * emphasize links
     *******************************************************************************/
    fluid.defaults("fluid.tests.emphasizeLinksPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            layout: {
                type: "fluid.prefs.panel.emphasizeLinks",
                container: ".flc-links",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
                    model: {
                        links: false
                    }
                }
            },
            emphasizeLinksTester: {
                type: "fluid.tests.emphasizeLinksTester"
            }
        }
    });

    fluid.defaults("fluid.tests.emphasizeLinksTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: false,
            newValue: true
        },
        modules: [{
            name: "Test the emphasizeLinks settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the emphasizeLinks panel",
                sequence: [{
                    func: "{emphasizeLinks}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.checkboxListenerTester",
                    makerArgs: ["The inputs should be unchecked by default", "{that}.options.testOptions.defaultInputStatus", "{emphasizeLinks}.dom.links"],
                    event: "{emphasizeLinks}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{emphasizeLinks}.dom.links"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["links", "{that}.options.testOptions.newValue"],
                    spec: {path: "links", priority: "last"},
                    changeEvent: "{emphasizeLinks}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * inputs larger
     *******************************************************************************/
    fluid.defaults("fluid.tests.inputsLargerPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            layout: {
                type: "fluid.prefs.panel.inputsLarger",
                container: ".flc-links",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
                    model: {
                        inputsLarger: false
                    }
                }
            },
            inputsLargerTester: {
                type: "fluid.tests.inputsLargerTester"
            }
        }
    });

    fluid.defaults("fluid.tests.inputsLargerTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: false,
            newValue: true
        },
        modules: [{
            name: "Test the inputsLarger settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the inputsLarger panel",
                sequence: [{
                    func: "{inputsLarger}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.checkboxListenerTester",
                    makerArgs: ["The inputs should be unchecked by default", "{that}.options.testOptions.defaultInputStatus", "{inputsLarger}.dom.inputsLarger"],
                    event: "{inputsLarger}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{inputsLarger}.dom.inputsLarger"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["inputsLarger", "{that}.options.testOptions.newValue"],
                    spec: {path: "inputsLarger", priority: "last"},
                    changeEvent: "{inputsLarger}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * linksControlsPanel
     *******************************************************************************/
    fluid.defaults("fluid.tests.linksControlsPanel", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            linksControls: {
                type: "fluid.prefs.panel.linksControls",
                container: ".flc-links",
                options: {
                    gradeNames: "fluid.prefs.defaultTestPanel",
                    model: {
                        fluid_prefs_emphasizeLinks: false,
                        fluid_prefs_inputsLarger: false
                    },
                    strings: {
                        linksControlsLabel: "Links & buttons"
                    },
                    selectors: {
                        emphasizeLinks: ".flc-prefsEditor-emphasizeLinks",
                        inputsLarger: ".flc-prefsEditor-inputsLarger"
                    },
                    selectorsToIgnore: ["emphasizeLinks", "inputsLarger"],
                    components: {
                        emphasizeLinks: {
                            type: "fluid.prefs.panel.emphasizeLinks",
                            container: "{that}.dom.emphasizeLinks",
                            createOnEvent: "initSubPanels"
                        },
                        inputsLarger: {
                            type: "fluid.prefs.panel.inputsLarger",
                            container: "{that}.dom.inputsLarger",
                            createOnEvent: "initSubPanels"
                        }
                    },
                    resources: {
                        template: {
                            resourceText: '<h2 class="flc-prefsEditor-linksControls-label"></h2><li class="flc-prefsEditor-emphasizeLinks"></li><li class="flc-prefsEditor-inputsLarger"></li>'
                        },
                        emphasizeLinks: {
                            resourceText: '<input type="checkbox" id="links-choice" class="flc-prefsEditor-links fl-force-left" />'
                        },
                        inputsLarger: {
                            resourceText: '<input type="checkbox" id="inputs-choice" class="flc-prefsEditor-inputs-larger fl-force-left" />'
                        }
                    }
                }
            },
            linksTester: {
                type: "fluid.tests.linksTester"
            }
        }
    });

    fluid.tests.linksControlsPanel.testDefault = function (linksControlsPanel, expectedValue, expectedLabel) {
        return function () {
            var linksLabel = linksControlsPanel.locate("label").text();
            jqUnit.assertEquals("The links control label is rendered correctly", expectedLabel, linksLabel);
            var linksValue = linksControlsPanel.emphasizeLinks.locate("links").attr("checked");
            jqUnit.assertEquals("The emphasizeLinks option is not checked by default", expectedValue, linksValue);
            var inputsLargerValue = linksControlsPanel.inputsLarger.locate("inputsLarger").attr("checked");
            jqUnit.assertEquals("The inputsLarger option is not checked by default", expectedValue, inputsLargerValue);
        };
    };


    fluid.defaults("fluid.tests.linksTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            defaultInputStatus: undefined,
            newValue: true
        },
        modules: [{
            name: "Test the linksControls settings panel",
            tests: [{
                expect: 5,
                name: "Test the rendering of the linksControls panel",
                sequence: [{
                    func: "{linksControls}.refreshView"
                }, {
                    listenerMaker: "fluid.tests.linksControlsPanel.testDefault",
                    makerArgs: ["{linksControls}", "{that}.options.testOptions.defaultInputStatus", "{linksControls}.options.strings.linksControlsLabel"],
                    event: "{linksControls}.events.afterRender"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{linksControls}.emphasizeLinks.dom.links"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["fluid_prefs_emphasizeLinks", "{that}.options.testOptions.newValue"],
                    spec: {path: "fluid_prefs_emphasizeLinks", priority: "last"},
                    changeEvent: "{linksControls}.applier.modelChanged"
                }, {
                    func: "fluid.tests.changeCheckboxSelection",
                    args: ["{linksControls}.inputsLarger.dom.inputsLarger"]
                }, {
                    listenerMaker: "fluid.tests.checkModel",
                    makerArgs: ["fluid_prefs_inputsLarger", "{that}.options.testOptions.newValue"],
                    spec: {path: "fluid_prefs_inputsLarger", priority: "last"},
                    changeEvent: "{linksControls}.applier.modelChanged"
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
            "fluid.tests.emphasizeLinksPanel",
            "fluid.tests.inputsLargerPanel",
            "fluid.tests.linksControlsPanel"
        ]);
    });

})(jQuery);
