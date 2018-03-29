/*
Copyright 2009 University of Toronto
Copyright 2016 OCAD University
Copyright 2016 Raising the Floor - International

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

    fluid.defaults("demo.banquet.intro", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            intro: ".demo-intro"
        },
        protoTree: {
            "intro": {messagekey: "intro"}
        }
    });

    fluid.defaults("demo.banquet.locations", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            "location-label": ".demo-location-label",
            "locations": ".demo-location-list"
        },
        model: {
            location: ""
        },
        protoTree: {
            "location-label": {messagekey: "locationLabel"},
            locations: {
                optionnames: "${{that}.options.locations.names}",
                optionlist: "${{that}.options.locations.codes}",
                selection: "${location}"
            }
        }
    });

    fluid.defaults("demo.banquet.wines", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            "wine-label": ".demo-wine-list-label",
            "wine-row": ".demo-wine-list",
            "wine": ".demo-wine-selection",
            "wine-name": ".demo-wine-name"
        },
        repeatingSelectors: ["wine-row"],
        model: {
            wine: ""
        },
        protoTree: {
            "wine-label": {messagekey: "winesLabel"},
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "wine-row",
                labelID: "wine-name",
                inputID: "wine",
                selectID: "wine-select",
                tree: {
                    optionnames: "${{that}.options.wineList.names}",
                    optionlist: "${{that}.options.wineList.codes}",
                    selection: "${wine}"
                }
            }
        }
    });

    fluid.defaults("demo.banquet.canapes", {
        gradeNames: ["fluid.rendererComponent"],
        selectors: {
            "canape-label": ".demo-canape-list-label",
            "canape-header": ".demo-canape-plate-header",
            "price-header": ".demo-canape-price-header",
            "choose-header": ".demo-canape-include-header",
            "canape-row": ".demo-canapes",
            "canape": ".demo-canape-selection",
            "canape-name": ".demo-canape-name",
            "canape-price": ".demo-canape-price"
        },
        repeatingSelectors: ["canape-row"],
        model: {
            canapes: []
        },
        invokers: {
            produceTree: {
                funcName: "demo.banquet.canapes.produceTree",
                args: ["{that}.options.strings", "{that}.options.canapeList.names", "{that}.options.canapeList.codes", "{that}.options.canapeList.prices"]
            }
        },
        rendererFnOptions: {
            noexpand: true
        }
    });

    /*
     * Build a component subtree that describes how to render the list of canape plates. This uses
     * the framework's transform() function to build a subtree element for each data item. This
     * method is similar to the "fluid.renderer.selection.inputs" renderer component tree expander,
     * but because these inputs are embedded in <table> cells with other data, each 'row' has more
     * children than a typical input.
     * By using 'valuebinding' in conjunction with the 'autobind: true' option, when the user
     * selects canapes, the new values will be automatically updated in the model.
     */
    demo.banquet.canapes.produceTree = function (strings, names, codes, prices) {
        var treeChildren =  [
            {ID: "canape-label", value: strings.foodsLabel},
            {ID: "canape-header", value: strings.plate},
            {ID: "price-header", value: strings.price},
            {ID: "choose-header", value: strings.include},
            {ID: "canapes", optionlist: {value: codes},
                          optionnames: {value: names},
                          selection: {valuebinding: "canapes"}
            }
        ];
        var canapeRows = fluid.transform(codes, function (opt, index) {
            return {
                ID: "canape-row:",
                children: [
                    {ID: "canape", parentRelativeID: "..::canapes", choiceindex: index},
                    {ID: "canape-name", parentRelativeID: "..::canapes", choiceindex: index},
                    {ID: "canape-price", value: prices[index]}
                ]
            };
        });
        return {children: treeChildren.concat(canapeRows)};
    };

    fluid.defaults("demo.banquet.form", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            "render": ".demo-banquet-form-renderButton",
            "modelView": ".demo-banquet-form-modelView",
            "locations": ".demo-location-block",
            "wines": ".demo-wine-block",
            "canapes": ".demo-canape-block",
            "intro": ".demo-intro-block"
        },
        model: {
            location: "",
            wine: "",
            canapes: []
        },
        events: {
            onRender: null
        },
        listeners: {
            "onCreate.bindEvent": {
                "this": "{that}.dom.render",
                method: "on",
                args: ["click", "{that}.render"]
            },
            "onCreate.outputData": "{that}.outputData"
        },
        modelListeners: {
            "": "{that}.outputData"
        },
        invokers: {
            render: "{that}.events.onRender.fire",
            outputData: {
                funcName: "demo.banquet.form.outputData",
                args: ["{that}.model", "{that}.dom.modelView"]
            }
        },
        components: {
            introduction: {
                type: "demo.banquet.intro",
                container: "{that}.dom.intro"
            },
            locations: {
                type: "demo.banquet.locations",
                container: "{that}.dom.locations",
                options: {
                    model: {
                        location: "{demo.banquet.form}.model.location"
                    }
                }
            },
            wines: {
                type: "demo.banquet.wines",
                container: "{that}.dom.wines",
                options: {
                    gradeNames: ["demo.banquet.connectToForm"],
                    model: {
                        wine: "{demo.banquet.form}.model.wine"
                    }
                }
            },
            canapes: {
                type: "demo.banquet.canapes",
                container: "{that}.dom.canapes",
                options: {
                    gradeNames: ["demo.banquet.connectToForm"],
                    model: {
                        canapes: "{demo.banquet.form}.model.canapes"
                    }
                }
            }
        },
        distributeOptions: [{
            record: {
                listeners: {
                    "{demo.banquet.form}.events.onRender": "{fluid.rendererComponent}.refreshView"
                },
                strings: "{demo.banquet.form}.options.strings"
            },
            target: "{that > fluid.rendererComponent}.options"
        }, {
            source: "{that}.options.locations",
            target: "{that locations}.options.locations"
        }, {
            source: "{that}.options.wineList",
            target: "{that wines}.options.wineList"
        }, {
            source: "{that}.options.canapeList",
            target: "{that canapes}.options.canapeList"
        }]
    });

    demo.banquet.form.outputData = function (model, modelView) {
        modelView.text(JSON.stringify(model, null, 4));
    };
})();
