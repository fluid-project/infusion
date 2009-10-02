/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var fluid = fluid || {};

fluid.accessiblecheckbox =  function () {
    // Private functions.
    var selectCheckbox = function (boxToFocus) {
        jQuery("label", boxToFocus).addClass("focussed");
    };

    var unselectCheckbox = function (boxToBlur) {
        jQuery("label", boxToBlur).removeClass("focussed");
    };

    var leaveCheckboxes = function (selectedBox) {
        unselectCheckbox(selectedBox);
    };

    var toggleBox = function (box) {
        box.toggleClass("checked");
    };

    var selectCheckboxHandler = function (event) {
        var boxLabel = jQuery("label", event.target);
        toggleBox(boxLabel);
    };

    var replaceInputsWithGraphics = function (boxes) {
        var replaceFn = function (index, box) {
           // Hide the original input box.
           jQuery("input", box).addClass("hiddenBox");

           // Replace it with a graphic on the label.
           jQuery("label", box).addClass("graphicBox");
        };

        boxes.each(replaceFn);
    };

    var clickable = function (boxes) {
        boxes.mousedown(function (evt) {
            fluid.activate(this);
        });
    };

    // Public members.
    return {
        initializeCheckboxes: function (checkboxContainerId) {
            // Make the overall container tab-focussable.
            var checkboxContainer = jQuery("#" + checkboxContainerId);
            fluid.tabbable(checkboxContainer);

            // Find all checkboxes and make them fancy.
            var boxes = checkboxContainer.children ("#checkboxes_0,#checkboxes_1,#checkboxes_2,#checkboxes_3");
            replaceInputsWithGraphics(boxes);

            // Make them key navigable and activatable.
            var options = {
                selectableElements: boxes,
                onSelect: selectCheckbox,
                onUnselect: unselectCheckbox,
                onLeaveContainer: leaveCheckboxes
            };
            fluid.selectable(checkboxContainer, options);
            fluid.activatable(boxes, selectCheckboxHandler);
            clickable(boxes);
        }
    }; // End public return.
}(); // End fluid.accessiblecheckbox namespace.
