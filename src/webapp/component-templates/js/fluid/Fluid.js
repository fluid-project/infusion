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

if (typeof(dojo) != 'undefined') {
	dojo.provide("fluid.Fluid");
}

if (typeof(fluid) == "undefined") {
	fluid = {};
	fluid.declare = function(target, args) {
		for (arg in args) {
			target[arg] = args[arg];
		}
	};
};

fluid.declare(fluid, {
	
	// Server-level initialisation for the lightbox. This is template-specific and
	// server-generic, in that template-specific dependencies have been factored off.
	initLightbox: function(namebase, count, messageNamebase) {
		fluid.initLightboxClient(namebase, count, messageNamebase, "a", 1);
	},
	
	deriveCellBase: function(namebase, index) {
		return namebase + "lightbox-cell::"+index+":";
	},
	
	// Custom query method seeks all tags descended from a given root with a 
	// particular tag name, whose id matches a regex. The Dojo query parser
	// is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
	// it might do anyway, and this will be plenty fast.
	seekNodesById: function(rootnode, tagname, idmatch) {
		var inputs = rootnode.getElementsByTagName(tagname);
		var togo = new Array();
		for (var i = 0; i < inputs.length; ++ i) {
			var input = inputs[i];
			var id = input.id;
			if (id && id.match(idmatch)) {
				togo.push(input);
			}
		}
		return togo;
	},
	
	// Client-level initialisation for the lightbox, allowing parameterisation for
	// different templates.
	initLightboxClient: function(namebase, count, messageNamebase, tagName, tagNameIndex) {
		var reorderform = fluid.Utilities.findForm(document.getElementById(namebase));
		// An <input> tag nested within our root namebase tag, which has an id which 
		// begins with the  namebase:lightbox-cell:: prefix, and ends with "reorder-index" trail.
		// Very hard to imagine any perversity which may lead to this picking any stray stuff :P
		
		// An approach based on the "sourceIndex" DOM property would be much more efficient,
		// but this is only supported in IE. 
		// This selector approach is ALSO broken, see Dojo bug 3520.
		//var selector = "#" + fluid.Utilities.escapeSelector(namebase) 
		//+ " input[id^=\"" + fluid.Utilities.escapeSelector(namebase + "lightbox-cell::") + "\"]"
		//+ "[id$=\"reorder-index\"]";
		var orderChangedCallback = function() {
			//	  var inputs = dojo.query(selector);
			var inputs = fluid.seekNodesById(reorderform, "input", 
			fluid.deriveCellBase(namebase, ".*") + "reorder-index");
			
			for (var i = 0; i < inputs.length; ++ i) {
				inputs[i].value = i;
			}
			
			// dojo.io.bind is gone: http://dojotoolkit.org/book/dojo-porting-guide-0-4-x-0-9/io-transports-ajax
			if (reorderform.action) {
				dojo.xhrPost({
					url: reorderform.action,
					form: reorderform,
					load: function(type, data, evt){ /* No-op response */ }
				});
			};
		};
		
		
		var lightbox = new fluid.Lightbox(
			{
				tagNameToFocus: tagName,
				tagNameIndexToFocus : tagNameIndex,
				messageNamebase : messageNamebase,
				orderChangedCallback: orderChangedCallback
			}, 
			namebase);
	}
});  

fluid.declare(fluid, {
	/*
	 * Utilities object for providing various lightbox-independent convenience functions
	 */
    Utilities: {

	  // NOTE: This function will be removed when the lightbox is refactored to support non-
	  // re-orderable item nodes. Until then, it is necessary.
	  removeNonElementNodes: function(rootNode) {
		var currChild = rootNode.firstChild;
		var nextSibling = currChild.nextSibling;
		if (currChild.nodeType != 1) {
			rootNode.removeChild(currChild);
		}
		while (nextSibling){
			currChild = nextSibling;
			nextSibling = currChild.nextSibling;
			if (currChild.nodeType != 1) {
				rootNode.removeChild(currChild);
			}			
		} 
	  },
	  
	escapeSelector: function(id) {
		return id.replace(/\:/g,"\\:");
	},
	  
	findForm: function (element) {
		while(element) {
			if (element.nodeName.toLowerCase() == "form") return element;
				element = element.parentNode;
			}
		}
	}
});

fluid.declare(fluid, {
	/*
	 * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
	 * changes dimensions when the window changes size. As a result, when the user presses the up or
	 * down arrow key, the expected behaviour depends on the current window size.
	 * 
	 * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
	 * in the window, and of informing the Lightbox of which items surround a given item.
	 */
	GridLayoutHandler : function (){
		
		this.numOfColumnsInGrid = 0
		this.grid = null;
		
		this.setGrid = function (aGrid) {
			this.grid = aGrid;
			this.updateGridWidth();
		};
		
		/*
		 * The updateGridWidth function assumes that every child node of this.grid is a re-orderable
		 * item. This assumption allows the use of indices and knowledge of the number of columns in
		 * determining what item is 'above' or 'below' a given item.
		 * NOTE: The lightbox needs to be refactored to work without this assumption, so that it can
		 * identify re-orderable items another way e.g. through a class name
		 */
		this.updateGridWidth = function () {
			var firstItemY = dojo.coords(this.grid.childNodes[0]).y;
	
			var i = 1;
			while (i < this.grid.childNodes.length) {		
				if (dojo.coords(this.grid.childNodes[i]).y > firstItemY) {
					this.numOfColumnsInGrid = i;
					break;
				}
				i++;
			}
		};
		
		/*
		 * Returns an object containing the item that is to the right of the given item
		 * and a flag indicating whether or not the process has 'wrapped' around the end of
		 * the row that the given item is in
		 */
		this.getRightSibling = function (item) {
			var nextIndex = dojo.indexOf(this.grid.childNodes, item) + 1;
			var hasWrapped = false;
			
			if (nextIndex >= this.grid.childNodes.length) {
				nextIndex = 0;
				hasWrapped = true
			}
			
			return {item: this.grid.childNodes[nextIndex], hasWrapped: hasWrapped};
		},
		
		/*
		 * Returns an object containing the item that is to the left of the given item
		 * and a flag indicating whether or not the process has 'wrapped' around the end of
		 * the row that the given item is in
		 */
		this.getLeftSibling = function (item) {
			var previousIndex = dojo.indexOf(this.grid.childNodes, item) - 1;
			var hasWrapped = false;
			
			if (previousIndex < 0) {
				previousIndex = this.grid.childNodes.length - 1;
				hasWrapped = true
			}
			
			return {item: this.grid.childNodes[previousIndex], hasWrapped: hasWrapped};
		},
		
		/*
		 * Returns an object containing the item that is below the given item in the current grid
		 * and a flag indicating whether or not the process has 'wrapped' around the end of
		 * the column that the given item is in. The flag is necessary because when an image is being
		 * moved to the resulting item location, the decision of whether or not to insert before or
		 * after the item changes if the process wrapped around the column.
		 * NOTE: The lightbox needs to be refactored to work without the assumption that only
		 * re-orderable items exist in the dom. This will mean that simple index-based calculations will
		 * not be adequate.
		 */
		this.getItemBelow = function (item) {
			var curIndex = dojo.indexOf(this.grid.childNodes, item);
			var belowIndex = curIndex+this.numOfColumnsInGrid;
			var hasWrapped = false;
			
			if (belowIndex >= this.grid.childNodes.length) {
				hasWrapped = true;
				belowIndex = belowIndex % this.numOfColumnsInGrid;
			}
			return {item: this.grid.childNodes[belowIndex], hasWrapped: hasWrapped};
		};
		
		/*
		 * Returns an object containing the item that is above the given item in the current grid
		 * and a flag indicating whether or not the process has 'wrapped' around the end of
		 * the column that the given item is in. The flag is necessary because when an image is being
		 * moved to the resulting item location, the decision of whether or not to insert before or
		 * after the item changes if the process wrapped around the column.
		 * NOTE: The lightbox needs to be refactored to work without the assumption that only
		 * re-orderable items exist in the dom. This will mean that simple index-based calculations will
		 * not be adequate.
		 */
		this.getItemAbove = function (item) {
			var curIndex = dojo.indexOf(this.grid.childNodes, item);
			var aboveIndex = curIndex-this.numOfColumnsInGrid;
			var hasWrapped = false;
			
			if (aboveIndex < 0) {
				hasWrapped = true;
				var itemsInLastRow = this.grid.childNodes.length % this.numOfColumnsInGrid;
				if (curIndex  >= itemsInLastRow) {
					aboveIndex = curIndex + this.grid.childNodes.length - itemsInLastRow
						- this.numOfColumnsInGrid;
				} else {
					aboveIndex = curIndex + this.grid.childNodes.length - itemsInLastRow;
				}
			}
			
			return {item: this.grid.childNodes[aboveIndex], hasWrapped: hasWrapped};
		};
	}

});
