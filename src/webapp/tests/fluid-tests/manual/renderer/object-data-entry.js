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

/*global demo*/
var demo = demo || {};

(function ($, fluid) {

    var parsedTemplate = null;

    var objectDataModel = [{
            object_title: "Title 1",
            object_number: "Number 1",
            object_description: "Description 1",
            object_name: "Name 1",
            object_features: "Features 1",
            number_objects: "Count 1",
            department: "Department 1",
            comments: "Comments 1",
            month: "January",
            day: "1",
            year: "2009"
        },
        {
            object_title: "Title 2",
            object_number: "Number 2",
            object_description: "Description 2",
            object_name: "Name 2",
            object_features: "Features 2",
            number_objects: "Count 2",
            department: "Department 2",
            comments: "Comments 2",
            month: "February",
            day: "2",
            year: "2009"
        }];
    
    var buildTreeFromModel = function (model) {
        var tree = [];
        
        var i = 0;
        var field;
        for (field in model) {
            tree[i] = {ID: field, value: model[field], valuebinding: field};
            i += 1;
        }
        return tree;
    };
    
    var render = function (tree) {
        if (parsedTemplate) {
            parsedTemplate = fluid.reRender(parsedTemplate, $("[id=object-info]"), tree);
        } else {
            parsedTemplate = fluid.selfRender($("[id=object-info]"), tree);
        }
    };
    
    var loadData1 = function () {
        var tree = buildTreeFromModel(objectDataModel[0]);
        render(tree);
    };
    var loadData2 = function () {
        var tree = buildTreeFromModel(objectDataModel[1]);
        render(tree);
    };

    demo.setup = function () {
        var loadEl1 = fluid.byId("load1");
        loadEl1.onclick = function () {
            loadData1();
        };
        var loadEl2 = fluid.byId("load2");
        loadEl2.onclick = function () {
            loadData2();
        };
    };

})(jQuery, fluid);