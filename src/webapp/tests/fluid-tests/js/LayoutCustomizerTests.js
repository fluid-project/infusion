/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

 $(document).ready (function () {
    var layoutCustomizerTests = new jqUnit.TestCase ("LayoutCustomizer Tests", setUp, tearDown);
    
    layoutCustomizerTests.test("Bubble keystrokes inside module", function () {
        var reorderer = fluid.initLayoutCustomizer (demo.portal.layout, demo.portal.dropTargetPerms);
        
        fluid.utils.jById (portlet2id).focus();
        fluid.utils.jById ("#text-2").focus ();
        var keyEvent = fluid.testUtils.createUnmodifiedKeyEvent (fluid.keys.m);
        reorderer.handleKeyDown (keyEvent);
        reorderer.handleKeyUp (keyEvent);
        
        jqUnit.assertEquals ("After typing M into text field, portlet 2 should still be the active item", portlet2id, reorderer.activeItem.id);
    });
});