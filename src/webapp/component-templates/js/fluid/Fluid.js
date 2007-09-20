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


