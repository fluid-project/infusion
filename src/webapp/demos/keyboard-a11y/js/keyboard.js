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
    
    var makeRaterNavigable = function () {
        $(demo.initImageRater.selectors.rater).fluid("tabbable");
        $(demo.initImageRater.selectors.rater).fluid("selectable", {
            direction: fluid.a11y.orientation.HORIZONTAL,
            onSelect: function (star) {
                console.log("star selected: " + star);
            }
        });
    };

    var makeThumbnailsNavigable = function () {
        var thumbs = $(demo.initImageRater.selectors.thumbnails);
        thumbs.fluid("tabbable");
        thumbs.fluid("selectable", {
            direction: fluid.a11y.orientation.HORIZONTAL,
            onSelect: function (thumbEl) {
                var src = $("img", thumbEl).attr("src");
                $(demo.initImageRater.selectors.image).attr("src", src);
            }
        });
    };

    demo.initImageRater = function () {
        makeThumbnailsNavigable();
//        makeRaterNavigable();
    };
    
    demo.initImageRater.selectors = {
        thumbnails: ".demo-container-imageThumbnails",
        rater: ".demo-container-fiveStar",
        image: ".demo-image-mainImage"
    };
})(jQuery, fluid);