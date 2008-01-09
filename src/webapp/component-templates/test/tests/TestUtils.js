/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};
fluid.testUtils = fluid.testUtils || {};

/*
 * A number of utility functions for createing "duck-type" events for testing various key
 * stroke combinations.
 */
fluid.testUtils.createEvtDownArrow = function() {
	return this.createUnmodifiedKeyEvent(fluid.keys.DOWN);					
};

fluid.testUtils.createEvtUpArrow = function() {
	return this.createUnmodifiedKeyEvent(fluid.keys.UP);				
}; 

fluid.testUtils.createEvtRightArrow = function() {
	return this.createUnmodifiedKeyEvent(fluid.keys.RIGHT);			
}; 

fluid.testUtils.createEvtLeftArrow = function() {
	return this.createUnmodifiedKeyEvent(fluid.keys.LEFT);		
}; 

fluid.testUtils.createEvtCTRL = function() {
	return this.createCtrlKeyEvent(fluid.keys.CTRL);	
};

fluid.testUtils.createEvtCtrlLeftArrow = function() {
	return this.createCtrlKeyEvent(fluid.keys.LEFT);
};

fluid.testUtils.createEvtCtrlRightArrow = function() {
	return this.createCtrlKeyEvent(fluid.keys.RIGHT);
};

fluid.testUtils.createEvtCtrlDownArrow = function() {
	return this.createCtrlKeyEvent(fluid.keys.DOWN);
};

fluid.testUtils.createEvtCtrlUpArrow = function() {
	return this.createCtrlKeyEvent(fluid.keys.UP);
};

fluid.testUtils.createCtrlKeyEvent = function (inKeyCode) {
	return this.createKeyEvent (inKeyCode, true /* control key is down */);
};

fluid.testUtils.createUnmodifiedKeyEvent = function (inKeyCode) {
	return this.createKeyEvent (inKeyCode, false /* no control key modifier */);
};

fluid.testUtils.createKeyEvent = function (inKeyCode, inCtrlKey) {
	return {keyCode: inKeyCode, ctrlKey: inCtrlKey, preventDefault: function(){}, stopPropagation: function(){} };
};

fluid.testUtils.assertNotNullAndNotUndefined = function (message, value) {
	assertNotUndefined(message, value);
	assertNotNull(message, value);
};

/** 
 * Returns the actual element.
 */
fluid.testUtils.byId = function (id) {
	return jQuery ("[id=" + id + "]").get(0);
};
