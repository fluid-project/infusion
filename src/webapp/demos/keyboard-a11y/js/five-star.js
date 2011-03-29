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

    // This assumes the className is of the form "star-x" where x is the starNum
    var getStarNum = function (el) {
        var className = $(el).attr("class").match("star-[1-5]")[0];
        return parseInt(className.charAt(className.length - 1), 10);
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

    /**
     * Apply appropriate ARIA role and attributes
     */
    var setARIA = function (that) {
        that.container.attr("role", "radiogroup");
        that.locate("stars").attr({
            "role": "radio",
            "aria-checked": false
        });
    };
    
    /**
     * When the selected rank changes, update the ARIA to reflect the new value
     */
    var updateARIA = function (that, rank) {
        var stars = that.locate("stars");
        stars.attr("aria-checked", false);
        $(stars[rank - 1]).attr("aria-checked", true);
    };

    /**
     * Set the colour of the stars depending on the current rank and hover
     */
    var setStarStates = function (stars, hovered, rank, imgs) {
        // if nothing is hovered, don't show any hover state
        if (hovered > 0) {
            stars.slice(0, hovered).attr("src", imgs.hover);
        } else {
            hovered = -1;
        }
        stars.slice(hovered + 1, rank).attr("src", imgs.select);
        stars.slice(Math.max(hovered, rank), 5).attr("src", imgs.blank);
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
            setStarStates(that.stars, starNum, that.model.rank, that.options.starImages);
        };

        /**
         * Restore the display of stars to reflect the ranking
         */
        that.refreshView = function () {
            setStarStates(that.stars, 0, that.model.rank, that.options.starImages);
        };
        
        that.setRank = function (rank) {
            var oldRank = that.model.rank;
            that.model.rank = rank;
            updateARIA(that, rank);
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
})(jQuery, fluid);
