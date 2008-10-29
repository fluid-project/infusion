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

    var dumpModel = function (model, el) {
        el.text(JSON.stringify(model, ["choice"]));
    };

    var wineModel = {
        values: ["riesling", "weissbergunder", "pinot-grigio", "gewurztraminer"],
        names: ["Berg Rottland Riesling", "Weissbergunder", "Pinot Grigio", "Gewurztraminer Turkheim"],
        choice: ["riesling", "pinot-grigio"]
    };

    var foodModel = {
        values: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella","asparagus", "chicken", "shrimp", "beef", "peppers", "figs"],
        names: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella","Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
        choice: ["chevre-noir","asparagus", "shrimp", "figs"]
    };

    var renderMenu = function () {
        var locationTree = {
            children: [
                {ID: "locations", optionlist: ["library", "parlour", "dining-room"],
                                  optionnames: ["Library", "Parlour", "Dining Room"],
                                  selection: ["parlour"]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 0, parentRelativeID: "..::locations"},
                    {ID: "location-label", choiceindex: 0, parentRelativeID: "..::locations"}
                ]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 1, parentRelativeID: "..::locations"},
                    {ID: "location-label", choiceindex: 1, parentRelativeID: "..::locations"}
                ]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 2, parentRelativeID: "..::locations"},
                    {ID: "location-label", choiceindex: 2, parentRelativeID: "..::locations"}
                ]}
            ]
        };
        
        var wineTree = {
            children: [
                {ID: "wines", optionlist: {valuebinding: "values"},
                              optionnames: {valuebinding: "names"},
                              selection: {valuebinding: "choice"}},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 0, parentRelativeID: "..::wines"},
                    {ID: "wine-label", choiceindex: 0, parentRelativeID: "..::wines"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 1, parentRelativeID: "..::wines"},
                    {ID: "wine-label", choiceindex: 1, parentRelativeID: "..::wines"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 2, parentRelativeID: "..::wines"},
                    {ID: "wine-label", choiceindex: 2, parentRelativeID: "..::wines"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 3, parentRelativeID: "..::wines"},
                    {ID: "wine-label", choiceindex: 3, parentRelativeID: "..::wines"}
                ]}
            ]
        };

        var foodTree = {
            children: [
                {ID: "food", optionlist: {valuebinding: "values"},
                             optionnames: {valuebinding: "names"},
                             selection: {valuebinding: "choice"}},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 0, parentRelativeID: "..::food"},
                    {ID: "cheese-label", choiceindex: 0, parentRelativeID: "..::food"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 1, parentRelativeID: "..::food"},
                    {ID: "cheese-label", choiceindex: 1, parentRelativeID: "..::food"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 2, parentRelativeID: "..::food"},
                    {ID: "cheese-label", choiceindex: 2, parentRelativeID: "..::food"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 3, parentRelativeID: "..::food"},
                    {ID: "cheese-label", choiceindex: 3, parentRelativeID: "..::food"}
                ]},
                {ID: "cheese-row:", children: [
                    {ID: "cheese", choiceindex: 4, parentRelativeID: "..::food"},
                    {ID: "cheese-label", choiceindex: 4, parentRelativeID: "..::food"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 5, parentRelativeID: "..::food"},
                    {ID: "canape-label", choiceindex: 5, parentRelativeID: "..::food"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 6, parentRelativeID: "..::food"},
                    {ID: "canape-label", choiceindex: 6, parentRelativeID: "..::food"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 7, parentRelativeID: "..::food"},
                    {ID: "canape-label", choiceindex: 7, parentRelativeID: "..::food"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 8, parentRelativeID: "..::food"},
                    {ID: "canape-label", choiceindex: 8, parentRelativeID: "..::food"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 9, parentRelativeID: "..::food"},
                    {ID: "canape-label", choiceindex: 9, parentRelativeID: "..::food"}
                ]},
                {ID: "canape-row:", children: [
                    {ID: "canape", choiceindex: 10, parentRelativeID: "..::food"},
                    {ID: "canape-label", choiceindex: 10, parentRelativeID: "..::food"}
                ]}
            ]};

       fluid.selfRender(jQuery("#location"), locationTree);

        fluid.selfRender(jQuery("#wine-list"), wineTree, {model: wineModel});
        dumpModel(wineModel, jQuery("#bound-model"));
        
        fluid.selfRender(jQuery("#food-list"), foodTree, {model: foodModel, autoBind: true});
        dumpModel(foodModel, jQuery("#autobound-model"));
    };

    return {
        setup: function () {
            var fullEl = fluid.byId("render");
            fullEl.onclick = function () {
                renderMenu();
            };

            var applyButton = fluid.byId("apply-change");
            applyButton.onclick = function () {
                var inputs = $("input", jQuery("#wine-list"));
                fluid.applyChange(inputs);
            };

            var dumpButton1 = fluid.byId("dump-bound");
            dumpButton1.onclick = function () {
                dumpModel(wineModel, jQuery("#bound-model"));
            };

            var dumpButton2 = fluid.byId("dump-autobound");
            dumpButton2.onclick = function () {
                dumpModel(foodModel, jQuery("#autobound-model"));
            };
        }
    };
}();
