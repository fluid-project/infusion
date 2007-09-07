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
	var lightbox = new fluid.Reorderer({
			// Define a "persistence" callback that simply creates a known
			// input element with id 'callbackCalled'.  Later, we can test
			// whether the callback was called by looking for the element.
			//
			orderChangedCallback: function(){
				var newInputElement = document.createElement("input");
				newInputElement.id="callbackCalled";
				dojo.place(newInputElement, dojo.byId("para1"), "after");
			},
	    	layoutHandler: new fluid.GridLayoutHandler()
		},
		lightboxRootId
	);
	
	// Perform a move
	lightbox.selectActiveItem();
	lightbox.handleArrowKeyPress(fluid.testUtils.createEvtCtrlRightArrow());
	assertNotNull("order changed callback is not called when a move is performed", 
		dojo.byId("callbackCalled"));
}

