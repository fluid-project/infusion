var fluid = fluid || {};

(function (jQuery, document) {
    var deriveLightboxCellBase = function (namebase, index) {
        return namebase + "lightbox-cell:" + index + ":";
    };
    
    // An <input> tag nested within our root namebase tag, which has an id which 
    // begins with the  namebase:lightbox-cell:: prefix, and ends with "reorder-index" trail.
    // Very hard to imagine any perversity which may lead to this picking any stray stuff :P
    // An approach based on the "sourceIndex" DOM property would be much more efficient,
    // but this is only supported in IE. 
    var createOrderChangedCallback = function (parentNode) {
        var reorderform = fluid.utils.findForm (parentNode);
        
        return function () {
            var inputs = fluid.utils.seekNodesById(
                reorderform, 
                "input", 
                "^" + deriveLightboxCellBase (parentNode.id, "[^:]*") + "reorder-index$");
            
            for (var i = 0; i < inputs.length; i = i+1) {
                inputs[i].value = i;
            }
        
            if (reorderform && reorderform.action) {
                jQuery.post(reorderform.action, 
                jQuery(reorderform).serialize(),
                function (type, data, evt) { /* No-op response */ });
            }
        };
    };
    
    // Public Lightbox API
    fluid.lightbox = {
    	addThumbnailActivateHandler: function (lightboxContainer) {
    		
    		var enterKeyHandler = function (evt) {
    			if (evt.which === fluid.keys.ENTER) {
    				var thumbnailAnchors = jQuery ("a", evt.target);
    				document.location = thumbnailAnchors.attr ('href');
    			}
    		};
    		
    		jQuery (lightboxContainer).keypress (enterKeyHandler);
    	},
    	
    	// Creates a new Lightbox given the necessary parameters.
        setupLightbox: function (container, itemFinderFn, orderChangedFn, instructionMessageId) {
            // Remove the anchors from the taborder.
            jQuery ("a", container).tabIndex (-1);
            fluid.lightbox.addThumbnailActivateHandler (container);
            
            var layoutHandler = new fluid.GridLayoutHandler (itemFinderFn, {
                orderChangedCallback: orderChangedFn
            });
            
            return new fluid.Reorderer (container, itemFinderFn, layoutHandler, {
                messageNamebase : instructionMessageId,
                role : fluid.roles.GRID
            });
        },
        
        // Client-level initialisation for the lightbox, allowing parameterisation for
        // different templates.
        initLightbox: function (namebase, messageNamebase) {
            var parentNode = document.getElementById (namebase);
            var orderChangedCallback = createOrderChangedCallback (parentNode);
            
            // This orderable finder knows that the lightbox thumbnails are 'div' elements
            var lightboxCellNamePattern = "^" + deriveLightboxCellBase (namebase, "[0-9]+") +"$";
            var itemFinder = function () {
                return fluid.utils.seekNodesById (parentNode, "div", lightboxCellNamePattern);
            };
            
            fluid.lightbox.setupLightbox (parentNode, itemFinder, orderChangedCallback, messageNamebase);
        }
    };
}) (jQuery, document);
