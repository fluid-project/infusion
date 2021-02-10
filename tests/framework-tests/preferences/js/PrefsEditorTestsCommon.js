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

(function () {
    "use strict";

    fluid.contextAware.makeChecks({"fluid.prefs.tests": true});

    fluid.contextAware.makeAdaptation({
        distributionName: "fluid.tests.prefs.tempStoreDistributor",
        targetName: "fluid.prefs.store",
        adaptationName: "strategy",
        checkName: "test",
        record: {
            contextValue: "{fluid.prefs.tests}",
            gradeNames: "fluid.prefs.tempStore",
            priority: "after:user"
        }
    });

    // Merge a member definition into its flattened form to accommodate the interim FLUID-5668 framework
    fluid.tests.mergeMembers = function (memberDef) {
        var togo;
        for (var i = 0; i < memberDef.length; ++i) {
            if (fluid.isPlainObject(togo)) {
                togo = $.extend(true, togo, memberDef[i]);
            } else {
                togo = memberDef[i];
            }
        }
        return togo;
    };

})();
