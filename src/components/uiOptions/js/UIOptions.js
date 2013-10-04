/*
Copyright 2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

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

    /*********************
     * UI Options Loader *
     *********************/

    /**
     * An UI Options top-level component that reflects the collaboration between uiOptions, templateLoader and messageLoader.
     * This component is the only UI Options component that is intended to be called by the outside world.
     *
     * @param {Object} options
     */
    fluid.defaults("fluid.prefs.prefsEditorLoader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            uiOptions: {
                priority: "last",
                type: "fluid.prefs",
                createOnEvent: "onCreateUIOptionsReady"
            },
            templateLoader: {
                type: "fluid.prefs.resourceLoader",
                options: {
                    events: {
                        onResourcesLoaded: "{prefsEditorLoader}.events.onUIOTemplatesLoaded"
                    }
                }
            },
            messageLoader: {
                type: "fluid.prefs.resourceLoader",
                options: {
                    events: {
                        onResourcesLoaded: "{prefsEditorLoader}.events.onUIOMessagesLoaded"
                    }
                }
            }
        },
        events: {
            onUIOTemplatesLoaded: null,
            onUIOMessagesLoaded: null,
            onMsgBundleReady: null,
            onCreateUIOptionsReady: {
                events: {
                    templateLoaded: "onUIOTemplatesLoaded",
                    msgBundleReady: "onMsgBundleReady"
                }
            }
        },
        listeners: {
            onUIOMessagesLoaded: {
                funcName: "fluid.prefs.prefsEditorLoader.createMsgBundle",
                args: ["{arguments}.0", "{that}"]
            }
        },
        distributeOptions: [{
            source: "{that}.options.templateLoader",
            removeSource: true,
            target: "{that > templateLoader}.options"
        }, {
            source: "{that}.options.messageLoader",
            removeSource: true,
            target: "{that > messageLoader}.options"
        }, {
            source: "{that}.options.templatePrefix",
            target: "{that > templateLoader > resourcePath}.options.value"
        }, {
            source: "{that}.options.messagePrefix",
            target: "{that > messageLoader > resourcePath}.options.value"
        }, {
            source: "{that}.options.uiOptions",
            removeSource: true,
            target: "{that > uiOptions}.options"
        }]
    });

    fluid.prefs.prefsEditorLoader.createMsgBundle = function (messageResources, that) {
        var completeMessage;
        fluid.each(messageResources, function (oneResource) {
            var message = JSON.parse(oneResource.resourceText);
            completeMessage = $.extend({}, completeMessage, message);
        });
        var parentResolver = fluid.messageResolver({messageBase: completeMessage});
        that.msgBundle = fluid.messageResolver({messageBase: {}, parents: [parentResolver]});
        that.events.onMsgBundleReady.fire();
    };

    // TODO: This mixin grade appears to be supplied manually by various test cases but no longer appears in 
    // the main configuration. We should remove the need for users to supply this - also the use of "defaultPanels" in fact
    // refers to "starter panels"
    fluid.defaults("fluid.prefs.transformDefaultPanelsOptions", {
        // Do not supply "fluid.prefs.inline" here, since when this is used as a mixin for separatedPanel, it ends up displacing the 
        // more refined type of the prefsEditorLoader
        gradeNames: ["fluid.viewComponent", "autoInit"],
        distributeOptions: [{
            source: "{that}.options.textSize",
            removeSource: true,
            target: "{that textSize}.options"
        }, {
            source: "{that}.options.lineSpace",
            removeSource: true,
            target: "{that lineSpace}.options"
        }, {
            source: "{that}.options.textFont",
            removeSource: true,
            target: "{that textFont}.options"
        }, {
            source: "{that}.options.contrast",
            removeSource: true,
            target: "{that contrast}.options"
        }, {
            source: "{that}.options.layoutControls",
            removeSource: true,
            target: "{that layoutControls}.options"
        }, {
            source: "{that}.options.linksControls",
            removeSource: true,
            target: "{that linksControls}.options"
        }]
    });

    /******************************
     * UI Options Template Loader *
     ******************************/

    /**
     * A configurable component that works in conjunction with or without the UI Options template path
     * component (fluid.prefsResourcePath) to allow users to set either the location of their own
     * templates or the templates that are relative to the path defined in the UI Options template path
     * component.
     *
     * @param {Object} options
     */

    fluid.defaults("fluid.prefs.resourceLoader", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "onCreate": {
                listener: "fluid.prefs.resourceLoader.loadTemplates",
                args: ["{that}", {expander: {func: "{that}.resolveTemplates"}}]
            }
        },
        templates: {},
        // Unsupported, non-API option
        components: {
            resourcePath: {
                type: "fluid.prefs.resourcePath"
            }
        },
        invokers: {
            transformURL: {
                funcName: "fluid.stringTemplate",
                args: [ "{arguments}.0", {"prefix/" : "{that}.resourcePath.options.value"} ]
            },
            resolveTemplates: {
                funcName: "fluid.prefs.resourceLoader.resolveTemplates",
                args: "{that}"
            }
        },
        events: {
            onResourcesLoaded: null
        }
    });

    fluid.prefs.resourceLoader.resolveTemplates = function (that) {
        var mapped = fluid.transform(that.options.templates, that.transformURL);

        return fluid.transform(mapped, function (url) {
            return {url: url, forceCache: true};
        });
    };

    fluid.prefs.resourceLoader.loadTemplates = function (that, resources) {
        delete resources.expander;   // A work-around for FLUID-5117
        fluid.fetchResources(resources, function () {
            that.resources = resources;
            that.events.onResourcesLoaded.fire(resources);
        });
    };

    /**************************************
     * UI Options Template Path Specifier *
     **************************************/

    /**
     * A configurable component that defines the relative path from the html to UI Options templates.
     *
     * @param {Object} options
     */

    fluid.defaults("fluid.prefs.resourcePath", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        value: "../html/"
    });

    /**************
     * UI Options *
     **************/

    fluid.defaults("fluid.prefs.settingsGetter", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            getSettings: "{settingsStore}.get"
        }
    });

    fluid.defaults("fluid.prefs.settingsSetter", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            setSettings: {
                funcName: "fluid.prefs.settingsSetter.setSettings",
                args: ["{arguments}.0", "{settingsStore}.set"]
            }
        }
    });

    fluid.prefs.settingsSetter.setSettings = function (model, set) {
        var userSettings = fluid.copy(model);
        set(userSettings);
    };

    fluid.defaults("fluid.prefs.uiEnhancerRelay", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        listeners: {
            onCreate: "{that}.addListener",
            onDestroy: "{that}.removeListener"
        },
        events: {
            updateEnhancerModel: "{fluid.prefs}.events.onUpdateEnhancerModel"
        },
        invokers: {
            addListener: {
                funcName: "fluid.prefs.uiEnhancerRelay.addListener",
                args: ["{that}.events.updateEnhancerModel", "{that}.updateEnhancerModel"]
            },
            removeListener: {
                funcName: "fluid.prefs.uiEnhancerRelay.removeListener",
                args: ["{that}.events.updateEnhancerModel", "{that}.updateEnhancerModel"]
            },
            updateEnhancerModel: {
                funcName: "fluid.prefs.uiEnhancerRelay.updateEnhancerModel",
                args: ["{uiEnhancer}", "{fluid.prefs}.model"]
            }
        }
    });

    fluid.prefs.uiEnhancerRelay.addListener = function (modelChanged, listener) {
        modelChanged.addListener(listener);
    };

    fluid.prefs.uiEnhancerRelay.removeListener = function (modelChanged, listener) {
        modelChanged.removeListener(listener);
    };

    fluid.prefs.uiEnhancerRelay.updateEnhancerModel = function (uiEnhancer, newModel) {
        uiEnhancer.updateModel(newModel);
    };

    /**
     * A component that works in conjunction with the UI Enhancer component and the Fluid Skinning System (FSS)
     * to allow users to set personal user interface preferences. The UI Options component provides a user
     * interface for setting and saving personal preferences, and the UI Enhancer component carries out the
     * work of applying those preferences to the user interface.
     *
     * @param {Object} container
     * @param {Object} options
     */
    fluid.defaults("fluid.prefs", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.settingsGetter", "fluid.prefs.settingsSetter", "fluid.prefs.rootModel", "autoInit"],
        invokers: {
            /**
             * Updates the change applier and fires modelChanged on subcomponent fluid.prefs.controls
             *
             * @param {Object} newModel
             * @param {Object} source
             */
            updateModel: {
                funcName: "fluid.fireSourcedChange",
                args: ["{that}.applier", "", "{arguments}.0", "{arguments}.1"]
            },
            fetch: {
                funcName: "fluid.prefs.fetch",
                args: ["{that}"]
            },
            applyChanges: {
                funcName: "fluid.prefs.applyChanges",
                args: ["{that}"]
            },
            save: {
                funcName: "fluid.prefs.save",
                args: ["{that}"]
            },
            saveAndApply: {
                funcName: "fluid.prefs.saveAndApply",
                args: ["{that}"]
            },
            reset: {
                funcName: "fluid.prefs.reset",
                args: ["{that}"]
            },
            cancel: {
                funcName: "fluid.prefs.cancel",
                args: ["{that}"]
            }
        },
        selectors: {
            cancel: ".flc-uiOptions-cancel",
            reset: ".flc-uiOptions-reset",
            save: ".flc-uiOptions-save",
            previewFrame : ".flc-uiOptions-preview-frame"
        },
        events: {
            onSave: null,
            onCancel: null,
            onReset: null,
            onAutoSave: null,
            modelChanged: null,
            onUIOptionsRefresh: null,
            onUpdateEnhancerModel: null,
            onUIOptionsMarkupReady: null,
            onReady: null
        },
        listeners: {
            onCreate: "fluid.prefs.init",
            onAutoSave: "{that}.save"
        },
        resources: {
            template: "{templateLoader}.resources.uiOptions"
        },
        autoSave: false
    });

    /**
     * Refresh UIOptions
     */
    fluid.prefs.applyChanges = function (that) {
        that.events.onUpdateEnhancerModel.fire();
    };

    fluid.prefs.fetch = function (that) {
        var completeModel = that.getSettings();
        completeModel = $.extend(true, {}, that.rootModel, completeModel);
        that.updateModel(completeModel, "settingsStore");
        that.events.onUIOptionsRefresh.fire();
        that.applyChanges();
    };

    /**
     * Saves the current model and fires onSave
     */
    fluid.prefs.save = function (that) {
        that.events.onSave.fire(that.model);

        var savedSelections = fluid.copy(that.model);
        that.setSettings(savedSelections);
    };

    fluid.prefs.saveAndApply = function (that) {
        that.save();
        that.events.onUIOptionsRefresh.fire();
        that.applyChanges();
    };

    /**
     * Resets the selections to the integrator's defaults and fires onReset
     */
    fluid.prefs.reset = function (that) {
        that.updateModel(fluid.copy(that.rootModel));
        that.events.onUIOptionsRefresh.fire();
        that.events.onReset.fire(that);
    };

    /**
     * Resets the selections to the last saved selections and fires onCancel
     */
    fluid.prefs.cancel = function (that) {
        that.events.onCancel.fire();
        that.fetch();
    };

    // called once markup is applied to the document containing tab component roots
    fluid.prefs.finishInit = function (that) {
        var bindHandlers = function (that) {
            var saveButton = that.locate("save");
            if (saveButton.length > 0) {
                saveButton.click(that.saveAndApply);
                var form = fluid.findForm(saveButton);
                $(form).submit(function () {
                    that.saveAndApply();
                });
            }
            that.locate("reset").click(that.reset);
            that.locate("cancel").click(that.cancel);
        };

        that.container.append(that.options.resources.template.resourceText);
        bindHandlers(that);
        // This creates subcomponents - we can find default model afterwards
        that.events.onUIOptionsMarkupReady.fire(that);

        that.fetch();
        that.events.onReady.fire(that);
    };

    fluid.prefs.init = function (that) {
        that.applier.modelChanged.addListener("", function (newModel, oldModel, changeRequest) {
            that.events.modelChanged.fire(newModel, oldModel, changeRequest[0].source);
            if (that.options.autoSave) {
                that.events.onAutoSave.fire();
            }
        });

        // This setTimeout is to ensure that fetching of resources is asynchronous,
        // and so that component construction does not run ahead of subcomponents for SeparatedPanel
        // (FLUID-4453 - this may be a replacement for a branch removed for a FLUID-2248 fix)
        setTimeout(function () {
            fluid.prefs.finishInit(that);
        }, 1);
    };

    /**********************
     * UI Options Preview *
     **********************/

    fluid.defaults("fluid.prefs.preview", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            enhancer: {
                type: "fluid.uiEnhancer",
                container: "{preview}.enhancerContainer",
                createOnEvent: "onReady"
            },
            // TODO: This is a violation of containment, but we can't use up our allowance of demands
            // blocks as a result of FLUID-4392
            templateLoader: "{templateLoader}"
        },
        invokers: {
            updateModel: {
                funcName: "fluid.prefs.preview.updateModel",
                args: [
                    "{preview}",
                    "{uiOptions}.model"
                ]
            }
        },
        finalInitFunction: "fluid.prefs.preview.finalInit",
        events: {
            onReady: null
        },
        listeners: {
            "{uiOptions}.events.modelChanged": "{that}.updateModel",
            onReady: "{that}.updateModel"
        },
        templateUrl: "%prefix/UIOptionsPreview.html"
    });

    fluid.prefs.preview.updateModel = function (that, model) {
        /**
         * SetTimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
         */
        setTimeout(function () {
            if (that.enhancer) {
                that.enhancer.updateModel(model);
            }
        }, 0);
    };

    fluid.prefs.preview.finalInit = function (that) {
        var templateUrl = that.templateLoader.transformURL(that.options.templateUrl);
        that.container.load(function () {
            that.enhancerContainer = $("body", that.container.contents());
            that.events.onReady.fire();
        });
        that.container.attr("src", templateUrl);
    };

})(jQuery, fluid_1_5);
