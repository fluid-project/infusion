/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("demo.imageViewer");

    //=====================================================================
    // Utility functions
    //

    demo.imageViewer.displayImage = function (image, thumbID) {
        // Display the selected image in the main viewer.
        var thumb = $("#" + thumbID);
        image.attr({
            src: thumb.attr("src"),
            alt: thumb.attr("alt")
        });
    };

    demo.imageViewer.updateSelection = function (thumbID, thumbnails) {
        thumbnails.attr("aria-selected", false);
        $("#" + thumbID).attr("aria-selected", true);
    };


    //=====================================================================
    // Main keyboard accessibility plugin functions
    //

    /*
     * Ensure that the image thumbnails can be navigated using the keyboard
     */
    demo.imageViewer.makeThumbnailsNavigable = function (thumbContainer, selectedStyle) {
        //*** Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
        thumbContainer.fluid("tabbable");

        //*** Use the Keyboard Accessibility Plugin to make the image thumbnails selectable
        // This uses the defaults for almost everything but the event handlers
        thumbContainer.fluid("selectable", {
            // the default orientation is vertical, so we need to specify that this is horizontal.
            // this affects what arrow keys will move selection
            direction: fluid.a11y.orientation.HORIZONTAL,

            onSelect: function (thumbEl) {
                $(thumbEl).addClass(selectedStyle);
            },
            onUnselect: function (thumbEl) {
                $(thumbEl).removeClass(selectedStyle);
            }
        });
    };

    /*
     * Ensure that the image thumbnails can be activated using the keyboard
     */
    demo.imageViewer.makeThumbnailsActivatable = function (thumbContainer, thumbnails, selectFn) {
        // create the event handler
        var handler = function (event) {
            var id = event.target.id;
            selectFn(id);
        };

        //*** Use the Keyboard Accessibility Plugin to make the thumbnails activatable by keyboard
        thumbContainer.fluid("activatable", handler);

        // add the same handler to the click event of the thumbs
        thumbnails.click(handler);
    };

    demo.fiveStar.getRank = function (model) {
        return model.imageViewer.imageRanks[model.imageViewer.selected];
    };

    demo.fiveStar.setRank = function (model) {
        var imageRanks = model.imageViewer.imageRanks;
        fluid.set(imageRanks, model.imageViewer.selected, model.rank);
        return imageRanks;
    };

    //=====================================================================
    // Setup functions
    //

    demo.imageViewer.setUpModel = function (thumbImages) {
        var model = {
            selected: "",
            imageRanks: {}
        };
        fluid.each(thumbImages, function (img, idx) {
            var id = fluid.allocateSimpleId(img);
            model.imageRanks[id] = 1;

            // On setup set the selection on the first element.
            if (!idx) {
                model.selected = id;
            }
        });
        return model;
    };

    //=====================================================================
    // Demo initialization

    fluid.defaults("demo.imageViewer", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            thumbContainer: ".demo-container-imageThumbnails",
            ranker: ".demo-fiveStar",
            image: ".demo-image-mainImage",
            thumbSelector: ".demo-image-thumbImg",
            thumbImgSelector: ".demo-image-thumbImg"
        },
        styles: {
            selected: "demo-selected"
        },
        events: {
            onSelect: null
        },
        model: {
            expander: {
                funcName: "demo.imageViewer.setUpModel",
                args: ["{that}.dom.thumbImgSelector"]
            }
        },
        modelListeners: {
            "selected": [{
                listener: "{that}.updateSelection",
                args: ["{change}.value"]
            }, {
                listener: "{that}.displayImage",
                args: ["{change}.value"]
            }]
        },
        components: {
            ranker: {
                type: "demo.fiveStar",
                container: "{that}.dom.ranker",
                options: {
                    modelRelay: [{
                        target: "rank",
                        singleTransform: {
                            type: "fluid.transforms.free",
                            args: {
                                imageViewer: "{imageViewer}.model"
                            },
                            func: "demo.fiveStar.getRank"
                        }
                    }, {
                        target: "{imageViewer}.model.imageRanks",
                        singleTransform: {
                            type: "fluid.transforms.free",
                            args: {
                                rank: "{that}.model.rank",
                                imageViewer: "{imageViewer}.model"
                            },
                            func: "demo.fiveStar.setRank"
                        }
                    }]
                }
            }
        },
        listeners: {
            "onCreate.containerAria": {
                "this": "{that}.container",
                "method": "attr",
                "args": [{"role": "application"}]
            },
            "onCreate.thumbContainerAria": {
                "this": "{that}.dom.thumbContainer",
                "method": "attr",
                "args": [{"role": "listbox"}]
            },
            "onCreate.thumSelectorAria": {
                "this": "{that}.dom.thumbSelector",
                "method": "attr",
                "args": [{
                    "role": "option",
                    "aria-controls": "image-preview",
                    "aria-selected": false
                }]
            },
            "onCreate.makeThumbnailsNavigable": {
                listener: "demo.imageViewer.makeThumbnailsNavigable",
                args: ["{that}.dom.thumbContainer", "{that}.options.styles.selected"]
            },
            "onCreate.makeThumbnailsActivatable": {
                listener: "demo.imageViewer.makeThumbnailsActivatable",
                args: ["{that}.dom.thumbContainer", "{that}.dom.thumbImgSelector", "{that}.events.onSelect.fire"]
            },
            "onSelect.triggerSelect": "{that}.select"
        },
        invokers: {
            displayImage: {
                funcName: "demo.imageViewer.displayImage",
                args: ["{that}.dom.image", "{arguments}.0"]
            },
            updateSelection: {
                funcName: "demo.imageViewer.updateSelection",
                args: ["{arguments}.0", "{that}.dom.thumbSelector"]
            },
            select: {
                changePath: "selected",
                value: "{arguments}.0"
            }
        }
    });

})(jQuery, fluid);
