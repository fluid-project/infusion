/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*
Notes to self:
build different component subtrees separately
concatenate them together using
        tree = {children: fluid.copy(tree.children).concat(subtree)};

*/
var demo = demo || {};
(function ($) {
    
    var buildCutpoints = function () {
        var points = [
            {id: "intro-paragraph", selector: "#intro-paragraph"},
            {id: "wines", selector: "#wines"},
            {id: "wine-row:", selector: ".wine"},
            {id: "wine", selector: ".wine-button"},
            {id: "wine-label", selector: ".wine-name"}
        ];
        return points;
    };

    var dataToTree = function (object, index) {
            
    };

    var buildWineListSubtree = function () {
        var treeChildren =  [
                {ID: "wines", optionlist: {valuebinding: "codes"},
                              optionnames: {valuebinding: "names"},
                              selection: {valuebinding: "choice"}
                }
            ];
        var wineRows = fluid.explodeSelectionToInputs(demo.data.wineListModel.codes, {
            rowID: "wine-row:",
            inputID: "wine",
            labelID: "wine-label",
            selectID: "wines"
        });
        var tree = fluid.copy(treeChildren).concat(wineRows);

//        tree = fluid.transform(data, dataToTree);
        return tree;
    };

    var buildComponentTree = function () {
        var introTree = [
            {ID: "intro-paragraph", value: demo.data.intro}
        ];
        var tree = {children: introTree.concat(buildWineListSubtree())};
        return tree;
    };

    demo.render = function () {
        var options = {
            cutpoints: buildCutpoints(),
            model: demo.data.wineListModel,
            debugMode: true
        };
        var componentTree = buildComponentTree();

        var fullEl = fluid.byId("render");
        fullEl.onclick = function () {
            fluid.selfRender($("body"), componentTree, options);
        };
    };
})(jQuery);