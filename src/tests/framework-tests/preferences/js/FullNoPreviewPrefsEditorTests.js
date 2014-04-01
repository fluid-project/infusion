/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("FullNoPreviewPrefsEditor Tests");

        fluid.tests.prefs.integrationTest("fluid.prefs.fullNoPreview", true);
        fluid.tests.prefs.mungingIntegrationTest("fluid.prefs.fullNoPreview", "#myPrefsEditor");

    });
})(jQuery);
