/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of California, Berkeley

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
            expect(10);
    
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
            jqUnit.isVisible("Display field is visible", "#display");
            jqUnit.notVisible("Edit field is hidden", "#edit-container");
        });
    
        function testCustomized(useRenderer) {
    
          inlineEditTests.test("Customized Construction" + (useRenderer? " (via Renderer)" : ""), function () {
            expect(10);
            var root = $("#custom-renderRoot");
    
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
                var inlineEditor = decorator.that;
                container = $(decorator.container);
            }
            else {
                var inlineEditor = fluid.inlineEdit("#inline-edit-custom", customOptions);
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
              // Remove this conditional to verify impossibility of FLUID-890, and observe quite inconsistent behaviour on all browsers
              if (field[0].nodeName.toLowerCase() === "input") {
                  value = "Thing"; 
              }
              field.val(value);
              inlineEditor.editContainer.simulate("keypress", {keyCode: $.ui.keyCode.ENTER});
              jqUnit.assertEquals("Unsubmitted", shouldsubmit? value : "", inlineEditor.model.value);

              
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
                // Remove this conditional to verify impossibility of FLUID-890, and observe quite inconsistent behaviour on all browsers
                if (field[0].nodeName.toLowerCase() === "input") {
                    value = "Thing"; 
                }
                field.val(value);
                inlineEditor.editContainer.simulate("keypress", {keyCode: $.ui.keyCode.ENTER});
                jqUnit.assertEquals("Unsubmitted", shouldsubmit? value : "Click here to edit", inlineEditor.model.value);
                
                inlineEditor.finish();
                jqUnit.assertEquals("Unsubmitted", value, inlineEditor.model.value);
            });
        }
        
        makeSubmittingTest2("Default Textarea autosubmit auto", "#inline-edit-textarea-text-as-default", null, false);
        makeSubmittingTest2("Default Textarea autosubmit ensure", "#inline-edit-textarea-text-as-default", {submitOnEnter: true}, true);
        makeSubmittingTest2("Default Input autosubmit auto", "#inline-edit-custom-text-as-default", null, true);
        makeSubmittingTest2("Default Input autosubmit defeat", "#inline-edit-custom-text-as-default", {submitOnEnter: false}, false);

        inlineEditTests.test("Invitation text (Default)", function () {
            expect(10);
    
            var display = $("#empty-display");
            jqUnit.assertEquals("Before initialization of empty display, display is empty", "", display.text());
            var inlineEditor = fluid.inlineEdit("#empty-inline-edit");
            jqUnit.assertEquals("After initialization of empty display, display has invitation text: ", fluid.defaults("inlineEdit").defaultViewText, display.text());
            jqUnit.assertTrue("Invitation text has invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewStyle));
            jqUnit.assertTrue("Invitation text still contains it's initial class attribute as well", display.hasClass("flc-inlineEdit-text")); // added for FLUID-1803
    
            var testText = "This is test text.";
            var edit = $("#empty-inline-edit-edit");
            inlineEditor.edit();
            jqUnit.assertEquals("After switching into edit mode, edit field should be empty: ", "", edit.val());
            edit.attr("value", testText);
            inlineEditor.finish();
            jqUnit.assertEquals("After editing the field, display should have test text ", testText, display.text());
            jqUnit.assertFalse("Test text shouldn't have invitation text style", display.hasClass(inlineEditor.options.styles.defaultViewStyle));
    
            inlineEditor.edit();
            edit.attr("value", "");
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
            expect(8);
    
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
            expect(11);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
            jqUnit.assertTrue("Display is tabbable", fluid.tabindex(display) >= 0);
            jqUnit.assertFalse("Initially display field is not focussed", display.hasClass(inlineEditor.options.styles.focus));
    
            display.focus();
            jqUnit.assertTrue("After focus, display is focussed", display.hasClass(inlineEditor.options.styles.focus));
    
            display.simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
                
            jqUnit.notVisible("After enter pressed, display field is hidden", "#display");
            jqUnit.isVisible("After enter pressed, edit field is visible", "#edit-container");
            jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.attr("value"));
    
            var testString = "This is new text.";
            edit.attr("value", testString);
            edit.simulate("keypress", {keyCode: $.ui.keyCode.ENTER});
    
            jqUnit.isVisible("After changing text and pressing enter, display field is visible", "#display");
            jqUnit.assertTrue("After changing text and pressing enter, display has focus style", display.hasClass(inlineEditor.options.styles.focus));
            jqUnit.notVisible("After changing text and pressing enter, edit field is hidden", "#edit-container");
            jqUnit.assertEquals("After changing text and pressing enter, display field contains new text", testString, display.text());
    
            display.blur();
            jqUnit.assertFalse("After blur, display field is not focussed", display.hasClass(inlineEditor.options.styles.focus));
            
        });
        
        inlineEditTests.test("Hover", function () {
            expect(3);
    
            var display = $("#display");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            jqUnit.assertFalse("Initially, display field does not have the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
    
            display.trigger("mouseenter");
            jqUnit.assertTrue("During hover, display field has the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
    
            display.trigger("mouseleave");
            jqUnit.assertFalse("After hover, display field does not have the invitation style", display.hasClass(inlineEditor.options.styles.invitation));
        });
        
        inlineEditTests.test("Click", function () {
            expect(5);
    
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
            expect(5);
    
            var display = $("#display");
            var edit = $("#edit");
            var inlineEditor = fluid.inlineEdit("#inline-edit");
    
            display.focus();
            display.simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
            jqUnit.notVisible("After enter pressed, display field is hidden", "#display");
            jqUnit.isVisible("After enter pressed, edit field is visible", "#edit-container");
            jqUnit.assertEquals("After enter pressed, edit field contains same text as display field", display.text(), edit.attr("value"));
    
            // note: this simulate works in FFX, but not IE7
            edit.simulate("keypress", {keyCode: $.ui.keyCode.LEFT});
            jqUnit.notVisible("After left-arrow pressed, display field is still hidden", "#display");
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
            
            var testString = "This is new text.";
            edit.attr("value", testString);
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
            jqUnit.assertEquals("After initialization, display role should be ", "button", display.attr("role"));
			
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
               jqUnit.assertEquals("There should be two inline editors on the page.",
                                   2, editors.length);
            });
            
            inlineEditTests.test("inlineEdits(): call to edit affects only one at a time", function () {
                expect(8);
                
                var editors = instantiateInlineEdits();
                
                // First check that the displays are shown and the edits are hidden.
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
                    textFieldIds.push($(formField).attr("id"));    
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
                return fluid.inlineEdit(fluid.jById(containerId));
            };
            
            inlineEditTests.test("Self-rendering edit mode: instantiation", function () {
                expect(4);
                
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
                expect(7);
                
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
                var editor = fluid.inlineEdit("#inline-edit-undo", 
                    {componentDecorators: "fluid.undoDecorator",
                     listeners: {
                       modelChanged: function() { ++ changeCount; }
                       }});
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
            
            inlineEditTests.test("Self-container", function() {
                var editor = fluid.inlineEdit("#inline-edit2");
                var edit = $("#inline-edit2 .flc-inlineEdit-edit")[0];
                jqUnit.assertEquals("Container is field", edit, editor.editContainer[0]);
                jqUnit.assertEquals("Container is field", edit, editor.editField[0]);
            });
            
            
        })();
     
    });
})(jQuery);
