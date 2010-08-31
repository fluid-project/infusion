/*
Copyright 2008-2009 University of Cambridge
Copyright 2007-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function($) {
    $(document).ready(function() {
        var lightboxTests = new jqUnit.TestCase("Lightbox Tests");
    
        function findImagesInLightbox() {
            return jQuery("img", fetchLightboxRoot());
        }
    
        function assertItemsInOriginalPosition(desc) {
            return fluid.testUtils.reorderer.assertItemsInOriginalPosition(desc, 
               findImagesInLightbox(), imageIds);
        }
            
        function assertItemsInOrder(message, assertItemsInOrder) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, assertItemsInOrder, 
               findImagesInLightbox(), "fluid.img.");
        }
       
        function assertItemDefault(message, index) {
            return fluid.testUtils.reorderer.assertItemDefault(message, index, orderableIds);
        }
        
        function assertItemFocused(message, index) {
            return fluid.testUtils.reorderer.assertItemFocused(message, index, orderableIds);
        }
        
        function assertItemDragged(message, index) {
            return fluid.testUtils.reorderer.assertItemDragged(message, index, orderableIds);
        }
        
        function compositeKey(reorderer, event, targetIndex) {
           return fluid.testUtils.reorderer.compositeKey(reorderer, event, 
               fluid.byId(orderableIds[targetIndex]));
        }
        
        function keyDown(reorderer, event, targetIndex) {
           return fluid.testUtils.reorderer.keyDown(reorderer, event, 
               fluid.byId(orderableIds[targetIndex]));
        }
        
        function keyUp(reorderer, event, targetIndex) {
           return fluid.testUtils.reorderer.keyUp(reorderer, event, 
               fluid.byId(orderableIds[targetIndex]));
        }
          
        function verticalNavigationTest(lightbox, upEvt, downEvt) {
            // setup: force the grid to have four columns
            var lightboxRoot = fluid.jById(lightboxRootId);
            
            lightboxRoot.removeClass("width-3-thumb");
            lightboxRoot.addClass("width-4-thumb");
            
            focusLightbox();
            
            assertItemFocused("Initially ", 0);
        
            // the test framework doesn't seem to properly focus, so we force the issue
            fluid.byId(orderableIds[0]).focus();
        
            // Test: down arrow to the fifth image
            keyDown(lightbox, downEvt, 0);
            assertItemDefault("After down arrow ", 0);
            assertItemFocused("After down arrow ", 4);
        
            // Test: up arrow to the first image
            keyDown(lightbox, upEvt, 4);
            assertItemFocused("After up arrow ", 0);
            assertItemDefault("After up arrow ", 4);
        
            // Test: up arrow to the second last image
            keyDown(lightbox, upEvt, 0);
            assertItemDefault("After up arrow wrap ", 0);
            assertItemFocused("After up arrow wrap ", 12);
        
            // Test: down arrow to the first image
            keyDown(lightbox, downEvt, 12);
            assertItemFocused("After down arrow wrap ", 0);
            assertItemDefault("After down arrow wrap ", 12);
            
            // Tests for FLUID-1589
            var box2 = fluid.jById(orderableIds[2]).focus()
            keyDown(lightbox, upEvt, 2);
            assertItemFocused("After up arrow wrap irregular ", 10);
            assertItemDefault("After up arrow wrap irregular ", 2);
            
            keyDown(lightbox, downEvt, 10);
            assertItemFocused("After up arrow wrap irregular ", 2);
            assertItemDefault("After up arrow wrap irregular ", 10);
        }
        
        function horizontalNavigationTest(lightbox, rightEvt, leftEvt) {
            focusLightbox();        
        
            assertItemFocused("Initially ", 0);
            assertItemDefault("Initially ", 1);
        
            // the test framework doesn't seem to properly focus, so we force the issue
            fluid.byId(orderableIds[0]).focus();
        
            // Test: right arrow to the second image
            keyDown(lightbox, rightEvt, 0);
            assertItemFocused("After right ", 1);
            assertItemDefault("After right ", 0);
        
            // Test: right arrow to the last image
            for (focusPosition = 2; focusPosition < numOfImages; focusPosition++ ) {
                keyDown(lightbox, rightEvt, focusPosition - 1);
            }
            assertItemFocused("Right to last ", 13);
            assertItemDefault("Right to last ", 0);
            assertItemDefault("Right to last ", 1);
            
            // Test: left arrow to the previous image
            keyDown(lightbox, leftEvt, 13);
            assertItemFocused("Left to second last ", 12);
            assertItemDefault("Left to second last ", 0);
            assertItemDefault("Left to second last ", 1);
            
            // Test: right arrow past the last image - expect wrap to the first image
            keyDown(lightbox, rightEvt, 12);
            keyDown(lightbox, rightEvt, 13);
            assertItemFocused("Right wrap ", 0);
            assertItemDefault("Right wrap ", 1);
            assertItemDefault("Right wrap ", 13);
        
            // Test: left arrow on the first image - expect wrap to the last image
            keyDown(lightbox, leftEvt, 0);
            assertItemFocused("Left wrap ", 13);
            assertItemDefault("Left wrap ", 0);
            assertItemDefault("Left wrap ", 1);
        }
        
        function verticalMovementTest(lightbox, modifiedUpEvt, modifiedDownEvt) {
            // Default width is 3 thumbnails.
            focusLightbox();
            compositeKey(lightbox, modifiedDownEvt, 0);
            assertItemsInOrder("after modified-down", [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    
            compositeKey(lightbox, modifiedUpEvt, 0);
            assertItemsInOriginalPosition("after modified-up");        
        }
        
        function horizontalMovementTest(lightbox, modifiedRightEvt, modifiedLeftEvt) {
            focusLightbox();
            
            // Test: ctrl right arrow - expect first and second image to swap
            compositeKey(lightbox, modifiedRightEvt, 0);
            assertItemsInOrder("after modified-right", [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

            // Test: ctrl left arrow - expect first and second image to swap back to original order
            compositeKey(lightbox, modifiedLeftEvt, 0);
            assertItemsInOriginalPosition("after modified-left");
        
            // Test: ctrl left arrow - expect first image to move to last place,
            //       second image to move to first place and last image to move to second-last place
            compositeKey(lightbox, modifiedLeftEvt, 0);
            assertItemsInOrder("after modified-right", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0]);

            // Test: ctrl right arrow - expect first image to move back to first place,
            //       second image to move to back second place and thumbLast to move to back last place
            compositeKey(lightbox, modifiedRightEvt, 0);
            assertItemsInOriginalPosition("after modified-right");
        }
        
        /*
         * This test tests the movement of images, and does not concern itself
         * with changes of state(i.e. dragging, etc.)
         */
        lightboxTests.test("HandleArrowKeyDownMoveThumbDown", function() {
            var lightbox = createLightbox();
            focusLightbox();
            // Test: ctrl down arrow - move the first image down
            compositeKey(lightbox, fluid.testUtils.ctrlKeyEvent("DOWN"), 0);
            assertItemsInOrder("after ctrl-down-arrow", [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        });
         
        lightboxTests.test("HandleArrowKeyDownWrapThumbUp", function() {
            // Test: ctrl up arrow - move the first image 'up'
            var lightbox = createLightbox();
            focusLightbox();
        
            compositeKey(lightbox, fluid.testUtils.ctrlKeyEvent("UP"), 0);
            assertItemsInOrder("after ctrl-up-arrow", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 13]);
        });
        
        lightboxTests.test("HandleArrowKeyDownForUpAndDown", function() {
            var lightbox = createLightbox();
            verticalNavigationTest(lightbox, fluid.testUtils.keyEvent("UP"), fluid.testUtils.keyEvent("DOWN"));
        });
        
        lightboxTests.test("HandleArrowKeyDownForLeftAndRight", function() {
            var lightbox = createLightbox();
        
            horizontalNavigationTest(lightbox, fluid.testUtils.keyEvent("RIGHT"), fluid.testUtils.keyEvent("LEFT"));
        });
        
        lightboxTests.test("HandleKeyUpAndHandleKeyDownChangesState", function() {
            var lightbox = createLightbox();
            focusLightbox();
        
            // check that none of the images are currently being moved.
            assertItemFocused("Initially ", 0);
            assertItemDefault("Initially ", 1);
            assertItemDefault("Initially ", 12);
            
            // ctrl down - expect dragging state to start
            keyDown(lightbox, fluid.testUtils.ctrlKeyEvent("CTRL"), 0);
            assertItemDragged("After ctrl-down, ", 0);
            assertItemDefault("After ctrl-down, ", 1);
            assertItemDefault("After ctrl-down, ", 12);
            jqUnit.assertEquals("After ctrl-down, " + orderableIds[1] + " should have ARIA dropeffect of 'move'", "move",
                fluid.jById(orderableIds[1]).attr("aria-dropeffect"));  
            jqUnit.assertEquals("After ctrl-down, " + orderableIds[12] + " should have ARIA dropeffect of 'move'", "move",
                fluid.jById(orderableIds[12]).attr("aria-dropeffect"));  
                
            // right arrow down - all the dragging states should remain the same
            //fluid.log("keyDown");
            keyDown(lightbox, fluid.testUtils.ctrlKeyEvent("RIGHT"), 0);
            //fluid.log("keyDown complete: " + fluid.dumpEl(lightbox.activeItem));
            assertItemDragged("After ctrl-down right arrow down, ", 0);
            assertItemDefault("After ctrl-down right arrow down, ", 1);
            assertItemDefault("After ctrl-down right arrow down, ", 12);
            
            //fluid.log("keyUp 1");
            //fluid.log("before KeyUp: " + fluid.dumpEl(lightbox.activeItem));
            // right arrow with key-up event handler. The dragging states should remain the same.
            keyUp(lightbox, fluid.testUtils.ctrlKeyEvent("RIGHT"), 0);
            assertItemDragged("After ctrl-down right arrow up, ", 0);
            assertItemDefault("After ctrl-down right arrow up, ", 1);
            assertItemDefault("After ctrl-down right arrow up, ", 12);
        
            // ctrl up - expect dragging to end
            //fluid.log("keyUp 2");
            keyUp(lightbox, fluid.testUtils.keyEvent("CTRL"), 0);
            assertItemFocused("After ctrl-up ", 0);
            assertItemDefault("After ctrl-up ", 1);
            assertItemDefault("After ctrl-up ", 12);
            jqUnit.assertEquals("After ctrl-up, " + orderableIds[1] + " should have ARIA dropeffect of 'none'", "none",
                fluid.jById(orderableIds[1]).attr("aria-dropeffect"));  
            jqUnit.assertEquals("After ctrl-up, " + orderableIds[12] + " should have ARIA dropeffect of 'none'", "none",
                fluid.jById(orderableIds[12]).attr("aria-dropeffect"));  
        });
        
        lightboxTests.test("HandleKeyUpAndHandleKeyDownItemMovement", function() {
            var lightbox = createLightbox();
            focusLightbox();
        
            // after ctrl down, order should not change
            keyDown(lightbox, fluid.testUtils.keyEvent("CTRL"), 0);
            assertItemsInOriginalPosition("after ctrl-down");
            
            // after ctrl up, order should not change
            keyUp(lightbox, fluid.testUtils.keyEvent("CTRL"), 0);
            assertItemsInOriginalPosition("after ctrl-up");
        });
        
        /*
         * This test tests the movement of images, and does not concern itself
         * with changes of state(i.e. dragging, etc.)
         */
        lightboxTests.test("HandleArrowCtrlArrowKeyDown", function() {  
            var lightbox = createLightbox();
            horizontalMovementTest(lightbox,  fluid.testUtils.ctrlKeyEvent("RIGHT"), 
                                              fluid.testUtils.ctrlKeyEvent("LEFT"));
                                    
            verticalMovementTest(lightbox,    fluid.testUtils.ctrlKeyEvent("UP"), 
                                              fluid.testUtils.ctrlKeyEvent("DOWN"));
        });
        
        lightboxTests.test("PersistFocus ", function() {
            var lbRoot = fetchLightboxRoot();
            var lightbox = createLightbox();
            // Create an input that we can move focus to during the test
            var newInputElement = document.createElement("input");
            newInputElement.id="input1";
            
            jQuery("[id=para1]").after(newInputElement);
            
            assertItemDefault("Initially ", 0);
        
            // Focus the lightbox and make sure the first thumb nail is selected
            lbRoot.focus();
            assertItemFocused("When lightbox has focus ", 0);
            assertItemDefault("When lightbox has focus ", 1);
            
            // Calling blur because the test framework doesn't behave like the browsers do. 
            // The browsers will call blur when something else gets focus.
            fluid.jById(orderableIds[0]).blur();
        
            // Change focus to the input1, then back to the lightbox
            newInputElement.focus();
            assertItemDefault("After focus leaves the lightbox ", 0);
            
            // Change focus to the lightbox and check that the first thumb nail is still movable.
            lbRoot.focus();
            assertItemFocused("When lightbox has focus again ", 0);
            assertItemDefault("When lightbox has focus again ", 1);
            
            fluid.jById(orderableIds[0]).blur();
        
            // set focus to another image.
            fluid.jById(orderableIds[1]).focus();
            assertItemFocused("Changed focus to second ", 1);
            assertItemDefault("Changed focus to second ", 0);
            
            // Change focus to the input1
            newInputElement.focus();
            fluid.jById(orderableIds[1]).blur();
    
            assertItemDefault("Lightbox blur with second selected ", 1);
        
            // Focus the lightbox and check that the second thumb nail is still movable
            lbRoot.focus();
            assertItemFocused("Lightbox refocused with second selected ", 1);
            assertItemDefault("Lightbox refocused with second selected ", 0);
        });
        
        lightboxTests.test("ItemFocusBlur ", function() {
            var lightbox = createLightbox();
            var testItem = fluid.jById(orderableIds[0]);
            
            assertItemDefault("Before test item gets focus, it should be in default state", 0);
            
            testItem.focus();    
            assertItemFocused("After test item gets focus, it should be in selected state", 0);
        
            testItem.blur();    
            assertItemDefault("After test item gets blur, it should be in default state", 0);
        });
        
        lightboxTests.test("LightboxFocussed", function() {
            var lightbox = createLightbox();
        
            assertItemDefault("Initially ", 0);
            focusLightbox();
            assertItemFocused("After select active item ", 0);
            
            // Now, test it with no reorderables.
            var lightboxWithNoOrderables = createLightboxWithNoOrderables();
            focusLightbox();
            jqUnit.assertUndefined("Lightbox's activeItem should not be set ", lightboxWithNoOrderables.activeItem);
        });
        
        lightboxTests.test("KeypressesWithNoOrderables", function() {
            var lightboxWithNoOrderables = createLightboxWithNoOrderables();
            
            focusLightbox();
            jqUnit.assertUndefined("Lightbox's activeItem member should not be set", lightboxWithNoOrderables.activeItem);
                
            // Test left arrow, right arrow, etc. with and without control key.
            compositeKey(lightboxWithNoOrderables, fluid.testUtils.ctrlKeyEvent("LEFT"), 0); 
            jqUnit.assertUndefined("After ctrl-left, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            compositeKey(lightboxWithNoOrderables, fluid.testUtils.ctrlKeyEvent("RIGHT"), 0); 
            jqUnit.assertUndefined("After ctrl-right, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            compositeKey(lightboxWithNoOrderables, fluid.testUtils.ctrlKeyEvent("UP"), 0);
            jqUnit.assertUndefined("After ctrl-up, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            compositeKey(lightboxWithNoOrderables, fluid.testUtils.ctrlKeyEvent("DOWN"), 0);
            jqUnit.assertUndefined("After ctrl-down, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
        
            keyDown(lightboxWithNoOrderables, fluid.testUtils.keyEvent("LEFT"), 0); 
            jqUnit.assertUndefined("After left, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyDown(lightboxWithNoOrderables, fluid.testUtils.keyEvent("RIGHT"), 0); 
            jqUnit.assertUndefined("After right, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyDown(lightboxWithNoOrderables, fluid.testUtils.keyEvent("UP"), 0);
            jqUnit.assertUndefined("After up, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);   
            keyDown(lightboxWithNoOrderables, fluid.testUtils.keyEvent("DOWN"), 0);
            jqUnit.assertUndefined("After down, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            
            keyDown(lightboxWithNoOrderables, fluid.testUtils.keyEvent("CTRL"), 0);
            jqUnit.assertUndefined("After ctrl pressed, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyUp(lightboxWithNoOrderables, fluid.testUtils.keyEvent("CTRL"), 0);
            jqUnit.assertUndefined("After key released, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
        });
        
        lightboxTests.test("UpdateAriaStates", function() {
            var lightbox = createLightbox();
            var lbRoot = fetchLightboxRoot();
            var firstImage = fluid.jById(orderableIds[0]);
            jqUnit.assertEquals("before first lightbox focus, first item should not be selected", "false", firstImage.attr("aria-selected"));
        
            focusLightbox();
            jqUnit.assertEquals("after first lightbox focus, first image should be selected", "true", firstImage.attr("aria-selected"));
            
            var thirdImage = fluid.jById(orderableIds[2]);
            thirdImage.focus();
            jqUnit.assertEquals("after setting active item to third image, first image should not be selected", "false", firstImage.attr("aria-selected"));
            jqUnit.assertEquals("after setting active item to third image, third image should be selected", "true", thirdImage.attr("aria-selected"));
        
            var newInputElement = document.createElement("input");
            newInputElement.id="input1";
            
            jQuery("[id=para1]").after(newInputElement);
            jQuery("[id=input1]").get(0).focus();
            fluid.jById(orderableIds[2]).blur();
            jqUnit.assertEquals("after removing focus from lightbox, third image should not be selected", "false", thirdImage.attr("aria-selected"));
        });
        
        lightboxTests.test("UpdateGrabProperty", function() {
            var lightbox = createLightbox();
            var lbRoot = fetchLightboxRoot();
            var testItem = fluid.jById(orderableIds[0]);
            
            jqUnit.assertEquals("before any action, test item should have @aria-grabbed='false'", "false", testItem.attr("aria-grabbed"));
            
            focusLightbox();
            keyDown(lightbox, fluid.testUtils.ctrlKeyEvent("CTRL"), 0);
            jqUnit.assertEquals("while CTRL held down, test item should have @aria-grabbed='true'", "true", testItem.attr("aria-grabbed"));
        
            keyDown(lightbox, fluid.testUtils.ctrlKeyEvent("RIGHT"), 0);
            jqUnit.assertEquals("after arrow while CTRL still held down, test item should have @aria-grabbed='true'", "true", testItem.attr("aria-grabbed"));
            
            keyUp(lightbox, fluid.testUtils.keyEvent("CTRL"), 0);
            jqUnit.assertEquals("after CTRL released, test item should have @aria-grabbed='false", "false", testItem.attr("aria-grabbed"));
        });
    
        lightboxTests.test("AlternativeKeySetDefaultKeysDontWork", function() {
            var lightbox = createAltKeystrokeLightbox();
            focusLightbox();
            
            // Test arrow keys
            keyDown(lightbox, fluid.testUtils.keyEvent("RIGHT"), 0);
            assertItemFocused("After right arrow ", 0);
            assertItemDefault("After right arrow ", 1);
    
            keyDown(lightbox, fluid.testUtils.keyEvent("LEFT"), 0);
            assertItemFocused("After left arrow ", 0);
            assertItemDefault("After left arrow ", 13);
    
            keyDown(lightbox, fluid.testUtils.keyEvent("UP"), 0);
            assertItemFocused("After up arrow ", 0);
            assertItemDefault("After up arrow ", 12);
    
            keyDown(lightbox, fluid.testUtils.keyEvent("DOWN"), 0);
            assertItemFocused("After down arrow ", 0);
            assertItemDefault("After down arrow ", 3);
             
            // Test CTRL
            keyDown(lightbox, fluid.testUtils.ctrlKeyEvent("CTRL"), 0);
            assertItemFocused("After ctrl-down, ", 0);
            keyUp(lightbox, fluid.testUtils.keyEvent("CTRL"), 0);
            assertItemFocused("After ctrl-up, ", 0);
    
            // Test CTRL arrow keys  
            compositeKey(lightbox, fluid.testUtils.ctrlKeyEvent("RIGHT"), 0);
            assertItemsInOriginalPosition("After ctrl right arrow");
    
            compositeKey(lightbox, fluid.testUtils.ctrlKeyEvent("LEFT"), 0);
            assertItemsInOriginalPosition("After ctrl left arrow");
    
            compositeKey(lightbox, fluid.testUtils.ctrlKeyEvent("UP"), 0);
            assertItemsInOriginalPosition("After ctrl up arrow");
    
            compositeKey(lightbox, fluid.testUtils.ctrlKeyEvent("DOWN"), 0);
            assertItemsInOriginalPosition("After ctrl down arrow");
            
        });    
    
        lightboxTests.test("AlternativeKeySetNavigation", function() {
            var lightbox = createAltKeystrokeLightbox();
            focusLightbox();
            
            horizontalNavigationTest(lightbox, fluid.testUtils.keyEvent("k"), fluid.testUtils.keyEvent("j"));
                                    
            fluid.jById(orderableIds[0]).focus();
            verticalNavigationTest(lightbox, fluid.testUtils.keyEvent("i"), fluid.testUtils.keyEvent("m"));
           });
           
        lightboxTests.test("AlternativeKeySetMovement", function() {
            var lightbox = createAltKeystrokeLightbox();
            focusLightbox();
            
            horizontalMovementTest(lightbox, fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "k"),
                                             fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "j"));
            fluid.jById(orderableIds[0]).focus();
            verticalMovementTest(lightbox,   fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "i"),
                                             fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "m"));
           });
     
        lightboxTests.test("MultiKeySetNavigation", function() {
            var lightbox = createMultiKeystrokeLightbox();
            focusLightbox();
            
            horizontalNavigationTest(lightbox, fluid.testUtils.keyEvent("k"), fluid.testUtils.keyEvent("j"));
    
            fluid.jById(orderableIds[0]).focus();
            horizontalNavigationTest(lightbox, fluid.testUtils.keyEvent("RIGHT"), fluid.testUtils.keyEvent("LEFT"));
                                    
            fluid.jById(orderableIds[0]).focus();
            verticalNavigationTest(lightbox, fluid.testUtils.keyEvent("i"), fluid.testUtils.keyEvent("m"));
    
            fluid.jById(orderableIds[0]).focus();
            verticalNavigationTest(lightbox, fluid.testUtils.keyEvent("UP"), fluid.testUtils.keyEvent("DOWN"));
    
           });
           
        lightboxTests.test("MultiKeySetMovement", function() {
            var lightbox = createMultiKeystrokeLightbox();
            focusLightbox();
            
            horizontalMovementTest(lightbox, fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "k"), 
                                             fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "j"));
    
            fluid.jById(orderableIds[0]).focus();
            horizontalMovementTest(lightbox, fluid.testUtils.modKeyEvent("ALT", "RIGHT"),
                                             fluid.testUtils.modKeyEvent("ALT", "LEFT"));
    
            fluid.jById(orderableIds[0]).focus();
            verticalMovementTest(lightbox,   fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "i"), 
                                             fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "m"));
    
            fluid.jById(orderableIds[0]).focus();
            verticalMovementTest(lightbox,   fluid.testUtils.modKeyEvent("ALT", "UP"),
                                             fluid.testUtils.modKeyEvent("ALT", "DOWN"));
        });
    
        lightboxTests.test("MultiKeySetWrongModifier", function() {
            var lightbox = createMultiKeystrokeLightbox();
            focusLightbox();
            
            // Test: alt k - expect no movement
            compositeKey(lightbox, fluid.testUtils.modKeyEvent("ALT", "k"), 0);
            assertItemsInOriginalPosition("after alt-k");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);
        
            // Test: alt m - expect no movement
            compositeKey(lightbox, fluid.testUtils.modKeyEvent("ALT", "m"), 0);
            assertItemsInOriginalPosition("after alt-m");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);
    
            // Test: ctrl shift left arrow - expect no movement
            compositeKey(lightbox, fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "LEFT"), 0);
            assertItemsInOriginalPosition("after ctrl shift left arrow");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);
    
            // Test: ctrl shift up arrow - expect no movement
            compositeKey(lightbox, fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "UP"), 0);
            assertItemsInOriginalPosition("after ctrl shift up arrow");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);
    
        });   
        
        lightboxTests.test("MultiKeySetOverlappingModifierMovement", function() {
            var lightbox = createMultiOverlappingKeystrokeLightbox();
            focusLightbox();
            
            horizontalMovementTest(lightbox, fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "k"), 
                                             fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "j"));
    
            fluid.jById(orderableIds[0]).focus();
            horizontalMovementTest(lightbox, fluid.testUtils.ctrlKeyEvent("RIGHT"),
                                             fluid.testUtils.ctrlKeyEvent("LEFT"));
    
            fluid.jById(orderableIds[0]).focus();
            verticalMovementTest(lightbox,   fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "i"), 
                                             fluid.testUtils.modKeyEvent(["CTRL", "SHIFT"], "m"));
    
            fluid.jById(orderableIds[0]).focus();
            verticalMovementTest(lightbox, fluid.testUtils.ctrlKeyEvent("UP"),
                                           fluid.testUtils.ctrlKeyEvent("DOWN"));
        });
    
    });
})(jQuery);
