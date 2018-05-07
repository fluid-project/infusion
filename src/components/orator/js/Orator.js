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
            play: false
        },
        components: {
            controller: {
                type: "fluid.orator.controller",
                options: {
                    container: "{orator}.dom.controller",
                    scope: "{orator}.container",
                    model: {
                        playing: "{orator}.model.play"
                    }
                }
            },
            selectionReader: {
                type: "fluid.orator.selectionReader",
                container: "{that}.container"
            },
            domReader: {
                type: "fluid.orator.domReader",
                container: "{that}.dom.content",
                options: {
                    listeners: {
                        "{tts}.events.utteranceOnEnd": [{
                            changePath: "{orator}.model.play",
                            value: false,
                            source: "domReader.tts.utteranceOnEnd",
                            priority: "after:removeHighlight",
                            namespace: "domReader.stop"
                        }]
                    },
                    modelListeners: {
                        "{orator}.model.play": {
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
            removeSource: true,
            namespace: "controllerOpts"
        }, {
            source: "{that}.options.domReader",
            target: "{that domReader}.options",
            removeSource: true,
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
        gradeNames: ["fluid.newViewComponent"],
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
        container: "",
        scope: "",
        model: {
            playing: false
        },
        members: {
            container: "@expand:fluid.orator.controller.container({that}.options.container, {that}.options.markup.defaultContainer, {that}.options.scope)"
        },
        // TODO: Investigate fetching this from a template
        markup: {
            defaultContainer: "<div class=\"flc-orator-controller fl-orator-controller\">" +
                "<div class=\"fl-icon-orator\" aria-hidden=\"true\"></div>" +
                "<button class=\"flc-orator-controller-playToggle\">" +
                    "<span class=\"fl-orator-controller-playToggle fl-icon-orator-playToggle\" aria-hidden=\"true\"></span>" +
                "</button></div>"
        },
        invokers: {
            play: {
                changePath: "playing",
                value: true,
                source: "play"
            },
            pause: {
                changePath: "playing",
                value: false,
                source: "pause"
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
        that.applier.change(path, !!newState, "ADD", "toggleState");
    };

    fluid.orator.controller.setToggleView = function (that, state) {
        var playToggle = that.locate("playToggle");
        playToggle.toggleClass(that.options.styles.play, state);
        playToggle.attr({
            "aria-label": that.options.strings[state ? "pause" : "play"]
        });
    };

    fluid.orator.controller.container = function (containerSpec, defaultContainer, scope) {
        var container = fluid.container(containerSpec, true);

        if (container) {
            return container;
        }
        var newContainer = $(defaultContainer);

        // Unwrap to ensure that any jQuery element passed in actually has an element
        // and if it does, we only want to use the first one.
        scope = $(scope)[0] || "body";
        $(scope).prepend(newContainer);
        return fluid.container(newContainer);
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
     * Determines if there is text in an element that should be read.
     * Will return false in the following conditions:
     * - elm is falsey (undefined, null, etc.)
     * - elm's offsetHeight is 0 (e.g. display none set on itself or its parent)
     * - elm has no text or only whitespace
     * - elm or its parent has `aria-hidden="true"` set.
     *
     * NOTE: text added by pseudo elements (e.g. :before, :after) are not considered.
     *
     * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
     *
     * @return {Boolean} - returns true if there is rendered text within the element and false otherwise.
     *                     (See rules above)
     */
    fluid.orator.domReader.hasTextToRead = function (elm) {
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

        if (fluid.orator.domReader.hasTextToRead(elm)) {
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
                    fluid.orator.domReader.hasTextToRead(childNode)) {
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



    /*******************************************************************************
     * fluid.orator.selectionReader
     *
     * Reads in text from a selection and voices it
     *******************************************************************************/

    fluid.defaults("fluid.orator.selectionReader", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            play: ".flc-orator-selectionReader-play"
        },
        strings: {
            playButton: "play"
        },
        styles: {
            above: "fl-orator-selectionReader-above",
            below: "fl-orator-selectionReader-below"
        },
        markup: {
            playButton: "<button class=\"flc-orator-selectionReader-play fl-orator-selectionReader-play\"><span class=\"fl-icon-orator\"></span><span>%playButton</span></button>"
        },
        model: {
            showUI: false,
            play: false,
            text: ""
        },
        // similar to em values as it will be multiplied by the container's font-size
        offsetScale: {
            edge: 3,
            pointer: 2.5
        },
        events: {
            onSelectionChanged: null
        },
        listeners: {
            "onCreate.bindEvents": {
                funcName: "fluid.orator.selectionReader.bindSelectionEvents",
                args: ["{that}"]
            },
            "onSelectionChanged.updateText": {
                changePath: "text",
                value: {
                    expander: {
                        func: "{that}.getSelectedText"
                    }
                }
            }
        },
        modelListeners: {
            "showUI": {
                funcName: "fluid.orator.selectionReader.renderPlayButton",
                args: ["{that}", "{change}.value"],
                namespace: "render"
            },
            "text": {
                func: "{that}.stop",
                namespace: "stopPlayingWhenTextChanges"
            }
        },
        modelRelay: {
            source: "text",
            target: "showUI",
            backward: "never",
            namespace: "showUIControl",
            singleTransform: {
                type: "fluid.transforms.stringToBoolean"
            }
        },
        invokers: {
            getSelectedText: "fluid.orator.selectionReader.getSelectedText",
            play: {
                changePath: "play",
                value: true,
                source: "playMethod"
            },
            stop: {
                changePath: "play",
                value: false,
                source: "stopMethod"
            }
        }
    });

    fluid.orator.selectionReader.bindSelectionEvents = function (that) {
        $(document).on("selectionchange", that.events.onSelectionChanged.fire);
    };

    fluid.orator.selectionReader.getSelectedText = function () {
        return window.getSelection().toString();
    };

    fluid.orator.selectionReader.location = {
        TOP: 0,
        RIGHT: 1,
        BOTTOM: 2,
        LEFT: 3
    };

    /**
     * Returns a position object containing coordinates for absolutely positioning the play button
     * relative to a passed in rect. By default it will be placed above the rect unless there is a collision with the
     * top of the window. In which case it will be placed below. This will be captured in the "location" propertied,
     * and is specified by a constant (See: fluid.orator.selectionReader.location).
     *
     * In addition to collision detection wth the top of the window, collision detection for the left and right edges of
     * the window are also taken into account. However, the position will not be flipped, but will be translated
     * slightly to ensure that the item being placed is displayed on screen. These calculations are facilitated through
     * an offsetScale object passed in.
     *
     * @param {Object} rect - A DOMRect object, used to calculate placement against. Specifically the "top", "bottom",
     *                        and "left" properties may be used for positioning.
     * @param {Float} fontSize - the base font to multiple the offset against
     * @param {Object} offsetScale - (Optional) an object containing specified offsets: "edge" and "pointer". The "edge"
     *                               offset refers to the minimum distance between the button and the window edges. The
     *                               "pointer" offset refers to the distance between the button and the coordinates the
     *                               DOMRect refers too. This is provides space for an arrow to point from the button.
     *                               Offsets all default to 1.
     * @param {Object} wndw - (Optional) Mainly this is provided for testing to allow mocking of the Window's scroll
     *                        offsets.
     *
     * @return {Object} - An object containing the coordinates for positioning the play button.
     *                    It takes the form {top: Float, left: Float, location: Integer}
     *                    For location constants see: fluid.orator.selectionReader.location
     */
    fluid.orator.selectionReader.calculatePosition = function (rect, fontSize, offsetScale, wndw) {
        var position = {};
        var edgeOffset = fontSize * (fluid.get(offsetScale, "edge") || 1);
        var pointerOffset = fontSize * (fluid.get(offsetScale, "pointer") || 1);
        wndw = wndw || window;

        if (rect.top < edgeOffset) {
            position.top = rect.bottom + wndw.pageYOffset;
            position.location = fluid.orator.selectionReader.location.BOTTOM;
        } else {
            position.top = rect.top + wndw.pageYOffset - pointerOffset;
            position.location = fluid.orator.selectionReader.location.TOP;
        }

        position.left = Math.min(
            Math.max(rect.left + wndw.pageXOffset, edgeOffset + wndw.pageXOffset),
            (document.documentElement.clientWidth + wndw.pageXOffset - edgeOffset)
        );

        return position;
    };

    fluid.orator.selectionReader.renderPlayButton = function (that, state) {
        if (state) {
            var selectionRange = window.getSelection().getRangeAt(0);
            var rect = selectionRange.getClientRects()[0];
            var fontSize = parseFloat(that.container.css("font-size"));
            var position = fluid.orator.selectionReader.calculatePosition(rect, fontSize, that.options.offsetScale);
            var playMarkup = fluid.stringTemplate(that.options.markup.playButton, that.options.strings);
            var playButton = $(playMarkup);

            playButton.css({
                top:  position.top,
                left: position.left
            });
            var positionClass = that.options.styles[position.location === fluid.orator.selectionReader.location.TOP ? "above" : "below"];
            playButton.addClass(positionClass);
            playButton.click(that.play);
            playButton.appendTo(that.container);

            // cleanup range
            selectionRange.detach();

        } else {
            that.locate("play").remove();
        }
    };

})(jQuery, fluid_3_0_0);
