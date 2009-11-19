/*
Copyright 2009 University of Cambridge
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var bindingTest = bindingTest || {};

(function ($, fluid) {

    var model = {
        value: "This is the test data in the model"
    };

    var tree = {
        children: [
            {ID: "edit-input",
             valuebinding: "value"},

            {ID: "display-only-div",
             valuebinding: "value"}
        ]
    };

    bindingTest.bindData = function () {
        fluid.selfRender($(".container-node"), tree, {autoBind: true, model: model});

        $(".dump-button").click(function () {
            $(".model-dump").text(model.value);
        });

        $(".foo").click(function () {
            $(".edit-input").val("programmatically set text");
        });

        $(".model-dump").text(model.value);
    };

})(jQuery, fluid);
