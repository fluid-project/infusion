var imgListClone;

var numOfImages = 14;
var firstImageId = "gallery:::gallery-thumbs:::lightbox-cell::0:";
var secondImageId = "gallery:::gallery-thumbs:::lightbox-cell::1:";
var secondLastImageId = "gallery:::gallery-thumbs:::lightbox-cell::12:";
var lastImageId = "gallery:::gallery-thumbs:::lightbox-cell::13:";

function setUp() {
	imgListClone = document.getElementById("gallery:::gallery-thumbs:::").cloneNode(true);
}

function tearDown() {
	var fluidLightboxDOMNode = document.getElementById("gallery:::gallery-thumbs:::");
	var lightboxParent = document.getElementById("lightbox-parent");
	lightboxParent.removeChild(fluidLightboxDOMNode);
	lightboxParent.appendChild(imgListClone);
}
	
function focusLightboxNode(lightbox, domNode) {
  lightbox.getElementToFocus(domNode).focus();
}


function testHandleArrowKeyPressForLeftAndRight()	 {
	var lightbox = new fluid.Lightbox();
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
	var lightbox = new fluid.Lightbox();
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
	var lightbox = new fluid.Lightbox();
	focusLightboxNode(lightbox, lightbox.domNode);

	var evtCTRL = {keyCode: dojo.keys.CTRL, preventDefault: function(){}, stopPropagation: function(){} };

	// after ctrl down, order should not change
	lightbox.handleKeyDown(evtCTRL);
	var lightboxDOMNode = dojo.byId("gallery:::gallery-thumbs:::");
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl key down, first image should still be first", "fluid.img.first", thumbArray[0].id);
	assertEquals("after ctrl key down, second image should still be second", "fluid.img.second", thumbArray[1].id);
	assertEquals("after ctrl key down, last image should still be last", "fluid.img.last", thumbArray[numOfImages - 1].id);
	
	// after ctrl up, order should not change
	lightbox.handleKeyUp(evtCTRL);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl key up, first image should still be first", "fluid.img.first", thumbArray[0].id);
	assertEquals("after ctrl key up, second image should still be second", "fluid.img.second", thumbArray[1].id);
	assertEquals("after ctrl key up, last image should still be last", "fluid.img.last", thumbArray[numOfImages - 1].id);
}

/*
 * This test tests the movement of images, and does not concern itself
 * with changes of state (i.e. dragging, etc.)
 */
function testHandleArrowKeyPressForCtrlLeftAndCtrlRight() {	
	var lightbox = new fluid.Lightbox();
	focusLightboxNode(lightbox, lightbox.domNode);

	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	var evtLeftArrow = {keyCode: dojo.keys.LEFT_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	
	// Test: ctrl right arrow - expect first and second image to swap
	lightbox.handleArrowKeyPress(evtRightArrow);

	var lightboxDOMNode = dojo.byId("gallery:::gallery-thumbs:::");
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-right-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-right-arrow, expect first image to be second", "fluid.img.first", thumbArray[1].id);
	assertEquals("after ctrl-right-arrow, expect last image to be last", "fluid.img.last", thumbArray[numOfImages - 1].id);
	
	// Test: ctrl left arrow - expect first and second image to swap back to original order
	lightbox.handleArrowKeyPress(evtLeftArrow);

	thumbArray = lightboxDOMNode.getElementsByTagName("img");;
	assertEquals("after ctrl-left-arrow, expect first image to be first", "fluid.img.first", thumbArray[0].id);
	assertEquals("after ctrl-left-arrow, expect second image to be second", "fluid.img.second", thumbArray[1].id);
	assertEquals("after ctrl-left-arrow, expect first last to be last", "fluid.img.last", thumbArray[numOfImages - 1].id);

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

	thumbArray = lightboxDOMNode.getElementsByTagName("img");;
	assertEquals("after ctrl-right-arrow on first image (currently in last position), expect first to be first", "fluid.img.first", thumbArray[0].id);
	assertEquals("after ctrl-right-arrow on first image (currently in last position), expect second to be second", "fluid.img.second", thumbArray[1].id);
	assertEquals("after ctrl-right-arrow on first image (currently in last position), expect last to be last", "fluid.img.last", thumbArray[numOfImages - 1].id);

}

function testPersistFocus () {
	var lightbox = new fluid.Lightbox();
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
	var lightbox = new fluid.Lightbox();
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
	var lightbox = new fluid.Lightbox();
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
	var lightbox = new fluid.Lightbox();
	var defaultClass="image-container-default";
	
	// first set up an active item so that it's not in a default state
	focusLightboxNode(lightbox,dojo.byId (firstImageId));
	assertFalse("before testing, first image should not be in default state", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
	
	lightbox.setActiveItemToDefaultState();
	assertTrue("after resetting active item, first image should be in default state", dojo.hasClass(document.getElementById(firstImageId), defaultClass));
}

