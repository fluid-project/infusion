/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global fluid_1_1, jQuery, window, demo*/

var fluid_1_1 = fluid_1_1 || {};
var demo = demo || {};

(function ($,fluid) {
    // ensure browser is permitted to crawl the filesystem before running demo
    // If the browser is not, AND the demo is known to require ajax, then halt the demo and show warning
    var abortDemo = false;
    try {
        $.ajax({
            url: "../../../build-scripts/build.xml",
            async : false,
            error: function (XMLHttpRequest, state, error) {
                if (error && error.code === 1012 && (demo.name === "uiOptions" || demo.name === "Uploader") ) {
                    // Access denide: we're prob. in FF with the same origin policy blocking our fetch
                    abortDemo = true;
                }
            }
        });
    } catch (e) {
        abortDemo = true;
    }

    /**
     * Using the demo's base url, collect any CSS, JS, HTML code assets
     */
    var loadedLength = 0;
    var firstContentLoaded = null;
    var extractKeysFromObject = function (obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    }

    var dataModel = {
        "html" : {
            path : demo.path + "html/" + demo.name + ".html",
            tab : null,
            content : null
        },
        "css" : {
            path: demo.path + "css/" + demo.name + ".css",
            tab : null,
            content : null
        },
        "js" : {
            path: demo.path + "js/" + demo.name + ".js",
            tab : null,
            content : null
        },
        "data" : {
            path: demo.path + "data/" + demo.name + ".js",
            tab : null,
            content : null
        }
    }

    var status = {
        "html" : null,
        "css" : null,
        "js" : null
    }

    var setDemoIframe = function (error) {
        $(document).ready(function () {
            if (error) {
                $(".content").hide();
                $("iframe").attr("src", "../portal/html/sameOriginPolicyWarning.html");
            } else {
                $("iframe").attr("src", demo.path + "html/" + demo.name + ".html");
            }
        });
    }

    var extractHTML = function (data) {
        var start = data.indexOf("<body");
        var end = data.indexOf("</html>");

        data = data.substring(start, end);
        data = entityEscape(data);
        return data;
    }

    var entityEscape = function (value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&#39;')
        ;
    }

    var selectTab = function (name) {
        dataModel[name].tab.addClass("fl-tabs-active");
        dataModel[name].content.show();
    }

    var bindTabsContent = function (thisTab, thisCode) {
        thisTab.bind("click", function (event) {
            event.preventDefault();
            $(".fl-tabs-active").removeClass("fl-tabs-active");
            $("code").hide();
            $("textarea").hide();

            thisCode.show();
            thisTab.addClass("fl-tabs-active");
        });
    }

    var addAriaTabList = function(tl) {
        tl.attr({
            role: "tablist",
            "aria-multiselectable": "false"
        });
    };

    var addAriaTab = function(tb) {
        tb.attr({
            role: "tab",
            "aria-expanded": "false"
        });
    };

    var initKeyboardNav = function(tl) {
        var level1tabs = tl;
        level1tabs.attr("tabindex", "0");
        level1tabs.fluid("selectable", {
            selectableSelector: "> li",
            autoSelectFirstItem: true,
            direction : fluid.a11y.orientation.HORIZONTAL,
            onSelect : function(el) {
                var tab = $(el);
                $(".fl-tabs-active").removeClass("fl-tabs-active").attr("aria-selected", "false");

                tab.addClass("fl-tabs-active");
                tab.click();
				tab.attr("aria-selected", "true");
            }
        });

    };

    var makeTab = function (name) {
		aux = $('.fl-tabs');
        var tab = $('<li/>').html('<a href="#' + name + '" title=' + name + '>' + name + '</a>');
        $("a", tab).attr("tabindex", -1);
        aux.append(tab);

		addAriaTabList(aux);
		addAriaTab(tab);
        return tab;
    };

    var makeContent = function (name, data) {
        var code = $('<code/>');
        var plain = $('<textarea/>');

        data = (name === "html") ?  extractHTML(data) : entityEscape(data);

        code.addClass(name).html(data).hide();
        plain.addClass(name + " plaintext").html(data).hide();

        $('.fl-tabs-content').append(code).append(plain);

        code.chili();
        return code;
    };

    var loadComplete = function (name, data) {

        // Safari wont throw ajax error for 404 served locally, rather it sends success with no data
        if (data && data !== "") {
            // keep track of the first tab.
            firstContentLoaded = (firstContentLoaded) ? firstContentLoaded : name;

            dataModel[name].tab = makeTab(name);
            dataModel[name].content = makeContent(name, data);

            bindTabsContent(dataModel[name].tab, dataModel[name].content);

        } else {
            dataModel[name].content = false;
        }

        var selectTabNow = true;
        // test to see if all content has been gathered if so, select the first available tab
        $.each(dataModel, function (name, data) {
            if (data.content === null) {
                selectTabNow = false;
            }
        });

        // If we're ready to select the tab, load up the live demo iframe OR the same origin policy warning iframe
        if (selectTabNow) {
            initKeyboardNav($('.fl-tabs'));
            selectTab(firstContentLoaded);
            togglePlainColorized();
            setDemoIframe();
        }
    };

    var togglePlainColorized = function () {
        // plain view
        $(".codeOptions [href=#plaintext]").click(function (e) {
            var langID = $("#tabs .fl-tabs-active a").attr("title");
            $("code." + langID).hide(); // hide colorised
            $("textarea." + langID).show(); // show plaintext
        });

        // normal black
        $(".codeOptions [href=#normal]").click(function (e) {
            var langID = $("#tabs .fl-tabs-active a").attr("title");
            $("code." + langID).show(); // show colorised
            $("textarea." + langID).hide(); // hide plaintext
        });
    }


    if (abortDemo === false){
        // Loop through all content types, and deliver their content if found
        $.each(dataModel, function (name, data) {
            $.ajax({
                url: data.path,
                dataType: "text",
                error: function (XMLHttpRequest, state, error) {
                    loadComplete(name, false);
                },
                success: function (data, state) {
                    loadComplete(name, data);
                }
            });
        });
    } else {
        setDemoIframe(true); // use error iFrame
    }
})(jQuery, fluid_1_1)
