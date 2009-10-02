/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

var fluid = fluid || {};

fluid.inventoryExample =  function () {

    var parsedTemplate = null;
    
    /**
     * Renders the HTML table using a fully fleshed-out component tree.
     */
    var initTableFullTree = function () {
        /*
         * This component tree fully identifies each component by its rsf ID.
         * Compare this to the abridged tree used by initTableAbridgedTree(), which implies
         * the rsf IDs by using them as keys.
         */
        var fullTree = {
            children: [
                // The colon (:) at the end of the rsf ID identifies the component as a repeating
                // component. In this full tree, there is one object for each repeated component.
                {ID: "table-row:",
                children: [
                    {ID: "sku", value: "23-23874"},
                    {ID: "quantity", value: 43},
                    {ID: "item", value: "Helmet"},
                    {ID: "description", value: "Red baseball helmet. Size: Large."}
                ]},
                {ID: "table-row:",
                children: [
                    {ID: "sku", value: "48-38835"},
                    {ID: "quantity", value: 84},
                    {ID: "item", value: "Football"},
                    {ID: "description", value: "Leather football."}
                ]},
                {ID: "table-row:",
                children: [
                    {ID: "sku", value: "84-84848"},
                    {ID: "quantity", value: 31},
                    {ID: "item", value: "Goggles"},
                    {ID: "description", value: "Light blue swim goggles."}
                ]}
            ]
        };

        // fluid.selfRender() and fluid.reRender() return the original template. This template
        // can be re-used by fluid.reRender().
        if (parsedTemplate) {
            parsedTemplate = fluid.reRender(parsedTemplate, jQuery("[id=table-base:]"), fullTree);
        } else {
            parsedTemplate = fluid.selfRender(jQuery("[id=table-base:]"), fullTree);
        }
    };

    /**
     * Renders the HTML table using an abridged form of the component tree.
     */
    var initTableAbridgedTree = function () {
        /*
         * This component tree is in 'short-hand' form. In this form, the 'keys' are assumed
         * to be rsf IDs, and the values are assumed to be the values for those elements in the table.
         * Compare this tree to the full tree used by initTableFullTree(). The renderer will expand
         * this tree to one that has the same form as that used by initTableFullTree().
         */
        var abridgedTree = {
            // The colon (:) at the end of the rsf ID identifies the component as a repeating
            // component. In this abridged tree, instead of one object per repeated component,
            // there is a single object identifying the repeated element, with an array of object
            // identifying the repeated contents.
            "table-row:": [{
                "sku": "84-84843",
                "quantity": 56,
                "item": "Badminton Set",
                "description": "Set of 2 badminton rackets, net, and 3 birdies."
            }, {
                "sku": "84-39321",
                "quantity": 128,
                "item": "Tennis Balls",
                "description": "Canister of 3 tennis balls."
            }, {
                "sku": "39-48949",
                "quantity": 55,
                "item": "Snowboard",
                "description": ""
            }]
        };

        // fluid.selfRender() and fluid.reRender() return the original template. This template
        // can be re-used by fluid.reRender().
        if (parsedTemplate) {
            parsedTemplate = fluid.reRender(parsedTemplate, jQuery("[id=table-base:]"), abridgedTree);
        } else {
            parsedTemplate = fluid.selfRender(jQuery("[id=table-base:]"), abridgedTree);
        }
    };

    return {
        setup: function () {
            var fullEl = fluid.byId("render-full");
            fullEl.onclick = function () {
                initTableFullTree();
            };

            var abridgedEl = fluid.byId("render-abridged");
            abridgedEl.onclick = function () {
                initTableAbridgedTree();
            };
        }
    };
}();