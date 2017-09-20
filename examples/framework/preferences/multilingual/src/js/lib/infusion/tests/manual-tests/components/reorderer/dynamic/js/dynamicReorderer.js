/*
Copyright 2009-2010 University of Cambridge
Copyright 2009-2010 University of Toronto
Copyright 2010-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    demo.initDynamicReorderer = function () {
        // Instantiate the reorderer
        var ordered = fluid.reorderList("#orderableContainer", {
            selectors: {
                movables: ".myorderable"
            }
        });

        // Create new reorderable elements
        jQuery("#newElm").click(function () {
            var orderables = jQuery(".myorderable");
            var nextOrderableNum = orderables.length + 1;
            var nextOrderable = orderables.eq(0).clone();
            nextOrderable.text("This is " + nextOrderableNum);
            nextOrderable.attr("id", nextOrderableNum);

            orderables.last().after(nextOrderable);
            ordered.refresh();
        });
    };


})(jQuery, fluid);
