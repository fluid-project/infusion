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

    /**********************************************
     * fluid.orator
     *
     * A component for self voicing a web page
     **********************************************/

    fluid.defaults("fluid.orator", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            controller: ".flc-orator-controller",
            content: ".flc-orator-content"
        },
        model: {
            enabled: false
        },
        components: {
            controller: {
                type: "fluid.orator.controller",
                container: "{that}.dom.controller",
                options: {
                    model: {
                        playing: "{orator}.model.enabled"
                    }
                }
            },
            domReader: {
                type: "fluid.orator.domReader",
                container: "{that}.dom.content",
                options: {
                    listeners: {
                        "{tts}.events.utteranceOnEnd": [{
                            changePath: "{orator}.model.enabled",
                            value: false,
                            priority: "after:removeHighlight",
                            namespace: "domReader.stop"
                        }]
                    },
                    modelListeners: {
                        "{orator}.model.enabled": {
                            funcName: "fluid.orator.handlePlayToggle",
                            args: ["{that}", "{change}.value"],
                            namespace: "domReader.handlePlayToggle"
                        }
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.controller",
            target: "{that controller}.options",
            namespace: "controllerOpts"
        }, {
            source: "{that}.options.domReader",
            target: "{that domReader}.options",
            namespace: "domReaderOpts"
        }]
    });

    fluid.orator.handlePlayToggle = function (that, state) {
        if (state) {
            that.play();
        } else {
            that.pause();
        }
    };

    /**********************************************
     * fluid.orator.controller
     *
     * Provides a UI Widget to control the Orator
     **********************************************/

    fluid.defaults("fluid.orator.controller", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            playToggle: ".flc-orator-controller-playToggle"
        },
        styles: {
            play: "fl-orator-controller-play"
        },
        strings: {
            play: "play",
            pause: "pause"
        },
        model: {
            playing: false
        },
        invokers: {
            play: {
                changePath: "playing",
                value: true
            },
            pause: {
                changePath: "playing",
                value: false
            },
            toggle: {
                funcName: "fluid.orator.controller.toggleState",
                // Not providing an option for the explicit state value because
                // when called through the jQuery click event the event object
                // is passed in.
                args: ["{that}", "playing"]
            }
        },
        listeners: {
            "onCreate.bindClick": {
                "this": "{that}.dom.playToggle",
                method: "click",
                args: ["{that}.toggle"]
            }
        },
        modelListeners: {
            "playing": {
                listener: "fluid.orator.controller.setToggleView",
                args: ["{that}", "{change}.value"]
            }
        }
    });

    fluid.orator.controller.toggleState = function (that, path, state) {
        var newState = fluid.isValue(state) ? state : !fluid.get(that.model, path);
        // the !! ensures that the newState is a boolean value.
        that.applier.change(path, !!newState);
    };

    fluid.orator.controller.setToggleView = function (that, state) {
        var playToggle = that.locate("playToggle");
        playToggle.toggleClass(that.options.styles.play, state);
        playToggle.attr({
            "aria-label": that.options.strings[state ? "pause" : "play"]
        });
    };


    /*******************************************************************************
     * fluid.orator.domReader
     *
     * Reads in text from a DOM element and voices it
     *******************************************************************************/

    fluid.defaults("fluid.orator.domReader", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            highlight: ".flc-orator-highlight"
        },
        markup: {
            highlight: "<mark class=\"flc-orator-highlight fl-orator-highlight\"></mark>"
        },
        events: {
            onReadFromDOM: null
        },
        model: "{tts}.model",
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
                    invokers: {
                        queueSpeech: {
                            funcName: "fluid.orator.domReader.queueSpeech",
                            args: [
                                "{that}",
                                "fluid.textToSpeech.queueSpeech",
                                "{arguments}.0",
                                "{arguments}.1",
                                "{arguments}.2"
                            ]
                        }
                    }
                }
            }
        },
        invokers: {
            readFromDOM: {
                funcName: "fluid.orator.domReader.readFromDOM",
                args: ["{that}", "{that}.container"]
            },
            removeHighlight: {
                funcName: "fluid.orator.domReader.unWrap",
                args: ["{that}.dom.highlight"]
            },
            resetParseQueue: {
                funcName: "fluid.orator.domReader.resetParseQueue",
                args: ["{that}"]
            },
            highlight: {
                funcName: "fluid.orator.domReader.highlight",
                args: ["{that}", "{arguments}.0"]
            },
            play: {
                funcName: "fluid.orator.domReader.speak",
                args: ["{that}"]
            },
            pause: {
                funcName: "fluid.orator.domReader.pause",
                args: ["{that}"]
            }
        },
        listeners: {
            "{tts}.events.utteranceOnEnd": [{
                listener: "{that}.resetParseQueue",
                namespace: "resetParseQueue"
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

    fluid.orator.domReader.speak = function (that) {
        if (that.model.paused) {
            that.tts.resume();
        } else if (!that.model.speaking) {
            that.readFromDOM();
        }
    };

    fluid.orator.domReader.pause = function (that) {
        if (that.model.speaking && !that.model.paused) {
            that.tts.pause();
        }
    };

    // Accepts a speechFn (either a function or function name), which will be used to perform the
    // underlying queuing of the speech. This allows the SpeechSynthesis to be replaced (e.g. for testing)
    fluid.orator.domReader.queueSpeech = function (that, speechFn, text, interrupt, options) {
        // force a string value
        var str = text.toString();

        // remove extra whitespace
        str = str.trim();
        str.replace(/\s{2,}/gi, " ");

        if (str) {
            if (typeof(speechFn) === "string") {
                fluid.invokeGlobalFunction(speechFn, [that, str, interrupt, options]);
            } else {
                speechFn(that, str, interrupt, options);
            }
        }
    };

    /**
     * Unwraps the contents of the element by removing the tag surrounding the content and placing the content
     * as a node within the element's parent. The parent is also normalized to combine any adjacent textnodes.
     *
     * @param {String|jQuery|DomElement} elm - element to unwrap
     */
    fluid.orator.domReader.unWrap = function (elm) {
        elm = $(elm);

        if (elm.length) {
            var parent = elm.parent();
            // Remove the element, but place its contents within the parent.
            elm.contents().unwrap();
            // Normalize the parent to cleanup textnodes
            parent[0].normalize();
        }
    };

    /**
     * Resets the parseQueue and parseIndex
     *
     * @param {Component} that - the component
     */
    fluid.orator.domReader.resetParseQueue = function (that) {
        that.parseQueue = [];
        that.parseIndex = 0;
    };

    // Constants representing DOM node types.
    fluid.orator.domReader.nodeType = {
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
    fluid.orator.domReader.isWord = function (str) {
        return fluid.isValue(str) && /\S/.test(str);
    };

    /**
     * Determines if there is rendered text in an element.
     * Will return false in the following conditions:
     * - elm is falsey (undefined, null, etc.)
     * - elm's offsetHeight is 0 (e.g. display none set on itself or its parent)
     * - elm has no text or only whitespace
     * - elm or its parent has `aria-hidden="true"` set.
     *
     * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
     *
     * @return {Boolean} - returns true if there is rendered text within the element and false otherwise.
     *                     (See rules above)
     */
    fluid.orator.domReader.hasRenderedText = function (elm) {
        elm = fluid.unwrap(elm);

        return elm &&
               !!elm.offsetHeight &&
               fluid.orator.domReader.isWord(elm.innerText) &&
               !$(elm).closest("[aria-hidden=\"true\"]").length;
    };

    /**
     * Adds a data point to an array of parsed DOM elements.
     * Structure of each data point is as follows:
     *  {
     *      blockIndex: {Integer}, // the index into the entire block of text being parsed from the DOM
     *      startOffset: {Integer}, // the start offset of the current `word` relative to the closest
     *                             // enclosing DOM element
     *      endOffset: {Integer}, // the start offset of the current `word` relative to the closest
     *                           // enclosing DOM element
     *      node: {DomNode}, // the current child node being parsed
     *      childIndex: {Integer}, // the index of the child node being parsed relative to its parent
     *      parentNode: {DomElement}, // the parent DOM node
     *      word: {String} // the text, `word`, parsed from the node. (It may contain only whitespace.)
     *   }
     * @param {ParseQueue[]} parsed - An array of data points for the Parsed DOM
     * @param {String} word - The word, parsed from the node, to be added
     * @param {DomNode} childNode - The current textnode being operated on
     * @param {Integer} blockIndex - The index into the entire block of text being parsed from the DOM
     * @param {Integer} charIndex - The index into the current node being operated on, that is the start index of the
     *                              word in the string representing the text of the node.
     * @param {Integer} childIndex - The index of the node in the list of its parent's child nodes.
     */
    fluid.orator.domReader.addParsedData = function (parsed, word, childNode, blockIndex, charIndex, childIndex) {
        parsed.push({
            blockIndex: blockIndex,
            startOffset: charIndex,
            endOffset: charIndex + word.length,
            node: childNode,
            childIndex: childIndex,
            parentNode: childNode.parentNode,
            word: word
        });
    };

    /**
     * Recursively parses a DOM element and it's sub elements to construct an array of data points representing the
     * words and space between the words. This data structure provides the means for locating text to highlight as the
     * self voicing engine runs.
     * NOTE: consecutive whitespace is collapsed to the first whitespace character.
     * NOTE: hidden text is skipped.
     *
     * @param {jQuery|DomElement} elm - the DOM node to parse
     * @param {Integer} blockIndex - The `blockIndex` represents the index into the entire block of text being parsed.
     *                              It defaults to 0 and is primarily used internally for recursive calls.
     *
     * @return {ParseQueue[]} - An array of data points for the Parsed DOM
     *                          See fluid.orator.domReader.addParsedData for details on the structure.
     */
    fluid.orator.domReader.parse = function (elm, blockIndex) {
        var parsed = [];
        elm = fluid.unwrap(elm);
        blockIndex = blockIndex || 0;

        if (fluid.orator.domReader.hasRenderedText(elm)) {
            var childNodes = elm.childNodes;

            $.each(childNodes, function (childIndex, childNode) {
                if (childNode.nodeType === fluid.orator.domReader.nodeType.TEXT_NODE) {
                    var words = childNode.textContent.split(/(\s+)/); // split on whitespace, and capture whitespace
                    // charIndex is the start index of the word in the nested block of text
                    var charIndex = 0;

                    fluid.each(words, function (word) {
                        if (fluid.orator.domReader.isWord(word)) {
                            fluid.orator.domReader.addParsedData(parsed, word, childNode, blockIndex, charIndex, childIndex);
                            blockIndex += word.length;
                        // if the current `word` is not an empty string and the last parsed `word` is not whitespace
                        } else if (word && fluid.orator.domReader.isWord(fluid.get(parsed, [(parsed.length - 1), "word"]))) {
                            fluid.orator.domReader.addParsedData(parsed, word, childNode, blockIndex, charIndex, childIndex);
                            blockIndex += word.length;
                        }
                        charIndex += word.length;
                    });
                } else if (childNode.nodeType === fluid.orator.domReader.nodeType.ELEMENT_NODE &&
                    fluid.orator.domReader.hasRenderedText(childNode)) {
                    parsed = parsed.concat(fluid.orator.domReader.parse(childNode, blockIndex));
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
    fluid.orator.domReader.parsedToString = function (parsed) {
        var words = fluid.transform(parsed, function (block) {
            return block.word;
        });

        return words.join("");
    };

    /**
     * Parses the DOM element into data points to use for highlighting the text, and queues the text into the self
     * voicing engine. The parsed data points are added to the component's `parseQueue`
     *
     * @param {Component} that - the component
     * @param {String|jQuery|DomElement} elm - The DOM node to read
     */
    fluid.orator.domReader.readFromDOM = function (that, elm) {
        elm = $(elm);

        // only execute if there are nodes to read from
        if (elm.length) {
            var parsedFromElm = fluid.orator.domReader.parse(elm[0]);
            that.parseQueue = parsedFromElm;
            that.events.onReadFromDOM.fire(parsedFromElm);
            that.tts.queueSpeech(fluid.orator.domReader.parsedToString(parsedFromElm));
        }
    };

    /**
     * Returns the index of the closest data point from the parseQueue based on the boundary provided.
     *
     * @param {Array} parseQueue - An array data points generated from parsing a DOM structure
     * @param {Integer} currentIndex - The index into the paraseQueue to start searching from. The currentIndex will be
     *                                constrained to the bounds of the parseQueue.
     * @param {Integer} boundary - The boundary value used to compare against the blockIndex of the parsed data points.
     *
     * @return {Integer|undefined} - Will return the index of the closest data point in the parseQueue. If the boundary
     *                               cannot be located within the parseQueue, `undefined` is returned.
     */
    fluid.orator.domReader.getClosestIndex = function (parseQueue, currentIndex, boundary) {
        var maxIdx  = Math.max(parseQueue.length - 1, 0);
        currentIndex = Math.max(Math.min(currentIndex, maxIdx), 0);

        var nextIdx = currentIndex + 1;
        var prevIdx = currentIndex - 1;

        var currentBlockIndex = parseQueue[currentIndex].blockIndex;
        var maxBoundary = parseQueue[maxIdx].blockIndex + parseQueue[maxIdx].word.length;


        if (!fluid.isValue(boundary) || boundary < 0 || boundary > maxBoundary ) {
            return undefined;
        }

        if (currentBlockIndex > boundary) {
            return fluid.orator.domReader.getClosestIndex(parseQueue, prevIdx, boundary);
        }

        var isInNextBound = parseQueue[nextIdx] ? boundary < parseQueue[nextIdx].blockIndex : boundary <= maxBoundary;

        if (currentBlockIndex === boundary || (currentIndex <= maxIdx && isInNextBound)) {
            return currentIndex;
        }

        return fluid.orator.domReader.getClosestIndex(parseQueue, nextIdx, boundary);
    };

    /**
     * Highlights text from the parseQueue according to the specified boundary. Highlights are performed by wrapping
     * the appropriate text in the markup specified by `that.options.markup.highlight`.
     *
     * @param {Component} that - the component
     * @param {Integer} boundary - the boundary point used to find the text to highlight. Typically this is the
     *                             utterance boundary returned from the utteranceOnBoundary event.
     */
    fluid.orator.domReader.highlight = function (that, boundary) {
        that.removeHighlight();

        if (that.parseQueue.length) {
            var closestIndex = fluid.orator.domReader.getClosestIndex(that.parseQueue, that.parseIndex, boundary);

            if (fluid.isValue(closestIndex)) {
                that.parseIndex = closestIndex;

                var data = that.parseQueue[that.parseIndex];
                var rangeNode = data.parentNode.childNodes[data.childIndex];

                that.range.selectNode(rangeNode);
                that.range.setStart(rangeNode, data.startOffset);
                that.range.setEnd(rangeNode, data.endOffset);
                that.range.surroundContents($(that.options.markup.highlight)[0]);
            }
        }
    };

})(jQuery, fluid_3_0_0);
