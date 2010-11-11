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

    // This assumes the className is of the form "star-x" where x is the starNum
    var getStarNumFromClass = function (className) {
        return parseInt(className.charAt(className.length - 1));
    };

    var makeStarHandler = function (func, action) {
        return function (evt) {
            func(evt.target, action);
        };
    };

    var bindHandlers = function (that) {
        that.locate("stars").mouseover(makeStarHandler(that.highlightStar, "hover"));
        that.locate(that.container).mouseout(that.restoreStars);
        that.locate("stars").click(makeStarHandler(that.highlightStar, "select"));
    };

    /**
     * A very simple five-star ranking widget that allows users to click on a star to set a rank.
     * @param {Object} container
     * @param {Object} options
     */
    demo.fiveStar = function (container, options) {
        var that = fluid.initView("demo.fiveStar", container, options);
        that.model = that.options.model;
        that.stars = that.locate("stars");

        /**
         * Highlights all of the stars up to the specified star; ensures that the rest are 'clear.'
         * If the highlight is "select", the model will be updated to reflect the selection
         * @param {Object} starEl    The highest star element to highlight
         * @param {Object} highlight A string indicating the desired highlight: "hover" or "select". "hover" is the default
         */
        that.highlightStar = function (starEl, highlight) {
            var img = that.options.starImages[highlight];
            var star = $(starEl);
            var starNum = getStarNumFromClass(star.attr("class").match("star-[1-5]")[0]);
            if (highlight === "select") {
                var oldRank = that.model.rank;
                that.model.rank = starNum;
                that.events.modelChanged.fire(that.model.rank, oldRank);
            }
            var stars = $("[class^='star-']", container);
            for (var i = 0; i < starNum; i++) {
                $(stars[i]).attr("src", img);
            }
            for (; i < 5; i++) {
                $(stars[i]).attr("src", (i + 1 <= that.model.rank) ? that.options.starImages.select : that.options.starImages.blank);
            }
        };
        
        /**
         * Restore the display of stars to reflect the ranking
         */
        that.restoreStars = function () {
            var stars = $("[class^='star-']", container);
            for (var starNum = 1; starNum <= 5; starNum++) {
                $(stars[starNum-1]).attr("src", (starNum <= that.model.rank) ? that.options.starImages.select : that.options.starImages.blank);
            }
        };
        
        that.setRank = function (rank) {
            that.model.rank = rank;
            that.restoreStars();
        };

        bindHandlers(that);
        that.restoreStars();
        return that;
    };
    
    fluid.defaults("demo.fiveStar", {
        selectors: {
            stars: "[class^='star-']"
        },
        starImages: {
            blank: "../images/star-blank.gif",
            hover: "../images/star-orange.gif",
            select: "../images/star-green.gif"
        },
        model: {
            rank: 1
        },
        events: {
            modelChanged: null
        }
    });
})(jQuery, fluid_1_2);
