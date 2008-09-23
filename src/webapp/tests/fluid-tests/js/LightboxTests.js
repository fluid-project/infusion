/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License(ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function($) {
    $(document).ready(function() {
        var lightboxTests = new jqUnit.TestCase("Lightbox Tests", setUp, tearDown);
    
        function assertItemsInOriginalPosition(desc) {
            var thumbArray = findImagesInLightbox();
            var thumbIds = fluid.transform(thumbArray, fluid.getId);
            jqUnit.assertDeepEq(desc + " expect items in original order", imageIds, thumbIds);
            }
            
        function assertItemsInOrder(message, expectOrder) {
            var thumbArray = findImagesInLightbox();
            var thumbIds = fluid.transform(thumbArray, fluid.getId);
            var expectIds = makeImageIds(expectOrder);
            jqUnit.assertDeepEq(message, expectIds, thumbIds);
        }
        
        function assertItemDefault(message, index) {
            var itemId = orderableIds[index];
            var item = fluid.jById(itemId);
            
            jqUnit.assertTrue(message + itemId + " should be default", item.hasClass(defaultClass));
            jqUnit.assertFalse(message + itemId + " should not be selected", item.hasClass(selectedClass));
            jqUnit.assertFalse(message + itemId + " should not be dragging", item.hasClass(draggingClass));
        }
        
        function assertItemFocused(message, index) {
            var itemId = orderableIds[index];
            var item = fluid.jById(itemId);
            
            jqUnit.assertTrue(message + itemId + " should be selected", item.hasClass(selectedClass));   
            jqUnit.assertFalse(message + itemId + " should not be default", item.hasClass(defaultClass));
            jqUnit.assertFalse(message + itemId + " should not be dragging", item.hasClass(draggingClass));
        }
        
        function assertItemDragged(message, index) {
            var itemId = orderableIds[index];
            var item = fluid.jById(itemId);
            
            jqUnit.assertTrue(message + itemId + " should be dragging", item.hasClass(draggingClass));  
            jqUnit.assertFalse(message + itemId + " should not be default",item.hasClass(defaultClass));
        }
        
        function ctrlKeyDown(lightbox, event, targetIndex) {
            keyDown(lightbox, fluid.testUtils.ctrlKeyEvent("CTRL"), targetIndex);
            keyDown(lightbox, event, targetIndex);
        }        
        
        function keyDown(lightbox, event, targetIndex) {
            event.target = fluid.byId(orderableIds[targetIndex]);
            lightbox.handleKeyDown(event);
        }
        
        function keyUp(lightbox, event, targetIndex) {
            event.target = fluid.byId(orderableIds[targetIndex]);
            lightbox.handleKeyUp(event);
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
            assertItemDefault("Left to second last ", 0);
            
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
            ctrlKeyDown(lightbox, modifiedDownEvt, 0);
            assertItemsInOrder("after modified-down", [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    
            ctrlKeyDown(lightbox, modifiedUpEvt, 0);
            assertItemsInOriginalPosition("after modified-up");        
        }
        
        function horizontalMovementTest(lightbox, modifiedRightEvt, modifiedLeftEvt) {
            focusLightbox();
            
            // Test: ctrl right arrow - expect first and second image to swap
            ctrlKeyDown(lightbox, modifiedRightEvt, 0);
            assertItemsInOrder("after modified-right", [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

            // Test: ctrl left arrow - expect first and second image to swap back to original order
            ctrlKeyDown(lightbox, modifiedLeftEvt, 0);
            assertItemsInOriginalPosition("after modified-left");
        
            // Test: ctrl left arrow - expect first image to move to last place,
            //       second image to move to first place and last image to move to second-last place
            ctrlKeyDown(lightbox, modifiedLeftEvt, 0);
            assertItemsInOrder("after modified-right", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0]);

            // Test: ctrl right arrow - expect first image to move back to first place,
            //       second image to move to back second place and thumbLast to move to back last place
            ctrlKeyDown(lightbox, modifiedRightEvt, 0);
            assertItemsInOriginalPosition("after modified-right");
        }
        
        function findImagesInLightbox() {
            return jQuery("img", fetchLightboxRoot());
            }
        
        function expectOrder(message, expectedOrder) {
            var images = findImagesInLightbox();
            var ids = fluid.transform(images, fluid.getId);
            var expectedIds = makeImageIds(expectedOrder);
            jqUnit.assertDeepEq(message, expectedIds, ids);
        }
        
        function sendCtrlKeyEvent(lightbox, key, targetIndex) {
            lightbox.handleKeyDown(fluid.testUtils.ctrlKeyEvent("CTRL", fluid.byId(orderableIds[targetIndex]))); 
            lightbox.handleKeyDown(fluid.testUtils.ctrlKeyEvent(key, fluid.byId(orderableIds[targetIndex])));
        }
        
        /*
         * This test tests the movement of images, and does not concern itself
         * with changes of state(i.e. dragging, etc.)
         */
        lightboxTests.test("HandleArrowKeyDownMoveThumbDown", function() {
            var lightbox = createLightbox();
            focusLightbox();
            // Test: ctrl down arrow - move the first image down
            sendCtrlKeyEvent(lightbox, "DOWN", 0);
            expectOrder("after ctrl-down-arrow", [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        });
         
        lightboxTests.test("HandleArrowKeyDownWrapThumbUp", function() {
            // Test: ctrl up arrow - move the first image 'up'
            var lightbox = createLightbox();
            focusLightbox();
        
            sendCtrlKeyEvent(lightbox, "UP", 0);
            expectOrder("after ctrl-up-arrow", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 13]);
        });
        
        lightboxTests.test("HandleArrowKeyDownForUpAndDown", function() {
            var lightbox = createLightbox();
            verticalNavigationTest(lightbox, fluid.testUtils.createEvtUpArrow(), fluid.testUtils.createEvtDownArrow());
        });
        
        lightboxTests.test("HandleArrowKeyDownForLeftAndRight", function() {
            var lightbox = createLightbox();
        
            horizontalNavigationTest(lightbox, fluid.testUtils.createEvtRightArrow(), fluid.testUtils.createEvtLeftArrow());
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
                fluid.jById(orderableIds[1]).ariaState("dropeffect"));  
            jqUnit.assertEquals("After ctrl-down, " + orderableIds[12] + " should have ARIA dropeffect of 'move'", "move",
                fluid.jById(orderableIds[12]).ariaState("dropeffect"));  
                
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
                fluid.jById(orderableIds[1]).ariaState("dropeffect"));  
            jqUnit.assertEquals("After ctrl-up, " + orderableIds[12] + " should have ARIA dropeffect of 'none'", "none",
                fluid.jById(orderableIds[12]).ariaState("dropeffect"));  
        });
        
        lightboxTests.test("HandleKeyUpAndHandleKeyDownItemMovement", function() {
            var lightbox = createLightbox();
            focusLightbox();
        
            // after ctrl down, order should not change
            lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL());
            assertItemsInOriginalPosition("after ctrl-down");
            
            // after ctrl up, order should not change
            lightbox.handleKeyUp(fluid.testUtils.createEvtCTRLUp());
            assertItemsInOriginalPosition("after ctrl-up");
        });
        
        /*
         * This test tests the movement of images, and does not concern itself
         * with changes of state(i.e. dragging, etc.)
         */
        lightboxTests.test("HandleArrowCtrlArrowKeyDown", function() {  
            var lightbox = createLightbox();
            horizontalMovementTest(lightbox,
                                    fluid.testUtils.createEvtCtrlRightArrow(),
                                    fluid.testUtils.createEvtCtrlLeftArrow());
                                    
            verticalMovementTest(lightbox,
                                  fluid.testUtils.createEvtCtrlUpArrow(),
                                  fluid.testUtils.createEvtCtrlDownArrow());
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
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
            jqUnit.assertUndefined("After ctrl-right, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);   
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlLeftArrow());
            jqUnit.assertUndefined("After ctrl-left, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);   
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlUpArrow());
            jqUnit.assertUndefined("After ctrl-up, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);   
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlDownArrow());
            jqUnit.assertUndefined("After ctrl-down, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);   
        
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtLeftArrow());
            jqUnit.assertUndefined("After left, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtRightArrow());
            jqUnit.assertUndefined("After right, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtUpArrow());
            jqUnit.assertUndefined("After up, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);   
            lightboxWithNoOrderables.handleDirectionKeyDown(fluid.testUtils.createEvtDownArrow());
            jqUnit.assertUndefined("After down, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            
            lightboxWithNoOrderables.handleKeyDown(fluid.testUtils.createEvtCTRL());
            jqUnit.assertUndefined("After ctrl pressed, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            lightboxWithNoOrderables.handleKeyUp(fluid.testUtils.createEvtCTRLUp());
            jqUnit.assertUndefined("After key released w, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
        });
        
        lightboxTests.test("UpdateAriaStates", function() {
            var lightbox = createLightbox();
            var lbRoot = fetchLightboxRoot();
            var firstImage = fluid.jById(firstReorderableId);
            jqUnit.assertEquals("before first lightbox focus, first item should be activedescendent", firstReorderableId, lbRoot.ariaState("activedescendent"));
            jqUnit.assertEquals("before first lightbox focus, first item should not be selected", "false", firstImage.ariaState("selected"));
        
            focusLightbox();
            jqUnit.assertEquals("after first lightbox focus, first image should be activedescendent", firstReorderableId, lbRoot.ariaState("activedescendent"));
            jqUnit.assertEquals("after first lightbox focus, first image should be selected", "true", firstImage.ariaState("selected"));
            
            var thirdImage = fluid.jById(thirdReorderableId);
            thirdImage.focus();
            jqUnit.assertEquals("after setting active item to third image, third image should be activedescendent", thirdReorderableId, lbRoot.ariaState("activedescendent"));
            jqUnit.assertEquals("after setting active item to third image, first image should not be selected", "false", firstImage.ariaState("selected"));
            jqUnit.assertEquals("after setting active item to third image, third image should be selected", "true", thirdImage.ariaState("selected"));
        
            var newInputElement = document.createElement("input");
            newInputElement.id="input1";
            
            jQuery("[id=para1]").after(newInputElement);
            jQuery("[id=input1]").get(0).focus();
            fluid.jById(thirdReorderableId).blur();
            jqUnit.assertEquals("after removing focus from lightbox, third image should still be activedescendent", thirdReorderableId, lbRoot.ariaState("activedescendent"));
            jqUnit.assertEquals("after removing focus from lightbox, third image should not be selected", "false", thirdImage.ariaState("selected"));
        });
        
        lightboxTests.test("UpdateGrabProperty", function() {
            var lightbox = createLightbox();
            var lbRoot = fetchLightboxRoot();
            var testItem = fluid.jById(firstReorderableId);
            jqUnit.assertEquals("before any action, test item should have grab of supported", "supported", testItem.ariaState("grab"));
            
            focusLightbox();
            lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL(testItem[0]));
            jqUnit.assertEquals("while CTRL held down, test item should have grab of true", "true", testItem.ariaState("grab"));
        
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlRightArrow(testItem[0]));
            jqUnit.assertEquals("after arrow while CTRL still held down, test item should have grab of true", "true", testItem.ariaState("grab"));
            
            lightbox.handleKeyUp(fluid.testUtils.createEvtCTRLUp(testItem[0]));
            jqUnit.assertEquals("after CTRL released, test item should have grab of supported", "supported", testItem.ariaState("grab"));
        });
    
        lightboxTests.test("AlternativeKeySetDefaultKeysDontWork", function() {
            var lightbox = createAltKeystrokeLightbox();
            focusLightbox();
            
            // Test arrow keys
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtRightArrow());
            assertItemFocused("After right arrow ", firstReorderableId);
            assertItemDefault("After right arrow ", secondReorderableId);
    
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtLeftArrow());
            assertItemFocused("After left arrow ", firstReorderableId);
            assertItemDefault("After left arrow ", lastReorderableId);
    
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtUpArrow());
            assertItemFocused("After up arrow ", firstReorderableId);
            assertItemDefault("After up arrow ", secondLastReorderableId);
    
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtDownArrow());
            assertItemFocused("After down arrow ", firstReorderableId);
            assertItemDefault("After down arrow ", fourthReorderableId);
             
            // Test CTRL
            lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL());
            assertItemFocused("After ctrl-down, ", firstReorderableId);
            lightbox.handleKeyUp(fluid.testUtils.createEvtCTRLUp());
            assertItemFocused("After ctrl-up, ", firstReorderableId);
    
            // Test CTRL arrow keys  
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
            assertItemsInOriginalPosition("After ctrl right arrow");
    
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlLeftArrow());
            assertItemsInOriginalPosition("After ctrl left arrow");
    
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlUpArrow());
            assertItemsInOriginalPosition("After ctrl up arrow");
    
            lightbox.handleDirectionKeyDown(fluid.testUtils.createEvtCtrlDownArrow());
            assertItemsInOriginalPosition("After ctrl down arrow");
            
        });    
    
        lightboxTests.test("AlternativeKeySetNavigation", function() {
            var lightbox = createAltKeystrokeLightbox();
            focusLightbox();
            
            horizontalNavigationTest(lightbox,
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.k),
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.j));
                                    
            fluid.jById(firstReorderableId).focus();
            verticalNavigationTest(lightbox,
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.i),
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.m));
           });
           
        lightboxTests.test("AlternativeKeySetMovement", function() {
            var lightbox = createAltKeystrokeLightbox();
            focusLightbox();
            
            horizontalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.k),
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.j));
            fluid.jById(firstReorderableId).focus();
            verticalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.i),
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.m));
           });
     
        lightboxTests.test("MultiKeySetNavigation", function() {
            var lightbox = createMultiKeystrokeLightbox();
            focusLightbox();
            
            horizontalNavigationTest(lightbox,
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.k),
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.j));
    
            fluid.jById(firstReorderableId).focus();
            horizontalNavigationTest(lightbox,
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.RIGHT),
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.LEFT));
                                    
            fluid.jById(firstReorderableId).focus();
            verticalNavigationTest(lightbox,
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.i),
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.m));
    
            fluid.jById(firstReorderableId).focus();
            verticalNavigationTest(lightbox,
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.UP),
                                    fluid.testUtils.createUnmodifiedKeyEvent(fluid.reorderer.keys.DOWN));
           });
           
        lightboxTests.test("MultiKeySetMovement", function() {
            var lightbox = createMultiKeystrokeLightbox();
            focusLightbox();
            
            horizontalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.k),
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.j));
    
            fluid.jById(firstReorderableId).focus();
            horizontalMovementTest(lightbox,
                                    fluid.testUtils.createAltKeyEvent(fluid.reorderer.keys.RIGHT),
                                    fluid.testUtils.createAltKeyEvent(fluid.reorderer.keys.LEFT));
    
            fluid.jById(firstReorderableId).focus();
            verticalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.i),
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.m));
    
            fluid.jById(firstReorderableId).focus();
            verticalMovementTest(lightbox,
                                    fluid.testUtils.createAltKeyEvent(fluid.reorderer.keys.UP),
                                    fluid.testUtils.createAltKeyEvent(fluid.reorderer.keys.DOWN));
        });
    
        lightboxTests.test("MultiKeySetWrongModifier", function() {
            var lightbox = createMultiKeystrokeLightbox();
            focusLightbox();
            
            // Test: alt k - expect no movement
            lightbox.handleDirectionKeyDown(fluid.testUtils.createAltKeyEvent(fluid.reorderer.keys.k));
            assertItemsInOriginalPosition("after alt-k");
            assertItemFocused("After failed move, ", firstReorderableId);
            assertItemDefault("After failed move, ", secondReorderableId);
        
            // Test: alt m - expect no movement
            lightbox.handleDirectionKeyDown(fluid.testUtils.createAltKeyEvent(fluid.reorderer.keys.m));
            assertItemsInOriginalPosition("after alt-m");
            assertItemFocused("After failed move, ", firstReorderableId);
            assertItemDefault("After failed move, ", secondReorderableId);
    
            // Test: ctrl shift left arrow - expect no movement
            lightbox.handleDirectionKeyDown(fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.LEFT));
            assertItemsInOriginalPosition("after ctrl shift left arrow");
            assertItemFocused("After failed move, ", firstReorderableId);
            assertItemDefault("After failed move, ", secondReorderableId);
    
            // Test: ctrl shift up arrow - expect no movement
            lightbox.handleDirectionKeyDown(fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.UP));
            assertItemsInOriginalPosition("after ctrl shift up arrow");
            assertItemFocused("After failed move, ", firstReorderableId);
            assertItemDefault("After failed move, ", secondReorderableId);
    
        });   
        
        lightboxTests.test("MultiKeySetOverlappingModifierMovement", function() {
            var lightbox = createMultiOverlappingKeystrokeLightbox();
            focusLightbox();
            
            horizontalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.k),
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.j));
    
            fluid.jById(firstReorderableId).focus();
            horizontalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlKeyEvent(fluid.reorderer.keys.RIGHT),
                                    fluid.testUtils.createCtrlKeyEvent(fluid.reorderer.keys.LEFT));
    
            fluid.jById(firstReorderableId).focus();
            verticalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.i),
                                    fluid.testUtils.createCtrlShiftKeyEvent(fluid.reorderer.keys.m));
    
            fluid.jById(firstReorderableId).focus();
            verticalMovementTest(lightbox,
                                    fluid.testUtils.createCtrlKeyEvent(fluid.reorderer.keys.UP),
                                    fluid.testUtils.createCtrlKeyEvent(fluid.reorderer.keys.DOWN));
        });
    
    });
})(jQuery);
