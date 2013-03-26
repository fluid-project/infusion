/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    /***********************************************
     * UI Options Content Simplication
     ***********************************************/
     
    /**
     * A sub-component of fluid.uiOptions that renders the "content simplication" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.simplifiedContent", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: false
        },
        selectors: {
            simplifiedContent: ".flc-uiOptions-simplifiedContent"
        },
        protoTree: {
            simplifiedContent: "${value}"
        },
        resources: {
            template: {
                url: "../templates/UIOptionsTemplate-simplifiedContent.html"
            }
        }
    });

    /*****************************
     * UI Options Self Voicing
     *****************************/
    /**
     * A sub-component of fluid.uiOptions that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.selfVoicing", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: false
        },
        selectors: {
            selfVoicing: ".flc-uiOptions-selfVoicing"
        },
        protoTree: {
            selfVoicing: "${value}"
        },
        resources: {
            template: {
                url: "../templates/UIOptionsTemplate-selfVoicing.html"
            }
        }
    });

    /*******************************************************
     * The new grade with simplified content + self voicing
     *******************************************************/
    fluid.defaults("fluid.uiOptions.extraSettingsPanels", {
        gradeNames: ["fluid.uiOptions", "autoInit"],
        selectors: {
            simplifiedContent: ".flc-uiOptions-simplified-content",
            selfVoicing: ".flc-uiOptions-self-voicing"
        },
        components: {
            simplifiedContent: {
                type: "fluid.uiOptions.simplifiedContent",
                container: "{uiOptions}.dom.simplifiedContent",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    sourceApplier: "{uiOptions}.applier",
                    rules: {
                        "selections.simplifiedContent": "value"
                    },
                    listeners: {
                        "{uiOptions}.events.onUIOptionsRefresh": "{that}.refreshView"
                    },
                    resources: {
                        template: "{templateLoader}.resources.simplifiedContent"
                    }
                }
            },
            selfVoicing: {
                type: "fluid.uiOptions.selfVoicing",
                container: "{uiOptions}.dom.selfVoicing",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    sourceApplier: "{uiOptions}.applier",
                    rules: {
                        "selections.selfVoicing": "value"
                    },
                    listeners: {
                        "{uiOptions}.events.onUIOptionsRefresh": "{that}.refreshView"
                    },
                    resources: {
                        template: "{templateLoader}.resources.selfVoicing"
                    }
                }
            }
        }
    });

    /**********************************************************************************
     * simplifiedContentEnactor
     * 
     * Simplify content based upon the model value.
     **********************************************************************************/
    
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.simplifiedContentEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts", "autoInit"],
        selectors: {
            content: ".flc-uiOptions-content"
        },
        model: {
            value: false
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.simplifiedContentEnactor.set",
                args: ["{arguments}.0", "{that}"]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.set",
                args: ["{that}.model.value"]
            }
        }
    });
    
    fluid.uiOptions.actionAnts.simplifiedContentEnactor.set = function (value, that) {
        contentContainer = that.container.find(that.options.selectors.content);
        
        if (!that.initialContent || !that.article) {
            that.initialContent = contentContainer.html();
            $("aside", that.container).addClass("fl-hidden");
            var article = contentContainer.find("article").html();
            that.article = article ? article : that.initialContent;
        }
        
        if (value) {
            if (contentContainer.html() !== that.article) {
                contentContainer.html(that.article);
            }
        } else {
            if (contentContainer.html() !== that.initialContent) {
                contentContainer.html(that.initialContent);
            }
        }
    };

    fluid.uiOptions.actionAnts.simplifiedContentEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.set(newModel.value);
        });
    };
    
    /*******************************************************************************
     * UI Enhancer More Actions for new demo
     *
     * A grade component for UIEnhancer that contains simplifiedContent and selfVoicing
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer.extraActions", {
        gradeNames: ["fluid.uiEnhancer", "autoInit"],
        components: {
            simplifiedContentEnactor: {
                type: "fluid.uiOptions.actionAnts.simplifiedContentEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "simplifiedContent": "value"
                    }
                }
            }
        }
    });

})(jQuery, fluid_1_5);
