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
        - Add hyphens to dynamically added content
        - adjust to work with TTS
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
        strings: {
            languageUnavailable: "Syllabification not available for %lang"
        },
        hyphenChar: "·",
        regex: {
            expander: {
                funcName: "fluid.prefs.enactor.syllabification.generateRegex",
                args: ["{that}.options.hyphenChar", "gi"]
            }
        },
        model: {
            enabled: false
        },
        events: {
            onParsedNode: null,
            onError: null
        },
        listeners: {
            "onParsedNode.syllabify": {
                func: "{that}.togglePresentation",
                args: ["{arguments}.0", "{arguments}.1", "{that}.model.enabled"]
            }
        },
        components: {
            parser: {
                type: "fluid.domReader.parser",
                options: {
                    listeners: {
                        "onParsedNode.syllabify": "{syllabification}.events.onParsedNode"
                    }
                }
            }
        },
        members: {
            hyphenators: {}
        },
        modelListeners: {
            "enabled": {
                listener: "fluid.prefs.enactor.syllabification.parseIf",
                args: ["{that}", "{change}.value", "{change}.oldValue"],
                namespace: "parse"
            }
        },
        invokers: {
            apply: {
                funcName: "fluid.prefs.enactor.syllabification.syllabify",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            remove: {
                funcName: "fluid.prefs.enactor.syllabification.removeSyllabification",
                args: ["{that}.options.regex", "{arguments}.0"]
            },
            togglePresentation: {
                funcName: "fluid.prefs.enactor.syllabification.togglePresentation",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        }
    });

    /**
     * Only run the parsing if the syllabification is to be enabled, or was previously enabled.
     * That is, the parsing should not be run when the component is instantiated with syllabifcaiton disabled.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     * @param {Boolean} newValue - current model state
     * @param {Boolean} oldValue - previous model state
     */
    fluid.prefs.enactor.syllabification.parseIf = function (that, newValue, oldValue) {
        if (newValue || oldValue) {
            // TODO: see if we can improve this so that it doesn't check every time we change the setting
            var lang = that.container.closest("[lang]").attr("lang");
            that.parser.parse(that.container, lang);
        }
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
     * required JavaScript file for the pattern, which is injected into the Document.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     * @param {Object} config - the hyphenator configuration containing the `file` path and `pattern` name to use when
     *                          instantiating the hyphenator.
     * @param {Options} options - options for creating the hyphenator. Typically this is the 'hyphenChar'.
     *
     * @return {Promise} - If a hyphenator is successfully created, the promise is resolved with it. Otherwise it is
     *                     rejected.
     */
    fluid.prefs.enactor.syllabification.createHyphenator = function (that, config, options) {
        var promise = fluid.promise();
        var src = fluid.stringTemplate(config.file, that.options.terms);

        var injectPromise = fluid.prefs.enactor.syllabification.injectScript(src);
        injectPromise.then(function () {
            var hyphenator = createHyphenator(fluid.getGlobalValue(config.pattern), options);
            promise.resolve(hyphenator);
        }, promise.reject);
        return promise;
    };

    /**
     * Retrieves a promise for the appropriate hyphenator. If a hyphenator has not already been created, it will attempt
     * to create one and assign the related promise to the `hyphenators` member for future retrieval.
     *
     * When creating a hyphenator, it first checks if there is configuration for the specified `lang`. If that fails,
     * it attempts to fall back to a less specific localization.
     *
     * Any errors, either searching for an available language configuration or creating the hyphenator, will reject the
     * promise and trigger an `onError` event.
     *
     * @param {Component} that - an instance of `fluid.prefs.enactor.syllabification`
     * @param {String} lang - a valid BCP 47 language code. (NOTE: supported lang codes are defined in the
     *                        `langConfigs`) option.
     *
     * @return {Promise} - returns a promise. If a hyphenator is successfully created, it is resolved with it.
     *                     Otherwise, it is rejected.
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

        // Only fire the error once per rejected promise
        promise.then(fluid.identity, that.events.onError.fire);

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
            // Reject the promise if there no available patterns to match the specified language.
            promise.reject({message: fluid.stringTemplate(that.options.strings.languageUnavailable, {lang: lang})});
        }

        that.hyphenators[lang] = hyphenatorPromise;
        that.hyphenators[langSegs[0]] = hyphenatorPromise;
        return promise;
    };

    fluid.prefs.enactor.syllabification.syllabify = function (that, node, lang) {
        var hyphenatorPromise = fluid.prefs.enactor.syllabification.getHyphenator(that, lang);
        hyphenatorPromise.then(function (hyphenator) {
            node.textContent = hyphenator(node.textContent);
        });
    };

    fluid.prefs.enactor.syllabification.generateRegex = function (pattern, flags) {
        return new RegExp(pattern, flags);
    };

    fluid.prefs.enactor.syllabification.removeSyllabification = function (regex, node) {
        node.textContent = node.textContent.replace(regex, "");
    };

    fluid.prefs.enactor.syllabification.togglePresentation = function (that, node, lang, state) {
        state = fluid.isValue(state) ? state : !that.model.enabled;
        if (state) {
            that.apply(node, lang);
        } else {
            that.remove(node);
        }
    };

    /*
     * TODO: Combine the parser with the one from the Orator and make a generalized version to use in both places.
     */

    /*******************************************************************************
     * fluid.domReader.parser
     *
     * Parses the text from the DOM into a format that is suitable for reading back
     * by the fluid.domReader
     *******************************************************************************/

    fluid.defaults("fluid.domReader.parser", {
        gradeNames: ["fluid.component"],
        events: {
            onParsedNode: null
        },
        invokers: {
            parse: {
                funcName: "fluid.domReader.parser.parse",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            hasTextToRead: "fluid.domReader.parser.hasTextToRead",
            isWord: "fluid.domReader.parser.isWord"
        }
    });

    /**
     * Tests if a string is a word, that is it has a value and is not only whitespace.
     * inspired by https://stackoverflow.com/a/2031143
     *
     * @param {String} str - the String to test
     *
     * @return {Boolean} - `true` if a word, `false` otherwise.
     */
    fluid.domReader.parser.isWord = function (str) {
        return fluid.isValue(str) && /\S/.test(str);
    };

    /**
     * Determines if there is text in an element that should be read.
     * Will return false in the following conditions:
     * - elm is falsey (undefined, null, etc.)
     * - elm's offsetHeight is 0 (e.g. display none set on itself or its parent)
     * - elm has no text or only whitespace
     * - elm or its parent has `aria-hidden="true"` set.
     *
     * NOTE: Text added by pseudo elements (e.g. :before, :after) are not considered.
     * NOTE: This method is not supported in IE 11 because innerText returns the text for some hidden elements
     *       that is inconsistent with modern browsers.
     *
     * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
     *
     * @return {Boolean} - returns true if there is rendered text within the element and false otherwise.
     *                     (See rules above)
     */
    fluid.domReader.parser.hasTextToRead = function (elm) {
        elm = fluid.unwrap(elm);

        return elm &&
               !!elm.offsetHeight &&
               fluid.domReader.parser.isWord(elm.innerText);
    };

    /**
     * Recursively parses a DOM element and it's sub elements to construct an array of data points representing the
     * words and space between the words. This data structure provides the means for locating text to highlight as the
     * self voicing engine runs.
     * NOTE: consecutive whitespace is collapsed to the first whitespace character.
     * NOTE: hidden text is skipped.
     *
     * @param {Component} that - the component
     * @param {jQuery|DomElement} elm - the DOM node to parse
     * @param {String} lang - a valid BCP 47 language code.
     */
    fluid.domReader.parser.parse = function (that, elm, lang) {
        elm = fluid.unwrap(elm);

        if (that.hasTextToRead(elm)) {
            var childNodes = elm.childNodes;
            var elementLang = elm.getAttribute("lang") || lang;

            $.each(childNodes, function (childIndex, childNode) {
                if (childNode.nodeType === Node.TEXT_NODE) {
                    that.events.onParsedNode.fire(childNode, elementLang);
                } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                    fluid.domReader.parser.parse(that, childNode, elementLang);
                }
            });
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
                file: "%patternPrefix/af.js"
            },
            as: {
                pattern: "hyphenationPatternsAs",
                file: "%patternPrefix/as.js"
            },
            bg: {
                pattern: "hyphenationPatternsBg",
                file: "%patternPrefix/bg.js"
            },
            bn: {
                pattern: "hyphenationPatternsBn",
                file: "%patternPrefix/bn.js"
            },
            ca: {
                pattern: "hyphenationPatternsCa",
                file: "%patternPrefix/ca.js"
            },
            cop: {
                pattern: "hyphenationPatternsCop",
                file: "%patternPrefix/cop.js"
            },
            cs: {
                pattern: "hyphenationPatternsCs",
                file: "%patternPrefix/cs.js"
            },
            cu: {
                pattern: "hyphenationPatternsCu",
                file: "%patternPrefix/cu.js"
            },
            cy: {
                pattern: "hyphenationPatternsCy",
                file: "%patternPrefix/cy.js"
            },
            da: {
                pattern: "hyphenationPatternsDa",
                file: "%patternPrefix/da.js"
            },
            de: {
                pattern: "hyphenationPatternsDe",
                file: "%patternPrefix/de.js"
            },
            "de-ch": {
                pattern: "hyphenationPatternsDeCh",
                file: "%patternPrefix/de-ch.js"
            },
            "el-monoton": {
                pattern: "hyphenationPatternsElMonoton",
                file: "%patternPrefix/el-monoton.js"
            },
            "el-polyton": {
                pattern: "hyphenationPatternsElPolyton",
                file: "%patternPrefix/el-polyton.js"
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
                file: "%patternPrefix/eo.js"
            },
            es: {
                pattern: "hyphenationPatternsEs",
                file: "%patternPrefix/es.js"
            },
            et: {
                pattern: "hyphenationPatternsEt",
                file: "%patternPrefix/et.js"
            },
            eu: {
                pattern: "hyphenationPatternsEu",
                file: "%patternPrefix/eu.js"
            },
            fi: {
                pattern: "hyphenationPatternsFi",
                file: "%patternPrefix/fi.js"
            },
            fr: {
                pattern: "hyphenationPatternsFr",
                file: "%patternPrefix/fr.js"
            },
            fur: {
                pattern: "hyphenationPatternsFur",
                file: "%patternPrefix/fur.js"
            },
            ga: {
                pattern: "hyphenationPatternsGa",
                file: "%patternPrefix/ga.js"
            },
            gl: {
                pattern: "hyphenationPatternsGl",
                file: "%patternPrefix/gl.js"
            },
            grc: {
                pattern: "hyphenationPatternsGrc",
                file: "%patternPrefix/grc.js"
            },
            gu: {
                pattern: "hyphenationPatternsGu",
                file: "%patternPrefix/gu.js"
            },
            hi: {
                pattern: "hyphenationPatternsHi",
                file: "%patternPrefix/hi.js"
            },
            hr: {
                pattern: "hyphenationPatternsHr",
                file: "%patternPrefix/hr.js"
            },
            hsb: {
                pattern: "hyphenationPatternsHsb",
                file: "%patternPrefix/hsb.js"
            },
            hu: {
                pattern: "hyphenationPatternsHu",
                file: "%patternPrefix/hu.js"
            },
            hy: {
                pattern: "hyphenationPatternsHy",
                file: "%patternPrefix/hy.js"
            },
            ia: {
                pattern: "hyphenationPatternsIa",
                file: "%patternPrefix/ia.js"
            },
            id: {
                pattern: "hyphenationPatternsId",
                file: "%patternPrefix/id.js"
            },
            is: {
                pattern: "hyphenationPatternsIs",
                file: "%patternPrefix/is.js"
            },
            it: {
                pattern: "hyphenationPatternsIt",
                file: "%patternPrefix/it.js"
            },
            ka: {
                pattern: "hyphenationPatternsKa",
                file: "%patternPrefix/ka.js"
            },
            kmr: {
                pattern: "hyphenationPatternsKmr",
                file: "%patternPrefix/kmr.js"
            },
            kn: {
                pattern: "hyphenationPatternsKn",
                file: "%patternPrefix/kn.js"
            },
            la: {
                pattern: "hyphenationPatternsLa",
                file: "%patternPrefix/la.js"
            },
            "la-classic": {
                pattern: "hyphenationPatternsLaClassic",
                file: "%patternPrefix/la-classic.js"
            },
            "la-liturgic": {
                pattern: "hyphenationPatternsLaLiturgic",
                file: "%patternPrefix/la-liturgic.js"
            },
            lt: {
                pattern: "hyphenationPatternsLt",
                file: "%patternPrefix/lt.js"
            },
            lv: {
                pattern: "hyphenationPatternsLv",
                file: "%patternPrefix/lv.js"
            },
            ml: {
                pattern: "hyphenationPatternsMl",
                file: "%patternPrefix/ml.js"
            },
            mn: {
                pattern: "hyphenationPatternsMn",
                file: "%patternPrefix/mn.js"
            },
            mr: {
                pattern: "hyphenationPatternsMr",
                file: "%patternPrefix/mr.js"
            },
            "mul-ethi": {
                pattern: "hyphenationPatternsMulEthi",
                file: "%patternPrefix/mul-ethi.js"
            },
            nb: {
                pattern: "hyphenationPatternsNb",
                file: "%patternPrefix/nb.js"
            },
            nl: {
                pattern: "hyphenationPatternsNl",
                file: "%patternPrefix/nl.js"
            },
            nn: {
                pattern: "hyphenationPatternsNn",
                file: "%patternPrefix/nn.js"
            },
            no: {
                pattern: "hyphenationPatternsNo",
                file: "%patternPrefix/no.js"
            },
            oc: {
                pattern: "hyphenationPatternsOc",
                file: "%patternPrefix/oc.js"
            },
            or: {
                pattern: "hyphenationPatternsOr",
                file: "%patternPrefix/or.js"
            },
            pa: {
                pattern: "hyphenationPatternsPa",
                file: "%patternPrefix/pa.js"
            },
            pl: {
                pattern: "hyphenationPatternsPl",
                file: "%patternPrefix/pl.js"
            },
            pms: {
                pattern: "hyphenationPatternsPms",
                file: "%patternPrefix/pms.js"
            },
            pt: {
                pattern: "hyphenationPatternsPt",
                file: "%patternPrefix/pt.js"
            },
            rm: {
                pattern: "hyphenationPatternsRm",
                file: "%patternPrefix/rm/js"
            },
            ro: {
                pattern: "hyphenationPatternsRo",
                file: "%patternPrefix/ro.js"
            },
            ru: {
                pattern: "hyphenationPatternsRu",
                file: "%patternPrefix/ru.js"
            },
            sa: {
                pattern: "hyphenationPatternsSa",
                file: "%patternPrefix/sa.js"
            },
            "sh-cyrl": {
                pattern: "hyphenationPatternsShCyrl",
                file: "%patternPrefix/sh-cyrl.js"
            },
            "sh-latn": {
                pattern: "hyphenationPatternsShLatn",
                file: "%patternPrefix/sh-latn.js"
            },
            sk: {
                pattern: "hyphenationPatternsSk",
                file: "%patternPrefix/sk.js"
            },
            sl: {
                pattern: "hyphenationPatternsSl",
                file: "%patternPrefix/sl.js"
            },
            "sr-cyrl": {
                pattern: "hyphenationPatternsSrCyrl",
                file: "%patternPrefix/sr-cyrl.js"
            },
            sv: {
                pattern: "hyphenationPatternsSv",
                file: "%patternPrefix/sv.js"
            },
            ta: {
                pattern: "hyphenationPatternsTa",
                file: "%patternPrefix/ta.js"
            },
            te: {
                pattern: "hyphenationPatternsTe",
                file: "%patternPrefix/te.js"
            },
            th: {
                pattern: "hyphenationPatternsTh",
                file: "%patternPrefix/th.js"
            },
            tk: {
                pattern: "hyphenationPatternsTk",
                file: "%patternPrefix/tk.js"
            },
            tr: {
                pattern: "hyphenationPatternsTr",
                file: "%patternPrefix/tr.js"
            },
            uk: {
                pattern: "hyphenationPatternsUk",
                file: "%patternPrefix/uk.js"
            },
            "zh-latn": {
                pattern: "hyphenationPatternsZhLatn",
                file: "%patternPrefix/zh-latn.js"
            }
        }
    });
})(jQuery, fluid_3_0_0);
