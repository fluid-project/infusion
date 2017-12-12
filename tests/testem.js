/* eslint-env node */
"use strict";
var fluid = require("../src/module/fluid");
fluid.setLogging(true);

require("gpii-testem");

fluid.defaults("fluid.tests.testem", {
    gradeNames: ["gpii.testem.coverageDataOnly"],
    testPages:  "tests/all-tests.html",
    // testPages: [
    //     "tests/framework-tests/core/html/FluidJS-test.html",
    //     "tests/framework-tests/core/html/FluidJSStandalone-test.html",
    //     "tests/framework-tests/core/html/FluidDebugging-test.html",
    //     "tests/framework-tests/core/html/FluidPromises-test.html",
    //     "tests/framework-tests/core/html/FluidDocument-test.html",
    //     "tests/framework-tests/core/html/Keyboard-a11y-test.html",
    //     "tests/framework-tests/core/html/ModelTransformation-test.html",
    //     "tests/framework-tests/core/html/DataBinding-test.html",
    //     "tests/framework-tests/core/html/FluidView-test.html",
    //     "tests/framework-tests/core/html/Caching-test.html",
    //     "tests/framework-tests/core/html/FluidRequests-test.html",
    //     "tests/framework-tests/core/html/ResourceLoader-test.html",
    //     "tests/framework-tests/renderer/html/Renderer-test.html",
    //     "tests/framework-tests/core/html/FluidIoC-test.html",
    //     "tests/framework-tests/core/html/FluidIoCStandalone-test.html",
    //     "tests/framework-tests/core/html/FluidIoCView-test.html",
    //     "tests/framework-tests/core/html/WebWorker-test.html",
    //     "tests/framework-tests/enhancement/html/ContextAwareness-test.html",
    //     "tests/framework-tests/renderer/html/RendererUtilities-test.html",
    //     "tests/framework-tests/preferences/html/AuxBuilder-test.html",
    //     "tests/framework-tests/preferences/html/Builder-test.html",
    //     "tests/framework-tests/preferences/html/Enactors-test.html",
    //     "tests/framework-tests/preferences/html/SelfVoicingEnactor-test.html",
    //     "tests/framework-tests/preferences/html/SeparatedPanelPrefsEditor-test.html",
    //     "tests/framework-tests/preferences/html/SeparatedPanelPrefsEditorResponsive-test.html",
    //     "tests/framework-tests/preferences/html/FullNoPreviewPrefsEditor-test.html",
    //     "tests/framework-tests/preferences/html/FullPreviewPrefsEditor-test.html",
    //     "tests/framework-tests/preferences/html/PageEnhancer-test.html",
    //     "tests/framework-tests/preferences/html/Panels-test.html",
    //     "tests/framework-tests/preferences/html/SelfVoicingPanel-test.html",
    //     "tests/framework-tests/preferences/html/PrimaryBuilder-test.html",
    //     "tests/framework-tests/preferences/html/Store-test.html",
    //     "tests/framework-tests/preferences/html/UIEnhancer-test.html",
    //     "tests/framework-tests/preferences/html/PrefsEditor-test.html",
    //     "tests/framework-tests/preferences/html/URLUtilities-test.html",
    //     "tests/test-core/testTests/html/jqUnit-test.html",
    //     "tests/test-core/testTests/html/IoCTesting-test.html",
    //     "tests/test-core/testTests/html/IoCTestingView-test.html",
    //     "tests/test-core/testTests/html/ConditionalTestUtils-test.html",
    //     "tests/component-tests/inlineEdit/html/InlineEdit-test.html",
    //     "tests/component-tests/pager/html/Pager-test.html",
    //     "tests/component-tests/pager/html/PagedTable-test.html",
    //     "tests/component-tests/progress/html/Progress-test.html",
    //     "tests/component-tests/reorderer/html/AriaLabeller-test.html",
    //     "tests/component-tests/reorderer/html/GeometricManager-test.html",
    //     "tests/component-tests/reorderer/html/ImageReorderer-test.html",
    //     "tests/component-tests/reorderer/html/LayoutReorderer-test.html",
    //     "tests/component-tests/reorderer/html/NestedReorderer-test.html",
    //     "tests/component-tests/reorderer/html/ReorderList-test.html",
    //     "tests/component-tests/reorderer/html/Scheduler-test.html",
    //     "tests/component-tests/tableOfContents/html/TableOfContents-test.html",
    //     "tests/component-tests/slidingPanel/html/SlidingPanel-test.html",
    //     "tests/component-tests/switch/html/Switch-test.html",
    //     "tests/component-tests/textfieldControl/html/Textfield-test.html",
    //     "tests/component-tests/textfieldControl/html/TextfieldSlider-test.html",
    //     "tests/component-tests/textfieldControl/html/TextfieldStepper-test.html",
    //     "tests/component-tests/textToSpeech/html/TextToSpeech-test.html",
    //     "tests/component-tests/tabs/html/Tabs-test.html",
    //     "tests/component-tests/tooltip/html/Tooltip-test.html",
    //     "tests/component-tests/uiOptions/html/UIOptions-test.html",
    //     "tests/component-tests/uploader/html/DemoUploadManager-test.html",
    //     "tests/component-tests/uploader/html/ErrorPanel-test.html",
    //     "tests/component-tests/uploader/html/FileQueue-test.html",
    //     "tests/component-tests/uploader/html/FileQueueView-test.html",
    //     "tests/component-tests/uploader/html/HTML5UploaderSupport-test.html",
    //     "tests/component-tests/uploader/html/Uploader-test.html",
    //     "tests/component-tests/uploader/html/UploaderCompatibility-test.html",
    //     "tests/component-tests/overviewPanel/html/OverviewPanel-test.html"
    // ],
    startupPause: 150,
    invokers: {
        pauseOnStartup: {
            funcName: "setTimeout",
            args:     ["{that}.handleTestemStart", "{that}.options.startupPause", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    testemOptions: {
        on_start: "{that}.pauseOnStartup"
    },
    sourceDirs: ["src"],
    coverageDir: "coverage",
    serveDirs:  ["src", "node_modules"]
});

module.exports = fluid.tests.testem().getTestemOptions();

