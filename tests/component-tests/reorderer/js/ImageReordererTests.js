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

/* global jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        jqUnit.module("Image Reorderer Tests");

        function findImagesInLightbox() {
            return $("img", fluid.testUtils.imageReorderer.fetchLightboxRoot());
        }

        function assertItemsInOriginalPosition(desc) {
            return fluid.testUtils.reorderer.assertItemsInOriginalPosition(desc,
                findImagesInLightbox(), fluid.testUtils.imageReorderer.imageIds);
        }

        function assertItemsInOrder(message, assertItemsInOrder2) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, assertItemsInOrder2,
                findImagesInLightbox(), "fluid.img.");
        }

        function assertItemDefault(message, index) {
            return fluid.testUtils.reorderer.assertItemDefault(message, index, fluid.testUtils.imageReorderer.orderableIds);
        }

        function assertItemFocused(message, index) {
            return fluid.testUtils.reorderer.assertItemFocused(message, index, fluid.testUtils.imageReorderer.orderableIds);
        }

        function assertItemDragged(message, index) {
            return fluid.testUtils.reorderer.assertItemDragged(message, index, fluid.testUtils.imageReorderer.orderableIds);
        }

        function compositeKey(reorderer, event, targetIndex, keepModifierPressed) {
            return fluid.testUtils.reorderer.compositeKey(reorderer, event,
                fluid.byId(fluid.testUtils.imageReorderer.orderableIds[targetIndex]), keepModifierPressed);
        }

        function keyDown(reorderer, event, targetIndex) {
            return fluid.testUtils.reorderer.keyDown(reorderer, event,
                fluid.byId(fluid.testUtils.imageReorderer.orderableIds[targetIndex]));
        }

        function keyUp(reorderer, event, targetIndex) {
            return fluid.testUtils.reorderer.keyUp(reorderer, event,
                fluid.byId(fluid.testUtils.imageReorderer.orderableIds[targetIndex]));
        }

        function verticalNavigationTest(lightbox, upEvt, downEvt) {
            // setup: force the grid to have four columns
            var lightboxRoot = fluid.jById(fluid.testUtils.imageReorderer.imageReordererRootId);

            lightboxRoot.removeClass("width-3-thumb");
            lightboxRoot.addClass("width-4-thumb");

            fluid.testUtils.imageReorderer.focusLightbox();

            assertItemFocused("Initially ", 0);

            // Test: down arrow to the fifth image
            keyDown(lightbox, downEvt, 0);
            assertItemDefault("After down arrow ", 0);
            assertItemFocused("After down arrow ", 4);

            // Test: up arrow to the first image
            keyDown(lightbox, upEvt, 4);
            assertItemFocused("After up arrow ", 0);
            assertItemDefault("After up arrow ", 4);

            // Test: up arrow to the second last image
            keyDown(lightbox, upEvt, 0);
            assertItemDefault("After up arrow wrap ", 0);
            assertItemFocused("After up arrow wrap ", 12);

            // Test: down arrow to the first image
            keyDown(lightbox, downEvt, 12);
            assertItemFocused("After down arrow wrap ", 0);
            assertItemDefault("After down arrow wrap ", 12);

            // Tests for FLUID-1589
            fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[2]));
            keyDown(lightbox, upEvt, 2);
            assertItemFocused("After up arrow wrap irregular ", 10);
            assertItemDefault("After up arrow wrap irregular ", 2);

            keyDown(lightbox, downEvt, 10);
            assertItemFocused("After up arrow wrap irregular ", 2);
            assertItemDefault("After up arrow wrap irregular ", 10);
        }

        function horizontalNavigationTest(lightbox, rightEvt, leftEvt) {
            fluid.testUtils.imageReorderer.focusLightbox();

            assertItemFocused("Initially ", 0);
            assertItemDefault("Initially ", 1);

            fluid.focus(fluid.byId(fluid.testUtils.imageReorderer.orderableIds[0]));

            // Test: right arrow to the second image
            keyDown(lightbox, rightEvt, 0);
            assertItemFocused("After right ", 1);
            assertItemDefault("After right ", 0);

            // Test: right arrow to the last image
            for (var focusPosition = 2; focusPosition < fluid.testUtils.imageReorderer.numOfImages; focusPosition++) {
                keyDown(lightbox, rightEvt, focusPosition - 1);
            }
            assertItemFocused("Right to last ", 13);
            assertItemDefault("Right to last ", 0);
            assertItemDefault("Right to last ", 1);

            // Test: left arrow to the previous image
            keyDown(lightbox, leftEvt, 13);
            assertItemFocused("Left to second last ", 12);
            assertItemDefault("Left to second last ", 0);
            assertItemDefault("Left to second last ", 1);

            // Test: right arrow past the last image - expect wrap to the first image
            keyDown(lightbox, rightEvt, 12);
            keyDown(lightbox, rightEvt, 13);
            assertItemFocused("Right wrap ", 0);
            assertItemDefault("Right wrap ", 1);
            assertItemDefault("Right wrap ", 13);

            // Test: left arrow on the first image - expect wrap to the last image
            keyDown(lightbox, leftEvt, 0);
            assertItemFocused("Left wrap ", 13);
            assertItemDefault("Left wrap ", 0);
            assertItemDefault("Left wrap ", 1);
        }

        function verticalMovementTest(lightbox, modifiedUpEvt, modifiedDownEvt) {
            var initMoveCount = lightbox.moveCount;
            // Default width is 3 thumbnails.
            fluid.testUtils.imageReorderer.focusLightbox();
            compositeKey(lightbox, modifiedDownEvt, 0);
            assertItemsInOrder("after modified-down", [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

            compositeKey(lightbox, modifiedUpEvt, 0);
            assertItemsInOriginalPosition("after modified-up");
            jqUnit.assertEquals("Two calls to afterMove listener", initMoveCount + 2, lightbox.moveCount);
        }

        function horizontalMovementTest(lightbox, modifiedRightEvt, modifiedLeftEvt) {
            fluid.testUtils.imageReorderer.focusLightbox();

            // Test: ctrl right arrow - expect first and second image to swap
            compositeKey(lightbox, modifiedRightEvt, 0);
            assertItemsInOrder("after modified-right", [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

            // Test: ctrl left arrow - expect first and second image to swap back to original order
            compositeKey(lightbox, modifiedLeftEvt, 0);
            assertItemsInOriginalPosition("after modified-left");

            // Test: ctrl left arrow - expect first image to move to last place,
            //       second image to move to first place and last image to move to second-last place
            compositeKey(lightbox, modifiedLeftEvt, 0);
            assertItemsInOrder("after modified-right", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0]);

            // Test: ctrl right arrow - expect first image to move back to first place,
            //       second image to move to back second place and thumbLast to move to back last place
            compositeKey(lightbox, modifiedRightEvt, 0);
            assertItemsInOriginalPosition("after modified-right");
        }

        // returns the number of elements from a jquery object that have the specified className
        var numItemsWithClass = function (elms, className) {
            var count = 0;
            fluid.each(elms, function (elm) {
                if ($(elm).hasClass(className)) {
                    count++;
                }
            });
            return count;
        };

        var k = fluid.testUtils.reorderer;

        /*
         * This test tests the movement of images, and does not concern itself
         * with changes of state(i.e. dragging, etc.)
         */
        jqUnit.test("HandleArrowKeyDownMoveThumbDown", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();
            // Test: ctrl down arrow - move the first image down
            compositeKey(lightbox, k.ctrlKeyEvent("DOWN"), 0);
            assertItemsInOrder("after ctrl-down-arrow", [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        });

        jqUnit.test("HandleArrowKeyDownWrapThumbUp", function () {
            // Test: ctrl up arrow - move the first image 'up'
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            compositeKey(lightbox, k.ctrlKeyEvent("UP"), 0);
            assertItemsInOrder("after ctrl-up-arrow", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 13]);
        });

        jqUnit.test("HandleArrowKeyDownForUpAndDown", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            verticalNavigationTest(lightbox, k.keyEvent("UP"), k.keyEvent("DOWN"));
        });

        jqUnit.test("HandleArrowKeyDownForLeftAndRight", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();

            horizontalNavigationTest(lightbox, k.keyEvent("RIGHT"), k.keyEvent("LEFT"));
        });

        jqUnit.test("HandleKeyUpAndHandleKeyDownChangesState", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            // check that none of the images are currently being moved.
            assertItemFocused("Initially ", 0);
            assertItemDefault("Initially ", 1);
            assertItemDefault("Initially ", 12);

            // ctrl down - expect dragging state to start
            keyDown(lightbox, k.ctrlKeyEvent("CTRL"), 0);
            assertItemDragged("After ctrl-down, ", 0);
            assertItemDefault("After ctrl-down, ", 1);
            assertItemDefault("After ctrl-down, ", 12);
            jqUnit.assertEquals("After ctrl-down, " + fluid.testUtils.imageReorderer.orderableIds[1] + " should have ARIA dropeffect of 'move'", "move",
                fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]).attr("aria-dropeffect"));
            jqUnit.assertEquals("After ctrl-down, " + fluid.testUtils.imageReorderer.orderableIds[12] + " should have ARIA dropeffect of 'move'", "move",
                fluid.jById(fluid.testUtils.imageReorderer.orderableIds[12]).attr("aria-dropeffect"));

            // right arrow down - all the dragging states should remain the same
            //fluid.log("keyDown");
            keyDown(lightbox, k.ctrlKeyEvent("RIGHT"), 0);
            //fluid.log("keyDown complete: " + fluid.dumpEl(lightbox.activeItem));
            assertItemDragged("After ctrl-down right arrow down, ", 0);
            assertItemDefault("After ctrl-down right arrow down, ", 1);
            assertItemDefault("After ctrl-down right arrow down, ", 12);

            //fluid.log("keyUp 1");
            //fluid.log("before KeyUp: " + fluid.dumpEl(lightbox.activeItem));
            // right arrow with key-up event handler. The dragging states should remain the same.
            keyUp(lightbox, k.ctrlKeyEvent("RIGHT"), 0);
            assertItemDragged("After ctrl-down right arrow up, ", 0);
            assertItemDefault("After ctrl-down right arrow up, ", 1);
            assertItemDefault("After ctrl-down right arrow up, ", 12);

            // ctrl up - expect dragging to end
            //fluid.log("keyUp 2");
            keyUp(lightbox, k.keyEvent("CTRL"), 0);
            assertItemFocused("After ctrl-up ", 0);
            assertItemDefault("After ctrl-up ", 1);
            assertItemDefault("After ctrl-up ", 12);
            jqUnit.assertEquals("After ctrl-up, " + fluid.testUtils.imageReorderer.orderableIds[1] + " should have ARIA dropeffect of 'none'", "none",
                fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]).attr("aria-dropeffect"));
            jqUnit.assertEquals("After ctrl-up, " + fluid.testUtils.imageReorderer.orderableIds[12] + " should have ARIA dropeffect of 'none'", "none",
                fluid.jById(fluid.testUtils.imageReorderer.orderableIds[12]).attr("aria-dropeffect"));
        });

        jqUnit.test("HandleKeyUpAndHandleKeyDownItemMovement", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            // after ctrl down, order should not change
            keyDown(lightbox, k.keyEvent("CTRL"), 0);
            assertItemsInOriginalPosition("after ctrl-down");

            // after ctrl up, order should not change
            keyUp(lightbox, k.keyEvent("CTRL"), 0);
            assertItemsInOriginalPosition("after ctrl-up");
        });

        /*
         * This test tests the movement of images, and does not concern itself
         * with changes of state(i.e. dragging, etc.)
         */
        jqUnit.test("HandleArrowCtrlArrowKeyDown", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            horizontalMovementTest(lightbox, k.ctrlKeyEvent("RIGHT"), k.ctrlKeyEvent("LEFT"));
            verticalMovementTest(lightbox, k.ctrlKeyEvent("UP"), k.ctrlKeyEvent("DOWN"));
        });

        jqUnit.test("PersistFocus ", function () {
            var lbRoot = fluid.testUtils.imageReorderer.fetchLightboxRoot();
            fluid.testUtils.imageReorderer.createImageReorderer();
            // Create an input that we can move focus to during the test
            var newInputElement = $(document.createElement("input"));
            newInputElement.prop("id", "input1");

            $("[id=para1]").after(newInputElement);

            assertItemDefault("Initially ", 0);

            // Focus the lightbox and make sure the first thumb nail is selected
            fluid.focus(lbRoot);
            assertItemFocused("When lightbox has focus ", 0);
            assertItemDefault("When lightbox has focus ", 1);

            // Calling blur because simulated focus events do not trigger blur events synchronously
            fluid.blur(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]));

            // Change focus to the input1, then back to the lightbox
            fluid.focus(newInputElement);
            assertItemDefault("After focus leaves the lightbox ", 0);

            // Change focus to the lightbox and check that the first thumb nail is still movable.
            fluid.focus(lbRoot);
            assertItemFocused("When lightbox has focus again ", 0);
            assertItemDefault("When lightbox has focus again ", 1);

            fluid.blur(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]));

            // set focus to another image.
            fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]));
            assertItemFocused("Changed focus to second ", 1);
            assertItemDefault("Changed focus to second ", 0);

            // Change focus to the input1
            fluid.focus(newInputElement);
            fluid.blur(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]));

            assertItemDefault("Lightbox blur with second selected ", 1);

            // Focus the lightbox and check that the second thumb nail is still movable
            fluid.focus(lbRoot);
            assertItemFocused("Lightbox refocused with second selected ", 1);
            assertItemDefault("Lightbox refocused with second selected ", 0);
        });

        function testFocusBlur(initiator) {
            jqUnit.asyncTest("ItemFocusBlur: with " + initiator, function () {
                var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
                var selected = false;
                var selectListener = function () {
                    ++selected;
                };
                lightbox.events.onSelect.addListener(selectListener);
                var testItem = fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]);

                assertItemDefault("Before test item gets focus, it should be in default state", 0);
                testItem.focus(function () {
                    assertItemFocused("After test item gets focus, it should be in selected state", 0);
                    jqUnit.assertTrue("onSelect listener should be called ", selected);

                    fluid.blur(testItem);
                    assertItemDefault("After test item gets blur, it should be in default state", 0);
                    jqUnit.start();
                });
                testItem.triggerHandler(initiator);
            });
        }

        testFocusBlur("click");
        testFocusBlur("focus");

        jqUnit.test("LightboxFocussed", function () {
            fluid.testUtils.imageReorderer.createImageReorderer();

            assertItemDefault("Initially ", 0);
            fluid.testUtils.imageReorderer.focusLightbox();
            assertItemFocused("After select active item ", 0);

            // Now, test it with no reorderables.
            var lightboxWithNoOrderables = fluid.testUtils.imageReorderer.createImageReordererWithNoOrderables();
            fluid.testUtils.imageReorderer.focusLightbox();
            jqUnit.assertNoValue("Lightbox's activeItem should not be set ", lightboxWithNoOrderables.activeItem);
        });

        jqUnit.test("KeypressesWithNoOrderables", function () {
            var lightboxWithNoOrderables = fluid.testUtils.imageReorderer.createImageReordererWithNoOrderables();

            fluid.testUtils.imageReorderer.focusLightbox();
            jqUnit.assertNoValue("Lightbox's activeItem member should not be set", lightboxWithNoOrderables.activeItem);

            // Test left arrow, right arrow, etc. with and without control key.
            compositeKey(lightboxWithNoOrderables, k.ctrlKeyEvent("LEFT"), 0);
            jqUnit.assertNoValue("After ctrl-left, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            compositeKey(lightboxWithNoOrderables, k.ctrlKeyEvent("RIGHT"), 0);
            jqUnit.assertNoValue("After ctrl-right, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            compositeKey(lightboxWithNoOrderables, k.ctrlKeyEvent("UP"), 0);
            jqUnit.assertNoValue("After ctrl-up, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            compositeKey(lightboxWithNoOrderables, k.ctrlKeyEvent("DOWN"), 0);
            jqUnit.assertNoValue("After ctrl-down, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);

            keyDown(lightboxWithNoOrderables, k.keyEvent("LEFT"), 0);
            jqUnit.assertNoValue("After left, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyDown(lightboxWithNoOrderables, k.keyEvent("RIGHT"), 0);
            jqUnit.assertNoValue("After right, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyDown(lightboxWithNoOrderables, k.keyEvent("UP"), 0);
            jqUnit.assertNoValue("After up, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyDown(lightboxWithNoOrderables, k.keyEvent("DOWN"), 0);
            jqUnit.assertNoValue("After down, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);

            keyDown(lightboxWithNoOrderables, k.keyEvent("CTRL"), 0);
            jqUnit.assertNoValue("After ctrl pressed, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
            keyUp(lightboxWithNoOrderables, k.keyEvent("CTRL"), 0);
            jqUnit.assertNoValue("After key released, activeItem member should not be set",
                lightboxWithNoOrderables.activeItem);
        });

        jqUnit.test("UpdateAriaStates", function () {
            fluid.testUtils.imageReorderer.createImageReorderer();
            fluid.testUtils.imageReorderer.fetchLightboxRoot();
            var firstImage = fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]);
            jqUnit.assertEquals("before first lightbox focus, first item should not be selected", "false", firstImage.attr("aria-selected"));

            fluid.testUtils.imageReorderer.focusLightbox();
            jqUnit.assertEquals("after first lightbox focus, first image should be selected", "true", firstImage.attr("aria-selected"));

            var thirdImage = fluid.jById(fluid.testUtils.imageReorderer.orderableIds[2]);
            fluid.focus(thirdImage);
            jqUnit.assertEquals("after setting active item to third image, first image should not be selected", "false", firstImage.attr("aria-selected"));
            jqUnit.assertEquals("after setting active item to third image, third image should be selected", "true", thirdImage.attr("aria-selected"));

            var newInputElement = document.createElement("input");
            newInputElement.id = "input1";

            $("[id=para1]").after(newInputElement);
            fluid.focus($("[id=input1]").get(0));
            fluid.blur(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[2]));
            jqUnit.assertEquals("after removing focus from lightbox, third image should not be selected", "false", thirdImage.attr("aria-selected"));
        });

        jqUnit.test("UpdateGrabProperty", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            fluid.testUtils.imageReorderer.fetchLightboxRoot();
            var testItem = fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]);

            jqUnit.assertEquals("before any action, test item should have @aria-grabbed='false'", "false", testItem.attr("aria-grabbed"));

            fluid.testUtils.imageReorderer.focusLightbox();
            keyDown(lightbox, k.ctrlKeyEvent("CTRL"), 0);
            jqUnit.assertEquals("while CTRL held down, test item should have @aria-grabbed='true'", "true", testItem.attr("aria-grabbed"));

            keyDown(lightbox, k.ctrlKeyEvent("RIGHT"), 0);
            jqUnit.assertEquals("after arrow while CTRL still held down, test item should have @aria-grabbed='true'", "true", testItem.attr("aria-grabbed"));

            keyUp(lightbox, k.keyEvent("CTRL"), 0);
            jqUnit.assertEquals("after CTRL released, test item should have @aria-grabbed='false", "false", testItem.attr("aria-grabbed"));
        });

        jqUnit.test("AlternativeKeySetDefaultKeysDontWork", function () {
            var lightbox = fluid.testUtils.imageReorderer.createAltKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            // Test arrow keys
            keyDown(lightbox, k.keyEvent("RIGHT"), 0);
            assertItemFocused("After right arrow ", 0);
            assertItemDefault("After right arrow ", 1);

            keyDown(lightbox, k.keyEvent("LEFT"), 0);
            assertItemFocused("After left arrow ", 0);
            assertItemDefault("After left arrow ", 13);

            keyDown(lightbox, k.keyEvent("UP"), 0);
            assertItemFocused("After up arrow ", 0);
            assertItemDefault("After up arrow ", 12);

            keyDown(lightbox, k.keyEvent("DOWN"), 0);
            assertItemFocused("After down arrow ", 0);
            assertItemDefault("After down arrow ", 3);

            // Test CTRL
            keyDown(lightbox, k.ctrlKeyEvent("CTRL"), 0);
            assertItemFocused("After ctrl-down, ", 0);
            keyUp(lightbox, k.keyEvent("CTRL"), 0);
            assertItemFocused("After ctrl-up, ", 0);

            // Test CTRL arrow keys
            compositeKey(lightbox, k.ctrlKeyEvent("RIGHT"), 0);
            assertItemsInOriginalPosition("After ctrl right arrow");

            compositeKey(lightbox, k.ctrlKeyEvent("LEFT"), 0);
            assertItemsInOriginalPosition("After ctrl left arrow");

            compositeKey(lightbox, k.ctrlKeyEvent("UP"), 0);
            assertItemsInOriginalPosition("After ctrl up arrow");

            compositeKey(lightbox, k.ctrlKeyEvent("DOWN"), 0);
            assertItemsInOriginalPosition("After ctrl down arrow");

        });

        jqUnit.test("AlternativeKeySetNavigation", function () {
            var lightbox = fluid.testUtils.imageReorderer.createAltKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            horizontalNavigationTest(lightbox, k.keyEvent("k"), k.keyEvent("j"));

            fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]));
            verticalNavigationTest(lightbox, k.keyEvent("i"), k.keyEvent("m"));
        });

        jqUnit.test("AlternativeKeySetMovement", function () {
            var lightbox = fluid.testUtils.imageReorderer.createAltKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            horizontalMovementTest(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "k"), k.modKeyEvent(["CTRL", "SHIFT"], "j"));
            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            verticalMovementTest(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "i"), k.modKeyEvent(["CTRL", "SHIFT"], "m"));
        });

        jqUnit.test("MultiKeySetNavigation", function () {
            var lightbox = fluid.testUtils.imageReorderer.createMultiKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            horizontalNavigationTest(lightbox, k.keyEvent("k"), k.keyEvent("j"));

            fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]));
            horizontalNavigationTest(lightbox, k.keyEvent("RIGHT"), k.keyEvent("LEFT"));

            fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]));
            verticalNavigationTest(lightbox, k.keyEvent("i"), k.keyEvent("m"));

            fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]));
            verticalNavigationTest(lightbox, k.keyEvent("UP"), k.keyEvent("DOWN"));

        });

        jqUnit.test("MultiKeySetMovement", function () {
            var lightbox = fluid.testUtils.imageReorderer.createMultiKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            horizontalMovementTest(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "k"), k.modKeyEvent(["CTRL", "SHIFT"], "j"));

            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            horizontalMovementTest(lightbox, k.modKeyEvent("ALT", "RIGHT"), k.modKeyEvent("ALT", "LEFT"));

            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            verticalMovementTest(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "i"), k.modKeyEvent(["CTRL", "SHIFT"], "m"));

            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            verticalMovementTest(lightbox, k.modKeyEvent("ALT", "UP"), k.modKeyEvent("ALT", "DOWN"));
        });

        jqUnit.test("MultiKeySetWrongModifier", function () {
            var lightbox = fluid.testUtils.imageReorderer.createMultiKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            // Test: alt k - expect no movement
            compositeKey(lightbox, k.modKeyEvent("ALT", "k"), 0);
            assertItemsInOriginalPosition("after alt-k");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);

            // Test: alt m - expect no movement
            compositeKey(lightbox, k.modKeyEvent("ALT", "m"), 0);
            assertItemsInOriginalPosition("after alt-m");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);

            // Test: ctrl shift left arrow - expect no movement
            compositeKey(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "LEFT"), 0);
            assertItemsInOriginalPosition("after ctrl shift left arrow");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);

            // Test: ctrl shift up arrow - expect no movement
            compositeKey(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "UP"), 0);
            assertItemsInOriginalPosition("after ctrl shift up arrow");
            assertItemFocused("After failed move, ", 0);
            assertItemDefault("After failed move, ", 1);

        });

        jqUnit.test("MultiKeySetOverlappingModifierMovement", function () {
            var lightbox = fluid.testUtils.imageReorderer.createMultiOverlappingKeystrokeImageReorderer();
            fluid.testUtils.imageReorderer.focusLightbox();

            horizontalMovementTest(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "k"), k.modKeyEvent(["CTRL", "SHIFT"], "j"));

            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            horizontalMovementTest(lightbox, k.ctrlKeyEvent("RIGHT"), k.ctrlKeyEvent("LEFT"));

            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            verticalMovementTest(lightbox, k.modKeyEvent(["CTRL", "SHIFT"], "i"), k.modKeyEvent(["CTRL", "SHIFT"], "m"));

            fluid.jById(fluid.testUtils.imageReorderer.orderableIds[0]).focus();
            verticalMovementTest(lightbox, k.ctrlKeyEvent("UP"), k.ctrlKeyEvent("DOWN"));
        });

        /*
         * Tests that the dragging style remains on the moved element when the modifier
         * key remains depressed after the move. This is used to test FLUID-3288
         */
        jqUnit.test("Dragging style after a move: FLUID-3288", function () {
            var lightbox = fluid.testUtils.imageReorderer.createImageReorderer();
            var movables = lightbox.locate("movables");
            var draggingClass = lightbox.options.styles.dragging;
            var index = 0;
            var movable = fluid.jById(movables.eq(index).prop("id"));

            jqUnit.assertEquals("There should be no movable elements with the dragging style", 0, numItemsWithClass(movables, draggingClass));

            fluid.focus(movable); //Setting focus on the item is necessary to recreate the circumstances that caused FLUID-3288
            compositeKey(lightbox, k.ctrlKeyEvent("RIGHT"), index, true);

            jqUnit.assertTrue("The moved item retains the dragging class", movable.hasClass(draggingClass));
            jqUnit.assertEquals("There should only be one movable element with the dragging style", 1, numItemsWithClass(movables, draggingClass));
        });

    });
})(jQuery);
