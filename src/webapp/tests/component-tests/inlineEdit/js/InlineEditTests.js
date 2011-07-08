/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
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
                    edit: 20,
                    minimumEdit: 40
                }
                };
        
        function insistSelect(message, that, name) {
            var togo = that.locate(name);
            jqUnit.assertEquals(message, 1, togo.length);
            return togo;
        }
        
        function assertVisibility(state, name, selector) {
            if (state) {
                jqUnit.isVisible(name + " should be visible", selector);
            } else {
                jqUnit.notVisible(name + " should not be visible", selector);
            }
        }
        
        function assertVisState(undo, redo, uv, rv) {
            assertVisibility(uv, "undo container", undo);
            assertVisibility(rv, "redo container", redo);
        }
     
        inlineEditTests.test("Minimal Construction", function () {
            expect(11);
    
            var container = $("#inline-edit");
            var display = $("#display");
            var editContainer = $("#edit-container");
            var editField = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            jqUnit.assertEquals("Container is set to", container[0].id, inlineEditor.container[0].id);
            jqUnit.assertEquals("Text is set to", display[0].id, inlineEditor.viewEl[0].id);
            jqUnit.assertEquals("Edit container is set to", editContainer[0].id, inlineEditor.editContainer[0].id);
            jqUnit.assertEquals("Edit field is set to", editField[0].id, inlineEditor.editField[0].id);
            jqUnit.assertEquals("Focus style is default", fluid.defaults("inlineEdit").styles.focus, inlineEditor.options.styles.focus);
            jqUnit.assertEquals("Invitation style is default", fluid.defaults("inlineEdit").styles.invitation, inlineEditor.options.styles.invitation);
            jqUnit.assertEquals("Paddings add is default", fluid.defaults("inlineEdit").paddings.edit, inlineEditor.options.paddings.edit);
            jqUnit.assertEquals("Paddings minimum is default", fluid.defaults("inlineEdit").paddings.minimumEdit, inlineEditor.options.paddings.minimumEdit);
            jqUnit.assertTrue("FLUID-2100: The tool tip is on by default", inlineEditor.options.useTooltip);
            jqUnit.isVisible("Display field is visible", "#display");
            jqUnit.notVisible("Edit field is hidden", "#edit-container");
        });
    
        function testCustomized(useRenderer) {
    
            inlineEditTests.test("Customized Construction" + (useRenderer ? " (via Renderer)" : ""), function () {
                expect(10);
                var root = $("#custom-renderRoot");
                var inlineEditor;
        
                if (useRenderer) {
                    var model = {
                        value: "Initial model value"
                    };
                    var decorator = {
                        type: "fluid",
                        func: "fluid.inlineEdit",
                        options: customOptions
                    };
                    fluid.selfRender(root, 
                        [{ID: "inline-edit", 
                            decorators: decorator},
                            {ID: "inline-edit-control",
                                valuebinding: "value"}], 
                         {cutpoints: [{id: "inline-edit", selector: "#inline-edit-custom"},
                                      {id: "inline-edit-control", selector: "#edit-custom"}],
                            model: model,
                            autoBind: true});
                    inlineEditor = decorator.that;
                } else {
                    inlineEditor = fluid.inlineEdit("#inline-edit-custom", customOptions);
                }
                var container = $(".customContainer", root);
                var display = $("#display-custom");
                var editContainer = $(".customEditContainer", root);
                var editField = $(".customEdit", root);
        
                jqUnit.assertEquals("Container is set to", container[0].id, inlineEditor.container[0].id);
                jqUnit.assertEquals("Text control is set to", display[0].id, inlineEditor.viewEl[0].id);
                jqUnit.assertEquals("Edit container is set to", editContainer[0].id, inlineEditor.editContainer[0].id);
                jqUnit.assertEquals("Edit field is set to", editField[0].id, inlineEditor.editField[0].id);
                jqUnit.assertEquals("Focus style is custom", customOptions.styles.focus, inlineEditor.options.styles.focus);
                jqUnit.assertEquals("Invitation style is custom", customOptions.styles.invitation, inlineEditor.options.styles.invitation);
                jqUnit.assertEquals("Paddings add is set to", customOptions.paddings.edit, inlineEditor.options.paddings.edit);
                jqUnit.assertEquals("Paddings minimum is set to", customOptions.paddings.minimumEdit, inlineEditor.options.paddings.minimumEdit);
                jqUnit.isVisible("Display field is visible", "#display-custom");
                jqUnit.notVisible("Edit field is hidden", "#edit-container-custom");
            });
        }
        
        testCustomized(false);
        testCustomized(true);
    
        function makeSubmittingTest(name, id, options, shouldsubmit) {
    
            inlineEditTests.test(name, function () {
                var inlineEditor = fluid.inlineEdit(id, $.extend(true, {}, customOptions, options));
                inlineEditor.edit();
                var field = inlineEditor.editField;
                jqUnit.assertEquals("Empty on begin edit", "", field.val());
                var value = "Thing\nLine 2";
                // Remove this conditional to verify impossibility of FLUID-890,
                // and observe quite inconsistent behaviour on all browsers
                if (field[0].nodeName.toLowerCase() === "input") {
                    value = "Thing"; 
                }
                field.val(value);
                inlineEditor.editContainer.simulate("keypress", {keyCode: $.ui.keyCode.ENTER});
                jqUnit.assertEquals("Unsubmitted", shouldsubmit ? value : "", inlineEditor.model.value);
                
                inlineEditor.finish();
                jqUnit.assertEquals("Unsubmitted", value, inlineEditor.model.value);
            });
        }

        makeSubmittingTest("Textarea autosubmit auto", "#inline-edit-textarea", null, false);
        makeSubmittingTest("Textarea autosubmit ensure", "#inline-edit-textarea", {submitOnEnter: true}, true);
        makeSubmittingTest("Input autosubmit auto", "#inline-edit-custom", null, true);
        makeSubmittingTest("Input autosubmit defeat", "#inline-edit-custom", {submitOnEnter: false}, false);
        
        function makeSubmittingTest2(name, id, options, shouldsubmit) {
            
            inlineEditTests.test(name, function () {
                var inlineEditor = fluid.inlineEdit(id, $.extend(true, {}, customOptions, options));
                inlineEditor.edit();
                var field = inlineEditor.editField;
                jqUnit.assertEquals("Click here to edit on begin edit", "Click here to edit", field.val());
                var value = "Thing\nLine 2";
                // Remove this conditional to verify impossibility of FLUID-890,
                // and observe quite inconsistent behaviour on all browsers
                if (field[0].nodeName.toLowerCase() === "input") {
                    value = "Thing"; 
                }
                field.val(value);
                inlineEditor.editContainer.simulate("keypress", {keyCode: $.ui.keyCode.ENTER});
                jqUnit.assertEquals("Unsubmitted", shouldsubmit ? value : "Click here to edit", inlineEditor.model.value);
                
                inlineEditor.finish();
                jqUnit.assertEquals("Unsubmitted", value, inlineEditor.model.value);
            });
        }
        
        makeSubmittingTest2("Default Textarea autosubmit auto", "#inline-edit-textarea-text-as-default", null, false);
        makeSubmittingTest2("Default Textarea autosubmit ensure", "#inline-edit-textarea-text-as-default", {submitOnEnter: true}, true);
        makeSubmittingTest2("Default Input autosubmit auto", "#inline-edit-custom-text-as-default", null, true);
        makeSubmittingTest2("Default Input autosubmit defeat", "#inline-edit-custom-text-as-default", {submitOnEnter: false}, false);

        inlineEditTests.test("Invitation text (Default)", function () {
            expect(11);
    
            var display = $("#empty-display");
            jqUnit.assertEquals("Before initialization of empty display, display is empty", "", display.text());
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit");
            jqUnit.assertEquals("After initialization of empty display, display has invitation text: ", fluid.defaults("inlineEdit").defaultViewText, display.text());
            jqUnit.assertTrue("Invitation text has invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewStyle));
            jqUnit.assertTrue("Invitation text still contains it's initial class attribute as well", display.hasClass("flc-inlineEdit-text")); // added for FLUID-1803 
            jqUnit.assertEquals("The textEditButton text should be set", "Edit text " + inlineEditor.options.defaultViewText, inlineEditor.locate("textEditButton").text());
            
            var testText = "This is test text.";
            var edit = inlineEditor.editField;
            inlineEditor.edit();
            jqUnit.assertEquals("After switching into edit mode, edit field should be empty: ", "", edit.val());
            edit.prop("value", testText);
            inlineEditor.finish();
            jqUnit.assertEquals("After editing the field, display should have test text ", testText, display.text());
            jqUnit.assertFalse("Test text shouldn't have invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewStyle));
    
            inlineEditor.edit();
            edit.prop("value", "");
            inlineEditor.finish();
            jqUnit.assertEquals("After clearing the field, display should have invitation text again: ", fluid.defaults("inlineEdit").defaultViewText, display.text());
            jqUnit.assertTrue("Invitation text has invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewStyle));
            jqUnit.assertTrue("Invitation text still contains it's initial class attribute as well", display.hasClass("flc-inlineEdit-text")); // added for FLUID-1803
        });
        
        inlineEditTests.test("Invitation text (custom)", function () {
            expect(2);
    
            var display = $("#empty-display");
            var customInvitation = "This is custom invitation text";
            jqUnit.assertEquals("Before initialization, display is empty", "", display.text());
    
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit", {defaultViewText: customInvitation});
            jqUnit.assertEquals("After initialization, display has custom invitation text.", customInvitation, display.text());
        });
        
        inlineEditTests.test("Invitation text (none)", function () {
            expect(10);
    
            var display = $("#empty-display");
            jqUnit.assertFalse("Before initialization, display is empty", display.text());
            var padding = display.css("padding");
            jqUnit.assertTrue("The display field has no padding.", !padding || padding === "0px");
    
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit", {defaultViewText: ""});
            jqUnit.assertEquals("After initialization, display is still empty", "", display.text());
            jqUnit.assertEquals("The display field padding is ", fluid.defaults("inlineEdit").paddings.minimumView, parseFloat(display.css("padding-right")));
    
            var testText = "This is test text that is a bit long.";
            var edit = inlineEditor.editField;
            inlineEditor.edit();
            jqUnit.assertFalse("Upon entering edit mode, edit field should be fully empty", edit.attr("value"));
            edit.prop("value", testText);
            inlineEditor.finish();
            jqUnit.assertEquals("After editing the field, display should have test text ", testText, display.text());
            jqUnit.assertEquals("The display field has no padding.", 0, parseFloat(display.css("padding-right")));
    
            inlineEditor.edit();
            jqUnit.assertEquals("Upon entering edit mode but before clearing, edit field should be have test text", testText, edit.prop("value"));
            edit.prop("value", "");
            inlineEditor.finish();
            jqUnit.assertEquals("After clearing the field, display should be empty again: ", "", display.text());
            jqUnit.assertEquals("The display field padding is ", fluid.defaults("inlineEdit").paddings.minimumView, parseFloat(display.css("padding-right")));
        });
        
        inlineEditTests.test("isEditing", function () {
            expect(3);
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            
            jqUnit.assertFalse("We should be in view mode by default.", inlineEditor.isEditing());
            
            inlineEditor.edit();
            jqUnit.assertTrue("When in edit mode, isEditing() should return true.", inlineEditor.isEditing());
            
            inlineEditor.finish();
            jqUnit.assertFalse("After editing is finished, isEditing() should return false.", inlineEditor.isEditing());        
        });
        
        inlineEditTests.test("Edit Finish", function () {
            expect(9);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            
            jqUnit.isVisible("Initially display field is visible", "#display");
            jqUnit.notVisible("Initially edit field is hidden", "#edit-container");
    
            inlineEditor.edit();
            jqUnit.notVisible("After edit, display field is hidden", "#display");
            jqUnit.isVisible("After edit, edit field is visible", "#edit-container");
            jqUnit.assertEquals("After edit, edit field has the same text as display field", display.text(), edit.prop("value"));
    
            var testString = "This is new text.";
            edit.prop("value", testString);
            inlineEditor.finish();
            jqUnit.isVisible("After finish, display field is visible", "#display");
            jqUnit.notVisible("After finish, edit field is hidden", "#edit-container");
            jqUnit.assertEquals("After finish, display field contains new text", testString, display.text());
            
            inlineEditor.finish();
            jqUnit.isVisible("When not in edit mode, textEditButton is visible", inlineEditor.textEditButton);
        });
        
        inlineEditTests.test("Edit Cancel", function () {
            var editField = $("#edit");
            var text = $("#display");
            var defaultValue = "Click me to edit...";
            
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            
            // Sanity check first.
            jqUnit.assertEquals("Before editing, the model should have the default value.", 
                                defaultValue, inlineEditor.model.value);
            
            // Now edit and cancel. The default value should be restored.
            inlineEditor.edit();
            editField.val("foo");
            inlineEditor.cancel();
            jqUnit.assertEquals("After cancelling, the model's value should be the default again.", 
                                defaultValue, inlineEditor.model.value);
            jqUnit.assertEquals("After cancelling, the view text should return to its default.", 
                                defaultValue, text.text());
        });
    
        inlineEditTests.test("Keyboard Navigation Edit", function () {
            expect(14);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            var button = inlineEditor.textEditButton;
            jqUnit.assertTrue("TextEditButton is tabbable", fluid.tabindex(button) >= 0);
            jqUnit.assertFalse("Initially display field is not focused", display.hasClass(inlineEditor.options.styles.focus));
    
            button.focus();
            jqUnit.assertTrue("After focus, display and textEditButton are focussed", display.parent().hasClass(inlineEditor.options.styles.focus));
            jqUnit.isVisible("After enter pressed, display field is visible", "#display");
            jqUnit.notVisible("After enter pressed, edit field is hidden", "#edit-container");
            jqUnit.isVisible("After enter pressed, button is visible", button);
            button.simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
                
            jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.prop("value"));
            jqUnit.notVisible("After enter pressed, button is hidden", button);
    
            var testString = "This is new text.";
            edit.prop("value", testString);
            edit.simulate("keypress", {keyCode: $.ui.keyCode.ENTER});
    
            jqUnit.isVisible("After changing text and pressing enter, display field is visible", "#display");
            jqUnit.assertTrue("After changing text and pressing enter, display has displayModeContainer style", display.parent().hasClass(inlineEditor.options.styles.focus));
            jqUnit.notVisible("After changing text and pressing enter, edit field is hidden", "#edit-container");
            jqUnit.assertEquals("After changing text and pressing enter, display field contains new text", testString, display.text());
            jqUnit.isVisible("After enter pressed, button is visible", button);
    
            display.blur();
            jqUnit.assertFalse("After blur, display field is not focused", display.hasClass(inlineEditor.options.styles.focus));
        });

        inlineEditTests.test("Hover", function () {
            expect(3);
    
            var display = $("#display");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            jqUnit.assertFalse("Initially, display field does not have the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
    
            display.trigger("mouseenter");
            jqUnit.assertTrue("During hover, display field and textEditButton have the invitation style", display.parent().hasClass(inlineEditor.options.styles.invitation));
    
            display.trigger("mouseleave");
            jqUnit.assertFalse("After hover, display field does not have the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
        });
        
        var assertDisplayModeVisibility = function (display, editContainer, inlineEditor) {
            var button = inlineEditor.textEditButton;
            
            jqUnit.isVisible("Initially, display field is visible", display);
            jqUnit.isVisible("Initially, textEditButton is visible", button);
            jqUnit.notVisible("Initially, edit field is hidden", editContainer);
        };
            
        var assertEditModeVisibility = function (display, editContainer, edit, inlineEditor) {
            var button = inlineEditor.textEditButton;
            
            jqUnit.notVisible("After click, display field is hidden", display);
            jqUnit.notVisible("After click, textEditButton is hidden", button);
            jqUnit.isVisible("After click, edit field is visible", editContainer);
            jqUnit.assertEquals("After click, edit field contains same text as display field", display.text(), edit.prop("value"));
        };
        
        inlineEditTests.test("Click on display", function () {
            var display = $("#display");
            var editContainer = $("#edit-container");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            
            assertDisplayModeVisibility(display, editContainer, inlineEditor);
            display.click();
            assertEditModeVisibility(display, editContainer, edit, inlineEditor);
        });
        
        inlineEditTests.test("Click on textEditButton", function () {
    
            var display = $("#display");
            var editContainer = $("#edit-container");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            var button = inlineEditor.textEditButton;
            
            assertDisplayModeVisibility(display, editContainer, inlineEditor);
            button.click();
            assertEditModeVisibility(display, editContainer, edit, inlineEditor);
        });
        
        inlineEditTests.test("Arrow Keys while Editing", function () {
            expect(5);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            var button = inlineEditor.textEditButton;
    
            button.focus();
            button.simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
            jqUnit.notVisible("After enter pressed, display field is hidden", "#display");
            jqUnit.isVisible("After enter pressed, edit field is visible", "#edit-container");
            jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.prop("value"));
    
            // note: this simulate works in FFX, but not IE7
            edit.simulate("keypress", {keyCode: $.ui.keyCode.LEFT});
            jqUnit.notVisible("After left-arrow pressed, display field is not still visible", "#display");
            jqUnit.isVisible("After left-arrow pressed, edit field is still visible", "#edit-container");
        });
        
        inlineEditTests.test("Finished Editing Callback", function () {
            expect(4);
            var callbackCalled = false;
    
            var options = {
                listeners: {
                    afterFinishEdit: function (newValue, oldValue, edit, text) {
                        jqUnit.assertEquals("The edit field should be passed along in the callback.", $("#edit")[0], edit);
                        jqUnit.assertEquals("The text view should also be passed along in the callback.", $("#display")[0], text);
                        callbackCalled = true;
                    }
                }
            };
            var inlineEditor = fluid.inlineEdit("#inline-edit", options);
            jqUnit.assertFalse("Initially, callback has not been called", callbackCalled);
            inlineEditor.finish();
            jqUnit.assertTrue("Callback was called", callbackCalled);
        });
    
        inlineEditTests.test("Blur", function () {
            expect(4);
            
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            display.click();
            jqUnit.isVisible("Edit field is visible", "#edit-container");
            
            var testString = "Click me to edit...";
            edit.prop("value", testString);
            edit.blur();
            jqUnit.notVisible("After blur, edit field is hidden", "#edit-container");
            jqUnit.assertEquals("Blur saves the edit", testString, display.text());
            jqUnit.assertFalse("Blur saves the edit", edit.text() === display.text());
        });
        
        inlineEditTests.test("ARIA", function () {
            expect(10);
            
            var display = $("#display");
            
            jqUnit.assertFalse("Before initialization, display should have no role.", display.attr("role"));
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            jqUnit.assertEquals("After initialization, display role should be ", "button", inlineEditor.textEditButton.attr("role"));

            var initialValue = "Initial Value";
            
            $("#display-undoable").text(initialValue);
    
            var editorWithUndo = fluid.inlineEdit("#inline-edit-undo", {componentDecorators: "fluid.undoDecorator"});
            var undoer1 = editorWithUndo.decorators[0];
            var undo1 = insistSelect("There should be an undo container", undoer1, "undoContainer"); 
            var markup = $(".flc-undo");
            jqUnit.assertEquals("aria-live should be", "polite", markup.attr("aria-live"));
            jqUnit.assertEquals("aria-relevant should be", "all", markup.attr("aria-relevant"));
            var redo1 = insistSelect("There should be a redo container", undoer1, "redoContainer"); 
            jqUnit.assertEquals("aria-live should be", "polite", markup.attr("aria-live"));
            jqUnit.assertEquals("aria-relevant should be", "all", markup.attr("aria-relevant"));
            assertVisState(undo1, redo1, false, false); // 4
        });
        
        inlineEditTests.test("Test overriding the tooltip text ", function () {
            expect(2);
            var options = {tooltipText: "Updating the default tooltip text..."};
            var editor = fluid.inlineEdit("#inline-override-tooltip", options);
            var inlineEditText = editor.locate("text");                
            inlineEditText.mouseover();
            
            //tool tip enabled
            jqUnit.assertTrue("after mouse hover check if the tooltip was enabled", editor.tooltipEnabled());
            
            //now display the text once mouse is over
            jqUnit.assertEquals("the tool tip with custom text  ", options.tooltipText, $("#" + inlineEditText.attr("aria-describedby")).text());                
        });
        
        var testTableCellInlineEdit = function (inlineEditTableCell, initialExpectedValue, newExpectedValue) {
            inlineEditTableCell.edit();
            jqUnit.assertEquals("After switching into edit mode, the model should have initial value: ", initialExpectedValue, inlineEditTableCell.model.value);
            inlineEditTableCell.editField.prop("value", newExpectedValue);
            inlineEditTableCell.finish();
            jqUnit.assertNotEquals("After editing the field, the model value should change ", initialExpectedValue, inlineEditTableCell.model.value);
        };
        
        inlineEditTests.test("Test using inline edit to edit a table cell  ", function () {
            expect(4);
            var editor = fluid.inlineEdits("#inline-edit-table-cell");                
            testTableCellInlineEdit(editor[0], "This is an editable table cell.", "This is test text cell one.");
            testTableCellInlineEdit(editor[1], "This is another editable table cell.", "This is test text cell two.");
        });
        
        // Multiple Inline Editors tests
        (function () {
            var inlineEditsSel = "form.inlineEditable";
            var editor1Sels = {
                display: "#display",
                edit: "#edit-container"  
            };
           
            var instantiateInlineEdits = function (callback) {
                return fluid.inlineEdits("#main", {
                    selectors: {
                        editables: inlineEditsSel
                    },
                    listeners: {
                        afterFinishEdit: callback
                    }
                });
            };
            
            inlineEditTests.test("inlineEdits(): instantiate more than one", function () {
                expect(1);
                
                var editors = instantiateInlineEdits();
                jqUnit.assertEquals("There should be two inline editors on the page.", 2, editors.length);
            });
            
            inlineEditTests.test("inlineEdits(): call to edit affects only one at a time", function () {
                expect(8);
                
                var editors = instantiateInlineEdits();
                
                // First check that the displays are shown and the edits are
                // hidden.
                jqUnit.isVisible("Initially, display field #1 is visible", editor1Sels.display);
                jqUnit.isVisible("Initially, display field #2 is visible", editors[1].viewEl);
                jqUnit.notVisible("Initially, edit field #1 is hidden", editor1Sels.edit);
                jqUnit.notVisible("Initially, edit field #2 is hidden", editors[1].editField);
                
                editors[0].edit();
                
                jqUnit.notVisible("Display field #1 should be hidden", editor1Sels.display);
                jqUnit.isVisible("Edit field #1 should be visible", editor1Sels.edit);
                jqUnit.isVisible("Display field #2 should be visible", editors[1].viewEl);
                jqUnit.notVisible("Edit field #2 should be hidden", editors[1].editField);
            });
            
            var toggleEditOnAndOff = function (editor) {
                editor.edit();
                editor.finish();
            };
            
            inlineEditTests.test("inlineEdits(): finished editing callback; one for all fields", function () {
                expect(5);
                
                var textFieldIds = [];
                var finishedCallback = function (newValue, oldValue, formField) {
                    textFieldIds.push($(formField).prop("id"));    
                };
                
                var editors = instantiateInlineEdits(finishedCallback);
                
                // Sanity check
                jqUnit.assertUndefined("Initially, the callback should not have been called.", textFieldIds[0]);
    
                // Edit the first field.
                toggleEditOnAndOff(editors[0]);
                jqUnit.assertTrue("After finishing, the callback should have been called only once.", 
                                  1, textFieldIds.length);
                jqUnit.assertEquals("After finishing, the callback should have been called with the first form field.", 
                                    "edit", textFieldIds[0]);
                
                // Edit the last field.
                textFieldIds = [];          
                toggleEditOnAndOff(editors[1]);
                jqUnit.assertTrue("After finishing, the callback should have been called only once.", 
                                  1, textFieldIds.length);
                jqUnit.assertEquals("After finishing, the callback should have been called with the first form field.", 
                                    "edit2", textFieldIds[0]);
            });
            
            var testMultiInlineEdits = function (containerId, numEditors, hasUndo, options) {
                var editors = fluid.inlineEdits("#" + containerId, options);
                jqUnit.assertEquals(containerId + " has " + numEditors + " editors", numEditors, editors.length);
                var i;
                for (i = 0; i < numEditors; i++) {
                    var editor = editors[i];
                    var currentHasUndo = !!editor.decorators && editor.decorators[0].typeName === "undo";
                    jqUnit.assertEquals("Check whether or not editor has undo option", hasUndo, currentHasUndo);
                    jqUnit.assertEquals("Belongs to container " + containerId, containerId, editor.container.parent().prop("id"));
                }
            };
            
            inlineEditTests.test("Test two copies of multiple inline edits with - we need to make sure we cover containment within a group when using the multiple inline edit API ", function () {           
                expect(12);
                var options = {componentDecorators: "fluid.undoDecorator"};        
                testMultiInlineEdits("inline-multiple-edits", 2, true, options);                
                testMultiInlineEdits("inline-multiple-edits-2", 3, false);
            });
        })();
        
        /**
         * Tests for self-rendering the edit mode.
         */
        (function () {
            var containerId = "inline-edit-self-render";
            var textSel = "#display-self-render";
            
            var selfRenderingInlineEdit = function () {        
                // Fire off an inline edit against a container which does not
                // contain an edit form.
                return fluid.inlineEdit(fluid.jById(containerId));
            };
            
            inlineEditTests.test("Self-rendering edit mode: instantiation", function () {
                expect(3);
                
                var editor = selfRenderingInlineEdit();
                var editorContainer = editor.editContainer;
                // There should now be a hidden edit mode. Using the default
                // edit injector, we expect an edit container div and an inner textfield.
                jqUnit.assertNotUndefined("The self-rendered edit container should not be undefined.", editorContainer);
                jqUnit.assertEquals("There should be one new element matching 'inline-edit-self-render-edit-container'",
                                   1, editorContainer.length);
                                   
                jqUnit.assertEquals("There should be one new text field within the edit container.", 
                                    1, editor.editField.length);
            });
            
            var assertInViewMode = function (component) {
                jqUnit.isVisible("Initially, the view mode should be visible.", textSel);
                jqUnit.notVisible("Initially, the edit mode should be hidden.", component.editContainer);    
            };
            
            var assertInEditMode = function (component) {
                jqUnit.isVisible("During editing, the edit mode should be visible.", component.editContainer);
                jqUnit.notVisible("During editing, the view mode should be hidden.", textSel);    
            };
            
            inlineEditTests.test("Self-rendering edit mode: edit() and finish()", function () {
                expect(7);
                
                var editor = selfRenderingInlineEdit();
                assertInViewMode(editor);
                
                editor.edit();
                assertInEditMode(editor);
                
                jqUnit.assertEquals("The contents of the edit field should be the same as the view text.",
                                    $(textSel).text(), editor.editField.prop("value"));
                editor.finish();
                assertInViewMode(editor);
            });
           
            inlineEditTests.test("Self-rendering with undo control", function () {
                var initialValue = "Initial Value";
                var newValue = "New Value";
                expect(15);
                
                $("#display-undoable").text(initialValue);

                var editor = fluid.inlineEdit("#inline-edit-undo", {componentDecorators: "fluid.undoDecorator"});
                var undoer = editor.decorators[0];
                
                var undo = insistSelect("There should be an undo container", undoer, "undoContainer");
                var redo = insistSelect("There should be a redo container", undoer, "redoContainer");

                assertVisState(undo, redo, false, false); // 4
                
                var edit = insistSelect("There should be an edit control", editor, "edit");
                editor.edit();
                edit.val(newValue);
                editor.finish();
                assertVisState(undo, redo, true, false); // 7
                
                var undoControl = insistSelect("There should be an undo control", undoer, "undoControl"); // 8
                undoControl.click();
                assertVisState(undo, redo, false, true); // 10
                jqUnit.assertEquals("Model state should now be " + initialValue, initialValue, editor.model.value); // 11
                
                var redoControl = insistSelect("There should be an redo control", undoer, "redoControl"); // 12
                redoControl.click();
                assertVisState(undo, redo, true, false); // 14
                jqUnit.assertEquals("Model state should now be " + newValue, newValue, editor.model.value); // 15
            });
            
            inlineEditTests.test("Multiple undo controls", function () {
                var initialValue = "Initial Value";
                var newValue = "New Value";
                expect(15);
                $("#display-undoable").text(initialValue);
    
                var editor1 = fluid.inlineEdit("#inline-edit-undo", {componentDecorators: "fluid.undoDecorator"});
                var undoer1 = editor1.decorators[0];
                var undo1 = insistSelect("There should be an undo container", undoer1, "undoContainer"); // 1
                var redo1 = insistSelect("There should be a redo container", undoer1, "redoContainer"); // 2
                assertVisState(undo1, redo1, false, false); // 4
                
                $("#display-undoable2").text(initialValue);
                var editor2 = fluid.inlineEdit("#inline-edit-undo2", {componentDecorators: "fluid.undoDecorator"});
                var undoer2 = editor2.decorators[0];
                
                var undo2 = insistSelect("There should be an undo container", undoer2, "undoContainer"); // 5
                var redo2 = insistSelect("There should be a redo container", undoer2, "redoContainer"); // 6
                assertVisState(undo2, redo2, false, false); // 8
    
                jqUnit.assertTrue("Undo containers should be distinct", undo1 !== undo2); // 9
                jqUnit.assertTrue("Redo containers should be distinct", redo1 !== redo2); // 10
                
                var edit1 = insistSelect("There should be an edit control", editor1, "edit"); // 11
                editor1.edit();
                edit1.val(newValue);
                editor1.finish();
                assertVisState(undo1, redo1, true, false); // 13
                assertVisState(undo2, redo2, false, false); // 15
            });
            
            function setValue(editor, edit, newValue) {
                editor.edit();
                edit.val(newValue);
                editor.finish();
            }
            
            inlineEditTests.test("State/event FLUID-1661, FLUID-1662, FLUID-1772", function () {
                var changeCount = 0; // count calls to modelChanged
                var editor = fluid.inlineEdit("#inline-edit-undo", {
                    componentDecorators: "fluid.undoDecorator",
                    listeners: {
                        modelChanged: function () { 
                            ++changeCount; 
                        }
                    }
                });
                jqUnit.assertEquals("No modelChanged on startup", 0, changeCount); // FLUID-1772
                var undoer = editor.decorators[0];
                var edit = insistSelect("There should be an edit control", editor, "edit");
                var undoControl = insistSelect("There should be an undo control", undoer, "undoControl"); // 8
                setValue(editor, edit, "Change 1");
                jqUnit.assertEquals("modelChanged 1", 1, changeCount);
                
                setValue(editor, edit, "Change 2");
                jqUnit.assertEquals("modelChanged 2", 2, changeCount);
                undoControl.click();
                jqUnit.assertEquals("modelChanged 3", 3, changeCount);
                jqUnit.assertEquals("Undo 1", "Change 1", editor.model.value);
                setValue(editor, edit, "Change 3");
                jqUnit.assertEquals("modelChanged 4", 4, changeCount);
                undoControl.click();
                jqUnit.assertEquals("modelChanged 5", 5, changeCount);
                jqUnit.assertEquals("Undo 1", "Change 1", editor.model.value);
            });
            
            inlineEditTests.test("Self-container", function () {
                var editor = fluid.inlineEdit("#inline-edit2");
                var edit = $("#inline-edit2 .flc-inlineEdit-edit")[0];
                jqUnit.assertEquals("Container is field", edit, editor.editField[0]);
            });
            
            inlineEditTests.test("Render textEditButton", function () {
                var editor = fluid.inlineEdit("#inline-edit");
                var button = editor.textEditButton;
                
                jqUnit.assertEquals("Should only be one textEditButton", 1, button.length);
                jqUnit.assertEquals("The textEditButton text should be set", "Edit text " + editor.locate("text").text(), button.text());
                jqUnit.assertTrue("The textEditButton should have the fl-offScreen-hidden style", button.hasClass(editor.options.styles.textEditButton));
            });
            
            inlineEditTests.test("Update textEditButton text", function () {
                var editor = fluid.inlineEdit("#inline-edit");
                editor.edit();
                var text = "the brown dog";    
                editor.locate("edit").prop("value", text);
                editor.finish();
                
                var button = editor.textEditButton;
                jqUnit.assertEquals("After editing, the textEditButton text should be", "Edit text " + text, button.text());
            });
            
            inlineEditTests.test("Container styling", function () {
                var editor = fluid.inlineEdit("#inline-edit");
                var button = editor.textEditButton;
                var text = editor.locate("text");
                
                jqUnit.assertTrue("The display and textEditButton containerWrapper should have the fl-inlineEdit-inlineBlock class on focus", text.parent().hasClass(editor.options.styles.displayView));
                button.focus();
                jqUnit.assertTrue("The display and textEditButton containerWrapper should have the fl-inlineEdit-container class on focus", text.parent().hasClass(editor.options.styles.focus));
            });
            
            inlineEditTests.test("Remove container from tab order", function () {
                var editor = fluid.inlineEdit("#inline-edit");
                var text = editor.locate("text");
                jqUnit.assertEquals("The tab index of the container should be", "-1", text.attr("tabindex"));
            });
            
            inlineEditTests.test("Render keyboard instruction text", function () {
                var editor = fluid.inlineEdit("#inline-edit");
                var editContainer = $("#edit-container");
                var editField = editor.editField;
                var editModeInstruction = $("p", editContainer);
                
                jqUnit.assertTrue("The keyboard instruction text should have the fl-keyboard-tooltip class", editModeInstruction.hasClass(editor.options.styles.editModeInstruction));
                jqUnit.assertEquals("The keyboard instruction text descriptive text should be set", editor.options.strings.editModeInstruction, editModeInstruction.text());
                
                editor.edit();
                jqUnit.isVisible("While editing, keyboard instruction text is visible", editModeInstruction);
                jqUnit.assertEquals("The keyboard instruction text should be properly positioned directly underneath the edit field", editField.offset().left, editModeInstruction.offset().left);
            });
            
            var displayModeRendererNoTextEditButton = function (that) {
                var styles = that.options.styles;
                
                var displayModeWrapper = fluid.inlineEdit.setupDisplayModeContainer(styles);
                var displayModeRenderer = that.viewEl.wrap(displayModeWrapper).parent();
                
                // Add event handlers.
                fluid.inlineEdit.bindHoverHandlers(displayModeRenderer, styles.invitation);
                fluid.inlineEdit.bindMouseHandlers(that.viewEl, that.edit);
                fluid.inlineEdit.bindHighlightHandler(that.viewEl, displayModeRenderer, styles);
                
                return displayModeRenderer;                        
            };

            inlineEditTests.test("Missing textEditButton", function () {
                var editor = fluid.inlineEdit("#inline-edit", {
                    displayModeRenderer: displayModeRendererNoTextEditButton
                });
                var display = $("#display");
                var editContainer = $("#edit-container");
                var button = editor.textEditButton;
                
                jqUnit.assertUndefined("textEditButton is invisible ", button);
                
                display.focus();
                display.simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
                jqUnit.isVisible("Keyboard navigation no longer effective without the textEditButton:  display text still visible", display);
                
                display.click();
                jqUnit.isVisible("After mouse click, the edit container is visible", editContainer);
                jqUnit.notVisible("After mouse click, the display text is hidden", display);
            });
            
            inlineEditTests.test("Test individual public functions", function () {
                var editor = fluid.inlineEdit("#inline-edit");
                var styles = editor.options.styles;
                
                var displayModeContainer = fluid.inlineEdit.setupDisplayModeContainer(styles);
                jqUnit.assertTrue("Display mode renderer has fl-inlineEdit-displayView style", displayModeContainer.hasClass(styles.displayView));

                var editField = fluid.inlineEdit.setupEditField(styles.edit);
                jqUnit.assertTrue("Edit field has fl-inlineEdit-edit style", editField.hasClass(styles.edit));
                
                var editContainer = fluid.inlineEdit.setupEditContainer(displayModeContainer, editField);
                jqUnit.assertEquals("Edit container is created", 1, editContainer.length);
                
                var editModeInstruction = fluid.inlineEdit.setupEditModeInstruction(styles.editModeInstruction, editor.options.strings.editModeTooltip);
                jqUnit.assertTrue("Keyboard instruction has fl-inlineEdit-editModeInstruction style", editModeInstruction.hasClass(styles.editModeInstruction));
                
                var display = fluid.inlineEdit.setupDisplayText(editor); 
                jqUnit.assertEquals("Display text is removed from the tab order", -1, display.attr("tabindex"));
                
                var button = fluid.inlineEdit.setupTextEditButton(editor);     
                jqUnit.assertTrue("textEditButton has button role", "button", button.attr("role"));
            });            
        })();
    });
})(jQuery);
