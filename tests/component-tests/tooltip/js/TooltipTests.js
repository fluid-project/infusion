/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

 */

// Declare dependencies
/* global fluid, jqUnit */

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.tests.tooltip");

    fluid.tests.tooltip.trackTooltip = function (disp, that, target, tooltip) {
        var targetId = target.id;
        if (disp === "open") {
            that.tooltipMap[targetId] = tooltip;
        } else {
            delete that.tooltipMap[targetId];
        }
    };

    // Converts a string to the expected DOM contents for a tooltip whose content is just that string
    fluid.tests.tooltip.stringToNode = function (string) {
        return [ {
            nodeText: string
        }];
    };

    fluid.tests.tooltip.assertVisible = function (message, trackTooltips, expectedKeys, contentMap, contentToNode) {
        var visibleKeys = fluid.keys(trackTooltips.tooltipMap);
        jqUnit.assertDeepEq(message, fluid.makeArray(expectedKeys), visibleKeys);
        fluid.each(trackTooltips.tooltipMap, function (tooltip, key) {
            if (contentMap) {
                jqUnit.assertNode("The contents of the tooltip should be set", contentToNode(contentMap[key]), $(".ui-tooltip-content", tooltip));
            } else {
                contentToNode(tooltip, key);
            }

        });
    };

    fluid.defaults("fluid.tests.tooltip.trackTooltips", {
        mergePolicy: {
            tooltipListeners: "noexpand"
        },
        distributeOptions: {
            source: "{that}.options.tooltipListeners",
            removeSource: true,
            target: "{that fluid.tooltip}.options.listeners"
        },
        tooltipListeners: {
            afterOpen: {
                funcName: "fluid.tests.tooltip.trackTooltip",
                args: ["open", "{trackTooltips}", "{arguments}.1", "{arguments}.2"] // event.target, tooltip
            },
            afterClose: {
                funcName: "fluid.tests.tooltip.trackTooltip",
                args: ["close", "{trackTooltips}", "{arguments}.1", "{arguments}.2"] // event.target, tooltip
            }
        },
        members: {
            tooltipMap: {}
        }
    });

    fluid.tests.bindFocusNotify = function (that) {
        that.container.focusin(that.events.notifyFocusChange.fire);
        that.container.focusout(that.events.notifyFocusChange.fire);
    };

    fluid.defaults("fluid.tests.focusNotifier", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        events: {
            notifyFocusChange: null
        },
        listeners: {
            onCreate: "fluid.tests.bindFocusNotify"
        }
    });

    fluid.tests.delegateTest = {
        idToContent: {
            "anchor-1": "Tooltip Content 1",
            "anchor-2": "Tooltip Content 2"
        }
    };

    fluid.tests.delegateTest.assertVisible = function (trackTooltips, visibleAnchors) {
        fluid.tests.tooltip.assertVisible("Correct tooltips visible", trackTooltips, visibleAnchors,
                fluid.tests.delegateTest.idToContent, fluid.tests.tooltip.stringToNode);
    };

    fluid.tests.delegateTest.assertVisibleMaker = function (trackTooltips, visibleAnchors) {
        return function () {
            fluid.tests.delegateTest.assertVisible(trackTooltips, visibleAnchors);
        };
    };

    fluid.tests.tooltip.markupBlaster = function (tooltip) {
        tooltip.close();
        var markup = tooltip.container.html();
        tooltip.container.html(markup);
    };

    fluid.tests.tooltip.module = {
        name: "Delegating tooltip tests",
        tests: {
            name: "Tooltip visibility",
            sequence: [{
                element: "#anchor-1",
                jQueryTrigger: "focus"
            }, {
                event: "{trackTooltips}.events.notifyFocusChange",
                listenerMaker: "fluid.tests.delegateTest.assertVisibleMaker",
                makerArgs: ["{trackTooltips}", "anchor-1"]
            }, {
                funcName: "fluid.tests.tooltip.markupBlaster",
                args: "{tree}.tooltip"
            }, {
                funcName: "fluid.tests.delegateTest.assertVisible",
                args: ["{trackTooltips}", []]
            }]
        }
    };

    fluid.defaults("fluid.tests.tooltip.tree", {
        gradeNames: ["fluid.tests.tooltip.trackTooltips", "fluid.tests.focusNotifier", "autoInit"],
        components: {
            tooltip: {
                type: "fluid.tooltip",
                container: ".delegating-root",
                options: {
                    gradeNames: [],
                    items: ".testDelegateTooltip",
                    model: {
                        idToContent: fluid.tests.delegateTest.idToContent
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.tooltip.delegateEnv", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: "#ioc-fixture",
        components: {
            tree: {
                type: "fluid.tests.tooltip.tree",
                container: ".delegating-root"
            },
            fixtures: {
                type: "fluid.test.testCaseHolder",
                options: {
                    modules: fluid.tests.tooltip.module
                }
            }
        }
    });

    fluid.tests.tooltip.runTests = function () {

        fluid.test.runTests(["fluid.tests.tooltip.delegateEnv"]);

        jqUnit.module("Standard Tooltip Tests");


        // Note that throughout these tests, an explicit tooltip "destroy" is necessary after each test, since
        // the tooltip markup is created outside the container qunit-fixture which is operated by the standard
        // QUnit setup/teardown cycle

        jqUnit.test("Options Mapping", function () {
            var testOptions = {
                content: function () {
                    return "Tooltip";
                },

                position: {
                    my: "top",
                    at: "bottom",
                    offset: "5 5"
                },

                items: "*"
            };
            var tt = fluid.tooltip(".testTooltip", testOptions);
            tt.open();
            var uiTTOptions = $(".testTooltip").tooltip("option");

            var ttELM = $("[id^=ui-tooltip]");

            jqUnit.assertEquals("The \"content\" option is set correctly", testOptions.content(), ttELM.text());
            jqUnit.assertEquals("The \"items\" option is set correctly", testOptions.items, uiTTOptions.items);
            jqUnit.assertLeftHand("The \"position\" option is set correctly", testOptions.position, uiTTOptions.position);
            tt.destroy();
        });

        jqUnit.test("Styling added", function () {
            var style = "styleClass";
            var tt = fluid.tooltip(".testTooltip", {
                content: "Tooltip",
                styles: {
                    tooltip: style
                }
            });
            tt.open();
            var tooltip = $("[id^=ui-tooltip]");

            jqUnit.assertTrue("The css class is applied to the tooltip element", tooltip.hasClass(style));
            tt.destroy();
        });

        jqUnit.test("Tooltip element tests", function () {
            var tt = fluid.tooltip(".testTooltip");
            var ttELM = $("[id^=ui-tooltip]");
            var newContent = "New Content";

            //jQuery UI no longer exposes the implementing markup programmatically
            //jqUnit.assertTrue("The tooltip element is exposed correctly", 0 === tt.elm.index(ttELM));

            tt.updateContent(newContent);
            jqUnit.assertTrue("The tooltip content should have updated", newContent, ttELM.text());
            tt.destroy();
        });

        jqUnit.asyncTest("Tooltip manual open/close tests", function () {
            var tt = fluid.tooltip(".testTooltip", {
                content: "Tooltip Content",
                delay: 0,
                duration: 0,
                listeners: {
                    afterOpen: function () {
                        jqUnit.assertTrue("The tooltip should be visible", $("[id^=ui-tooltip]").is(":visible"));
                        tt.close();
                    },
                    afterClose: function () {
                        jqUnit.assertFalse("The tooltip should not be visible", $("[id^=ui-tooltip]").is(":visible"));
                        jqUnit.start();
                    }
                }
            });

            tt.open();
            tt.destroy();
        });

        jqUnit.test("Tooltip destroy tests", function () {
            var tt = fluid.tooltip(".testTooltip", {content: "Tooltip"});
            tt.open();
            jqUnit.assertEquals("There should be a tooltip element present", 1, $("[id^=ui-tooltip]").length);
            tt.destroy();
            jqUnit.assertEquals("There should no longer be a tooltip element", 0, $("[id^=ui-tooltip]").length);
        });

        var testThatTooltipContentChanges = function (tt, update, expected1, expected2) {
            jqUnit.expect(3);
            var tipEl = $("[id^=ui-tooltip]");
            jqUnit.assertTrue("The tooltip should be visible", tipEl.is(":visible"));
            jqUnit.assertEquals("Initially, the tooltip should contain first text", expected1, tipEl.text());
            tt.updateContent(update);
            jqUnit.assertEquals("After update, the tooltip should contain second text", expected2, tipEl.text());
            tt.destroy();
        };

        jqUnit.asyncTest("FLUID-4780: Dynamic update of tooltip content: text", function () {
            var testText1 = "test text 1";
            var testText2 = "test text 2";
            var tt = fluid.tooltip(".testTooltip", {
                content: testText1,
                delay: 0,
                listeners: {
                    afterOpen: function () {
                        testThatTooltipContentChanges(tt, testText2, testText1, testText2);
                        jqUnit.start();
                    }
                }
            });

            tt.open();
        });

        jqUnit.asyncTest("FLUID-4780: Dynamic update of tooltip content: function", function () {
            var testText1 = "test text 1";
            var testText2 = "test text 2";
            var contentFn1 = function () {
                return testText1;
            };
            var contentFn2 = function () {
                return testText2;
            };
            var tt = fluid.tooltip(".testTooltip", {
                content: contentFn1,
                delay: 0,
                listeners: {
                    afterOpen: function () {
                        testThatTooltipContentChanges(tt, contentFn2, testText1, testText2);
                        jqUnit.start();
                    }
                }
            });

            tt.open();
        });
    };

})(jQuery, fluid);
