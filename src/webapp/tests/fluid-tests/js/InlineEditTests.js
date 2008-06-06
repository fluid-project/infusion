/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
 */

 $(document).ready (function () {
    function setUp () {
    }
    
    function tearDown () {
    }
    
    var inlineEditTests = new jqUnit.TestCase ("InlineEdit Tests", setUp, tearDown);

    inlineEditTests.test("Minimal Construction", function () {
        var container = jQuery("#inline-edit");
        var display = jQuery("#display");
        var editContainer = jQuery("#edit-container");
        var editField = jQuery("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        jqUnit.assertEquals("Minimal constructor - container is set", container[0].id, inlineEditor.container[0].id);
        jqUnit.assertEquals("Minimal constructor - text is set", display[0].id, inlineEditor.text[0].id);
        jqUnit.assertEquals("Minimal constructor - edit container is set", editContainer[0].id, inlineEditor.editContainer[0].id);
        jqUnit.assertEquals("Minimal constructor - edit field is set", editField[0].id, inlineEditor.editField[0].id);
        jqUnit.assertEquals("Minimal constructor - focus style is default", fluid.InlineEdit.prototype.defaults.styles.focus, inlineEditor.styles.focus);
        jqUnit.assertEquals("Minimal constructor - invitation style is default", fluid.InlineEdit.prototype.defaults.styles.invitation, inlineEditor.styles.invitation);
        jqUnit.assertEquals("Minimal constructor - paddings add is default", fluid.InlineEdit.prototype.defaults.paddings.add, inlineEditor.paddings.add);
        jqUnit.assertEquals("Minimal constructor - paddings minimum is default", fluid.InlineEdit.prototype.defaults.paddings.minimum, inlineEditor.paddings.minimum);
        jqUnit.isVisible("Minimal constructor - display field is visible", "#display");
        jqUnit.notVisible("Minimal constructor - edit field is not visible", "#edit-container");
    });

    inlineEditTests.test("Customized Construction", function () {
        var testSelectors = {
            text: ".customText",
            editContainer: ".customEditContainer",
            edit: ".customEdit"
        };
        var testStyles = {
            invitation: "customInvitation",
            focus: "customFocus"
        };		
		var testPaddings = {
			add: 20,
			minimum: 40
		};
        
        var container = jQuery("#inline-edit-custom");
        var display = jQuery("#display-custom");
        var editContainer = jQuery("#edit-container-custom");
        var editField = jQuery("#edit-custom");
        var inlineEditor = new fluid.InlineEdit("inline-edit-custom", testSelectors, testStyles, testPaddings);

        jqUnit.assertEquals("Complex constructor - container is set", container[0].id, inlineEditor.container[0].id);
        jqUnit.assertEquals("Complex constructor - text is set", display[0].id, inlineEditor.text[0].id);
        jqUnit.assertEquals("Complex constructor - edit container is set", editContainer[0].id, inlineEditor.editContainer[0].id);
        jqUnit.assertEquals("Complex constructor - edit field is set", editField[0].id, inlineEditor.editField[0].id);
        jqUnit.assertEquals("Complex constructor - focus style is default", testStyles.focus, inlineEditor.styles.focus);
        jqUnit.assertEquals("Complex constructor - invitation style is default", testStyles.invitation, inlineEditor.styles.invitation);
        jqUnit.assertEquals("Complex constructor - paddings add is default", testPaddings.add, inlineEditor.paddings.add);
        jqUnit.assertEquals("Complex constructor - paddings minimum is default", testPaddings.minimum, inlineEditor.paddings.minimum);
        jqUnit.isVisible("Minimal constructor - display field is visible", "#display-custom");
        jqUnit.notVisible("Minimal constructor - edit field is not visible", "#edit-container-custom");
    });

});
