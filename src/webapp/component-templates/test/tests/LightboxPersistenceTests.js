/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * Need tests for fluid.initLightbox(), but it requires refactoring before meaningful
 * tests can be written.  As it stands, the aspects of initLightbox() to test are
 * within closures and cannot be accessed (e.g., the callback that reorders items).
 */

/**
 * Test to see that callback function is called after a "move item" key press.
 * @author Fluid
 */
function testIsOrderChangedCallbackCalled() {
	var lightbox = new fluid.Reorderer(lightboxRootId, {
			// Define a "persistence" callback that simply creates a known
			// input element with id 'callbackCalled'.  Later, we can test
			// whether the callback was called by looking for the element.
			//
			orderChangedCallback: function(){
				var newInputElement = document.createElement("input");
				newInputElement.id="callbackCalled";
				dojo.place(newInputElement, dojo.byId("para1"), "after");
			},
	    	layoutHandler: new fluid.GridLayoutHandler(findOrderableByDivAndId),
            orderableFinder: findOrderableByDivAndId
		}
	);
	
	// Perform a move
	lightbox.selectActiveItem();
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlRightArrow());
	assertNotNull("order changed callback is not called when a move is performed", 
		dojo.byId("callbackCalled"));
}

