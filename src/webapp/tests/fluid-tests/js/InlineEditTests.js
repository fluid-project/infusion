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

        jqUnit.assertEquals("Container is set to", container[0].id, inlineEditor.container[0].id);
        jqUnit.assertEquals("Text is set to", display[0].id, inlineEditor.text[0].id);
        jqUnit.assertEquals("Edit container is set to", editContainer[0].id, inlineEditor.editContainer[0].id);
        jqUnit.assertEquals("Edit field is set to", editField[0].id, inlineEditor.editField[0].id);
        jqUnit.assertEquals("Focus style is default", fluid.InlineEdit.prototype.defaults.styles.focus, inlineEditor.styles.focus);
        jqUnit.assertEquals("Invitation style is default", fluid.InlineEdit.prototype.defaults.styles.invitation, inlineEditor.styles.invitation);
        jqUnit.assertEquals("Paddings add is default", fluid.InlineEdit.prototype.defaults.paddings.add, inlineEditor.paddings.add);
        jqUnit.assertEquals("Paddings minimum is default", fluid.InlineEdit.prototype.defaults.paddings.minimum, inlineEditor.paddings.minimum);
        jqUnit.isVisible("Display field is visible", "#display");
        jqUnit.notVisible("Edit field is hidden", "#edit-container");
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
        var options = {
            selectors: testSelectors,
            styles: testStyles,
            paddings: testPaddings 
        };
        
        var container = jQuery("#inline-edit-custom");
        var display = jQuery("#display-custom");
        var editContainer = jQuery("#edit-container-custom");
        var editField = jQuery("#edit-custom");
        var inlineEditor = new fluid.InlineEdit("inline-edit-custom", options);

        jqUnit.assertEquals("Container is set to", container[0].id, inlineEditor.container[0].id);
        jqUnit.assertEquals("Text is set to", display[0].id, inlineEditor.text[0].id);
        jqUnit.assertEquals("Edit container is set to", editContainer[0].id, inlineEditor.editContainer[0].id);
        jqUnit.assertEquals("Edit field is set to", editField[0].id, inlineEditor.editField[0].id);
        jqUnit.assertEquals("Focus style is custom", testStyles.focus, inlineEditor.styles.focus);
        jqUnit.assertEquals("Invitation style is custom", testStyles.invitation, inlineEditor.styles.invitation);
        jqUnit.assertEquals("Paddings add is set to", testPaddings.add, inlineEditor.paddings.add);
        jqUnit.assertEquals("Paddings minimum is set to", testPaddings.minimum, inlineEditor.paddings.minimum);
        jqUnit.isVisible("Display field is visible", "#display-custom");
        jqUnit.notVisible("Edit field is hidden", "#edit-container-custom");
    });

    inlineEditTests.test("Edit-Finish", function () {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");
        
        jqUnit.isVisible("Initially display field is visible", "#display");
        jqUnit.notVisible("Initially edit field is hidden", "#edit-container");

        inlineEditor.edit();
        jqUnit.notVisible("After edit, display field is hidden", "#display");
        jqUnit.isVisible("After edit, edit field is visible", "#edit-container");
        jqUnit.assertEquals("After edit, edit field has the same text as display field", display.text(), edit.attr("value"));

        var testString = "This is new text.";
        edit.attr("value", testString);
        inlineEditor.finish();
        jqUnit.isVisible("After finish, display field is visible", "#display");
        jqUnit.notVisible("After finish, edit field is hidden", "#edit-container");
        jqUnit.assertEquals("After finish, display field contains new text", testString, display.text());
    });

    inlineEditTests.test("Keyboard Navigation Edit", function () {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");
        jqUnit.assertTrue("Display is tabbable", display.tabindex()>=0);
        jqUnit.assertFalse("Initially display field is not focussed", display.hasClass(inlineEditor.styles.focus));

        display.focus();
        jqUnit.assertTrue("After focus, display is focussed", display.hasClass(inlineEditor.styles.focus));

        display.simulate("keydown", {keyCode: $.a11y.keys.ENTER});
            
        jqUnit.notVisible("After enter pressed, display field is hidden", "#display");
        jqUnit.isVisible("After enter pressed, edit field is visible", "#edit-container");
        jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.attr("value"));

        var testString = "This is new text.";
        edit.attr("value", testString);
        edit.simulate("keypress", {keyCode: $.a11y.keys.ENTER});

        jqUnit.isVisible("After changing text and pressing enter, display field is visible", "#display");
        jqUnit.notVisible("After changing text and pressing enter, edit field is hidden", "#edit-container");
        jqUnit.assertEquals("After changing text and pressing enter, display field contains new text", testString, display.text());

        // focus on something else to cause a blur on the display field
        jQuery("#display-custom").focus();
        jqUnit.assertFalse("After blur, display field is not focussed", display.hasClass(inlineEditor.styles.focus));
        
    });
    
    inlineEditTests.test("Hover", function () {
        var display = $("#display");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        jqUnit.assertFalse("Initially, display field does not have the invitation style", display.hasClass(inlineEditor.styles.invitation));

        display.trigger("mouseenter");
        jqUnit.assertTrue("During hover, display field has the invitation style", display.hasClass(inlineEditor.styles.invitation));

        display.trigger("mouseleave");
        jqUnit.assertFalse("After hover, display field does not have the invitation style", display.hasClass(inlineEditor.styles.invitation));
    });
    
    inlineEditTests.test("Click", function () {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        jqUnit.isVisible("Initially, display field is visible", "#display");
        jqUnit.notVisible("Initially, edit field is hidden", "#edit-container");

        display.click();
        jqUnit.notVisible("After click, display field is hidden", "#display");
        jqUnit.isVisible("After click, edit field is visible", "#edit-container");
        jqUnit.assertEquals("After click, edit field contains same text as display field", display.text(), edit.attr("value"));
    });
    
    inlineEditTests.test("Arrow Keys while Editing", function() {
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        display.focus();
        display.simulate("keydown", {keyCode: $.a11y.keys.ENTER});
        jqUnit.notVisible("After enter pressed, display field is hidden", "#display");
        jqUnit.isVisible("After enter pressed, edit field is visible", "#edit-container");
        jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.attr("value"));

        // note: this simulate works in FFX, but not IE7
        edit.simulate("keypress", {keyCode: fluid.keys.LEFT});
        jqUnit.notVisible("After left-arrow pressed, display field is still hidden", "#display");
        jqUnit.isVisible("After left-arrow pressed, edit field is still visible", "#edit-container");

    });
});
