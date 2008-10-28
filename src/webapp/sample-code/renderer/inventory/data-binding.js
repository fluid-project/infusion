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

fluid.dataBindingExample = function () {

    var renderMenu = function () {
        var locationTree = {
            children: [
                {ID: "location", optionlist: ["library", "parlour", "dining-room"],
                               optionnames: ["Library", "Parlour", "Dining Room"],
                               selection: ["parlour"]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 0, parentRelativeID: "..::location"},
                    {ID: "location-label", choiceindex: 0, parentRelativeID: "..::location"}
                ]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 1, parentRelativeID: "..::location"},
                    {ID: "location-label", choiceindex: 1, parentRelativeID: "..::location"}
                ]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 2, parentRelativeID: "..::location"},
                    {ID: "location-label", choiceindex: 2, parentRelativeID: "..::location"}
                ]}
            ]
        };
        
        fluid.selfRender(jQuery("#location"), locationTree, {debugMode: true});

        var menuTree = {
            children: [
                {ID: "wine-checkboxes", optionlist: ["berg-rottland-riesline", "weissbergunder", "pinot-grigio", "gewurztraminer-turkheim"],
                               optionnames: ["Berg Rottland Riesling", "Weissbergunder", "Pinot Grigio", "Gewurztraminer Turkheim"],
                               selection: []},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 0, parentRelativeID: "..::wine-checkboxes"},
                    {ID: "wine-label", choiceindex: 0, parentRelativeID: "..::wine-checkboxes"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 1, parentRelativeID: "..::wine-checkboxes"},
                    {ID: "wine-label", choiceindex: 1, parentRelativeID: "..::wine-checkboxes"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 2, parentRelativeID: "..::wine-checkboxes"},
                    {ID: "wine-label", choiceindex: 2, parentRelativeID: "..::wine-checkboxes"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 3, parentRelativeID: "..::wine-checkboxes"},
                    {ID: "wine-label", choiceindex: 3, parentRelativeID: "..::wine-checkboxes"}
                ]},
                {ID: "cheese-checkboxes", optionlist: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella"],
                               optionnames: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella"],
                               selection: []},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 0, parentRelativeID: "..::cheese-checkboxes"},
                    {ID: "cheese-label", choiceindex: 0, parentRelativeID: "..::cheese-checkboxes"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 1, parentRelativeID: "..::cheese-checkboxes"},
                    {ID: "cheese-label", choiceindex: 1, parentRelativeID: "..::cheese-checkboxes"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 2, parentRelativeID: "..::cheese-checkboxes"},
                    {ID: "cheese-label", choiceindex: 2, parentRelativeID: "..::cheese-checkboxes"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 3, parentRelativeID: "..::cheese-checkboxes"},
                    {ID: "cheese-label", choiceindex: 3, parentRelativeID: "..::cheese-checkboxes"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 4, parentRelativeID: "..::cheese-checkboxes"},
                    {ID: "cheese-label", choiceindex: 4, parentRelativeID: "..::cheese-checkboxes"}
                ]}
        ]};

        fluid.selfRender(jQuery(".#menu"), menuTree, {debugMode: true});        
    };
    
    return {
        setup: function () {
            var fullEl = fluid.byId("render");
            fullEl.onclick = function () {
                renderMenu();
            };
        }
    };
}();
