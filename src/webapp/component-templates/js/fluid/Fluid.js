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
};

fluid.declare = function(target, args) {
    for (arg in args) {
      target[arg] = args[arg];
    }
  };

fluid.declare(fluid, {
	
	deriveLightboxCellBase: function(namebase, index) {
		return namebase + "lightbox-cell:"+index+":";
	},
	
	// Client-level initialisation for the lightbox, allowing parameterisation for
	// different templates.
	initLightbox: function(namebase, messageNamebase) {
		var reorderform = fluid.Utilities.findForm(document.getElementById(namebase));
		// An <input> tag nested within our root namebase tag, which has an id which 
		// begins with the  namebase:lightbox-cell:: prefix, and ends with "reorder-index" trail.
		// Very hard to imagine any perversity which may lead to this picking any stray stuff :P
		
		// An approach based on the "sourceIndex" DOM property would be much more efficient,
		// but this is only supported in IE. 
		var orderChangedCallback = function() {
			var inputs = fluid.Utilities.seekNodesById(
				reorderform, 
				"input", 
				fluid.deriveLightboxCellBase(namebase, ".*") + "reorder-index"
			);
			
			for (var i = 0; i < inputs.length; ++ i) {
				inputs[i].value = i;
			}

			if (reorderform && reorderform.action) {
				dojo.xhrPost({
					url: reorderform.action,
					form: reorderform,
					load: function(type, data, evt){ /* No-op response */ }
				});
			}
		};
		
		var lightbox = new fluid.Reorderer({
				messageNamebase : messageNamebase,
				orderChangedCallback: orderChangedCallback,
				layoutHandler: new fluid.GridLayoutHandler()
			}, 
			namebase
		);
	}
});  

fluid.declare(fluid, {
	/*
	 * Utilities object for providing various general convenience functions
	 */
    Utilities: {

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
	   ListLayoutHandler : function () {
        this._container = null;
        
        this.setReorderableContainer = function (aList) {
            this._container = aList;
        };
        
        /*
         * Returns an object containing the item that is to the right of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        this._getRightSiblingInfo = function (item) {           
            return this._getSiblingInfo (item, 1);
        };
        
        this.getRightSibling = function (item) {
            return this._getRightSiblingInfo(item).item;
        };
        
        this.moveItemRight = function (item) {
            this._moveItem(item, this._getRightSiblingInfo(item), "after", "before");
        };

        /*
         * Returns an object containing the item that is to the left of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        this._getLeftSiblingInfo = function (item) {
            return this._getSiblingInfo (item, -1);
        };
            
        this.getLeftSibling = function (item) {
            return this._getLeftSiblingInfo(item).item;
        };

        this.moveItemLeft = function (item) {
            this._moveItem(item, this._getLeftSiblingInfo(item), "before", "after");
        };

        /*
         * A general get{Left|Right}SiblingInfo() given an item and a direction.
         * The direction is encoded by either a +1 to move right, or a -1 to
         * move left, and that value is used internally as an increment or
         * decrement, respectively, of the index of the given item.
         */
        this._getSiblingInfo = function (item, /* +1, -1 */ incDecrement) {
            var orderables = dojo.query(".orderable", this._container);
            var index = dojo.indexOf(orderables, item) + incDecrement;
            var hasWrapped = false;
                
            // Handle wrapping to 'before' the beginning. 
            if (index == -1) {
                index = orderables.length - 1;
                hasWrapped = true;
            }
            // Handle wrapping to 'after' the end.
            else if (index == orderables.length) {
                index = 0;
                hasWrapped = true;
            } 
            // Handle case where the passed-in item is *not* an "orderable"
            // (or other undefined error).
            //
            else if (index < -1 || index > orderables.length) {
                index = 0;
            }
            
            return {item: orderables[index], hasWrapped: hasWrapped};
        };

        this.getItemBelow = function (item) {
            return this.getRightSibling(item);
        };

        this.getItemAbove = function (item) {
            return this.getLeftSibling(item);
        };
        
        this.moveItemUp = this.moveItemLeft;
        
        this.moveItemDown = this.moveItemRight;
        
        this._moveItem = function(item, relatedItemInfo, defaultPlacement, wrappedPlacement) {
            var itemPlacement = defaultPlacement;
            if (relatedItemInfo.hasWrapped) {
                itemPlacement = wrappedPlacement;
            }
            dojo.place(item, relatedItemInfo.item, itemPlacement);
        };
        
    },
    
	/*
	 * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
	 * changes dimensions when the window changes size. As a result, when the user presses the up or
	 * down arrow key, the expected behaviour depends on the current window size.
	 * 
	 * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
	 * in the window, and of informing the Lightbox of which items surround a given item.
	 */
	GridLayoutHandler : function (){

        fluid.ListLayoutHandler.call(this);
						
		/*
		 * Returns an object containing the item that is below the given item in the current grid
		 * and a flag indicating whether or not the process has 'wrapped' around the end of
		 * the column that the given item is in. The flag is necessary because when an image is being
		 * moved to the resulting item location, the decision of whether or not to insert before or
		 * after the item changes if the process wrapped around the column.
		 */
		this._getItemInfoBelow = function (inItem) {
			var orderables = dojo.query(".orderable", this._container);
			var curIndex = dojo.indexOf(orderables, inItem);
			var curCoords = dojo.coords(inItem);
			
			// Handle case where the passed-in item is *not* an "orderable"
			if (curIndex < 0) {
				return {item: orderables[0], hasWrapped: false};
			}
			
			for (i = curIndex + 1; i < orderables.length; i++) {
				var iCoords = dojo.coords(orderables[i]);
				if (iCoords.x == curCoords.x && iCoords.y > curCoords.y) {
					return {item: orderables[i], hasWrapped: false};
				}				
			}
			
			for (i = 0; i < curIndex; i++ ) {
				var iCoords = dojo.coords(orderables[i]);
				if (iCoords.x == curCoords.x) {
					return {item: orderables[i], hasWrapped: true};
				}
			}
			
			// Didn't find an item below - return what was passed in
			return {item: inItem, hasWrapped: false};
		};
		
		this.getItemBelow = function(item) {
			return this._getItemInfoBelow(item).item;
		};

		this.moveItemDown = function (item) {
			this._moveItem(item, this._getItemInfoBelow(item), "after", "before");
		};
				
		/*
		 * Returns an object containing the item that is above the given item in the current grid
		 * and a flag indicating whether or not the process has 'wrapped' around the end of
		 * the column that the given item is in. The flag is necessary because when an image is being
		 * moved to the resulting item location, the decision of whether or not to insert before or
		 * after the item changes if the process wrapped around the column.
		 */
		this._getItemInfoAbove = function (inItem) {
			var orderables = dojo.query(".orderable", this._container);
			var curIndex = dojo.indexOf(orderables, inItem);
			var curCoords = dojo.coords(inItem);

			// Handle case where the passed-in item is *not* an "orderable"
			if (curIndex < 0) {
				return {item: orderables[0], hasWrapped: false};
			}

			for (i = curIndex - 1; i > -1; i--) {
				var iCoords = dojo.coords(orderables[i]);
				if (iCoords.x == curCoords.x && iCoords.y < curCoords.y) {
					return {item: orderables[i], hasWrapped: false};
				}				
			}
			
			for (i = orderables.length - 1; i > curIndex; i-- ) {
				var iCoords = dojo.coords(orderables[i]);
				if (iCoords.x == curCoords.x) {
					return {item: orderables[i], hasWrapped: true};
				}
			}
			
			// Didn't find an item above - return what was passed in
			return {item: inItem, hasWrapped: false};
		};

		this.getItemAbove = function (item) {
			return this._getItemInfoAbove(item).item;	
		}; 
		
		this.moveItemUp = function(item) {
			this._moveItem(item, this._getItemInfoAbove(item), "before", "after");
		};
				
	} // End of GridLayoutHandler
		
});
