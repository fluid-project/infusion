var imgListClone;

function setUp() {
	imgListClone = document.getElementById("gallery:::gallery-thumbs:::").cloneNode(true);
}

function tearDown() {
	var fluidLightboxDOMNode = document.getElementById("gallery:::gallery-thumbs:::");
	var lightboxParent = document.getElementById("lightbox-parent");
	lightboxParent.removeChild(fluidLightboxDOMNode);
	lightboxParent.appendChild(imgListClone);
}
	
function testHandleArrowKeyPressForLeftAndRight()	 {
	var lightbox = new fluid.Lightbox();
	var defaultClass="image-container-default";
	var focusedClass="image-container-selected";
	var draggingClass="image-container-dragging";
	lightbox.domNode.focus();

	// set the focus on the first image
	assertTrue("fluid.thumbFirst should be focused",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusedClass));
	assertFalse("fluid.thumbFirst should not be default", dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertTrue("fluid.thumbSecond should be not focused",dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertFalse("fluid.thumbSecond should not be focused", dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusedClass));

	// Test: right arrow to the second image
	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleArrowKeyPress(evtRightArrow);
	assertTrue("fluid.thumbFirst should be default",dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertFalse("fluid.thumbFirst should not be focused", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusedClass));
	assertTrue("fluid.thumbSecond should be focused",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusedClass));
	assertFalse("fluid.thumbSecond should not be default", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));

	// Test: right arrow to the last image
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	assertTrue("fluid.thumbFirst should be default", dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertTrue("fluid.thumbSecond should be default", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("fluid.thumbLast should be focused", dojo.hasClass(document.getElementById("fluid.thumbLast"), focusedClass));

	// Test: left arrow to the previous image
	var evtLeftArrow = {keyCode: dojo.keys.LEFT_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleArrowKeyPress(evtLeftArrow);
	assertTrue("left arrow to second fluid.thumbFirst should be default", dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertTrue("left arrow to second fluid.thumbSecondLast should be focused", dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusedClass));
	assertTrue("left arrow to second fluid.thumbLast should be default", dojo.hasClass(document.getElementById("fluid.thumbLast"), defaultClass));
	
	// Test: right arrow past the last image - expect wrap to the first image
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleArrowKeyPress(evtRightArrow);
	assertTrue("fluid.thumbFirst should be focused after wrapping", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusedClass));
	assertFalse("fluid.thumbFirst should not be default after wrapping", dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertTrue("fluid.thumbSecond should be default", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertFalse("fluid.thumbSecond should not be focused after wrapping", dojo.hasClass(document.getElementById("fluid.thumbLast"), focusedClass));
	assertTrue("fluid.thumbLast should be default", dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), defaultClass));
	assertFalse("fluid.thumbLast should not be focused after wrapping", dojo.hasClass(document.getElementById("fluid.thumbLast"), focusedClass));
	
	// Test: left arrow on the first image - expect wrap to the last image
	lightbox.handleArrowKeyPress(evtLeftArrow);
	assertTrue("fluid.thumbFirst should be default", dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertTrue("fluid.thumbSecond should be default", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("fluid.thumbLast should be focused", dojo.hasClass(document.getElementById("fluid.thumbLast"), focusedClass));
}

function testHandleKeyUpAndDown() {
	var lightbox = new fluid.Lightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";
	var draggingClass="image-container-dragging";
	lightbox.domNode.focus();

	// check that none of the images are currently being moved.
	assertFalse("thumbFirst should not be in move state to start",dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertFalse("thumbSecond should not be in move state to start",dojo.hasClass(document.getElementById("fluid.thumbSecond"), draggingClass));
	assertFalse("thumbSecondLast should not be in move state to start",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), draggingClass));
	
	// focus the first thumb
	lightbox.focusNode(dojo.byId("fluid.thumbFirst"));
	
	// ctrl down - expect dragging state to start
	var evtCTRL = {keyCode: dojo.keys.CTRL, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleKeyDown(evtCTRL);
	assertTrue("thumbFirst should be in move state after ctrl-down",dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertFalse("thumbSecond should not be in move state after ctrl-down",dojo.hasClass(document.getElementById("fluid.thumbSecond"), draggingClass));
	assertFalse("thumbSecondLast should not be in move state after ctrl-down",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), draggingClass));
	assertFalse("thumbFirst should not be focused after ctrl-down", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	
	// right arrow down - all the dragging states should remain the same
	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, preventDefault: function(){}, stopPropagation: function(){} };
	lightbox.handleKeyDown(evtRightArrow);
	assertTrue("thumbFirst should still be in move state after right-arrow",dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertFalse("thumbSecond should still not be in move state after right-arrow",dojo.hasClass(document.getElementById("fluid.thumbSecond"), draggingClass));
	assertFalse("thumbSecondLast should still not be in move state after right-arrow",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), draggingClass));
	assertFalse("thumbFirst should not be focused after right-arrow", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));

	// right arrow with key-up event handler. The dragging states should remain the same.
	lightbox.handleKeyUp(evtRightArrow);
	assertTrue("thumbFirst should still be in move state after right-arrow up",dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertFalse("thumbSecond should still not be in move state after right-arrow up",dojo.hasClass(document.getElementById("fluid.thumbSecond"), draggingClass));
	assertFalse("thumbSecondLast should still not be in move state after right-arrow up",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), draggingClass));
	assertFalse("thumbFirst should not be focused after right-arrow up", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));

    // ctrl up - expect dragging to end
	lightbox.handleKeyUp(evtCTRL);
	assertFalse("thumbFirst should no longer be in move state after ctrl up",dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertFalse("thumbSecond should still not be in move state after ctrl up",dojo.hasClass(document.getElementById("fluid.thumbSecond"), draggingClass));
	assertFalse("thumbSecondLast should still not be in move state after ctrl up",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), draggingClass));
	assertTrue("thumbFirst should be focused after ctrl up", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
}


function testHandleArrowKeyPressForCtrlLeftAndCtrlRight() {	
	var lightbox = new fluid.Lightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";
	var draggingClass="image-container-dragging";
	lightbox.domNode.focus();

	var evtCTRL = {keyCode: dojo.keys.CTRL, preventDefault: function(){}, stopPropagation: function(){} };
	var evtRightArrow = {keyCode: dojo.keys.RIGHT_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	var evtLeftArrow = {keyCode: dojo.keys.LEFT_ARROW, ctrlKey: true, preventDefault: function(){}, stopPropagation: function(){} };
	
	// Test: ctrl right arrow - expect first and second image to swap
	lightbox.handleKeyDown(evtCTRL);	
	lightbox.handleArrowKeyPress(evtRightArrow);
	assertTrue("thumbFirst should be in move state after ctrl-right", dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertTrue("thumbSecond should be in default state after ctrl-right", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("thumbLast should be in default state after ctrl-right", dojo.hasClass(document.getElementById("fluid.thumbLast"), defaultClass));

	var lightboxDOMNode = dojo.byId("gallery:::gallery-thumbs:::");
	var thumbArray = lightboxDOMNode.getElementsByTagName("div");
	assertEquals("after move right", "fluid.thumbSecond", thumbArray[0].id);
	assertEquals("after move right", "fluid.thumbFirst", thumbArray[3].id);
	assertEquals("after move right", "fluid.thumbLast", thumbArray[39].id);
	
	// ctrl up
	lightbox.handleKeyUp(evtCTRL);	
	assertTrue("thumbFirst should be in selected state", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertTrue("thumbSecond should be in default state", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("thumbLast should be in default state", dojo.hasClass(document.getElementById("fluid.thumbLast"), defaultClass));
	thumbArray = lightboxDOMNode.getElementsByTagName("div");;
	assertEquals("after move right ctrl up", "fluid.thumbSecond", thumbArray[0].id);
	assertEquals("after move right ctrl up", "fluid.thumbFirst", thumbArray[3].id);
	assertEquals("after move right ctrl up", "fluid.thumbLast", thumbArray[39].id);

	// Test: ctrl left arrow - expect first and second image to swap back to original order
	lightbox.handleKeyDown(evtCTRL);	
	lightbox.handleArrowKeyPress(evtLeftArrow);
	assertTrue("thumbFirst should be in move state after ctrl-left", dojo.hasClass(document.getElementById("fluid.thumbFirst"), draggingClass));
	assertTrue("thumbSecond should be in default state after ctrl-left", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("thumbLast should be in default state after ctrl-left", dojo.hasClass(document.getElementById("fluid.thumbLast"), defaultClass));

	thumbArray = lightboxDOMNode.getElementsByTagName("div");;
	assertEquals("after move left", "fluid.thumbFirst", thumbArray[0].id);
	assertEquals("after move left", "fluid.thumbSecond", thumbArray[3].id);
	assertEquals("after move left", "fluid.thumbLast", thumbArray[39].id);
	
	// ctrl up
	lightbox.handleKeyUp(evtCTRL);	
	assertTrue("thumbFirst should be in selected state", dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertTrue("thumbSecond should be in default state", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("thumbLast should be in default state", dojo.hasClass(document.getElementById("fluid.thumbLast"), defaultClass));

	// Test: ctrl left arrow - expect first image to move to last place,
	//       second image to move to first place and third image to move to second place
	lightbox.handleKeyDown(evtCTRL);	
	lightbox.handleArrowKeyPress(evtLeftArrow);
	lightbox.handleKeyUp(evtCTRL);	

	thumbArray = lightboxDOMNode.getElementsByTagName("div");;
	assertEquals("after another move right", "fluid.thumbSecond", thumbArray[0].id);
	assertEquals("after another move right", "fluid.thumb3", thumbArray[3].id);
	assertEquals("after another move right", "fluid.thumbFirst", thumbArray[39].id);

	// Test: ctrl right arrow - expect thumbFirst to move to first place,
	//       thumbSecond to move to second place and thumbLast to move to last place
	lightbox.handleKeyDown(evtCTRL);	
	lightbox.handleArrowKeyPress(evtRightArrow);
	lightbox.handleKeyUp(evtCTRL);	

	thumbArray = lightboxDOMNode.getElementsByTagName("div");;
	assertEquals("fluid.thumbFirst", thumbArray[0].id);
	assertEquals("fluid.thumbSecond", thumbArray[3].id);
	assertEquals("fluid.thumbLast", thumbArray[39].id);

}

function testPersistFocus () {
	var lightbox = new fluid.Lightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";

	assertFalse("fluid.thumbFirst should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertTrue("fluid.thumbFirst should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));

	lightbox.domNode.focus();

	// first thumb nail should be focused initially.
	assertTrue("Persist Focus Test: fluid.thumbFirst should be moveable",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertFalse("Persist Focus Test: fluid.thumbSecond should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	assertFalse("Persist Focus Test: fluid.thumbSecondLast should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	
	// Change focus to the paragraph text, then back to the lightbox
	dojo.byId ("para1").focus();
	dojo.byId ("gallery:::gallery-thumbs:::").focus();
	
	// check that the first thumb nail is still moveable.
	assertTrue("Persist Focus Test: fluid.thumbFirst should be moveable",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertFalse("Persist Focus Test: fluid.thumbSecond should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	assertFalse("Persist Focus Test: fluid.thumbSecondLast should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	
	// set focus to another image.
	lightbox.focusNode(dojo.byId("fluid.thumbSecond"));
	assertFalse("Persist Focus Test: fluid.thumbFirst should not be focused",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertTrue ("Persist Focus Test: fluid.thumbSecond should be moveable",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	assertFalse("Persist Focus Test: fluid.thumbSecondLast should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	
	// Change focus to the paragraph text, then back to the lightbox
	dojo.byId ("para1").focus();
	dojo.byId ("gallery:::gallery-thumbs:::").focus();
	
	// check that the first thumb nail is still moveable.
	lightbox.focusNode(dojo.byId("fluid.thumbSecond"));
	assertFalse("Persist Focus Test: fluid.thumbFirst should not be focused",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertTrue ("Persist Focus Test: fluid.thumbSecond should be moveable",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	assertFalse("Persist Focus Test: fluid.thumbSecondLast should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	
	lightbox.domNode.blur();
	assertTrue("after lightbox blur, focusedNode should not be selected", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));

	// test persistance of focus between page navigation / page loads?	
}


function testFocusNode () {
	var lightbox = new fluid.Lightbox();
	var defaultClass="image-container-default";
	var focusClass="image-container-selected";
	var draggingClass="image-container-dragging";
	
	// nothing should be focused
	assertFalse("fluid.thumbFirst should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	assertFalse("fluid.thumbSecond should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	assertFalse("fluid.thumbSecondLast should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	assertTrue("fluid.thumbFirst should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbFirst"), defaultClass));
	assertTrue("fluid.thumbSecond should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("fluid.thumbSecondLast should not be focused before lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), defaultClass));
	
	// put focus on lightbox - first node should get focusClass
	lightbox.domNode.focus();
	assertTrue("fluid.thumbFirst should be focused now that lightbox has focus",dojo.hasClass(document.getElementById("fluid.thumbFirst"), focusClass));
	
	// focus the image
	lightbox.focusNode(dojo.byId("fluid.thumbSecond"));

	// test the response to the focus
	assertFalse("fluid.thumbSecond should not be default", dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertTrue("fluid.thumbSecond should be focused", dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	
	// focus the image already focused to ensure it remains focused.
	lightbox.focusNode(dojo.byId("fluid.thumbSecond"));
	assertTrue("fluid.thumbSecond should still be focused",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));

	// Test: focus a different image and check to see that the previous image is defocused
	// and the new image is focused
	assertTrue("fluid.thumbSecondLast should be default",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), defaultClass));
	assertFalse("fluid.thumbSecondLast should not be focused",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	
	lightbox.focusNode(dojo.byId ("fluid.thumbSecondLast"));
	
	// previous image defocused
	assertTrue("fluid.thumbSecond should now be default (previously focused)",dojo.hasClass(document.getElementById("fluid.thumbSecond"), defaultClass));
	assertFalse("fluid.thumbSecond should not be focused anymore",dojo.hasClass(document.getElementById("fluid.thumbSecond"), focusClass));
	
	// new image focused
	assertFalse("fluid.thumbSecondLast should not be default",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), defaultClass));
	assertTrue("fluid.thumbSecondLast should be focused",dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), focusClass));
	
	lightbox.domNode.blur();
	assertTrue("after lightbox blur, focusedNode should not be selected", dojo.hasClass(document.getElementById("fluid.thumbSecondLast"), defaultClass));
}