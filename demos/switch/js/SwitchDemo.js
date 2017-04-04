/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var demo = demo || {};

(function () {
    "use strict";

    fluid.defaults("demo.faces", {
        gradeNames: ["fluid.viewComponent"],
        strings: {
            on: "on",
            off: "off"
        },
        selectors: {
            panel: ".demo-faces-panel",
            text: ".demo-faces-text",
            face: ".demo-faces-face",
            switchUI: ".demo-faces-switch"
        },
        styles: {
            light: "demo-light"
        },
        faces: {
            primary: "😃",
            random: ["😆", "😋", "😝", "😲"]
        },
        members: {
            switchPoint: 0.5
        },
        model: {
            lightOn: false
        },
        invokers: {
            getFace: {
                funcName: "demo.faces.getFace",
                args: ["{that}.switchPoint", "{that}.options.faces"]
            },
            toggleLight: {
                funcName: "demo.faces.toggleLight",
                args: ["{that}", "{arguments}.0"]
            }
        },
        modelListeners: {
            lightOn: {
                listener: "{that}.toggleLight",
                args: ["{change}.value"]
            }
        },
        components: {
            switchUI: {
                type: "fluid.switchUI",
                container: "{that}.dom.switchUI",
                options: {
                    attrs: {
                        "aria-labelledby": "flc-switchUI-label",
                        "aria-controls": {
                            expander: {
                                funcName: "fluid.allocateSimpleId",
                                args: ["{demo.faces}.dom.panel"]
                            }
                        }
                    },
                    model: {
                        enabled: "{demo.faces}.model.lightOn"
                    }
                }
            }
        }
    });

    demo.faces.getFace = function (switchPoint, faces) {
        var rand = Math.random();

        if (rand >= switchPoint) {
            switchPoint += 0.05;
            var faceIdx = Math.floor(Math.random() * (faces.random.length));
            return faces.random[faceIdx];
        } else {
            return faces.primary;
        }
    };

    demo.faces.toggleLight = function (that, state) {
        that.locate("text").text(that.options.strings[state ? "on" : "off"]);
        that.locate("face").text(state ? that.getFace() : "");
        that.locate("panel").toggleClass(that.options.styles.light, state);
    };

})();
