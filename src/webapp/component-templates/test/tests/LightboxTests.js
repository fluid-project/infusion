/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

function itemsInOriginalPositionTest(desc) {
    var thumbArray = findImgsInLightbox();
    assertEquals(desc + " expect first image to be first", firstImageId, thumbArray[0].id);
    assertEquals(desc + " expect second image to be second", secondImageId, thumbArray[1].id);
    assertEquals(desc + " expect third image to be third", thirdImageId, thumbArray[2].id);
    assertEquals(desc + " expect fourth image to be fourth", fourthImageId, thumbArray[3].id);
    assertEquals(desc + " expect fifth image to be fifth", fifthImageId, thumbArray[4].id);
    assertEquals(desc + " expect sixth image to be sixth", sixthImageId, thumbArray[5].id);
    assertEquals(desc + " expect seventh image to be seventh", seventhImageId, thumbArray[6].id);
    assertEquals(desc + " expect eighth image to be eighth", eighthImageId, thumbArray[7].id);
    assertEquals(desc + " expect ninth image to be ninth", ninthImageId, thumbArray[8].id);
    assertEquals(desc + " expect tenth image to be tenth", tenthImageId, thumbArray[9].id);
    assertEquals(desc + " expect fourth last image to be fourth last", eleventhImageId, thumbArray[10].id);
    assertEquals(desc + " expect third last image to be third last", twelvethImageId, thumbArray[11].id);
    assertEquals(desc + " expect second last image to be second last", secondLastImageId, thumbArray[12].id);
    assertEquals(desc + " expect last image to be last", lastImageId, thumbArray[13].id);
}

function isItemDefaultTest(message, itemId) {
    var item = fluid.utils.jById (itemId);
    
    assertTrue(message + itemId  +  " should be default", item.hasClass (defaultClass));
    assertFalse(message + itemId  +  " not be focused", item.hasClass (selectedClass));
    assertFalse(message + itemId  +  " not be dragging", item.hasClass (draggingClass));
}

function isItemFocusedTest(message, itemId) {
    var item = fluid.utils.jById (itemId);
    
    assertTrue(message + itemId  +  " should be focused", item.hasClass (selectedClass));   
    assertFalse(message + itemId  +  " should not be default", item.hasClass (defaultClass));
    assertFalse(message + itemId  +  " should not be default", item.hasClass (draggingClass));
}

function isItemDraggedTest(message, itemId) {
    var item = fluid.utils.jById (itemId);
    
    assertTrue(message + itemId  +  " should be dragging", item.hasClass (draggingClass));  
    assertFalse(message + itemId  +  " should not be default",item.hasClass (defaultClass));
    assertFalse(message + itemId  +  " not should be focused", item.hasClass (selectedClass));  
}

/*
 * This test tests the movement of images, and does not concern itself
 * with changes of state (i.e. dragging, etc.)
 */
function testHandleArrowKeyPressMoveThumbDown() {
	var lightbox = createLightbox();
	lightbox.selectActiveItem();

	// Test: ctrl down arrow - move the first image down
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlDownArrow());
	
	var thumbArray = findImgsInLightbox();
	assertEquals("after ctrl-down-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-down-arrow, expect third image to be second", thirdImageId, thumbArray[1].id);
	assertEquals("after ctrl-down-arrow, expect fourth image to be third", fourthImageId, thumbArray[2].id);
	assertEquals("after ctrl-down-arrow, expect first image to be fourth", firstImageId, thumbArray[3].id);
	assertEquals("after ctrl-down-arrow, expect fifth image to still be fifth", fifthImageId, thumbArray[4].id);

	// Test: ctrl up arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlUpArrow());
	itemsInOriginalPositionTest("after ctrl-up");
 }
 
 function testHandleArrowKeyPressWrapThumbUp() {
	// Test: ctrl up arrow - move the first image 'up'
	var lightbox = createLightbox();
	lightbox.selectActiveItem();

	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlUpArrow());
	
	var thumbArray = findImgsInLightbox();
	assertEquals("after ctrl-up-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-up-arrow, expect third image to be second", thirdImageId, thumbArray[1].id);
	assertEquals("after ctrl-up-arrow, expect fifth image to be fourth", fifthImageId, thumbArray[3].id);
	assertEquals("after ctrl-up-arrow, expect first image to be second last", firstImageId, thumbArray[12].id);
	assertEquals("after ctrl-up-arrow, expect last image to still be last", lastImageId, thumbArray[13].id);

	// Test: ctrl down arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlDownArrow());
	itemsInOriginalPositionTest("after ctrl-down wrap");

}

function testHandleArrowKeyPressForUpAndDown() {
	var lightbox = createLightbox();
	// setup: force the grid to have four columns
	var lightboxRoot = fluid.utils.jById (lightboxRootId);
    
	lightboxRoot.removeClass("width-3-thumb");
    lightboxRoot.addClass("width-4-thumb");
    
	lightbox.selectActiveItem();
	
	isItemFocusedTest("Initially ", firstReorderableId);

	// Test: down arrow to the fifth image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtDownArrow());
	isItemDefaultTest("After down arrow ", firstReorderableId);
	isItemFocusedTest("After down arrow ", fifthReorderableId);

	// Test: up arrow to the first image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtUpArrow());
	isItemFocusedTest("After up arrow ", firstReorderableId);
	isItemDefaultTest("After up arrow ", fifthReorderableId);

	// Test: up arrow to the second last image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtUpArrow());
	isItemDefaultTest("After up arrow wrap ", firstReorderableId);
	isItemFocusedTest("After up arrow wrap ", secondLastReorderableId);

	// Test: down arrow to the first image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtDownArrow());
	isItemFocusedTest("After down arrow wrap ", firstReorderableId);
	isItemDefaultTest("After down arrow wrap ", secondLastReorderableId);

}

function testHandleArrowKeyPressForLeftAndRight()	 {
	var lightbox = createLightbox();
    lightbox.selectActiveItem();
	
	isItemFocusedTest("Initially ", firstReorderableId);
	isItemDefaultTest("Initially ", secondReorderableId);

	// Test: right arrow to the second image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtRightArrow());
	isItemFocusedTest("After right arrow ", secondReorderableId);
	isItemDefaultTest("After right arrow ", firstReorderableId);

	// Test: right arrow to the last image
	for (focusPosition = 2; focusPosition < numOfImages; focusPosition++ ) {
		lightbox.handleArrowKeyPress(fluid.testUtils.createEvtRightArrow());
	}
	isItemFocusedTest("Right arrow to last ", lastReorderableId);
	isItemDefaultTest("Right arrow to last ", firstReorderableId);
	isItemDefaultTest("Right arrow to last ", secondReorderableId);
	
	// Test: left arrow to the previous image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtLeftArrow());
	isItemFocusedTest("Left arrow to second last ", secondLastReorderableId);
	isItemDefaultTest("Left arrow to second last ", firstReorderableId);
	isItemDefaultTest("Left arrow to second last ", lastReorderableId);
	
	// Test: right arrow past the last image - expect wrap to the first image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtRightArrow());
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtRightArrow());
	isItemFocusedTest("Right arrow wrap ", firstReorderableId);
	isItemDefaultTest("Right arrow wrap ", secondReorderableId);
	isItemDefaultTest("Right arrow wrap ", lastReorderableId);

	// Test: left arrow on the first image - expect wrap to the last image
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtLeftArrow());
	isItemFocusedTest("Left arrow wrap ", lastReorderableId);
	isItemDefaultTest("Left arrow wrap ", firstReorderableId);
	isItemDefaultTest("Left arrow wrap ", secondReorderableId);

}

function testHandleKeyUpAndHandleKeyDownChangesState() {
	var lightbox = createLightbox();
    var firstReorderable = fluid.utils.jById (firstReorderableId);
    lightbox.selectActiveItem();

	// check that none of the images are currently being moved.
	isItemFocusedTest("Initially ", firstReorderableId);
	isItemDefaultTest("Initially ", secondReorderableId);
	isItemDefaultTest("Initially ", secondLastReorderableId);
	
	// focus the first thumb
	lightbox.focusItem(firstReorderable.get(0));
	
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
}

function testHandleKeyUpAndHandleKeyDownItemMovement() {
	var lightbox = createLightbox();
    lightbox.selectActiveItem();

	// after ctrl down, order should not change
	lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL());
	itemsInOriginalPositionTest("after ctrl-down");
	
	// after ctrl up, order should not change
	lightbox.handleKeyUp(fluid.testUtils.createEvtCTRL());
	itemsInOriginalPositionTest("after ctrl-up");
}

/*
 * This test tests the movement of images, and does not concern itself
 * with changes of state (i.e. dragging, etc.)
 */
function testHandleArrowKeyPressForCtrlLeftAndCtrlRight() {	
	var lightbox = createLightbox();
    lightbox.selectActiveItem();
	
	// Test: ctrl right arrow - expect first and second image to swap
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlRightArrow());

	var thumbArray = findImgsInLightbox();
	assertEquals("after ctrl-right-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-right-arrow, expect first image to be second", firstImageId, thumbArray[1].id);
	assertEquals("after ctrl-right-arrow, expect last image to be last", lastImageId, thumbArray[numOfImages - 1].id);
	
	// Test: ctrl left arrow - expect first and second image to swap back to original order
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlLeftArrow());
	itemsInOriginalPositionTest("after ctrl-left-arrow");

	// Test: ctrl left arrow - expect first image to move to last place,
	//       second image to move to first place and last image to move to second-last place
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlLeftArrow());

	thumbArray = findImgsInLightbox();
	assertEquals("after ctrl-left-arrow on first image, expect first last to be last", firstImageId, thumbArray[numOfImages - 1].id);
	assertEquals("after ctrl-left-arrow on first image, expect second to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-left-arrow on first image, expect last to be second-last", lastImageId, thumbArray[numOfImages - 2].id);

	// Test: ctrl right arrow - expect first image to move back to first place,
	//       second image to move to back second place and thumbLast to move to back last place
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlRightArrow());
	itemsInOriginalPositionTest("after ctrl-left-arrow");
}

function testPersistFocus () {
    var lbRoot = fetchLightboxRoot ();
	var lightbox = createLightbox();

	isItemDefaultTest("Initially ", firstReorderableId);

    lightbox.selectActiveItem();

	// first thumb nail should be focused initially.
	isItemFocusedTest("When lightbox has focus ", firstReorderableId);
	isItemDefaultTest("When lightbox has focus ", secondReorderableId);
	
	// Change focus to the input1, then back to the lightbox
	var newInputElement = document.createElement ("input");
	newInputElement.id="input1";
	
	jQuery ("[id=para1]").after (newInputElement);
    jQuery ("[id=input1]").get(0).focus();
	isItemDefaultTest ("After focus leaves the lightbox ", firstReorderableId);
	
	lightbox.findElementToFocus (lbRoot).focus();
	
	// check that the first thumb nail is still moveable.
	isItemFocusedTest ("When lightbox has focus again ", firstReorderableId);
	isItemDefaultTest ("When lightbox has focus again ", secondReorderableId);
	
	// set focus to another image.
	lightbox.focusItem (fluid.utils.jById (secondReorderableId));
    isItemFocusedTest ("Changed focus to second ", secondReorderableId);
	isItemDefaultTest ("Changed focus to second ", firstReorderableId);
	
	// Change focus to the input1, then back to the lightbox
	jQuery ("[id=input1]").get(0).focus();
	lightbox.findElementToFocus (lbRoot).focus();
	
	// check that the second thumb nail is still moveable.
	lightbox.focusItem (fluid.utils.jById (secondReorderableId));
    isItemFocusedTest ("Lightbox refocused with second selected ", secondReorderableId);
	isItemDefaultTest ("Lightbox refocused with second selected ", firstReorderableId);
	
	lightbox.findElementToFocus (lbRoot).blur();
	isItemDefaultTest ("Lightbox blur with second selected ", secondReorderableId);
}

function testfocusItem () {
	var lightbox = createLightbox();
	
	// nothing should be focused
	isItemDefaultTest ("Initially", firstReorderableId);
	isItemDefaultTest ("Initially", secondReorderableId);
	
	// focus the second image
	lightbox.focusItem (fluid.utils.jById (secondReorderableId));
    isItemFocusedTest ("After focus on second image ", secondReorderableId);
	
	// focus the image already focused to ensure it remains focused.
	lightbox.focusItem (fluid.utils.jById (secondReorderableId));
    isItemFocusedTest ("After refocus on second image ", secondReorderableId);

	// focus a different image and check to see that the previous image is defocused
	// and the new image is focused	
	lightbox.focusItem (fluid.utils.jById (firstReorderableId));
    isItemDefaultTest ("After focus on first image ", secondReorderableId);
	isItemFocusedTest ("After focus on first image ", firstReorderableId);
}

function testSelectActiveItemNothingSelected() {
	var lightbox = createLightbox();

	isItemDefaultTest ("Initially", firstReorderableId);
	lightbox.selectActiveItem ();
	isItemFocusedTest ("After select active item ", firstReorderableId);
	
	// Now, test it with no reorderables.
	//
	var lightboxWithNoOrderables = createLightboxWithNoOrderables ();
	lightboxWithNoOrderables.selectActiveItem ();
	assertNull ("Lightbox's activeItem member should be null", lightboxWithNoOrderables.activeItem);
}

function testKeypressesWithNoOrderables() {
    var lightboxWithNoOrderables = createLightboxWithNoOrderables();
	
	lightboxWithNoOrderables.selectActiveItem();
	assertNull ("Lightbox's activeItem member should be null", lightboxWithNoOrderables.activeItem);
		
	// Test left arrow, right arrow, etc. with and without control key.
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtCtrlRightArrow());
	assertNull ("After ctrl-right, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);	
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtCtrlLeftArrow());
	assertNull ("After ctrl-left, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);	
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtCtrlUpArrow());
	assertNull ("After ctrl-up, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);	
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtCtrlDownArrow());
	assertNull ("After ctrl-down, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);	

	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtLeftArrow());
	assertNull ("After left, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtRightArrow());
	assertNull ("After right, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtUpArrow());
	assertNull ("After up, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);	
	lightboxWithNoOrderables.handleArrowKeyPress(fluid.testUtils.createEvtDownArrow());
	assertNull ("After down, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);
	
	lightboxWithNoOrderables.handleKeyDown (fluid.testUtils.createEvtCTRL());
	assertNull ("After ctrl pressed, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);
	lightboxWithNoOrderables.handleKeyUp (fluid.testUtils.createEvtCTRL());
	assertNull ("After key released w, activeItem member should be null",
		lightboxWithNoOrderables.activeItem);
}
	
function testSelectActiveItemSecondSelected() {
	// set the active item to something other than the default first item
	var lightbox = createLightbox();
	
	lightbox._setActiveItem (fluid.utils.jById (secondReorderableId));
	
	// before selecting the active item, nothing should have focus	
	isItemDefaultTest ("Initially", firstReorderableId);
	isItemDefaultTest ("Initially", secondReorderableId);
	
	lightbox.selectActiveItem();
	isItemFocusedTest ("after selecting active item ", secondReorderableId);
	isItemDefaultTest ("after selecting active item ", firstReorderableId);
}

function testChangeActiveItemToDefaultState() {
	var lightbox = createLightbox();
    lightbox.selectActiveItem();
	isItemFocusedTest("Initially", firstReorderableId);
	
	lightbox.changeActiveItemToDefaultState();
	isItemDefaultTest("after resetting active item, ", firstReorderableId);
}

function testUpdateActiveDescendent() {
	var lightbox = createLightbox();
	var lbRoot = fluid.utils.jById (lightboxRootId);
	assertUndefined ("before first lightbox focus, no item should be activedescendent", lbRoot.attr("aaa:activedescendent"));

    lightbox.selectActiveItem();
	assertEquals ("after first lightbox focus, first image should be activedescendent", firstReorderableId, lbRoot.attr("aaa:activedescendent"));
	
	lightbox.activeItem = fluid.utils.jById (thirdReorderableId)[0];
	lightbox._updateActiveDescendent();
	assertEquals ("after setting active item to third image, third image should be activedescendent", thirdReorderableId, lbRoot.attr("aaa:activedescendent"));

	var newInputElement = document.createElement("input");
	newInputElement.id="input1";
	
	jQuery ("[id=para1]").after (newInputElement);
    jQuery ("[id=input1]").get(0).focus();
    lightbox._updateActiveDescendent();
	assertEquals ("after removing focus from lightbox, third image should still be activedescendent", thirdReorderableId, lbRoot.attr("aaa:activedescendent"));

	lightbox.activeItem = null;
	lightbox._updateActiveDescendent();
	assertUndefined ("after unsetting active item, no item should be activedescendent", lbRoot.attr("aaa:activedescendent"));
}

function testUpdateGrabProperty() {
    var lightbox = createLightbox();
    var lbRoot = fluid.utils.jById (lightboxRootId);
    var testItem = fluid.utils.jById (firstReorderableId);
    assertEquals ("before any action, test item should have grab of supported", "supported", testItem.attr("aaa:grab"));
    
    lightbox.selectActiveItem();
    lightbox.handleKeyDown (fluid.testUtils.createEvtCTRL());
    assertEquals ("while CTRL held down, test item should have grab of true", "true", testItem.attr("aaa:grab"));

    lightbox.handleArrowKeyPress (fluid.testUtils.createEvtCtrlRightArrow());
    assertEquals ("after arrow while CTRL still held down, test item should have grab of true", "true", testItem.attr("aaa:grab"));
    
    lightbox.handleKeyUp (fluid.testUtils.createEvtCTRL());
    assertEquals ("after CTRL released, test item should have grab of supported", "supported", testItem.attr("aaa:grab"));
}

function testAddFocusToElement() {
    var lightbox = createLightbox();
    var testItem = fluid.utils.jById (firstReorderableId);
    
    assertEquals ("before adding focus, tabindex should be undefined", undefined, testItem.tabIndex ());
    lightbox.addFocusToElement (testItem);
    assertEquals("after adding focus, tabindex should be -1", -1, testItem.tabIndex ());
    
    var testItem2 = fluid.utils.jById (secondReorderableId);
    testItem2.tabIndex (2);
    
    assertEquals ("before adding focus to something with tabindex=2, tabindex should be 2", 2, testItem2.tabIndex ());
    lightbox.addFocusToElement (testItem2);
    assertEquals ("before adding focus to something with tabindex=2, tabindex should be still be 2", 2, testItem2.tabIndex ());
}
