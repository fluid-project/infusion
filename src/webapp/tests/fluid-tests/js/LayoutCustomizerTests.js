/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

/*global $*/
/*global fluid*/
/*global demo*/
/*global jqUnit*/

$(document).ready(function () {
    var layoutCustomizerTests = new jqUnit.TestCase("LayoutCustomizer Tests", setUp, tearDown);
    
    layoutCustomizerTests.test("Bubble keystrokes inside module", function () {
        var reorderer = fluid.initLayoutCustomizer(demo.portal.layout, demo.portal.dropTargetPerms);
        
        fluid.utils.jById(portlet2id).focus();
        fluid.utils.jById("text-2").focus();
        var keyEvent = fluid.testUtils.createUnmodifiedKeyEvent(fluid.keys.m);
        reorderer.handleKeyDown(keyEvent);
        reorderer.handleKeyUp(keyEvent);
        
        jqUnit.assertEquals("After typing M into text field, portlet 2 should still be the active item", portlet2id, reorderer.activeItem.id);
    });
    
    layoutCustomizerTests.test("Drop warning visibility for up and down", function () {
        var reorderer = initReorderer();

        jqUnit.notVisible ("On first load the warning should not be visible", "#drop-warning");
        
        // focus on portlet 3 - it is underneath a locked portlet
        var portlet3 = fluid.utils.jById (portlet3id);
        portlet3.focus();
        
        // try to move portlet 3 up
        // Press the ctrl key
        reorderer.handleKeyDown(fluid.testUtils.createEvtCTRL (portlet3[0]));
        jqUnit.notVisible ("After ctrl down, the warning should not be visible", "#drop-warning");
        
        // Press the up arrow key while holding down ctrl
        var ctrlUpArrowEvt = fluid.testUtils.createEvtCtrlUpArrow();
        reorderer.handleDirectionKeyDown(ctrlUpArrowEvt);
        jqUnit.isVisible ("After ctrl + up arrow, drop warning should be visible", "#drop-warning"); 

        // release the ctrl key
        var ctrlUpEvt = fluid.testUtils.createEvtCTRLUp(portlet3[0]);
        reorderer.handleKeyUp(ctrlUpEvt);
        jqUnit.notVisible ("After ctrl is released, drop warning should not be visible", "#drop-warning"); 

        // Press the up arrow key while holding down ctrl again
        reorderer.handleDirectionKeyDown(ctrlUpArrowEvt);
        jqUnit.isVisible ("After ctrl + up arrow, drop warning should be visible", "#drop-warning"); 

        // Press the down arrow key while holding down ctrl
        var ctrlDownArrowEvt = fluid.testUtils.createEvtCtrlDownArrow();
        reorderer.handleDirectionKeyDown(ctrlDownArrowEvt);
        jqUnit.notVisible ("After ctrl + down arrow, drop warning should NOT be visible", "#drop-warning"); 

        // focus on portlet 8 
        var portlet8 = fluid.utils.jById (portlet8id);
        portlet8.focus();

        // move portlet 8 down
        // Press the ctrl key
        reorderer.handleKeyDown(fluid.testUtils.createEvtCTRL (portlet8[0]));
        jqUnit.notVisible ("After ctrl down, the warning should not be visible", "#drop-warning");

        reorderer.handleDirectionKeyDown(ctrlDownArrowEvt);
        jqUnit.notVisible ("After moving portlet 8 down, drop warning should not be visible", "#drop-warning"); 

        // try to move portlet 8 down from the bottom position.
        reorderer.handleDirectionKeyDown(ctrlDownArrowEvt);
        jqUnit.notVisible ("After trying to move portlet 8 down, drop warning should not be visible", "#drop-warning"); 

        // release the ctrl key
        ctrlUpEvt = fluid.testUtils.createEvtCTRLUp(portlet8[0]);
        reorderer.handleKeyUp(ctrlUpEvt);
        jqUnit.notVisible ("After ctrl is released, drop warning should not be visible", "#drop-warning"); 

    });

});