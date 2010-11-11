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

        //*** Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
        thumbContainer.fluid("tabbable");

        //*** Use the Keyboard Accessibility Plugin to make the image thumbnails selectable
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

    var makeImageActivationHandler = function(fiveStarRanker, model){
        
        // create a function that will be uses as the event handler when a thumbnail is activated
        return function(evt){
            // remove the selected styling from the current image
            $("img", demo.initImageRanker.selectors.thumbnails).removeClass(demo.initImageRanker.styles.activated);

            // display the selected image in the main viewer
            var thumb = $(evt.target);
            var src = thumb.attr("src");
            $(demo.initImageRanker.selectors.image).attr("src", src);
            
            // update the current selection
            thumb.addClass(demo.initImageRanker.styles.activated);

            // update the five-star with the image's rank
            fiveStarRanker.setRank(model[src]);
        };
    };

    var makeThumbnailsActivatable = function (fiveStarRanker, model) {
        var thumbs = $("img", demo.initImageRanker.selectors.thumbnails);

        // create the event handler
        var handler = makeImageActivationHandler(fiveStarRanker, model);

        //*** Use the Keyboard Accessibility Plugin to make the thumbnails activatable by keyboard
        thumbs.fluid("activatable", handler);

        // add the same handler to the click event
        thumbs.click(handler);
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
            rememberSelectionState: false,
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

    var bindEventHandlers = function (fiveStarRanker, model) {
        fiveStarRanker.events.modelChanged.addListener(function (newModel, oldModel) {
            // change the rank of the current image to the new rank
            var currImg = $(demo.initImageRanker.selectors.image).attr("src");
            model[currImg] = newModel;
        });
    };
    /**
     * Main demo initialization
     */
    demo.initImageRanker = function () {
        // the five-star ranking code can be found in the file five-star.js
        var fiveStarRanker = demo.fiveStar(demo.initImageRanker.selectors.ranker);
        
        // set up an internal record of the ranks selected
        var images = $("img", $(demo.initImageRanker.selectors.thumbnails));
        var model = {};
        fluid.each(images, function (value, key) {
            model[$(value).attr("src")] = 1;
        });
        
        makeThumbnailsNavigable();
        makeThumbnailsActivatable(fiveStarRanker, model);
        
        // the five-star widget provides mouse-support, but not keyboard
        // add keyboard support using the plugin
        makeFiveStarsNavigable(fiveStarRanker);
        makeFiveStarsActivatable(fiveStarRanker);
        
        bindEventHandlers(fiveStarRanker, model);
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