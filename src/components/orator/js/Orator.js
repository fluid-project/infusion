/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

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
            enabled: true,
            play: false
        },
        components: {
            tts: {
                type: "fluid.textToSpeech"
            },
            controller: {
                type: "fluid.orator.controller",
                options: {
                    parentContainer: "{orator}.container",
                    model: {
                        playing: "{orator}.model.play",
                        enabled: "{orator}.model.enabled"
                    }
                }
            },
            selectionReader: {
                type: "fluid.orator.selectionReader",
                container: "{that}.container",
                options: {
                    model: {
                        enabled: "{orator}.model.enabled"
                    }
                }
            },
            domReader: {
                type: "fluid.orator.domReader",
                container: "{that}.dom.content",
                options: {
                    model: {
                        tts: {
                            enabled: "{orator}.model.enabled"
                        }
                    },
                    listeners: {
                        "utteranceOnEnd.domReaderStop": {
                            changePath: "{orator}.model.play",
                            value: false,
                            source: "domReader.utteranceOnEnd",
                            priority: "after:removeHighlight"
                        }
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
        modelListeners: {
            "enabled": {
                listener: "{tts}.cancel",
                namespace: "orator.clearSpeech"
            }
        },
        distributeOptions: [{
            source: "{that}.options.tts",
            target: "{that tts}.options",
            removeSource: true,
            namespace: "ttsOpts"
        }, {
            source: "{that}.options.controller",
            target: "{that controller}.options",
            removeSource: true,
            namespace: "controllerOpts"
        }, {
            source: "{that}.options.domReader",
            target: "{that domReader}.options",
            removeSource: true,
            namespace: "domReaderOpts"
        }, {
            source: "{that}.options.selectionReader",
            target: "{that selectionReader}.options",
            removeSource: true,
            namespace: "selectionReaderOpts"
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
        gradeNames: ["fluid.containerRenderingView"],
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
            playing: false,
            enabled: true
        },
        injectionType: "prepend",
        markup: {
            container: "<div class=\"flc-orator-controller fl-orator-controller\">" +
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
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        },
        listeners: {
            "onCreate.bindClick": {
                listener: "fluid.orator.controller.bindClick",
                args: ["{that}"]
            }
        },
        modelListeners: {
            "playing": {
                listener: "fluid.orator.controller.setToggleView",
                args: ["{that}", "{change}.value"]
            },
            "enabled": {
                "this": "{that}.container",
                method: "toggle",
                args: ["{change}.value"],
                namespace: "toggleView"
            }
        }
    });

    /**
     * Binds the click event for the "playToggle" element to trigger the `that.toggle` method.
     * This is not bound declaratively to ensure that the correct arguments are passed along to the `that.toggle`
     * method.
     *
     * @param {Component} that - an instance of `fluid.orator.controller`
     */
    fluid.orator.controller.bindClick = function (that) {
        that.locate("playToggle").click(function () {
            that.toggle("playing");
        });
    };

    /**
     * Used to toggle the state of a model value at a specified path. The new state will be the inverse of the current
     * boolean value at the specified model path, or can be set explicitly by passing in a 'state' value. It's likely
     * that this method will be used in conjunction with a click handler. In that case it's most likely that the state
     * will be toggling the existing model value.
     *
     * @param {Component} that - an instance of `fluid.orator.controller`
     * @param {String|Array} path - the path, into the model, for the value to toggle
     * @param {Boolean} state - (optional) explicit state to set the model value to
     */
    fluid.orator.controller.toggleState = function (that, path, state) {
        var newState = fluid.isValue(state) ? state : !fluid.get(that.model, path);
        // the !! ensures that the newState is a boolean value.
        that.applier.change(path, !!newState, "ADD", "toggleState");
    };

    /**
     * Sets the view state of the toggle controller.
     * True - play style added
     *      - aria-label set to the `pause` string
     * False - play style removed
     *       - aria-label set to the `play` string
     *
     * @param {Component} that - an instance of `fluid.orator.controller`
     * @param {Boolean} state - the state to set the controller to
     */
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
            onQueueSpeech: null,
            onReadFromDOM: null,
            utteranceOnEnd: null,
            utteranceOnBoundary: null,
            utteranceOnError: null,
            utteranceOnMark: null,
            utteranceOnPause: null,
            utteranceOnResume: null,
            utteranceOnStart: null
        },
        utteranceEventMap: {
            onboundary: "utteranceOnBoundary",
            onend: "utteranceOnEnd",
            onerror: "utteranceOnError",
            onmark:"utteranceOnMark",
            onpause: "utteranceOnPause",
            onresume: "utteranceOnResume",
            onstart: "utteranceOnStart"
        },
        model: {
            tts: {
                paused: false,
                speaking: false,
                enabled: true
            },
            parseQueueLength: 0,
            parseIndex: null,
            ttsBoundary: null
        },
        modelRelay: [{
            target: "parseIndex",
            backward: "never",
            namespace: "getClosestIndex",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "fluid.orator.domReader.getClosestIndex",
                args: ["{that}", "{that}.model.ttsBoundary"]
            }
        }],
        members: {
            parseQueue: [],
            range: {
                expander: {
                    this: "document",
                    method: "createRange"
                }
            }
        },
        components: {
            parser: {
                type: "fluid.textNodeParser",
                options: {
                    invokers: {
                        hasTextToRead: "fluid.textNodeParser.hasVisibleText"
                    },
                    listeners: {
                        "onParsedTextNode.addToParseQueue": "{domReader}.addToParseQueue"
                    }
                }
            }
        },
        invokers: {
            parsedToString: "fluid.orator.domReader.parsedToString",
            readFromDOM: {
                funcName: "fluid.orator.domReader.readFromDOM",
                args: ["{that}", "{that}.container"]
            },
            removeHighlight: {
                funcName: "fluid.orator.domReader.unWrap",
                args: ["{that}.dom.highlight"]
            },
            addToParseQueue: {
                funcName: "fluid.orator.domReader.addToParseQueue",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
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
                funcName: "fluid.orator.domReader.play",
                args: ["{that}", "{fluid.textToSpeech}.resume"]
            },
            pause: {
                funcName: "fluid.orator.domReader.pause",
                args: ["{that}", "{fluid.textToSpeech}.pause"]
            },
            queueSpeech: {
                funcName: "fluid.orator.domReader.queueSpeech",
                args: ["{that}", "{arguments}.0", true, "{arguments}.1"]
            },
            isWord: "fluid.textNodeParser.isWord"
        },
        modelListeners: {
            "highlight": {
                listener: "{that}.highlight",
                path: ["parseIndex", "parseQueueLength"]
            }
        },
        listeners: {
            "onQueueSpeech.removeExtraWhiteSpace": "fluid.orator.domReader.removeExtraWhiteSpace",
            "onQueueSpeech.queueSpeech": {
                func: "{fluid.textToSpeech}.queueSpeech",
                args: ["{arguments}.0", "{arguments}.1.interrupt", "{arguments}.1"],
                priority: "after:removeExtraWhiteSpace"
            },
            "utteranceOnEnd.resetParseQueue": {
                listener: "{that}.resetParseQueue"
            },
            "utteranceOnEnd.removeHighlight": {
                listener: "{that}.removeHighlight",
                priority: "after:resetParseQueue"
            },
            "utteranceOnEnd.updateTTSModel": {
                changePath: "tts",
                value: {
                    speaking: false,
                    paused: false
                }
            },
            "utteranceOnStart.updateTTSModel": {
                changePath: "tts",
                value: {
                    speaking: true,
                    paused: false
                }
            },
            "utteranceOnPause.updateTTSModel": {
                changePath: "tts",
                value: {
                    speaking: true,
                    paused: true
                }
            },
            "utteranceOnResume.updateTTSModel": {
                changePath: "tts",
                value: {
                    speaking: true,
                    paused: false
                }
            },
            "utteranceOnBoundary.setCurrentBoundary": {
                changePath: "ttsBoundary",
                value: "{arguments}.0.charIndex",
                source: "utteranceOnBoundary"
            },
            "onDestroy.detachRange": {
                "this": "{that}.range",
                method: "detach"
            }
        }
    });

    fluid.orator.domReader.play = function (that, resumeFn) {
        if (that.model.tts.enabled) {
            if (that.model.tts.paused) {
                resumeFn();
            } else if (!that.model.tts.speaking) {
                that.readFromDOM();
            }
        }
    };

    fluid.orator.domReader.pause = function (that, pauseFn) {
        if (that.model.tts.speaking && !that.model.tts.paused) {
            pauseFn();
        }
    };

    fluid.orator.domReader.mapUtteranceEvents = function (that, utterance, utteranceEventMap) {
        fluid.each(utteranceEventMap, function (compEventName, utteranceEvent) {
            var compEvent = that.events[compEventName];
            utterance[utteranceEvent] = compEvent.fire;
        });
    };

    fluid.orator.domReader.removeExtraWhiteSpace = function (text) {
        var promise = fluid.promise();
        // force a string value
        var str = text.toString();
        // trim whitespace
        str = str.trim();

        if (str) {
            promise.resolve(str);
        } else {
            promise.reject("The text is empty");
        }

        return promise;
    };

    /**
     * Operates the core "transforming promise workflow" for queuing an utterance. The initial listener is provided the
     * initial text; which then proceeds through the transform chain to arrive at the final text.
     * To change the speech function (e.g for testing) the onQueueSpeech.queueSpeech listener can be overridden.
     *
     * @param {Component} that - an instance of `fluid.orator.domReader`
     * @param {String} text - The text to be synthesized
     * @param {Boolean} interrupt - Used to indicate if this text should be queued or replace existing utterances.
     *                              This will be passed along to the listeners in the options; `options.interrupt`.
     * @param {Object} options - (optional) options to configure the utterance with. This will also be interpolated with
     *                           the interrupt parameter and event mappings. See: fluid.textToSpeech.queueSpeech in
     *                           TextToSpeech.js for an example of utterance options for that speech function.
     *
     * @return {Promise} - A promise for the final resolved text
     */
    fluid.orator.domReader.queueSpeech = function (that, text, interrupt, options) {
        options = options || {};
        options.interrupt = interrupt || options.interrupt;
        // map events
        fluid.orator.domReader.mapUtteranceEvents(that, options, that.options.utteranceEventMap);

        return fluid.promise.fireTransformEvent(that.events.onQueueSpeech, text, options);
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
     * Positional information about a word parsed from the text in a {DomElement}. This can be used for mappings between
     * a synthesizer's speech boundary and the word's location within the DOM.
     *
     * @typedef {Object} DomWordMap
     * @property {Integer} blockIndex - The index into the entire block of text being parsed from the DOM
     * @property {Integer} startOffset - The start offset of the current `word` relative to the closest
     *                                   enclosing DOM element
     * @property {Integer} endOffset - The end offset of the current `word` relative to the closest
     *                                 enclosing DOM element
     * @property {DomNode} node - The current child node being parsed
     * @property {Integer} childIndex - The index of the child node being parsed relative to its parent
     * @property {DomElement} parentNode - The parent DOM node
     * @property {String} word - The text, `word`, parsed from the node. It may contain only whitespace.
     */

    /**
     * Takes in a textnode and separates the contained words into DomWordMaps that are added to the parseQueue.
     * Typically this handles parsed data passed along by a Parser's (`fluid.textNodeParser`) `onParsedTextNode` event.
     * Empty nodes are skipped and the subsequent text is analyzed to determine if it should be appended to the
     * previous DomWordMap in the parseQueue. For example: when the syllabification separator is tag is inserted
     * between words.
     *
     * @param {Component} that - an instance of `fluid.orator.domReader`
     * @param {DomNode} textNode - the text node being parsed
     * @param {String} lang - a valid BCP 47 language code.
     * @param {Integer} childIndex - the index of the text node within its parent's set of child nodes
     */
    fluid.orator.domReader.addToParseQueue = function (that, textNode, lang, childIndex) {
        var lastParsed = that.parseQueue[that.parseQueue.length - 1] || {};
        var words = textNode.textContent.split(/(\s+)/); // split on whitespace, and capture whitespace
        var parsed = {
            blockIndex: (lastParsed.blockIndex || 0) + (fluid.get(lastParsed, ["word", "length"]) || 0),
            startOffset: 0,
            node: textNode,
            childIndex: childIndex,
            parentNode: textNode.parentNode,
            lang: lang
        };

        fluid.each(words, function (word) {
            var lastIsWord = that.isWord(lastParsed.word);
            var currentIsWord = that.isWord(word);

            // If the last parsed item is a word and the current item is a word, combine into the the last parsed block.
            // Otherwise, if the new item is a word or non-empty string create a new parsed block.
            if (lastIsWord && currentIsWord) {
                lastParsed.word += word;
                lastParsed.endOffset += word.length;
                parsed.blockIndex += word.length;
                parsed.startOffset += word.length;
            } else {
                parsed.word = word;
                parsed.endOffset = parsed.startOffset + word.length;
                if (currentIsWord || word && lastIsWord) {
                    lastParsed = fluid.copy(parsed);
                    that.parseQueue.push(lastParsed);
                    that.applier.change("parseQueueLength", that.parseQueue.length, "ADD", "addToParseQueue");
                    parsed.blockIndex += word.length;
                }
                parsed.startOffset = parsed.endOffset;
            }
        });
    };

    /**
     * Empty the parseQueue and related model values
     * @param {Component} that - an instance of `fluid.orator.domReader`
     */
    fluid.orator.domReader.resetParseQueue = function (that) {
        that.parseQueue = [];
        that.applier.change("", {
            parseQueueLength: 0,
            parseIndex: null,
            ttsBoundary: null
        }, "ADD", "resetParseQueue");
    };

    /**
     * Combines the parsed text into a String.
     *
     * @param {DomWordMap[]} parsed - An array of {DomWordMap} objects containing the position mappings from a parsed
     *                                {DomElement}.
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
     * @param {Component} that - an instance of `fluid.orator.domReader`
     * @param {String|jQuery|DomElement} elm - The DOM node to read
     */
    fluid.orator.domReader.readFromDOM = function (that, elm) {
        elm = $(elm);

        // only execute if there are nodes to read from
        if (elm.length) {
            that.resetParseQueue();
            that.parser.parse(elm[0]);
            that.queueSpeech(that.parsedToString(that.parseQueue));
        }
    };

    /**
     * Returns the index of the closest data point from the parseQueue based on the boundary provided.
     *
     * @param {Component} that - an instance of `fluid.orator.domReader`
     * @param {Integer} boundary - The boundary value used to compare against the blockIndex of the parsed data points.
     *                             If the boundary is undefined or out of bounds, `undefined` will be returned.
     *
     * @return {Integer|undefined} - Will return the index of the closest data point in the parseQueue. If the boundary
     *                               cannot be located within the parseQueue, `undefined` is returned.
     */
    fluid.orator.domReader.getClosestIndex = function (that, boundary) {
        var parseQueue = that.parseQueue;

        if (!parseQueue.length || !fluid.isValue(boundary)) {
            return undefined;
        };

        var maxIndex = Math.max(parseQueue.length - 1, 0);
        var index = Math.max(Math.min(that.model.parseIndex || 0, maxIndex), 0);
        var maxBoundary = parseQueue[maxIndex].blockIndex + parseQueue[maxIndex].word.length;

        if (boundary > maxBoundary || boundary < 0) {
            return undefined;
        }

        while (index >= 0) {
            var nextIndex = index + 1;
            var prevIndex = index - 1;
            var currentBlockIndex = parseQueue[index].blockIndex;
            var nextBlockIndex = index < maxIndex ? parseQueue[nextIndex].blockIndex : (maxBoundary + 1);

            // Break if the boundary lies within the current block
            if (boundary >= currentBlockIndex && boundary < nextBlockIndex) {
                break;
            }

            if (currentBlockIndex > boundary) {
                index = prevIndex;
            } else {
                index = nextIndex;
            }
        }

        return index;

    };

    /**
     * Searches down, starting from the provided node, returning the first text node found.
     *
     * @param  {DomNode} node - the DOM Node to start searching from.
     * @return {DomNode|Undefined} - Returns the first text node found, or `undefined` if none located.
     */
    fluid.orator.domReader.findTextNode = function (node) {
        if (!node) {
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            return node;
        }

        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
            var textNode = fluid.orator.domReader.findTextNode(children[i]);
            if (textNode !== undefined) {
                return textNode;
            }
        }
    };

    fluid.orator.domReader.getTextNodeFromSibling = function (node) {
        while (node.nextSibling) {
            node = node.nextSibling;
            var textNode = fluid.orator.domReader.findTextNode(node);
            if (textNode) {
                return textNode;
            }
        }
    };

    fluid.orator.domReader.getNextTextNode = function (node) {
        var nextTextNode = fluid.orator.domReader.getTextNodeFromSibling(node);

        if (nextTextNode) {
            return nextTextNode;
        }

        var parent = node.parentNode;

        if (parent) {
            return fluid.orator.domReader.getNextTextNode(parent);
        }
    };

    fluid.orator.domReader.setRangeEnd = function (range, node, end) {
        if (end <= node.length) {
            range.setEnd(node, end);
        } else {
            var nextTextNode = fluid.orator.domReader.getNextTextNode(node);
            fluid.orator.domReader.setRangeEnd(range, nextTextNode, end - node.length);
        }
    };

    /**
     * Highlights text from the parseQueue. Highlights are performed by wrapping the appropriate text in the markup
     * specified by `that.options.markup.highlight`.
     *
     * @param {Component} that - an instance of `fluid.orator.domReader`
     */
    fluid.orator.domReader.highlight = function (that) {
        that.removeHighlight();

        if (that.model.parseQueueLength && fluid.isValue(that.model.parseIndex)) {
            var data = that.parseQueue[that.model.parseIndex];
            var rangeNode = data.parentNode.childNodes[data.childIndex];

            that.range.selectNode(rangeNode);
            that.range.setStart(rangeNode, data.startOffset);
            fluid.orator.domReader.setRangeEnd (that.range, rangeNode, data.endOffset);
            that.range.surroundContents($(that.options.markup.highlight)[0]);
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
            control: ".flc-orator-selectionReader-control",
            controlLabel: ".flc-orator-selectionReader-controlLabel"
        },
        strings: {
            play: "play",
            stop: "stop"
        },
        styles: {
            above: "fl-orator-selectionReader-above",
            below: "fl-orator-selectionReader-below",
            control: "fl-orator-selectionReader-control"
        },
        markup: {
            control: "<button class=\"flc-orator-selectionReader-control\"><span class=\"fl-icon-orator\"></span><span class=\"flc-orator-selectionReader-controlLabel\"></span></button>"
        },
        model: {
            enabled: true,
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
            onSelectionChanged: null,
            utteranceOnEnd: null,
            onToggleControl: null
        },
        listeners: {
            "onCreate.bindEvents": {
                funcName: "fluid.orator.selectionReader.bindSelectionEvents",
                args: ["{that}"]
            },
            "onSelectionChanged.updateText": "{that}.getSelectedText",
            "utteranceOnEnd.stop": {
                changePath: "play",
                value: false,
                source: "stopMethod"
            },
            "onToggleControl.togglePlay": "{that}.toggle"
        },
        modelListeners: {
            "showUI": {
                funcName: "fluid.orator.selectionReader.renderControl",
                args: ["{that}", "{change}.value"],
                namespace: "render"
            },
            "text": {
                func: "{that}.stop",
                namespace: "stopPlayingWhenTextChanges"
            },
            "play": [{
                func: "fluid.orator.selectionReader.queueSpeech",
                args: ["{that}", "{change}.value", "{fluid.textToSpeech}.queueSpeech"],
                namespace: "queueSpeech"
            }, {
                func: "fluid.orator.selectionReader.renderControlState",
                args: ["{that}", "{that}.dom.control", "{arguments}.0"],
                namespace: "renderControlState"
            }],
            "enabled": {
                funcName: "fluid.orator.selectionReader.updateText",
                args: ["{that}", "{change}.value"],
                namespace: "updateText"
            }
        },
        modelRelay: [{
            source: "text",
            target: "showUI",
            backward: "never",
            namespace: "showUIControl",
            singleTransform: {
                type: "fluid.transforms.stringToBoolean"
            }
        }],
        invokers: {
            getSelectedText: {
                changePath: "text",
                value: {
                    expander: {
                        funcName: "fluid.orator.selectionReader.getSelectedText"
                    }
                },
                source: "getSelectedText"
            },
            play: {
                changePath: "play",
                value: true,
                source: "playMethod"
            },
            stop: {
                funcName: "fluid.orator.selectionReader.stopSpeech",
                args: ["{that}.model.play", "{fluid.textToSpeech}.cancel"]
            },
            toggle: {
                funcName: "fluid.orator.selectionReader.togglePlay",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    fluid.orator.selectionReader.stopSpeech = function (state, cancelFn) {
        if (state) {
            cancelFn();
        }
    };

    fluid.orator.selectionReader.queueSpeech = function (that, state, speechFn) {
        if (state) {
            speechFn(that.model.text, true, {onend: that.events.utteranceOnEnd.fire});
        }
    };

    fluid.orator.selectionReader.bindSelectionEvents = function (that) {
        $(document).on("selectionchange", function (e) {
            if (that.model.enabled) {
                that.events.onSelectionChanged.fire(e);
            }
        });
    };

    fluid.orator.selectionReader.updateText = function (that, state) {
        if (state) {
            that.getSelectedText();
        } else {
            that.applier.change("text", "", "ADD", "updateText");
        }
    };

    /**
     * Retrieves the text from the current selection
     *
     * @return {String} - the text from the current selection
     */
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


    fluid.orator.selectionReader.renderControlState = function (that, control) {
        var text = that.options.strings[that.model.play ? "stop" : "play"];
        control.find(that.options.selectors.controlLabel).text(text);
    };

    fluid.orator.selectionReader.renderControl = function (that, state) {
        if (state) {
            var selectionRange = window.getSelection().getRangeAt(0);
            var rect = selectionRange.getClientRects()[0];
            var fontSize = parseFloat(that.container.css("font-size"));
            var position = fluid.orator.selectionReader.calculatePosition(rect, fontSize, that.options.offsetScale);
            var control = $(that.options.markup.control);
            control.addClass(that.options.styles.control);
            fluid.orator.selectionReader.renderControlState(that, control);

            control.css({
                top:  position.top,
                left: position.left
            });

            var positionClass = that.options.styles[position.location === fluid.orator.selectionReader.location.TOP ? "above" : "below"];
            control.addClass(positionClass);
            control.click(function () {
                // wrapped in an empty function so as not to pass along the jQuery event object
                that.events.onToggleControl.fire();
            });
            control.appendTo(that.container);

            // cleanup range
            selectionRange.detach();

        } else {
            that.locate("control").remove();
        }
    };

    fluid.orator.selectionReader.togglePlay = function (that, state) {
        var newState = state || !that.model.play;
        that[newState ? "play" : "stop"]();
    };

})(jQuery, fluid_3_0_0);
