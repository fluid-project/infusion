/*
Copyright 2007 University of Toronto

Licensed under the GNU General Public License or the MIT license.
You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the GPL and MIT License at
https://source.fluidproject.org/svn/sandbox/tabindex/trunk/LICENSE.txt
*/
(function ($) {
	// Private functions.
	var normalizeTabindexName = function () {
	    return $.browser.msie ? "tabIndex" : "tabindex";
	}

	var getValue = function (elements) {
        if (elements.length <= 0) {
            return undefined;
        }

		if (!elements.hasTabindexAttr ()) {
		    return canHaveDefaultTabindex (elements) ? Number (0) : undefined;
		}

        // Get the attribute (.attr () doesn't work for tabIndex in IE) and return it as a number value.
		var value = elements[0].getAttribute (normalizeTabindexName ());
		return Number (value);
	};

	var setValue = function (elements, toIndex) {
		return elements.each (function (i, item) {
			$ (item).attr (normalizeTabindexName (), toIndex);
		});
	};

	var canHaveDefaultTabindex = function (elements) {
       if (elements.length <= 0) {
           return false;
       }

	   return jQuery (elements[0]).is ("a, input, button, select, area, textarea, object");
	}

	// Public methods.
	$.fn.tabindex = function (toIndex) {
		if (toIndex !== null && toIndex !== undefined) {
			return setValue (this, toIndex);
		} else {
			return getValue (this);
		}
	};

	$.fn.removeTabindex = function () {
		return this.each(function (i, item) {
			$ (item).removeAttr (normalizeTabindexName ());
		});
	};

	$.fn.hasTabindexAttr = function () {
	    if (this.length <= 0) {
	        return false;
	    }

	    var attributeNode = this[0].getAttributeNode (normalizeTabindexName ());
        return attributeNode ? attributeNode.specified : false;
	};

	$.fn.hasTabindex = function () {
        return this.hasTabindexAttr () || canHaveDefaultTabindex (this);
	};

}) (jQuery);
