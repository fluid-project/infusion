/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/
var demo = demo || {};
(function ($) {
    
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
        var tree = fluid.copy(treeChildren).concat(locationRows);
        return tree;
    };

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
        var tree = fluid.copy(treeChildren).concat(wineRows);
        return tree;
    };

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
        var tree = fluid.copy(treeChildren).concat(canapeRows);
        return tree;
    };

    var buildComponentTree = function () {
        var stringsTree = [
            {ID: "intro-paragraph", value: demo.data.strings.intro},
            {ID: "location-label", value: demo.data.strings.locationLabel},
            {ID: "wine-label", value: demo.data.strings.winesLabel},
            {ID: "canape-label", value: demo.data.strings.foodsLabel},
            {ID: "canape-header", value: demo.data.strings.plate},
            {ID: "price-header", value: demo.data.strings.price},
            {ID: "choose-header", value: demo.data.strings.include}
        ];
        var tree = {children: stringsTree
                                .concat(buildWineListSubtree())
                                    .concat(buildCanapeListSubtree())
                                        .concat(buildLocationsSubtree())
                    };
        return tree;
    };

    var dumpDataModel = function(){
        jQuery("#autobound-model").text(JSON.stringify(demo.data));
    };

    demo.render = function () {
        var applier = fluid.makeChangeApplier(demo.data);
        var options = {
            cutpoints: buildCutpoints(),
            model: demo.data,
            applier: applier,
            autoBind: true
        };
        var componentTree = buildComponentTree();
        applier.modelChanged.addListener("*", function (model, oldModel, changeRequest) {
            dumpDataModel();
        });

        
        dumpDataModel();
        var fullEl = fluid.jById("render");
        fullEl.click (function () {
            fluid.selfRender($("body"), componentTree, options);
        });
    };
})(jQuery);