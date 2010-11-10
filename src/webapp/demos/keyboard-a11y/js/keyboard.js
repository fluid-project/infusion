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

    var makeFiveStarsNavigable = function (fiveStarRanker) {
        var starContainer = fiveStarRanker.container;

        // put the five-star ranker into the tab order, and
        // show visual confirmation when focus is there
        starContainer.fluid("tabbable");
        starContainer.focus(function () {
            starContainer.addClass(demo.initImageRanker.styles.selected);
        });

        // make the stars themselves selectable
        starContainer.fluid("selectable", {
            direction: fluid.a11y.orientation.HORIZONTAL,
            // because the stars don't have the default "selectable" class, we must
            // specify what is to be selectable:
            selectableSelector: fiveStarRanker.options.selectors.stars,
            onSelect: function (starEl) {
                fiveStarRanker.highlightStar(starEl, "hover");
            },
            onUnselect: function (thumbEl) {
                fiveStarRanker.restoreStars();
            },
            onLeaveContainer: function () {
                starContainer.removeClass(demo.initImageRanker.styles.selected);
            }
        });
    };

    var makeRankHandler = function (fiveStarRanker) {
        return function (evt) {
            fiveStarRanker.highlightStar(evt.target, "select");
        };
    };

    var makeFiveStarsActivatable = function (fiveStarRanker) {
        fiveStarRanker.stars.fluid("activatable", makeRankHandler(fiveStarRanker));
    };

    /**
     * Main demo initialization
     */
    demo.initImageRanker = function () {
        // the five-star ranking code can be found in the file five-star.js
        var fiveStarRanker = demo.fiveStar(demo.initImageRanker.selectors.ranker);
        var stars = fiveStarRanker.locate("stars");
        
        makeThumbnailsNavigable();
        makeThumbnailsActivatable();
        
        // the five-star widget provides mouse-support, but not keyboard
        // add keyboard support using the plugin
        makeFiveStarsNavigable(fiveStarRanker);
        makeFiveStarsActivatable(fiveStarRanker);
    };
    
    /**
     * Defaults for the demo
     */
    demo.initImageRanker.selectors = {
        thumbnails: ".demo-container-imageThumbnails",
        ranker: ".demo-container-fiveStar",
        image: ".demo-image-mainImage"
    };
    demo.initImageRanker.styles = {
        selected: "demo-selected",
        activated: "demo-activated"
    };
})(jQuery, fluid);