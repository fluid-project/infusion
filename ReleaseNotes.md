# Release Notes for Fluid Infusion 3.0.0

[Fluid Project](https://fluidproject.org)

[Infusion Documentation](https://github.com/fluid-project/infusion-docs)

## What's New in 3.0.0?

### New Features

* Build
  * Minified distributions:
    * infusion-all.js
    * infusion-all-no-jquery.js
    * infusion-framework.js
    * infusion-framework-no-jquery.js
    * infusion-uio.js
    * infusion-uio-no-jquery.js
* Framework
  * Added model transformations for converting between:
    * Boolean values and Strings
      * `fluid.transforms.booleanToString`
      * `fluid.transforms.stringToBoolean`
    * Date/Time and Strings
      * `fluid.transforms.dateToString`
      * `fluid.transforms.dateTimeToString`
      * `fluid.transforms.stringToDate`
    * JSON Objects and Strings
      * `fluid.transforms.objectToJSONString`
      * `fluid.transforms.JSONstringToObject`
  * Updated model transformations:
    * Number to String transformation supports specifyhing decimal precision.
    * Round tranformation can round to an integer or decimal value
  * `fluid.stringTemplate` updated to support nested objects for interpolating values
  * Added `fluid.dataSource` grade
    * _**NOTE:** The scheme for configuring writable dataSources is not compatible with that seen in some development
      releases of Infusion, e.g. 3.0.0-dev and 4.0.0-dev - see [API Changes documentation](https://docs.fluidproject.org/infusion/development/apichangesfrom2_0to3_0#datasources)
      for more details_
  * Added `fluid.remoteModelComponent` for keeping remote and local models in sync.
* Preference framework
  * Switched from Stylus to SASS for CSS pre-processing
  * Responsive design for small screens/mobile devices.
  * Updated look of on/off toggles and checkboxes
  * Added additional contrast themes based on Windows contrast themes.
  * Added the [OpenDyslexic 3](https://opendyslexic.org/) font as an option to the Text Style panel
  * Added localized message bundles for Farsi, French, Portugese, and Spanish.
  * New preferences:
    * Letter spacing
    * Syllabification preference
    * Text-to-speech preference using the Orator component
    * Word spacing preference
* Orator
  * A self voicing widget with play/pause, text highlighting, selection reading.
    * _**NOTE:** Currently there is a bug with Google supplied voice synthesizers that prevents text highlighting and
      long text being synthesized in Chrome. See [FLUID-6635](https://issues.fluidproject.org/browse/FLUID-6635)_
* Test Infrastructure
  * `jqUnit.test` supports async tests with promises

### Deprecated

More information about deprecations can be found in the [Deprecated in 3.0 docs](https://docs.fluidproject.org/infusion/development/deprecatedin3_0).

* Fast XML Pull
  * Will be removed in a future release.
* Pager
  * `fluid.pagedTable` and `fluid.table` grades and related functionality will be removed in an upcoming release.
* Renderer
  * The Renderer will be completely overhauled in an upcoming release. Expect API breakage, and that all of the existing
    Renderer implementation is deprecated. This includes potential API breakages for the Preferences Framework and
    Infusion components that use the Renderer.

## How Do I Get Infusion?

* [Download a Release](https://github.com/fluid-project/infusion/releases)
* [Install from NPM](https://www.npmjs.com/package/infusion)
* [Fork on GitHub](https://github.com/fluid-project/infusion)
* [Use from a Content Distribution Network(CDN)](https://unpkg.com/browse/infusion)
  * To try out Infusion quickly you can use the following `script` tag to include the full framework from the CDN:
    `<script src='https://unpkg.com/browse/infusion@2.0.0/dist/infusion-all.js'></script>`

See [How Do I Create an Infusion Package?](README.md#how-do-i-create-an-infusion-package), for details on creating
complete or custom packages of Infusion.

## Demos

The full Infusion package includes the demos of all of the components in action. You can find them in the _**demos**_
folder in the release bundle or on our [build site](https://build.fluidproject.org/).

When running the demos on your local machine, a web server is recommended. Several of the demos make use of AJAX calls;
which typically are not allowed by the browser when run from the local file system.

## License

Fluid Infusion is licensed under both the ECL 2.0 and new BSD licenses.

More information is available in our [wiki](https://wiki.fluidproject.org/display/fluid/Fluid+Licensing).

## Third Party Software in Infusion

This is a list of publicly available software that is redistributed with Fluid Infusion,
categorized by license:

### Apache 2.0

* [`fluid.load.scripts` is based on Jake Archibald's script loading example](
  https://www.html5rocks.com/en/tutorials/speed/script-loading/#toc-dom-rescue)
* [Open Sans font](https://www.google.com/fonts/specimen/Open+Sans)
* [Roboto font](https://fonts.google.com/specimen/Roboto)

### BSD-3

* [Hypher v0.2.5](https://github.com/bramstein/Hypher)
* [Sinon v10.0.0](https://sinonjs.org)

### CC-BY-4.0

* [Infusion Icons](https://github.com/fluid-project/infusion-icons)
  * Orator-Icons
  * OverviewPanel-Icons
  * PrefsFramework-Icons
  * Uploader-Icons

### LGPL

* [hyphenation-patterns v0.2.1](https://github.com/bramstein/hyphenation-patterns)

### MIT License

* [HTML5 Boilerplate v4.3](https://html5boilerplate.com/)
* [jQuery v3.6.0](https://jquery.com/)
* [jQuery Mockjax v2.6.0](https://github.com/jakerella/jquery-mockjax)
* [jQuery QUnit v1.12.0](https://qunitjs.com)
* [jQuery QUnit Composite v1.0.1](https://github.com/jquery/qunit-composite)
* [jQuery scrollTo v2.1.3](https://github.com/flesler/jquery.scrollTo)
* [jQuery Touch Punch v0.2.3](http://touchpunch.furf.com/)
* [jQuery UI (Core; Interactions: draggable, resizable; Widgets: button, checkboxradio, controlgroup, dialog, mouse,
  slider, tabs, and tooltip) v1.12.1](https://jqueryui.com/)
* [jquery.selectbox v0.5 (forked)](https://github.com/fluid-project/jquery.selectbox)
* [jquery.simulate v1.0.2](https://github.com/eduardolundgren/jquery-simulate)
* [Micro Clearfix](http://nicolasgallagher.com/micro-clearfix-hack/)

### Open Font License

* [Lato font v2.015](http://www.latofonts.com)
* [Love Ya Like A Sister font](https://fonts.google.com/specimen/Love+Ya+Like+A+Sister)
* [OpenDyslexic 3](https://opendyslexic.org/)
  * via [NPM Package](https://github.com/ssbc/open-dyslexic) distributed under Bitstream license.

### zlib/libpng License

* [fastXmlPull is based on XML for Script's Fast Pull Parser v3.1](
  https://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js)

## Documentation

Documentation and tutorials can found on the [Infusion Documentation](
https://docs.fluidproject.org/infusion/development/) site.

## Supported Browsers

Infusion 3.0.0 is tested with the latest versions of the following desktop browsers:

* [Chrome](https://google.com/chrome/) (v91)
* [Edge](https://microsoft.com/edge/) (v91)
* [Firefox](https://mozilla.org/firefox/) (v89)
* [Safari](https://apple.com/safari/) (v14.1.1)

Additional testing is performed with the following mobile browsers:

* [Chrome](https://play.google.com/store/apps/details?id=com.android.chrome) (Android 11)
* [Safari](https://apple.com/safari/) (iPadOS 14.6)

The Fluid Project also maintains a [shareable configuration](https://github.com/fluid-project/browserslist-config-fluid)
for [Browserslist](https://github.com/browserslist/browserslist). In the future, this configuration will be used within
Fluid Infusion.

For more information see the [Fluid Infusion browser support](https://wiki.fluidproject.org/display/fluid/Browser+Support)
wiki page.

### Testing Configurations

<table>
    <summary>Tested Configurations</summary>
    <thead>
        <tr>
            <th rowspan="2">Testing Task</th>
            <th colspan="4">Desktop Browser</th>
            <th colspan="2">Mobile Browser</th>
        </tr>
        <tr>
            <th>Chrome</th>
            <th>Firefox</th>
            <th>MS Edge</th>
            <th>Safari</th>
            <th>Chrome for Android</th>
            <th>Safari iOS/iPadOS</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Run All Unit Tests</th>
            <td>Chrome 91 (macOS 11.4)</td>
            <td>Firefox 89 (macOS 11.4)</td>
            <td>MS Edge 91 (Win 10)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>Chrome 91 (Android 11)</td>
            <td>Safari 14 (iPadOS 14.6)</td>
        </tr>
        <tr>
            <th>Smoke Tests - All Manual Tests</th>
            <td>Chrome 91 (Win 10)</td>
            <td>Firefox 89 (Win 10)</td>
            <td>MS Edge 91 (Win 10)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>Chrome 91 (Android 11)</td>
            <td>Safari 14 (iPadOS 14.6)</td>
        </tr>
        <tr>
            <th>Smoke Tests - All Demos</th>
            <td>Chrome 91 (Win 10)</td>
            <td>Firefox 89 (Win 10)</td>
            <td>MS Edge 91 (Win 10)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>Chrome 91 (Android 11)</td>
            <td>Safari 14 (iPadOS 14.6)</td>
        </tr>
        <tr>
            <th>Smoke Tests - All Examples</th>
            <td>Chrome 91 (Win 10)</td>
            <td>Firefox 89 (Win 10)</td>
            <td>MS Edge 91 (Win 10)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>Chrome 91 (Android 11)</td>
            <td>Safari 14 (iPadOS 14.6)</td>
        </tr>
        <tr>
            <th>Inline Edit QA Test Plan - Simple Text</th>
            <td>Chrome 91 (Win 10) - JAWS 2021</td>
            <td>Firefox 89 (Win 10) - NVDA 2020.4</td>
            <td>MS Edge 91 (Win 10) - Narrator</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Keyboard Accessibility QA Test Plan</th>
            <td>Chrome 91 (Win 10) - JAWS 2021</td>
            <td>Firefox 89 (Win 10) - NVDA 2020.4</td>
            <td>MS Edge 91 (Win 10) - Narrator</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Pager QA Test Plan</th>
            <td>Chrome 91 (Win 10) - JAWS 2021</td>
            <td>Firefox 89 (Win 10) - NVDA 2020.4</td>
            <td>MS Edge 91 (Win 10) - Narrator</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Progress QA Test Plan</th>
            <td>Chrome 91 (Win 10) - JAWS 2021</td>
            <td>Firefox 89 (Win 10) - NVDA 2020.4</td>
            <td>MS Edge 91 (Win 10) - Narrator</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - Image Reorderer</th>
            <td>Chrome 91 (macOS 11.4)</td>
            <td>Firefox 89 (macOS 11.4)</td>
            <td>MS Edge 91 (Win 10) - Narrator</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - Layout Reorderer</th>
            <td>Chrome 91 (macOS 11.4)</td>
            <td>Firefox 89 (macOS 11.4)</td>
            <td>MS Edge 91 (macOS 11.4)</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - List Reorderer</th>
            <td>Chrome 91 (macOS 11.4)</td>
            <td>Firefox 89 (Win 10) - NVDA 2020.4</td>
            <td>MS Edge 91 (macOS 11.4)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - Grid Reorderer</th>
            <td>Chrome 91 (Win 10) - JAWS 2021</td>
            <td>Firefox 89 (macOS 11.4)</td>
            <td>MS Edge 91 (macOS 11.4)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Preferences Framework QA Test Plan</th>
            <td>Chrome 91 (Win 10) - JAWS 2021</td>
            <td>Firefox 89 (Win 10) - NVDA 2020.4</td>
            <td>MS Edge 91 (Win 10) - Narrator</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>UI Options QA Test Plan - Separated Panel</th>
            <td>Chrome 91 (macOS 11.4)</td>
            <td>Firefox 89 (macOS 11.4)</td>
            <td>MS Edge 91 (Win 10)</td>
            <td>Safari 14.1.1 (macOS 11.4) - VoiceOver</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
        <tr>
            <th>Uploader QA Test Plan</th>
            <td>Chrome 91 (macOS 11.4)</td>
            <td>Firefox 89 (macOS 11.4)</td>
            <td>MS Edge 91 (macOS 11.4)</td>
            <td>Safari 14.1.1 (macOS 11.4)</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
    </tbody>
</table>

## Known Issues

The Fluid Project uses a [JIRA](https://issues.fluidproject.org) website to track bugs. Some of the known issues in this
release are described here:

### Framework

* [FLUID-5761: Silent failure when subcomponent is given same name as invoker](https://issues.fluidproject.org/browse/FLUID-5761)

### Preferences Framework

* [FLUID-4491: Line spacing doesn't affect elements that have a line-height style set](https://issues.fluidproject.org/browse/FLUID-4491)
* [FLUID-5223: If there's exactly one text field in the prefs editor, pressing enter on most inputs causes form to submit](https://issues.fluidproject.org/browse/FLUID-5223)
* [FLUID-5734: Default contrast option takes the styling of the currently selected contrast theme](https://issues.fluidproject.org/browse/FLUID-5734)
* [FLUID-6216: The default text style options aren't available across all platforms](https://issues.fluidproject.org/browse/FLUID-6216)
* [FLUID-6611: Line-spacing may not increment correctly when the base line-height is set to "normal"](https://issues.fluidproject.org/browse/FLUID-6611)
* [FLUID-6635: Orator's domReader does not properly selfVoice and highlight content in Chrome](https://issues.fluidproject.org/browse/FLUID-6635)
* [FLUID-6648: Switch slider temporarily disappears when clicked or activated with space](https://issues.fluidproject.org/browse/FLUID-6648)

### Reorderer

* [FLUID-4437: Focus styling persists after moving focus from Reorderer](https://issues.fluidproject.org/browse/FLUID-4437)
* [FLUID-6013: The Grid Reorderer and Image Reorderer are missing ARIA role=row containers](https://issues.fluidproject.org/browse/FLUID-6013)
