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
    var getStarNum = function (el) {
        var className = $(el).attr("class").match("star-[1-5]")[0];
        return parseInt(className.charAt(className.length - 1));
    };

    var bindHandlers = function (that) {
        that.locate("stars").mouseover(function (evt) {
            that.hoverStars(evt.target);
        });
        that.locate(that.container).mouseout(that.refreshView);
        that.locate("stars").click(function (evt) {
            that.pickStar(evt.target);
        });
    };

    var setARIA = function (that) {
        that.container.attr("role", "slider");
        that.container.attr("aria-valuemin", "1");
        that.container.attr("aria-valuemax", "5");
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
         * Highlight the stars up to the given star with the hover colour
         * @param {Object} starEl
         */
        that.hoverStars = function (starEl) {
            var star = $(starEl);
            var starNum = getStarNum(star);
            
            // set the images up to the hover star with the hover image
            for (var i = 0; i < starNum; i++) {
                $(that.stars[i]).attr("src", that.options.starImages.hover);
            }
            // set the images for the rest of the stars with whatever the rank says
            for (; i < 5; i++) {
                $(that.stars[i]).attr("src", (i + 1 <= that.model.rank) ? that.options.starImages.select : that.options.starImages.blank);
            }
        };

        /**
         * Restore the display of stars to reflect the ranking
         */
        that.refreshView = function () {
            var stars = $("[class^='star-']", container);
            for (var starNum = 1; starNum <= 5; starNum++) {
                $(stars[starNum - 1]).attr("src", (starNum <= that.model.rank) ? that.options.starImages.select : that.options.starImages.blank);
            }
        };
        
        that.setRank = function (rank) {
            var oldRank = that.model.rank;
            that.model.rank = rank;
            that.container.attr("aria-valuenow", rank);
            that.events.modelChanged.fire(that.model.rank, oldRank);
            that.refreshView();
        };
        
        that.pickStar = function (el) {
            var starNum = getStarNum(el);
            that.setRank(starNum);
        };

        bindHandlers(that);
        setARIA(that);
        that.refreshView();
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
