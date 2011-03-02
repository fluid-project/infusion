/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global document, jQuery, fluid, demo, jqUnit*/

(function ($) {
    $(document).ready(function () {
        var layoutReordererTests = new jqUnit.TestCase("LayoutReorderer Tests");
        
        var k = fluid.testUtils.reorderer.bindReorderer(fluid.testUtils.moduleLayout.portletIds);
        
        layoutReordererTests.test("Default selectors", function () {
            var testReorderer = fluid.reorderLayout("#default-selector-test");
            var item1 = $("#portlet-1");
            var item2 = $("#portlet-2").focus();
            
            // Sniff test the reorderer that was created - keyboard selection
            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item1 should be default", item1.hasClass("fl-reorderer-movable-default"));
        });
        
        layoutReordererTests.test("Events within module", function () {
            var reorderer = fluid.reorderLayout("#" + fluid.testUtils.moduleLayout.portalRootId, {
                selectors: {
                    columns: fluid.testUtils.moduleLayout.columnSelector,
                    modules: fluid.testUtils.moduleLayout.portletSelector
                }
            });
            
            fluid.jById(fluid.testUtils.moduleLayout.portletIds[2]).focus();
            var text2 = fluid.jById("text-2").focus();
            text2.simulate("keypress", {keyCode: fluid.reorderer.keys.m});
            
            jqUnit.assertEquals("After typing M into text field, portlet 2 should still be the active item", 
                fluid.testUtils.moduleLayout.portletIds[2], reorderer.activeItem.id);
// This test for FLUID-1690 cannot be made to work in the jqUnit environment yet          
//            var blurred = false;
//            text2.blur(function() {blurred = true;});
            
//            $("#portlet2 .title").simulate("mousedown");
//            $("#portlet2 .title").simulate("mouseup");
//            jqUnit.assertTrue("After mouseDown on title, text field should be blurred", blurred);
            
        });
        
        layoutReordererTests.test("Drop warning visibility for up and down", function () {
            var reorderer = fluid.testUtils.moduleLayout.initReorderer();
    
            jqUnit.notVisible("On first load the warning should not be visible", "#drop-warning");
            
            // focus on portlet 3 - it is underneath a locked portlet
            var portlet3 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[3]);
            portlet3.focus();
            
            var label = fluid.getAriaLabeller(portlet3);
            jqUnit.assertValue("Aria labeller is present", label);
            
            var labelElement = portlet3.attr("aria-label");
            jqUnit.assertTrue("Text labels position of portlet", 
                labelElement.indexOf("3 of 4 in column 1 of 4") > -1);
            
            // try to move portlet 3 up
            // Press the ctrl key
            k.keyDown(reorderer, fluid.testUtils.ctrlKeyEvent("CTRL"), 3);
            jqUnit.notVisible("After ctrl down, the warning should not be visible", "#drop-warning");
            
            // Press the up arrow key while holding down ctrl
            k.keyDown(reorderer, fluid.testUtils.ctrlKeyEvent("UP"), 3);
            jqUnit.isVisible("After ctrl + up arrow, drop warning should be visible", "#drop-warning"); 
    
            // release the ctrl key
            k.keyUp(reorderer, fluid.testUtils.keyEvent("CTRL"), 3);
            jqUnit.notVisible("After ctrl is released, drop warning should not be visible", "#drop-warning"); 
    
            // Press the up arrow key while holding down ctrl again
            k.keyDown(reorderer, fluid.testUtils.ctrlKeyEvent("CTRL"), 3);
            k.keyDown(reorderer, fluid.testUtils.ctrlKeyEvent("UP"), 3);
            jqUnit.isVisible("After ctrl + up arrow, drop warning should be visible", "#drop-warning"); 
    
            // Press the down arrow key while holding down ctrl
            k.keyDown(reorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 3);
            jqUnit.notVisible("After ctrl + down arrow, drop warning should NOT be visible", "#drop-warning");
            
            jqUnit.assertTrue("Label is updated to account for temporary moved state", 
                portlet3.attr("aria-label").indexOf("moved from") > -1);
    
            portlet3[0].blur();
            // focus on portlet 8 
            var portlet8 = fluid.byId(fluid.testUtils.moduleLayout.portletIds[8]);
            $(portlet8).focus();
    
            jqUnit.assertTrue("Temporary moved state is cleared", 
                portlet3.attr("aria-label").indexOf("moved from") === -1);
    
            // move portlet 8 down
            // Press the ctrl key
            reorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("CTRL", portlet8));
            jqUnit.notVisible("After ctrl down, the warning should not be visible", "#drop-warning");
    
            reorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("DOWN", portlet8));
            jqUnit.notVisible("After moving portlet 8 down, drop warning should not be visible", "#drop-warning"); 
    
            // try to move portlet 8 down from the bottom position.
            reorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("DOWN", portlet8));
            jqUnit.notVisible("After trying to move portlet 8 down, drop warning should not be visible", "#drop-warning"); 
    
            // release the ctrl key
            reorderer.handleKeyUp(fluid.testUtils.keyEvent("CTRL", portlet8));
            jqUnit.notVisible("After ctrl is released, drop warning should not be visible", "#drop-warning"); 
    
        });   
        
        function expectOrder(message, order) {
            var items = fluid.transform($(".portlet"), fluid.getId);
            var expected = fluid.transform(order, function (item) {
                return fluid.testUtils.moduleLayout.portletIds[item];
            });
            jqUnit.assertDeepEq(message, expected, items);
        }
             
        var tests = new jqUnit.TestCase("Reorder Layout Tests");
        
        var assembleOptions = function (isDisableWrap, isLocked) {
            var obj = {
                selectors: {
                    columns: "[id^='c']",
                    modules: ".portlet",
                    lockedModules: isLocked
                },
                disableWrap: isDisableWrap,
                reordererFn: "fluid.reorderLayout",
                expectOrderFn: expectOrder,
                key: fluid.testUtils.reorderer.compositeKey                       
            };
            
            return obj;
        };       
        
        tests.test("reorderLayout API", function () {
            var options = assembleOptions();
            var lastLayoutModel = null;
            
            var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
            
            // Test for FLUID-3121
            var afterMoveListener = function () {
                lastLayoutModel = layoutReorderer.layoutHandler.getModel();
            };
            layoutReorderer.events.afterMove.addListener(afterMoveListener);
            
            var item2 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[2]).focus();
            var item3 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[3]);
            
            // Sniff test the reorderer that was created - keyboard selection and movement    
            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertEquals("No move callback", null, lastLayoutModel);
    
            layoutReorderer.handleKeyDown(fluid.testUtils.keyEvent("DOWN", item2));
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - item3 should be selected", item3.hasClass("fl-reorderer-movable-selected"));
    
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("CTRL", item3));
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("DOWN", item3));
            // Test FLUID-3121 - the afterMoveCallback should successfully execute and obtain the model
            jqUnit.assertNotEquals("Move callback with model", null, lastLayoutModel);
    
            expectOrder("after ctrl-down, expect order 1, 2, 4, 3, 5, 6, 7, 8, 9", 
                [1, 2, 4, 3, 5, 6, 7, 8, 9]);
        });
    
        tests.test("reorderLayout with optional styles", function () {       
            var options = {
                    selectors: {
                        columns: "[id^='c']",
                        modules: ".portlet" 
                    },
                    styles: {
                        defaultStyle: "myDefault",
                        selected: "mySelected"
                    }
                };
                
            var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
            
            jqUnit.assertEquals("default class is myDefault", "myDefault", layoutReorderer.options.styles.defaultStyle);
            jqUnit.assertEquals("selected class is mySelected", "mySelected", layoutReorderer.options.styles.selected);
            jqUnit.assertEquals("dragging class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", layoutReorderer.options.styles.dragging);
            jqUnit.assertEquals("mouseDrag class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", layoutReorderer.options.styles.mouseDrag);
            
        });
        
        tests.test("reorderLayout with locked portlets", function () {
            var options = assembleOptions(false, ".locked");
            var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
            var item2 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[2]).focus();
            var item3 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[3]);
            var key = fluid.testUtils.reorderer.compositeKey;

            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            key(layoutReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), item3);

            expectOrder("after ctrl-down, expect order 1, 2, 3, 4", [1, 2, 3, 4, 5, 6, 7, 8, 9]);

            item3.focus();
            jqUnit.assertTrue("focus on item3", item3.hasClass("fl-reorderer-movable-selected"));
            key(layoutReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), item3);

            expectOrder("after ctrl-down, expect order 1, 2, 4, 3", [1, 2, 4, 3, 5, 6, 7, 8, 9]);

            $("#portlet-reorderer-root tr").append($("<td id=\"c5\"/>"));
            layoutReorderer.refresh();
            
            var model = layoutReorderer.layoutHandler.layout;
            
            jqUnit.assertEquals("Should now have 5 columns", 5, model.columns.length);
            
            key(layoutReorderer, fluid.testUtils.ctrlKeyEvent("LEFT"), item3);
            
            jqUnit.assertTrue("Moved to new column", 
                fluid.dom.isContainer($("#c5")[0], item3[0]));
                   
        });        
       
        tests.test("reorderLayout, option set disabled wrap, user action ctrl+up", function () {              
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "UP",
                expectedOrderArrays: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
                itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[1])
            };
       
            fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);  
                                    
        });        
     
        tests.test("reorderLayout, option set disabled wrap, user action ctrl+down", function () {  
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "DOWN",
                expectedOrderArrays: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
                itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[9])
            };
       
            fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);                      
        });
        
        tests.test("reorderLayout with locked portlets, option set disabled wrap, user action ctrl+up", function () {
            var options = {
                reordererOptions: assembleOptions(true, ".locked"),
                direction: "UP",
                expectedOrderArrays: [[1, 2, 4, 3, 5, 6, 7, 8, 9], [1, 2, 4, 3, 5, 6, 7, 8, 9]],
                itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[4])
            };
       
            fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options); 
            
            jqUnit.assertValue("gives warning message when trying to move item4 up ", $(".flc-reorderer-dropWarning"));                   
        });       
       
        tests.test("reorderLayout with locked portlets, option set disabled wrap, user action ctrl+right", function () {
            var options = {
                reordererOptions: assembleOptions(true, ".locked"),
                direction: "RIGHT",
                expectedOrderArrays: [[1, 2, 4, 5, 6, 3, 7, 8, 9], [1, 2, 4, 5, 6, 7, 8, 3, 9], 
                                      [1, 2, 4, 5, 6, 7, 8, 9, 3], [1, 2, 4, 5, 6, 7, 8, 9, 3]],
                itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[3])
            };
       
            fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options); 
        });        
        
        tests.test("reorderLayout with locked portlets, option set disabled wrap, user action ctrl+left", function () { 
            var options = {
                reordererOptions: assembleOptions(true, ".locked"),
                direction: "LEFT",
                expectedOrderArrays: [[1, 2, 3, 4, 5, 6, 9, 7, 8], [1, 2, 3, 9, 4, 5, 6, 7, 8], 
                                      [1, 2, 3, 9, 4, 5, 6, 7, 8]],
                itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[9])                             
            };
       
            fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);                       
        });
        
        var tabIndexTest = function (container, reordererOptions) {
            var layoutReorderer =  fluid.reorderLayout(container, reordererOptions);
            jqUnit.assertEquals("Tabindex should be set to 0 for the container ", 0, layoutReorderer.container.attr("tabindex"));

            var modules = layoutReorderer.locate("modules");
            for (var i = 0; i < modules.length; i++) {
                jqUnit.assertEquals("Tabindex should be set to -1 for item " + i, -1, modules.eq(i).attr("tabindex"));
            }
        };

        tests.test("Check tabindex with default selectors", function () {
            tabIndexTest("#default-selector-test");
        });

        tests.test("Check tabindex when using a table. ", function () {
            var options = {
                selectors: {
                    columns: "td",
                    modules: "td > div"
                }
            };

            tabIndexTest("#portlet-reorderer-root", options);
        });    

    });
})(jQuery);
