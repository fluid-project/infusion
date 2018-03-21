/*
Copyright 2013-2015 OCAD University

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

    fluid.defaults("fluid.prefs.enactor.speak", {
        gradeNames: "fluid.prefs.enactor",
        preferenceMap: {
            "fluid.prefs.speak": {
                "model.enabled": "default"
            }
        },
        components: {
            tts: {
                type: "fluid.textToSpeech",
                options: {
                    model: "{speak}.model",
                    invokers: {
                        queueSpeech: {
                            funcName: "fluid.prefs.enactor.speak.queueSpeech",
                            args: ["{that}", "fluid.textToSpeech.queueSpeech", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                        }
                    }
                }
            }
        }
    });

    // Accepts a speechFn (either a function or function name), which will be used to perform the
    // underlying queuing of the speech. This allows the SpeechSynthesis to be replaced (e.g. for testing)
    fluid.prefs.enactor.speak.queueSpeech = function (that, speechFn, text, interrupt, options) {
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

    /*******************************************************************************
     * selfVoicing
     *
     * The enactor that enables self voicing of an entire page
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.selfVoicing", {
        gradeNames: ["fluid.prefs.enactor.speak", "fluid.viewComponent"],
        modelListeners: {
            "enabled": {
                listener: "{that}.handleSelfVoicing",
                args: ["{change}.value"],
                namespace: "handleSelfVoicing"
            }
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
        selectors: {
            mark: ".flc-selfVoicing-mark"
        },
        markup: {
            mark: "<mark class=\"flc-selfVoicing-mark fl-tts-highlight\"></mark>"
        },
        invokers: {
            handleSelfVoicing: {
                funcName: "fluid.prefs.enactor.selfVoicing.handleSelfVoicing",
                // Pass in invokers to force them to be resolved
                args: ["{that}", "{that}.options.strings.welcomeMsg", "{tts}.queueSpeech", "{that}.readFromDOM", "{tts}.cancel", "{arguments}.0"]
            },
            readFromDOM: {
                funcName: "fluid.prefs.enactor.selfVoicing.readFromDOM",
                args: ["{that}", "{that}.container"]
            }
        },
        strings: {
            welcomeMsg: "text to speech enabled"
        },
        listeners: {
            "{tts}.events.utteranceOnEnd": {
                listener: "fluid.prefs.enactor.selfVoicing.handleUtteranceEndEvent",
                args: ["{that}"],
                namespace: "cleanupSelfVoicing"
            },
            "{tts}.events.utteranceOnBoundary": {
                listener: "fluid.prefs.enactor.selfVoicing.handleUtteranceBoundaryEvent",
                args: ["{that}", "{arguments}.0"],
                namespace: "highlightUtteranceText"
            },
            "onDestroy.detachRange": {
                "this": "{that}.range",
                method: "detach"
            }
        }
    });

    fluid.prefs.enactor.selfVoicing.handleSelfVoicing = function (that, welcomeMsg, queueSpeech, readFromDOM, cancel, enabled) {
        that.parseQueue = [];
        if (enabled) {
            that.parseQueue.push(null); //TODO: Not sure why we push null into the queue, should try to remove this.
            queueSpeech(welcomeMsg, true);
            readFromDOM();
        } else {
            cancel();
        }
    };

    fluid.prefs.enactor.selfVoicing.handleUtteranceBoundaryEvent = function (that, e) {
        if (that.parseQueue[0]) {
            fluid.prefs.enactor.selfVoicing.highlight(that, e.charIndex);
        }
    };

    fluid.prefs.enactor.selfVoicing.removeMark = function (that) {
        var mark = that.locate("mark");

        // remove previous marks and normalize parent to clean up textnodes
        if (mark.length) {
            var parent = mark.parent();
            mark.contents().unwrap();
            parent[0].normalize();
        }
    };

    fluid.prefs.enactor.selfVoicing.handleUtteranceEndEvent = function (that) {
        that.parseQueue.shift();
        that.parseIndex = 0;
        fluid.prefs.enactor.selfVoicing.removeMark(that);
    };

    // Constants representing DOM node types.
    fluid.prefs.enactor.selfVoicing.nodeType = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    /**
     * Tests if a string is a word, that is it has a value and is not only whitespace.
     * inspired by https://stackoverflow.com/a/2031143
     *
     * @param {String} str - the String to test
     *
     * @returns {Boolean} - `true` if a word, `false` otherwise.
     */
    fluid.prefs.enactor.selfVoicing.isWord = function (str) {
        return fluid.isValue(str) && /\S/.test(str);
    };

    // blockindex is the start index in the entire block of text.
    // charIndex is the start index of the word in the nested block of text
    /**
     * Recursively parses a DOM element and it's sub elements to construct an array of data points representing the
     * words and space between the words. This data structure provides the means for locating text to highlight as the
     * self voicing engine runs.
     * NOTE: consecutive whitespace is collapsed to the first whitespace character.
     * NOTE: hidden text is skipped.
     *
     * @param {node} elm - the DOM node to parse
     * @param {Number} blockIndex - The `blockIndex` represents the index into the entire block of text being parsed.
     *                              It defaults to 0 and is primarily used internally for recursive calls.
     *
     * @returns {Array} - An array of data points, objects of the with the following structure.
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
    fluid.prefs.enactor.selfVoicing.parse = function (elm, blockIndex) {
        var parsed = [];
        blockIndex = blockIndex || 0;

        var childNodes = elm.childNodes;

        $.each(childNodes, function (childIndex, childNode) {
            if (childNode.nodeType === fluid.prefs.enactor.selfVoicing.nodeType.TEXT_NODE) {
                var words = childNode.textContent.split(/(\s+)/); // split on whitespace, and capture whitespace
                var charIndex = 0;

                fluid.each(words, function (word) {
                    if (fluid.prefs.enactor.selfVoicing.isWord(word)) {
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
                    } else if (word && fluid.prefs.enactor.selfVoicing.isWord(fluid.get(parsed, [(parsed.length - 1), "word"]))) {
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
                // TODO: Probably shouldn't read any hidden/invisible text.
            } else if (childNode.nodeType === fluid.prefs.enactor.selfVoicing.nodeType.ELEMENT_NODE && window.getComputedStyle(childNode).display !== "none" && childNode.tagName !== "SCRIPT") {
                parsed = parsed.concat(fluid.prefs.enactor.selfVoicing.parse(childNode, blockIndex));
                if (parsed.length) {
                    var lastParsed = parsed[parsed.length - 1];
                    blockIndex = lastParsed.blockIndex + lastParsed.word.length;
                }
            }
        });

        return parsed;
    };

    /**
     * Combines the parsed text into a String.
     *
     * @param {Array} parsed - An array of parsed data points
     *
     * @returns {String} - The parsed text combined into a String.
     */
    fluid.prefs.enactor.selfVoicing.parsedToString = function (parsed) {
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
    fluid.prefs.enactor.selfVoicing.readFromDOM = function (that, elm) {
        elm = $(elm);

        // only execute if there are nodes to read from
        if (elm.length) {
            var parsedFromElm = fluid.prefs.enactor.selfVoicing.parse(elm[0]);
            that.parseQueue.push(parsedFromElm);
            that.tts.queueSpeech(fluid.prefs.enactor.selfVoicing.parsedToString(parsedFromElm));
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
     * @returns {Number|undefined} - Will return the index of the closest data point in the parseQueue. If the boundary
     *                               cannot be loacated within the parseQueue, `undefined` is returned.
     */
    fluid.prefs.enactor.selfVoicing.getClosestIndex = function (parseQueue, currentIndex, boundary) {
        var maxIndex  = Math.max(parseQueue.length - 1, 0);
        currentIndex = Math.max(Math.min(currentIndex, maxIndex), 0);

        var nextIndex = currentIndex + 1;
        var prevIndex = currentIndex - 1;

        var currentBlockIndex = parseQueue[currentIndex].blockIndex;
        var maxBoundary = parseQueue[maxIndex].blockIndex + parseQueue[maxIndex].word.length;


        if (boundary < 0 || boundary > maxBoundary ) {
            return undefined;
        }

        if (currentBlockIndex === boundary || (currentIndex < maxIndex && boundary < parseQueue[nextIndex].blockIndex)) {
            return currentIndex;
        }

        if (currentBlockIndex > boundary) {
            return fluid.prefs.enactor.selfVoicing.getClosestIndex(parseQueue, prevIndex, boundary);
        }

        return fluid.prefs.enactor.selfVoicing.getClosestIndex(parseQueue, nextIndex, boundary);
    };

    /**
     * Highlights text from the parseQueue according to the specified boundary. Highlights are performed by wrapping
     * the appropriate text in the markup specified by `that.options.markup.mark`.
     *
     * @param {Component} that - the component
     * @param {Number} boundary - the boundary point used to find the text to highlight. Typically this is the utterance
     *                            boundary returned from the utteranceOnBoundary event.
     */
    fluid.prefs.enactor.selfVoicing.highlight = function (that, boundary) {
        fluid.prefs.enactor.selfVoicing.removeMark(that);

        var closestIndex = fluid.prefs.enactor.selfVoicing.getClosestIndex(that.parseQueue[0], that.parseIndex, boundary);

        if (fluid.isValue(closestIndex)) {
            that.parseIndex = closestIndex;

            var data = that.parseQueue[0][that.parseIndex];
            var rangeNode = data.parentNode.childNodes[data.childIndex];

            that.range.selectNode(rangeNode);
            that.range.setStart(rangeNode, data.startOffset);
            that.range.setEnd(rangeNode, data.endOffset);
            that.range.surroundContents($(that.options.markup.mark)[0]);
        }
    };

})(jQuery, fluid_3_0_0);
