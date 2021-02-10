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

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("demo.fiveStar");

    //=====================================================================
    // Utility functions
    //

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
        };
    };
    /*
     * Apply appropriate ARIA role and attributes
     */
    demo.fiveStar.setARIA = function (container, stars) {
        container.attr("role", "radiogroup");
        stars.attr({
            "role": "radio",
            "aria-checked": false
        });
    };

    /*
     * When the selected rank changes, update the ARIA to reflect the new value
     */
    demo.fiveStar.updateARIA = function (stars, rank) {
        stars.attr("aria-checked", false);
        $(stars[rank - 1]).attr("aria-checked", true);
    };

    /*
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

    //=====================================================================
    // Initialization

    /*
     * A very simple five-star ranking widget that allows users to click on a star to set a rank.
     */

    fluid.defaults("demo.fiveStar", {
        gradeNames: ["fluid.viewComponent"],
        members: {
            stars: "{that}.dom.stars"
        },
        listeners: {
            onCreate: [{
                "this": "{that}.stars",
                method: "on",
                args: [
                    "mouseover",
                    {
                        expander: {
                            funcName: "demo.fiveStar.makeStarHandler",
                            args: ["{that}", "{that}.hoverStars"]
                        }
                    }
                ]
            }, {
                "this": "{that}.container",
                method: "on",
                args: ["mouseout", "{that}.refreshView"]
            }, {
                "this": "{that}.stars",
                method: "on",
                args: ["click", {
                    expander: {
                        funcName: "demo.fiveStar.makeStarHandler",
                        args: ["{that}", "{that}.setRank"]
                    }
                }]
            }, {
                funcName: "demo.fiveStar.setARIA",
                args: ["{that}.container", "{that}.stars"]
            }],
            // Use the Keyboard Accessibility Plugin to ensure that the container is in the tab order
            "onCreate.makeTabbable": {
                listener: "fluid.tabbable",
                args: ["{that}.container"]
            },
            // Use the Keyboard Accessibility Plugin to make the stars themselves selectable
            "onCreate.makeSelectable": {
                listener: "fluid.selectable",
                args: ["{that}.container", "{that}.options.selectable"]
            },
            // Use the Keyboard Accessibility Plugin to make the stars themselves activatable with the keyboard
            "onCreate.makeFiveStarsActivatable": {
                listener: "fluid.activatable",
                args: ["{that}.stars", {
                    expander: {
                        funcName: "demo.fiveStar.makeStarHandler",
                        args: ["{that}", "{that}.setRank"]
                    }
                }]
            }
        },
        modelListeners: {
            "rank": [{
                funcName: "demo.fiveStar.updateARIA",
                args: ["{that}.stars", "{change}.value"]
            }, "{that}.refreshView"],
            "containerSelected": {
                "this": "{that}.container",
                "method": "toggleClass",
                "args": ["{that}.options.styles.selected", "{change}.value"]
            }
        },
        invokers: {
            setRank: {
                changePath: "rank",
                value: "{arguments}.0"
            },
            renderStarState: {
                funcName: "demo.fiveStar.renderStarState",
                args: ["{that}.stars", "{arguments}.0", "{that}.model.rank", "{that}.options.starImages"]
            },
            // Highlight the stars up to the given star with the hover colour
            hoverStars: {
                func: "{that}.renderStarState"
            },
            // Restore the display of stars to reflect the ranking
            refreshView: {
                func: "{that}.renderStarState",
                args: 0
            },
            select: {
                changePath: "containerSelected",
                value: true
            },
            unselect: {
                changePath: "containerSelected",
                value: false
            }
        },
        selectors: {
            stars: "[class^='star-']"
        },
        styles: {
            selected: "demo-selected"
        },
        starImages: {
            blank: "images/star-blank.gif",
            hover: "images/star-orange.gif",
            select: "images/star-green.gif"
        },
        model: {
            containerSelected: false,
            rank: 1
        },
        selectable: {
            // the default orientation is vertical, so we need to specify that this is horizontal.
            // this affects what arrow keys will move selection
            direction: fluid.a11y.orientation.HORIZONTAL,

            // because the stars don't have the default "selectable" class, we must
            // specify what is to be selectable:
            selectableSelector: "{that}.options.selectors.stars",

            // because the same widget is used for images with different ranks, we don't want
            // the previously selected rank to be re-used
            rememberSelectionState: false,

            onSelect: "{that}.select",
            onUnselect: "{that}.unselect"
        }
    });
})(jQuery, fluid);
