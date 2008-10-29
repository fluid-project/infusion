/*
Copyright 2008 University of Cambridge
Copyright 2008 University of Toronto

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
         * This component tree fully identifies each component by its ID.
         */
        var fullTree = {
            children: [
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

        var selectorMap = [{selector: ".item-row", id: "table-row:"},
                           {selector: ".sku-container", id: "sku"},
                           {selector: ".quantity-container", id: "quantity"},
                           {selector: ".item-container", id: "item"},
                           {selector: ".description-container", id: "description"}];

        if (parsedTemplate) {
            parsedTemplate = fluid.reRender(parsedTemplate, jQuery("[id=table-base:]"), fullTree, {cutpoints: selectorMap});
        } else {
            parsedTemplate = fluid.selfRender(jQuery("[id=table-base:]"), fullTree, {cutpoints: selectorMap});
        }
    };

    /**
     * Renders the HTML table using an abridged form of the component tree.
     */
    var initTableAbridgedTree = function () {
        /*
         * This component tree is in 'short-hand' form. In this form, the 'keys' are assumed
         * to be rsf:ids, and the values are assumed to be the values for those elements in the table.
         */
        var abridgedTree = {
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

        var selectorMap = [{selector: ".item-row", id: "table-row:"},
                           {selector: ".sku-container", id: "sku"},
                           {selector: ".quantity-container", id: "quantity"},
                           {selector: ".item-container", id: "item"},
                           {selector: ".description-container", id: "description"}];

        if (parsedTemplate) {
            parsedTemplate = fluid.reRender(parsedTemplate, jQuery("[id=table-base:]"), abridgedTree, {cutpoints: selectorMap});
        } else {
            parsedTemplate = fluid.selfRender(jQuery("[id=table-base:]"), abridgedTree, {cutpoints: selectorMap});
        }
    };

    /**
     * Data used to generate a component tree, and to bind to the mark-up.
     */
    var dataTable = [
        {sku: "23-23874", quantity: 43,  item: "Helmet", description: "Red baseball helmet. Size: Large."},
        {sku: "48-38835", quantity: 84,  item: "Football", description: "Leather football."},
        {sku: "84-84848", quantity: 31,  item: "Goggles", description: "Light blue swim goggles"},
        {sku: "84-84843", quantity: 56,  item: "Badminton Set", description: "Set of 2 badminton rackets, net, and 3 birdies."},
        {sku: "84-39321", quantity: 128, item: "Tennis Balls", description: "Canister of 3 tennis balls."},
        {sku: "39-48949", quantity: 55,  item: "Snowboard", description: ""},
        {sku: "99-28128", quantity: 77,  item: "Cleats", description: "Soccer cleats. Size: 10."},
        {sku: "83-48281", quantity: 65,  item: "Volleyball", description: ""},
        {sku: "89-32811", quantity: 67,  item: "Sweatband", description: "Blue sweatband. Size: Medium."},
        {sku: "28-22847", quantity: 43,  item: "Golf Set", description: "Set of 9 golf clubs and bag."},
        {sku: "38-38281", quantity: 35,  item: "Basketball Shorts", description: "Green basketball shorts. Size: Small."},
        {sku: "82-38333", quantity: 288, item: "Lip balm", description: "Lip balm. Flavor: Cherry."},
        {sku: "21-38485", quantity: 177, item: "Ping Pong Ball", description: ""},
        {sku: "83-38285", quantity: 87,  item: "Hockey Puck", description: "Glow-in-the-dark hockey puck."}
    ];

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