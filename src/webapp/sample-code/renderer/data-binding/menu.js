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

    /*
     * Utility function to display the selected items, which are identified
     * by the "choice" member.
     */
    var dumpModel = function (model, el) {
        el.text(JSON.stringify(model, ["choice"]));
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
        values: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella","asparagus", "chicken", "shrimp", "beef", "peppers", "figs"],
        names: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella","Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
        choice: ["chevre-noir","asparagus", "shrimp", "figs"]
    };

    var renderMenu = function () {
        // This component tree will not be bound to a data model; the data to be used is specified
        // directly in the tree.
        var locationTree = {
            children: [
                // The first item in the component tree defines the container for the input elements.
                // Note that this component does NOT map to any HTML element in the template.
                // The presence of the optionlist, optionnames and selection members identifies this
                // component as a Selection component.
                // The 'optionlist' member identifies the value attributes to be used for the inputs.
                // The 'optionnames' member identifies the strings that will be displayed.
                // The 'selection' member identifies which input elements should initally be selected.
                {ID: "locations", optionlist: ["library", "parlour", "dining-room"],
                                  optionnames: ["Library", "Parlour", "Dining Room"],
                                  selection: ["parlour"]},
                // Each of the following components identifies one member of the selection inputs.
                // Note that these components do not define the data to be used - they reference
                // the data in the parent component defined above, using the parentRelativeID and
                // the choiceindex.
                {ID: "location-row:", children: [
                    // The parentRelativeID uses a special format
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
            ]};

        // The location tree is not bound to a data model, so only the tree itself is passed to
        // fluid.selfRender().
        fluid.selfRender(jQuery("#location"), locationTree);

        // The wine list and food list trees will be bound to a data model, which is passed to
        // fluid.selfRender() in the options parameter.
        fluid.selfRender(jQuery("#wine-list"), wineTree, {model: wineModel});
        dumpModel(wineModel, jQuery("#bound-model"));
        
        // The autoBind option tells the renderer to automatically update the model when the value
        // of an input changes. Without this parameter, the model must be updated manually through
        // a call to fluid.applyChange().
        fluid.selfRender(jQuery("#food-list"), foodTree, {model: foodModel, autoBind: true});
        dumpModel(foodModel, jQuery("#autobound-model"));
    };

    return {
        setup: function () {
            var fullEl = fluid.byId("render");
            fullEl.onclick = function () {
                renderMenu();
            };

            // This call to fluid.applyChange() will update the model associated with the inputs
            // with whatever the current value of the inputs are.
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
