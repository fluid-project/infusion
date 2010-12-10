/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

/*global fluid,jQuery,jqUnit,expect,start*/

(function ($) {
    $(document).ready(function () {
        
        var tooltipTests = new jqUnit.TestCase("Tooltip Tests");
    
        tooltipTests.test("Options Mapping", function () {
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
            
            tt.container.tooltip("destroy");
        });
        
        tooltipTests.test("Stlying added", function () {
            var style = "styleClass";
            var tt = fluid.tooltip(".testTooltip", {
                styles: {
                    tooltip: style
                }
            });
            
            jqUnit.assertTrue("The css class is applied to the tooltip element", $("[id^=ui-tooltip]").hasClass(style));
            tt.container.tooltip("destroy");
        });
        
        tooltipTests.test("Tooltip element tests", function () {
            var tt = fluid.tooltip(".testTooltip");
            var ttELM = $("[id^=ui-tooltip]");
            var newContent = "New Content";
            
            jqUnit.assertTrue("The tooltip element is exposed correctly", 0 === tt.elm.index(ttELM));
            
            tt.updateContent(newContent);
            jqUnit.assertTrue("The tooltip content should have updated", newContent, ttELM.text());
            
            tt.container.tooltip("destroy");
        });
        
        tooltipTests.asyncTest("Tooltip manual open/close tests", function () {
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
                        tt.container.tooltip("destroy");
                        start();
                    }
                }
            });
            
            tt.open();
        });
        
        tooltipTests.test("Tooltip destroy tests", function () {
            var tt = fluid.tooltip(".testTooltip");
            
            jqUnit.assertEquals("There should be a tooltip element present", 1, $("[id^=ui-tooltip]").length);
            tt.destroy();
            jqUnit.assertEquals("There should no longer be a tooltip element", 0, $("[id^=ui-tooltip]").length);
            tt.container.tooltip("destroy");
        });
    });
})(jQuery);
