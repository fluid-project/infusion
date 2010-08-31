/*
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

fluid.dataBindingExample = function () {

    /*
     * Utility function to display the selected items, which are identified
     * by the "choice" member.
     */
    var dumpModel = function (model, el) {
        el.text(JSON.stringify(model, ["choice"]));
    };

    var expandItemToTree = function (selectId, index) {
          return {
            ID: selectId+"-row:", 
            children: [
                 {ID: selectId+"-option", parentRelativeID: "..::"+selectId, choiceindex: index},
                 {ID: selectId+"-label", parentRelativeID: "..::"+selectId, choiceindex: index}]
       };
    };

    var buildSelectionTreeFromModel = function (model, id) {
        var selectTree = [{
            ID: id,
            optionlist: {valuebinding: "values"},
            optionnames: {valuebinding: "names"},
            selection: {valuebinding: "choice"}
        }];
        var rows = [];
        for (i=0;i<model.values.length;i++) {
            rows[i] = expandItemToTree(id, i);
        }
        var tree = {children: selectTree.concat(rows)};
        
        return tree;
    };

    // The following data models will be bound to the input elements in the markup.
    // The 'values' member identifies the value attributes to be used for the inputs.
    // The 'names' member identifies the strings that will be displayed.
    // The 'coice' member identifies which input elements should initally be selected.
    var wineModel = {
        values: ["riesling", "weissbergunder", "pinot-grigio", "gewurztraminer"],
        names: ["Berg Rottland Riesling", "Weissbergunder", "Pinot Grigio", "Gewurztraminer Turkheim"],
        choice: ["riesling", "pinot-grigio"]
    };

    var cheeseModel = {
        values: ["castelo-branco", "chevre-noir", "camembert", "la-sauvagine", "pastorella"],
        names: ["Castelo Branco", "Chevre noir", "Camembert", "La Sauvagine", "Pastorella"],
        choice: ["chevre-noir"]
    };

    var canapeModel = {
        values: ["asparagus", "chicken", "shrimp", "beef", "peppers", "figs"],
        names: ["Filo Wrapped Asparagus", "Chicken Ballotine with Carrot Raita and Pomegranate Chutney", "Spicy Shrimp Crostini", "Broiled Beef Fillet Croutes with Salsa Verde", "Roasted Marinated Peppers with Goat Cheese", "Gorgonzola Stuffed Figs"],
        choice: ["asparagus", "shrimp", "figs"]
    };

    // curry the models into event listeners that update the display (after waiting a moment
    // to give the renderer a chance to actually update the model)
    var dumpWineModel = function(){
		var timeOut = setTimeout(function () {
            dumpModel(wineModel, jQuery("bound-model"));
		}, 50);
    };
    var dumpCheeseModel = function(){
		var timeOut = setTimeout(function () {
            dumpModel(cheeseModel, jQuery("#autobound-cheese-model"));
		}, 50);
    };
    var dumpCanapeModel = function(){
		var timeOut = setTimeout(function () {
            dumpModel(canapeModel, jQuery("#autobound-canape-model"));
		}, 50);
    };

    var renderMenu = function () {

        // The component trees are generated programmatically from the data model.
        var wineTree = buildSelectionTreeFromModel (wineModel, "wine");
        fluid.selfRender(jQuery("#wine-list"), wineTree, {model: wineModel});
        dumpModel(wineModel, jQuery("#bound-model"));
        
        // The autoBind option tells the renderer to automatically update the model when the value
        // of an input changes. Without this parameter, the model must be updated manually through
        // a call to fluid.applyChange().
        var cheeseTree = buildSelectionTreeFromModel (cheeseModel, "cheese");
        fluid.selfRender(jQuery("#cheese-list"), cheeseTree, {model: cheeseModel, autoBind: true});
        dumpModel(cheeseModel, jQuery("#autobound-cheese-model"));

        var canapeTree = buildSelectionTreeFromModel (canapeModel, "canape");
        fluid.selfRender(jQuery("#canape-list"), canapeTree, {model: canapeModel, autoBind: true});
        dumpModel(canapeModel, jQuery("#autobound-canape-model"));

        // when the user changes a selection, automatically update the display of the model,
        // to illustrate what happens to the model
        // Note that the wine-list data model is NOT auto-bound to the UI, and so despite the
        // input listeners, the user won't see any changes to the model until they
        // activate the "apply changes" button
        jQuery("#wine-list input").click(dumpWineModel);
        jQuery("#cheese-list input").click(dumpCheeseModel);
        jQuery("#canape-list input").click(dumpCanapeModel);
    };

    return {
        setup: function () {
            var fullEl = fluid.byId("render");
            fullEl.onclick = function () {
                renderMenu();
            };

            // This call to fluid.applyChange() will update the model associated with the inputs
            // with whatever the current value of the inputs are, and update the display
            var applyButton = fluid.byId("apply-change");
            applyButton.onclick = function () {
                var inputs = $("input", jQuery("#wine-list"));
                fluid.applyChange(inputs);
                dumpModel(wineModel, jQuery("#bound-model"));
            };
        }
    };
}();
