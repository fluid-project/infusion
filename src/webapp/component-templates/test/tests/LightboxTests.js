
var imgListClone;

function setUp() {
	imgListClone = document.getElementById(lightboxRootId).cloneNode(true);
}

function tearDown() {
	var fluidLightboxDOMNode = document.getElementById(lightboxRootId);
	var lightboxParent = document.getElementById(lightboxParentId);
	lightboxParent.removeChild(fluidLightboxDOMNode);
	lightboxParent.appendChild(imgListClone);
}
	
function focusLightboxNode(lightbox, domNode) {
  lightbox.getElementToFocus(domNode).focus();
}

function createLightbox() {
	var lightbox = new fluid.Lightbox();
	lightbox.setDomNode(dojo.byId(lightboxRootId));
	return lightbox;
}

/*
 * This test tests the movement of images, and does not concern itself
 * with changes of state (i.e. dragging, etc.)
 */
function testHandleArrowKeyPressForCtrlUpAndCtrlDown() {	
	var lightbox = createLightbox();
	focusLightboxNode(lightbox, lightbox.domNode);
	var evtDownArrow = {keyCode: dojo.keys.DOWN_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	var evtUpArrow = {keyCode: dojo.keys.UP_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };

	// setup: force the grid to have three columns
	lightbox.gridLayoutHandler.numOfColumnsInGrid = 3;

	
	// Test: ctrl down arrow 
	lightbox.handleArrowKeyPress(evtDownArrow);
	
	var lightboxDOMNode = dojo.byId(lightboxRootId);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-down-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-down-arrow, expect third image to be second", "fluid.img.3", thumbArray[1].id);
	assertEquals("after ctrl-down-arrow, expect fourth image to be third", "fluid.img.4", thumbArray[2].id);
	assertEquals("after ctrl-down-arrow, expect first image to be fourth", "fluid.img.first", thumbArray[3].id);
	assertEquals("after ctrl-down-arrow, expect fifth image to still be fifth", "fluid.img.5", thumbArray[4].id);

	// Test: ctrl up arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(evtUpArrow);
	helpTestItemsInOriginalPosition("after ctrl-up", dojo.byId(lightboxRootId));

	// Test: ctrl up arrow 
	lightbox.handleArrowKeyPress(evtUpArrow);
	
	lightboxDOMNode = dojo.byId(lightboxRootId);
	thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-up-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-up-arrow, expect third image to be second", "fluid.img.3", thumbArray[1].id);
	assertEquals("after ctrl-up-arrow, expect fifth image to be fourth", "fluid.img.5", thumbArray[3].id);
	assertEquals("after ctrl-up-arrow, expect first image to be second last", "fluid.img.first", thumbArray[12].id);
	assertEquals("after ctrl-up-arrow, expect last image to still be last", "fluid.img.last", thumbArray[13].id);

	// Test: ctrl down arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(evtDownArrow);
	helpTestItemsInOriginalPosition("after ctrl-down wrap", dojo.byId(lightboxRootId));

}

function helpTestItemsInOriginalPosition(desc, lightboxDOMNode) {
	thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals(desc + " expect first image to be first", "fluid.img.first", thumbArray[0].id);
	assertEquals(desc + " expect second image to be second", "fluid.img.second", thumbArray[1].id);
	assertEquals(desc + " expect third image to be third", "fluid.img.3", thumbArray[2].id);
	assertEquals(desc + " expect fourth image to be fourth", "fluid.img.4", thumbArray[3].id);
	assertEquals(desc + " expect fifth image to be fifth", "fluid.img.5", thumbArray[4].id);
	assertEquals(desc + " expect sixth image to be sixth", "fluid.img.6", thumbArray[5].id);
	assertEquals(desc + " expect seventh image to be seventh", "fluid.img.7", thumbArray[6].id);
	assertEquals(desc + " expect eighth image to be eighth", "fluid.img.8", thumbArray[7].id);
	assertEquals(desc + " expect ninth image to be ninth", "fluid.img.9", thumbArray[8].id);
	assertEquals(desc + " expect tenth image to be tenth", "fluid.img.10", thumbArray[9].id);
	assertEquals(desc + " expect fourth last image to be fourth last", "fluid.img.11", thumbArray[10].id);
	assertEquals(desc + " expect third last image to be third last", "fluid.img.12", thumbArray[11].id);
	assertEquals(desc + " expect second last image to be second last", "fluid.img.secondLast", thumbArray[12].id);
	assertEquals(desc + " expect last image to be last", "fluid.img.last", thumbArray[13].id);
}

function testHandleArrowKeyPressForUpAndDown() {
	var lightbox = createLightbox();
	var defaultClass="image-container-default";
	var focusedClass="image-container-selected";
	var draggingClass="image-container-dragging";
	var evtDownArrow = {keyCode: dojo.keys.DOWN_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	var evtUpArrow = {keyCode: dojo.keys.UP_ARROW, preventDefault: function(){}, stopPropagation: function(){} };

	// setup: force the grid to have four columns
	lightbox.gridLayoutHandler.numOfColumnsInGrid = 4;
	focusLightboxNode(lightbox, lightbox.domNode);
	assertTrue("Initially the first image should be focused",dojo.hasClass(document.getElementById(firstImageId), focusedClass));

	// Test: down arrow to the fifth image
	lightbox.handleArrowKeyPress(evtDownArrow);
	assertTrue("After down arrow, first image should be default",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertFalse("After down arrow, first image should not be focused", dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertTrue("After down arrow, fifth image should be focused",dojo.hasClass(document.getElementById(fifthImageId), focusedClass));
	assertFalse("After down arrow, fifth image should not be default", dojo.hasClass(document.getElementById(fifthImageId), defaultClass));

	// Test: up arrow to the first image
	lightbox.handleArrowKeyPress(evtUpArrow);
	assertFalse("After up arrow, first image should not be default",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("After up arrow, first image should be focused", dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertFalse("After up arrow, fifth image should not be focused",dojo.hasClass(document.getElementById(fifthImageId), focusedClass));
	assertTrue("After up arrow, fifth image should be default", dojo.hasClass(document.getElementById(fifthImageId), defaultClass));

	// Test: up arrow to the second last image
	lightbox.handleArrowKeyPress(evtUpArrow);
	assertTrue("After up arrow, first image should be default",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertFalse("After up arrow, first image should not be focused", dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertTrue("After up arrow, second last image should be focused",dojo.hasClass(document.getElementById(secondLastImageId), focusedClass));
	assertFalse("After up arrow, second last image should be default", dojo.hasClass(document.getElementById(secondLastImageId), defaultClass));

	// Test: down arrow to the first image
	lightbox.handleArrowKeyPress(evtDownArrow);
	assertFalse("After down arrow, first image should not be default",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("After down arrow, first image should be focused", dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertFalse("After down arrow, second last image should not be focused",dojo.hasClass(document.getElementById(secondLastImageId), focusedClass));
	assertTrue("After down arrow, second last image should be default", dojo.hasClass(document.getElementById(secondLastImageId), defaultClass));
	
}

function testHandleArrowKeyPressForLeftAndRight()	 {
	var lightbox = createLightbox();
	var defaultClass="image-container-default";
	var focusedClass="image-container-selected";
	var draggingClass="image-container-dragging";
	focusLightboxNode(lightbox, lightbox.domNode);
	
	// set the focus on the first image
	assertTrue("first image should be focused",dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertFalse("first image should not be default", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("second  image should be not focused",dojo.hasClass(document.getElementById(secondImageId), defaultClass));
	assertFalse("second  image should not be focused", dojo.hasClass(document.getElementById(secondImageId), focusedClass));

	// Test: right arrow to the second image
	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleArrowKeyPress(evtRightArrow);
	assertTrue("first image should be default",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertFalse("first image should not be focused", dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertTrue("second image should be focused",dojo.hasClass(document.getElementById(secondImageId), focusedClass));
	assertFalse("second image should not be default", dojo.hasClass(document.getElementById(secondImageId), defaultClass));

	// Test: right arrow to the last image
	for (focusPosition = 2; focusPosition < numOfImages; focusPosition++ ) {
		lightbox.handleArrowKeyPress(evtRightArrow);
	}
	assertTrue("first image should be default", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("second image should be default", dojo.hasClass(document.getElementById(secondImageId), defaultClass));
	assertTrue("last image should be focused", dojo.hasClass(document.getElementById(lastImageId), focusedClass));

	// Test: left arrow to the previous image
	var evtLeftArrow = {keyCode: dojo.keys.LEFT_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleArrowKeyPress(evtLeftArrow);
	assertTrue("left arrow to second first image should be default", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("left arrow to second second-last image should be focused", dojo.hasClass(document.getElementById(secondLastImageId), focusedClass));
	assertTrue("left arrow to second last image should be default", dojo.hasClass(document.getElementById(lastImageId), defaultClass));
	
	// Test: right arrow past the last image - expect wrap to the first image
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	assertTrue("first image should be focused after wrapping", dojo.hasClass(document.getElementById(firstImageId), focusedClass));
	assertFalse("first image should not be default after wrapping", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("second image should be default", dojo.hasClass(document.getElementById(secondImageId), defaultClass));
	assertFalse("second image should not be focused after wrapping", dojo.hasClass(document.getElementById(secondImageId), focusedClass));
	assertTrue("last image should be default", dojo.hasClass(document.getElementById(lastImageId), defaultClass));
	assertFalse("last image should not be focused after wrapping", dojo.hasClass(document.getElementById(lastImageId), focusedClass));
	
	// Test: left arrow on the first image - expect wrap to the last image
	lightbox.handleArrowKeyPress(evtLeftArrow);
	assertTrue("first image should be default", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("second image should be default", dojo.hasClass(document.getElementById(secondImageId), defaultClass));
	assertTrue("last image should be focused", dojo.hasClass(document.getElementById(lastImageId), focusedClass));
}

function testHandleKeyUpAndHandleKeyDownChangesState() {
	var lightbox = createLightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";
	var draggingClass="image-container-dragging";
	focusLightboxNode(lightbox, lightbox.domNode);

	// check that none of the images are currently being moved.
	assertFalse("first image should not be in move state to start",dojo.hasClass(document.getElementById(firstImageId), draggingClass));
	assertFalse("second image should not be in move state to start",dojo.hasClass(document.getElementById(secondImageId), draggingClass));
	assertFalse("second-last image should not be in move state to start",dojo.hasClass(document.getElementById(secondLastImageId), draggingClass));
	
	// focus the first thumb
	lightbox.focusItem(dojo.byId(firstImageId));
	
	// ctrl down - expect dragging state to start
	var evtCTRL = {keyCode: dojo.keys.CTRL, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleKeyDown(evtCTRL);
	assertTrue("first image should be in move state after ctrl-down",dojo.hasClass(document.getElementById(firstImageId), draggingClass));
	assertFalse("second image should not be in move state after ctrl-down",dojo.hasClass(document.getElementById(secondImageId), draggingClass));
	assertFalse("second-last image should not be in move state after ctrl-down",dojo.hasClass(document.getElementById(secondLastImageId), draggingClass));
	assertFalse("first image should not be focused after ctrl-down", dojo.hasClass(document.getElementById(firstImageId), focusClass));
	
	// right arrow down - all the dragging states should remain the same
	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleKeyDown(evtRightArrow);
	assertTrue("first image should still be in move state after right-arrow",dojo.hasClass(document.getElementById(firstImageId), draggingClass));
	assertFalse("second image should still not be in move state after right-arrow",dojo.hasClass(document.getElementById(secondImageId), draggingClass));
	assertFalse("second-last image should still not be in move state after right-arrow",dojo.hasClass(document.getElementById(secondLastImageId), draggingClass));
	assertFalse("first image should not be focused after right-arrow", dojo.hasClass(document.getElementById(firstImageId), focusClass));

	// right arrow with key-up event handler. The dragging states should remain the same.
	lightbox.handleKeyUp(evtRightArrow);
	assertTrue("first image should still be in move state after right-arrow up",dojo.hasClass(document.getElementById(firstImageId), draggingClass));
	assertFalse("second image should still not be in move state after right-arrow up",dojo.hasClass(document.getElementById(secondImageId), draggingClass));
	assertFalse("second-last image should still not be in move state after right-arrow up",dojo.hasClass(document.getElementById(secondLastImageId), draggingClass));
	assertFalse("first image should not be focused after right-arrow up", dojo.hasClass(document.getElementById(firstImageId), focusClass));

    // ctrl up - expect dragging to end
	lightbox.handleKeyUp(evtCTRL);
	assertFalse("first image should no longer be in move state after ctrl up",dojo.hasClass(document.getElementById(firstImageId), draggingClass));
	assertFalse("second image should still not be in move state after ctrl up",dojo.hasClass(document.getElementById(secondImageId), draggingClass));
	assertFalse("second-last image should still not be in move state after ctrl up",dojo.hasClass(document.getElementById(secondLastImageId), draggingClass));
	assertTrue("first image should be focused after ctrl up", dojo.hasClass(document.getElementById(firstImageId), focusClass));
}

function testHandleKeyUpAndHandleKeyDownItemMovement() {
	var lightbox = createLightbox();
	focusLightboxNode(lightbox, lightbox.domNode);

	var evtCTRL = {keyCode: dojo.keys.CTRL, preventDefault: function(){}, stopPropagation: function(){} };

	// after ctrl down, order should not change
	lightbox.handleKeyDown(evtCTRL);
	var lightboxDOMNode = dojo.byId(lightboxRootId);
	helpTestItemsInOriginalPosition("after ctrl-down", lightboxDOMNode);
	
	// after ctrl up, order should not change
	lightbox.handleKeyUp(evtCTRL);
	helpTestItemsInOriginalPosition("after ctrl-up", lightboxDOMNode);
}

/*
 * This test tests the movement of images, and does not concern itself
 * with changes of state (i.e. dragging, etc.)
 */
function testHandleArrowKeyPressForCtrlLeftAndCtrlRight() {	
	var lightbox = createLightbox();
	focusLightboxNode(lightbox, lightbox.domNode);

	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	var evtLeftArrow = {keyCode: dojo.keys.LEFT_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	
	// Test: ctrl right arrow - expect first and second image to swap
	lightbox.handleArrowKeyPress(evtRightArrow);

	var lightboxDOMNode = dojo.byId(lightboxRootId);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-right-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-right-arrow, expect first image to be second", "fluid.img.first", thumbArray[1].id);
	assertEquals("after ctrl-right-arrow, expect last image to be last", "fluid.img.last", thumbArray[numOfImages - 1].id);
	
	// Test: ctrl left arrow - expect first and second image to swap back to original order
	lightbox.handleArrowKeyPress(evtLeftArrow);
	helpTestItemsInOriginalPosition("after ctrl-left-arrow", lightboxDOMNode);

	// Test: ctrl left arrow - expect first image to move to last place,
	//       second image to move to first place and last image to move to second-last place
	lightbox.handleArrowKeyPress(evtLeftArrow);

	thumbArray = lightboxDOMNode.getElementsByTagName("img");;
	assertEquals("after ctrl-left-arrow on first image, expect first last to be last", "fluid.img.first", thumbArray[numOfImages - 1].id);
	assertEquals("after ctrl-left-arrow on first image, expect second to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-left-arrow on first image, expect last to be second-last", "fluid.img.last", thumbArray[numOfImages - 2].id);

	// Test: ctrl right arrow - expect first image to move back to first place,
	//       second image to move to back second place and thumbLast to move to back last place
	lightbox.handleArrowKeyPress(evtRightArrow);
	helpTestItemsInOriginalPosition("after ctrl-left-arrow", lightboxDOMNode);

}

function testPersistFocus () {
	var lightbox = createLightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";

	assertFalse("first image should not be focused before lightbox has focus",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertTrue("first image should not be focused before lightbox has focus",dojo.hasClass(document.getElementById(firstImageId), defaultClass));

	focusLightboxNode(lightbox, lightbox.domNode);

	// first thumb nail should be focused initially.
	assertTrue("Persist Focus Test: first image should be moveable",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertFalse("Persist Focus Test: second image should not be focused",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	assertFalse("Persist Focus Test: second-last image should not be focused",dojo.hasClass(document.getElementById(secondLastImageId), focusClass));
	
	// Change focus to the input1, then back to the lightbox
	dojo.byId ("input1").focus();
	focusLightboxNode(lightbox, lightbox.domNode);
	
	// check that the first thumb nail is still moveable.
	assertTrue("Persist Focus Test: first image should be moveable",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertFalse("Persist Focus Test: second image should not be focused",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	assertFalse("Persist Focus Test: second-last image should not be focused",dojo.hasClass(document.getElementById(secondLastImageId), focusClass));
	
	// set focus to another image.
	lightbox.focusItem(dojo.byId(secondImageId));
	assertFalse("Persist Focus Test: first image should not be focused",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertTrue ("Persist Focus Test: second image should be moveable",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	assertFalse("Persist Focus Test: second-last should not be focused",dojo.hasClass(document.getElementById(secondLastImageId), focusClass));
	
	// Change focus to the input1, then back to the lightbox
	dojo.byId ("input1").focus();
	focusLightboxNode(lightbox, lightbox.domNode);
	
	// check that the first thumb nail is still moveable.
	lightbox.focusItem(dojo.byId(secondImageId));
	assertFalse("Persist Focus Test: first image should not be focused",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertTrue ("Persist Focus Test: second image should be moveable",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	assertFalse("Persist Focus Test: second-last image should not be focused",dojo.hasClass(document.getElementById(secondLastImageId), focusClass));
	
	lightbox.getElementToFocus(lightbox.domNode).blur();
	assertTrue("after lightbox blur, focusedItem should not be selected", dojo.hasClass(document.getElementById(secondImageId), defaultClass));

	// test persistance of focus between page navigation / page loads?	
}


function testfocusItem () {
	var lightbox = createLightbox();
 	var defaultClass="image-container-default";
	var focusClass="image-container-selected";
	var draggingClass="image-container-dragging";
	
	// nothing should be focused
	assertFalse("first image should not be focused initially",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertFalse("second image should not be focused initially",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	assertTrue("first image should have a default look initially",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("second image should have a default look initially",dojo.hasClass(document.getElementById(secondImageId), defaultClass));
		
	// focus the second image
	lightbox.focusItem(dojo.byId(secondImageId));

	// test the response to the focus
	assertFalse("second image should not be default after it's focused", dojo.hasClass(document.getElementById(secondImageId), defaultClass));
	assertTrue("second image should be focused after it's focused", dojo.hasClass(document.getElementById(secondImageId), focusClass));
	
	// focus the image already focused to ensure it remains focused.
	lightbox.focusItem(dojo.byId(secondImageId));
	assertTrue("second image should be focused after it's focused again",dojo.hasClass(document.getElementById(secondImageId), focusClass));

	// Test: focus a different image and check to see that the previous image is defocused
	// and the new image is focused	
	lightbox.focusItem(dojo.byId (firstImageId));
	
	// previous image defocused
	assertTrue("second image should be default after the first image is focused",dojo.hasClass(document.getElementById(secondImageId), defaultClass));
	assertFalse("second image should not be focused after the first image is focused",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	
	// new image focused
	assertFalse("first image should not be default after the first image is focused",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("first image should be focused after the first image is focused",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	
}

function testSelectActiveItem() {
	var lightbox = createLightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";

	// before starting, nothing should have focus	
	assertTrue("first image should not be initially focused",dojo.hasClass(document.getElementById(firstImageId), defaultClass));

	lightbox.selectActiveItem();
	assertFalse("after selecting active item, first image should not be default",dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	assertTrue("after selecting active item, first image should be focused",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	
	// change active item to something else, and remove focus
	lightbox.domNode.blur();
	lightbox.activeItem = dojo.byId (secondImageId);
	// active item should not be focused
	assertFalse("after removing focus from lightbox, first image should be not focused",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertFalse("after removing focus from lightbox, second image should not be focused",dojo.hasClass(document.getElementById(secondImageId), focusClass));
	
	// return focus to the lightbox, active item should get focused (not first item)
	lightbox.selectActiveItem();
	assertFalse("after selecting active item, first image should be not focused",dojo.hasClass(document.getElementById(firstImageId), focusClass));
	assertTrue("after selecting active item, second image should be focused",dojo.hasClass(document.getElementById(secondImageId), focusClass));
}

function testSetActiveItemToDefaultState() {
	var lightbox = createLightbox();
	var defaultClass="image-container-default";
	
	// first set up an active item so that it's not in a default state
	focusLightboxNode(lightbox,dojo.byId (firstImageId));
	assertFalse("before testing, first image should not be in default state", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	
	lightbox.setActiveItemToDefaultState();
	assertTrue("after resetting active item, first image should be in default state", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
}

function testHandleWindowResizeEvent() {
	var lightbox = createLightbox();
	var oldNumCols = lightbox.gridLayoutHandler.numOfColumnsInGrid;

	// change the width
	dojo.removeClass(dojo.byId(lightboxParentId), "full-width");
	dojo.addClass(dojo.byId(lightboxParentId), "half-width");
	
	// tell the lightbox of the change
	var resizeEvent = {foo: "bar"};
	lightbox.handleWindowResizeEvent(resizeEvent);
	assertEquals("after resize, the grid width should be "+oldNumCols/2, oldNumCols/2, lightbox.gridLayoutHandler.numOfColumnsInGrid);

	// change it back
	dojo.removeClass(dojo.byId(lightboxParentId), "half-width");
	dojo.addClass(dojo.byId(lightboxParentId), "full-width");
	
	// tell the lightbox of the change
	var resizeEvent = {foo: "bar"};
	lightbox.handleWindowResizeEvent(resizeEvent);
	assertEquals("after resize, the grid width should be "+oldNumCols, oldNumCols, lightbox.gridLayoutHandler.numOfColumnsInGrid);
}

function testUpdateActiveDescendent() {
	var lightbox = createLightbox();
	lbRoot = dojo.byId(lightboxRootId);
	assertFalse("before first lightbox focus, no item should be activedescendent", lbRoot.hasAttribute("aaa:activedescendent"));

	lightbox.domNode.focus();
	assertEquals("after first lightbox focus, first image should be activedescendent", firstImageId, lbRoot.getAttribute("aaa:activedescendent"));
	
	lightbox.activeItem = dojo.byId(thirdImageId);
	lightbox._updateActiveDescendent();
	assertEquals("after setting active item to third image, third image should be activedescendent", thirdImageId, lbRoot.getAttribute("aaa:activedescendent"));

	lightbox.domNode.blur();
	lightbox._updateActiveDescendent();
	assertEquals("after removing focus from lightbox, third image should still be activedescendent", thirdImageId, lbRoot.getAttribute("aaa:activedescendent"));

	lightbox.activeItem = null;
	lightbox._updateActiveDescendent();
	assertFalse("after unsetting active item, no item should be activedescendent", lbRoot.hasAttribute("aaa:activedescendent"));

}