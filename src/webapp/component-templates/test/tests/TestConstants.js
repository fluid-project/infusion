var numOfImages = 14;

// The id of the root node of the lightbox
var lightboxRootId = "gallery:::gallery-thumbs:::";

// The id of the parent of the lightbox
var lightboxParentId = "lightbox-parent";

// The ids of the reorderable items in Lightbox.html
var firstReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::0:";
var secondReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::1:";
var thirdReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::2:";
var fourthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::3:";
var fifthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::4:";
var sixthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::5:";
var seventhReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::6:";
var tenthReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::9:";
var fourthLastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::10:";
var thirdLastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::11:";
var secondLastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::12:";
var LastReorderableId = "gallery:::gallery-thumbs:::lightbox-cell::13:";

// The ids of the images we test with in Lightbox.html
var firstImageId = "fluid.img.first";
var secondImageId = "fluid.img.second";
var thirdImageId = "fluid.img.3";
var fourthImageId = "fluid.img.4";
var fifthImageId = "fluid.img.5";
var sixthImageId = "fluid.img.6";
var seventhImageId = "fluid.img.7";
var eighthImageId = "fluid.img.8";
var ninthImageId = "fluid.img.9";
var tenthImageId = "fluid.img.10";
var eleventhImageId = "fluid.img.11";
var twelvethImageId = "fluid.img.12";
var secondLastImageId = "fluid.img.secondLast";
var lastImageId = "fluid.img.last";

// CSS class names
var defaultClass="image-container-default";
var selectedClass="image-container-selected";
var draggingClass="image-container-dragging";

// All the test function names for the JsUnit tests.  Needed for running JsUnit in 
// IE and Safari.
//
function exposeTestFunctionNames() {
	return [
	    // GridLayoutHandlerTests.js
		"testGetRightSibling",
		"testGetLeftSibling",
		"testGetItemBelow",
		"testGetItemAbove",
		"testWindowDidResize",
		
		// LightboxTests.js
		"testFindReorderableParent",
		"testHandleArrowKeyPressMoveThumbDown",
		"testHandleArrowKeyPressWrapThumbUp",
		"testHandleArrowKeyPressForUpAndDown",
		"testHandleArrowKeyPressForLeftAndRight",
		"testHandleKeyUpAndHandleKeyDownChangesState",
		"testHandleKeyUpAndHandleKeyDownItemMovement",
		"testHandleArrowKeyPressForCtrlLeftAndCtrlRight",
		"testPersistFocus",
		"testfocusItem",
		"testSelectActiveItemNothingSelected",
		"testSelectActiveItemSecondSelected",
		"testChangeActiveItemToDefaultState",
		"testHandleWindowResizeEvent",
		"testUpdateActiveDescendent"
	];
}
