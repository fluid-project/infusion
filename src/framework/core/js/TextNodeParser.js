/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

/*******************************************************************************
 * fluid.textNodeParser
 *
 * Parses out the text nodes from a DOM element and its descendants
 *******************************************************************************/

fluid.defaults("fluid.textNodeParser", {
    gradeNames: ["fluid.component"],
    events: {
        onParsedTextNode: null,
        afterParse: null
    },
    ignoredSelectors: {
        ariaHidden: "[aria-hidden=\"true\"]"
    },
    invokers: {
        parse: {
            funcName: "fluid.textNodeParser.parse",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{that}.events.afterParse.fire"]
        },
        hasTextToRead: {
            funcName: "fluid.textNodeParser.hasTextToRead",
            args: ["{arguments}.0", "{that}.options.ignoredSelectors"]
        },
        getLang: "fluid.textNodeParser.getLang"
    }
});

/**
 * Checks if a string contains non-whitespace characters.
 * inspired by https://stackoverflow.com/a/2031143
 *
 * @param {String} str - the String to test
 *
 * @return {Boolean} - `true` if a word, `false` otherwise.
 */
fluid.textNodeParser.hasGlyph = function (str) {
    return fluid.isValue(str) && /\S/.test(str);
};

/**
 * Determines if there is text in an element that should be read.
 * Will return false in the following conditions:
 * - elm is falsey (undefined, null, etc.)
 * - elm's offsetParent is falsey, unless elm is the `body` element
 * - elm has no text or only whitespace
 * - elm or an ancestor matches any of the selectors appearing as values in the supplied map
 *
 * NOTE: Text added by pseudo elements (e.g. :before, :after) are not considered.
 *
 * @param {Dom} elm - a DOM node to be tested
 * @param {Object<String,String>} ignoredSelectors - A map of selectors
 *
 * @return {Boolean} - returns true if there is rendered text within the element and false otherwise.
 *                     (See conditions in description above)
 */
fluid.textNodeParser.hasTextToRead = function (elm, ignoredSelectors) {
    if (elm &&
           (elm.tagName.toLowerCase() === "body" || elm.offsetParent) &&
           fluid.textNodeParser.hasGlyph(elm.innerText)) {
        var selectors = Object.values(ignoredSelectors).filter(sel => sel);
        return !selectors.find(selector => elm.closest(selector));
    } else {
        return false;
    }
};

/**
 * Uses jQuery's `closest` method to find the closest element with a lang attribute, and returns the value.
 *
 * @param {jQuery|DomElement} elm - either a DOM node or a jQuery element
 *
 * @return {String|undefined} - a valid BCP 47 language code if found, otherwise undefined.
 */
fluid.textNodeParser.getLang = function (elm) {
    return $(elm).closest("[lang]").attr("lang");
};

/**
 * The parsed information of text node, including: the node itself, its specified language, and its index within its
 * parent.
 *
 * @typedef {Object} TextNodeData
 * @property {DomNode} node - The current child node being parsed
 * @property {Integer} childIndex - The index of the child node being parsed relative to its parent
 * @property {String} lang - a valid BCP 47 language code
 */

/**
 * Recursively parses a DOM element and it's sub elements and fires the `onParsedTextNode` event for each text node
 * found. The event is fired with the text node, language and index of the text node in the list of its parent's
 * child nodes..
 *
 * Note: elements that return `false` from `that.hasTextToRead` are ignored.
 *
 * @param {fluid.textNodeParser} that - an instance of the component
 * @param {jQuery|DomElement} elm - the DOM node to parse
 * @param {String} lang - a valid BCP 47 language code.
 * @param {Event} afterParseEvent - the event to fire after parsing has completed.
 *
 * @return {TextNodeData[]} the array of parsed elements. Only text nodes for elements that have passed the
 *                          `that.hasTextToRead` check will be included.
 */
fluid.textNodeParser.parse = function (that, elm, lang, afterParseEvent) {
    elm = fluid.unwrap(elm);
    var parsed = [];

    if (that.hasTextToRead(elm)) {
        var childNodes = elm.childNodes;
        var elementLang = elm.getAttribute("lang") || lang || that.getLang(elm);
        // This funny iteration is a fix for FLUID-6435 on IE11
        Array.prototype.forEach.call(childNodes, function (childNode, childIndex) {
            if (childNode.nodeType === Node.TEXT_NODE) {
            // At this point we could avoid reporting nodes whose text consists entirely of whitespace by use of
            // fluid.textNodeParser.hasGlyph but this causes the demo at /demos/prefsFramework/ with self voicing
            // to highlight misaligned with the spoken text in Firefox - see https://github.com/fluid-project/infusion/pull/1088
                var textNodeData = {
                    node: childNode,
                    lang: elementLang,
                    childIndex: childIndex
                };
                parsed.push(textNodeData);
                that.events.onParsedTextNode.fire(textNodeData);
            } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                parsed = parsed.concat(fluid.textNodeParser.parse(that, childNode, elementLang));
            }
        });
    }

    if (afterParseEvent) {
        afterParseEvent(that, parsed);
    }

    return parsed;
};
