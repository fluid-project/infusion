/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one of these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

(function () {
    "use strict";

    /**
     * Initialize the PrefsEditor global settings store.
     * The globalSettingsStore handles the storage and retrieval of preferences,
     * by default it is configured to use the fluid.prefs.cookieStore
     * which stores preferences in a browser cookie.
     */
    fluid.prefs.globalSettingsStore();

    /**
     * Initialize the UI Enhancer for the page.
     */
    fluid.pageEnhancer({
        uiEnhancer: {
            //  The "fluid.uiEnhancer.starterEnactors" grade mentioned below indicate that the
            //  "starter" enactors should be used. These correspond to the
            //  same set of enactors used in a typical UI Options configuration. However, a
            //  custom set of enactors could be configured instead.
            gradeNames: ["fluid.uiEnhancer.starterEnactors"],
            // The UI Enhancer's Table of Contents uses an HTML template. This tells the component
            // where to find that template.
            tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html"
        }
    });
})();
