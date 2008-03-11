/*
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/**
 * Need tests for fluid.lightbox.initLightbox(), but it requires refactoring before meaningful
 * tests can be written.  As it stands, the aspects of initLightbox() to test are
 * within closures and cannot be accessed (e.g., the callback that reorders items).
 */

/**
 * Test to see that callback function is called after a "move item" key press.
 * @author Fluid
 */
function testIsOrderChangedCallbackCalled() {
	var lightboxContainer = fluid.utils.jById (lightboxRootId);

    // Define a "persistence" callback that simply creates a known
    // input element with id 'callbackCalled'.  Later, we can test
    // whether the callback was called by looking for the element.
    var testOrderChangedCallback = function() {
        var newInputElement = document.createElement("input");
        newInputElement.id = "callbackCalled";
        jQuery ("[id=para1]").after (newInputElement);
    };
    var layoutHandler = new fluid.GridLayoutHandler (findOrderableByDivAndId, {
        orderChangedCallback: testOrderChangedCallback
    });
	var lightbox = new fluid.Reorderer (lightboxContainer, findOrderableByDivAndId, layoutHandler);
    focusLightbox ();
	
	// Perform a move
	lightbox.handleArrowKeyDown (fluid.testUtils.createEvtCtrlRightArrow ());
	assertNotNull ("order changed callback is not called when a move is performed", 
		fluid.testUtils.byId ("callbackCalled"));
}

