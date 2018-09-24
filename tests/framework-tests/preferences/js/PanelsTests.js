/*
Copyright 2007-2018 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

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

    /*************************
     * composite panel tests *
     *************************/

    fluid.tests.assertPathsExist = function (root, paths) {
        fluid.each(paths, function (path) {
            jqUnit.assertValue("The path '" + path + "' should exist", fluid.get(root, path));
        });
    };

    fluid.defaults("fluid.tests.subPanel", {
        gradeNames: ["fluid.prefs.panel"],
        renderOnInit: true,
        selectors: {
            header: "h2"
        }
    });

    fluid.defaults("fluid.tests.subPanel1", {
        gradeNames: ["fluid.tests.subPanel"],
        preferenceMap: {
            "fluid.prefs.sub1": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        listeners: {
            "afterRender.writeRecord": {
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
        gradeNames: ["fluid.tests.subPanel"],
        preferenceMap: {
            "fluid.prefs.sub2": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        listeners: {
            "afterRender.writeRecord": {
                listener: "{compositePanel}.writeRecord",
                args: ["subPanel2"]
            }
        },
        rendererFnOptions: {
            noexpand: true
        },
        repeatingSelectors: [],
        produceTree: function () {
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
        gradeNames: ["fluid.prefs.compositePanel"],
        selectors: {
            subPanel1: ".subPanel1",
            subPanel2: ".subPanel2",
            heading: ".heading"
        },
        messageBase: {
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
            "afterRender.writeRecord": {
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
                resourceText: "<section><h1 class=\"heading\"></h1><article class=\"subPanel1\"></article><article class=\"subPanel2\"></article></section>"
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
                container: "{compositePanel}.dom.subPanel1"
            },
            subPanel2: {
                type: "fluid.tests.subPanel2",
                container: "{compositePanel}.dom.subPanel2"
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

        var expectedResourceText = "<section><h1 class=\"heading\"></h1><article class=\"subPanel1\"><h2>subPanel1</h2></article><article class=\"subPanel2\"><h2>subPanel2</h2></article></section>";

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
                "ID": "subPanel2_header",
                "componentType": "UIBound",
                "value": "subPanel2",
                "valuebinding": "fluid_prefs_sub2"
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
        jqUnit.assertEquals("The markup for the compositePanel should have rendered correctly", that.options.messageBase.heading, that.locate("heading").text());
        that.subPanel1.locate("header").each(function (idx, elm) {
            var actual = $(elm).text();
            jqUnit.assertEquals("The markup for subPanel1 should have rendered correctly", that.subPanel1.model.value[idx], actual);
        });
        jqUnit.assertEquals("The markup for subPanel2 should have rendered correctly", that.subPanel2.model.value, that.subPanel2.locate("header").text());
        jqUnit.assertDeepEq("The model for the subPanel1 should be the same as the corresponding value in the compositePanel", that.model.fluid_prefs_sub1, that.subPanel1.model.value);
        jqUnit.assertEquals("The model for the subPanel2 should be the same as the corresponding value in the compositePanel", that.model.fluid_prefs_sub2, that.subPanel2.model.value);
    });

    jqUnit.test("renderOnPreference", function () {
        var assertInitialized = function (that, panelName) {
            jqUnit.assertTrue("The " + panelName + " sub panel should be initialized", that[panelName]);
            jqUnit.assertTrue("The container for " + panelName + " should be visible", that.locate(panelName).is(":visible"));
        };

        var assertNotInitialized = function (that, panelName) {
            jqUnit.assertFalse("The " + panelName + " sub panel should not be initialized", that[panelName]);
            jqUnit.assertFalse("The container for " + panelName + " should not be visible", that.locate(panelName).is(":visible"));
        };

        var assertText = function (that, panelName, expected) {
            var actual = that[panelName].locate("text").text();
            jqUnit.assertEquals("The text for " + panelName + " should have rendered correctly", expected, actual);
        };

        var assertChecked = function (that, panelName, expected) {
            var actual = that[panelName].locate("input").is(":checked");
            jqUnit.assertEquals("The value for " + panelName + " should have rendered correctly", expected, actual);
        };

        var assertSubPanelLifecycleBindings = function (that, componentName, preference) {
            var pref = fluid.prefs.subPanel.safePrefKey(preference);
            var initEvent = "initOn_" + pref;
            jqUnit.assertEquals("The createOnEvent for " + componentName + " should be set", initEvent, fluid.get(that, "options.components." + componentName + ".createOnEvent"));
            jqUnit.assertEquals("The " + initEvent + " event should have been added", null, that.options.events[initEvent]);
            jqUnit.assertTrue("The modelListener for " + pref + " should be added", that.options.modelListeners[pref]);
            jqUnit.assertTrue("The onCreate listener to trigger " + initEvent + " should be added", that.options.listeners["onCreate." + pref]);
        };

        var that = fluid.prefs.compositePanel(".renderOnPreference", {
            events: {
                someEvent: null
            },
            selectors: {
                alwaysPanel1: ".alwaysPanel1",
                alwaysPanel2: ".alwaysPanel2",
                conditionalPanel1: ".conditionalPanel1",
                conditionalPanel2: ".conditionalPanel2"
            },
            selectorsToIgnore: ["alwaysPanel1", "alwaysPanel2", "conditionalPanel1", "conditionalPanel2"],
            model: {
                some_pref_1: false,
                some_pref_2: false,
                some_pref_3: false,
                some_pref_4: false
            },
            messageBase: {
                text1: "conditionalPanel1",
                text2: "conditionalPanel2"
            },
            components: {
                alwaysPanel1: {
                    type: "fluid.prefs.panel",
                    container: "{that}.dom.alwaysPanel1",
                    options: {
                        preferenceMap: {
                            "some.pref.1": {
                                "model.value": "value"
                            }
                        },
                        messageBase: {
                            text: "alwaysPanel1"
                        },
                        selectors: {
                            input: ".input"
                        },
                        protoTree: {
                            input: "${value}"
                        }
                    }
                },
                alwaysPanel2: {
                    type: "fluid.prefs.panel",
                    container: "{that}.dom.alwaysPanel2",
                    options: {
                        preferenceMap: {
                            "some.pref.2": {
                                "model.value": "value"
                            }
                        },
                        messageBase: {
                            text: "alwaysPanel2"
                        },
                        selectors: {
                            input: ".input"
                        },
                        protoTree: {
                            input: "${value}"
                        }
                    }
                },
                conditionalPanel1: {
                    type: "fluid.prefs.panel",
                    container: "{that}.dom.conditionalPanel1",
                    options: {
                        renderOnPreference: "some.pref.1",
                        preferenceMap: {
                            "some.pref.3": {
                                "model.value": "value"
                            }
                        },
                        messageBase: {
                            text1: "conditionalPanel1"
                        },
                        selectors: {
                            text: ".text"
                        },
                        protoTree: {
                            text: {
                                messagekey: "text1"
                            }
                        }
                    }
                },
                conditionalPanel2: {
                    type: "fluid.prefs.panel",
                    container: "{that}.dom.conditionalPanel2",
                    options: {
                        renderOnPreference: "some.pref.2",
                        preferenceMap: {
                            "some.pref.4": {
                                "model.value": "value"
                            }
                        },
                        messageBase: {
                            text2: "conditionalPanel2"
                        },
                        selectors: {
                            text: ".text"
                        },
                        protoTree: {
                            text: {
                                messagekey: "text2"
                            }
                        }
                    }
                }
            },
            resources: {
                template: {
                    resourceText: "<div class=\"alwaysPanel1\"></div><div class=\"conditionalPanel1\"></div><div class=\"alwaysPanel2\"></div><div class=\"conditionalPanel2\"></div>"
                },
                alwaysPanel1: {
                    resourceText: "<input type=\"checkbox\" class=\"input\" />"
                },
                alwaysPanel2: {
                    resourceText: "<input type=\"checkbox\" class=\"input\" />"
                },
                conditionalPanel1: {
                    resourceText: "<span class=\"text\"></span>"
                },
                conditionalPanel2: {
                    resourceText: "<span class=\"text\"></span>"
                }
            }
        });

        // component creation
        jqUnit.expect(18);
        assertInitialized(that, "alwaysPanel1");
        jqUnit.assertEquals("The createOnEvent for alwaysPanel1 should be set", "initSubPanels", fluid.get(that, "options.components.alwaysPanel1.createOnEvent"));
        assertInitialized(that, "alwaysPanel2");
        jqUnit.assertEquals("The createOnEvent for alwaysPanel2 should be set", "initSubPanels", fluid.get(that, "options.components.alwaysPanel2.createOnEvent"));
        assertNotInitialized(that, "conditionalPanel1");
        assertSubPanelLifecycleBindings(that, "conditionalPanel1", "some.pref.1");
        assertNotInitialized(that, "conditionalPanel2");
        assertSubPanelLifecycleBindings(that, "conditionalPanel2", "some.pref.2");
        // TODO: rewrite these highly stateful tests using the IoC testing framework

        // first rendering
        jqUnit.expect(10);
        that.events.afterRender.addListener(function () {
            assertInitialized(that, "alwaysPanel1");
            assertChecked(that, "alwaysPanel1", false);
            assertInitialized(that, "alwaysPanel2");
            assertChecked(that, "alwaysPanel2", false);
            assertNotInitialized(that, "conditionalPanel1");
            assertNotInitialized(that, "conditionalPanel2");
            that.events.afterRender.removeListener("initial");
        }, "initial", "last");
        that.refreshView();

        // set some.pref.1 to true
        jqUnit.expect(11);
        that.events.afterRender.addListener(function () {
            assertInitialized(that, "alwaysPanel1");
            assertChecked(that, "alwaysPanel1", true);
            assertInitialized(that, "alwaysPanel2");
            assertChecked(that, "alwaysPanel2", false);
            assertInitialized(that, "conditionalPanel1");
            assertText(that, "conditionalPanel1", "conditionalPanel1");
            assertNotInitialized(that, "conditionalPanel2");
            that.events.afterRender.removeListener("pref1_true");
        }, "pref1_true", "last");
        that.applier.change("some_pref_1", true);

        // set some.pref.1 to false
        jqUnit.expect(10);
        that.events.afterRender.addListener(function () {
            assertInitialized(that, "alwaysPanel1");
            assertChecked(that, "alwaysPanel1", false);
            assertInitialized(that, "alwaysPanel2");
            assertChecked(that, "alwaysPanel2", false);
            assertNotInitialized(that, "conditionalPanel1");
            assertNotInitialized(that, "conditionalPanel2");
            that.events.afterRender.removeListener("pref1_false");
        }, "pref1_false", "last");
        that.applier.change("some_pref_1", false);

        // set some.pref.2 to true
        jqUnit.expect(11);
        that.events.afterRender.addListener(function () {
            assertInitialized(that, "alwaysPanel1");
            assertChecked(that, "alwaysPanel1", false);
            assertInitialized(that, "alwaysPanel2");
            assertChecked(that, "alwaysPanel2", true);
            assertNotInitialized(that, "conditionalPanel1");
            assertInitialized(that, "conditionalPanel2");
            assertText(that, "conditionalPanel2", "conditionalPanel2");
            that.events.afterRender.removeListener("pref2_true");
        }, "pref2_true", "last");
        that.applier.change("some_pref_2", true);

        // set some.pref.2 to false
        jqUnit.expect(10);
        that.events.afterRender.addListener(function () {
            assertInitialized(that, "alwaysPanel1");
            assertChecked(that, "alwaysPanel1", false);
            assertInitialized(that, "alwaysPanel2");
            assertChecked(that, "alwaysPanel2", false);
            assertNotInitialized(that, "conditionalPanel1");
            assertNotInitialized(that, "conditionalPanel2");
            that.events.afterRender.removeListener("pref2_false");
        }, "pref2_false", "last");
        that.applier.change("some_pref_2", false);

    });

    /* FLUID-5201: renderer fluid decorator */

    fluid.defaults("fluid.tests.panel.sliderTest1", {
        gradeNames: ["fluid.prefs.panel"],
        selectors: {
            textSize: ".flc-prefsEditor-min-val",
            label: ".flc-prefsEditor-min-val-label",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
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
                    container: "{that}.dom.sliderTest1"
                }
            },
            resources: {
                template: {
                    resourceText: "<ul><li class=\"flc-tests-panel-sliderTest1\"></li></ul>"
                },
                sliderTest1: {
                    resourceText: "<div class=\"flc-prefsEditor-min-val\"><div class=\"flc-textfieldSlider-slider\"></div><input id=\"min-val\" class=\"flc-textfieldSlider-field\" type=\"text\" /><span class=\"flc-prefsEditor-multiplier\"></span></div>"
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
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "learning.dropdownTest1": {
                "model.ddVal": "value",
                "controlValues.ddStrings": "enum"
            }
        },
        messageBase: {
            "dropdownTest-en": "English",
            "dropdownTest-kl": "Klingon",
            "dropdownTest-bj": "Bajoran",
            "dropdownTest-rm": "Romulan",
            "dropdownTest-cd": "Cardassian"
        },
        selectors: {
            textFont: ".flc-prefsEditor-text-font"
        },
        stringArrayIndex: {
            dd: ["dropdownTest-en", "dropdownTest-kl", "dropdownTest-bj", "dropdownTest-rm", "dropdownTest-cd"]
        },
        controlValues: {
            ddStrings: ["en", "kl", "bj", "rm", "cd"]
        },
        protoTree: {
            textFont: {
                optionnames: "${{that}.msgLookup.dd}",
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
                    container: "{that}.dom.dropdownTest1"
                }
            },
            resources: {
                template: {
                    resourceText: "<ul><li class=\"flc-tests-panel-dropdownTest1\"></li></ul>"
                },
                dropdownTest1: {
                    resourceText: "<select class=\"flc-prefsEditor-text-font\" id=\"text-font\"></select>"
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
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "learning.radioTest1": {
                "model.radioVal": "value",
                "controlValues.radioStrings": "enum"
            }
        },
        selectors: {
            frequencyRow: ".flc-prefsEditor-frequencyRow",
            frequencyLabel: ".flc-prefsEditor-frequency-label",
            frequencyInput: ".flc-prefsEditor-frequencyInput",
            label: ".flc-prefsEditor-contrast-label"
        },
        messageBase: {
            "radioTestKey-yes": "Yes",
            "radioTestKey-no": "No",
            "radioTestKey-maybe": "Maybe",
            "radioTestKey-sometimes": "Sometimes",
            "radioTestLabelKey": "Radio Button Label"
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
                    optionnames: "${{that}.msgLookup.radioTestStrings}",
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
                    container: "{that}.dom.radioTest1"
                }
            },
            resources: {
                template: {
                    resourceText: "<ul><li class=\"flc-tests-panel-radioTest1\"></li></ul>"
                },
                radioTest1: {
                    resourceText: "<div class=\"flc-prefsEditor-frequencyRow\"><input type=\"radio\" class=\"flc-prefsEditor-frequencyInput\" name=\"frequency\" id=\"frequency\"/><label for=\"frequency\" class=\"flc-prefsEditor-frequency-label\"></label></div>"
                }
            }
        });

        var expectedTree = {
            "children": [{
                "ID": "radioTest1_label",
                "componentType": "UIBound",
                "value": "Radio Button Label"
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
        gradeNames: ["fluid.prefs.panel"],
        selectors: {
            textSize: ".flc-prefsEditor-min-val",
            label: ".flc-prefsEditor-min-val-label",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        selectorsToIgnore: ["textSize"],
        components: {
            textSize: {
                type: "fluid.textfieldSlider",
                container: "{fluid.tests.panel.slider1}.dom.textSize",
                createOnEvent: "afterRender",
                options: {
                    model: {
                        value: "{fluid.tests.panel.slider1}.model.slider1"
                    },
                    range: "{fluid.tests.panel.slider1}.options.range"
                }
            }
        },
        range: {
            min: 1,
            max: 10
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            multiplier: {messagekey: "multiplier"}
        }
    });

    fluid.defaults("fluid.tests.panel.slider2", {
        gradeNames: ["fluid.prefs.panel"],
        selectors: {
            textSize: ".flc-prefsEditor-min-val",
            label: ".flc-prefsEditor-min-val-label",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        selectorsToIgnore: ["textSize"],
        components: {
            textSize: {
                type: "fluid.textfieldSlider",
                container: "{fluid.tests.panel.slider2}.dom.textSize",
                createOnEvent: "afterRender",
                options: {
                    model: {
                        value: "{fluid.tests.panel.slider2}.model.slider2"
                    },
                    range: "{fluid.tests.panel.slider2}.options.range"
                }
            }
        },
        range: {
            min: 0,
            max: 20
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            multiplier: {messagekey: "multiplier"}
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
                    resourceText: "<ul><li class=\"flc-tests-panel-slider1\"></li><li class=\"flc-tests-panel-slider2\"></li></ul>"
                },
                slider1: {
                    resourceText: "<div class=\"flc-prefsEditor-min-val\"><input class=\"flc-textfieldSlider-slider\" /><input id=\"min-val\" class=\"flc-textfieldSlider-field\" type=\"text\" /><span class=\"flc-prefsEditor-multiplier\"></span></div>"
                },
                slider2: {
                    resourceText: "<div class=\"flc-prefsEditor-min-val\"><input class=\"flc-textfieldSlider-slider\" /><input id=\"min-val\" class=\"flc-textfieldSlider-field\" type=\"text\" /><span class=\"flc-prefsEditor-multiplier\"></span></div>"
                }
            }
        });

        // the first call to refreshView does the initial rendeirng which includes
        // putting the component defined by the renderer decorator into the components block
        that.refreshView();

        // the second call to refresh view uses the new components block and should ignore
        // the renderer decorator component which isn't a panel
        that.refreshView();

        jqUnit.assert("The initial state with the min value for slider1 has been set properly", 0, $(".flc-tests-panel-slider1 .flc-textfieldSlider-slider").val());
        jqUnit.assert("The initial state with the min value for slider2 has been set properly", 1, $(".flc-tests-panel-slider2 .flc-textfieldSlider-slider").val());

        that.slider1.applier.change("value", 100);
        that.slider2.applier.change("value", 100);
        that.refreshView();
        jqUnit.assert("The max value for slider1 has been set properly", 10, $(".flc-tests-panel-slider1 .flc-textfieldSlider-slider").val());
        jqUnit.assert("The max value for slider2 has been set properly", 100, $(".flc-tests-panel-slider2 .flc-textfieldSlider-slider").val());
    });

    /* end FLUID-5203 */

    /* start FLUID-5210 */

    fluid.defaults("fluid.tests.fluid_5210.compositePanel", {
        gradeNames: ["fluid.prefs.compositePanel"],
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

    /* start FLUID-5220 */

    fluid.defaults("fluid.tests.fluid_5220.subPanel", {
        gradeNames: ["fluid.prefs.panel"]
    });

    /**

    // This test is very faulty and has been commented out. There are several problems, including
    // i) registering an onCreate listener after a component has been created
    // ii) making a faulty call to assertDeepEq with simply a value of "false" which counted as a pass as a result of FLUID-5901
    // iii) Issuing inline configuration to a creator function rather than defining a grade
    // iv) General problems with workflow - the test fixtures seem to appeal to a sequence of events following the addition of listeners
    // which don't in fact occur at these points (onCreate, afterRender, etc.)

    jqUnit.test("FLUID-5220: onDomBind", function () {
        // TODO: Rewrite this highly stateful test using the IoC Testing Framework
        var that = fluid.prefs.compositePanel(".fluid-5220", {
            selectors: {
                subPanel: ".flc-tests-subPanel"
            },
            selectorsToIgnore: ["subPanel"],
            components: {
                subPanel: {
                    type: "fluid.tests.fluid_5220.subPanel",
                    createOnEvent: "initSubPanels",
                    container: "{that}.dom.subPanel"
                }
            },
            resources: {
                template: {
                    resourceText: "<div><div class=\"flc-tests-subPanel\"></div></div>"
                },
                subPanel: {
                    resourceText: "<div></div>"
                }
            }
        });

        jqUnit.expect(1);
        that.events.onCreate.addListener(function () {
            jqUnit.assertTrue("Composite panel onDomBind event is triggered at onCreate", true);
            that.events.onCreate.removeListener("onCompositePanelCreateDomBind");
        }, "onCompositePanelCreateDomBind", "last");

        that.subPanel.events.onDomBind.addListener(function () {
            jqUnit.assertDeepEq("Wrong! - Composite panel onCreate should not trigger onDomBind in the subpanel", false);
            that.subPanel.events.onDomBind.removeListener("onSubPanelCreateDomBind");
        }, "onSubPanelCreateDomBind", "last");

        jqUnit.expect(2);
        that.events.afterRender.addListener(function () {
            jqUnit.assertTrue("Composite panel afterRender event is fired", true);
            that.events.afterRender.removeListener("onCompositePanelAfterRender");
        }, "onCompositePanelAfterRender", "last");

        that.subPanel.events.onDomBind.addListener(function () {
            jqUnit.assertTrue("The subpanel onDomBind event is triggered when afterRender event of its composite panel gets fired", true);
            that.subPanel.events.onDomBind.removeListener("onSubPanelAfterRenderDomBind");
        }, "onSubPanelAfterRenderDomBind", "last");

        that.refreshView();
    });
    */

    /* end FLUID-5220 */

    /*******************************************************************************
     * textFontPanel
     *******************************************************************************/

    fluid.tests.prefsPaneltemplatePrefix = "../../../../src/framework/preferences/html/";

    fluid.defaults("fluid.tests.prefs.panel.textFont", {
        gradeNames: ["fluid.prefs.panel.textFont", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        messageBase: {
            "textFont-default": "default",
            "textFont-times": "Times New Roman",
            "textFont-comic": "Comic Sans",
            "textFont-arial": "Arial",
            "textFont-verdana": "Verdana",
            "textFontLabel": "text style",
            "textFontDescr": "Change the font used"
        },
        model: {
            value: 1
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-textFont.html"
            }
        },
        classnameMap: {
            "textFont": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana"
            }
        }
    });

    fluid.defaults("fluid.tests.textFontPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            textFont: {
                type: "fluid.tests.prefs.panel.textFont",
                container: ".flc-textFont",
                createOnEvent: "{textFontTester}.events.onTestCaseStart"
            },
            textFontTester: {
                type: "fluid.tests.textFontTester"
            }
        }
    });

    fluid.tests.textFontPanel.testDefault = function (that, expectedNumOfOptions, expectedFont) {
        var options = that.container.find("option");
        var messageBase = that.options.messageBase;
        jqUnit.assertEquals("There are " + expectedNumOfOptions + " text fonts in the control", expectedNumOfOptions, options.length);
        jqUnit.assertEquals("The first text font is " + expectedFont, expectedFont, options.filter(":selected").val());
        jqUnit.assertEquals("The label text is " + messageBase.textFontLabel, messageBase.textFontLabel, that.locate("label").text());
        jqUnit.assertEquals("The description text is " + messageBase.textFontDescr, messageBase.textFontDescr, that.locate("textFontDescr").text());

        fluid.each(options, function (option) {
            var css = that.options.classnameMap.textFont[option.value];
            if (css) {
                jqUnit.assertTrue("The option has appropriate css applied", $(option).hasClass(css));
            }
        });
    };

    fluid.defaults("fluid.tests.textFontTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedNumOfOptions: 5,
            defaultValue: "default",
            newValue: "comic"
        },
        modules: [{
            name: "Test the text font settings panel",
            tests: [{
                expect: 9,
                name: "Test the rendering of the text font panel",
                sequence: [{
                    listener: "fluid.tests.textFontPanel.testDefault",
                    args: ["{textFont}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textFontPanel textFont}.events.afterRender"
                }, {
                    func: "fluid.changeElementValue",
                    args: ["{textFont}.dom.textFont", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{textFont}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textFont}.applier.modelChanged"
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.prefs.panel.textFont.override", {
        gradeNames: ["fluid.tests.prefs.panel.textFont"],
        stringArrayIndex: {
            textFont: ["textFont-default", "textFont-verdana"]
        },
        controlValues: {
            textFont: ["default", "verdana"]
        }
    });

    fluid.defaults("fluid.tests.textFontPanelOverride", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            textFont: {
                type: "fluid.tests.prefs.panel.textFont.override",
                container: ".flc-textFont",
                createOnEvent: "{textFontTester}.events.onTestCaseStart"
            },
            textFontTester: {
                type: "fluid.tests.textFontOverrideTester"
            }
        }
    });

    fluid.defaults("fluid.tests.textFontOverrideTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedNumOfOptions: 2,
            defaultValue: "default",
            newValue: "verdana"
        },
        modules: [{
            name: "Test the text font settings panel with controlValues replaced",
            tests: [{
                expect: 6,
                name: "Test the rendering of the text font panel",
                sequence: [{
                    listener: "fluid.tests.textFontPanel.testDefault",
                    args: ["{textFont}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    event: "{textFontPanelOverride textFont}.events.afterRender"
                }, {
                    func: "fluid.changeElementValue",
                    args: ["{textFont}.dom.textFont", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{textFont}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textFont}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * Contrast
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.panel.contrast", {
        gradeNames: ["fluid.prefs.panel.contrast", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        messageBase: {
            "contrast": ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black", "Low contrast"],
            "contrast-default": "Default",
            "contrast-bw": "Black on white",
            "contrast-wb": "White on black",
            "contrast-by": "Black on yellow",
            "contrast-yb": "Yellow on black",
            "contrast-lgdg": "Low contrast",
            "label": "colour and contrast",
            "description": "Change the text and background colours"
        },
        model: {
            value: "default"
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-contrast.html"
            }
        },
        classnameMap: {
            "theme": {
                "default": "fl-prefsEditor-default-theme",
                "bw": "fl-theme-bw",
                "wb": "fl-theme-wb",
                "by": "fl-theme-by",
                "yb": "fl-theme-yb",
                "lgdg": "fl-theme-lgdg",
                "gw": "fl-theme-gw",
                "bbr": "fl-theme-bbr"
            }
        }
    });

    fluid.defaults("fluid.tests.contrastPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            contrast: {
                type: "fluid.tests.prefs.panel.contrast",
                container: ".flc-contrast",
                createOnEvent: "{contrastTester}.events.onTestCaseStart"
            },
            contrastTester: {
                type: "fluid.tests.contrastTester"
            }
        }
    });

    fluid.tests.contrastPanel.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
        var inputs = that.locate("themeInput");
        var labels = that.locate("themeLabel");
        var messageBase = that.options.messageBase;

        jqUnit.assertEquals("The label text is " + messageBase.label, messageBase.label, that.locate("label").text());
        jqUnit.assertEquals("The description text is " + messageBase.description, messageBase.description, that.locate("description").text());

        jqUnit.assertEquals("There are " + expectedNumOfOptions + " contrast selections in the control", expectedNumOfOptions, inputs.length);
        jqUnit.assertEquals("The first contrast is " + expectedContrast, expectedContrast, inputs.filter(":checked").val());

        var inputValue, label;
        fluid.each(inputs, function (input, index) {
            inputValue = input.value;
            label = labels.eq(index);
            jqUnit.assertTrue("The contrast label has appropriate css applied", label.hasClass(that.options.classnameMap.theme[inputValue]));
            jqUnit.assertEquals("The aria-label is " + that.options.messageBase.contrast[index], that.options.messageBase.contrast[index], label.attr("aria-label"));
            jqUnit.assertEquals("The input has the correct name attribute", that.id, $(input).attr("name"));
        });

        jqUnit.assertTrue("The default contrast label has the default label css applied", labels.eq(0).hasClass(that.options.styles.defaultThemeLabel));
    };

    fluid.tests.contrastPanel.changeChecked = function (inputs, newValue) {
        inputs.prop("checked", false);
        var matchingInput = inputs.filter("[value='" + newValue + "']");
        matchingInput.prop("checked", "checked").change();
    };

    fluid.defaults("fluid.tests.contrastTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedNumOfOptions: 8,
            defaultValue: "default",
            newValue: "bw"
        },
        modules: [{
            name: "Test the contrast settings panel",
            tests: [{
                expect: 30,
                name: "Test the rendering of the contrast panel",
                sequence: [{
                    listener: "fluid.tests.contrastPanel.testDefault",
                    args: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    spec: {priority: "last"},
                    event: "{contrastPanel contrast}.events.afterRender"
                }, {
                    func: "fluid.tests.contrastPanel.changeChecked",
                    args: ["{contrast}.dom.themeInput", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{contrast}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{contrast}.applier.modelChanged"
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.prefs.panel.contrast.override", {
        gradeNames: ["fluid.tests.prefs.panel.contrast"],
        controlValues:{
            theme: ["default", "bw", "yb"]
        }
    });

    fluid.defaults("fluid.tests.contrastPanelOverride", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            contrast: {
                type: "fluid.tests.prefs.panel.contrast.override",
                container: ".flc-contrast",
                createOnEvent: "{contrastTester}.events.onTestCaseStart"
            },
            contrastTester: {
                type: "fluid.tests.contrastOverrideTester"
            }
        }
    });

    fluid.defaults("fluid.tests.contrastOverrideTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedNumOfOptions: 3,
            defaultValue: "default",
            newValue: "yb"
        },
        modules: [{
            name: "Test the contrast settings panel with controlValues replaced",
            tests: [{
                expect: 15,
                name: "Test the rendering of the contrast panel",
                sequence: [{
                    listener: "fluid.tests.contrastPanel.testDefault",
                    args: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                    spec: {priority: "last"},
                    event: "{contrastPanelOverride contrast}.events.afterRender"
                }, {
                    func: "fluid.tests.contrastPanel.changeChecked",
                    args: ["{contrast}.dom.themeInput", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{contrast}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{contrast}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * textSize
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.panel.textSize", {
        gradeNames: ["fluid.prefs.panel.textSize", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        model: {
            value: 1
        },
        messageBase: {
            "textSizeLabel": "Text Size",
            "multiplier": "times",
            "textSizeDescr": "Adjust text size"
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-textSize.html"
            }
        }
    });

    // Base test grade
    fluid.defaults("fluid.tests.textSizePanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            textSize: {
                type: "fluid.tests.prefs.panel.textSize",
                container: ".flc-textSize",
                createOnEvent: "{textSizeTester}.events.onTestCaseStart"
            },
            textSizeTester: {
                type: "fluid.tests.textSizeTester"
            }
        }
    });

    fluid.defaults("fluid.tests.textSizeTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: 1.2
        },
        modules: [{
            name: "Test the text sizer settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the text size panel",
                sequence: [{
                    event: "{fluid.tests.textSizePanel textSize}.events.afterRender",
                    priority: "last:testing",
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{textSize}.model", 1]
                }, {
                    func: "fluid.tests.panels.changeInput",
                    args: ["{textSize}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{textSize}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{textSize}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * lineSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.panel.lineSpace", {
        gradeNames: ["fluid.prefs.panel.lineSpace", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        model: {
            value: 1
        },
        messageBase: {
            "lineSpaceLabel": "Line Spacing",
            "multiplier": "times",
            "lineSpaceDescr": "Adjust the spacing between lines of text"
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-lineSpace.html"
            }
        }
    });

    // Base test grade
    fluid.defaults("fluid.tests.lineSpacePanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            lineSpace: {
                type: "fluid.tests.prefs.panel.lineSpace",
                container: ".flc-lineSpace",
                createOnEvent: "{lineSpaceTester}.events.onTestCaseStart"
            },
            lineSpaceTester: {
                type: "fluid.tests.lineSpaceTester",
                options: {
                    modules: [{
                        name: "Test the line space settings panel"
                    }]
                }
            }
        }
    });

    fluid.defaults("fluid.tests.lineSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: 1.2
        },
        modules: [{
            name: "Test the line space settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the line space panel",
                sequence: [
                    {
                        event: "{fluid.tests.lineSpacePanel lineSpace}.events.afterRender",
                        priority: "last:testing",
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{lineSpace}.model", 1]
                    }, {
                        func: "fluid.tests.panels.changeInput",
                        args: ["{lineSpace}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{lineSpace}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "value", priority: "last"},
                        changeEvent: "{lineSpace}.applier.modelChanged"
                    }
                ]
            }]
        }]
    });

    /*******************************************************************************
     * layoutPanel
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.panel.layoutControls", {
        gradeNames: ["fluid.prefs.panel.layoutControls", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        model: {
            toc: false,
            layout: false
        },
        messageBase: {
            "label": "Table of Contents",
            "description": "Create a table of contents",
            "switchOn": "ToC On",
            "switchOff": "ToC Off"
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-layout.html"
            }
        }
    });

    fluid.defaults("fluid.tests.layoutPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            layout: {
                type: "fluid.tests.prefs.panel.layoutControls",
                container: ".flc-layout",
                createOnEvent: "{layoutTester}.events.onTestCaseStart"
            },
            layoutTester: {
                type: "fluid.tests.layoutTester"
            }
        }
    });

    fluid.defaults("fluid.tests.layoutTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            defaultInputStatus: false,
            newValue: true
        },
        modules: [{
            name: "Test the layout settings panel",
            tests: [{
                expect: 7,
                name: "Test the rendering of the layout panel",
                sequence: [{
                    listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                    event: "{layoutPanel layout}.events.afterRender",
                    priority: "last:testing",
                    args: ["{layout}", "{that}.options.testOptions.defaultInputStatus"]
                }, {
                    jQueryTrigger: "click",
                    element: "{layout}.switchUI.dom.control"
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{layout}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * enhanceInputs
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.panel.enhanceInputs", {
        gradeNames: ["fluid.prefs.panel.enhanceInputs", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        model: {
            enhanceInputs: false
        },
        messageBase: {
            "label": "Enhance Inputs",
            "description": "Emphasize links, buttons, menus, textfields, and other inputs",
            "switchOn": "Enhance ON",
            "switchOff": "Enhance OFF"
        },
        resources: {
            template: {
                href: fluid.tests.prefsPaneltemplatePrefix + "PrefsEditorTemplate-enhanceInputs.html"
            }
        }
    });

    fluid.defaults("fluid.tests.enhanceInputsPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            enhanceInputs: {
                type: "fluid.tests.prefs.panel.enhanceInputs",
                container: ".flc-enhanceInputs",
                createOnEvent: "{enhanceInputsTester}.events.onTestCaseStart"
            },
            enhanceInputsTester: {
                type: "fluid.tests.enhanceInputsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.enhanceInputsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            defaultInputStatus: false,
            newValue: true
        },
        modules: [{
            name: "Test the enhance inputs panel",
            tests: [{
                expect: 7,
                name: "Test the rendering of the enhance inputs panel",
                sequence: [{
                    listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                    event: "{enhanceInputsPanel enhanceInputs}.events.afterRender",
                    priority: "last:testing",
                    args: ["{enhanceInputs}", "{that}.options.testOptions.defaultInputStatus"]
                }, {
                    jQueryTrigger: "click",
                    element: "{enhanceInputs}.switchUI.dom.control"
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{enhanceInputs}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.textFontPanel",
            "fluid.tests.textFontPanelOverride",
            "fluid.tests.contrastPanel",
            "fluid.tests.contrastPanelOverride",
            "fluid.tests.textSizePanel",
            "fluid.tests.lineSpacePanel",
            "fluid.tests.layoutPanel",
            "fluid.tests.enhanceInputsPanel"
        ]);
    });

})(jQuery);
