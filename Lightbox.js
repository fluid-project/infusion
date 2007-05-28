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


dojo.provide("fluid.Lightbox");

dojo.require("fluid.GridLayoutManager");
dojo.require("dijit.base.Widget");
dojo.require("dijit.base.TemplatedWidget");
dojo.require("dijit.base.FormElement");

(function() {
	fluid.states = {
		defaultClass:"image-container-default",
		focusedClass:"image-container-selected",
		draggingClass:"image-container-dragging"
	};		
})();

dojo.declare(
	"fluid.Lightbox",	// class name
	[dijit.base.FormElement, dijit.base.TemplatedWidget],
	{
		templatePath: dojo.moduleUrl("fluid", "templates/Lightbox.html"),
		thumbTemplate: null,
		focusedNode: null,
		focusedNodeIndex: 0,
		imageList: [],  // list of dom nodes i.e. the thumb divs
		debugMode: true,

		postCreate: function () {
			dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
			dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
			dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
			this.thumbTemplate = this.domNode.getElementsByTagName("div")[0];
			this.domNode.removeChild(this.domNode.getElementsByTagName("div")[0]);
			this.imageList = this.buildImageList(/*we will get this from the Gallery Tool eventually*/[]);

// these are test images that we are using until we get the images from the server
//var urlList = ["http://foo.com/url1", "http://foo.com/url2", "http://foo.com/url3"];
//this.imageList=this.buildImageList(urlList);

			this.setDomNode(this.imageList);
			if (this.imageList.length > 0) {
				this.focus(this.imageList[0]);
			}
			
		}, // end postCreate
		
		setDomNode: function(imageList) {
			this.imageList = [];
			for (imgNode in imageList) {
				dojo.place(imageList[imgNode],this.domNode,imgNode);
				this.imageList.push(imageList[imgNode]);
			}
		}, // end setDomNode
		
		focus: function(/*node*/ aNode) {
			// deselect any previously focused node
			if (this.focusedNode != null) {
				dojo.removeClass (this.focusedNode, fluid.states.focusedClass);
				dojo.addClass (this.focusedNode, fluid.states.defaultClass);
			}
						
			this.focusedNode = aNode;			
			
			dojo.removeClass (this.focusedNode, fluid.states.defaultClass);
			dojo.addClass (this.focusedNode, fluid.states.focusedClass); 
			
			this._debugMessage(" class is now" + this.focusedNode.className);
		}, //end focus
		
		handleKeyDown: function (/*event object*/ evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				this._debugMessage("CTRL down");
				dojo.stopEvent(evt);
			}
			else {
				
			}
		}, // end handleKeyDown
		
		handleKeyUp: function (/*event object*/ evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				this._debugMessage("CTRL up");
				dojo.stopEvent(evt);
			}
			else {
				
			}			
		}, // end handleKeyUp
		
		handleArrowKeyPress: function (/*event object*/ evt){
			
			switch (key = evt.keyCode) {
			case dojo.keys.DOWN_ARROW: {
				this._debugMessage("Down");
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.UP_ARROW: {
				this._debugMessage("Up");
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.LEFT_ARROW: {
				this._debugMessage("Left");
				
				// set focus to next to right sibling in imageList
				// if current focus image is the first in list, change focus to last image in imageList
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.RIGHT_ARROW: {
				this._debugMessage("Right");
								
				// set focus to next to right sibling in imageList
				// if current focus image is the last, change focus to first image in imageList
				if (this.focusedNodeIndex == this.imageList.length-1) {
										
					this._debugMessage(" set focus index to 0");
					
					this.focus (this.imageList[0]);
					this.focusedNodeIndex = 0;
				} else {
					this._debugMessage(" set focus index to " + (this.focusedNodeIndex+1));
					this.focus (this.imageList[this.focusedNodeIndex+1]);
					this.focusedNodeIndex = this.focusedNodeIndex+1;
				}
				dojo.stopEvent(evt);
				break;
			}
			default: 
				this._debugMessage(key);
				break;
			}
		}, // end handleArrowKeyPress
		
		buildImageList: function (urlList) {
			var imgDivList = [];
			for (url in urlList) {
				var imgDiv = this.thumbTemplate.cloneNode(true);
				imgDiv.id += url;
				imgDiv.getElementsByTagName("a")[0].href = urlList[url];
				imgDiv.getElementsByTagName("img")[0].src = urlList[url];
				imgDiv.getElementsByTagName("div")[0].firstChild.nodeValue = urlList[url];
				imgDivList.push(imgDiv);
			}
			return imgDivList;
		}, // end buildImageList
		
		_debugMessage: function(message) {
			if (this.debugMode && dojo.byId("debugString"))
				dojo.byId("debugString").firstChild.nodeValue = message;
		} // end _debugMessage
	}
);

