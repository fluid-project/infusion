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

        var unboundTree = {
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
                ]}
        ]};
        var boundTree = {
            children: [
                {ID: "cheese-checkboxes", optionlist: {valuebinding: "values"},
                               optionnames: {valuebinding: "names"},
                               selection: {valuebinding: "choice"}},
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
        var cheeseModel = {
            values: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella"],
            names: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella"],
            choice: "chevre-noir"
        };

        var autoBoundTree = {
            children: [
                {ID: "canape-checkboxes", optionlist: {valuebinding: "values"},
                               optionnames: {valuebinding: "names"},
                               selection: {valuebinding: "choice"}},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 0, parentRelativeID: "..::canape-checkboxes"},
                    {ID: "canape-label", choiceindex: 0, parentRelativeID: "..::canape-checkboxes"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 1, parentRelativeID: "..::canape-checkboxes"},
                    {ID: "canape-label", choiceindex: 1, parentRelativeID: "..::canape-checkboxes"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 2, parentRelativeID: "..::canape-checkboxes"},
                    {ID: "canape-label", choiceindex: 2, parentRelativeID: "..::canape-checkboxes"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 3, parentRelativeID: "..::canape-checkboxes"},
                    {ID: "canape-label", choiceindex: 3, parentRelativeID: "..::canape-checkboxes"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 4, parentRelativeID: "..::canape-checkboxes"},
                    {ID: "canape-label", choiceindex: 4, parentRelativeID: "..::canape-checkboxes"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 5, parentRelativeID: "..::canape-checkboxes"},
                    {ID: "canape-label", choiceindex: 5, parentRelativeID: "..::canape-checkboxes"}
                ]}
            ]};
        var canapeModel = {
            values: ["asparagus", "chicken-ballotine", "shrimp-crostini", "beef-salsa-verde", "peppers-goat-cheese", "gorgonzola-figs"],
            names: ["Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
            choice: ["asparagus", "shrimp-crostini", "gorgonzola-figs"]
        };

        fluid.selfRender(jQuery("#wine-list"), unboundTree);
        fluid.selfRender(jQuery("#cheese-list"), boundTree, {model: cheeseModel});
        fluid.selfRender(jQuery("#canape-list"), autoBoundTree, {model: canapeModel, autoBind: true});
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
