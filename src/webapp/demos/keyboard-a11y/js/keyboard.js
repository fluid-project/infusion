/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};

(function ($, fluid) {
    
    //=====================================================================
    // Utility functions
    //

    /**
     * Assign any relevant ARIA roles, states, properties to the image viewer.
     */
    var setARIA = function (container, thumbContainer, image) {
        container.attr("role", "application");
        thumbContainer.attr("role", "listbox");
        $(demo.imageViewer.selectors.thumbSelector, thumbContainer).attr({
            "role": "listitem",
            "aria-controls": "image-preview",
            "aria-selected": false
        });
    };

    var displayImage = function (thumb, thumbContainer, image) {
        // Remove the 'selected' styling from the thumbnails.
        var images = $(demo.imageViewer.selectors.thumbSelector, thumbContainer);
        images.attr("aria-selected", false);

        // Display the selected image in the main viewer.
        var src = thumb.attr("src");
        image.attr("src", src);
        image.attr("alt", thumb.attr("alt"));
        
        // update the current selection
        thumb.parent().attr("aria-selected", true);

    };

    /**
     * Create a function that will be uses as the event handler when a thumbnail is activated
     */
    var makeImageActivationHandler = function (thumbContainer, image, fiveStarRanker, model) {
        return function (evt) {
            var thumb = $(evt.target);
            displayImage(thumb, thumbContainer, image);
            // update the five-star with the image's rank
            fiveStarRanker.setRank(model[thumb.attr("src")]);
        };
    };

    var bindEventHandlers = function (fiveStarRanker, model) {
        fiveStarRanker.events.modelChanged.addListener(function (newModel, oldModel) {
            // change the rank of the current image to the new rank
            var currImg = $(demo.imageViewer.selectors.image).attr("src");
            model[currImg] = newModel;
        });
    };

    //=====================================================================
    // Main keyboard accessibility plugin functions
    //
    
    /**
     * Ensure that the image thumbnails can be navigated using the keyboard
     */
    var makeThumbnailsNavigable = function (thumbContainer) {
        //*** Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
        thumbContainer.fluid("tabbable");

        //*** Use the Keyboard Accessibility Plugin to make the image thumbnails selectable
        // This uses the defaults for almost everything but the event handlers
        thumbContainer.fluid("selectable", {
            // the default orientation is vertical, so we need to specify that this is horizontal.
            // this affects what arrow keys will move selection
            direction: fluid.a11y.orientation.HORIZONTAL,
        
            onSelect: function (thumbEl) {
                $(thumbEl).addClass(demo.imageViewer.styles.selected);
            },
            onUnselect: function (thumbEl) {
                $(thumbEl).removeClass(demo.imageViewer.styles.selected);
            }
        });
    };

    /**
     * Ensure that the image thumbnails can be activated using the keyboard
     */
    var makeThumbnailsActivatable = function (thumbContainer, image, fiveStarRanker, model) {
        // create the event handler
        var handler = makeImageActivationHandler(thumbContainer, image, fiveStarRanker, model);

        //*** Use the Keyboard Accessibility Plugin to make the thumbnails activatable by keyboard
        thumbContainer.fluid("activatable", handler);

        // add the same handler to the click event of the thumbs
        $(demo.imageViewer.selectors.thumbSelector, thumbContainer).click(handler);
    };

    /**
     * Ensure that the five-star ranking widget can be navigated using the keyboard
     */
    var makeFiveStarsNavigable = function (fiveStarRanker) {
        var starContainer = fiveStarRanker.container;

        //*** Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
        starContainer.fluid("tabbable");

        //*** Use the Keyboard Accessibility Plugin to make the start themselves selectable
        // This overrides some of the defaults
        starContainer.fluid("selectable", {
            // the default orientation is vertical, so we need to specify that this is horizontal.
            // this affects what arrow keys will move selection
            direction: fluid.a11y.orientation.HORIZONTAL,

            // because the stars don't have the default "selectable" class, we must
            // specify what is to be selectable:
            selectableSelector: fiveStarRanker.options.selectors.stars,

            // because the same widget is used for images with different ranks, we don't want
            // the previously selected rank to be re-used
            rememberSelectionState: false,

            onSelect: function (starEl) {
                // show visual confirmation when focus is there
                starContainer.addClass(demo.imageViewer.styles.selected);
                fiveStarRanker.hoverStars(starEl);
            },
            onUnselect: function (thumbEl) {
                starContainer.removeClass(demo.imageViewer.styles.selected);
                fiveStarRanker.refreshView();
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

    //=====================================================================
    // Setup functions
    //
    
    var setUpModel = function (thumbContainer) {
        var thumbnails = $(demo.imageViewer.selectors.thumbImgSelector, thumbContainer);
        var model = {};
        fluid.each(thumbnails, function (value, key) {
            model[$(value).attr("src")] = 1;
        });
        return model;
    };

    var setUpFiveStarRanker = function (container) {
        // the five-star ranking code can be found in the file five-star.js
        var ranker = demo.fiveStar(container);

        // the five-star widget provides mouse-support, but not keyboard
        // add keyboard support using the plugin
        makeFiveStarsNavigable(ranker);
        makeFiveStarsActivatable(ranker);

        return ranker;        
    };

    var setUpImageViewer = function (that, ranker) {
        makeThumbnailsNavigable(that.thumbContainer);
        makeThumbnailsActivatable(that.thumbContainer, that.image, ranker, that.model);

        bindEventHandlers(ranker, that.model);
        setARIA(that.container, that.thumbContainer, that.image);

        // set up with the first image
        var firstThumb = $("img:first", that.thumbContainer);
        displayImage(firstThumb, that.thumbContainer, that.image);
        // update the five-star with the image's rank
        ranker.setRank(that.model[firstThumb.attr("src")]);
    };

    //=====================================================================
    // Demo initialization
    //

    demo.initImageViewer = function (container) {
        var that = {
            container: $(container),
            thumbContainer: $(demo.imageViewer.selectors.thumbContainer),
            image: $(demo.imageViewer.selectors.image)
        };

        that.model = setUpModel(that.thumbContainer);

        var fiveStarRanker = setUpFiveStarRanker(demo.imageViewer.selectors.ranker);
        
        setUpImageViewer(that, fiveStarRanker);
    };
    
    
    /**
     * Defaults for the demo
     */
    demo.imageViewer = {
        selectors: {
            thumbContainer: ".demo-container-imageThumbnails",
            ranker: ".demo-fiveStar",
            image: ".demo-image-mainImage",
            thumbSelector: ".selectable",
            thumbImgSelector: "img"
        },
        styles: {
            selected: "demo-selected"
        }
    };
})(jQuery, fluid);