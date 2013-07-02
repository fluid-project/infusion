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
     * UI Options Inline *
     *********************/

    /**
     * An UI Options top-level component that reflects the collaboration between uiOptionsLoader
     * and templateLoader. This component is the only UI Options component that is intended to be
     * called by the outside world.
     *
     * @param {Object} options
     */
    fluid.defaults("fluid.uiOptions.inline", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            uiOptionsLoader: {
                type: "fluid.uiOptions.loader"
            },
            templateLoader: {
                priority: "first",
                type: "fluid.uiOptions.templateLoader"
            }
        },
        container: "{that}.container",
        distributeOptions: [{
            source: "{that}.options.templateLoader.options",
            removeSource: true,
            target: "{that templateLoader}.options"
        }, {
            source: "{that}.options.prefix",
            target: "{that templatePath}.options.value"
        }, {
            source: "{that}.options.uiOptionsLoader.options",
            removeSource: true,
            target: "{that > uiOptionsLoader}.options"
        }, {
            source: "{that}.options.uiOptions.options",
            removeSource: true,
            target: "{that uiOptions}.options"
        }, {
            source: "{that}.options.container",
            removeSource: true,
            target: "{that > uiOptionsLoader}.container"
        }]
    });
    
    fluid.defaults("fluid.uiOptions.transformDefaultPanelsOptions", {
        gradeNames: ["fluid.uiOptions.inline", "autoInit"],
        distributeOptions: [{
            source: "{that}.options.textSize.options",
            removeSource: true,
            target: "{that textSize}.options"
        }, {
            source: "{that}.options.lineSpace.options",
            removeSource: true,
            target: "{that lineSpace}.options"
        }, {
            source: "{that}.options.textFont.options",
            removeSource: true,
            target: "{that textFont}.options"
        }, {
            source: "{that}.options.contrast.options",
            removeSource: true,
            target: "{that contrast}.options"
        }, {
            source: "{that}.options.layoutControls.options",
            removeSource: true,
            target: "{that layoutControls}.options"
        }, {
            source: "{that}.options.linksControls.options",
            removeSource: true,
            target: "{that linksControls}.options"
        }]
    });

    /******************************
     * UI Options Template Loader *
     ******************************/

    /**
     * A configurable component that works in conjunction with or without the UI Options template path
     * component (fluid.uiOptionsTemplatePath) to allow users to set either the location of their own
     * templates or the templates that are relative to the path defined in the UI Options template path
     * component.
     *
     * @param {Object} options
     */

    fluid.defaults("fluid.uiOptions.templateLoader", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.templateLoader.resolveTemplates",
        templates: {
            uiOptions: "%prefix/FatPanelUIOptions.html"
        },
        // Unsupported, non-API option
        components: {
            templatePath: {
                type: "fluid.uiOptions.templatePath"
            }
        },
        invokers: {
            transformURL: {
                funcName: "fluid.stringTemplate",
                args: [ "{arguments}.0", { "prefix/" : "{templateLoader}.templatePath.options.value"} ]
            }
        }
    });

    fluid.uiOptions.templateLoader.resolveTemplates = function (that) {
        var mapped = fluid.transform(that.options.templates, that.transformURL);

        that.resources = fluid.transform(mapped, function (url) {
            return {url: url, forceCache: true};
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

    fluid.defaults("fluid.uiOptions.templatePath", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        value: "../html/"
    });

    /**************
     * UI Options *
     **************/

    fluid.defaults("fluid.uiOptions.loader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        resources: "{templateLoader}.resources",
        events: {
            // These two are events private to uiOptions
            onUIOptionsTemplateReady: null, // templates are loaded - construct UIOptions itself
            onUIOptionsComponentReady: null, // UIOptions is loaded - construct its subcomponents
            // This is a public event which users outside the component can subscribe to - the argument
            // supplied is UIOptions.loader itself
            onReady: null
        },
        listeners: {
            onUIOptionsComponentReady: {
                listener: "{loader}.events.onReady",
                args: ["{fluid.uiOptions.loader}", "{arguments}.0"],
                priority: "last"
            },
            onCreate: {
                listener: "fluid.uiOptions.loader.init",
                args: "{that}"
            }
        },
        components: {
            uiOptions: {
                type: "fluid.uiOptions",
                container: "{loader}.container",
                createOnEvent: "onUIOptionsTemplateReady",
                options: {
                    events: {
                        "onUIOptionsComponentReady": "{loader}.events.onUIOptionsComponentReady"
                    }
                }
            }
        }
    });

    fluid.uiOptions.loader.init = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.events.onUIOptionsTemplateReady.fire();
        });
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
    fluid.defaults("fluid.uiOptions", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.settingsGetter", "fluid.uiOptions.settingsSetter", "fluid.uiOptions.rootModel", "autoInit"],
        components: {
            eventBinder: {
                type: "fluid.uiOptions.eventBinder"
            }
        },
        invokers: {
            /**
             * Updates the change applier and fires modelChanged on subcomponent fluid.uiOptions.controls
             *
             * @param {Object} newModel
             * @param {Object} source
             */
            updateModel: {
                funcName: "fluid.fireSourcedChange",
                args: ["{that}.applier", "selections", "{arguments}.0", "{arguments}.1"]
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
            onUIOptionsMarkupReady: null,
            onUIOptionsComponentReady: null
        },
        listeners: {
            onAutoSave: "{that}.save"
        },
        resources: {
            template: "{templateLoader}.resources.uiOptions"
        },
        autoSave: false
    });

    fluid.defaults("fluid.uiOptions.settingsGetter", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            getSettings: "{settingsStore}.get"
        }
    });

    fluid.defaults("fluid.uiOptions.settingsSetter", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            setSettings: {
                funcName: "fluid.uiOptions.settingsSetter.setSettings",
                args: ["{arguments}.0", "{settingsStore}.set"]
            }
        }
    });

    fluid.uiOptions.settingsSetter.setSettings = function (model, set) {
        var userSettings = fluid.copy(model);
        set(userSettings);
    };

    fluid.defaults("fluid.uiOptions.rootModel", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            // TODO: This information is supposed to be generated from the JSON
            // schema describing various preferences. For now it's kept in top
            // level uiOptions to avoid further duplication.
            rootModel: {}
        }
    });

    fluid.defaults("fluid.uiOptions.rootModel.starter", {
        gradeNames: ["fluid.uiOptions.rootModel", "autoInit"],
        members: {
            // TODO: This information is supposed to be generated from the JSON
            // schema describing various preferences. For now it's kept in top
            // level uiOptions to avoid further duplication.
            rootModel: {
                textFont: "default",          // key from classname map
                theme: "default",             // key from classname map
                textSize: 1,                  // in points
                lineSpace: 1,               // in ems
                toc: false,                   // boolean
                links: false,                 // boolean
                inputsLarger: false           // boolean
            }
        }
    });

    fluid.defaults("fluid.uiOptions.uiEnhancerRelay", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        listeners: {
            onCreate: "{that}.addListener",
            onDestroy: "{that}.removeListener"
        },
        events: {
            updateEnhancerModel: "{fluid.uiOptions}.events.onUIOptionsRefresh"
        },
        invokers: {
            addListener: {
                funcName: "fluid.uiOptions.uiEnhancerRelay.addListener",
                args: ["{that}.events.updateEnhancerModel", "{that}.updateEnhancerModel"]
            },
            removeListener: {
                funcName: "fluid.uiOptions.uiEnhancerRelay.removeListener",
                args: ["{that}.events.updateEnhancerModel", "{that}.updateEnhancerModel"]
            },
            updateEnhancerModel: {
                funcName: "fluid.uiOptions.uiEnhancerRelay.updateEnhancerModel",
                args: ["{uiEnhancer}", "{fluid.uiOptions}.model.selections"]
            }
        }
    });

    fluid.uiOptions.uiEnhancerRelay.addListener = function (modelChanged, listener) {
        modelChanged.addListener(listener);
    };

    fluid.uiOptions.uiEnhancerRelay.removeListener = function (modelChanged, listener) {
        modelChanged.removeListener(listener);
    };

    fluid.uiOptions.uiEnhancerRelay.updateEnhancerModel = function (uiEnhancer, newModel) {
        uiEnhancer.updateModel(newModel);
    };

    // called once markup is applied to the document containing tab component roots
    fluid.uiOptions.finishInit = function (that) {
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
        that.events.onUIOptionsComponentReady.fire(that);
    };

    fluid.uiOptions.preInit = function (that) {
        that.fetch = function () {
            var completeModel = that.getSettings();
            completeModel = $.extend(true, {}, that.rootModel, completeModel);
            that.updateModel(completeModel, "settingsStore");
            that.events.onUIOptionsRefresh.fire();
        };

        /**
         * Saves the current model and fires onSave
         */
        that.save = function () {
            that.events.onSave.fire(that.model.selections);

            var savedSelections = fluid.copy(that.model.selections);
            that.setSettings(savedSelections);
        };

        that.saveAndApply = function () {
            that.save();
            that.events.onUIOptionsRefresh.fire();
        };

        /**
         * Resets the selections to the integrator's defaults and fires onReset
         */
        that.reset = function () {
            that.updateModel(fluid.copy(that.rootModel));
            that.events.onReset.fire(that);
            that.events.onUIOptionsRefresh.fire();
        };

        /**
         * Resets the selections to the last saved selections and fires onCancel
         */
        that.cancel = function () {
            that.events.onCancel.fire();
            that.fetch();
        };

        that.applier.modelChanged.addListener("selections", function (newModel, oldModel, changeRequest) {
            that.events.modelChanged.fire(newModel, oldModel, changeRequest[0].source);
            if (that.options.autoSave) {
                that.events.onAutoSave.fire();
            }
        });
    };

    fluid.uiOptions.finalInit = function (that) {
        fluid.fetchResources(that.options.resources, function () {
          // This setTimeout is to ensure that fetching of resources is asynchronous,
          // and so that component construction does not run ahead of subcomponents for FatPanel
          // (FLUID-4453 - this may be a replacement for a branch removed for a FLUID-2248 fix)
            setTimeout(function () {
                fluid.uiOptions.finishInit(that);
            }, 1);
        });
    };

    /***********************************************
     * Base grade panels
     ***********************************************/

    fluid.defaults("fluid.uiOptions.panels", {
        gradeNames: ["fluid.rendererComponent", "fluid.uiOptions.modelRelay", "autoInit"],
        invokers: {
            refreshView: "{that}.renderer.refreshView"
        },
        strings: {},
        parentBundle: "{uioMsgBundle}"
    });

    /******************************************************
     * UI Options Event binder:                           *
     * Binds events between UI Options and the UIEnhancer *
     ******************************************************/

    fluid.defaults("fluid.uiOptions.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

    /**********************
     * UI Options Preview *
     **********************/

    fluid.defaults("fluid.uiOptions.preview", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            enhancer: {
                type: "fluid.uiEnhancer",
                container: "{preview}.enhancerContainer",
                createOnEvent: "onReady",
                options: {
                    gradeNames: ["fluid.uiOptions.uiEnhancerRelay"]
                }
            },
            // TODO: This is a violation of containment, but we can't use up our allowance of demands
            // blocks as a result of FLUID-4392
            templateLoader: "{templateLoader}"
        },
        invokers: {
            updateModel: {
                funcName: "fluid.uiOptions.preview.updateModel",
                args: [
                    "{preview}",
                    "{uiOptions}.model.selections"
                ]
            }
        },
        finalInitFunction: "fluid.uiOptions.preview.finalInit",
        events: {
            onReady: null
        },
        listeners: {
            "{uiOptions}.events.modelChanged": "{that}.updateModel",
            onReady: "{that}.updateModel"
        },
        templateUrl: "%prefix/UIOptionsPreview.html"
    });

    fluid.uiOptions.preview.updateModel = function (that, selections) {
        /**
         * SetTimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
         */
        setTimeout(function () {
            if (that.enhancer) {
                that.enhancer.updateModel(selections);
            }
        }, 0);
    };

    fluid.uiOptions.preview.finalInit = function (that) {
        var templateUrl = that.templateLoader.transformURL(that.options.templateUrl);
        that.container.load(function () {
            that.enhancerContainer = $("body", that.container.contents());
            that.events.onReady.fire();
        });
        that.container.attr("src", templateUrl);

    };

})(jQuery, fluid_1_5);
