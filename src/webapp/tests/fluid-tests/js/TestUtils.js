/*
Copyright 2007 - 2008 University of Toronto

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
fluid.testUtils.createEvtDownArrow = function(target) {
	return this.createUnmodifiedKeyEvent(fluid.keys.DOWN, target);					
};

fluid.testUtils.createEvtUpArrow = function(target) {
	return this.createUnmodifiedKeyEvent(fluid.keys.UP, target);				
}; 

fluid.testUtils.createEvtRightArrow = function(target) {
	return this.createUnmodifiedKeyEvent(fluid.keys.RIGHT, target);			
}; 

fluid.testUtils.createEvtLeftArrow = function(target) {
	return this.createUnmodifiedKeyEvent(fluid.keys.LEFT, target);		
}; 

fluid.testUtils.createEvtCTRLUp = function(target) {
    return this.createUnmodifiedKeyEvent(fluid.keys.CTRL, target);    
};

fluid.testUtils.createEvtCTRL = function(target) {
	return this.createCtrlKeyEvent(fluid.keys.CTRL, target);	
};

fluid.testUtils.createEvtCtrlLeftArrow = function(target) {
	return this.createCtrlKeyEvent(fluid.keys.LEFT, target);
};

fluid.testUtils.createEvtCtrlRightArrow = function(target) {
	return this.createCtrlKeyEvent(fluid.keys.RIGHT, target);
};

fluid.testUtils.createEvtCtrlDownArrow = function(target) {
	return this.createCtrlKeyEvent(fluid.keys.DOWN, target);
};

fluid.testUtils.createEvtCtrlUpArrow = function(target) {
	return this.createCtrlKeyEvent(fluid.keys.UP, target);
};

fluid.testUtils.createAltKeyEvent = function (inKeyCode, target) {
    return this.createKeyEvent (inKeyCode, false, false, true /* alt key is down */, target);
};

fluid.testUtils.createCtrlKeyEvent = function (inKeyCode, target) {
    return this.createKeyEvent (inKeyCode, true /* control key is down */, false, false, target);
};

fluid.testUtils.createCtrlShiftKeyEvent = function (inKeyCode, target) {
	return this.createKeyEvent (inKeyCode, true, true /* ctrl and shift keys are down */, false, target);
};

fluid.testUtils.createUnmodifiedKeyEvent = function (inKeyCode, target) {
    return this.createKeyEvent (inKeyCode, false /* no control key modifier */, false, false, target);
};

fluid.testUtils.createKeyEvent = function (inKeyCode, inCtrlKey, inShiftKey, inAltKey, target) {
    return {keyCode: inKeyCode, ctrlKey: inCtrlKey, shiftKey: inShiftKey, altKey: inAltKey, 
            target: target,
            preventDefault: function(){}, stopPropagation: function(){} };
};

fluid.testUtils.assertNotNullAndNotUndefined = function (message, value) {
	jqUnit.assertNotUndefined(message, value);
	jqUnit.assertNotNull(message, value);
};

/** 
 * Returns the actual element.
 */
fluid.testUtils.byId = function (id) {
	return fluid.utils.jById(id)[0];
};
