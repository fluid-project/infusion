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

    inlineEditTests.test("Edit-Finish", function () {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");
        
        jqUnit.isVisible("Before edit, display field should be visible", "#display");
        jqUnit.notVisible("Before edit, edit field should not be visible", "#edit-container");

        inlineEditor.edit();
        jqUnit.notVisible("After edit, display field should not be visible", "#display");
        jqUnit.isVisible("After edit, edit field should be visible", "#edit-container");
        jqUnit.assertEquals("After edit, edit field should contain same text as display field", display.text(), edit.attr("value"));

        var testString = "This is new text.";
        edit.attr("value", testString);
        inlineEditor.finish();
        jqUnit.isVisible("After finish, display field should be visible", "#display");
        jqUnit.notVisible("After finish, edit field should not be visible", "#edit-container");
        jqUnit.assertEquals("After edit, display field should contain new test string", testString, display.text());
    });

    inlineEditTests.test("Keyboard navigation, edit", function () {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");
        jqUnit.assertTrue("Display should be tabbable", display.tabindex()>=0);
        jqUnit.assertFalse("Before focus, display field should not have the focus style", display.hasClass(inlineEditor.styles.focus));

        display.focus();
        jqUnit.assertTrue("After focus, display field should have the focus style", display.hasClass(inlineEditor.styles.focus));

        display.simulate("keydown", {keyCode: $.a11y.keys.ENTER});
            
        jqUnit.notVisible("After enter pressed, display field should not be visible", "#display");
        jqUnit.isVisible("After enter pressed, edit field should be visible", "#edit-container");
        jqUnit.assertEquals("After enter pressed, edit field should contain same text as display field", display.text(), edit.attr("value"));

        var testString = "This is new text.";
        edit.attr("value", testString);
        edit.simulate("keypress", {keyCode: $.a11y.keys.ENTER});

        jqUnit.isVisible("After changing text and pressing enter, display field should be visible", "#display");
        jqUnit.notVisible("After changing text and pressing enter, edit field should not be visible", "#edit-container");
        jqUnit.assertEquals("After changing text and pressing enter, display field should contain new test string", testString, display.text());

        // focus on something else to cause a blur on the display field
        jQuery("#display-custom").focus();
        jqUnit.assertFalse("After blur, display field should not have the focus style", display.hasClass(inlineEditor.styles.focus));
        
    });
    
    inlineEditTests.test("Hover", function () {
        var display = $("#display");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        jqUnit.assertFalse("Before hover, display field should not have the invitation style", display.hasClass(inlineEditor.styles.invitation));

        display.trigger("mouseenter");
        jqUnit.assertTrue("During hover, display field should have the invitation style", display.hasClass(inlineEditor.styles.invitation));

        display.trigger("mouseleave");
        jqUnit.assertFalse("After hover, display field should not have the invitation style", display.hasClass(inlineEditor.styles.invitation));
    });
    
    inlineEditTests.test("Click", function () {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        jqUnit.isVisible("Before click, display field should be visible", "#display");
        jqUnit.notVisible("Before click, edit field should not be visible", "#edit-container");

        display.click();
        jqUnit.notVisible("After click, display field should not be visible", "#display");
        jqUnit.isVisible("After click, edit field should be visible", "#edit-container");
        jqUnit.assertEquals("After click, edit field should contain same text as display field", display.text(), edit.attr("value"));
    });
});
