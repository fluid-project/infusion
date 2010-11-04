/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

var demo = demo || {};

(function ($, fluid) {
    
    var makeRankerNavigable = function () {
        var ranker = $(demo.initImageRanker.selectors.rater);
        ranker.fluid("tabbable");
        ranker.fluid("selectable", {
            selectableSelector: "img",
            direction: fluid.a11y.orientation.HORIZONTAL,
            onSelect: function (star) {
                console.log("star selected: " + $(star).attr("class"));
            }
        });
    };

    var makeThumbnailsNavigable = function () {
        var thumbContainer = $(demo.initImageRanker.selectors.thumbnails);
        thumbContainer.fluid("tabbable");
        thumbContainer.fluid("selectable", {
            direction: fluid.a11y.orientation.HORIZONTAL,
            onSelect: function (thumbEl) {
                $(thumbEl).addClass(demo.initImageRanker.styles.selected);
            },
            onUnselect: function (thumbEl) {
                $(thumbEl).removeClass(demo.initImageRanker.styles.selected);
            }
        });
    };

    var imageActivationHandler = function (evt) {
        // remove the "activated" style from any other thumbnails
        $("img", demo.initImageRanker.selectors.thumbnails).removeClass(demo.initImageRanker.styles.activated);
        
        // display the selected image in the main viewer
        var thumb = $(evt.target);
        var src = thumb.attr("src");
        $(demo.initImageRanker.selectors.image).attr("src", src);

        // add the "activated" class to the current thumbnail
        thumb.addClass(demo.initImageRanker.styles.activated);
    };
    var makeThumbnailsActivatable = function () {
        var thumbs = $("img", demo.initImageRanker.selectors.thumbnails);
        thumbs.fluid("activatable", imageActivationHandler);

        // add the same handler to the click event
        thumbs.click(imageActivationHandler);
    };

    demo.initImageRanker = function () {
        makeThumbnailsNavigable();
        makeThumbnailsActivatable();
    };
    
    demo.initImageRanker.selectors = {
        thumbnails: ".demo-container-imageThumbnails",
        rater: "#ranking",
        image: ".demo-image-mainImage"
    };

    demo.initImageRanker.styles = {
        selected: "demo-selected",
        activated: "demo-activated"
    };
})(jQuery, fluid);