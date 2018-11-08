/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global createHyphenator */

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * syllabification
     *
     * An enactor that is capable of breaking words down into syllables
     *******************************************************************************/

    /*
        TODO:
        - adjust to work with TTS
            - parsing for tts will need to remove empty tags and understand that adjacent parts form whole words.
            - empty elements would have to be reasonable to remove in all cases.
     */

    /*
     * `fluid.prefs.enactor.syllabification` makes use of the "hyphen" library to split up words into their phonetic
     * parts. Because different localizations may have different means of splitting up words, pattern files for the
     * supported languages are used. The language patterns are pulled in dynamically based on the language codes
     * encountered in the content. The language patterns available are configured through the langConfigs option,
     * populated by the `fluid.prefs.enactor.syllabification.langConfigs` grade.
     *
     * Syllables are split with the `hyphenChar`. It is best to use a character that is not already present in the
     * content. When disabling syllabification, any previously syllabified content
     * will be reverted by removing this character.
     */
    fluid.defaults("fluid.prefs.enactor.syllabification", {
        gradeNames: ["fluid.prefs.enactor", "fluid.prefs.enactor.syllabification.langConfigs", "fluid.viewComponent"],
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
        // Used by the hyphenator when parsing words into syllables. However, the separator character displayed in the
        // document is set through the `fl-syllabification-separator` class.
        hyphenChar: "·",
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
            }
        }
    });

    /**
     * Only disconnect the observer is the state is set to false.
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
     * Creates a hyphenator instance making use of the pattern supplied in the config. The config also specifies the
     * required JavaScript file for the pattern, which is injected into the Document. If the pattern file cannot be
     * loaded, the onError event is fired.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     * @param {Object} config - the hyphenator configuration containing the `file` path and `pattern` name to use when
     *                          instantiating the hyphenator.
     * @param {Options} options - options for creating the hyphenator. Typically this is the 'hyphenChar'.
     *
     * @return {Promise} - If a hyphenator is successfully created, the promise is resolved with it. Otherwise it is
     *                     resolved with undefined and the `onError` event fired.
     */
    fluid.prefs.enactor.syllabification.createHyphenator = function (that, config, options) {
        var promise = fluid.promise();
        var src = fluid.stringTemplate(config.file, that.options.terms);

        var injectPromise = fluid.prefs.enactor.syllabification.injectScript(src);
        injectPromise.then(function () {
            var hyphenator = createHyphenator(fluid.getGlobalValue(config.pattern), options);
            promise.resolve(hyphenator);
        }, function (jqXHR, textStatus, errorThrown) {
            that.events.onError.fire(
                "The pattern file \"" + src + "\" could not be loaded.",
                jqXHR,
                textStatus,
                errorThrown
            );
            // If the pattern file could not be loaded resolve the promise with out a hyphenator (undefined).
            promise.resolve();
        });
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
     *                        `langConfigs`) option.
     *
     * @return {Promise} - returns a promise. If a hyphenator is successfully created, it is resolved with it.
     *                     Otherwise, it resolves with undefined.
     */
    fluid.prefs.enactor.syllabification.getHyphenator = function (that, lang) {
        var promise = fluid.promise();
        lang = lang.toLowerCase();

        // Use an existing hyphenator if available
        var existing = that.hyphenators[lang];
        if (existing) {
            fluid.promise.follow(existing, promise);
            return promise;
        }

        // Attempt to create an appropriate hyphenator
        var hyphenatorPromise;
        var langConfig = that.options.langConfigs[lang];

        if (langConfig) {
            hyphenatorPromise = fluid.prefs.enactor.syllabification.createHyphenator(
                that,
                langConfig,
                {hyphenChar: that.options.hyphenChar}
            );
            fluid.promise.follow(hyphenatorPromise, promise);
            that.hyphenators[lang] = hyphenatorPromise;
            return promise;
        }

        var langSegs = lang.split("-");
        langConfig = that.options.langConfigs[langSegs[0]];

        if (langConfig) {
            hyphenatorPromise = fluid.prefs.enactor.syllabification.createHyphenator(
                that,
                langConfig,
                {hyphenChar: that.options.hyphenChar}
            );
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
        var hyphenatorPromise = fluid.prefs.enactor.syllabification.getHyphenator(that, lang);
        hyphenatorPromise.then(function (hyphenator) {
            if (hyphenator) {
                var hyphenated = hyphenator(node.textContent);
                // check if hyphenation was applied.
                if (hyphenated.length > node.textContent.length) {
                    var segs = hyphenated.split(that.options.hyphenChar);
                    // remove the last segment as we only need to place separators in between the parts of the words
                    segs.pop();
                    fluid.each(segs, function (seg) {
                        var separator = $(that.options.markup.separator)[0];
                        node = node.splitText(seg.length);
                        node.parentNode.insertBefore(separator, node);
                    });
                }
            }
        });
    };

    fluid.prefs.enactor.syllabification.removeSyllabification = function (that) {
        that.locate("separator").each(function (index, elm) {
            var parent = elm.parentNode;
            $(elm).remove();
            parent.normalize();
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
     * Supplies the configuration for injecting and using the language
     * pattern files for separating words into their phonetic parts.
     **********************************************************************/

    fluid.defaults("fluid.prefs.enactor.syllabification.langConfigs", {
        terms: {
            patternPrefix: "../../../lib/hyphen"
        },
        langConfigs: {
            af: {
                pattern: "hyphenationPatternsAf",
                file: "%patternPrefix/patterns/af.js"
            },
            as: {
                pattern: "hyphenationPatternsAs",
                file: "%patternPrefix/patterns/as.js"
            },
            bg: {
                pattern: "hyphenationPatternsBg",
                file: "%patternPrefix/patterns/bg.js"
            },
            bn: {
                pattern: "hyphenationPatternsBn",
                file: "%patternPrefix/patterns/bn.js"
            },
            ca: {
                pattern: "hyphenationPatternsCa",
                file: "%patternPrefix/patterns/ca.js"
            },
            cop: {
                pattern: "hyphenationPatternsCop",
                file: "%patternPrefix/patterns/cop.js"
            },
            cs: {
                pattern: "hyphenationPatternsCs",
                file: "%patternPrefix/patterns/cs.js"
            },
            cu: {
                pattern: "hyphenationPatternsCu",
                file: "%patternPrefix/patterns/cu.js"
            },
            cy: {
                pattern: "hyphenationPatternsCy",
                file: "%patternPrefix/patterns/cy.js"
            },
            da: {
                pattern: "hyphenationPatternsDa",
                file: "%patternPrefix/patterns/da.js"
            },
            de: {
                pattern: "hyphenationPatternsDe",
                file: "%patternPrefix/patterns/de.js"
            },
            "de-ch": {
                pattern: "hyphenationPatternsDeCh",
                file: "%patternPrefix/patterns/de-ch.js"
            },
            "el-monoton": {
                pattern: "hyphenationPatternsElMonoton",
                file: "%patternPrefix/patterns/el-monoton.js"
            },
            "el-polyton": {
                pattern: "hyphenationPatternsElPolyton",
                file: "%patternPrefix/patterns/el-polyton.js"
            },
            en: {
                pattern: "hyphenationPatternsEnUs",
                file: "%patternPrefix/patterns/en-us.js"
            },
            "en-gb": {
                pattern: "hyphenationPatternsEnGb",
                file: "%patternPrefix/patterns/en-gb.js"
            },
            "en-us": {
                pattern: "hyphenationPatternsEnUs",
                file: "%patternPrefix/patterns/en-us.js"
            },
            eo: {
                pattern: "hyphenationPatternsEo",
                file: "%patternPrefix/patterns/eo.js"
            },
            es: {
                pattern: "hyphenationPatternsEs",
                file: "%patternPrefix/patterns/es.js"
            },
            et: {
                pattern: "hyphenationPatternsEt",
                file: "%patternPrefix/patterns/et.js"
            },
            eu: {
                pattern: "hyphenationPatternsEu",
                file: "%patternPrefix/patterns/eu.js"
            },
            fi: {
                pattern: "hyphenationPatternsFi",
                file: "%patternPrefix/patterns/fi.js"
            },
            fr: {
                pattern: "hyphenationPatternsFr",
                file: "%patternPrefix/patterns/fr.js"
            },
            fur: {
                pattern: "hyphenationPatternsFur",
                file: "%patternPrefix/patterns/fur.js"
            },
            ga: {
                pattern: "hyphenationPatternsGa",
                file: "%patternPrefix/patterns/ga.js"
            },
            gl: {
                pattern: "hyphenationPatternsGl",
                file: "%patternPrefix/patterns/gl.js"
            },
            grc: {
                pattern: "hyphenationPatternsGrc",
                file: "%patternPrefix/patterns/grc.js"
            },
            gu: {
                pattern: "hyphenationPatternsGu",
                file: "%patternPrefix/patterns/gu.js"
            },
            hi: {
                pattern: "hyphenationPatternsHi",
                file: "%patternPrefix/patterns/hi.js"
            },
            hr: {
                pattern: "hyphenationPatternsHr",
                file: "%patternPrefix/patterns/hr.js"
            },
            hsb: {
                pattern: "hyphenationPatternsHsb",
                file: "%patternPrefix/patterns/hsb.js"
            },
            hu: {
                pattern: "hyphenationPatternsHu",
                file: "%patternPrefix/patterns/hu.js"
            },
            hy: {
                pattern: "hyphenationPatternsHy",
                file: "%patternPrefix/patterns/hy.js"
            },
            ia: {
                pattern: "hyphenationPatternsIa",
                file: "%patternPrefix/patterns/ia.js"
            },
            id: {
                pattern: "hyphenationPatternsId",
                file: "%patternPrefix/patterns/id.js"
            },
            is: {
                pattern: "hyphenationPatternsIs",
                file: "%patternPrefix/patterns/is.js"
            },
            it: {
                pattern: "hyphenationPatternsIt",
                file: "%patternPrefix/patterns/it.js"
            },
            ka: {
                pattern: "hyphenationPatternsKa",
                file: "%patternPrefix/patterns/ka.js"
            },
            kmr: {
                pattern: "hyphenationPatternsKmr",
                file: "%patternPrefix/patterns/kmr.js"
            },
            kn: {
                pattern: "hyphenationPatternsKn",
                file: "%patternPrefix/patterns/kn.js"
            },
            la: {
                pattern: "hyphenationPatternsLa",
                file: "%patternPrefix/patterns/la.js"
            },
            "la-classic": {
                pattern: "hyphenationPatternsLaClassic",
                file: "%patternPrefix/patterns/la-classic.js"
            },
            "la-liturgic": {
                pattern: "hyphenationPatternsLaLiturgic",
                file: "%patternPrefix/patterns/la-liturgic.js"
            },
            lt: {
                pattern: "hyphenationPatternsLt",
                file: "%patternPrefix/patterns/lt.js"
            },
            lv: {
                pattern: "hyphenationPatternsLv",
                file: "%patternPrefix/patterns/lv.js"
            },
            ml: {
                pattern: "hyphenationPatternsMl",
                file: "%patternPrefix/patterns/ml.js"
            },
            mn: {
                pattern: "hyphenationPatternsMn",
                file: "%patternPrefix/patterns/mn.js"
            },
            mr: {
                pattern: "hyphenationPatternsMr",
                file: "%patternPrefix/patterns/mr.js"
            },
            "mul-ethi": {
                pattern: "hyphenationPatternsMulEthi",
                file: "%patternPrefix/patterns/mul-ethi.js"
            },
            nb: {
                pattern: "hyphenationPatternsNb",
                file: "%patternPrefix/patterns/nb.js"
            },
            nl: {
                pattern: "hyphenationPatternsNl",
                file: "%patternPrefix/patterns/nl.js"
            },
            nn: {
                pattern: "hyphenationPatternsNn",
                file: "%patternPrefix/patterns/nn.js"
            },
            no: {
                pattern: "hyphenationPatternsNo",
                file: "%patternPrefix/patterns/no.js"
            },
            oc: {
                pattern: "hyphenationPatternsOc",
                file: "%patternPrefix/patterns/oc.js"
            },
            or: {
                pattern: "hyphenationPatternsOr",
                file: "%patternPrefix/patterns/or.js"
            },
            pa: {
                pattern: "hyphenationPatternsPa",
                file: "%patternPrefix/patterns/pa.js"
            },
            pl: {
                pattern: "hyphenationPatternsPl",
                file: "%patternPrefix/patterns/pl.js"
            },
            pms: {
                pattern: "hyphenationPatternsPms",
                file: "%patternPrefix/patterns/pms.js"
            },
            pt: {
                pattern: "hyphenationPatternsPt",
                file: "%patternPrefix/patterns/pt.js"
            },
            rm: {
                pattern: "hyphenationPatternsRm",
                file: "%patternPrefix/patterns/rm/js"
            },
            ro: {
                pattern: "hyphenationPatternsRo",
                file: "%patternPrefix/patterns/ro.js"
            },
            ru: {
                pattern: "hyphenationPatternsRu",
                file: "%patternPrefix/patterns/ru.js"
            },
            sa: {
                pattern: "hyphenationPatternsSa",
                file: "%patternPrefix/patterns/sa.js"
            },
            "sh-cyrl": {
                pattern: "hyphenationPatternsShCyrl",
                file: "%patternPrefix/patterns/sh-cyrl.js"
            },
            "sh-latn": {
                pattern: "hyphenationPatternsShLatn",
                file: "%patternPrefix/patterns/sh-latn.js"
            },
            sk: {
                pattern: "hyphenationPatternsSk",
                file: "%patternPrefix/patterns/sk.js"
            },
            sl: {
                pattern: "hyphenationPatternsSl",
                file: "%patternPrefix/patterns/sl.js"
            },
            "sr-cyrl": {
                pattern: "hyphenationPatternsSrCyrl",
                file: "%patternPrefix/patterns/sr-cyrl.js"
            },
            sv: {
                pattern: "hyphenationPatternsSv",
                file: "%patternPrefix/patterns/sv.js"
            },
            ta: {
                pattern: "hyphenationPatternsTa",
                file: "%patternPrefix/patterns/ta.js"
            },
            te: {
                pattern: "hyphenationPatternsTe",
                file: "%patternPrefix/patterns/te.js"
            },
            th: {
                pattern: "hyphenationPatternsTh",
                file: "%patternPrefix/patterns/th.js"
            },
            tk: {
                pattern: "hyphenationPatternsTk",
                file: "%patternPrefix/patterns/tk.js"
            },
            tr: {
                pattern: "hyphenationPatternsTr",
                file: "%patternPrefix/patterns/tr.js"
            },
            uk: {
                pattern: "hyphenationPatternsUk",
                file: "%patternPrefix/patterns/uk.js"
            },
            "zh-latn": {
                pattern: "hyphenationPatternsZhLatn",
                file: "%patternPrefix/patterns/zh-latn.js"
            }
        }
    });
})(jQuery, fluid_3_0_0);
