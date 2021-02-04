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

(function () {
    "use strict";

    /**
     * This file contains test constants and setup and teardown functions that are used when testing with the data in the ImageReordererTests.html file.
     * TODO: Rework this file and testing strategy uses composition of options for configuration rather than multiple drivers.
     */
    fluid.registerNamespace("fluid.testUtils.imageReorderer");

    fluid.testUtils.imageReorderer.numOfImages = 14;

    // The id of the root node of the lightbox
    fluid.testUtils.imageReorderer.imageReordererRootId = "gallery:::gallery-thumbs:::";

    var orderableIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    var makeOrderableIds = function (indices) {
        return fluid.transform(indices,
            function (index) {
                return "gallery:::gallery-thumbs:::lightbox-cell:" + index + ":";
            });
    };

    var makeImageIds = function (indices) {
        return fluid.transform(indices,
            function (index) {
                return "fluid.img." + index;
            });
    };

    fluid.testUtils.imageReorderer.orderableIds = makeOrderableIds(orderableIndices);

    fluid.testUtils.imageReorderer.imageIds = makeImageIds(orderableIndices);

    // CSS class names
    fluid.testUtils.imageReorderer.defaultClass = "fl-reorderer-movable-default";
    fluid.testUtils.imageReorderer.selectedClass = "fl-reorderer-movable-selected";
    fluid.testUtils.imageReorderer.draggingClass = "fl-reorderer-movable-dragging";

    fluid.testUtils.imageReorderer.fetchLightboxRoot = function () {
        return fluid.jById(fluid.testUtils.imageReorderer.imageReordererRootId);
    };

    fluid.testUtils.imageReorderer.focusLightbox = async function () {
        var root = fluid.testUtils.imageReorderer.fetchLightboxRoot();
        return fluid.focus(root);
    };

    function findOrderableByDivAndId() {
        return fluid.jById(fluid.testUtils.imageReorderer.imageReordererRootId).children();
    }


    function findNoOrderables() {
        return [];
    }

    fluid.testUtils.imageReorderer.createImageReorderer = function (options) {
        var reorderer;
        var listenerConfig = { // afterMove listener to test FLUID-4391
            listeners: {
                afterMove: function () {
                    reorderer.moveCount++;
                }
            }
        };
        // TODO: produce a mergePolicy that can do this non-destructively
        var mergedOptions = fluid.merge(null, {}, listenerConfig, options);
        reorderer = fluid.reorderImages(fluid.testUtils.imageReorderer.fetchLightboxRoot(), mergedOptions);
        reorderer.moveCount = 0;
        return reorderer;
    };

    fluid.testUtils.imageReorderer.createImageReordererWithNoOrderables = function () {
        return fluid.testUtils.imageReorderer.createImageReorderer({
            selectors: {
                movables: findNoOrderables
            }
        });
    };

    var altKeys = {
        modifier: function (evt) {
            return (evt.ctrlKey && evt.shiftKey);
        },
        up: fluid.reorderer.keys.i,
        down: fluid.reorderer.keys.m,
        right: fluid.reorderer.keys.k,
        left: fluid.reorderer.keys.j
    };

    fluid.testUtils.imageReorderer.createAltKeystrokeImageReorderer = function () {
        return fluid.testUtils.imageReorderer.createImageReorderer({
            keysets: [altKeys],
            selectors: {
                movables: findOrderableByDivAndId
            }
        });
    };

    fluid.testUtils.imageReorderer.createMultiKeystrokeImageReorderer = function () {
        var altKeys2 = {
            modifier: function (evt) {
                return evt.altKey;
            },
            up: fluid.reorderer.keys.UP,
            down: fluid.reorderer.keys.DOWN,
            right: fluid.reorderer.keys.RIGHT,
            left: fluid.reorderer.keys.LEFT
        };

        return fluid.testUtils.imageReorderer.createImageReorderer({
            keysets: [altKeys, altKeys2],
            selectors: {
                movables: findOrderableByDivAndId
            }
        });
    };

    fluid.testUtils.imageReorderer.createMultiOverlappingKeystrokeImageReorderer = function () {
        var altKeys2 = {
            modifier: function (evt) {
                return evt.ctrlKey;
            },
            up: fluid.reorderer.keys.UP,
            down: fluid.reorderer.keys.DOWN,
            right: fluid.reorderer.keys.RIGHT,
            left: fluid.reorderer.keys.LEFT
        };

        return fluid.testUtils.imageReorderer.createImageReorderer({
            keysets: [altKeys, altKeys2],
            selectors: {
                movables: findOrderableByDivAndId
            }
        });
    };
})();
