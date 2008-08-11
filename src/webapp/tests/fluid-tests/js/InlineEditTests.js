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
    			add: 20,
    			minimum: 40
    		},
            finishedEditing: function () {
                fluid.finishedEditingCallbackCalled = true;
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
          }
          else {
            jqUnit.notVisible(name + " should not be visible", selector);
          }
        }
        
       function assertVisState(undo, redo, uv, rv) {
           assertVisibility(uv, "undo container", undo);
           assertVisibility(rv, "redo container", redo);
           }
    
     
        inlineEditTests.test("Minimal Construction", function () {
            jqUnit.expect(10);
    
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
            jqUnit.assertEquals("Paddings add is default", fluid.defaults("inlineEdit").paddings.add, inlineEditor.options.paddings.add);
            jqUnit.assertEquals("Paddings minimum is default", fluid.defaults("inlineEdit").paddings.minimum, inlineEditor.options.paddings.minimum);
            jqUnit.isVisible("Display field is visible", "#display");
            jqUnit.notVisible("Edit field is hidden", "#edit-container");
        });
    
        inlineEditTests.test("Customized Construction", function () {
            jqUnit.expect(10);
    
            var container = $("#inline-edit-custom");
            var display = $("#display-custom");
            var editContainer = $("#edit-container-custom");
            var editField = $("#edit-custom");
            var inlineEditor = fluid.inlineEdit("#inline-edit-custom", customOptions);
    
            jqUnit.assertEquals("Container is set to", container[0].id, inlineEditor.container[0].id);
            jqUnit.assertEquals("Text is set to", display[0].id, inlineEditor.viewEl[0].id);
            jqUnit.assertEquals("Edit container is set to", editContainer[0].id, inlineEditor.editContainer[0].id);
            jqUnit.assertEquals("Edit field is set to", editField[0].id, inlineEditor.editField[0].id);
            jqUnit.assertEquals("Focus style is custom", customOptions.styles.focus, inlineEditor.options.styles.focus);
            jqUnit.assertEquals("Invitation style is custom", customOptions.styles.invitation, inlineEditor.options.styles.invitation);
            jqUnit.assertEquals("Paddings add is set to", customOptions.paddings.add, inlineEditor.options.paddings.add);
            jqUnit.assertEquals("Paddings minimum is set to", customOptions.paddings.minimum, inlineEditor.options.paddings.minimum);
            jqUnit.isVisible("Display field is visible", "#display-custom");
            jqUnit.notVisible("Edit field is hidden", "#edit-container-custom");
        });
    
        inlineEditTests.test("Invitation text (Default)", function () {
            jqUnit.expect(8);
    
            var display = $("#empty-display");
            jqUnit.assertEquals("Before initialization of empty display, display is empty", "", display.text());
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit");
            jqUnit.assertEquals("After initialization of empty display, display has invitation text: ", fluid.defaults("inlineEdit").defaultViewText, display.text());
            jqUnit.assertTrue("Invitation text has invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewText));
    
            var testText = "This is test text.";
            var edit = $("#empty-inline-edit-edit");
            inlineEditor.edit();
            jqUnit.assertEquals("After switching into edit mode, edit field should be empty: ", "", edit.val());
            edit.attr("value", testText);
            inlineEditor.finish();
            jqUnit.assertEquals("After editing the field, display should have test text ", testText, display.text());
            jqUnit.assertFalse("Test text shouldn't have invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewText));
    
            inlineEditor.edit();
            edit.attr("value", "");
            inlineEditor.finish();
            jqUnit.assertEquals("After clearing the field, display should have invitation text again: ", fluid.defaults("inlineEdit").defaultViewText, display.text());
            jqUnit.assertTrue("Invitation text has invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewText));
    
        });
        
        inlineEditTests.test("Invitation text (custom)", function () {
            jqUnit.expect(2);
    
            var display = $("#empty-display");
            var customInvitation = "This is custom invitation text";
            jqUnit.assertEquals("Before initialization, display is empty", "", display.text());
    
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit", {defaultViewText: customInvitation});
            jqUnit.assertEquals("After initialization, display has custom invitation text.", customInvitation, display.text());
        });
        
        inlineEditTests.test("Invitation text (none)", function () {
            jqUnit.expect(10);
    
            var display = $("#empty-display");
            jqUnit.assertFalse("Before initialization, display is empty", display.text());
            var padding = display.css("padding");
            jqUnit.assertTrue("The display field has no padding.", !padding || padding === "0px");
    
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit", {defaultViewText: ""});
            jqUnit.assertEquals("After initialization, display is still empty", "", display.text());
            jqUnit.assertEquals("The display field padding is ", fluid.defaults("inlineEdit").paddings.minimumView, parseFloat(display.css("padding-right")));
    
            var testText = "This is test text that is a bit long.";
            var edit = $("#empty-inline-edit-edit");
            inlineEditor.edit();
            jqUnit.assertFalse("Upon entering edit mode, edit field should be fully empty", edit.attr("value"));
            edit.attr("value", testText);
            inlineEditor.finish();
            jqUnit.assertEquals("After editing the field, display should have test text ", testText, display.text());
            jqUnit.assertEquals("The display field has no padding.", 0, parseFloat(display.css("padding-right")));
    
            inlineEditor.edit();
            jqUnit.assertEquals("Upon entering edit mode but before clearing, edit field should be have test text", testText, edit.attr("value"));
            edit.attr("value", "");
            inlineEditor.finish();
            jqUnit.assertEquals("After clearing the field, display should be empty again: ", "", display.text());
            jqUnit.assertEquals("The display field padding is ", fluid.defaults("inlineEdit").paddings.minimumView, parseFloat(display.css("padding-right")));
        });
        
        inlineEditTests.test("Edit-Finish", function () {
            jqUnit.expect(8);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            
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
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            jqUnit.assertTrue("Display is tabbable", display.tabindex() >= 0);
            jqUnit.assertFalse("Initially display field is not focussed", display.hasClass(inlineEditor.options.styles.focus));
    
            display.focus();
            jqUnit.assertTrue("After focus, display is focussed", display.hasClass(inlineEditor.options.styles.focus));
    
            display.simulate("keydown", {keyCode: $.a11y.keys.ENTER});
                
            jqUnit.notVisible("After enter pressed, display field is hidden", "#display");
            jqUnit.isVisible("After enter pressed, edit field is visible", "#edit-container");
            jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.attr("value"));
    
            var testString = "This is new text.";
            edit.attr("value", testString);
            edit.simulate("keypress", {keyCode: $.a11y.keys.ENTER});
    
            jqUnit.isVisible("After changing text and pressing enter, display field is visible", "#display");
            jqUnit.assertTrue("After changing text and pressing enter, display has focus style", display.hasClass(inlineEditor.options.styles.focus));
            jqUnit.notVisible("After changing text and pressing enter, edit field is hidden", "#edit-container");
            jqUnit.assertEquals("After changing text and pressing enter, display field contains new text", testString, display.text());
    
            display.blur();
            jqUnit.assertFalse("After blur, display field is not focussed", display.hasClass(inlineEditor.options.styles.focus));
            
        });
        
        inlineEditTests.test("Hover", function () {
            jqUnit.expect(3);
    
            var display = $("#display");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            jqUnit.assertFalse("Initially, display field does not have the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
    
            display.trigger("mouseenter");
            jqUnit.assertTrue("During hover, display field has the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
    
            display.trigger("mouseleave");
            jqUnit.assertFalse("After hover, display field does not have the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
        });
        
        inlineEditTests.test("Click", function () {
            jqUnit.expect(5);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
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
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
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
            jqUnit.expect(4);
    
            var options = {
                finishedEditing: function (edit, text) {
                    jqUnit.assertEquals("The edit field should be passed along in the callback.", $("#edit")[0], edit);
                    jqUnit.assertEquals("The text view should also be passed along in the callback.", $("#display")[0], text);
                    fluid.finishedEditingCallbackCalled = true;
                }
            };
            var inlineEditor = fluid.inlineEdit("#inline-edit", options);
            jqUnit.assertFalse("Initially, callback has not been called", fluid.finishedEditingCallbackCalled);
            inlineEditor.finish();
            jqUnit.assertTrue("Callback was called", fluid.finishedEditingCallbackCalled);
        });
    
        inlineEditTests.test("Blur", function () {
            jqUnit.expect(4);
            
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            display.click();
            jqUnit.isVisible("Edit field is visible", "#edit-container");
            
            var testString = "This is new text.";
            edit.attr("value", testString);
            edit.blur();
            jqUnit.notVisible("After blur, edit field is hidden", "#edit-container");
            jqUnit.assertEquals("Blur saves the edit", testString, display.text());
            jqUnit.assertFalse("Blur saves the edit", edit.text() === display.text());
        });
        
        inlineEditTests.test("ARIA", function () {
            jqUnit.expect(2);

            var display = $("#display");
            jqUnit.assertFalse("Before initialization, display should have no role.", display.ariaRole());
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            jqUnit.assertEquals("After initialization, display role should be ", "button", display.ariaRole());
            
        });
        
        // Multiple Inline Editors tests
        (function () {
            var inlineEditsSel = "form.inlineEditable";
            var editor1Sels = {
                display: "#display",
                edit: "#edit-container"  
            };
            
            var editor2Sels = {
                display: "#display2",
                edit: "#edit-container2"
            };
           
            var instantiateInlineEdits = function (callback) {
                return fluid.inlineEdits("#main", {
                   selectors: {
                       editables: inlineEditsSel
                   },
                   
                   finishedEditing: callback
                });
            };
            
            inlineEditTests.test("inlineEdits(): instantiate more than one", function () {
               jqUnit.expect(1);
    
               var editors = instantiateInlineEdits();
               jqUnit.assertEquals("There should be two inline editors on the page.",
                                   2, editors.length);
            });
            
            inlineEditTests.test("inlineEdits(): call to edit affects only one at a time", function () {
                jqUnit.expect(8);
                
                var editors = instantiateInlineEdits();
                
                // First check that the displays are shown and the edits are hidden.
                jqUnit.isVisible("Initially, display field #1 is visible", editor1Sels.display);
                jqUnit.isVisible("Initially, display field #2 is visible", editor2Sels.display);
                jqUnit.notVisible("Initially, edit field #1 is hidden", editor1Sels.edit);
                jqUnit.notVisible("Initially, edit field #2 is hidden", editor2Sels.edit);
                
                editors[0].edit();
                
                jqUnit.notVisible("Display field #1 should be hidden", editor1Sels.display);
                jqUnit.isVisible("Edit field #1 should be visible", editor1Sels.edit);
                jqUnit.isVisible("Display field #2 should be visible", editor2Sels.display);
                jqUnit.notVisible("Edit field #2 should be hidden", editor2Sels.edit);
            });
            
            var toggleEditOnAndOff = function (editor) {
                editor.edit();
                editor.finish();
            };
            
            inlineEditTests.test("inlineEdits(): finished editing callback; one for all fields", function () {
                jqUnit.expect(5);
                
                var textFieldIds = [];
                var finishedCallback = function (formField) {
                    textFieldIds.push($(formField).attr("id"));    
                };
                
                var editors = instantiateInlineEdits(finishedCallback);
                
                // Sanity check
                jqUnit.assertUndefined("Initially, the callback should not have been called.", textFieldIds[0]);
    
                // Edit the first field.            
                toggleEditOnAndOff(editors[0]);
                jqUnit.assertTrue("After finishing, the callback should have been called only once.", 
                                  1, textFieldIds.length);
                jqUnit.assertEquals("After finishing, the callback should not have been with the first form field.", 
                                    "edit", textFieldIds[0]);
                
                // Edit the last field.  
                textFieldIds = [];          
                toggleEditOnAndOff(editors[1]);
                jqUnit.assertTrue("After finishing, the callback should have been called only once.", 
                                  1, textFieldIds.length);
                jqUnit.assertEquals("After finishing, the callback should not have been with the first form field.", 
                                    "edit2", textFieldIds[0]);
            });
        })();
        
        /**
         * Tests for self-rendering the edit mode.
         */
        (function () {
            var containerId = "inline-edit-self-render";
            var editContainerSel = "#inline-edit-self-render-edit-container";
            var editSel = "#inline-edit-self-render-edit";
            var textSel = "#display-self-render";
            
            var selfRenderingInlineEdit = function () {        
                // Fire off an inline edit against a container which does not contain an edit form.
                return fluid.inlineEdit(fluid.utils.jById(containerId));
            };
            
            inlineEditTests.test("Self-rendering edit mode: instantiation", function () {
                jqUnit.expect(4);
                
                var editor = selfRenderingInlineEdit();
                var editContainer = $(editContainerSel);
                // There should now be a hidden edit mode. Using the default edit injector,
                // we expect an edit container div and an inner textfield.
                jqUnit.assertNotUndefined("The self-rendered edit container should not be undefined.", editContainer);
                jqUnit.assertEquals("There should be one new element matching 'inline-edit-self-render-edit-container'",
                                   1, editContainer.length);
                                   
                var editField = $("input", editContainer);
                jqUnit.assertEquals("There should be one new text field within the edit container.", 
                                    1, editField.length);
                
                var expectedEditId = containerId + "-edit";
                jqUnit.assertEquals("The text field's id should match 'inline-edit-self-render-edit'",
                                    expectedEditId, editField.attr("id"));
            });
            
            var assertInViewMode = function () {
                jqUnit.isVisible("Initially, the view mode should be visible.", textSel);
                jqUnit.notVisible("Initially, the edit mode should be hidden.", editContainerSel);    
            };
            
            var assertInEditMode = function () {
                jqUnit.isVisible("During editing, the edit mode should be visible.", editContainerSel);
                jqUnit.notVisible("During editing, the view mode should be hidden.", textSel);    
            };
            
            inlineEditTests.test("Self-rendering edit mode: edit() and finish()", function () {
                jqUnit.expect(7);
                
                var editor = selfRenderingInlineEdit();
                assertInViewMode();
                
                editor.edit();
                assertInEditMode();
                
                jqUnit.assertEquals("The contents of the edit field should be the same as the view text.",
                                    $(textSel).text(), $(editSel).attr("value"));
                editor.finish();
                assertInViewMode();
            });
            
            
            function insistSingle(message, container, selector) {
              var togo = $(selector, container);
              jqUnit.assertEquals(message, 1, togo.length);
              return togo;
            }
            

           
            inlineEditTests.test("Self-rendering with undo control", function () {
                var initialValue = "Initial Value";
                var newValue = "New Value";
                jqUnit.expect(15);
                
                $("#display-undoable").text(initialValue);

                var editor = fluid.inlineEdit("#inline-edit-undo");
                var undoer = fluid.undoDecorator(editor);
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
                jqUnit.expect(15);
                $("#display-undoable").text(initialValue);
    
                var editor1 = fluid.inlineEdit("#inline-edit-undo");
                var undoer1 = fluid.undoDecorator(editor1);
                var undo1 = insistSelect("There should be an undo container", undoer1, "undoContainer"); // 1
                var redo1 = insistSelect("There should be a redo container", undoer1, "redoContainer"); // 2
                assertVisState(undo1, redo1, false, false); // 4
                
                $("#display-undoable2").text(initialValue);
                var editor2 = fluid.inlineEdit("#inline-edit-undo2");
                var undoer2 = fluid.undoDecorator(editor2);
                
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
            
            
        })();
     
    });
})(jQuery);
