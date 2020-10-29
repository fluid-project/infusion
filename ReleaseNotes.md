# Release Notes for Fluid Infusion 3.0.0

[Fluid Project](https://fluidproject.org)

[Infusion Documentation](https://github.com/fluid-project/infusion-docs)

## What's New in 3.0.0?

Currently the contents of this file represent a placeholder for future Infusion 3.0.0 release notes.

### New Features

* Preference framework
  * Updated look of on/off toggles
  * Added the [OpenDyslexic 3](https://opendyslexic.org/) font as an option to the Text Style panel

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
* [OpenDyslexic 3](https://opendyslexic.org/)

### zlib/libpng License

* [fastXmlPull is based on XML for Script's Fast Pull Parser v3.1](
  https://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js)

## Documentation

Documentation and tutorials can found on the [Infusion Documentation](
https://docs.fluidproject.org/infusion/development/) site.

## Supported Browsers

Infusion 3.0.0 is tested with the latest versions of the following desktop browsers:

* [Chrome](https://google.com/chrome/)
* [Edge](https://microsoft.com/edge/)
* [Firefox](https://mozilla.org/firefox/)
* [Safari](https://apple.com/safari/)

Additional testing is performed with the following mobile browsers:

* [Android Chrome](https://play.google.com/store/apps/details?id=com.android.chrome)
* [iOS Safari](https://apple.com/safari/)

The Fluid Project also maintains a [shareable configuration](https://github.com/fluid-project/browserslist-config-fluid)
for [Browserslist](https://github.com/browserslist/browserslist). In the future, this configuration will be used within
Fluid Infusion.

For more information see the [Fluid Infusion browser support](https://wiki.fluidproject.org/display/fluid/Browser+Support)
wiki page.

## Known Issues

The Fluid Project uses a [JIRA](https://issues.fluidproject.org) website to track bugs. Some of the known issues in this
release are described here:
