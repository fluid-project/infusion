/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    /**
     * These panels are subpanels shared by a number of the Preferences Framework examples.
     * Each example only uses some of these panels, as specified in the example's auxiliary schema.
     */

    /**
     * The "speak text" preference is a boolean, rendered as an on/off switch.
     */
    fluid.defaults("example.panels.speak", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "example.speakText": {
                "model.speakText": "default"
            }
        },
        selectors: {
            bool: ".mpe-speakText",
            choiceLabel: ".mpe-speakText-choice-label"
        },
        protoTree: {
            choiceLabel: {messagekey: "speakText"},
            bool: "${speakText}"
        }
    });

    /**
     * The "increase size" preference is a boolean, rendered as an on/off switch.
     */
    fluid.defaults("example.panels.incSize", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "example.increaseSize": {
                "model.incSize": "default"
            }
        },
        selectors: {
            bool: ".mpe-incSize",
            label: ".mpe-incSize-label",
            choiceLabel: ".mpe-incSize-choice-label"
        },
        protoTree: {
            choiceLabel: {messagekey: "incSize"},
            bool: "${incSize}"
        }
    });

    /**
     * The "volume" preference is a range, rendered as a slider.
     */
    fluid.defaults("example.panels.vol", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "example.volume": {
                "model.volume": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        selectors: {
            label: ".mpe-slider-label",
            vol: ".mpe-slider",
            multiplier: ".mpe-slider-multiplier"
        },
        selectorsToIgnore: ["vol"],
        components: {
            vol: {
                type: "fluid.textfieldSlider",
                container: "{that}.dom.vol",
                createOnEvent: "onDomBind",
                options: {
                    model: {
                        value: "{example.panels.vol}.model.volume"
                    },
                    range: "{example.panels.vol}.options.range",
                    sliderOptions: "{example.panels.vol}.options.sliderOptions"
                }
            }
        },
        protoTree: {
            label: {messagekey: "volLabel"},
            multiplier: {messagekey: "volMultiplier"}
        }
    });

    /**
     * The "words per minute" preference is a range, rendered as a slider.
     */
    fluid.defaults("example.panels.wpm", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "example.wordsPerMinute": {
                "model.wordsPerMin": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        selectors: {
            label: ".mpe-slider-label",
            wpm: ".mpe-slider",
            multiplier: ".mpe-slider-multiplier"
        },
        selectorsToIgnore: ["wpm"],
        components: {
            wpm: {
                type: "fluid.textfieldSlider",
                container: "{that}.dom.wpm",
                createOnEvent: "afterRender",
                options: {
                    model: {
                        value: "{example.panels.wpm}.model.wordsPerMin"
                    },
                    range: "{example.panels.wpm}.options.range",
                    sliderOptions: "{example.panels.wpm}.options.sliderOptions"
                }
            }
        },
        protoTree: {
            label: {messagekey: "wpmLabel"},
            multiplier: {messagekey: "wpmMultiplier"}
        }
    });

    /**
     * The "cursor size" preference is a range, rendered as a slider.
     */
    fluid.defaults("example.panels.cursor", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "example.cursorSize": {
                "model.cursorMult": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        selectors: {
            label: ".mpe-slider-label",
            cursor: ".mpe-slider",
            multiplier: ".mpe-slider-multiplier"
        },
        selectorsToIgnore: ["cursor"],
        components: {
            cursor: {
                type: "fluid.textfieldSlider",
                container: "{that}.dom.cursor",
                createOnEvent: "onDomBind",
                options: {
                    model: {
                        value: "{example.panels.cursor}.model.cursorMult"
                    },
                    range: "{example.panels.cursor}.options.range",
                    sliderOptions: "{example.panels.cursor}.options.sliderOptions"
                }
            }
        },
        protoTree: {
            label: {messagekey: "cursorLabel"},
            multiplier: {messagekey: "cursorMultiplier"}
        }
    });

    /**
     * The "magnification factor" preference is a range, rendered as a slider.
     */
    fluid.defaults("example.panels.magFactor", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "example.magnification": {
                "model.mag": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        selectors: {
            label: ".mpe-slider-label",
            magFactor: ".mpe-slider",
            multiplier: ".mpe-slider-multiplier"
        },
        selectorsToIgnore: ["magFactor"],
        components: {
            magFactor: {
                type: "fluid.textfieldSlider",
                container: "{that}.dom.magFactor",
                createOnEvent: "onDomBind",
                options: {
                    model: {
                        value: "{example.panels.magFactor}.model.mag"
                    },
                    range: "{example.panels.magFactor}.options.range",
                    sliderOptions: "{example.panels.magFactor}.options.sliderOptions"
                }
            }
        },
        protoTree: {
            label: {messagekey: "magFactorLabel"},
            multiplier: {messagekey: "magFactorMultiplier"}
        }
    });

    /**
     * The "magnifier position" preference is an enumeration, rendered as a set of radio buttons.
     */
    fluid.defaults("example.panels.magPos", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        rendererOptions: {
            debugMode: true
        },
        preferenceMap: {
            "example.magnifierPosition": {
                "model.magPos": "default",
                "controlValues.magPos": "enum"
            }
        },
        selectors: {
            label: ".mpe-radio-label",
            magPosRow: ".mpe-radioRow",
            magPosLabel: ".mpe-radioLabel",
            magPosInput: ".mpe-radioInput"
        },
        stringArrayIndex: {
            magPos: ["magPos-centre", "magPos-left", "magPos-right", "magPos-top", "magPos-bottom"]
        },
        repeatingSelectors: ["magPosRow"],
        protoTree: {
            label: {messagekey: "magPosLabel"},
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "magPosRow",
                labelID: "magPosLabel",
                inputID: "magPosInput",
                selectID: "magnifierPosition",
                tree: {
                    optionnames: "${{that}.msgLookup.magPos}",
                    optionlist: "${{that}.options.controlValues.magPos}",
                    selection: "${magPos}"
                }
            }
        }
    });

})(jQuery, fluid);
