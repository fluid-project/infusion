/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

if (typeof(fluid) == "undefined") {
	fluid = {};
}

if (typeof(fluid.testUtils) == "undefined") {
	fluid.testUtils = {};
}

/*
 * A number of utility functions for createing "duck-type" events for testing various key
 * stroke combinations.
 */
fluid.testUtils.createEvtDownArrow = function() {
	return this.createUnmodifiedKeyEvent(dojo.keys.DOWN_ARROW);					
}

fluid.testUtils.createEvtUpArrow = function() {
	return this.createUnmodifiedKeyEvent(dojo.keys.UP_ARROW);				
} 

fluid.testUtils.createEvtRightArrow = function() {
	return this.createUnmodifiedKeyEvent(dojo.keys.RIGHT_ARROW);			
} 

fluid.testUtils.createEvtLeftArrow = function() {
	return this.createUnmodifiedKeyEvent(dojo.keys.LEFT_ARROW);		
} 

fluid.testUtils.createEvtCTRL = function() {
	return this.createCtrlKeyEvent(dojo.keys.CTRL);	
}

fluid.testUtils.createEvtCtrlLeftArrow = function() {
	return this.createCtrlKeyEvent(dojo.keys.LEFT_ARROW);
}

fluid.testUtils.createEvtCtrlRightArrow = function() {
	return this.createCtrlKeyEvent(dojo.keys.RIGHT_ARROW);
}

fluid.testUtils.createEvtCtrlDownArrow = function() {
	return this.createCtrlKeyEvent(dojo.keys.DOWN_ARROW);
}

fluid.testUtils.createEvtCtrlUpArrow = function() {
	return this.createCtrlKeyEvent(dojo.keys.UP_ARROW);
}

fluid.testUtils.createCtrlKeyEvent = function (inKeyCode) {
	return this.createKeyEvent (inKeyCode, true /* control key is down */);
}

fluid.testUtils.createUnmodifiedKeyEvent = function (inKeyCode) {
	return this.createKeyEvent (inKeyCode, false /* no control key modifier */);
}

fluid.testUtils.createKeyEvent = function (inKeyCode, inCtrlKey) {
	return {keyCode: inKeyCode, ctrlKey: inCtrlKey, preventDefault: function(){}, stopPropagation: function(){} };
}

fluid.testUtils.assertNotNullAndNotUndefined = function (message, value) {
	assertNotUndefined(message, value);
	assertNotNull(message, value);
}
