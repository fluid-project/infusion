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
        styles: {
            simplified: "fl-uiOptins-content-simplified"
        },
        model: {
            value: false
        },
        events: {
            settingChanged: null
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
        var contentContainer = that.container.find(that.options.selectors.content);
        var simplified = contentContainer.hasClass(that.options.styles.simplified);
        
        if (!that.initialContent || !that.article) {
            that.initialContent = contentContainer.html();
            var articleDom = contentContainer.find("article").clone();
            $("aside", articleDom).remove();
            $("img", articleDom).css("float", "none");
            $("figure", articleDom).css("float", "none");
            var article = articleDom.html();
            that.article = article ? article : that.initialContent;
            that.origBg = $("body").css("background-image");
        }
        
        if (value) {
            if (!simplified) {
                $("body").css("background-image", "none");
                contentContainer.html(that.article);
                contentContainer.addClass(that.options.styles.simplified);
                that.events.settingChanged.fire();
            }
        } else {
            if (simplified) {
                $("body").css("background-image", that.origBg);
                contentContainer.html(that.initialContent);
                contentContainer.removeClass(that.options.styles.simplified);
                that.events.settingChanged.fire();
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
            simplifiedContent: {
                type: "fluid.uiOptions.actionAnts.simplifiedContentEnactor",
                container: "{uiEnhancer}.container",
                createOnEvent: "onCreateSimplifiedContent",
                options: {
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                         "simplifiedContent": "value"
                    }
                }
            },
            selfVoicingEnactor: {
                type: "fluid.uiOptions.actionAnts.selfVoicingEnactor",
                options: {
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "selfVoicing": "value"
                    }
                }
            }
        },
        events: {
            onCreateSimplifiedContent: null
        }
    });
    fluid.uiEnhancer.extraActions.finalInit = function (that) {
        $(document).ready(function () {
            that.events.onCreateSimplifiedContent.fire();
        });
    };

})(jQuery, fluid_1_5);
