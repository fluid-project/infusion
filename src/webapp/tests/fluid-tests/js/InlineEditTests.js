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
/*global jqUnit*/

$(document).ready(function () {
    
    var inlineEditTests = new jqUnit.TestCase("InlineEdit Tests");

    var customOptions = {selectors: {
            text: ".customText",
            editContainer: ".customEditContainer",
            edit: ".customEdit"
        },
        styles: {
            invitation: "customInvitation",
            focus: "customFocus"
        },		
		paddings: {
			add: 20,
			minimum: 40
		},
        finishedEditing: function () {
            fluid.finishedEditingCallbackCalled = true;
        }      
    };
    
    inlineEditTests.test("Minimal Construction", function () {
        jqUnit.expect(10);

        var container = $("#inline-edit");
        var display = $("#display");
        var editContainer = $("#edit-container");
        var editField = $("#edit");
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
        jqUnit.expect(10);

        var container = $("#inline-edit-custom");
        var display = $("#display-custom");
        var editContainer = $("#edit-container-custom");
        var editField = $("#edit-custom");
        var inlineEditor = new fluid.InlineEdit("inline-edit-custom", customOptions);

        jqUnit.assertEquals("Container is set to", container[0].id, inlineEditor.container[0].id);
        jqUnit.assertEquals("Text is set to", display[0].id, inlineEditor.text[0].id);
        jqUnit.assertEquals("Edit container is set to", editContainer[0].id, inlineEditor.editContainer[0].id);
        jqUnit.assertEquals("Edit field is set to", editField[0].id, inlineEditor.editField[0].id);
        jqUnit.assertEquals("Focus style is custom", customOptions.styles.focus, inlineEditor.styles.focus);
        jqUnit.assertEquals("Invitation style is custom", customOptions.styles.invitation, inlineEditor.styles.invitation);
        jqUnit.assertEquals("Paddings add is set to", customOptions.paddings.add, inlineEditor.paddings.add);
        jqUnit.assertEquals("Paddings minimum is set to", customOptions.paddings.minimum, inlineEditor.paddings.minimum);
        jqUnit.isVisible("Display field is visible", "#display-custom");
        jqUnit.notVisible("Edit field is hidden", "#edit-container-custom");
    });

    inlineEditTests.test("Edit-Finish", function () {
        jqUnit.expect(8);

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
        jqUnit.expect(11);

        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");
        jqUnit.assertTrue("Display is tabbable", display.tabindex() >= 0);
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
        jqUnit.assertTrue("After changing text and pressing enter, display has focus style", display.hasClass(inlineEditor.styles.focus));
        jqUnit.notVisible("After changing text and pressing enter, edit field is hidden", "#edit-container");
        jqUnit.assertEquals("After changing text and pressing enter, display field contains new text", testString, display.text());

        display.blur();
        jqUnit.assertFalse("After blur, display field is not focussed", display.hasClass(inlineEditor.styles.focus));
        
    });
    
    inlineEditTests.test("Hover", function () {
        jqUnit.expect(3);

        var display = $("#display");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        jqUnit.assertFalse("Initially, display field does not have the invitation style", display.hasClass(inlineEditor.styles.invitation));

        display.trigger("mouseenter");
        jqUnit.assertTrue("During hover, display field has the invitation style", display.hasClass(inlineEditor.styles.invitation));

        display.trigger("mouseleave");
        jqUnit.assertFalse("After hover, display field does not have the invitation style", display.hasClass(inlineEditor.styles.invitation));
    });
    
    inlineEditTests.test("Click", function () {
        jqUnit.expect(5);

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
    
    inlineEditTests.test("Arrow Keys while Editing", function () {
        jqUnit.expect(5);

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
    
    inlineEditTests.test("Finished Editing Callback", function () {
        jqUnit.expect(2);

        var options = {
            finishedEditing: function () {
                fluid.finishedEditingCallbackCalled = true;
            }
        };
        var inlineEditor = new fluid.InlineEdit("inline-edit", options);
        jqUnit.assertFalse("Initially, callback has not been called", fluid.finishedEditingCallbackCalled);
        inlineEditor.finish();
        jqUnit.assertTrue("Callback was called", fluid.finishedEditingCallbackCalled);
    });

    inlineEditTests.test("Blur", function () {
        jqUnit.expect(4);
        
        var display = $("#display");
        var edit = $("#edit");
        var inlineEditor = new fluid.InlineEdit("inline-edit");

        display.click();
        jqUnit.isVisible("Edit field is visible", "#edit-container");
        
        var testString = "This is new text.";
        edit.attr("value", testString);
        edit.blur();
        jqUnit.notVisible("After blur, edit field is hidden", "#edit-container");
        jqUnit.assertEquals("Blur saves the edit", testString, display.text());
        jqUnit.assertFalse("Blur saves the edit", edit.text() === display.text());
    });
    
});