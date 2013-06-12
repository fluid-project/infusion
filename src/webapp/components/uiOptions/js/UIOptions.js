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

    fluid.registerNamespace("fluid.uiOptions.inline");

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
        uiOptions: {
            options: {
                components: {
                    settingsStore: "{uiEnhancer}.settingsStore"
                },
                listeners: {
                    onUIOptionsRefresh: "{uiEnhancer}.updateFromSettingsStore"
                }
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
            source: "{that}.options.textSizer.options",
            removeSource: true,
            target: "{that textSizer}.options"
        }, {
            source: "{that}.options.lineSpacer.options",
            removeSource: true,
            target: "{that lineSpacer}.options"
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
        gradeNames: ["fluid.uiOptions.customizedLoader", "fluid.viewComponent", "autoInit"],
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
            },
            onUIOptionsTemplateReady: function () {console.log("loader onUIOptionsTemplateReady is fired");}
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
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            eventBinder: {
                type: "fluid.uiOptions.eventBinder"
            }
        },
        members: {
            // TODO: FLUID-4686 - this will be replaced by the mechanism of
            // extracting defaults from the schema.
            defaultModel: "{uiEnhancer}.settingsStore.options.defaultSiteSettings"
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
        preInitFunction: "fluid.uiOptions.preInit",
        finalInitFunction: "fluid.uiOptions.finalInit",
        resources: {
            template: "{templateLoader}.resources.uiOptions"
        },
        autoSave: false
    });
    
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
        console.log("in fluid.uiOptions.preInit: " + that.container[0].id);
        that.fetch = function () {
            var initialModel = that.settingsStore.fetch();
            initialModel = $.extend(true, {}, that.defaultModel, initialModel);
            that.updateModel(initialModel);
            that.events.onUIOptionsRefresh.fire();
        };

        /**
         * Saves the current model and fires onSave
         */ 
        that.save = function () {
            that.events.onSave.fire(that.model.selections);
            
            var savedSelections = fluid.copy(that.model.selections);
            that.settingsStore.save(savedSelections);
        };
        
        that.saveAndApply = function () {
            that.save();
            that.events.onUIOptionsRefresh.fire();
        };

        /**
         * Resets the selections to the integrator's defaults and fires onReset
         */
        that.reset = function () {
            that.updateModel(fluid.copy(that.defaultModel));
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
        
        /**
         * Updates the change applier and fires modelChanged on subcomponent fluid.uiOptions.controls
         * 
         * @param {Object} newModel
         * @param {Object} source
         */
        that.updateModel = function (newModel) {
            that.applier.requestChange("selections", newModel);
        };
        
        that.applier.modelChanged.addListener("selections", function (newModel, oldModel, changeRequest) {
            that.events.modelChanged.fire(newModel, oldModel, changeRequest.source);
            if (that.options.autoSave) {
                that.events.onAutoSave.fire();
            }
        });
    };

    fluid.uiOptions.finalInit = function (that) {
        console.log("in fluid.uiOptions.finalInit: " + that.container[0].id);
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
     * Base grade settingsPanel
     ***********************************************/
     
    fluid.defaults("fluid.uiOptions.settingsPanel", {
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
                createOnEvent: "onReady",
                options: {
                    settingsStore: {
                        type: "fluid.uiEnhancer.tempStore"
                    }
                }
            },
            eventBinder: {
                type: "fluid.uiOptions.preview.eventBinder",
                createOnEvent: "onReady"
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

    fluid.demands("fluid.uiEnhancer", "fluid.uiOptions.preview", {
        funcName: "fluid.uiEnhancer",
        args: [
            "{preview}.enhancerContainer",
            "{options}"
        ]
    });
    
    /***************************************************
     * UI Options Event binder:                        *
     * Binds events between UI Options and the Preview *
     ***************************************************/
     
    fluid.defaults("fluid.uiOptions.preview.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.demands("fluid.uiOptions.preview.eventBinder", ["fluid.uiOptions.preview", "fluid.uiOptions"], {
        options: {
            listeners: {
                "{uiOptions}.events.modelChanged": "{preview}.updateModel"
            }
        }
    });

})(jQuery, fluid_1_5);
