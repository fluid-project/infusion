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
/*global fluid_0_6*/

var fluid = fluid || {};
/*
Plan:
have several 'render' buttons that use several different ways:
1) fully hydrated table only
2) dehydrated table only
3) data binding (is this the same as I have now? what is the bind thing?)
*/

fluid.inventoryExample =  function () {

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

    var initSimpleTable = function () {
        var tree = [];
        for (var i = 0; i < dataTable.length; i++) {
            var item = dataTable[i];
            var row = fluid.explode(item, i).concat([{
                ID: "select",
                value: false
            }]);
            tree[tree.length] = row;
        }
        tree = { "table-row:": tree };
        
        fluid.selfRender(jQuery("[id=table-base:]"), tree, {
            bind: dataTable
        });
    };

    return {
        setup: function () {
            var simpel = fluid.byId("render-simple");
            simpel.onclick = function () {
                initSimpleTable();
            };
        }
    };
}();