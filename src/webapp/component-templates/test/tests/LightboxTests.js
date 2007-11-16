/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

function testFindReorderableParent() {
	var lightbox = createLightbox();
	
	var testItem = dojo.byId(firstReorderableId);
	assertEquals("The test item's role attribute should be gridcell",
		"wairole:gridcell", testItem.getAttribute("xhtml10:role"));

    var orderables = lightbox.orderableFinder (lightboxRootId);
	assertEquals("Given the test item itself, the ancestor grid cell should be the test item",
		testItem, lightbox._findReorderableParent(testItem, orderables));
	assertEquals("Given the image, the ancestor grid cell should be the test item",
		testItem, lightbox._findReorderableParent(testItem.getElementsByTagName("img")[0], orderables));
	assertEquals("Given the caption div, the ancestor grid cell should be the test item",
		testItem, lightbox._findReorderableParent(testItem.getElementsByTagName("div")[2], orderables));
	assertEquals("Given the caption anchor, the ancestor grid cell should be the test item",
		testItem, lightbox._findReorderableParent(testItem.getElementsByTagName("a")[1], orderables));
	assertEquals("Given the title of the document, the ancestor grid cell should be null",
		null, lightbox._findReorderableParent(document.body.getElementsByTagName("title")[0], orderables));
	
	testItem = dojo.byId(fourthReorderableId);
	assertEquals("Given another test item itself, the ancestor grid cell should be the new test item",
		testItem, lightbox._findReorderableParent(testItem, orderables));
	assertEquals("Given another image, the ancestor grid cell should be new test item",
		testItem, lightbox._findReorderableParent(testItem.getElementsByTagName("img")[0], orderables));
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
	
	var lightboxDOMNode = dojo.byId(lightboxRootId);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-down-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-down-arrow, expect third image to be second", thirdImageId, thumbArray[1].id);
	assertEquals("after ctrl-down-arrow, expect fourth image to be third", fourthImageId, thumbArray[2].id);
	assertEquals("after ctrl-down-arrow, expect first image to be fourth", firstImageId, thumbArray[3].id);
	assertEquals("after ctrl-down-arrow, expect fifth image to still be fifth", fifthImageId, thumbArray[4].id);

	// Test: ctrl up arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlUpArrow());
	itemsInOriginalPositionTest("after ctrl-up", dojo.byId(lightboxRootId));
 }
 
 function testHandleArrowKeyPressWrapThumbUp() {
	// Test: ctrl up arrow - move the first image 'up'
	var lightbox = createLightbox();
	lightbox.selectActiveItem();

	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlUpArrow());
	
	lightboxDOMNode = dojo.byId(lightboxRootId);
	thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-up-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-up-arrow, expect third image to be second", thirdImageId, thumbArray[1].id);
	assertEquals("after ctrl-up-arrow, expect fifth image to be fourth", fifthImageId, thumbArray[3].id);
	assertEquals("after ctrl-up-arrow, expect first image to be second last", firstImageId, thumbArray[12].id);
	assertEquals("after ctrl-up-arrow, expect last image to still be last", lastImageId, thumbArray[13].id);

	// Test: ctrl down arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlDownArrow());
	itemsInOriginalPositionTest("after ctrl-down wrap", dojo.byId(lightboxRootId));

}

function itemsInOriginalPositionTest(desc, lightboxDOMNode) {
	thumbArray = lightboxDOMNode.getElementsByTagName("img");
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

function testHandleArrowKeyPressForUpAndDown() {
	var lightbox = createLightbox();
	// setup: force the grid to have four columns
	dojo.removeClass(dojo.byId(lightboxRootId), "width-3-thumb");
	dojo.addClass(dojo.byId(lightboxRootId), "width-4-thumb");
	
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

function isItemDefaultTest(message, itemId) {
	var element = document.getElementById(itemId);
	assertTrue(message + itemId  +  " should be default", dojo.hasClass(element, defaultClass));	
	assertFalse(message + itemId  +  " not be focused", dojo.hasClass(element, selectedClass));
	assertFalse(message + itemId  +  " not be dragging", dojo.hasClass(element, draggingClass));
}

function isItemFocusedTest(message, itemId) {
	var element = document.getElementById(itemId);
	assertTrue(message + itemId  +  " should be focused", dojo.hasClass(element, selectedClass));	
	assertFalse(message + itemId  +  " should not be default",dojo.hasClass(element, defaultClass));
	assertFalse(message + itemId  +  " should not be default",dojo.hasClass(element, draggingClass));
}

function isItemDraggedTest(message, itemId) {
	var element = document.getElementById(itemId);
	assertTrue(message + itemId  +  " should be dragging", dojo.hasClass(element, draggingClass));	
	assertFalse(message + itemId  +  " should not be default",dojo.hasClass(element, defaultClass));
	assertFalse(message + itemId  +  " not should be focused", dojo.hasClass(element, selectedClass));	
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
    lightbox.selectActiveItem();

	// check that none of the images are currently being moved.
	isItemFocusedTest("Initially ", firstReorderableId);
	isItemDefaultTest("Initially ", secondReorderableId);
	isItemDefaultTest("Initially ", secondLastReorderableId);
	
	// focus the first thumb
	lightbox.focusItem(dojo.byId(firstReorderableId));
	
	// ctrl down - expect dragging state to start
	lightbox.handleKeyDown(fluid.testUtils.createEvtCTRL());
	isItemDraggedTest("After ctrl-down, ", firstReorderableId);
	isItemDefaultTest("After ctrl-down, ", secondReorderableId);
	isItemDefaultTest("After ctrl-down, ", secondLastReorderableId);
		
	// right arrow down - all the dragging states should remain the same
	lightbox.handleKeyDown(fluid.testUtils.createEvtRightArrow());
	isItemDraggedTest("After ctrl-down right arrow down, ", firstReorderableId);
	isItemDefaultTest("After ctrl-down right arrow down, ", secondReorderableId);
	isItemDefaultTest("After ctrl-down right arrow down, ", secondLastReorderableId);

	// right arrow with key-up event handler. The dragging states should remain the same.
	lightbox.handleKeyUp(fluid.testUtils.createEvtRightArrow());
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
	var lightboxDOMNode = dojo.byId(lightboxRootId);
	itemsInOriginalPositionTest("after ctrl-down", lightboxDOMNode);
	
	// after ctrl up, order should not change
	lightbox.handleKeyUp(fluid.testUtils.createEvtCTRL());
	itemsInOriginalPositionTest("after ctrl-up", lightboxDOMNode);
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

	var lightboxDOMNode = dojo.byId(lightboxRootId);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-right-arrow, expect second image to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-right-arrow, expect first image to be second", firstImageId, thumbArray[1].id);
	assertEquals("after ctrl-right-arrow, expect last image to be last", lastImageId, thumbArray[numOfImages - 1].id);
	
	// Test: ctrl left arrow - expect first and second image to swap back to original order
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlLeftArrow());
	itemsInOriginalPositionTest("after ctrl-left-arrow", lightboxDOMNode);

	// Test: ctrl left arrow - expect first image to move to last place,
	//       second image to move to first place and last image to move to second-last place
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlLeftArrow());

	thumbArray = lightboxDOMNode.getElementsByTagName("img");;
	assertEquals("after ctrl-left-arrow on first image, expect first last to be last", firstImageId, thumbArray[numOfImages - 1].id);
	assertEquals("after ctrl-left-arrow on first image, expect second to be first", secondImageId, thumbArray[0].id);
	assertEquals("after ctrl-left-arrow on first image, expect last to be second-last", lastImageId, thumbArray[numOfImages - 2].id);

	// Test: ctrl right arrow - expect first image to move back to first place,
	//       second image to move to back second place and thumbLast to move to back last place
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlRightArrow());
	itemsInOriginalPositionTest("after ctrl-left-arrow", lightboxDOMNode);
}

function testPersistFocus () {
	var lightbox = createLightbox();

	isItemDefaultTest("Initially ", firstReorderableId);

    lightbox.selectActiveItem();

	// first thumb nail should be focused initially.
	isItemFocusedTest("When lightbox has focus ", firstReorderableId);
	isItemDefaultTest("When lightbox has focus ", secondReorderableId);
	
	// Change focus to the input1, then back to the lightbox
	var newInputElement = document.createElement("input");
	newInputElement.id="input1";
	dojo.place(newInputElement, dojo.byId("para1"), "after");
	dojo.byId ("input1").focus();
	isItemDefaultTest("After focus leaves the lightbox ", firstReorderableId);
	
	lightbox.getElementToFocus(lightbox.domNode).focus();
	
	// check that the first thumb nail is still moveable.
	isItemFocusedTest("When lightbox has focus again ", firstReorderableId);
	isItemDefaultTest("When lightbox has focus again ", secondReorderableId);
	
	// set focus to another image.
	lightbox.focusItem(dojo.byId(secondReorderableId));
	isItemFocusedTest("Changed focus to second ", secondReorderableId);
	isItemDefaultTest("Changed focus to second ", firstReorderableId);
	
	// Change focus to the input1, then back to the lightbox
	dojo.byId ("input1").focus();
	lightbox.getElementToFocus(lightbox.domNode).focus();
	
	// check that the second thumb nail is still moveable.
	lightbox.focusItem(dojo.byId(secondReorderableId));
	isItemFocusedTest("Lightbox refocused with second selected ", secondReorderableId);
	isItemDefaultTest("Lightbox refocused with second selected ", firstReorderableId);
	
	lightbox.getElementToFocus(lightbox.domNode).blur();
	isItemDefaultTest("Lightbox blur with second selected ", secondReorderableId);
}

function testfocusItem () {
	var lightbox = createLightbox();
	
	// nothing should be focused
	isItemDefaultTest("Initially", firstReorderableId);
	isItemDefaultTest("Initially", secondReorderableId);
	
	// focus the second image
	lightbox.focusItem(dojo.byId(secondReorderableId));
	isItemFocusedTest("After focus on second image ", secondReorderableId);
	
	// focus the image already focused to ensure it remains focused.
	lightbox.focusItem(dojo.byId(secondReorderableId));
	isItemFocusedTest("After refocus on second image ", secondReorderableId);

	// focus a different image and check to see that the previous image is defocused
	// and the new image is focused	
	lightbox.focusItem(dojo.byId (firstReorderableId));
	isItemDefaultTest("After focus on first image ", secondReorderableId);
	isItemFocusedTest("After focus on first image ", firstReorderableId);
}

function testSelectActiveItemNothingSelected() {
	var lightbox = createLightbox();

	isItemDefaultTest("Initially", firstReorderableId);
	lightbox.selectActiveItem();
	isItemFocusedTest("After select active item ", firstReorderableId);
	
	// Now, test it with no reorderables.
	//
	var lightboxWithNoOrderables = createLightboxWithNoOrderables();
	var orderables = lightboxWithNoOrderables.orderableFinder();
	assertEquals ("There should be no 'orderables' in this lightbox", 0, orderables.length);
	lightboxWithNoOrderables.selectActiveItem();
	assertNull ("Lightbox's activeItem member should be null", lightboxWithNoOrderables.activeItem);
}

function testKeypressesWithNoOrderables() {
	
	var lightboxWithNoOrderables = createLightboxWithNoOrderables();
	orderables = lightboxWithNoOrderables.orderableFinder();
	assertEquals ("There should be no 'orderables' in this lightbox", 0, orderables.length);
	
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
	lightbox._setActiveItem(dojo.byId (secondReorderableId));
	
	// before selecting the active item, nothing should have focus	
	isItemDefaultTest("Initially", firstReorderableId);
	isItemDefaultTest("Initially", secondReorderableId);
	
	lightbox.selectActiveItem();
	isItemFocusedTest("after selecting active item ", secondReorderableId);
	isItemDefaultTest("after selecting active item ", firstReorderableId);
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
	lbRoot = dojo.byId(lightboxRootId);
	assertNull("before first lightbox focus, no item should be activedescendent", lbRoot.getAttribute("aaa:activedescendent"));

    lightbox.selectActiveItem();
	assertEquals("after first lightbox focus, first image should be activedescendent", firstReorderableId, lbRoot.getAttribute("aaa:activedescendent"));
	
	lightbox.activeItem = dojo.byId(thirdReorderableId);
	lightbox._updateActiveDescendent();
	assertEquals("after setting active item to third image, third image should be activedescendent", thirdReorderableId, lbRoot.getAttribute("aaa:activedescendent"));

	var newInputElement = document.createElement("input");
	newInputElement.id="input1";
	dojo.place(newInputElement, dojo.byId("para1"), "after");
	dojo.byId ("input1").focus();
	lightbox._updateActiveDescendent();
	assertEquals("after removing focus from lightbox, third image should still be activedescendent", thirdReorderableId, lbRoot.getAttribute("aaa:activedescendent"));

	lightbox.activeItem = null;
	lightbox._updateActiveDescendent();
	assertNull("after unsetting active item, no item should be activedescendent", lbRoot.getAttribute("aaa:activedescendent"));

}

function testUpdateGrabProperty() {
    var lightbox = createLightbox();
    lbRoot = dojo.byId(lightboxRootId);
    var testItem = dojo.byId(firstReorderableId);
    assertEquals("before any action, test item should have grab of supported", "supported", testItem.getAttribute("aaa:grab"));
    
    lightbox.selectActiveItem();
    lightbox.handleKeyDown (fluid.testUtils.createEvtCTRL());
    assertEquals("while CTRL held down, test item should have grab of true", "true", testItem.getAttribute("aaa:grab"));

    lightbox.handleArrowKeyPress (fluid.testUtils.createEvtCtrlRightArrow());
    assertEquals("after arrow while CTRL still held down, test item should have grab of true", "true", testItem.getAttribute("aaa:grab"));
    
    lightbox.handleKeyUp (fluid.testUtils.createEvtCTRL());
    assertEquals("after CTRL released, test item should have grab of supported", "supported", testItem.getAttribute("aaa:grab"));
}

