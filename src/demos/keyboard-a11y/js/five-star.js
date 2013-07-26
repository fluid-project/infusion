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
    fluid.registerNamespace("demo.fiveStar");

    // This assumes the className is of the form "star-x" where x is the starNum
    demo.fiveStar.getStarNum = function (el) {
        var className = $(el).attr("class").match("star-[1-5]")[0];
        return parseInt(className.charAt(className.length - 1), 10);
    };
    
    // Given a function accepting a number, return a function accepting a DOM event targetted at the star with that number
    demo.fiveStar.makeStarHandler = function (that, handler) {
        return function (evt) {
            var number = demo.fiveStar.getStarNum(evt.target);
            handler(number);
        }
    };
    /**
     * Apply appropriate ARIA role and attributes
     */
    demo.fiveStar.setARIA = function (that) {
        that.container.attr("role", "radiogroup");
        that.locate("stars").attr({
            "role": "radio",
            "aria-checked": false
        });
    };
    
    /**
     * When the selected rank changes, update the ARIA to reflect the new value
     */
    demo.fiveStar.updateARIA = function (stars, rank) {
        stars.attr("aria-checked", false);
        $(stars[rank - 1]).attr("aria-checked", true);
    };

    /**
     * Set the colour of the stars depending on the current rank and hover
     */
    demo.fiveStar.renderStarState = function (stars, hovered, rank, imgs) {
        // if nothing is hovered, don't show any hover state
        if (hovered > 0) {
            stars.slice(0, hovered).attr("src", imgs.hover);
        } else {
            hovered = -1;
        }
        stars.slice(hovered + 1, rank).attr("src", imgs.select);
        stars.slice(Math.max(hovered, rank), 5).attr("src", imgs.blank);
    };
    
    demo.fiveStar.bindChangeListener = function (that) {
        // TODO: This will be simplified once FLUID-4258 is implemented 
        that.applier.modelChanged.addListener("rank", function (newModel) {
            demo.fiveStar.updateARIA(that.stars, newModel.rank);
            that.refreshView();
        });
    };

    /**
     * A very simple five-star ranking widget that allows users to click on a star to set a rank.
     */
     
    fluid.defaults("demo.fiveStar", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        members: {
            stars: "{that}.dom.stars"  
        },
        listeners: {
            onCreate: [{
                "this": "{that}.stars",
                method: "mouseover",
                args: {
                    expander: {
                        funcName: "demo.fiveStar.makeStarHandler",
                        args: ["{that}", "{that}.hoverStars"]
                    }
                }  
            }, {
                "this": "{that}.container",
                method: "mouseout",
                args: "{that}.refreshView"
            }, {
                "this": "{that}.stars",
                method: "click",
                args: {
                    expander: {
                        funcName: "demo.fiveStar.makeStarHandler",
                        args: ["{that}", "{that}.setRank"]
                    }
                }  
            }, {
                funcName: "demo.fiveStar.setARIA",
                args: "{that}"
            }, {
                funcName: "demo.fiveStar.bindChangeListener",
                args: "{that}"
            }]
        },
        invokers: {
            setRank: {
               func: "{that}.applier.requestChange",
               args: ["rank", "{arguments}.0"]
            },
            renderStarState: {
                funcName: "demo.fiveStar.renderStarState",
                args: ["{that}.stars", "{arguments}.0", "{that}.model.rank", "{that}.options.starImages"]  
            },
           /**
            * Highlight the stars up to the given star with the hover colour
            * @param {Number} star number
            */
            hoverStars: {
                func: "{that}.renderStarState"
            },
           /**
            * Restore the display of stars to reflect the ranking
            */
            refreshView: {
                func: "{that}.renderStarState",
                args: 0
            }
        },
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
        }
    });
})(jQuery, fluid);
