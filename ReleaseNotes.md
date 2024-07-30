# Release Notes for Fluid Infusion 4

[Fluid Project](https://fluidproject.org)

[Infusion Documentation](https://github.com/fluid-project/infusion-docs)

## What's New in 4.7.1

* Maintenance release which resolves
  * [FLUID-6781](https://issues.fluidproject.org/browse/FLUID-6781) 404 error for sourcing open-sans font in
    SeparatedPanelPrefsEditor styles.

## What's New in 4.7.0

* New features
  * [FLUID-6763](https://issues.fluidproject.org/browse/FLUID-6763) UI Options: Add Atkinson Hyperlegible font
  * [FLUID-6754](https://issues.fluidproject.org/browse/FLUID-6754) Add a text style option for system-ui
* Resolves
  * [FLUID-6764](https://issues.fluidproject.org/browse/FLUID-6764) Infusion's jquery.standalone file throws an error
    when loaded in an AudioWorkletGlobalScope

## What's New in 4.6.0

* Maintenance release which resolves
  * [FLUID-6758](https://issues.fluidproject.org/browse/FLUID-6758) Selection reading continues from where page reading
    stopped
  * [FLUID-6757](https://issues.fluidproject.org/browse/FLUID-6757) Rendering and other methods for the selection reader
    are not invokers
  * [FLUID-6756](https://issues.fluidproject.org/browse/FLUID-6756) regenerateCursor function defined in the global scope
    in both Fluid.js and FluidIoC.js

## What's New in 4.6.0

* Maintenance release which resolves
  * [FLUID-6758](https://issues.fluidproject.org/browse/FLUID-6758) Selection reading continues from where page reading
    stopped
  * [FLUID-6757](https://issues.fluidproject.org/browse/FLUID-6757) Rendering and other methods for the selection reader
    are not invokers
  * [FLUID-6756](https://issues.fluidproject.org/browse/FLUID-6756) regenerateCursor function defined in the global scope
    in both Fluid.js and FluidIoC.js

## What's New in 4.5.0

* Maintenance release which resolves
  * [FLUID-6753](https://issues.fluidproject.org/browse/FLUID-6753) Framework error messages which attempt to dump the
    entire component are unreadable
  * [FLUID-6749](https://issues.fluidproject.org/browse/FLUID-6749) Stop using iframe to render preferences editor

## What's New in 4.4.0

* Maintenance release which resolves
  * [FLUID-6750](https://issues.fluidproject.org/browse/FLUID-6750) Model-driven relocalisation does not take account
    of initial model values

## What's New in 4.3.0

* Maintenance release which resolves
  * [FLUID-6748](https://issues.fluidproject.org/browse/FLUID-6748) Remove the auto save of panel index in separated
    panel UIO
  * [FLUID-6745](https://issues.fluidproject.org/browse/FLUID-6745) Improve TextNodeParser so that it can be configured
    with a free hash of selectors to ignore
  * [FLUID-6744](https://issues.fluidproject.org/browse/FLUID-6744) Failure distributing to gradeNames for component
    which has undefined options

## What's New in 4.2.0

* Maintenance release which resolves
  * [FLUID-6742](https://issues.fluidproject.org/browse/FLUID-6742) Race condition in IoC Testing Framework tests
    exposed by upgrade to Chrome 103
  * [FLUID-6741](https://issues.fluidproject.org/browse/FLUID-6741) Workflow failure when constructed lensed component
    from asynchronous resource

## What's New in 4.1.0

* Maintenance release which resolves
  * [FLUID-6730](https://issues.fluidproject.org/browse/FLUID-6730) Removed some obsoleted utilities - fluid.accumulate,
    fluid.contains, fluid.add, fluid.stableSort
  * [FLUID-6729](https://issues.fluidproject.org/browse/FLUID-6729) References into local record such as {source} and
    {sourcePath} can't be resolved in interpolated relay segments
  * [FLUID-6728](https://issues.fluidproject.org/browse/FLUID-6728) A sourcePath into the first element of an array fails
    to resolve in contexts where expandImmediate is used
  * [FLUID-6727](https://issues.fluidproject.org/browse/FLUID-6727) Improve documentation (retrospectively) about changes
    in DataSource API in the 3.0.0 release

## What's New in 4.0.0?

Highlights in Infusion 4 include:

* Changes to the Preferences Framework to make it easier to integrate in terms of choosing which preferences are used
  and working with styling enactors via CSS custom properties
* Improvements to localization of the Preferences Framework/UI Options, and resource loaders
* The foundation of the [Potentia II](https://issues.fluidproject.org/browse/FLUID-6148) work and future framework
  changes/improvements.

See: [CHANGELOG.md](./CHANGELOG.md) for more details.

## How Do I Get Infusion?

* [Download a Release](https://github.com/fluid-project/infusion/releases)
* [Install from NPM](https://www.npmjs.com/package/infusion)
* [Fork on GitHub](https://github.com/fluid-project/infusion)
* [Use from a Content Distribution Network(CDN)](https://unpkg.com/browse/infusion)
  * To try out Infusion quickly you can use the following `script` tag to include the full framework from the CDN:
    `<script src='https://unpkg.com/browse/infusion@4.0.0/dist/infusion-all.js'></script>`

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
* [Roboto Slab](https://github.com/googlefonts/robotoslab)
  * via [Fontsource](https://fontsource.org/fonts/roboto-slab)

### BSD-3

* [Hypher v0.2.5](https://github.com/bramstein/Hypher)
* [Sinon v12.0.1](https://sinonjs.org)

### CC-BY-4.0

* [Infusion Icons](https://github.com/fluid-project/infusion-icons)
  * Orator-Icons
  * OverviewPanel-Icons
  * PrefsFramework-Icons
  * Uploader-Icons

### LGPL

* [hyphenation-patterns v0.2.2](https://github.com/bramstein/hyphenation-patterns)

### MIT License

* [HTML5 Boilerplate v4.3](https://html5boilerplate.com/)
* [jQuery v3.6.0](https://jquery.com/)
* [jQuery QUnit v1.12.0](https://qunitjs.com)
* [jQuery QUnit Composite v1.0.1](https://github.com/jquery/qunit-composite)
* [jQuery scrollTo v2.1.3](https://github.com/flesler/jquery.scrollTo)
* [jQuery Touch Punch v0.2.3](http://touchpunch.furf.com/)
* [jQuery UI (Core; Interactions: draggable, resizable; Widgets: button, checkboxradio, controlgroup, dialog, mouse,
  slider, tabs, and tooltip) v1.13.0](https://jqueryui.com/)
* [jquery.selectbox v0.5 (forked)](https://github.com/fluid-project/jquery.selectbox)
* [jquery.simulate v1.0.2](https://github.com/eduardolundgren/jquery-simulate)
* [Micro Clearfix](http://nicolasgallagher.com/micro-clearfix-hack/)

### Open Font License

* [Atkinson Hyperlegible](https://brailleinstitute.org/freefont)
  * via [Fontsource](https://fontsource.org/fonts/atkinson-hyperlegible)
* [Lato font v2.015](http://www.latofonts.com)
* [Love Ya Like A Sister font](https://fonts.google.com/specimen/Love+Ya+Like+A+Sister)
* [OpenDyslexic](https://opendyslexic.org/)
  * via [Fontsource](https://fontsource.org/fonts/opendyslexic)
* [Open Sans font](https://github.com/googlefonts/opensans)
  * via [Fontsource](https://fontsource.org/fonts/open-sans)

### zlib/libpng License

* [fastXmlPull is based on XML for Script's Fast Pull Parser v3.1](
  https://wiki.fluidproject.org/display/fluid/Licensing+for+fastXmlPull.js)

## Documentation

Documentation and tutorials can found on the [Infusion Documentation](
https://docs.fluidproject.org/infusion/development/) site.

## Supported Browsers

Infusion 4.0.0 is tested with the latest versions of the following desktop browsers:

* [Chrome](https://google.com/chrome/)
* [Edge](https://microsoft.com/edge/)
* [Firefox](https://mozilla.org/firefox/)
* [Safari](https://apple.com/safari/)

The Fluid Project also maintains a [shareable configuration](https://github.com/fluid-project/browserslist-config-fluid)
for [Browserslist](https://github.com/browserslist/browserslist). In the future, this configuration will be used within
Fluid Infusion.

For more information see the [Fluid Infusion browser support](https://wiki.fluidproject.org/display/fluid/Browser+Support)
wiki page.

### Testing Configurations

## Known Issues

The Fluid Project uses a [JIRA](https://issues.fluidproject.org) website to track bugs. Some of the known issues in this
release are described here:

* [FLUID-6772](https://issues.fluidproject.org/browse/FLUID-6772) Removal of UIO iframe in Infusion 4.5.0 causes
  overflow issue on Webkit/Chromium browsers
* [FLUID-6722](https://issues.fluidproject.org/browse/FLUID-6722) Pager tooltip shows wrong data range after sorting by
  column
* [FLUID-6720](https://issues.fluidproject.org/browse/FLUID-6720) The pager tooltips do not display on mobile
* [FLUID-6708](https://issues.fluidproject.org/browse/FLUID-6708) Sourceless relay rule with non-local target causes
  failure
* [FLUID-6700](https://issues.fluidproject.org/browse/FLUID-6700) Materialised binding makes validation workflow
  impossible due to backwash protection
* [FLUID-6109](https://issues.fluidproject.org/browse/FLUID-6109) Infusion framework dist doesn't include
  contextawareness
