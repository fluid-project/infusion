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
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};


/******************
 * Textfield Slider *
 ******************/

(function ($, fluid) {

    fluid.defaults("fluid.textfieldSlider", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        components: {
            textfield: {
                type: "fluid.textfieldSlider.textfield",
                container: "{textfieldSlider}.dom.textfield",
                options: {
                    model: "{textfieldSlider}.model",
                    applier: "{textfieldSlider}.applier"
                }
            },
            slider: {
                type: "fluid.textfieldSlider.slider",
                container: "{textfieldSlider}.dom.slider",
                options: {
                    model: "{textfieldSlider}.model",
                    applier: "{textfieldSlider}.applier"
                }
            }
        },
        selectors: {
            textfield: ".flc-textfieldSlider-field",
            slider: ".flc-textfieldSlider-slider"
        },
        events: {
            modelChanged: null
        },
        model: {
            value: null,
            min: 0,
            max: 100
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1
        }, 
        finalInitFunction: "fluid.textfieldSlider.finalInit"
    });    
    
    fluid.textfieldSlider.finalInit = function (that) {
        // initialize slider
        var sliderOptions = $.extend(true, {}, that.options.sliderOptions, that.model);
        
        that.slider.initSlider(sliderOptions);

        that.refreshView = function () {
            var val = that.model.value;
            
            that.textfield.container.val(val);
            that.slider.setSliderValue(val);
            that.slider.setSliderAria(val);
        };
        
        that.applier.modelChanged.addListener("value", 
            function (newModel) {
                that.events.modelChanged.fire(newModel.value);
            }
            );

        that.events.modelChanged.addListener(that.refreshView);

        that.refreshView();
    };
    
    fluid.defaults("fluid.textfieldSlider.textfield", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.textfieldSlider.textfield.finalInit"
    });

    fluid.textfieldSlider.validateValue = function (model, changeRequest, applier) {
        var oldValue = model.value;
        var newValue = changeRequest.value;
        
        var isValidNum = !isNaN(parseInt(newValue, 10));

        if (isValidNum) {
            if (newValue < model.min) {
                newValue = model.min;
            } else if (newValue > model.max) {
                newValue = model.max;
            }
            
            changeRequest.value = newValue;
        } else {
            changeRequest.value = oldValue;
        }
    };

    fluid.textfieldSlider.textfield.finalInit = function (that) {
        that.applier.guards.addListener({path: "value", transactional: true}, fluid.textfieldSlider.validateValue);
        
        that.container.change(function (source) {
            that.applier.requestChange("value", source.target.value);
        });
    };

    fluid.defaults("fluid.textfieldSlider.slider", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.textfieldSlider.slider.finalInit",
        selectors: {
            thumb: ".ui-slider-handle"
        }
    });
    
    // This will be removed once the jQuery UI slider has built in ARIA 
    var initSliderAria = function (thumb, opts) {
        var ariaDefaults = {
            role: 'slider',
            "aria-valuenow": opts.value,
            "aria-valuemin": opts.min,
            "aria-valuemax": opts.max
        };
        thumb.attr(ariaDefaults);
    };
    
    fluid.textfieldSlider.slider.finalInit = function (that) {       
        that.slider = that.container.slider(that.model);
        
        that.initSlider = function (sliderOptions) {
            var slider = that.slider.slider(sliderOptions);
            initSliderAria(that.locate("thumb"), sliderOptions);
        };
        
        that.setSliderValue = function (value) {
            that.slider.slider("value", value);
        };
        
        that.setSliderAria = function (value) {
            that.locate("thumb").attr("aria-valuenow", value);
        };
        
        that.slider.bind("slide", function (e, ui) {
            that.applier.requestChange("value", ui.value);
        });
    };

})(jQuery, fluid_1_4);


/**************
 * UI Options *
 **************/

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
        gradeNames: ["fluid.viewComponent"],
        mergePolicy: {
            uiOptionsTransform: "noexpand",
            derivedDefaults: "noexpand"
        },
        components: {
            uiOptionsLoader: {
                type: "fluid.uiOptions.loader"
            },
            templateLoader: {
                priority: "first",
                type: "fluid.uiOptions.templateLoader"
            }
        },
        uiOptionsTransform: {
            transformer: "fluid.uiOptions.mapOptions",
            config: {
                "*.templateLoader":                                   "templateLoader",
                "*.templateLoader.*.templatePath.options.value":      "prefix",
                "*.uiOptionsLoader":                                  "uiOptionsLoader",
                "*.uiOptionsLoader.container":                        "container",
                "*.uiOptionsLoader.*.uiOptions":                      "uiOptions",
                "*.uiOptionsLoader.*.uiOptions.*.textControls":       "textControls",
                "*.uiOptionsLoader.*.uiOptions.*.layoutControls":     "layoutControls",
                "*.uiOptionsLoader.*.uiOptions.*.linksControls":      "linksControls",
                "*.uiOptionsLoader.*.uiOptions.*.preview":            "preview",
                "*.uiOptionsLoader.*.uiOptions.*.preview.*.enhancer": "previewEnhancer"
            }
        },
        derivedDefaults: {
            uiOptions: {
                options: {
                    components: {
                        settingsStore: "{uiEnhancer}.settingsStore"
                    },
                    listeners: {
                        onUIOptionsRefresh: "{uiEnhancer}.updateFromSettingsStore"
                    }
                }
            }
        }
    });
    
    fluid.uiOptions.inline.makeCreator = function (componentName, processor) {
        fluid.setGlobalValue(componentName, function (container, options) {
            // make "container" one of the options so it can be munged by the uiOptions.mapOptions.
            // This container is passed down to be used as uiOptionsLoader.container
            var defaults = fluid.defaults(componentName);
            options.container = container;
            options = processor(options);
            
            var mappedOptions = fluid.uiOptions.mapOptions(options, defaults.uiOptionsTransform.config, defaults.mergePolicy, 
                fluid.copy(defaults.derivedDefaults));
            var that = fluid.initView(componentName, container, mappedOptions);
            // Fake out standard framework failed view diagnosis to prevent "that is null" message - remove this in 1.5
            fluid.diagnoseFailedView(componentName, that, fluid.defaults(componentName), [componentName, container, mappedOptions]);
            fluid.initDependents(that);
            return that;
        });
    };
    
    /**
    * @param {Object} inObject, the element on inObject is in the pair of key -> value
    */
    fluid.uiOptions.sortByKeyLength = function (inObject) {
        var keys = [];

        for (var k in inObject) {
            keys.push(k);
        }

        keys.sort(function (a, b) {
            return a.length - b.length;
        });
        
        return keys;
    };
    
    fluid.uiOptions.mapOptionsRecord = function (options, sortedConfigKeys, config) {
        var opRecs = [{}, {}, options || {}];
        var appliers = fluid.transform(opRecs, function (opRec) {
            return fluid.makeChangeApplier(opRec);
        });
        fluid.each(sortedConfigKeys, function (origDest) {
            var source = config[origDest];
            var dest = fluid.uiOptions.expandShortPath(origDest);
            var applier = appliers[origDest.charAt(0) === "!" ? 0 : 1];
            
            // Process the user pass-in options
            var value = fluid.get(options, source);
            if (value) {
                applier.requestChange(dest, value, "ADD");
                appliers[2].requestChange(source, value, "DELETE");
            }
        });
        return opRecs;
    };
    
    // TODO: This dreadful function will be absorbed into the framework for 1.5
    /**
    * @param {Object} options, top level options to be mapped
    * @param {Array} config, a mapping between the target path on the IoC tree and the option name
    * @param {Object} used in fluid.merge() to merge options and componentConfig
    */
    fluid.uiOptions.mapOptions = function (options, config, mergePolicy, derivedDefaults) {
        // Sort the config object by the length of the key in case an option and its child option
        // are both configurable. 
        // For instance: "*.templateLoader" & "*.templateLoader.*.templatePath.options.value"
        var sortedConfigKeys = fluid.uiOptions.sortByKeyLength(config);         

        var optrecs = fluid.uiOptions.mapOptionsRecord(options, sortedConfigKeys, config);
        var devrecs = fluid.uiOptions.mapOptionsRecord(derivedDefaults, sortedConfigKeys, config);
        var mergeOpts = [mergePolicy].concat(devrecs).concat(optrecs);
        return fluid.merge.apply(null, mergeOpts);
    };
    
    fluid.uiOptions.expandShortPath = function (path) {
        if (path.charAt(0) === "!") {
            path = path.substring(1);
        }
        var strToreplaceFirst = "components";
        var strToreplaceRest = "options.components";

        // replace the beginning "*"
        var newPath = (path.charAt(0) === "*") ? path.replace("*", strToreplaceFirst) : path;

        // replace the rest "*"
        newPath = newPath.replace(/\*/g, strToreplaceRest);
        
        return newPath;
    };
    
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
            uiOptions: "%prefix/FatPanelUIOptions.html",
            textControls: "%prefix/UIOptionsTemplate-text.html",
            layoutControls: "%prefix/UIOptionsTemplate-layout.html",
            linksControls: "%prefix/UIOptionsTemplate-links.html"
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

    fluid.demands("fluid.uiOptions.textControls", ["fluid.uiOptions"], {
        options: {
            classnameMap: "{uiEnhancer}.options.classnameMap"
        }
    });
    
    fluid.demands("fluid.uiOptions.layoutControls", ["fluid.uiOptions"], {
        options: {
            classnameMap: "{uiEnhancer}.options.classnameMap"
        }
    });
    
    fluid.demands("fluid.uiOptions.linksControls", ["fluid.uiOptions"], {
        options: {
            classnameMap: "{uiEnhancer}.options.classnameMap"
        }
    });
    
    fluid.uiOptions.onReadyFirer = function (uiOptionsLoader, uiOptions) {
        uiOptionsLoader.events.onReady.fire(uiOptionsLoader, uiOptions);
    };
    
    fluid.defaults("fluid.uiOptions.loader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        resources: "{templateLoader}.resources",
        finalInitFunction: "fluid.uiOptions.loader.finalInit",
        events: {
            // These three are events private to uiOptions
            onUIOptionsTemplateReady: null,
            onUIOptionsComponentReady: null,
            // This extra event is required because of framework bug FLUID-4337 and also the lack of "boiled listeners"
            onUIOptionsReadyBridge: {
                event: "onUIOptionsComponentReady",
                args: ["{fluid.uiOptions.loader}", "{arguments}.0"]
            },
            // This is a public event which users outside the component can subscribe to - the argument
            // supplied is UIOptions.loader itself
            onReady: null
        },
        listeners: {
            onUIOptionsReadyBridge: {
                // Literal use of listener function again due to FLUID-4337
                listener: fluid.uiOptions.onReadyFirer,
                priority: "last"
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
    
    fluid.uiOptions.loader.finalInit = function (that) {
        fluid.fetchResources(that.options.resources, function () {that.events.onUIOptionsTemplateReady.fire();});
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
            textControls: {
                type: "fluid.uiOptions.textControls",
                container: "{uiOptions}.dom.textControls",
                createOnEvent: "onUIOptionsComponentReady",
                options: {
                    model: "{uiOptions}.model",
                    applier: "{uiOptions}.applier",
                    events: {
                        onUIOptionsRefresh: "{uiOptions}.events.onUIOptionsRefresh"
                    }
                }
            },
            layoutControls: {
                type: "fluid.uiOptions.layoutControls",
                container: "{uiOptions}.dom.layoutControls",
                createOnEvent: "onUIOptionsComponentReady",
                options: {
                    model: "{uiOptions}.model",
                    applier: "{uiOptions}.applier",
                    events: {
                        onUIOptionsRefresh: "{uiOptions}.events.onUIOptionsRefresh"
                    }
                }
            },
            linksControls: {
                type: "fluid.uiOptions.linksControls",
                container: "{uiOptions}.dom.linksControls",
                createOnEvent: "onUIOptionsComponentReady",
                options: {
                    model: "{uiOptions}.model",
                    applier: "{uiOptions}.applier",
                    events: {
                        onUIOptionsRefresh: "{uiOptions}.events.onUIOptionsRefresh"
                    }
                }
            },
            preview: {
                type: "fluid.uiOptions.preview",
                createOnEvent: "onUIOptionsComponentReady",
                container: "{uiOptions}.dom.previewFrame"
            },
            eventBinder: {
                type: "fluid.uiOptions.eventBinder"
            }
        },
        selectors: {
            textControls: ".flc-uiOptions-text-controls",
            layoutControls: ".flc-uiOptions-layout-controls",
            linksControls: ".flc-uiOptions-links-controls",
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
            onUIOptionsComponentReady: null
        },
        finalInitFunction: "fluid.uiOptions.finalInit",
        resources: {
            template: "{templateLoader}.resources.uiOptions"
        },
        autoSave: false
    });

    fluid.uiOptions.finalInit = function (that) {
        that.applier.requestChange("selections", fluid.copy(that.settingsStore.fetch()));

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
            that.updateModel(fluid.copy(that.settingsStore.options.defaultSiteSettings));
            that.events.onReset.fire(that);
            that.events.onUIOptionsRefresh.fire();
        };
        
        /**
         * Resets the selections to the last saved selections and fires onCancel
         */
        that.cancel = function () {
            that.events.onCancel.fire();
            that.updateModel(that.settingsStore.fetch());
            that.events.onUIOptionsRefresh.fire();
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
        
        that.applier.modelChanged.addListener("selections",
            function (newModel, oldModel, changeRequest) {
                that.events.modelChanged.fire(newModel, oldModel, changeRequest.source);
                if (that.options.autoSave) {
                    that.events.onAutoSave.fire();
                }
            }
            );
            
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
        
        var bindEventHandlers = function (that) {
            that.events.onAutoSave.addListener(function () {
                that.save();    
            });
        };
        
        fluid.fetchResources(that.options.resources, function () {
          // This setTimeout is to ensure that fetching of resources is asynchronous,
          // and so that component construction does not run ahead of subcomponents for FatPanel
          // (FLUID-4453 - this may be a replacement for a branch removed for a FLUID-2248 fix) 
            setTimeout(function () {
                that.container.append(that.options.resources.template.resourceText);
                bindHandlers(that);
                bindEventHandlers(that);
                that.events.onUIOptionsComponentReady.fire(that);
            }, 1);
        });
    };

    /******************************************************
     * UI Options Event binder:                           *
     * Binds events between UI Options and the UIEnhancer *
     ******************************************************/
     
    fluid.defaults("fluid.uiOptions.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

    var initModel = function (that) {
        fluid.each(that.options.controlValues, function (item, key) {
            that.applier.requestChange("labelMap." + key, {
                values: that.options.controlValues[key],
                names: that.options.strings[key],
                classes: that.options.classnameMap[key]
            });
        });
    };
    
    var createSliderNode = function (that, item) {
        return {
            decorators: {
                type: "fluid",
                func: "fluid.textfieldSlider",
                options: {
                    listeners: {
                        modelChanged: function (value) {
                            that.applier.requestChange("selections." + item, value);
                        }
                    },
                    model: {
                        min: that.options[item].min,
                        max: that.options[item].max,
                        value: that.model.selections[item]
                    }
                }
            }
        };
    };
    
    fluid.uiOptions.controlsFinalInit = function (that) {
        initModel(that);
        that.refreshView();        
    };
    
    // This function compensates for a framework deficiency that due to lack of gingerness, the "refreshView"
    // function synthesized by rendererComponent is not available during listener registration which only 
    // occurs after component init functions have completed (http://issues.fluidproject.org/browse/FLUID-4334)
    fluid.uiOptions.lateRefreshViewBinder = function (that) {
        that.refreshView = function () {
            that.renderer.refreshView();
        };
    };

    /****************************
     * UI Options Text Controls *
     ****************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text and display" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.textControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        strings: {
            textFont: ["Default", "Times New Roman", "Comic Sans", "Arial", "Verdana"],
            theme: ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"]
        },
        controlValues: { 
            textFont: ["default", "times", "comic", "arial", "verdana"],
            theme: ["default", "bw", "wb", "by", "yb"]
        },
        textSize: {
            min: 1,
            max: 2
        },
        lineSpacing: {
            min: 1,
            max: 2
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font",
            theme: ".flc-uiOptions-theme",
            textSize: ".flc-uiOptions-min-text-size",
            lineSpacing: ".flc-uiOptions-line-spacing"
        },
        events: {
            onUIOptionsRefresh: null    
        },
        listeners: {
            onUIOptionsRefresh: "{textControls}.refreshView"     
        },
        preInitFunction: "fluid.uiOptions.lateRefreshViewBinder",
        finalInitFunction: "fluid.uiOptions.controlsFinalInit",
        produceTree: "fluid.uiOptions.textControls.produceTree",
        resources: {
            template: "{templateLoader}.resources.textControls"
        }
    });
    
    fluid.uiOptions.textControls.produceTree = function (that) {
        var tree = {};
        
        for (var item in that.model.selections) {
            if (item === "textFont" || item === "theme") {
                // render drop down list box
                tree[item] = {
                    optionnames: "${labelMap." + item + ".names}",
                    optionlist: "${labelMap." + item + ".values}",
                    selection: "${selections." + item + "}",
                    decorators: {
                        type: "fluid",
                        func: "fluid.uiOptions.selectDecorator",
                        options: {
                            styles: that.options.classnameMap[item]
                        }
                    }
                };
            } else if (item === "textSize" || item === "lineSpacing") {
                // textfield sliders
                tree[item] = createSliderNode(that, item);
            }
        }
        
        return tree;
    };

    /***********************************************
     * UI Options Select Dropdown Options Decorator*
     ***********************************************/

    /**
     * A sub-component that decorates the options on the select dropdown list box with the css style
     */
    fluid.demands("fluid.uiOptions.selectDecorator", "fluid.uiOptions", {
        container: "{arguments}.0"
    });
    
    fluid.defaults("fluid.uiOptions.selectDecorator", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        finalInitFunction: "fluid.uiOptions.selectDecorator.finalInit",
        styles: {
            preview: "fl-preview-theme"
        }
    });
    
    fluid.uiOptions.selectDecorator.finalInit = function (that) {
        fluid.each($("option", that.container), function (option) {
            var styles = that.options.styles;
            $(option).addClass(styles.preview + " " + styles[fluid.value(option)]);
        });
    };
    
    /******************************
     * UI Options Layout Controls *
     ******************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "layout and navigation" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.layoutControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        selectors: {
            layout: ".flc-uiOptions-layout",
            toc: ".flc-uiOptions-toc"
        },
        events: {
            onUIOptionsRefresh: null    
        },
        listeners: {
            onUIOptionsRefresh: "{layoutControls}.refreshView"     
        },
        preInitFunction: "fluid.uiOptions.lateRefreshViewBinder",
        finalInitFunction: "fluid.uiOptions.controlsFinalInit",
        produceTree: "fluid.uiOptions.layoutControls.produceTree",
        resources: {                    
            template: "{templateLoader}.resources.layoutControls"
        }
    });

    fluid.uiOptions.layoutControls.produceTree = function (that) {
        var tree = {};
        
        for (var item in that.model.selections) {
            if (item === "layout" || item === "toc") {
                // render radio buttons
                tree[item] = "${selections." + item + "}";
            }
        }
        
        return tree;
    };

    /*****************************
     * UI Options Links Controls *
     *****************************/
    /**
     * A sub-component of fluid.uiOptions that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.linksControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        selectors: {
            links: ".flc-uiOptions-links",
            inputsLarger: ".flc-uiOptions-inputs-larger"
        },
        events: {
            onUIOptionsRefresh: null    
        },
        listeners: {
            onUIOptionsRefresh: "{linksControls}.refreshView"     
        },
        preInitFunction: "fluid.uiOptions.lateRefreshViewBinder",
        finalInitFunction: "fluid.uiOptions.controlsFinalInit",
        produceTree: "fluid.uiOptions.linksControls.produceTree",
        resources: {
            template: "{templateLoader}.resources.linksControls"
        }
    });

    fluid.uiOptions.linksControls.produceTree = function (that) {
        var tree = {};
        
        for (var item in that.model.selections) {
            if (item === "links" || item === "inputsLarger") {
                // render check boxes
                tree[item] = "${selections." + item + "}";
            }
        }

        return tree;
    };

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
         * Setimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
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

})(jQuery, fluid_1_4);
