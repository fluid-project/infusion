/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/
/*global jQuery, fluid*/

var demo = demo || {};
(function ($) {
    
    /**
     * Build the cutpoints array, which defines renderer IDs for each HTML element that will be
     * rendered.
     */
    var buildCutpoints = function () {
        return [
            {id: "intro-paragraph", selector: "#intro-paragraph"},
            {id: "location-label", selector: "#location-block > label"},
            {id: "wine-label", selector: "#wine-block > label"},
            {id: "canape-label", selector: "#food-block > label"},
            {id: "canape-header", selector: "th.plate"},
            {id: "price-header", selector: "th.price"},
            {id: "choose-header", selector: "th.include"},
            {id: "locations", selector: ".location-list"},
            {id: "wine-row:", selector: ".wine"},
            {id: "wine", selector: ".wine-button"},
            {id: "wine-label", selector: ".wine-name"},
            {id: "canape-row:", selector: ".canape"},
            {id: "canape", selector: ".canape-button"},
            {id: "canape-name", selector: ".canape-name"},
            {id: "canape-price", selector: ".canape-price"}
        ];
    };

    /**
     * Build a component subtree that describes how to render the various strings in the demo.
     * These are literal values, and so the rendered markup is not bound directly to the model.
     * 
     * The practice of using the renderer to display the strings in the interface is useful for
     * internationalization.
     */
    var buildStringsTree = function () {
        return [
            {ID: "intro-paragraph", value: demo.data.strings.intro},
            {ID: "location-label", value: demo.data.strings.locationLabel},
            {ID: "wine-label", value: demo.data.strings.winesLabel},
            {ID: "canape-label", value: demo.data.strings.foodsLabel},
            {ID: "canape-header", value: demo.data.strings.plate},
            {ID: "price-header", value: demo.data.strings.price},
            {ID: "choose-header", value: demo.data.strings.include}
        ];
    };

    /**
     * Build a component subtree that describes how to render the drop-down used to select
     * the location. This uses the framework's explodeSelectionToInputs() function to build
     * most of the subtree given the data and a few strings.
     * 
     * By using 'valuebinding' in conjunction with the 'autobind: true' option, when the user
     * changes the location, the new value will be automatically updated in the model.
     * 
     * Note that this subtree has the same structure as the wine list subtree, despite the fact
     * that the location is rendered in a <select> element, and the wine list is rendered as
     * radio buttons.
     */
    var buildLocationsSubtree = function () {
        var treeChildren =  [
                {ID: "locations", optionlist: {valuebinding: "locations.codes"},
                              optionnames: {valuebinding: "locations.names"},
                              selection: {valuebinding: "locations.choice"}
                }
            ];
        var locationRows = fluid.explodeSelectionToInputs(demo.data.locations.codes, {
            rowID: "location-row:",
            inputID: "location",
            labelID: "location-label",
            selectID: "locations"
        });
        return treeChildren.concat(locationRows);
    };

    /**
     * Build a component subtree that describes how to render the radio buttons used to select
     * the wine. This uses the framework's explodeSelectionToInputs() function to build
     * most of the subtree given the data and a few strings.
     * 
     * By using 'valuebinding' in conjunction with the 'autobind: true' option, when the user
     * changes the wine, the new value will be automatically updated in the model.
     * 
     * Note that this subtree has the same structure as the location subtree, despite the fact
     * that the wine list is rendered as radio buttons, and the location is rendered in a
     * <select> element.
     */
    var buildWineListSubtree = function () {
        var treeChildren =  [
                {ID: "wines", optionlist: {valuebinding: "wineList.codes"},
                              optionnames: {valuebinding: "wineList.names"},
                              selection: {valuebinding: "wineList.choice"}
                }
            ];
        var wineRows = fluid.explodeSelectionToInputs(demo.data.wineList.codes, {
            rowID: "wine-row:",
            inputID: "wine",
            labelID: "wine-label",
            selectID: "wines"
        });
        return treeChildren.concat(wineRows);
    };

    /**
     * Build a component subtree that describes how to render the list of canape plates. This uses
     * the framework's transform() function to build a subtree element for each data item. This
     * method is similar to the explodeSelectionToInputs() function, but because these inputs are
     * embedded in <table> cells with other data, each 'row' has more children than a typical input.
     * 
     * By using 'valuebinding' in conjunction with the 'autobind: true' option, when the user
     * selects canapes, the new values will be automatically updated in the model.
     */
    var buildCanapeListSubtree = function () {
        var treeChildren =  [
                {ID: "canapes", optionlist: {valuebinding: "canapeList.codes"},
                              optionnames: {valuebinding: "canapeList.names"},
                              selection: {valuebinding: "canapeList.choices"}
                }
            ];
        var canapeRows = fluid.transform(demo.data.canapeList.codes, function (opt, index) {
            return {
                ID: "canape-row:",
                children: [
	                {ID: "canape", parentRelativeID: "..::canapes", choiceindex: index},
                    {ID: "canape-name", parentRelativeID: "..::canapes", choiceindex: index},
                    {ID: "canape-price", value: demo.data.canapeList.prices[index]}
                ]
            };
        });
        return treeChildren.concat(canapeRows);
    };

    /**
     * Combine the various renderer subtrees into a single component tree.
     */
    var buildComponentTree = function () {
        return {children: buildStringsTree()
                                .concat(buildWineListSubtree())
                                    .concat(buildCanapeListSubtree())
                                        .concat(buildLocationsSubtree())
                    };
    };

    /**
     * Utility function to convert the model into a pretty-printed string
     */
    var modelToString = function (model) {
        var listStringArray = function (array) {
            var string = "";
            for (var i = 0; i < array.length; i++) {
                string += "\"" + array[i] + "\"";
                if (i < array.length - 1) {
                    string += ", ";
                }
            }
            return string;
        };
    
        var listMembers = function (obj, tab) {
            var string = "";
            
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && key !== "modelToHtmlString") {
                    string += tab + key + ": ";
                    if (obj[key] instanceof Array) {
                        string += "[" + listStringArray(obj[key]) + "]\n";
                    } else if (obj[key] instanceof Object) {
                        string +=  "{\n" + listMembers(obj[key], tab + "  ") + "\n" + tab + "}\n";
                    } else {
                        string += "\"" + obj[key] + "\"\n";
                    }
                }
            }
            return string;
        };
        
        return listMembers(model, "");
    };

    /**
     * Utility function for displaying the data model, so users of the demo can see
     * how it changes with the autobinding.
     */
    var displayDataModel = function () {
        jQuery("#autobound-model").text(modelToString(demo.data));
    };

    /**
     * Wrap the data model in a ChangeApplier, so that we can listen for changes in the model
     * and update the demo's model display.
     */
    var setupDataModel = function () {
        var applier = fluid.makeChangeApplier(demo.data);
        applier.modelChanged.addListener("*", function (model, oldModel, changeRequest) {
            displayDataModel();
        });
        return applier;
    };

    /**
     * Attach to the 'Render' button a function that renders the data.
     */
    var bindEventHandlers = function (button, applier) {
        button.click(function () {
            var options = {
                cutpoints: buildCutpoints(),
                model: demo.data,
                applier: applier,
                autoBind: true
            };
            fluid.selfRender($("body"), buildComponentTree(), options);
        });
    };


    demo.render = function () {
        var applier = setupDataModel();

        var renderButton = fluid.jById("render");
        bindEventHandlers(renderButton, applier);

        displayDataModel();
    };
})(jQuery);