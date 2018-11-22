# Release Notes for Fluid Infusion 3.0.0

[Fluid Project](https://fluidproject.org)

[Infusion Documentation](https://github.com/fluid-project/infusion-docs)

## What's New in 3.0.0?

Currently the contents of this file represent a placeholder for future Infusion 3.0.0 release notes.

### New Features

* Preference framework
  * Updated look of on/off toggles

### Removal of Deprecated Features

* Preference framework
  * Collapsed inputsLarger and emphasizeLinks preferences into enhanceInputs

## How Do I Get Infusion?

* [Download a Release](https://github.com/fluid-project/infusion/releases)
* [Install from NPM](https://www.npmjs.com/package/infusion)
* [Fork on GitHub](https://github.com/fluid-project/infusion)
* [Use from the CDNJS Content Distribution Network](https://cdnjs.com/libraries/infusion)
  * To try out Infusion quickly you can use the following `script` tag to include the full framework from the CDN:
    `<script src='https://cdnjs.cloudflare.com/ajax/libs/infusion/2.0.0/infusion-all.min.js'></script>`

See [How Do I Create an Infusion Package?](README.md#how-do-i-create-an-infusion-package), for details on creating
complete or custom packages of Infusion.

## Demos

Infusion ships with demos of all of the components in action. You can find them in the _**demos**_ folder in the release
bundle or on our [build site](https://build.fluidproject.org/).

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
* [Sinon v6.1.3](https://sinonjs.org)

### LGPL

* [hyphenation-patterns v0.2.1](https://github.com/bramstein/hyphenation-patterns)

### MIT License

* [HTML5 Boilerplate v4.3](https://html5boilerplate.com/)
* [jQuery v3.3.1](https://jquery.com/)
* [jQuery Mockjax v2.5.0](https://github.com/jakerella/jquery-mockjax)
* [jQuery QUnit v1.12.0](https://qunitjs.com)
* [jQuery QUnit Composite v1.0.1](https://github.com/jquery/qunit-composite)
* [jQuery scrollTo v2.1.2](https://github.com/flesler/jquery.scrollTo)
* [jQuery Touch Punch v0.2.3](http://touchpunch.furf.com/)
* [jQuery UI (Core; Interactions: draggable, resizable; Widgets: button, checkboxradio, controlgroup, dialog, mouse,
  slider, tabs, and tooltip) v1.12.1](https://jqueryui.com/)
* [jquery.selectbox v0.5 (forked)](https://github.com/fluid-project/jquery.selectbox)
* [jquery.simulate v1.0.2](https://github.com/eduardolundgren/jquery-simulate)
* [Micro Clearfix](http://nicolasgallagher.com/micro-clearfix-hack/)
* [Normalize v8.0.0](https://necolas.github.io/normalize.css/)
* [url-polyfill v1.0.14](https://github.com/lifaon74/url-polyfill)

### Open Font License

* [Lato font v2.015](http://www.latofonts.com)
* [Love Ya Like A Sister font](https://fonts.google.com/specimen/Love+Ya+Like+A+Sister)

### zlib/libpng License

* [fastXmlPull is based on XML for Script's Fast Pull Parser v3.1](
  https://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js)

## Documentation

Documentation and tutorials can found on the [Infusion Documentation](
https://docs.fluidproject.org/infusion/development/) site.

## Supported Browsers

Infusion 3.0.0 was tested with the following browsers:

Additional testing for mobile devices was performed with the following:

For more information see the [Fluid Infusion browser support](
https://wiki.fluidproject.org/display/fluid/Prior+Browser+Support) wiki page.

### Testing Configurations

<table>
    <summary>Testing Configurations</summary>
    <thead>
        <tr>
            <th rowspan="2">Testing Task</th>
            <th colspan="5">Desktop Browser</th>
            <th colspan="2">Mobile Browser</th>
        </tr>
        <tr>
            <th>Chrome</th>
            <th>Firefox</th>
            <th>IE 11</th>
            <th>MS Edge</th>
            <th>Safari</th>
            <th>Chrome for Android</th>
            <th>Safari iOS</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Run All Unit Tests</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Smoke Tests - All Manual Tests</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Smoke Tests - All Demos</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Smoke Tests - All Examples</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Inline Edit QA Test Plan - Simple Text</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Keyboard Accessibility QA Test Plan</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Pager QA Test Plan</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Progress QA Test Plan</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - Image Reorderer</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - Layout Reorderer</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - List Reorderer</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Reorderer QA Test Plan - Grid Reorderer</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Preferences Framework QA Test Plan</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>UI Options QA Test Plan - Separated Panel</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Uploader QA Test Plan</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>

## Known Issues

The Fluid Project uses a [JIRA](https://issues.fluidproject.org) website to track bugs. Some of the known issues in this
release are described here:
