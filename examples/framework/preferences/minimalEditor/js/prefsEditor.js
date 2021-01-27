/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one of these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global awesomeCars */

(function () {
    "use strict";

    /**
     * Panel for the heated seats preference
     */
    fluid.defaults("awesomeCars.prefs.panels.heatedSeats", {
        gradeNames: ["fluid.prefs.panel"],

        // the Preference Map maps the information in the primary schema to this panel
        preferenceMap: {
            // the key must match the name of the pref in the primary schema
            "awesomeCars.prefs.heatedSeats": {
                // this key is the path into the panel's model where this preference is stored
                "model.heatedSeats": "value"
            }
        },

        // selectors identify elements in the DOM that need to be accessed by the code;
        // in this case, the Renderer will render data into these particular elements
        selectors: {
            heatedSeats: ".awec-heatedSeats"
        },

        // the ProtoTree is basically instructions to the Renderer
        // the keys in the prototree match the selectors above
        protoTree: {
            // this value is a reference to the last part of the model path in the preferenceMap
            heatedSeats: "${heatedSeats}"
        }
    });

    /**
     * Initialize and instantiate the editor
     * @param {jQueryable} container -The container for our component.
     * @return {Object} The created component.
     * TODO: Update this when https://issues.fluidproject.org/browse/FLUID-5817 is addressed
     */
    awesomeCars.prefs.init = function (container) {
        return fluid.prefs.create(container, {
            build: {
                gradeNames: ["awesomeCars.prefs.auxSchema"]
            }
        });
    };

})();
