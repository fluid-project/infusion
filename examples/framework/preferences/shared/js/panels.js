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

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    /**
     * These panels are subpanels shared by a number of the Preferences Framework demos.
     * Each demo only uses some of these panels, as specified in the demo's auxiliary schema.
     */

    /**
     * The "speak text" preference is a boolean, rendered as an on/off switch.
     */
    fluid.defaults("demo.panels.speak", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.speakText": {
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
    fluid.defaults("demo.panels.incSize", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.increaseSize": {
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
    fluid.defaults("demo.panels.vol", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.volume": {
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
        protoTree: {
            label: {messagekey: "volLabel"},
            multiplier: {messagekey: "volMultiplier"},
            vol: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            // the textfieldSlider uses an internal model path of 'value',
                            // so we must relate that to our model path
                            "volume": "value"
                        },
                        model: {
                            value: "{demo.panels.vol}.model.volume"
                        },
                        sourceApplier: "{demo.panels.vol}.applier",
                        range: "{demo.panels.vol}.options.range",
                        sliderOptions: "{demo.panels.vol}.options.sliderOptions"
                    }
                }
            }
        }
    });

    /**
     * The "words per minute" preference is a range, rendered as a slider.
     */
    fluid.defaults("demo.panels.wpm", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.wordsPerMinute": {
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
        protoTree: {
            label: {messagekey: "wpmLabel"},
            multiplier: {messagekey: "wpmMultiplier"},
            wpm: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            // the textfieldSlider uses an internal model path of 'value',
                            // so we must relate that to our model path
                            "wordsPerMin": "value"
                        },
                        model: {
                            value: "{demo.panels.wpm}.model.wordsPerMin"
                        },
                        sourceApplier: "{demo.panels.wpm}.applier",
                        range: "{demo.panels.wpm}.options.range",
                        sliderOptions: "{demo.panels.wpm}.options.sliderOptions"
                    }
                }
            }
        }
    });

    /**
     * The "cursor size" preference is a range, rendered as a slider.
     */
    fluid.defaults("demo.panels.cursor", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.cursorSize": {
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
        protoTree: {
            label: {messagekey: "cursorLabel"},
            multiplier: {messagekey: "cursorMultiplier"},
            cursor: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            // the textfieldSlider uses an internal model path of 'value',
                            // so we must relate that to our model path
                            "cursorMult": "value"
                        },
                        model: {
                            value: "{demo.panels.cursor}.model.cursorMult"
                        },
                        sourceApplier: "{demo.panels.cursor}.applier",
                        range: "{demo.panels.cursor}.options.range",
                        sliderOptions: "{demo.panels.cursor}.options.sliderOptions"
                    }
                }
            }
        }
    });

    /**
     * The "magnification factor" preference is a range, rendered as a slider.
     */
    fluid.defaults("demo.panels.magFactor", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.magnification": {
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
        protoTree: {
            label: {messagekey: "magFactorLabel"},
            multiplier: {messagekey: "magFactorMultiplier"},
            magFactor: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            // the textfieldSlider uses an internal model path of 'value',
                            // so we must relate that to our model path
                            "mag": "value"
                        },
                        model: {
                            value: "{demo.panels.magFactor}.model.mag"
                        },
                        sourceApplier: "{demo.panels.magFactor}.applier",
                        range: "{demo.panels.magFactor}.options.range",
                        sliderOptions: "{demo.panels.magFactor}.options.sliderOptions"
                    }
                }
            }
        }
    });

    /**
     * The "magnifier position" preference is an enumeration, rendered as a set of radio buttons.
     */
    fluid.defaults("demo.panels.magPos", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        rendererOptions: {
            debugMode: true
        },
        preferenceMap: {
            "demo.magnifierPosition": {
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
