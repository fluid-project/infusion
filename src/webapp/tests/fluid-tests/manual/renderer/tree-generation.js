/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

/*global genTest*/
var genTest = genTest || {};

(function ($, fluid) {
    var selectors1 = {
        root: ".my-root",
        row: ".my-row",
        choice: ".my-choice",
        label: ".my-label"
    };
    var selectors2 = {
        root: ".my-root2",
        row: ".my-row2",
        choice: ".my-choice2",
        label: ".my-label2"
    };
    
    var selectorMap = function (selectors) {
        return [{selector: selectors.root, id: "select-choice-root"},
                {selector: selectors.row, id: "select-choice-row:"},
                {selector: selectors.choice, id: "select-choice"},
                {selector: selectors.label, id: "select-choice-label"}];
    };
    
    var buildSelectChoiceTree = function (model, selectors) {
        var tree = {};
        tree.children = [{
            ID: "select-choice-root",
            selection: model.selection,
            optionnames: model.optionnames,
            optionlist: model.optionlist
        }];
        var optionChildren = fluid.transform(model.optionlist, function (option, index) {
    	    return {
                ID: "select-choice-row:", 
                children: [
                    {ID: "select-choice", parentRelativeID: "..::select-choice-root", choiceindex: index},
                    {ID: "select-choice-label", parentRelativeID: "..::select-choice-root", choiceindex: index}
                ]
    	    };
    	});
        tree = tree.children.concat(optionChildren);
        return tree;
    };

    var selectionModel1 = {
        optionnames: ["Hey", "you", "there!"],
        optionlist: ["foo", "bar", "foo-bar"],
        selection: ["bar"]
    };
    var selectionModel2 = {
        optionnames: ["I'm", "not", "here", "now."],
        optionlist: ["cat", "dog", "hamster", "gerbil"],
        selection: ["cat", "gerbil"]
    };

    genTest.renderComponents = function () {
        var subtree1 = buildSelectChoiceTree(selectionModel1, selectors1);
        var subtree2 = buildSelectChoiceTree(selectionModel2, selectors2);
        var tree = subtree1.concat(subtree2);
        var options = {cutpoints: selectorMap(selectors1),
                       debugMode: true};
        var selectTemplate = fluid.selfRender($("#selection-test"), tree, options);
    };    

})(jQuery, fluid);
