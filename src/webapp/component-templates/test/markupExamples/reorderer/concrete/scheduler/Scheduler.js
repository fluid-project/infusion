if (typeof(fluid) == "undefined") {
	fluid = {};
}

fluid.Scheduler = {};

fluid.Scheduler.initScheduler = function (containerId) {
	var orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass ("movableTopic");
	return new fluid.Reorderer (containerId, {
								orderChangedCallback: fluid.Scheduler.createJSONOrderChangedCallback (orderableFinder),
								orderableFinder: orderableFinder,
								layoutHandler: new fluid.GridLayoutHandler (orderableFinder)
								});
};

fluid.Scheduler.fixedElementLayoutHandler = {
	
};

fluid.Scheduler.createJSONOrderChangedCallback = function (orderableFinder) {
	return function () {
		var orderMapJSONString = fluid.Scheduler.generateJSONStringForOrderables(orderableFinder());
			
		// Then POST it back to the server via XHR.
		fluid.Scheduler.postOrder(orderMapJSONString);
	};
};

fluid.Scheduler.generateJSONStringForOrderables = function (orderables) {
	// Create a simple data structure keyed by element id and with the ordinal number as value.
	var orderMap = {};
	jQuery.each (orderables, function (index, element) {
		orderMap[jQuery(element).attr("id")] = index;
	});
	
	// Then serialize it to a JSON string.
	return JSON.stringify(orderMap);
};

fluid.Scheduler.createCSSOrderableFinderForClass = function (className) {
	return function (containerElement) {
		var orderableSelector = "." + className;
		return jQuery(orderableSelector, containerElement);
	};
};

fluid.Scheduler.postOrder = function (jsonString) {
	
};