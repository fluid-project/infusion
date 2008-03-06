var fluid = fluid || {};

fluid.Lightbox = {
	addThumbnailActivateHandler: function (lightboxContainer) {
		
		var enterKeyHandler = function (evt) {
			if (evt.which == fluid.keys.ENTER) {
				var thumbnailAnchors = jQuery ("a", evt.target);
				document.location = thumbnailAnchors.attr ('href');
			}
		};
		
		jQuery (lightboxContainer).keypress (enterKeyHandler);
	}
};