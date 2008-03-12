/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

$(document).ready (function () {
    var lightboxTests = new jqUnit.TestCase ("Lightbox Tests", setUp, tearDown);

    function itemsInOriginalPositionTest(desc) {
        var thumbArray = findImgsInLightbox();
        jqUnit.assertEquals(desc + " expect first image to be first", firstImageId, thumbArray[0].id);
        jqUnit.assertEquals(desc + " expect second image to be second", secondImageId, thumbArray[1].id);
        jqUnit.assertEquals(desc + " expect third image to be third", thirdImageId, thumbArray[2].id);
        jqUnit.assertEquals(desc + " expect fourth image to be fourth", fourthImageId, thumbArray[3].id);
        jqUnit.assertEquals(desc + " expect fifth image to be fifth", fifthImageId, thumbArray[4].id);
        jqUnit.assertEquals(desc + " expect sixth image to be sixth", sixthImageId, thumbArray[5].id);
        jqUnit.assertEquals(desc + " expect seventh image to be seventh", seventhImageId, thumbArray[6].id);
        jqUnit.assertEquals(desc + " expect eighth image to be eighth", eighthImageId, thumbArray[7].id);
        jqUnit.assertEquals(desc + " expect ninth image to be ninth", ninthImageId, thumbArray[8].id);
        jqUnit.assertEquals(desc + " expect tenth image to be tenth", tenthImageId, thumbArray[9].id);
        jqUnit.assertEquals(desc + " expect fourth last image to be fourth last", eleventhImageId, thumbArray[10].id);
        jqUnit.assertEquals(desc + " expect third last image to be third last", twelvethImageId, thumbArray[11].id);
        jqUnit.assertEquals(desc + " expect second last image to be second last", secondLastImageId, thumbArray[12].id);
        jqUnit.assertEquals(desc + " expect last image to be last", lastImageId, thumbArray[13].id);
    }
    
    function isItemDefaultTest(message, itemId) {
        var item = fluid.utils.jById (itemId);
        
        jqUnit.assertTrue(message + itemId  +  " should be default", item.hasClass (defaultClass));
        jqUnit.assertFalse(message + itemId  +  " not be selected", item.hasClass (selectedClass));
        jqUnit.assertFalse(message + itemId  +  " not be dragging", item.hasClass (draggingClass));
    }
    
    function isItemFocusedTest(message, itemId) {
        var item = fluid.utils.jById (itemId);
        
        jqUnit.assertTrue(message + itemId  +  " should be selected", item.hasClass (selectedClass));   
        jqUnit.assertFalse(message + itemId  +  " should not be default", item.hasClass (defaultClass));
        jqUnit.assertFalse(message + itemId  +  " should not be dragging", item.hasClass (draggingClass));
    }
    
    function isItemDraggedTest(message, itemId) {
        var item = fluid.utils.jById (itemId);
        
        jqUnit.assertTrue(message + itemId  +  " should be dragging", item.hasClass (draggingClass));  
        jqUnit.assertFalse(message + itemId  +  " should not be default",item.hasClass (defaultClass));
        jqUnit.assertFalse(message + itemId  +  " not should be selected", item.hasClass (selectedClass));  
    }
    
    /*
     * This test tests the movement of images, and does not concern itself
     * with changes of state (i.e. dragging, etc.)
     */
    lightboxTests.test ("HandleArrowKeyDownMoveThumbDown", function () {
        var lightbox = createLightbox();
        focusLightbox ();
    
        // Test: ctrl down arrow - move the first image down
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtCtrlDownArrow());
        
        var thumbArray = findImgsInLightbox();
        jqUnit.assertEquals("after ctrl-down-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
        jqUnit.assertEquals("after ctrl-down-arrow, expect third image to be second", thirdImageId, thumbArray[1].id);
        jqUnit.assertEquals("after ctrl-down-arrow, expect fourth image to be third", fourthImageId, thumbArray[2].id);
        jqUnit.assertEquals("after ctrl-down-arrow, expect first image to be fourth", firstImageId, thumbArray[3].id);
        jqUnit.assertEquals("after ctrl-down-arrow, expect fifth image to still be fifth", fifthImageId, thumbArray[4].id);
     });
     
     lightboxTests.test ("HandleArrowKeyDownWrapThumbUp", function () {
        // Test: ctrl up arrow - move the first image 'up'
        var lightbox = createLightbox();
        focusLightbox ();
    
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtCtrlUpArrow());
        
        var thumbArray = findImgsInLightbox();
        jqUnit.assertEquals("after ctrl-up-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
        jqUnit.assertEquals("after ctrl-up-arrow, expect third image to be second", thirdImageId, thumbArray[1].id);
        jqUnit.assertEquals("after ctrl-up-arrow, expect fifth image to be fourth", fifthImageId, thumbArray[3].id);
        jqUnit.assertEquals("after ctrl-up-arrow, expect first image to be second last", firstImageId, thumbArray[12].id);
        jqUnit.assertEquals("after ctrl-up-arrow, expect last image to still be last", lastImageId, thumbArray[13].id);
    });
    
    lightboxTests.test ("HandleArrowKeyDownForUpAndDown", function () {
        var lightbox = createLightbox();
        // setup: force the grid to have four columns
        var lightboxRoot = fluid.utils.jById (lightboxRootId);
        
        lightboxRoot.removeClass("width-3-thumb");
        lightboxRoot.addClass("width-4-thumb");
        
        focusLightbox ();
        
        isItemFocusedTest("Initially ", firstReorderableId);
    
        // the test framework doesn't seem to properly focus, so we force the issue
        fluid.utils.jById (firstReorderableId)[0].focus ();
    
        // Test: down arrow to the fifth image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtDownArrow());
        isItemDefaultTest("After down arrow ", firstReorderableId);
        isItemFocusedTest("After down arrow ", fifthReorderableId);
    
        // Test: up arrow to the first image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtUpArrow());
        isItemFocusedTest("After up arrow ", firstReorderableId);
        isItemDefaultTest("After up arrow ", fifthReorderableId);
    
        // Test: up arrow to the second last image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtUpArrow());
        isItemDefaultTest("After up arrow wrap ", firstReorderableId);
        isItemFocusedTest("After up arrow wrap ", secondLastReorderableId);
    
        // Test: down arrow to the first image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtDownArrow());
        isItemFocusedTest("After down arrow wrap ", firstReorderableId);
        isItemDefaultTest("After down arrow wrap ", secondLastReorderableId);
    
    });
    
    lightboxTests.test ("HandleArrowKeyDownForLeftAndRight", function () {
        var lightbox = createLightbox();
        focusLightbox ();
        
        isItemFocusedTest("Initially ", firstReorderableId);
        isItemDefaultTest("Initially ", secondReorderableId);
    
        // the test framework doesn't seem to properly focus, so we force the issue
        fluid.utils.jById (firstReorderableId)[0].focus ();
    
        // Test: right arrow to the second image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtRightArrow());
        isItemFocusedTest("After right arrow ", secondReorderableId);
        isItemDefaultTest("After right arrow ", firstReorderableId);
    
        // Test: right arrow to the last image
        for (focusPosition = 2; focusPosition < numOfImages; focusPosition++ ) {
            lightbox.handleArrowKeyDown(fluid.testUtils.createEvtRightArrow());
        }
        isItemFocusedTest("Right arrow to last ", lastReorderableId);
        isItemDefaultTest("Right arrow to last ", firstReorderableId);
        isItemDefaultTest("Right arrow to last ", secondReorderableId);
        
        // Test: left arrow to the previous image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtLeftArrow());
        isItemFocusedTest("Left arrow to second last ", secondLastReorderableId);
        isItemDefaultTest("Left arrow to second last ", firstReorderableId);
        isItemDefaultTest("Left arrow to second last ", lastReorderableId);
        
        // Test: right arrow past the last image - expect wrap to the first image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtRightArrow());
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtRightArrow());
        isItemFocusedTest("Right arrow wrap ", firstReorderableId);
        isItemDefaultTest("Right arrow wrap ", secondReorderableId);
        isItemDefaultTest("Right arrow wrap ", lastReorderableId);
    
        // Test: left arrow on the first image - expect wrap to the last image
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtLeftArrow());
        isItemFocusedTest("Left arrow wrap ", lastReorderableId);
        isItemDefaultTest("Left arrow wrap ", firstReorderableId);
        isItemDefaultTest("Left arrow wrap ", secondReorderableId);
    
    });
    
    lightboxTests.test ("HandleKeyUpAndHandleKeyDownChangesState", function () {
        var lightbox = createLightbox();
        var firstReorderable = fluid.utils.jById (firstReorderableId);
        focusLightbox ();
    
        // check that none of the images are currently being moved.
        isItemFocusedTest("Initially ", firstReorderableId);
        isItemDefaultTest("Initially ", secondReorderableId);
        isItemDefaultTest("Initially ", secondLastReorderableId);
        
        // ctrl down - expect dragging state to start
        lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL());
        isItemDraggedTest("After ctrl-down, ", firstReorderableId);
        isItemDefaultTest("After ctrl-down, ", secondReorderableId);
        isItemDefaultTest("After ctrl-down, ", secondLastReorderableId);
            
        // right arrow down - all the dragging states should remain the same
        lightbox.handleKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
        isItemDraggedTest("After ctrl-down right arrow down, ", firstReorderableId);
        isItemDefaultTest("After ctrl-down right arrow down, ", secondReorderableId);
        isItemDefaultTest("After ctrl-down right arrow down, ", secondLastReorderableId);
        
        // right arrow with key-up event handler. The dragging states should remain the same.
        lightbox.handleKeyUp(fluid.testUtils.createEvtCtrlRightArrow());
        isItemDraggedTest("After ctrl-down right arrow up, ", firstReorderableId);
        isItemDefaultTest("After ctrl-down right arrow up, ", secondReorderableId);
        isItemDefaultTest("After ctrl-down right arrow up, ", secondLastReorderableId);
    
        // ctrl up - expect dragging to end
        lightbox.handleKeyUp(fluid.testUtils.createEvtCTRL());
        isItemFocusedTest("After ctrl-up ", firstReorderableId);
        isItemDefaultTest("After ctrl-up ", secondReorderableId);
        isItemDefaultTest("After ctrl-up ", secondLastReorderableId);
    });
    
    lightboxTests.test ("HandleKeyUpAndHandleKeyDownItemMovement", function () {
        var lightbox = createLightbox();
        focusLightbox ();
    
        // after ctrl down, order should not change
        lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL());
        itemsInOriginalPositionTest("after ctrl-down");
        
        // after ctrl up, order should not change
        lightbox.handleKeyUp(fluid.testUtils.createEvtCTRL());
        itemsInOriginalPositionTest("after ctrl-up");
    });
    
    /*
     * This test tests the movement of images, and does not concern itself
     * with changes of state (i.e. dragging, etc.)
     */
    lightboxTests.test ("HandleArrowKeyDownForCtrlLeftAndCtrlRight", function () {  
        var lightbox = createLightbox();
        focusLightbox ();
        
        // Test: ctrl right arrow - expect first and second image to swap
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
    
        var thumbArray = findImgsInLightbox();
        jqUnit.assertEquals("after ctrl-right-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
        jqUnit.assertEquals("after ctrl-right-arrow, expect first image to be second", firstImageId, thumbArray[1].id);
        jqUnit.assertEquals("after ctrl-right-arrow, expect last image to be last", lastImageId, thumbArray[numOfImages - 1].id);
        
        // Test: ctrl left arrow - expect first and second image to swap back to original order
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtCtrlLeftArrow());
        itemsInOriginalPositionTest("after ctrl-left-arrow");
    
        // Test: ctrl left arrow - expect first image to move to last place,
        //       second image to move to first place and last image to move to second-last place
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtCtrlLeftArrow());
    
        thumbArray = findImgsInLightbox();
        jqUnit.assertEquals("after ctrl-left-arrow on first image, expect first last to be last", firstImageId, thumbArray[numOfImages - 1].id);
        jqUnit.assertEquals("after ctrl-left-arrow on first image, expect second to be first", secondImageId, thumbArray[0].id);
        jqUnit.assertEquals("after ctrl-left-arrow on first image, expect last to be second-last", lastImageId, thumbArray[numOfImages - 2].id);
    
        // Test: ctrl right arrow - expect first image to move back to first place,
        //       second image to move to back second place and thumbLast to move to back last place
        lightbox.handleArrowKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
        itemsInOriginalPositionTest("after ctrl-left-arrow");
    });
    
    lightboxTests.test ("PersistFocus ", function () {
        var lbRoot = fetchLightboxRoot ();
        var lightbox = createLightbox();
        // Create an input that we can move focus to during the test
        var newInputElement = document.createElement ("input");
        newInputElement.id="input1";
        
        jQuery ("[id=para1]").after (newInputElement);
        
        isItemDefaultTest("Initially ", firstReorderableId);
    
        // Focus the lightbox and make sure the first thumb nail is selected
        lbRoot.focus();
        isItemFocusedTest("When lightbox has focus ", firstReorderableId);
        isItemDefaultTest("When lightbox has focus ", secondReorderableId);
        
        // Calling blur because the test framework doesn't behave like the browsers do. 
        // The browsers will call blur when something else gets focus.
        fluid.utils.jById (firstReorderableId).blur ();
    
        // Change focus to the input1, then back to the lightbox
        newInputElement.focus();
        isItemDefaultTest ("After focus leaves the lightbox ", firstReorderableId);
        
        // Change focus to the lightbox and check that the first thumb nail is still movable.
        lbRoot.focus();
        isItemFocusedTest ("When lightbox has focus again ", firstReorderableId);
        isItemDefaultTest ("When lightbox has focus again ", secondReorderableId);
        
        fluid.utils.jById (firstReorderableId).blur ();
    
        // set focus to another image.
        fluid.utils.jById (secondReorderableId).focus ();
        isItemFocusedTest ("Changed focus to second ", secondReorderableId);
        isItemDefaultTest ("Changed focus to second ", firstReorderableId);
        
        // Change focus to the input1
        newInputElement.focus();
        fluid.utils.jById (secondReorderableId).blur ();

        isItemDefaultTest ("Lightbox blur with second selected ", secondReorderableId);
    
        // Focus the lightbox and check that the second thumb nail is still movable
        lbRoot.focus();
        isItemFocusedTest ("Lightbox refocused with second selected ", secondReorderableId);
        isItemDefaultTest ("Lightbox refocused with second selected ", firstReorderableId);
    });
    
    lightboxTests.test ("ItemFocusBlur ", function () {
        var lightbox = createLightbox();
        var testItem = fluid.utils.jById(firstReorderableId);
        
        isItemDefaultTest ("Before test item gets focus, it should be in default state", firstReorderableId);
        
        testItem.focus ();    
        isItemFocusedTest ("After test item gets focus, it should be in selected state", firstReorderableId);
    
        testItem.blur ();    
        isItemDefaultTest ("After test item gets blur, it should be in default state", firstReorderableId);
    });
    
    lightboxTests.test ("LightboxFocussed", function () {
        var lightbox = createLightbox();
    
        isItemDefaultTest ("Initially ", firstReorderableId);
        focusLightbox ();
        isItemFocusedTest ("After select active item ", firstReorderableId);
        
        // Now, test it with no reorderables.
        var lightboxWithNoOrderables = createLightboxWithNoOrderables ();
        focusLightbox ();
        jqUnit.assertUndefined ("Lightbox's activeItem should not be set ", lightboxWithNoOrderables.activeItem);
    });
    
    lightboxTests.test ("KeypressesWithNoOrderables", function () {
        var lightboxWithNoOrderables = createLightboxWithNoOrderables();
        
        focusLightbox ();
        jqUnit.assertUndefined ("Lightbox's activeItem member should not be set", lightboxWithNoOrderables.activeItem);
            
        // Test left arrow, right arrow, etc. with and without control key.
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtCtrlRightArrow());
        jqUnit.assertUndefined ("After ctrl-right, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);   
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtCtrlLeftArrow());
        jqUnit.assertUndefined ("After ctrl-left, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);   
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtCtrlUpArrow());
        jqUnit.assertUndefined ("After ctrl-up, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);   
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtCtrlDownArrow());
        jqUnit.assertUndefined ("After ctrl-down, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);   
    
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtLeftArrow());
        jqUnit.assertUndefined ("After left, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtRightArrow());
        jqUnit.assertUndefined ("After right, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtUpArrow());
        jqUnit.assertUndefined ("After up, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);   
        lightboxWithNoOrderables.handleArrowKeyDown(fluid.testUtils.createEvtDownArrow());
        jqUnit.assertUndefined ("After down, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);
        
        lightboxWithNoOrderables.handleKeyDown (fluid.testUtils.createEvtCTRL());
        jqUnit.assertUndefined ("After ctrl pressed, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);
        lightboxWithNoOrderables.handleKeyUp (fluid.testUtils.createEvtCTRL());
        jqUnit.assertUndefined ("After key released w, activeItem member should not be set",
            lightboxWithNoOrderables.activeItem);
    });
    
    lightboxTests.test ("UpdateAriaStates", function () {
        var lightbox = createLightbox();
        var lbRoot = fetchLightboxRoot ();
        var firstImage = fluid.utils.jById (firstReorderableId);
        jqUnit.assertEquals ("before first lightbox focus, first item should be activedescendent", firstReorderableId, lbRoot.ariaState("activedescendent"));
        jqUnit.assertEquals ("before first lightbox focus, first item should not be selected", "false", firstImage.ariaState("selected"));
    
        focusLightbox ();
        jqUnit.assertEquals ("after first lightbox focus, first image should be activedescendent", firstReorderableId, lbRoot.ariaState("activedescendent"));
        jqUnit.assertEquals ("after first lightbox focus, first image should be selected", "true", firstImage.ariaState("selected"));
        
        var thirdImage = fluid.utils.jById (thirdReorderableId);
        thirdImage.focus();
        jqUnit.assertEquals ("after setting active item to third image, third image should be activedescendent", thirdReorderableId, lbRoot.ariaState("activedescendent"));
        jqUnit.assertEquals ("after setting active item to third image, first image should not be selected", "false", firstImage.ariaState("selected"));
        jqUnit.assertEquals ("after setting active item to third image, third image should be selected", "true", thirdImage.ariaState("selected"));
    
        var newInputElement = document.createElement("input");
        newInputElement.id="input1";
        
        jQuery ("[id=para1]").after (newInputElement);
        jQuery ("[id=input1]").get(0).focus();
        fluid.utils.jById (thirdReorderableId).blur ();
        jqUnit.assertEquals ("after removing focus from lightbox, third image should still be activedescendent", thirdReorderableId, lbRoot.ariaState("activedescendent"));
        jqUnit.assertEquals ("after removing focus from lightbox, third image should not be selected", "false", thirdImage.ariaState("selected"));
    });
    
    lightboxTests.test ("UpdateGrabProperty", function () {
        var lightbox = createLightbox();
        var lbRoot = fetchLightboxRoot ();
        var testItem = fluid.utils.jById (firstReorderableId);
        jqUnit.assertEquals ("before any action, test item should have grab of supported", "supported", testItem.ariaState("grab"));
        
        focusLightbox ();
        lightbox.handleKeyDown (fluid.testUtils.createEvtCTRL());
        jqUnit.assertEquals ("while CTRL held down, test item should have grab of true", "true", testItem.ariaState("grab"));
    
        lightbox.handleArrowKeyDown (fluid.testUtils.createEvtCtrlRightArrow());
        jqUnit.assertEquals ("after arrow while CTRL still held down, test item should have grab of true", "true", testItem.ariaState("grab"));
        
        lightbox.handleKeyUp (fluid.testUtils.createEvtCTRL());
        jqUnit.assertEquals ("after CTRL released, test item should have grab of supported", "supported", testItem.ariaState("grab"));
    });

});

