/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global demo*/
/*global jqUnit*/

(function ($) {
    $(document).ready(function () {
        var layoutReordererTests = new jqUnit.TestCase("LayoutReorderer Tests");
        
        var k = fluid.testUtils.reorderer.bindReorderer(fluid.testUtils.moduleLayout.portletIds);
        
        layoutReordererTests.test("Default selectors", function () {
            var testReorderer = fluid.reorderLayout("#default-selector-test");
            var item1 = jQuery("#portlet-1");
            var item2 = jQuery("#portlet-2").focus();
            
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
            var portlet3 = fluid.byId(fluid.testUtils.moduleLayout.portletIds[3]);
            $(portlet3).focus();
            
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
    
            // focus on portlet 8 
            var portlet8 = fluid.byId(fluid.testUtils.moduleLayout.portletIds[8]);
            $(portlet8).focus();
    
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
           var items = fluid.transform(jQuery(".portlet"), fluid.getId);
           var expected = fluid.transform(order, function(item) {return fluid.testUtils.moduleLayout.portletIds[item];});
           jqUnit.assertDeepEq(message, expected, items);
        }
      
        var tests = new jqUnit.TestCase("Reorder Layout Tests");
    
        tests.test("reorderLayout API", function () {
          
            var options = {
                selectors: {
                    columns: "[id^='c']",
                    modules: ".portlet"
                }
            };
            
            var lastLayoutModel = null;
            
            var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
            
            // Test for FLUID-3121
            var afterMoveListener = function() {
                lastLayoutModel = layoutReorderer.layoutHandler.getModel();
                }
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
            var options = {
                selectors: {
                    columns: "[id^='c']",
                    modules: ".portlet",
                    lockedModules: ".locked"
                }
            };

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
    
    
    });
})(jQuery);
