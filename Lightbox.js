
dojo.provide("fluid.Lightbox");

dojo.require("dijit.base.Widget");
dojo.require("dijit.base.TemplatedWidget");
dojo.require("dijit.base.FormElement");

dojo.declare(
	"fluid.Lightbox",	// class name
	[dijit.base.FormElement, dijit.base.TemplatedWidget],
	{

		templatePath: dojo.moduleUrl("fluid", "templates/Lightbox.html"),
		selectedNode: null,
		setSelected: function(/*node*/ aNode) {
			
		var defaultClass="image-container-default";
		var hoverClass="image-container-hover";
		var selectedClass="image-container-selected";
		var draggingClass="image-container-dragging";

			// deselect any previously selected node.
			// todo: we may need an unselect function. In which case we will refactor the IF block above.		
			if (this.selectedNode != null) {
				dojo.removeClass (this.selectedNode, selectedClass);
				dojo.addClass (this.selectedNode, defaultClass);
			}
			
			// Note: currently selecting a node that is already "selected" keeps it selected.
			// Question: Should selecting a node if it is already selected deselect the node?
			
			this.selectedNode = aNode;
			dojo.removeClass (this.selectedNode, defaultClass);
			dojo.addClass (this.selectedNode, selectedClass); 
		},
		
		
		
	});

