/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, sinon, onYouTubeIframeAPIReady */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /**************************************************************************
     * Mock for the YT.Player
     **************************************************************************/

    fluid.registerNamespace("fluid.tests.mock.YT");

    // Thisist object to be created with the new constructor to match YT.Player api
    fluid.tests.mock.YT.player = function (id, options) {
        this.id = id;
        this.options = options;
        this.loadModule = sinon.stub();
        this.unloadModule = sinon.stub();
        this.setOption = sinon.stub();
        this.getOption = sinon.stub();
    };

    fluid.tests.mock.YT.createGlobal = function () {
        window.YT = {
            Player: fluid.tests.mock.YT.player
        };
    };

    fluid.tests.mock.YT.removeGlobal = function () {
        delete window.YT;
    };

    fluid.defaults("fluid.tests.mockYTEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        events: {
            onYTPlayerReady: null
        },
        listeners: {
            "onDestroy.removeMockYTPlayer": "fluid.tests.mock.YT.removeGlobal",
            "onDestroy.resetHistory": {
                "this": "sinon",
                method: "resetHistory"
            }
        },
        invokers: {
            initYT: "fluid.tests.mockYTEnvironment.initYT"
        }
    });

    fluid.tests.mockYTEnvironment.initYT = function (that) {
        fluid.tests.mock.YT.createGlobal();
        if (window.onYouTubeIframeAPIReady) {
            onYouTubeIframeAPIReady();
        }
        that.events.onYTPlayerReady.fire();
    };

})();
