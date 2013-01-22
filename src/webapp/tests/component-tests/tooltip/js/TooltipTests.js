/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        
        // Note that throughout these tests, an explicit tooltip "destroy" is necessary after each test, since
        // the tooltip markup is created outside the container qunit-fixture which is operated by the standard
        // QUnit setup/teardown cycle
        
        jqUnit.module("Tooltip Tests", {teardown: function () {
            var ttel = $(".testTooltip");
            ttel.tooltip("destroy");
        }});
    
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
            var uiTTOptions = $(".testTooltip").tooltip("option");
            
            jqUnit.assertEquals("The 'content' option is set correctly", testOptions.content, uiTTOptions.content);
            jqUnit.assertEquals("The 'items' option is set correctly", testOptions.items, uiTTOptions.items);
            jqUnit.assertDeepEq("The 'position' option is set correctly", testOptions.position, uiTTOptions.position);
        });
        
        jqUnit.test("Stlying added", function () {
            var style = "styleClass";
            var tt = fluid.tooltip(".testTooltip", {
                styles: {
                    tooltip: style
                }
            });
            
            jqUnit.assertTrue("The css class is applied to the tooltip element", $("[id^=ui-tooltip]").hasClass(style));
        });
        
        jqUnit.test("Tooltip element tests", function () {
            var tt = fluid.tooltip(".testTooltip");
            var ttELM = $("[id^=ui-tooltip]");
            var newContent = "New Content";
            
            jqUnit.assertTrue("The tooltip element is exposed correctly", 0 === tt.elm.index(ttELM));
            
            tt.updateContent(newContent);
            jqUnit.assertTrue("The tooltip content should have updated", newContent, ttELM.text());
        });
        
        jqUnit.asyncTest("Tooltip manual open/close tests", function () {
            var tt = fluid.tooltip(".testTooltip", {
                content: "Tooltip Content",
                delay: 0,
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
        });
        
        jqUnit.test("Tooltip destroy tests", function () {
            var tt = fluid.tooltip(".testTooltip");
            
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

    });
})(jQuery);
