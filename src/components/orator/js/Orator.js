/*
Copyright 2013-2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * speak
     *
     * An enactor that is capable of speaking text.
     * Typically this will be used as a base grade to an enactor that supplies
     * the text to be spoken.
     *******************************************************************************/

    fluid.defaults("fluid.orator", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            highlight: ".flc-orator-highlight"
        },
        strings: {
            welcomeMsg: "text to speech enabled"
        },
        markup: {
            highlight: "<mark class=\"flc-orator-highlight fl-orator-highlight\"></mark>"
        },
        events: {
            onReadFromDOM: null
        },
        members: {
            parseQueue: [],
            parseIndex: 0,
            range: {
                expander: {
                    this: "document",
                    method: "createRange"
                }
            }
        },
        components: {
            tts: {
                type: "fluid.textToSpeech",
                options: {
                    model: "{orator}.model",
                    invokers: {
                        queueSpeech: {
                            funcName: "fluid.orator.queueSpeech",
                            args: ["{that}", "fluid.textToSpeech.queueSpeech", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                        }
                    }
                }
            }
        },
        invokers: {
            handleSelfVoicing: {
                funcName: "fluid.orator.handleSelfVoicing",
                // Pass in invokers to force them to be resolved
                args: ["{that}", "{that}.options.strings.welcomeMsg", "{tts}.queueSpeech", "{that}.readFromDOM", "{tts}.cancel", "{arguments}.0"]
            },
            readFromDOM: {
                funcName: "fluid.orator.readFromDOM",
                args: ["{that}", "{that}.container"]
            },
            removeHighlight: {
                funcName: "fluid.orator.unWrap",
                args: ["{that}.dom.highlight"]
            },
            highlight: {
                funcName: "fluid.orator.highlight",
                args: ["{that}", "{arguments}.0"]
            }
        },
        modelListeners: {
            "enabled": {
                listener: "{that}.handleSelfVoicing",
                args: ["{change}.value"],
                namespace: "handleSelfVoicing"
            }
        },
        listeners: {
            "{tts}.events.utteranceOnEnd": [{
                listener: "fluid.orator.removeCurrentParseQueueItem",
                args: ["{that}"],
                namespace: "removeCurrentParseQueueItem"
            }, {
                listener: "{that}.removeHighlight",
                namespace: "removeHighlight"
            }],
            "{tts}.events.utteranceOnBoundary": {
                listener: "{that}.highlight",
                args: ["{arguments}.0.charIndex"],
                namespace: "highlightUtteranceText"
            },
            "onDestroy.detachRange": {
                "this": "{that}.range",
                method: "detach"
            }
        }
    });

    // Accepts a speechFn (either a function or function name), which will be used to perform the
    // underlying queuing of the speech. This allows the SpeechSynthesis to be replaced (e.g. for testing)
    fluid.orator.queueSpeech = function (that, speechFn, text, interrupt, options) {
        // force a string value
        var str = text.toString();

        // remove extra whitespace
        str = str.trim();
        str.replace(/\s{2,}/gi, " ");

        if (that.model.enabled && str) {
            if (typeof(speechFn) === "string") {
                fluid.invokeGlobalFunction(speechFn, [that, str, interrupt, options]);
            } else {
                speechFn(that, str, interrupt, options);
            }
        }
    };

    fluid.orator.handleSelfVoicing = function (that, welcomeMsg, queueSpeech, readFromDOM, cancel, enabled) {
        that.parseQueue = [];
        if (enabled) {
            //TODO: It seems that we push null so that the parseQueue and queued speech remain in sync, given the
            //      welcomeMsg pushed into the speech queue.
            //      We should try to remove the need to push null.
            that.parseQueue.push(null);
            queueSpeech(welcomeMsg, true);
            readFromDOM();
        } else {
            cancel();
        }
    };

    /**
     * Unwraps the contents of the element by removing the tag surrounding the content and placing the content
     * as a node within the element's parent. The parent is also normalized to combine any adjacent textnodes.
     *
     * @param {String|jQuery|element} elm - element to unwrap
     */
    fluid.orator.unWrap = function (elm) {
        elm = $(elm);

        if (elm.length) {
            var parent = elm.parent();
            // Remove the element, but place its contents within the parent.
            elm.contents().unwrap();
            // Normalize the parent to cleanup textnodes
            parent[0].normalize();
        }
    };

    fluid.orator.removeCurrentParseQueueItem = function (that) {
        that.parseQueue.shift();
        that.parseIndex = 0;
    };

    // Constants representing DOM node types.
    fluid.orator.nodeType = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    /**
     * Tests if a string is a word, that is it has a value and is not only whitespace.
     * inspired by https://stackoverflow.com/a/2031143
     *
     * @param {String} str - the String to test
     *
     * @return {Boolean} - `true` if a word, `false` otherwise.
     */
    fluid.orator.isWord = function (str) {
        return fluid.isValue(str) && /\S/.test(str);
    };

    /**
     * Determines if there is rendered text to in an element.
     * Will return false in the following conditions:
     * - elm is falsey (undefined, null, etc.)
     * - elm's offsetHeight is 0 (e.g. display none set on itself or its parent)
     * - elm has no text or only whitespace
     * - elm or its parent has `aria-hidden="true"` set.
     *
     * @param {jQuery|element} elm - either a DOM node or a jQuery element
     *
     * @return {Boolean} - returns true if there is rendered text within the element and false otherwise. (See rules above)
     */
    fluid.orator.hasRenderedText = function (elm) {
        elm = fluid.unwrap(elm);

        return elm && !!elm.offsetHeight && fluid.orator.isWord(elm.innerText) && !$(elm).closest("[aria-hidden=\"true\"]").length;
    };

    /**
     * Recursively parses a DOM element and it's sub elements to construct an array of data points representing the
     * words and space between the words. This data structure provides the means for locating text to highlight as the
     * self voicing engine runs.
     * NOTE: consecutive whitespace is collapsed to the first whitespace character.
     * NOTE: hidden text is skipped.
     *
     * @param {jQuery|element} elm - the DOM node to parse
     * @param {Number} blockIndex - The `blockIndex` represents the index into the entire block of text being parsed.
     *                              It defaults to 0 and is primarily used internally for recursive calls.
     *
     * @return {Array} - An array of data points, objects of the with the following structure.
     *                   {
                             blockIndex: {Number}, // the index into the entire block of text being parsed
                             startOffset: {Number}, // the start offset of the current `word` relative to the closest enclosing DOM element
                             endOffset: {Number}, // the start offset of the current `word` relative to the closest enclosing DOM element
                             node: {node}, // the current child node being parsed
                             childIndex: {Number}, // the index of the child node being parsed relative to its parent
                             parentNode: {node}, // the parent DOM node
                             word: {String} // the text, `word`, parsed from the node. (It may contain only whitespace.)
                         }
     */
    fluid.orator.parse = function (elm, blockIndex) {
        var parsed = [];
        elm = fluid.unwrap(elm);
        blockIndex = blockIndex || 0;

        if (fluid.orator.hasRenderedText(elm)) {
            var childNodes = elm.childNodes;

            $.each(childNodes, function (childIndex, childNode) {
                if (childNode.nodeType === fluid.orator.nodeType.TEXT_NODE) {
                    var words = childNode.textContent.split(/(\s+)/); // split on whitespace, and capture whitespace
                    // charIndex is the start index of the word in the nested block of text
                    var charIndex = 0;

                    fluid.each(words, function (word) {
                        if (fluid.orator.isWord(word)) {
                            parsed.push({
                                blockIndex: blockIndex,
                                startOffset: charIndex,
                                endOffset: charIndex + word.length,
                                node: childNode,
                                childIndex: childIndex,
                                parentNode: childNode.parentNode,
                                word: word
                            });
                            blockIndex += word.length;
                        // if the current `word` is not an empty string and the last parsed `word` is not whitespace
                        } else if (word && fluid.orator.isWord(fluid.get(parsed, [(parsed.length - 1), "word"]))) {
                            parsed.push({
                                blockIndex: blockIndex,
                                startOffset: charIndex,
                                endOffset: charIndex + word.length,
                                node: childNode,
                                childIndex: childIndex,
                                parentNode: childNode.parentNode,
                                word: word
                            });
                            blockIndex += word.length;
                        }
                        charIndex += word.length;
                    });
                } else if (childNode.nodeType === fluid.orator.nodeType.ELEMENT_NODE && fluid.orator.hasRenderedText(childNode)) {
                    parsed = parsed.concat(fluid.orator.parse(childNode, blockIndex));
                    if (parsed.length) {
                        var lastParsed = parsed[parsed.length - 1];
                        blockIndex = lastParsed.blockIndex + lastParsed.word.length;
                    }
                }
            });
        }

        return parsed;
    };

    /**
     * Combines the parsed text into a String.
     *
     * @param {Array} parsed - An array of parsed data points
     *
     * @return {String} - The parsed text combined into a String.
     */
    fluid.orator.parsedToString = function (parsed) {
        var words = fluid.transform(parsed, function (block) {
            return block.word;
        });

        return words.join("");
    };

    /**
     * Parses the DOM element into data points to use for highlighting the text, and queues the text into the self
     * voicing engine. The parsed data points are added as an array to the component's `parseQueue`
     *
     * @param {Component} that - the component
     * @param {node} elm - The DOM node to read
     */
    fluid.orator.readFromDOM = function (that, elm) {
        elm = $(elm);

        // only execute if there are nodes to read from
        if (elm.length) {
            var parsedFromElm = fluid.orator.parse(elm[0]);
            that.parseQueue.push(parsedFromElm);
            that.events.onReadFromDOM.fire(parsedFromElm);
            that.tts.queueSpeech(fluid.orator.parsedToString(parsedFromElm));
        }
    };

    /**
     * Returns the index of the closest data point from the parseQueue based on the boundary provided.
     *
     * @param {Array} parseQueue - An array data points generated from parsing a DOM structure
     * @param {Number} currentIndex - The index into the paraseQueue to start searching from. The currentIndex will be
     *                                constrained to the bounds of the parseQueue.
     * @param {Number} boundary - The boundary value used to compare against the blockIndex of the parsed data points.
     *
     * @return {Number|undefined} - Will return the index of the closest data point in the parseQueue. If the boundary
     *                               cannot be located within the parseQueue, `undefined` is returned.
     */
    fluid.orator.getClosestIndex = function (parseQueue, currentIndex, boundary) {
        var maxIndex  = Math.max(parseQueue.length - 1, 0);
        currentIndex = Math.max(Math.min(currentIndex, maxIndex), 0);

        var nextIndex = currentIndex + 1;
        var prevIndex = currentIndex - 1;

        var currentBlockIndex = parseQueue[currentIndex].blockIndex;
        var maxBoundary = parseQueue[maxIndex].blockIndex + parseQueue[maxIndex].word.length;


        if (!fluid.isValue(boundary) || boundary < 0 || boundary > maxBoundary ) {
            return undefined;
        }

        if (currentBlockIndex > boundary) {
            return fluid.orator.getClosestIndex(parseQueue, prevIndex, boundary);
        }

        var isWithinNextBound = parseQueue[nextIndex] ? boundary < parseQueue[nextIndex].blockIndex : boundary <= maxBoundary;

        if (currentBlockIndex === boundary || (currentIndex <= maxIndex && isWithinNextBound)) {
            return currentIndex;
        }

        return fluid.orator.getClosestIndex(parseQueue, nextIndex, boundary);
    };

    /**
     * Highlights text from the parseQueue according to the specified boundary. Highlights are performed by wrapping
     * the appropriate text in the markup specified by `that.options.markup.highlight`.
     *
     * @param {Component} that - the component
     * @param {Number} boundary - the boundary point used to find the text to highlight. Typically this is the utterance
     *                            boundary returned from the utteranceOnBoundary event.
     */
    fluid.orator.highlight = function (that, boundary) {
        that.removeHighlight();

        if (that.parseQueue[0]) {
            var closestIndex = fluid.orator.getClosestIndex(that.parseQueue[0], that.parseIndex, boundary);

            if (fluid.isValue(closestIndex)) {
                that.parseIndex = closestIndex;

                var data = that.parseQueue[0][that.parseIndex];
                var rangeNode = data.parentNode.childNodes[data.childIndex];

                that.range.selectNode(rangeNode);
                that.range.setStart(rangeNode, data.startOffset);
                that.range.setEnd(rangeNode, data.endOffset);
                that.range.surroundContents($(that.options.markup.highlight)[0]);
            }
        }
    };

})(jQuery, fluid_3_0_0);
