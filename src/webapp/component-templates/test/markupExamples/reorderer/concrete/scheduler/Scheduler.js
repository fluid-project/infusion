/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

if (typeof(fluid) == "undefined") {
    fluid = {};
}

fluid.Scheduler = {};

fluid.Scheduler.initScheduler = function (containerId) {
    var orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass ("movableTopic");
    var jsonCallback = fluid.Scheduler.createJSONOrderChangedCallback (orderableFinder);
    return new fluid.Reorderer (containerId, {
                                orderChangedCallback: jsonCallback,
                                orderableFinder: orderableFinder,
                                layoutHandler: new fluid.ListLayoutHandler (orderableFinder)
                                });
};

fluid.Scheduler.initRSFScheduler = function (namebase, orderableTagName, orderableIdName, numOrderables) {
    var orderableFinder = fluid.Scheduler.createRSFOrderableFinder (namebase, 
                                                                    orderableTagName, 
                                                                    orderableIdName, 
                                                                    numOrderables);
    return new fluid.Reorderer (namebase, {
                                orderChangedCallback: fluid.Scheduler.createJSONOrderChangedCallback (orderableFinder),
                                orderableFinder: orderableFinder,
                                layoutHandler: new fluid.ListLayoutHandler (orderableFinder)
                                });
};

fluid.Scheduler.createJSONOrderChangedCallback = function (orderableFinder, urlToPostJSON) {
    return function () {
        var orderMapJSONString = fluid.Scheduler.generateJSONStringForOrderables(orderableFinder());
            
        // Then POST it back to the server via XHR.
        fluid.Scheduler.postOrder(orderMapJSONString, urlToPostJSON);
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
        return jQuery (orderableSelector, containerElement);
    };
};

fluid.Scheduler.createPortalSafeFinder = function (containerId, orderableName, numOrderables, delimiter) {
    return function (containerElement) {
        if (!delimiter) {
            delimiter = ":";
        }
        
        // Escape the selector, since delimiters tend to be punctuation that will confuse jQuery.
        delimiter = "\\" + delimiter;
        var orderablePrefix = containerId + delimiter + orderableName;
        
        var orderables = [];
        for (var idx = 0; idx < numOrderables; idx++) {         
            var idSelector = "#" + orderablePrefix + idx;
            
            var foundElement = jQuery (idSelector, containerElement).get (0);   
            if (foundElement) {
                orderables.push (foundElement);
            }
        }
    
        return orderables;
    }
};

fluid.Scheduler.createRSFOrderableFinder = function (namebase, orderableTagName, orderableIdName, numOrderables) {
    return function (containerElement) {
        var orderablesRange = "[0-" + (numOrderables - 1) + "]";
        var idRegExp = "^" + namebase + orderableIdName + ":" + orderablesRange + ":" + "$";
        
        return fluid.Utilities.seekNodesById (containerElement, 
                                              orderableTagName, 
                                              fluid.Utilities.escapeSelector(idRegExp));
    }
}

fluid.Scheduler.postOrder = function (jsonString, urlToPostJSON) {
    /*
     * By default this does nothing since we don't have a server to respond to this POST request.
     * But if you did want to actually post the JSON data, you'd just call the following method:
     *
     *     jQuery.post (urlToPostJSON, {order: jsonString});
     */
};