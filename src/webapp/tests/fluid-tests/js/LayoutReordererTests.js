/*
Copyright 2008 University of Toronto
Copyright 2008 University of Cambridge

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
        
        var k = fluid.testUtils.reorderer.bindReorderer(portletIds);
        
        layoutReordererTests.test("Events within module", function () {
            var reorderer = fluid.reorderLayout("#" + portalRootId, {
                        selectors: {
                            columns: columnSelector,
                            modules: portletSelector
                        }
                    });
            
            fluid.jById(portletIds[2]).focus();
            var text2 = fluid.jById("text-2").focus();
            text2.simulate("keypress", {keyCode: fluid.reorderer.keys.m});
            
            jqUnit.assertEquals("After typing M into text field, portlet 2 should still be the active item", portletIds[2], reorderer.activeItem.id);
// This test for FLUID-1690 cannot be made to work in the jqUnit environment yet          
//            var blurred = false;
//            text2.blur(function() {blurred = true;});
            
//            $("#portlet2 .title").simulate("mousedown");
//            $("#portlet2 .title").simulate("mouseup");
//            jqUnit.assertTrue("After mouseDown on title, text field should be blurred", blurred);
            
        });
        
        layoutReordererTests.test("Drop warning visibility for up and down", function () {
            var reorderer = initReorderer();
    
            jqUnit.notVisible("On first load the warning should not be visible", "#drop-warning");
            
            // focus on portlet 3 - it is underneath a locked portlet
            var portlet3 = fluid.byId(portletIds[3]);
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
            var portlet8 = fluid.byId(portletIds[8]);
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
    
    });
})(jQuery);
