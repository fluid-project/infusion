/*
Copyright 2018 OCAD University

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
     * syllabification
     *
     * An enactor that is capable of breaking words down into syllables
     *******************************************************************************/

    /*
     * `fluid.prefs.enactor.syllabification` makes use of the "hypher" library to split up words into their phonetic
     * parts. Because different localizations may have different means of splitting up words, pattern files for the
     * supported languages are used. The language patterns are pulled in dynamically based on the language codes
     * encountered in the content. The language patterns available are configured through the patterns option,
     * populated by the `fluid.prefs.enactor.syllabification.patterns` grade.
     */
    fluid.defaults("fluid.prefs.enactor.syllabification", {
        gradeNames: ["fluid.prefs.enactor", "fluid.prefs.enactor.syllabification.patterns", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.syllabification": {
                "model.enabled": "value"
            }
        },
        selectors: {
            separator: ".flc-syllabification-separator"
        },
        strings: {
            languageUnavailable: "Syllabification not available for %lang"
        },
        markup: {
            separator: "<span class=\"flc-syllabification-separator fl-syllabification-separator\"></span>"
        },
        model: {
            enabled: false
        },
        events: {
            afterParse: null,
            afterSyllabification: null,
            onParsedTextNode: null,
            onNodeAdded: null,
            onError: null
        },
        listeners: {
            "afterParse.waitForHyphenators": {
                listener: "fluid.prefs.enactor.syllabification.waitForHyphenators",
                args: ["{that}"]
            },
            "onParsedTextNode.syllabify": {
                listener: "{that}.apply",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            "onNodeAdded.syllabify": {
                listener: "{that}.parse",
                args: ["{arguments}.0", "{that}.model.enabled"]
            }
        },
        components: {
            parser: {
                type: "fluid.textNodeParser",
                options: {
                    listeners: {
                        "afterParse.boil": "{syllabification}.events.afterParse",
                        "onParsedTextNode.boil": "{syllabification}.events.onParsedTextNode"
                    }
                }
            },
            observer: {
                type: "fluid.mutationObserver",
                container: "{that}.container",
                options: {
                    defaultObserveConfig: {
                        attributes: false
                    },
                    modelListeners: {
                        "{syllabification}.model.enabled": {
                            funcName: "fluid.prefs.enactor.syllabification.disconnectObserver",
                            priority: "before:setPresentation",
                            args: ["{that}", "{change}.value"],
                            namespace: "disconnectObserver"
                        }
                    },
                    listeners: {
                        "onNodeAdded.boil": "{syllabification}.events.onNodeAdded",
                        "{syllabification}.events.afterSyllabification": {
                            listener: "{that}.observe",
                            namespace: "enableObserver"
                        }
                    }
                }
            }
        },
        members: {
            hyphenators: {}
        },
        modelListeners: {
            "enabled": {
                listener: "{that}.setPresentation",
                args: ["{that}.container", "{change}.value"],
                namespace: "setPresentation"
            }
        },
        invokers: {
            apply: {
                funcName: "fluid.prefs.enactor.syllabification.syllabify",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            remove: {
                funcName: "fluid.prefs.enactor.syllabification.removeSyllabification",
                args: ["{that}"]
            },
            setPresentation: {
                funcName: "fluid.prefs.enactor.syllabification.setPresentation",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            parse: {
                funcName: "fluid.prefs.enactor.syllabification.parse",
                args: ["{that}", "{arguments}.0"]
            },
            getHyphenator: {
                funcName: "fluid.prefs.enactor.syllabification.getHyphenator",
                args: ["{that}", "{arguments}.0"]
            },
            hyphenateNode: {
                funcName: "fluid.prefs.enactor.syllabification.hyphenateNode",
                args: ["{arguments}.0", "{arguments}.1", "{that}.options.markup.separator"]
            },
            injectScript: "fluid.prefs.enactor.syllabification.injectScript"
        }
    });

    /**
     * Only disconnect the observer if the state is set to false.
     * This corresponds to the syllabification's `enabled` model path being set to false.
     *
     * @param {Component} that - an instance of `fluid.mutationObserver`
     * @param {Boolean} state - if `false` disconnect, otherwise do nothing
     */
    fluid.prefs.enactor.syllabification.disconnectObserver = function (that, state) {
        if (!state) {
            that.disconnect();
        }
    };

    /**
     * Wait for all hyphenators to be resolved. After they are resolved the `afterSyllabification` event is fired.
     * If any of the hyphenator promises is rejected, the `onError` event is fired instead.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     *
     * @return {Promise} - returns the sequence promise; which is constructed from the hyphenator promises.
     */
    fluid.prefs.enactor.syllabification.waitForHyphenators = function (that) {
        var hyphenatorPromises = fluid.values(that.hyphenators);
        var promise = fluid.promise.sequence(hyphenatorPromises);
        promise.then(function () {
            that.events.afterSyllabification.fire();
        }, that.events.onError.fire);
        return promise;
    };

    fluid.prefs.enactor.syllabification.parse = function (that, elm) {
        elm = fluid.unwrap(elm);
        elm = elm.nodeType === Node.ELEMENT_NODE ? $(elm) : $(elm.parentNode);
        that.parser.parse(elm);
    };

    /**
     * Injects a script into the document.
     *
     * @param {String} src - the URL of the script to inject
     *
     * @return {Promise} - A promise that is resolved on successfully loading the script, or rejected if the load fails.
     */
    fluid.prefs.enactor.syllabification.injectScript = function (src) {
        var promise = fluid.promise();

        $.ajax({
            url: src,
            dataType: "script",
            success: promise.resolve,
            error: promise.reject,
            cache: true
        });

        return promise;
    };

    /**
     * Creates a hyphenator instance making use of the pattern supplied by the path; which is injected into the Document
     * if it hasn't already been loaded. If the pattern file cannot be loaded, the onError event is fired.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     * @param {Object} pattern - the `file` path to source the pattern file from.
     * @param {String} lang - a valid BCP 47 language code. (NOTE: supported lang codes are defined in the
     *                        `patterns`) option.
     *
     * @return {Promise} - If a hyphenator is successfully created, the promise is resolved with it. Otherwise it is
     *                     resolved with undefined and the `onError` event fired.
     */
    fluid.prefs.enactor.syllabification.createHyphenator = function (that, pattern, lang) {
        var promise = fluid.promise();
        var globalPath = ["Hypher", "languages", lang];
        var hyphenator = fluid.getGlobalValue(globalPath);

        // If the pattern file has already been loaded, return the hyphenator.
        if (hyphenator) {
            promise.resolve(hyphenator);
            return promise;
        }

        var src = fluid.stringTemplate(pattern, that.options.terms);
        var existingLang = fluid.get(that, ["hyphenatorSRCs", src]);

        if (existingLang) {
            fluid.promise.follow(existingLang, promise);
            return promise;
        }

        var injectPromise = that.injectScript(src);
        injectPromise.then(function () {
            hyphenator = fluid.getGlobalValue(globalPath);
            promise.resolve(hyphenator);
        }, function (jqXHR, textStatus, errorThrown) {
            that.events.onError.fire(
                "The pattern file \"" + src + "\" could not be loaded.",
                jqXHR,
                textStatus,
                errorThrown
            );
            // If the pattern file could not be loaded, resolve the promise without a hyphenator (undefined).
            promise.resolve();
        });

        fluid.set(that, ["hyphenatorSRCs", src], promise);
        return promise;
    };

    /**
     * Retrieves a promise for the appropriate hyphenator. If a hyphenator has not already been created, it will attempt
     * to create one and assign the related promise to the `hyphenators` member for future retrieval.
     *
     * When creating a hyphenator, it first checks if there is configuration for the specified `lang`. If that fails,
     * it attempts to fall back to a less specific localization.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     * @param {String} lang - a valid BCP 47 language code. (NOTE: supported lang codes are defined in the
     *                        `patterns`) option.
     *
     * @return {Promise} - returns a promise. If a hyphenator is successfully created, it is resolved with it.
     *                     Otherwise, it resolves with undefined.
     */
    fluid.prefs.enactor.syllabification.getHyphenator = function (that, lang) {
        var promise = fluid.promise();
        if (!lang) {
            promise.resolve();
            return promise;
        }
        lang = lang.toLowerCase();

        // Use an existing hyphenator if available
        var existing = that.hyphenators[lang];
        if (existing) {
            return existing;
        }

        // Attempt to create an appropriate hyphenator
        var hyphenatorPromise;
        var pattern = that.options.patterns[lang];

        if (pattern) {
            hyphenatorPromise = fluid.prefs.enactor.syllabification.createHyphenator(that, pattern, lang);
            fluid.promise.follow(hyphenatorPromise, promise);
            that.hyphenators[lang] = hyphenatorPromise;
            return promise;
        }

        var langSegs = lang.split("-");
        pattern = that.options.patterns[langSegs[0]];

        if (pattern) {
            hyphenatorPromise = fluid.prefs.enactor.syllabification.createHyphenator(that, pattern, langSegs[0]);
            fluid.promise.follow(hyphenatorPromise, promise);
        } else {
            hyphenatorPromise = promise;
            // If there no available patterns to match the specified language, resolve the promise with out a
            // hyphenator (undefined).
            promise.resolve();
        }

        that.hyphenators[lang] = hyphenatorPromise;
        that.hyphenators[langSegs[0]] = hyphenatorPromise;
        return promise;
    };

    fluid.prefs.enactor.syllabification.syllabify = function (that, node, lang) {
        var hyphenatorPromise = that.getHyphenator(lang);
        hyphenatorPromise.then(function (hyphenator) {
            that.hyphenateNode(hyphenator, node);
        });
    };

    fluid.prefs.enactor.syllabification.hyphenateNode = function (hyphenator, node, separatorMarkup) {
        if (!hyphenator) {
            return;
        }

        // remove \u200B characters added hyphenateText
        var hyphenated = hyphenator.hyphenateText(node.textContent).replace(/\u200B/gi, "");

        // split words on soft hyphens
        var segs = hyphenated.split("\u00AD");
        // remove the last segment as we only need to place separators in between the parts of the words
        segs.pop();
        fluid.each(segs, function (seg) {
            var separator = $(separatorMarkup)[0];
            node = node.splitText(seg.length);
            node.parentNode.insertBefore(separator, node);
        });
    };

    /**
     * Collapses adjacent text nodes within an element.
     * Similar to NODE.normalize() but works in IE 11.
     * See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8727426/
     *
     * @param {jQuery|DomElement} elm - The element to normalize.
     */
    fluid.prefs.enactor.syllabification.normalize = function (elm) {
        elm = fluid.unwrap(elm);
        var childNode = elm.childNodes[0];
        while (childNode && childNode.nextSibling) {
            var nextSibling = childNode.nextSibling;
            if (childNode.nodeType === Node.TEXT_NODE && nextSibling.nodeType === Node.TEXT_NODE) {
                childNode.textContent += nextSibling.textContent;
                elm.removeChild(nextSibling);
            } else {
                childNode = nextSibling;
            }
        }
    };

    fluid.prefs.enactor.syllabification.removeSyllabification = function (that) {
        that.locate("separator").each(function (index, elm) {
            var parent = elm.parentNode;
            $(elm).remove();
            // Because Node.normalize doesn't work properly in IE 11, we use a custom function
            // to normalize the text nodes in the parent.
            fluid.prefs.enactor.syllabification.normalize(parent);
        });
    };

    fluid.prefs.enactor.syllabification.setPresentation = function (that, elm, state) {
        if (state) {
            that.parse(elm);
        } else {
            that.remove();
        }
    };

    /**********************************************************************
     * Language Pattern File Configuration
     *
     *
     * Supplies the source paths for the language pattern files used to
     * separate words into their phonetic parts.
     **********************************************************************/

    fluid.defaults("fluid.prefs.enactor.syllabification.patterns", {
        terms: {
            patternPrefix: "../../../lib/hypher/patterns"
        },
        patterns: {
            be: "%patternPrefix/bg.js",
            bn: "%patternPrefix/bn.js",
            ca: "%patternPrefix/ca.js",
            cs: "%patternPrefix/cs.js",
            da: "%patternPrefix/da.js",
            de: "%patternPrefix/de.js",
            "el-monoton": "%patternPrefix/el-monoton.js",
            "el-polyton": "%patternPrefix/el-polyton.js",
            en: "%patternPrefix/en-us.js",
            "en-gb": "%patternPrefix/en-gb.js",
            "en-us": "%patternPrefix/en-us.js",
            es: "%patternPrefix/es.js",
            fi: "%patternPrefix/fi.js",
            fr: "%patternPrefix/fr.js",
            grc: "%patternPrefix/grc.js",
            gu: "%patternPrefix/gu.js",
            hi: "%patternPrefix/hi.js",
            hu: "%patternPrefix/hu.js",
            hy: "%patternPrefix/hy.js",
            is: "%patternPrefix/is.js",
            it: "%patternPrefix/it.js",
            kn: "%patternPrefix/kn.js",
            la: "%patternPrefix/la.js",
            lt: "%patternPrefix/lt.js",
            lv: "%patternPrefix/lv.js",
            ml: "%patternPrefix/ml.js",
            "nb-no": "%patternPrefix/nb-no.js",
            nl: "%patternPrefix/nl.js",
            or: "%patternPrefix/or.js",
            pa: "%patternPrefix/pa.js",
            pl: "%patternPrefix/pl.js",
            pt: "%patternPrefix/pt.js",
            ru: "%patternPrefix/ru.js",
            sk: "%patternPrefix/sk.js",
            sl: "%patternPrefix/sl.js",
            sv: "%patternPrefix/sv.js",
            ta: "%patternPrefix/ta.js",
            te: "%patternPrefix/te.js",
            tr: "%patternPrefix/tr.js",
            uk: "%patternPrefix/uk.js"
        }
    });
})(jQuery, fluid_3_0_0);
