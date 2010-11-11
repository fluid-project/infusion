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
    

    /**
     * Assign any relevant ARIA roles, states, properties.
     */
    var setAria = function (container, thumbs) {
        container.attr("role", "application");
        thumbs.attr("aria-controls", "image-preview");
        $("img", thumbs).attr("aria-selected", false);
    };

    /**
     * Ensure that the image thumbnails can be navigated using the keyboard
     */
    var makeThumbnailsNavigable = function (thumbs) {
        //*** Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
        thumbs.fluid("tabbable");

        //*** Use the Keyboard Accessibility Plugin to make the image thumbnails selectable
        thumbs.fluid("selectable", {
            direction: fluid.a11y.orientation.HORIZONTAL,
            onSelect: function (thumbEl) {
                $(thumbEl).addClass(demo.initImageRanker.styles.selected);
            },
            onUnselect: function (thumbEl) {
                $(thumbEl).removeClass(demo.initImageRanker.styles.selected);
            }
        });
    };

    var displayImage = function (thumb, thumbs, fiveStarRanker, model) {
        // remove the selected styling from the current image
        $("img", thumbs).removeClass(demo.initImageRanker.styles.activated);
        thumbs.attr("aria-selected", false);

        // display the selected image in the main viewer
        var src = thumb.attr("src");
        $(demo.initImageRanker.selectors.image).attr("src", src);
        $(demo.initImageRanker.selectors.image).attr("alt", thumb.attr("alt"));
        
        // update the current selection
        thumb.addClass(demo.initImageRanker.styles.activated);
        thumb.attr("aria-selected", true);

        // update the five-star with the image's rank
        fiveStarRanker.setRank(model[src]);
    };

    /**
     * Create a function that will be uses as the event handler when a thumbnail is activated
     */
    var makeImageActivationHandler = function (thumbs, fiveStarRanker, model) {
        
        return function (evt) {
            var thumb = $(evt.target);
            displayImage(thumb, thumbs, fiveStarRanker, model);
        };
    };

    /**
     * Ensure that the image thumbnails can be activated using the keyboard
     */
    var makeThumbnailsActivatable = function (thumbs, fiveStarRanker, model) {
        // create the event handler
        var handler = makeImageActivationHandler(thumbs, fiveStarRanker, model);

        //*** Use the Keyboard Accessibility Plugin to make the thumbnails activatable by keyboard
        thumbs.fluid("activatable", handler);

        // add the same handler to the click event
        thumbs.click(handler);
    };

    /**
     * Ensure that the five-star ranking widget can be navigated using the keyboard
     */
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
                fiveStarRanker.hoverStars(starEl);
            },
            onUnselect: function (thumbEl) {
                fiveStarRanker.refreshView();
            },
            onLeaveContainer: function () {
                starContainer.removeClass(demo.initImageRanker.styles.selected);
            }
        });
    };

    /**
     * Ensure that the five-star ranking widget can be navigated using the keyboard
     */
    var makeFiveStarsActivatable = function (fiveStarRanker) {
        fiveStarRanker.stars.fluid("activatable", function (evt) {
            fiveStarRanker.pickStar(evt.target);
        });
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
    demo.initImageRanker = function (container) {
        container = $(container);
        // the five-star ranking code can be found in the file five-star.js
        var fiveStarRanker = demo.fiveStar(demo.initImageRanker.selectors.ranker);
        var thumbs = $(demo.initImageRanker.selectors.thumbnails);
        
        // set up an internal model of the ranks selected
        var images = $("img", thumbs);
        var model = {};
        fluid.each(images, function (value, key) {
            model[$(value).attr("src")] = 1;
        });
        
        makeThumbnailsNavigable(thumbs);
        makeThumbnailsActivatable(thumbs, fiveStarRanker, model);
        
        // the five-star widget provides mouse-support, but not keyboard
        // add keyboard support using the plugin
        makeFiveStarsNavigable(fiveStarRanker);
        makeFiveStarsActivatable(fiveStarRanker);
        
        bindEventHandlers(fiveStarRanker, model);
        setAria(container, thumbs);

        // set up with the first image
        displayImage($(images[0]), thumbs, fiveStarRanker, model);        
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