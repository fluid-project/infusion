/*
Copyright 2018-2019 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * Localization
     *
     * The enactor to change the locale shown according to the value
     *
     * This grade is resolvable from the root to allow for setting up of model relays
     * from other components on a page that may want to be notified of a language
     * change and update their own UI automatically.
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.localization", {
        gradeNames: ["fluid.prefs.enactor", "fluid.contextAware", "fluid.resolveRoot"],
        preferenceMap: {
            "fluid.prefs.localization": {
                "model.lang": "value"
            }
        },
        contextAwareness: {
            localeChange: {
                checks: {
                    inPanel: {
                        contextValue: "{iframeRenderer}"
                    },
                    urlPath: {
                        contextValue: "{localization}.options.localizationScheme",
                        equals: "urlPath",
                        gradeNames: "fluid.prefs.enactor.localization.urlPathLocale",
                        priority: "after:inPanel"
                    }
                }
            }
        }
    });

    /*******************************************************************************
     * URL Path
     *
     * Changes the URL path to specify which language should be displayed. Useful
     * if languages are served at different URLs based on a language resource.
     * E.g. www.example.com/about/ -> www.example.com/fr/about/
     *******************************************************************************/
    fluid.defaults("fluid.prefs.enactor.localization.urlPathLocale", {
        langMap: {}, // must be supplied by integrator
        langSegIndex: 1,
        model: {
            urlPathname: undefined
        },
        listeners: {
            "onCreate.setURLPath": {
                changePath: "urlPathname",
                value: {
                    expander: {
                        func: "{that}.getPathname"
                    }
                },
                source: "initialURLPathname"
            }
        },
        modelListeners: {
            lang: {
                funcName: "fluid.prefs.enactor.localization.urlPathLocale.changeLocale",
                args: ["{that}", "{change}.value", "{that}.options.langMap", "{that}.options.langSegIndex"],
                namespace: "langToURLPath"
            },
            urlPathname: {
                funcName: "{that}.setPathname",
                args: ["{change}.value"],
                excludeSource: ["init", "initialURLPathname"],
                namespace: "setURLPathname"
            }
        },
        invokers: {
            getPathname: "fluid.prefs.enactor.localization.urlPathLocale.getPathname",
            setPathname: "fluid.prefs.enactor.localization.urlPathLocale.setPathname"
        }
    });

    /**
     * A simple wrapper around the location.pathname getter.
     *
     * @return {String} - If the `pathname` argument is not provided, the current pathname is returned
     */
    fluid.prefs.enactor.localization.urlPathLocale.getPathname = function () {
        return location.pathname;
    };

    /**
     * A simple wrapper around the location.pathname setter.
     *
     * @param {String} pathname - The pathname to set.
     */
    fluid.prefs.enactor.localization.urlPathLocale.setPathname = function (pathname) {
        location.pathname = pathname;
    };

    /**
     * Modifies the URL Path to navigate to the specified localized version of the page. If the "default" language is
     * selected. The function exits without modifying the URL. This allows for the server to automatically, or the user
     * to manually, navigate to a localized page when a language preference hasn't been set.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.localization.urlPathLocale`
     * @param {String} lang - a language code for the requested language
     * @param {Object} langMap - a mapping of language code to URL path resource. This handles cases where the format
     *                           is different, or if the primary language is served from the root.
     * @param {Integer} langSegIndex - An optional index into the path where the language resource identifier is held.
     *                                 By default this value is 1, which represents the first path segment.
     */
    fluid.prefs.enactor.localization.urlPathLocale.changeLocale = function (that, lang, langMap, langSegIndex) {

        // Do nothing when the default language is chosen.
        if (lang === "default") {
            return;
        }

        langSegIndex = langSegIndex || 1;
        var pathname = that.model.urlPathname;
        var pathSegs = pathname.split("/");
        var currentLang = pathSegs[langSegIndex];
        var hasLang = currentLang && fluid.values(langMap).indexOf(currentLang) >= 0;
        var newLangSeg = langMap[lang];

        if (hasLang) {
            if (newLangSeg) {
                pathSegs[langSegIndex] = newLangSeg;
            } else {
                if (langSegIndex === pathSegs.length - 1) {
                    pathSegs[langSegIndex] = "";
                } else {
                    pathSegs.splice(langSegIndex, 1);
                }
            }
        } else if (newLangSeg) {
            pathSegs.splice(langSegIndex, 0, newLangSeg);
        }

        var newPathname = pathSegs.join("/");
        that.applier.change("urlPathname", newPathname, "ADD", "changeLocale");
    };

})(jQuery, fluid_3_0_0);
