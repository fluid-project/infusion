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

if (typeof (fluid) == 'undefined') {
	fluid = {};
}

(function() {
	fluid.states = {
		defaultClass:"image-container-default",
		focusedClass:"image-container-selected",
		draggingClass:"image-container-dragging"
	};		
})();


fluid.Lightbox = function() {
};

MochiKit.Base.update(fluid.Lightbox.prototype, {

    __repr__: function () {
        var repr = MochiKit.Base.repr;
        var str = '{name: ' + repr (this.name) +
			', focusedNode: ' + repr (this.focusedNode) +
            ', focusedNodeIndex: ' + repr (this.focusedNodeIndex) +
            ', debugMode: ' + repr (this.debugMode) +
			'}';
		return str;
	},

    toString: function () {
        return this.__repr__();
    },
			
	name: "fluid.Lightbox",

	focusedNode: null,
	focusedNodeIndex: 0,
	debugMode: true,

	buildRendering: function(){
		// summary:
		//		Construct the UI for this widget, setting this.domNode.
		//		Most widgets will mixin TemplatedWidget, which overrides this method.
		this.domNode = MochiKit.DOM.getElement ("fluid-lightbox");
	},

	postCreate: function () {
		MochiKit.Signal.connect(this.domNode, "onkeypress", this, "handleArrowKeyPress");
		MochiKit.Signal.connect(this.domNode, "onkeydown", this, "handleKeyDown");
		MochiKit.Signal.connect(this.domNode, "onkeyup", this, "handleKeyUp");
		this.focus(this.domNode.firstChild);
	}, // end postCreate
			
	focus: function(/*node*/ aNode) {			
		// deselect any previously focused node
		if (this.focusedNode != null) {
			MochiKit.DOM.removeElementClass (this.focusedNode, fluid.states.focusedClass);
			MochiKit.DOM.addElementClass (this.focusedNode, fluid.states.defaultClass);
		}
					
		this.focusedNode = aNode;			
		MochiKit.DOM.removeElementClass (this.focusedNode, fluid.states.defaultClass);
		MochiKit.DOM.addElementClass (this.focusedNode, fluid.states.focusedClass);
	}, //end focus
	
	handleKeyDown: function (/*event object*/ evt) {
		var key = evt.key();
		if (key.string == 'KEY_CTRL') {
			this._debugMessage ("CTRL down");
			MochiKit.DOM.removeElementClass (this.focusedNode, fluid.states.focusedClass);
			MochiKit.DOM.addElementClass (this.focusedNode, fluid.states.draggingClass);
			evt.stop();
		}
		else {
			
		}
	}, // end handleKeyDown
	
	handleKeyUp: function (/*event object*/ evt) {
		var key = evt.key();
		if (key.string == 'KEY_CTRL') {
			this._debugMessage ("CTRL up");
			MochiKit.DOM.removeElementClass (this.focusedNode, fluid.states.draggingClass);
			MochiKit.DOM.addElementClass (this.focusedNode, fluid.states.focusedClass);
			evt.stop();
		}
		else {
			
		}			
	}, // end handleKeyUp
	
	handleArrowKeyPress: function (/*event object*/ evt) {
		switch (key = evt.key().string) {
			case 'KEY_ARROW_DOWN': {
				this._debugMessage ("Down");
				evt.stop();
			 	break;
			}
			case 'KEY_ARROW_UP': {
				this._debugMessage ("Up");
				evt.stop();
				break;
			}
			case 'KEY_ARROW_LEFT': {
				this._debugMessage ("Left Arrow");
				
				// set focus to the left sibling 
				// if current focus image is the first, change focus to last image
				if (this.focusedNode.previousSibling) {
					this.focus (this.focusedNode.previousSibling);					
				}
				else {
					this.focus (this.focusedNode.parentNode.lastChild);					
				}
				evt.stop();
				break;
			}
			case 'KEY_ARROW_RIGHT': {
				this.handleRightArrow (evt.modifier().ctrl);
				evt.stop();
				break;
			}
			default:
				this._debugMessage (key);
				break;
		}

	}, // end handleArrowKeyPress
	
	handleRightArrow: function(isCtrl) {
		if (isCtrl) {
			MochiKit.DOM.insertSiblingsAfter (this.focusedNode, this.focusedNode.nextSibling);
		}
		else {			
			// set focus to next to right sibling
			// if current focus image is the last, change focus to first thumbnail
			if (this.focusedNode.nextSibling) {					
				this.focus (this.focusedNode.nextSibling);					
			} else {
				this.focus (this.focusedNode.parentNode.firstChild);
			}
		}
	}, // end handleRightArrow
	
	_debugMessage: function(message) {
		if (this.debugMode && MochiKit.DOM.getElement ("debugString"))			if (this.debugMode && dojo.byId("debugString"))
			MochiKit.DOM.getElement ("debugString").firstChild.nodeValue = message;
	} 	// end _debugMessage

});		// end defining Lightbox component.


