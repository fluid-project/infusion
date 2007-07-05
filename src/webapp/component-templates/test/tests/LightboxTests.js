dojo.require("dojo.i18n");

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
	return new fluid.Lightbox(
	    {tagNameToFocus: "a",
	     tagNameIndexToFocus : 0,
	     orderChangedCallback: function(){}}
	     , lightboxRootId);
}

function testFindAncestorGridCell() {
	var lightbox = createLightbox();
	
	var testItem = dojo.byId(firstImageId);
	assertEquals("The test item's role attribute should be gridcell",
		"wairole:gridcell", testItem.getAttribute("xhtml10:role"));

	assertEquals("Given the test item itself, the ancestor grid cell should be the test item",
		testItem, lightbox._findAncestorGridCell(testItem));
	assertEquals("Given the image, the ancestor grid cell should be the test item",
		testItem, lightbox._findAncestorGridCell(testItem.getElementsByTagName("img")[0]));
	assertEquals("Given the caption div, the ancestor grid cell should be the test item",
		testItem, lightbox._findAncestorGridCell(testItem.getElementsByTagName("div")[2]));
	assertEquals("Given the caption anchor, the ancestor grid cell should be the test item",
		testItem, lightbox._findAncestorGridCell(testItem.getElementsByTagName("a")[1]));
	assertEquals("Given the title of the document, the ancestor grid cell should be null",
		null, lightbox._findAncestorGridCell(document.body.getElementsByTagName("title")[0]));
	
	testItem = dojo.byId(fourthImageId);
	assertEquals("Given another test item itself, the ancestor grid cell should be the new test item",
		testItem, lightbox._findAncestorGridCell(testItem));
	assertEquals("Given another image, the ancestor grid cell should be new test item",
		testItem, lightbox._findAncestorGridCell(testItem.getElementsByTagName("img")[0]));
}

/*
 * This test tests the movement of images, and does not concern itself
 * with changes of state (i.e. dragging, etc.)
 */
function testHandleArrowKeyPressForCtrlUpAndCtrlDown() {	
	var lightbox = createLightbox();
	lightbox.selectActiveItem();

	// setup: force the grid to have three columns
	lightbox.gridLayoutHandler.numOfColumnsInGrid = 3;

	// Test: ctrl down arrow - move the first image down
	lightbox.handleArrowKeyPress(evtCtrlDownArrow);
	
	var lightboxDOMNode = dojo.byId(lightboxRootId);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-down-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-down-arrow, expect third image to be second", "fluid.img.3", thumbArray[1].id);
	assertEquals("after ctrl-down-arrow, expect fourth image to be third", "fluid.img.4", thumbArray[2].id);
	assertEquals("after ctrl-down-arrow, expect first image to be fourth", "fluid.img.first", thumbArray[3].id);
	assertEquals("after ctrl-down-arrow, expect fifth image to still be fifth", "fluid.img.5", thumbArray[4].id);

	// Test: ctrl up arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(evtCtrlUpArrow);
	itemsInOriginalPositionTest("after ctrl-up", dojo.byId(lightboxRootId));

	// Test: ctrl up arrow - move the first image 'up'
	lightbox.handleArrowKeyPress(evtCtrlUpArrow);
	
	lightboxDOMNode = dojo.byId(lightboxRootId);
	thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-up-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-up-arrow, expect third image to be second", "fluid.img.3", thumbArray[1].id);
	assertEquals("after ctrl-up-arrow, expect fifth image to be fourth", "fluid.img.5", thumbArray[3].id);
	assertEquals("after ctrl-up-arrow, expect first image to be second last", "fluid.img.first", thumbArray[12].id);
	assertEquals("after ctrl-up-arrow, expect last image to still be last", "fluid.img.last", thumbArray[13].id);

	// Test: ctrl down arrow - expect everything to go back to the original state
	lightbox.handleArrowKeyPress(evtCtrlDownArrow);
	itemsInOriginalPositionTest("after ctrl-down wrap", dojo.byId(lightboxRootId));

}

function itemsInOriginalPositionTest(desc, lightboxDOMNode) {
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
	// setup: force the grid to have four columns
	lightbox.gridLayoutHandler.numOfColumnsInGrid = 4;
  lightbox.selectActiveItem();
	
	isItemFocusedTest("Initially ", firstImageId);

	// Test: down arrow to the fifth image
	lightbox.handleArrowKeyPress(evtDownArrow);
	isItemDefaultTest("After down arrow ", firstImageId);
	isItemFocusedTest("After down arrow ", fifthImageId);

	// Test: up arrow to the first image
	lightbox.handleArrowKeyPress(evtUpArrow);
	isItemFocusedTest("After up arrow ", firstImageId);
	isItemDefaultTest("After up arrow ", fifthImageId);

	// Test: up arrow to the second last image
	lightbox.handleArrowKeyPress(evtUpArrow);
	isItemDefaultTest("After up arrow wrap ", firstImageId);
	isItemFocusedTest("After up arrow wrap ", secondLastImageId);

	// Test: tool tip is showing.
	// The tooltip is temporarily disabled; when it is properly styled and behaving,
	// the test will be re-enabled.
	// isTooltipShowingTest(lightbox.activeItem);

	// Test: down arrow to the first image
	lightbox.handleArrowKeyPress(evtDownArrow);
	isItemFocusedTest("After down arrow wrap ", firstImageId);
	isItemDefaultTest("After down arrow wrap ", secondLastImageId);
	
	// Test: tool tip is showing.
	// The tooltip is temporarily disabled; when it is properly styled and behaving,
	// the test will be re-enabled.
	// isTooltipShowingTest(lightbox.activeItem);	
}

function isItemDefaultTest(message, itemId) {
	assertTrue(message + itemId  +  " should be default", dojo.hasClass(document.getElementById(itemId), defaultClass));	
	assertFalse(message + itemId  +  " not be focused", dojo.hasClass(document.getElementById(itemId), focusedClass));
	assertFalse(message + itemId  +  " not be dragging", dojo.hasClass(document.getElementById(itemId), draggingClass));
}

function isItemFocusedTest(message, itemId) {
	assertTrue(message + itemId  +  " should be focused", dojo.hasClass(document.getElementById(itemId), focusedClass));	
	assertFalse(message + itemId  +  " should not be default",dojo.hasClass(document.getElementById(itemId), defaultClass));
	assertFalse(message + itemId  +  " should not be default",dojo.hasClass(document.getElementById(itemId), draggingClass));
}

function isItemDraggedTest(message, itemId) {
	assertTrue(message + itemId  +  " should be dragging", dojo.hasClass(document.getElementById(itemId), draggingClass));	
	assertFalse(message + itemId  +  " should not be default",dojo.hasClass(document.getElementById(itemId), defaultClass));
	assertFalse(message + itemId  +  " not should be focused", dojo.hasClass(document.getElementById(itemId), focusedClass));	
}

function isTooltipShowingTest(activeItem) {

	var tooltipDiv = dojo.byId ("dojoTooltip");

	// test that the tooltip is showing.
	assertNotNull ("the tooltip div should not be null", tooltipDiv);
	assertNotEquals ("The tooltip should have a style (i.e. showing)", "", tooltipDiv.style);


	// test the contents of the tooltip is not empty.
	var tooltipContainer = tooltipDiv.getElementsByTagName ("div")[0];
	assertNotNull ("<tooltipContainer> should not be null nor undefined", tooltipContainer);
	
	var tooltipFromDoc = tooltipContainer.innerHTML;

	assertNotNull ("Tooltip text should not be null",tooltipFromDoc);
	assertNotEquals ("Tooltip text should have length greater than zero", 0, tooltipFromDoc.length);
}

function testHandleArrowKeyPressForLeftAndRight()	 {
	var lightbox = createLightbox();
  lightbox.selectActiveItem();
	
	isItemFocusedTest("Initially ", firstImageId);
	isItemDefaultTest("Initially ", secondImageId);

	// Test: right arrow to the second image
	lightbox.handleArrowKeyPress(evtRightArrow);
	isItemFocusedTest("After right arrow ", secondImageId);
	isItemDefaultTest("After right arrow ", firstImageId);

	// Test: right arrow to the last image
	for (focusPosition = 2; focusPosition < numOfImages; focusPosition++ ) {
		lightbox.handleArrowKeyPress(evtRightArrow);
	}
	isItemFocusedTest("Right arrow to last ", lastImageId);
	isItemDefaultTest("Right arrow to last ", firstImageId);
	isItemDefaultTest("Right arrow to last ", secondImageId);
	
	// Test: left arrow to the previous image
	lightbox.handleArrowKeyPress(evtLeftArrow);
	isItemFocusedTest("Left arrow to second last ", secondLastImageId);
	isItemDefaultTest("Left arrow to second last ", firstImageId);
	isItemDefaultTest("Left arrow to second last ", lastImageId);
	
	// Test: right arrow past the last image - expect wrap to the first image
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	isItemFocusedTest("Right arrow wrap ", firstImageId);
	isItemDefaultTest("Right arrow wrap ", secondImageId);
	isItemDefaultTest("Right arrow wrap ", lastImageId);

	// Test: left arrow on the first image - expect wrap to the last image
	lightbox.handleArrowKeyPress(evtLeftArrow);
	isItemFocusedTest("Left arrow wrap ", lastImageId);
	isItemDefaultTest("Left arrow wrap ", firstImageId);
	isItemDefaultTest("Left arrow wrap ", secondImageId);

}

function testHandleKeyUpAndHandleKeyDownChangesState() {
	var lightbox = createLightbox();
  lightbox.selectActiveItem();

	// check that none of the images are currently being moved.
	isItemFocusedTest("Initially ", firstImageId);
	isItemDefaultTest("Initially ", secondImageId);
	isItemDefaultTest("Initially ", secondLastImageId);
	
	// focus the first thumb
	lightbox.focusItem(dojo.byId(firstImageId));
	
	// ctrl down - expect dragging state to start
	lightbox.handleKeyDown(evtCTRL);
	isItemDraggedTest("After ctrl-down, should be in move state ", firstImageId);
	isItemDefaultTest("After ctrl-down, ", secondImageId);
	isItemDefaultTest("After ctrl-down, ", secondLastImageId);
		
	// right arrow down - all the dragging states should remain the same
	lightbox.handleKeyDown(evtRightArrow);
	isItemDraggedTest("After ctrl-down right arrow down, should be in move state ", firstImageId);
	isItemDefaultTest("After ctrl-down right arrow down, ", secondImageId);
	isItemDefaultTest("After ctrl-down right arrow down, ", secondLastImageId);

	// right arrow with key-up event handler. The dragging states should remain the same.
	lightbox.handleKeyUp(evtRightArrow);
	isItemDraggedTest("After ctrl-down right arrow up, should be in move state ", firstImageId);
	isItemDefaultTest("After ctrl-down right arrow up, ", secondImageId);
	isItemDefaultTest("After ctrl-down right arrow up, ", secondLastImageId);

    // ctrl up - expect dragging to end
	lightbox.handleKeyUp(evtCTRL);
	isItemFocusedTest("After ctrl-up ", firstImageId);
	isItemDefaultTest("After ctrl-up ", secondImageId);
	isItemDefaultTest("After ctrl-up ", secondLastImageId);
}

function testHandleKeyUpAndHandleKeyDownItemMovement() {
	var lightbox = createLightbox();
  lightbox.selectActiveItem();

	// after ctrl down, order should not change
	lightbox.handleKeyDown(evtCTRL);
	var lightboxDOMNode = dojo.byId(lightboxRootId);
	itemsInOriginalPositionTest("after ctrl-down", lightboxDOMNode);
	
	// after ctrl up, order should not change
	lightbox.handleKeyUp(evtCTRL);
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
	lightbox.handleArrowKeyPress(evtCtrlRightArrow);

	var lightboxDOMNode = dojo.byId(lightboxRootId);
	var thumbArray = lightboxDOMNode.getElementsByTagName("img");
	assertEquals("after ctrl-right-arrow, expect second image to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-right-arrow, expect first image to be second", "fluid.img.first", thumbArray[1].id);
	assertEquals("after ctrl-right-arrow, expect last image to be last", "fluid.img.last", thumbArray[numOfImages - 1].id);
	
	// Test: ctrl left arrow - expect first and second image to swap back to original order
	lightbox.handleArrowKeyPress(evtCtrlLeftArrow);
	itemsInOriginalPositionTest("after ctrl-left-arrow", lightboxDOMNode);

	// Test: ctrl left arrow - expect first image to move to last place,
	//       second image to move to first place and last image to move to second-last place
	lightbox.handleArrowKeyPress(evtCtrlLeftArrow);

	thumbArray = lightboxDOMNode.getElementsByTagName("img");;
	assertEquals("after ctrl-left-arrow on first image, expect first last to be last", "fluid.img.first", thumbArray[numOfImages - 1].id);
	assertEquals("after ctrl-left-arrow on first image, expect second to be first", "fluid.img.second", thumbArray[0].id);
	assertEquals("after ctrl-left-arrow on first image, expect last to be second-last", "fluid.img.last", thumbArray[numOfImages - 2].id);

	// Test: ctrl right arrow - expect first image to move back to first place,
	//       second image to move to back second place and thumbLast to move to back last place
	lightbox.handleArrowKeyPress(evtCtrlRightArrow);
	itemsInOriginalPositionTest("after ctrl-left-arrow", lightboxDOMNode);
}

function testPersistFocus () {
	var lightbox = createLightbox();

	isItemDefaultTest("Initially ", firstImageId);

  lightbox.selectActiveItem();

	// first thumb nail should be focused initially.
	isItemFocusedTest("When lightbox has focus ", firstImageId);
	isItemDefaultTest("When lightbox has focus ", secondImageId);
	
	// Change focus to the input1, then back to the lightbox
	dojo.byId ("input1").focus();
//	lightbox.domNode.blur();
	isItemDefaultTest("After blur ", firstImageId);
	
	focusLightboxNode(lightbox, lightbox.domNode);
	
	// check that the first thumb nail is still moveable.
	isItemFocusedTest("When lightbox has focus again ", firstImageId);
	isItemDefaultTest("When lightbox has focus again ", secondImageId);
	
	// set focus to another image.
	lightbox.focusItem(dojo.byId(secondImageId));
	isItemFocusedTest("Changed focus to second ", secondImageId);
	isItemDefaultTest("Changed focus to second ", firstImageId);
	
	// Change focus to the input1, then back to the lightbox
	dojo.byId ("input1").focus();
	focusLightboxNode(lightbox, lightbox.domNode);
	
	// check that the second thumb nail is still moveable.
	lightbox.focusItem(dojo.byId(secondImageId));
	isItemFocusedTest("Lightbox refocused with second selected ", secondImageId);
	isItemDefaultTest("Lightbox refocused with second selected ", firstImageId);
	
	lightbox.getElementToFocus(lightbox.domNode).blur();
	isItemDefaultTest("Lightbox blur with second selected ", secondImageId);

	// test persistance of focus between page navigation / page loads?	
}


function testfocusItem () {
	var lightbox = createLightbox();
	
	// nothing should be focused
	isItemDefaultTest("Initially", firstImageId);
	isItemDefaultTest("Initially", secondImageId);
	
	// focus the second image
	lightbox.focusItem(dojo.byId(secondImageId));
	isItemFocusedTest("After focus on second image ", secondImageId);
	
	// focus the image already focused to ensure it remains focused.
	lightbox.focusItem(dojo.byId(secondImageId));
	isItemFocusedTest("After refocus on second image ", secondImageId);

	// Test: focus a different image and check to see that the previous image is defocused
	// and the new image is focused	
	lightbox.focusItem(dojo.byId (firstImageId));
	
	isItemDefaultTest("After focus on first image ", secondImageId);
	isItemFocusedTest("After focus on first image ", firstImageId);
}

function testSelectActiveItemNothingSelected() {
	var lightbox = createLightbox();

	isItemDefaultTest("Initially", firstImageId);
	lightbox.selectActiveItem();
	isItemFocusedTest("After select active item ", firstImageId);
}
	
function testSelectActiveItemSecondSelected() {
	// set the active item to something else
	var lightbox = createLightbox();
	lightbox._setActiveItem(dojo.byId (secondImageId));
	
	// before selecting the active item, nothing should have focus	
	isItemDefaultTest("Initially", firstImageId);
	isItemDefaultTest("Initially", secondImageId);
	
	lightbox.selectActiveItem();
	isItemFocusedTest("after selecting active item ", secondImageId);
	isItemDefaultTest("after selecting active item ", firstImageId);
}

function testSetActiveItemToDefaultState() {
	var lightbox = createLightbox();
  lightbox.selectActiveItem();
	isItemFocusedTest("Initially", firstImageId);
	
	lightbox.setActiveItemToDefaultState();
	isItemDefaultTest("after resetting active item, ", firstImageId);
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
	assertEquals("after resize, the grid width should be "+Math.floor(oldNumCols/2), Math.floor(oldNumCols/2), lightbox.gridLayoutHandler.numOfColumnsInGrid);

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
	assertNull("before first lightbox focus, no item should be activedescendent", lbRoot.getAttribute("aaa:activedescendent"));

    lightbox.selectActiveItem();
	assertEquals("after first lightbox focus, first image should be activedescendent", firstImageId, lbRoot.getAttribute("aaa:activedescendent"));
	
	lightbox.activeItem = dojo.byId(thirdImageId);
	lightbox._updateActiveDescendent();
	assertEquals("after setting active item to third image, third image should be activedescendent", thirdImageId, lbRoot.getAttribute("aaa:activedescendent"));

	dojo.byId ("input1").focus();
	lightbox._updateActiveDescendent();
	assertEquals("after removing focus from lightbox, third image should still be activedescendent", thirdImageId, lbRoot.getAttribute("aaa:activedescendent"));

	lightbox.activeItem = null;
	lightbox._updateActiveDescendent();
	assertNull("after unsetting active item, no item should be activedescendent", lbRoot.getAttribute("aaa:activedescendent"));

}
