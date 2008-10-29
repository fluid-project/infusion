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

    var drinksModel = {
        values: ["library", "parlour", "dining-room", "riesling", "weissbergunder", "pinot-grigio", "gewurztraminer"],
        names: ["Library", "Parlour", "Dining Room", "Berg Rottland Riesling", "Weissbergunder", "Pinot Grigio", "Gewurztraminer Turkheim"],
        choice: ["parlour", "riesling", "pinot-grigio"]
    };
    
    var foodModel = {
        values: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella","asparagus", "chicken", "shrimp", "beef", "peppers", "figs"],
        names: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella","Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
        choice: ["chevre-noir","asparagus", "shrimp", "figs"]
    };
    
    var dumpModel = function (model, el) {
        el.text(JSON.stringify(model, ["choice"]));
    };

    var renderMenu = function () {
        var drinksTree = {
            children: [
                {ID: "drinks", optionlist: {valuebinding: "values"},
                               optionnames: {valuebinding: "names"},
                               selection: {valuebinding: "choice"}},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 0, parentRelativeID: "..::drinks"},
                    {ID: "location-label", choiceindex: 0, parentRelativeID: "..::drinks"}
                ]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 1, parentRelativeID: "..::drinks"},
                    {ID: "location-label", choiceindex: 1, parentRelativeID: "..::drinks"}
                ]},
                {ID: "location-row:", children: [
                    {ID: "location", choiceindex: 2, parentRelativeID: "..::drinks"},
                    {ID: "location-label", choiceindex: 2, parentRelativeID: "..::drinks"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 3, parentRelativeID: "..::drinks"},
                    {ID: "wine-label", choiceindex: 3, parentRelativeID: "..::drinks"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 4, parentRelativeID: "..::drinks"},
                    {ID: "wine-label", choiceindex: 4, parentRelativeID: "..::drinks"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 5, parentRelativeID: "..::drinks"},
                    {ID: "wine-label", choiceindex: 5, parentRelativeID: "..::drinks"}
                ]},
                {ID: "wine-row:", children: [
                    {ID: "wine", choiceindex: 6, parentRelativeID: "..::drinks"},
                    {ID: "wine-label", choiceindex: 6, parentRelativeID: "..::drinks"}
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
        fluid.selfRender(jQuery("#drinks-list"), drinksTree, {model: drinksModel});
        fluid.selfRender(jQuery("#food-list"), foodTree, {model: foodModel, autoBind: true});
    };
    
    return {
        setup: function () {
            var fullEl = fluid.byId("render");
            fullEl.onclick = function () {
                renderMenu();
            };
            
            var dumpButton1 = fluid.byId("dump-bound");
            dumpButton1.onclick = function () {
                console.log("Foo!");
                dumpModel(drinksModel, jQuery("#bound-model"));
            };

            var dumpButton2 = fluid.byId("dump-autobound");
            dumpButton2.onclick = function () {
                console.log("Bar!");
                dumpModel(foodModel, jQuery("#autobound-model"));
            };
        }
    };
}();
