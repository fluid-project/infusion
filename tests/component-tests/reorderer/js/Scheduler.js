/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

(function () {
    "use strict";

    var fetchReordererContainer = function (id) {
        return fluid.jById(id);
    };

    fluid.Scheduler =  {
        initScheduler: function (containerId) {
            var movableFinder = fluid.Scheduler.createCSSOrderableFinderForClass("movableTopic");
            var jsonCallback = fluid.Scheduler.createJSONafterMoveCallback(movableFinder);
            var container = fetchReordererContainer(containerId);
            var options = {
                layoutHandler: "fluid.listLayoutHandler",
                selectors: {
                    movables: movableFinder
                },
                afterMoveCallback: jsonCallback
            };

            return fluid.reorderer(container, options);
        },

        createJSONafterMoveCallback: function (orderableFinder, urlToPostJSON) {
            return function () {
                var orderMapJSONString = fluid.Scheduler.generateJSONStringForOrderables(orderableFinder());

                // Then POST it back to the server via XHR.
                fluid.Scheduler.postOrder(orderMapJSONString, urlToPostJSON);
            };
        },

        generateJSONStringForOrderables: function (orderables) {
            // Create a simple data structure keyed by element id and with the ordinal number as value.
            var orderMap = {};
            jQuery.each(orderables, function (index, element) {
                orderMap[jQuery(element).prop("id")] = index;
            });

            // Then serialize it to a JSON string.
            return JSON.stringify(orderMap);
        },

        createCSSOrderableFinderForClass: function (className) {
            return function () {
                var orderableSelector = "." + className;
                return jQuery(orderableSelector);
            };
        },

        createPortalSafeFinder: function (containerId, orderableName, numOrderables, delimiter) {
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

                    var foundElement = jQuery(idSelector, containerElement).get(0);
                    if (foundElement) {
                        orderables.push(foundElement);
                    }
                }

                return orderables;
            };
        },

        postOrder: function (/* jsonString, urlToPostJSON */) {
            /*
             * By default this does nothing since we don't have a server to respond to this POST request.
             * But if you did want to actually post the JSON data, you'd just call the following method:
             *
             *     jQuery.post (urlToPostJSON, {order: jsonString});
             */
        }
    };
})();
