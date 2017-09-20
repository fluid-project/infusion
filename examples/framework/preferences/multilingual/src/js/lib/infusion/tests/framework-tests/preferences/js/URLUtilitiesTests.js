/*
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        fluid.setLogging(true);

        jqUnit.module("URLUtilities Tests");

        var testRelPath = function (options, key) {
            jqUnit.test("Expand Path " + key, function () {
                var actual =  fluid.url.computeRelativePrefix(options.outerLoc, options.iframeLoc, options.relPath);
                jqUnit.assertEquals("Relative path computed", options.expected, actual);
            });
        };

        var tests = [
            {
                iframeLoc: "file:///E:/Source/gits/infusion-master/src/framework/preferences/html/SeparatedPanelPrefsEditorFrame.html",
                outerLoc: "file:///E:/Source/gits/infusion-master/src/demos/prefsEditor/SeparatedPanelPrefsEditor/html/prefsEditor.html",
                relPath: "../../../../framework/preferences/html/",
                expected: ""
            },
            {
                iframeLoc: "file:///E:/Source/gits/infusion-master/src/framework/preferences/html/SeparatedPanelPrefsEditorFrame.html",
                outerLoc: "file:///E:/Source/gits/infusion-master/src/demos/prefsEditor/SeparatedPanelPrefsEditor/html/prefsEditor.html",
                relPath: "../../../../framework/preferences/html/extra/",
                expected: "extra/"
            },
            {
                iframeLoc: "file:///E:/Source/gits/infusion-master/src/framework/preferences/html/SeparatedPanelPrefsEditorFrame.html",
                outerLoc: "file:///E:/Source/gits/infusion-master/src/demos/prefsEditor/SeparatedPanelPrefsEditor/html/prefsEditor.html",
                relPath: "../../../../framework/preferences/html/extra/extra2/",
                expected: "extra/extra2/"
            },
            {
                iframeLoc: "file:///E:/Source/gits/infusion-master/src/framework/preferences/html/SeparatedPanelPrefsEditorFrame.html",
                outerLoc: "file:///E:/Source/gits/infusion-master/src/demos/prefsEditor/SeparatedPanelPrefsEditor/html/prefsEditor.html",
                relPath: "a/b/g/",
                expected: "../../../demos/prefsEditor/SeparatedPanelPrefsEditor/html/a/b/g/"
            },
            {
                iframeLoc: "file:///E:/Source/gits/infusion-master/src/framework/preferences/html/SeparatedPanelPrefsEditorFrame.html",
                outerLoc: "file:///E:/Source/gits/infusion-master/src/demos/prefsEditor/SeparatedPanelPrefsEditor/html/prefsEditor.html",
                relPath: "/a/b/g/",
                expected: "/a/b/g/"
            },
            {
                iframeLoc: "file:///E:/Source/gits/infusion-master/src/framework/preferences/html/SeparatedPanelPrefsEditorFrame.html",
                outerLoc: "file:///E:/Source/gits/infusion-master/src/demos/prefsEditor/SeparatedPanelPrefsEditor/html/prefsEditor.html",
                relPath: "http://localhost:8888/wordpress/wp-content/themes/infusion/framework/preferences/html/",
                expected: "http://localhost:8888/wordpress/wp-content/themes/infusion/framework/preferences/html/"
            }
        ];

        fluid.each(tests, function (test, key) {
            testRelPath(test, key);
        });
    });

})(jQuery);
