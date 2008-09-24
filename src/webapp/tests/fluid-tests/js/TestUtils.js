/*
Copyright 2007 - 2008 University of Toronto

Licensed under the Educational Community License(ECL), Version 2.0 or the New
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

fluid.testUtils.createEvtCTRL = function(target) {
	return this.createCtrlKeyEvent(17, target);	
};

fluid.testUtils.createEvtCtrlLeftArrow = function(target) {
	return this.createCtrlKeyEvent(37, target);
};

fluid.testUtils.createEvtCtrlRightArrow = function(target) {
	return this.createCtrlKeyEvent(39, target);
};

fluid.testUtils.createEvtCtrlDownArrow = function(target) {
	return this.createCtrlKeyEvent(40, target);
};

fluid.testUtils.createAltKeyEvent = function(inKeyCode, target) {
    return this.createKeyEvent(inKeyCode, false, false, true /* alt key is down */, target);
};

fluid.testUtils.createCtrlKeyEvent = function(inKeyCode, target) {
    return fluid.testUtils.createKeyEvent(inKeyCode, true /* control key is down */, false, false, target);
};

/** NEW **/

fluid.testUtils.ctrlKeyEvent = function(keyCode, target) {
    return fluid.testUtils.modKeyEvent("CTRL", keyCode, target);
};

fluid.testUtils.keyEvent = function(keyCode, target) {
    return {
            keyCode: fluid.reorderer.keys[keyCode],
            target: fluid.unwrap(target),
            preventDefault: function(){}, stopPropagation: function(){}};
    };

fluid.testUtils.modKeyEvent = function(modifier, keyCode, target) {
    var togo = fluid.testUtils.keyEvent(keyCode, target);
    modifier = jQuery.makeArray(modifier);
    for (var i = 0; i < modifier.length; ++ i) {
        var mod = modifier[i];
        if (mod === "CTRL") {
            togo.ctrlKey = true;
        }
        else if (mod === "SHIFT") {
            togo.shiftKey = true;
        }
        else if (mod === "ALT") {
            togo.altKey = true;
        }
    }
    return togo;
};

fluid.testUtils.createUnmodifiedKeyEvent = function(inKeyCode, target) {
    return this.createKeyEvent(inKeyCode, false /* no control key modifier */, false, false, target);
};

fluid.testUtils.createKeyEvent = function(inKeyCode, inCtrlKey, inShiftKey, inAltKey, target) {
    return {keyCode: inKeyCode, ctrlKey: inCtrlKey, shiftKey: inShiftKey, altKey: inAltKey, 
            target: fluid.unwrap(target),
            preventDefault: function(){}, stopPropagation: function(){} };
};


fluid.testUtils.assertNotNullAndNotUndefined = function(message, value) {
	jqUnit.assertNotUndefined(message, value);
	jqUnit.assertNotNull(message, value);
};

