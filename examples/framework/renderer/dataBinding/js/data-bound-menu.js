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

var example = example || {};

(function ($) {
    "use strict";

    /*
     * Utility function to display the selected items, which are identified
     * by the "choice" member.
     */
    var dumpModel = function (model, el) {
        el.text(JSON.stringify(model, ["choice"], "    "));
    };

    // The following two data models will be bound to the input elements in the markup.
    // The 'values' member identifies the value attributes to be used for the inputs.
    // The 'names' member identifies the strings that will be displayed.
    // The 'coice' member identifies which input elements should initally be selected.
    var wineModel = {
        values: ["riesling", "weissbergunder", "pinot-grigio", "gewurztraminer"],
        names: ["Berg Rottland Riesling", "Weissbergunder", "Pinot Grigio", "Gewurztraminer Turkheim"],
        choice: ["riesling", "pinot-grigio"]
    };

    var foodModel = {
        values: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella", "asparagus", "chicken", "shrimp", "beef", "peppers", "figs"],
        names: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella", "Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
        choice: ["chevre-noir", "asparagus", "shrimp", "figs"]
    };

    // curry the food model into an event listener that updates the display (after waiting a moment
    // to give the renderer a chance to actually update the model)
    var dumpFoodModel = function () {
        setTimeout(function () {
            dumpModel(foodModel, jQuery("#autobound-model"));
        }, 50);
    };

    // curry the wine model into an event listener that updates the display (after waiting a moment
    // to give the renderer a chance to actually update the model)
    var dumpWineModel = function () {
        setTimeout(function () {
            dumpModel(wineModel, jQuery("bound-model"));
        }, 50);
    };

    var renderMenu = function () {
        // This component tree will be bound to a data model; instead of providing the data directly
        // in the tree, a valuebinding member is used to identify which member of the model should
        // be bound to the optionlist, optionnames, and selection.
        // The model itself will be identified to the renderer through the options parameter to
        // fluid.selfRender().
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

        // This component tree will be bound to a data model; instead of providing the data directly
        // in the tree, a valuebinding member is used to identify which member of the model should
        // be bound to the optionlist, optionnames, and selection.
        // The model itself will be identified to the renderer through the options parameter to
        // fluid.selfRender().
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
            ]
        };

        // This object maps the HTML elements in the template (identified by the selector)
        // to the component in the component tree (identified by the id).
        var wineSelectorMap = [{selector: ".example-wine-row", id: "wine-row:"},
                               {selector: ".example-wine", id: "wine"},
                               {selector: ".example-wine-label", id: "wine-label"}];

        // The wine list and food list trees will be bound to a data model, which is passed to
        // fluid.selfRender() in the options parameter.
        fluid.selfRender(jQuery("#wine-list"), wineTree, {model: wineModel, cutpoints: wineSelectorMap});
        dumpModel(wineModel, jQuery("#bound-model"));

        // This object maps the HTML elements in the template (identified by the selector)
        // to the component in the component tree (identified by the id).
        var foodSelectorMap = [{selector: ".example-cheese-row", id: "cheese-row:"},
                               {selector: ".example-cheese", id: "cheese"},
                               {selector: ".example-cheese-label", id: "cheese-label"},
                               {selector: ".example-canape-row", id: "canape-row:"},
                               {selector: ".example-canape", id: "canape"},
                               {selector: ".example-canape-label", id: "canape-label"}];

        // The autoBind option tells the renderer to automatically update the model when the value
        // of an input changes. Without this parameter, the model must be updated manually through
        // a call to fluid.applyBoundChange().
        fluid.selfRender(jQuery("#food-list"), foodTree, {model: foodModel, autoBind: true, cutpoints: foodSelectorMap});
        dumpModel(foodModel, jQuery("#autobound-model"));

        // when the user changes a selection, automatically update the display of the model,
        // to illustrate what happens to the model
        jQuery("#wine-list input").click(dumpWineModel);
        jQuery("#food-list input").click(dumpFoodModel);
    };

    example.dataBoundMenu = function () {
        var fullEl = fluid.byId("render");
        var rendered;
        fullEl.onclick = function () {
            renderMenu();
            rendered = true;
        };

        // This call to fluid.applyBoundChange() will update the model associated with the inputs
        // with whatever the current value of the inputs are.
        var applyButton = fluid.byId("apply-change");
        applyButton.onclick = function () {
            if (!rendered) {return; }
            var inputs = $("input", $("#wine-list"));
            fluid.applyBoundChange(inputs);
            dumpModel(wineModel, $("#bound-model"));
        };
    };
})(jQuery);
