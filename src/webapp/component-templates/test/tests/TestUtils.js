/*
 Fluid Project

 Copyright (c) 2006, 2007 University of Toronto. All rights reserved.

 Licensed under the Educational Community License, Version 1.0 (the "License"); 
 you may not use this file except in compliance with the License. 
 You may obtain a copy of the License at 
 
 http://www.opensource.org/licenses/ecl1.php 
 
 Unless required by applicable law or agreed to in writing, software 
 distributed under the License is distributed on an "AS IS" BASIS, 
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 See the License for the specific language governing permissions and 
 limitations under the License.

 Adaptive Technology Resource Centre, University of Toronto
 130 St. George St., Toronto, Ontario, Canada
 Telephone: (416) 978-4360
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
