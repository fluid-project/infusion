# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Infusion from v2.0.0 onwards adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

### More Info

## [4.1.0] - 2022-05-09

### Fixed

* [FLUID-6730](https://issues.fluidproject.org/browse/FLUID-6730) Removed some obsoleted utilities - fluid.accumulate,
  fluid.contains, fluid.add

## [4.0.0] - 2022-03-17

### Added

* [FLUID-6698](https://issues.fluidproject.org/browse/FLUID-6698) Allow model relay from constant values
* [FLUID-6605](https://issues.fluidproject.org/browse/FLUID-6605) Allow contrast themes to be applied using custom
  properties only
* [FLUID-6580](https://issues.fluidproject.org/browse/FLUID-6580) "Integration constant lenses"
* [FLUID-6413](https://issues.fluidproject.org/browse/FLUID-6413) Model-driven resource localisation
* [FLUID-6390](https://issues.fluidproject.org/browse/FLUID-6390) "lensed components"
* [FLUID-6260](https://issues.fluidproject.org/browse/FLUID-6260) Enactors that modify the styling and presentation of
  content provide a class and/or CSS custom properties to hook into for custom styling
* [FLUID-6148](https://issues.fluidproject.org/browse/FLUID-6148) "Potentia II" holds aligned, transactional units of
  intent
* [FLUID-6147](https://issues.fluidproject.org/browse/FLUID-6147) Transactional units for component creation
* [FLUID-5790](https://issues.fluidproject.org/browse/FLUID-5790) cancellable promises
* [FLUID-4925](https://issues.fluidproject.org/browse/FLUID-4925) "wave of explosions"
* [FLUID-4483](https://issues.fluidproject.org/browse/FLUID-4883) Latched events acting as promises
* A basic quality implementation of [FLUID-4982](https://issues.fluidproject.org/browse/FLUID-4982) "asynchronous
  ginger world", sufficient to allow progress on new renderer for FLUID-4260, FLUID-6580
* Browser-side implementation of fluid.dataSource.URL

### Changed

* [FLUID-6695](https://issues.fluidproject.org/browse/FLUID-6695) Rationalise exception stripping code
* [FLUID-6420](https://issues.fluidproject.org/browse/FLUID-6420) Split start schema aux schema into separate schema
  grades. Consolidate component grades.
* [FLUID-6145](https://issues.fluidproject.org/browse/FLUID-6145) Make all component options immutable

For more details see: [API Changes from 3.0 to 4.0]

### Deprecated

* Core Framework
  * `fluid.contains`
  * `fluid.stableSort`
  * `fluid.add`
  * `fluid.accumulate`
* Preferences Framework / UI Options
  * In Infusion 5.0, it's planned for the Preferences Framework and UI Options to undergo a re-write and redesign. The
    API, including Auxiliary Schemas, are likely to change or be removed. This is also the case for any components that
    are used by/within the Preferences Framework.
* Components
  * UI widgets and other components included with Infusion will be evaluated for future releases. A number of these
    widgets are no longer required as native HTML options and other tools have filled in the gaps that they were meant
    to address.

For more details see: [Deprecated in 4.0]

### Removed

* [FLUID-6710](https://issues.fluidproject.org/browse/FLUID-6710) Remove versioned globals and file guards from the
  framework

### Fixed

* [FLUID-6705](https://issues.fluidproject.org/browse/FLUID-6705) Increasing line spacing pushes the sliding panel tab
  down
* [FLUID-6696](https://issues.fluidproject.org/browse/FLUID-6696) Table of Contents toggle initially has no effect if
  TOC container has display: none style
* [FLUID-6687](https://issues.fluidproject.org/browse/FLUID-6687) Adjusters/inputs are blue in iOS
* [FLUID-6482](https://issues.fluidproject.org/browse/FLUID-6482) fluid.getCallerInfo throws exception sometimes on
  Safari (atDepth exceeds stack.length)
* [FLUID-6438](https://issues.fluidproject.org/browse/FLUID-6438) Improved closure of ContextAwareness grades
* [FLUID-6418](https://issues.fluidproject.org/browse/FLUID-6418) Failure when referring to dynamic component location
  during afterDestroy
* [FLUID-6414](https://issues.fluidproject.org/browse/FLUID-6414) Allow dynamic grades to be contributed via expander
* [FLUID-6146](https://issues.fluidproject.org/browse/FLUID-6146) Mutual reference between createOnEvent components
* [FLUID-5912](https://issues.fluidproject.org/browse/FLUID-5912) {arguments} in members and models
* [FLUID-5614](https://issues.fluidproject.org/browse/FLUID-5614) "double deep trees"
* [FLUID-5519](https://issues.fluidproject.org/browse/FLUID-5519) Problematic timing of model init transaction

### More Info

* [Issues addressed in 4.0.0](https://issues.fluidproject.org/projects/FLUID/versions/11220)
* [Changes in 4.0.0](https://github.com/fluid-project/infusion/compare/v3.0.0...v4.0.0)
* [API Changes from 3.0 to 4.0]
* [Deprecated in 4.0]

[API Changes from 3.0 to 4.0]: https://docs.fluidproject.org/infusion/development/apichangesfrom3_0to4_0
[Deprecated in 4.0]: https://docs.fluidproject.org/infusion/development/deprecatedin4_0

## [3.0.0] - 2021-08-25

### Added

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
    * Number to String transformation supports specifying decimal precision.
    * Round transformation can round to an integer or decimal value
    * `fluid.stringTemplate` updated to support nested objects for interpolating values
  Added `fluid.dataSource` grade
  Added `fluid.remoteModelComponent` for keeping remote and local models in sync.
* Preference framework
  * Responsive design for small screens/mobile devices.
  * Added additional contrast themes based on Windows contrast themes.
  * Added the OpenDyslexic 3 font as an option to the Text Style panel
  * Added localized message bundles for Farsi, French, Portuguese, and Spanish.
  * New preferences:
    * Letter spacing
    * Syllabification preference
    * Text-to-speech preference using the Orator component
    * Word spacing preference
* Orator
  * A self voicing widget with play/pause, text highlighting, selection reading.
    * _**NOTE**: Currently there is a bug with Google supplied voice synthesizers that prevents text highlighting and
      long text being synthesized in Chrome. See [FLUID-6635](https://issues.fluidproject.org/browse/FLUID-6635)_
* Test Infrastructure
  * jqUnit.test supports async tests with promises

### Changed

* Builds
  * Only minified builds and distributions e.g.:
    * infusion-all.js
    * infusion-all-no-jquery.js
    * infusion-framework.js
    * infusion-framework-no-jquery.js
    * infusion-uio.js
    * infusion-uio-no-jquery.js
* Framework
  * `fluid.focus` and `fluid.blur` return an ES6 promise
* Preference framework
  * Switched from Stylus to SASS for CSS pre-processing
  * Updated look of on/off toggles and checkboxes
  * For preference maps, the keyword `default` has been replaced by `value`
  * Updated the markup template for the preferences editor
  * Updated message bundle keys

For more details see: [API Changes from 2.0 to 3.0]

### Deprecated

* Fast XML Pull
  * Will be completely removed in a future release.
* Pager
  * `fluid.pagedTable` and `fluid.table` grades and related functionality will be removed in an upcoming release.
* Renderer
  * The Renderer will be completely overhauled in an upcoming release. Expect API breakage, and that all of the existing
    Renderer implementation is deprecated. This includes potential API breakages for the Preferences Framework and
    Infusion components that use the Renderer.

For more details see: [Deprecated in 3.0]

### Removed

* Source builds and distributions. Only minified versions are provided.
* For the Reorderer component, the `stylisticOffset` selector has been removed
* `fluid.tabs` component has been removed
* The Textfield Slider removed the option to use a [jQuery UI Slider](https://jqueryui.com/slider/) in favour only
  supporting native [HTML5 range inputs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range).

For more details see: [API Changes from 2.0 to 3.0]

### Fixed

* [FLUID-4000](https://issues.fluidproject.org/browse/FLUID-4000): "Larger" inputs doesn't change input size
* [FLUID-6137](https://issues.fluidproject.org/browse/FLUID-6137): Cannot use distributeOptions to distribute an option
  when the source points at a value of 0
* [FLUID-6169](https://issues.fluidproject.org/browse/FLUID-6169): `fluid.prefs.tempStore` acts as a
  `fluid.prefs.cookieStore` by default
* [FLUID-6228](https://issues.fluidproject.org/browse/FLUID-6228): tab focusing the contrast adjuster does not scroll it
  into view.

### More Info

* [Issues addressed in 3.0.0](https://issues.fluidproject.org/projects/FLUID/versions/10720)
* [Changes in 3.0.0](https://github.com/fluid-project/infusion/compare/v2.0.0...v3.0.0)
* [API Changes from 2.0 to 3.0]
* [Deprecated in 3.0]

[API Changes from 2.0 to 3.0]: https://docs.fluidproject.org/infusion/development/apichangesfrom2_0to3_0
[Deprecated in 3.0]: https://docs.fluidproject.org/infusion/development/deprecatedin3_0

## [2.0.0] - 2016-12-08

### Added

* Constraint-based priorities, supported by `listeners`, `modelListeners`, `modelRelay`, `distributeOptions`,
  `contextAwareness`, and `components`. This allows the specific order of those items to be configured.
  (See: [Priorities](http://docs.fluidproject.org/infusion/development/Priorities.html))
* Context Awareness - and things it relies on:
  * Global Instantiator
    * Every Infusion component, regardless of how it is instantiated, ends up in a single-rooted tree of components
    * This enables use of modern IoC features such as model relay and declarative event binding
    * Enables use of the root distributeOptions context "/"
    * Useful debugging tip: Watch fluid.globalInstantiator in your JS debugging tools to see the structure of your
      application and its tree.
* `fluid.notImplemented` function for implementing abstract grades
* [Lazy loading for UI Options](http://docs.fluidproject.org/infusion/development/UserInterfaceOptionsAPI.html#lazyload)
  and instructions for how to use the Preferences Framework with a [zero initial load time](http://docs.fluidproject.org/infusion/development/tutorial-prefsFrameworkMinimalFootprint/MinimalFootprint.html).
  * This should assist in improving performance when using the Preferences Framework, particularly for resource
    intensive sites and applications
* Much faster invokers and boiled listeners (c. 60x faster)
* Support for using Infusion with npm for both Node.js and web-based projects.
  * Provides a variety of prebuilt versions of Infusion in the module's dist directory.
* Source Maps are generated for the concatenated JavaScript files
* View oriented IoC debugging tools
  * Including FluidViewDebugging.js on the page of any Infusion application gives you access to the _IoC View Inspector_
  . Click on the small cogwheel icon at the bottom right of the page to open a panel which shows the details of the view
  components and their grades, that are attached to DOM nodes in the browser pane. This interface works similarly to the
  _DOM Inspector_ familiar from modern web browsers, but is an experimental implementation with an engineer-level UI.

### Changed

* Consolidated component grades
* Order of merging component grades has reversed - grades at the right-hand end of the gradeNames list now take priority
  over those at the left
* Progressive Enhancement becomes Context Awareness
* `fluid.event.makeEventFirer` has been moved to `fluid.makeEventFirer`
* Model sharing happens without additional configuring of the `changeApplier`
* `that.model` should not be used directly
* Preferences Framework
  * Panels
    * Message bundle keys
    * Selectors
    * Styles
  * Enactors
    * Renamed "fluid.prefs.enactors" to "fluid.prefs.enactor"
  * Schema
    * `%prefix` replaced by `%templatePrefix` and `%messagePrefix`
  * Preference Editor
    * Preference model values now stored under a `preferences` model path

For more details see: [API Changes from 1.5 to 2.0]

### Deprecated

* `fluid.progress`
* jQuery UI Slider version of `fluid.textfieldSlider`
* The no JavaScript version of `fluid.uploader`

For more details see: [Deprecated in 2.0]

### Removed

* Demands blocks
* Component lifecycle events `preInit`, `postInit` and `finalInit`
* Component events `onAttach` and `onClear`
* Several Preferences Framework enactor styles
* Several Preferences Framework preference editor styles and selectors

For more details see: [API Changes from 1.5 to 2.0]

### Fixed

* [FLUID-4581](https://issues.fluidproject.org/browse/FLUID-4581): Move markup to html5
* [FLUID-6064](https://issues.fluidproject.org/browse/FLUID-6064): Remove aria-role application from Uploader and Pager

### More Info

* [Issues addressed in 2.0.0](https://issues.fluidproject.org/projects/FLUID/versions/10041)
* [Changes in 2.0.0](https://github.com/fluid-project/infusion/compare/v1.5.0...v2.0.0)
* [API Changes from 1.5 to 2.0]
* [Deprecated in 2.0]

[API Changes from 1.5 to 2.0]: https://docs.fluidproject.org/infusion/development/apichangesfrom1_5to2_0
[Deprecated in 2.0]: https://docs.fluidproject.org/infusion/development/deprecatedin2_0

## [1.5.0] - 2014-06-17

### Added

* Preferences Framework

### Changed

* Redesigned UI Options component
* Substantial improvements to the Infusion IoC system
* Updated versions of jQuery and jQuery UI
* Significant refactoring to the Pager component

For more details see: [API Changes from 1.4 to 1.5]

### Deprecated

* The Fluid Skinning System (FSS)
* Demands blocks
* `fluid.applyGradeLinkage` grade
* All components that are not `autoInit`
* Returning non-component material from a creator functions
* Manually attaching components to trees
* Manual lifecycle points: `preInit`, `postInit`, `finalInit`
* Manual component initialization
* Legacy IoC expressions
* `returnedPath`
* `returnedOptions`
* Change Applier guards
* Change Applier event type `MERGE`
* `fluid.makeSuperApplier`
* `fluid.model.copyModel`
* Merge policy: `preserve`
* `fluid.tryCatch`
* `fluid.event.getEventFier`
* `unicast` events
* Progress events
  * `onProgressBegin`
  * `afterProgressHidden`
* `fluid.model.setBeanValue`
* `fluid.model.getBeanValue`
* `fluid.lightbox`
* `fluid.keyForValue`
* Path utilities in DataBinding.js
* `fl-ProgEnhance-basic` class name
* Renderer API

For more details see: [Deprecated in 1.5]

### Removed

* Framework
  * `fluid.alias` removed
  * `fluid.merge` reverse merge policy removed
* Uploader
  * Removed Flash version
  * Removed support for Firefox 3.x's implementation of HTML5 upload

For more details see: [API Changes from 1.4 to 1.5]

### Fixed

* [FLUID-4337](https://issues.fluidproject.org/browse/FLUID-4337): Error when resolving listener specified by global
  name to boiled event
* [FLUID-4693](https://issues.fluidproject.org/browse/FLUID-4693): On current Chrome (18) layout reorderer demos will
  throw an exception when moving an element back to its original position
* [FLUID-5368](https://issues.fluidproject.org/browse/FLUID-5368): Using `fluid.transforms.arrayToSetMembership` with
  any other transformations in modelRelay option causes the source array value disappear
* [FLUID-5432](https://issues.fluidproject.org/browse/FLUID-5432): VoiceOver doesn't announce the remove buttons in
  Uploader

### More Info

* [Issues addressed in 1.5.0](https://issues.fluidproject.org/projects/FLUID/versions/10036)
* [Changes in 1.5.0](https://github.com/fluid-project/infusion/compare/v1.4.1...v1.5.0)
* [API Changes from 1.4 to 1.5]
* [Deprecated in 1.5]

[API Changes from 1.4 to 1.5]: https://docs.fluidproject.org/infusion/development/apichangesfrom1_4to1_5
[Deprecated in 1.5]: https://docs.fluidproject.org/infusion/development/deprecationsin1_5

## [1.4.1] - 2016-12-02

### Fixed

* [FLUID-6064](https://issues.fluidproject.org/browse/FLUID-6064): Remove aria-role application from Uploader and Pager

### More Info

* [Issues addressed in 1.4.1](https://issues.fluidproject.org/projects/FLUID/versions/10920)
* [Changes in 1.4.1](https://github.com/fluid-project/infusion/compare/v1.4.0...v1.4.1)

## [1.4.0] - 2010-10-14

### Added

* New for the Fluid Skinning system:
  * A new more modular reset system, including support for contextualized resets
  * New themes for accessibility
  * More layout container sizes (thanks to Gary Thompson and Unicon)
  * Expanded documentation and examples
  * A new FSS contributor gallery with portlet and form styles:
    <http://wiki.fluidproject.org/display/fluid/Fluid+Contributor+Gallery>
* Improved user experience for Uploader, including error handling

### Changed

* Completely redesigned UI Options component, involving:
  * Three different versions of the interface
  * Greatly improved styling
  * Extensively refactored code
* The Fluid Skinning system is easier to override: !importants have been removed
* Substantial improvements to the Infusion IoC system
* Updated versions of jQuery and jQuery UI
* All view components require DataBinding.js as a dependency

### Fixed

* [FLUID-4078](https://issues.fluidproject.org/browse/FLUID-4078): The HTML5 Upload strategy incorrectly interprets the
  fileSizeLimit option in megabytes instead of kilobytes.
* [FLUID-4159](https://issues.fluidproject.org/browse/FLUID-4159): The Uploader cannot be instantiated as a child
  component in an IoC tree

### More Info

* [Issues addressed in 1.4.0](https://issues.fluidproject.org/projects/FLUID/versions/10035)
* [Changes in 1.4.0](https://github.com/fluid-project/infusion/compare/v1.3.1...v1.4.0)

## [1.3.1] - 2011-02-25

### Added

* Better progress information for the HTML5 version of Uploader

### Changed

* Pager uses the Renderer by default
* Simplified markup for the Uploader

### Fixed

* [FLUID-3946](https://issues.fluidproject.org/browse/FLUID-3946): Tab order inconsistent in layout reorderer
* [FLUID-4017](https://issues.fluidproject.org/browse/FLUID-4017): Total file progress information is inaccurate when
  uploading files with the HTML 5 version of Uploader
* [FLUID-4018](https://issues.fluidproject.org/browse/FLUID-4018): The "Stop" button is unavailable in the HTML 5
  version of Uploader
* [FLUID-4108](https://issues.fluidproject.org/browse/FLUID-4108): ProgressiveEnhancement.js causes errors in IE7 when
  included in any page

### More Info

* [Issues addressed in 1.3.1](https://issues.fluidproject.org/projects/FLUID/versions/10110)
* [Changes in 1.3.1](https://github.com/fluid-project/infusion/compare/v1.3.0...v1.3.1)

## [1.3.0] - 2010-12-23

### Added

* Sneak Peek at the new Inversion of Control (IoC) system
* Uploader support for HTML 5
  * Flash-free for modern browsers!
  * Substantially improved keyboard and screen reader accessibility
  * Comprehensive automatic progressive enhancement based on browser capabilities
* Tons of accessibility improvements
  * Better feedback for the Progress component
  * Enhanced screen reader support for the Inline Edit component
  * Location and movement announcements for the Reorderer component
  * No wrap option for the Reorderer component
* ChangeApplier now supports transactions
* Renderer improvements

### Fixed

* [FLUID-1822](https://issues.fluidproject.org/browse/FLUID-1822): Image Reorderer does not provide context for screen
  reader user (Accessibility)
* [FLUID-2652](https://issues.fluidproject.org/browse/FLUID-2652): JAWS announces that an inline edit area is a button
* [FLUID-3494](https://issues.fluidproject.org/browse/FLUID-3494): FastXmlPull parser is not threadsafe, through use of
  global Regexp objects
* [FLUID-3507](https://issues.fluidproject.org/browse/FLUID-3507): ChangeApplier doesn't handle wildcards in change
  request paths
* [FLUID-3899](https://issues.fluidproject.org/browse/FLUID-3899): `primeCacheFromResources` fails with exception if IoC
  system is included

### More Info

* [Issues addressed in 1.3.0](https://issues.fluidproject.org/projects/FLUID/versions/10034)
* [Changes in 1.3.0](https://github.com/fluid-project/infusion/compare/v1.2.1...v1.3.0)

## [1.2.1] - 2010-09-10

### Fixed

* [FLUID-3679](https://issues.fluidproject.org/browse/FLUID-3679): JavaScript error "'script.parentNode' is null or not
  an object" on IE when running multiple instances of fluid (swfobject.js)
* [FLUID-3692](https://issues.fluidproject.org/browse/FLUID-3692): The README and license information for fastXmlPull.js
  incorrectly includes reference to LGPL

### More Info

* [Issues addressed in 1.2.1](https://issues.fluidproject.org/projects/FLUID/versions/10103)
* [Changes in 1.2.1](https://github.com/fluid-project/infusion/compare/v1.2.0...v1.2.1)

## [1.2.0] - 2010-04-15

### Added

* Mobile FSS themes: stable, full-featured support for iPhone and Android
* Rich Text InlineEdit now supports the new CKEditor 3 rich text editor
* Improved internationalization for Undo
* Better ARIA support for Inline Edit and Undo
* Ubiquitous UTF-8 support

### Changed

* Support for jQuery 1.4.2 and jQuery UI 1.8
  * Paths/names of dependencies have been updated

For more details see: [Upgrading to Infusion 1.2]

### Fixed

* Bug fixes for Renderer, data binding, Inline Edit, Reorderer, and the keyboard-a11y plugin
* [FLUID-2054](https://issues.fluidproject.org/browse/FLUID-2054): Cannot Tab to the 'Browse More" button with Flash 10,
  using FF2
* [FLUID-2252](https://issues.fluidproject.org/browse/FLUID-2252): Inline Edit Rich Text - edited text lacks keyboard
  focus
* [FLUID-3077](https://issues.fluidproject.org/browse/FLUID-3077): Text inside inline editor is being lost after
  canceling the text edit.
* [FLUID-3592](https://issues.fluidproject.org/browse/FLUID-3592): Cannot grab layout reorderable objects with mouse
  cursor

### More Info

* [Issues addressed in 1.2.0](https://issues.fluidproject.org/projects/FLUID/versions/10033)
* [Changes in 1.2.0](https://github.com/fluid-project/infusion/compare/v1.1.3...v1.2.0)
* [Upgrading to Infusion 1.2]

[Upgrading to Infusion 1.2]: https://wiki.fluidproject.org/display/docsArchive/Upgrading+to+Infusion+1.2

## [1.2.0-beta.1] - 2010-04-07

A pre-release of [1.2.0].

### More Info

* [Changes in 1.2.0-beta.1](https://github.com/fluid-project/infusion/compare/v1.1.3...v1.2.0-beta.1)

## [1.1.3] - 2010-09-01

### Fixed

* [FLUID-3679](https://issues.fluidproject.org/browse/FLUID-3679): JavaScript error "'script.parentNode' is null or not
  an object" on IE when running multiple instances of fluid (swfobject.js)

### More Info

* [Issues addressed in 1.1.3](https://issues.fluidproject.org/projects/FLUID/versions/10102)
* [Changes in 1.1.3](https://github.com/fluid-project/infusion/compare/v1.1.2...v1.1.3)

## [1.1.2] - 2009-10-16

### Added

* New Demo Portal with improved component demos
* Sneak Peak for Mobile FSS iPhone theme
* Uploader support for Firefox 3.5 and improved experience for Internet Explorer

### Fixed

* [FLUID-2022](https://issues.fluidproject.org/browse/FLUID-2022): The "Add more" button is not present in Flash 10
  version of uploader
* [FLUID-2582](https://issues.fluidproject.org/browse/FLUID-2582): Uploader is dependent on ProgressiveEnhancement.js,
  which is not included in InfusionAll.js
* [FLUID-2980](https://issues.fluidproject.org/browse/FLUID-2980): Renderer decorators can only be attached to one node
  at a time
* [FLUID-3121](https://issues.fluidproject.org/browse/FLUID-3121): Reorderers confuse handling of 'container' as
  selector/element
* [FLUID-3131](https://issues.fluidproject.org/browse/FLUID-3131): The default afterMove event listener code for the
  Image Reorderer doesn't get invoked, causing no results to be sent back to the server.

### More Info

* [Issues addressed in 1.1.2](https://issues.fluidproject.org/projects/FLUID/versions/10063)
* [Changes in 1.1.2](https://github.com/fluid-project/infusion/compare/v1.1.1...v1.1.2)

## [1.1.1] - 2009-08-13

### Fixed

* [FLUID-3077](https://issues.fluidproject.org/browse/FLUID-3077): Text inside inline editor is being lost after
  canceling the text edit.
* [FLUID-1320](https://issues.fluidproject.org/browse/FLUID-1320): Typing "Click here to edit" is equivalent to erasing
  all the text
* [FLUID-2967](https://issues.fluidproject.org/browse/FLUID-2967): Item will drop to the right of an element when it
  should have dropped at the left.
* [FLUID-3054](https://issues.fluidproject.org/browse/FLUID-3054): tiny_mce Inline Edit text editor fails when used with
  advanced theme
* [FLUID-2277](https://issues.fluidproject.org/browse/FLUID-2277): Can't select text: using IE

### More Info

* [Issues addressed in 1.1.1](https://issues.fluidproject.org/projects/FLUID/versions/10051)
* [Changes in 1.1.1](https://github.com/fluid-project/infusion/compare/v1.0.0...v1.1.1)

## [1.1.0] - 2009-06-02

### Added

* Provides the ability to create custom builds:
* Adds jQuery UI Themes for working with FSS themes
* Adds new and powerful decorators for the Renderer:
  * The "fluid" decorator instantiates any Fluid Infusion component bound to the markup
  * New support for removing arbitrary attributes and CSS classes
* Updates the Uploader:
  * User can manually switch to the standard non-Flash http file uploader
  * Uploader Browse button now respects DOM `z-index` in Flash 10
* Pager: Improved handing of column sorting
* Updates the User Interface Options:
  * Better cross browser support
  * Better keyboard and screen reader accessibility

### Changed

* Changes some class names in the FSS and components
* Changes some Framework API

For more details see: [Upgrading from Infusion 1.0 to Infusion 1.1.x]

### Fixed

* [FLUID-2371](https://issues.fluidproject.org/browse/FLUID-2371): Resizing the text does not change the size of the
  text's container, in the dialog
* [FLUID-2374](https://issues.fluidproject.org/browse/FLUID-2374): Pressing the "enter" key after changing the value in
  a textfield, has no effect
* [FLUID-2383](https://issues.fluidproject.org/browse/FLUID-2383): jQuery UI Slider is not screen reader accessible
* [FLUID-2412](https://issues.fluidproject.org/browse/FLUID-2412): Reset doesn't work after saving the initial cookie
* [FLUID-2722](https://issues.fluidproject.org/browse/FLUID-2722): Autobinding not working for `<textarea>` elements

### More Info

* [Issues addressed in 1.1.0](https://issues.fluidproject.org/projects/FLUID/versions/10032)
* [Changes in 1.1.0](https://github.com/fluid-project/infusion/compare/v1.0.0...v1.1.0)
* [Upgrading from Infusion 1.0 to Infusion 1.1.x]

[Upgrading from Infusion 1.0 to Infusion 1.1.x]: https://wiki.fluidproject.org/display/docsArchive/Upgrading+from+Infusion+1.0+to+Infusion+1.1.x

## [1.0.0] - 2009-04-09

### Added

* New data binding framework: the ChangeApplier
* New UI Options features:
  * table of contents
  * contrast
  * line spacing
* 3 new Fluid Skinning System themes with graphics: Coal, Slate, and Inverted High Contrast
* New preview component: Progress (previously part of the Uploader component)
* Better error handling for the Uploader
* Up to date ARIA support for the Reorderer
* Ability to create custom packages for each component

### Changed

* Substantial UI Options improvements and refinements, including:
  * A better user interface: improved layout, easier to use, increased contrast
  * Configurable strategy for persisting user preferences, using cookies by default
  * Stable API
* Consistency across the board: standardized APIs, class names, and source code layout

For more details see: [Upgrading to Infusion 1.0]

### Removed

* Remove `No Preference` from UI Options

### Fixed

* [FLUID-1825](https://issues.fluidproject.org/browse/FLUID-1825): Undo should not require model to be inside 'value'
* [FLUID-2121](https://issues.fluidproject.org/browse/FLUID-2121): Focus is not placed on the first focusable item in
  the user interface options dialog
* [FLUID-2260](https://issues.fluidproject.org/browse/FLUID-2260): Activating the Reset or Cancel button will remove all
  elements of the UI Options dialog: using Opera
* [FLUID-2379](https://issues.fluidproject.org/browse/FLUID-2379): [Uploader] The total file progress bar no longer has
  ARIA roles and states applied to it.
* [FLUID-2392](https://issues.fluidproject.org/browse/FLUID-2392): In IE6 & IE7: Auto-binding not working properly -
  gets "behind"
* [FLUID-2351](https://issues.fluidproject.org/browse/FLUID-2351): [Uploader] rev 6621 of Uploader.js and Progress.js
  crash FF on the server

### More Info

* [Issues addressed in 1.0.0](https://issues.fluidproject.org/projects/FLUID/versions/10006)
* [Changes in 1.0.0](https://github.com/fluid-project/infusion/compare/v0.8.1...v1.0.0)
* [Upgrading to Infusion 1.0]

[Upgrading to Infusion 1.0]: https://wiki.fluidproject.org/display/docsArchive/Upgrading+to+Infusion+1.0

## [0.8.1] - 2009-07-22

### Fixed

* [FLUID-2277: Can't select text: using IE](https://issues.fluidproject.org/browse/FLUID-2277)

### More Info

* [Issues addressed in 0.8.1](https://issues.fluidproject.org/projects/FLUID/versions/10050)
* [Changes in 0.8.1](https://github.com/fluid-project/infusion/compare/v0.8.0...v0.8.1)

## [0.8.0] - 2009-02-20

### Added

* Fluid Skinning System
* Preview of User Interface Options

### Fixed

* [FLUID-822](https://issues.fluidproject.org/browse/FLUID-822): Upload: After pausing queue wont resume but seems to
  "get stuck"
* [FLUID-954](https://issues.fluidproject.org/browse/FLUID-954): Page won't scroll during DnD, using Opera
* [FLUID-1145](https://issues.fluidproject.org/browse/FLUID-1145): Pressing the 'esc' key, while in an inline edit
  field, will erase the content; using IE
* [FLUID-1824](https://issues.fluidproject.org/browse/FLUID-1824): [Keyboard accessibility] doesn't appear to be a way
  to make an elm un-activatable
* [FLUID-2017](https://issues.fluidproject.org/browse/FLUID-2017): Cannot click on links in a rich text inline edit
  field because it changes into edit mode.
* [FLUID-2053](https://issues.fluidproject.org/browse/FLUID-2053): Uploader not working with flash 9: using IE
* [FLUID-2203](https://issues.fluidproject.org/browse/FLUID-2203): Clicking on the text area, causes the rich-text
  inline edit to close

### More Info

* [Issues addressed in 0.8.0](https://issues.fluidproject.org/projects/FLUID/versions/10005)
* [Changes in 0.8.0](https://github.com/fluid-project/infusion/compare/v0.7.0...v0.8.0)

## [0.7.0] - 2009-01-15

### Added

* Graceful degradation support in the Uploader

### Fixed

* [FLUID-873](https://issues.fluidproject.org/browse/FLUID-873): Tabbing through uploader breaks keyboard navigation,
  using IE6
* [FLUID-1329](https://issues.fluidproject.org/browse/FLUID-1329): inline edit - undo/redo do not receive focus
* [FLUID-2046](https://issues.fluidproject.org/browse/FLUID-2046): Renderer version of pager throws an error; using IE

### More Info

* [Issues addressed in 0.7.0](https://issues.fluidproject.org/projects/FLUID/versions/10031)
* [Changes in 0.7.0](https://github.com/fluid-project/infusion/compare/v0.6.0...v0.7.0)

## [0.6.0] - 2008-12-19

### Added

* Two new flavours of Inline Edit: Dropdown and Rich Text
* Sneak Peek of our new component: User Interface Options
* Preview of the Fluid Skinning System

### Changed

* Completely Refactored Uploader
* Updated Pager API

### Deprecated

* Inline Edit's `finishedEditing` function to be removed in v0.9

### Fixed

* [FLUID-492](https://issues.fluidproject.org/browse/FLUID-492): JAWS difficulty exiting Virtual PC Cursor to navigate
  in Lightbox
* [FLUID-844](https://issues.fluidproject.org/browse/FLUID-844): Inline Edit assumes there will always be a container
  element wrapping the edit field. For simple scenarios, this is an unnecessary burden for the developer.
* [FLUID-1317](https://issues.fluidproject.org/browse/FLUID-1317): Can't tab to the undo/redo icons in Opera
* [FLUID-1616](https://issues.fluidproject.org/browse/FLUID-1616): The function `selectable` clashes with jQuery UI
  `ui.selectable.js`
* [FLUID-1624](https://issues.fluidproject.org/browse/FLUID-1624): List number of moved item disappears while
  reorderering a sortable list

### More Info

* [Issues addressed in 0.6.0](https://issues.fluidproject.org/projects/FLUID/versions/10004)
* [Changes in 0.6.0](https://github.com/fluid-project/infusion/compare/v0.5.0...v0.6.0)

## [0.6.0-beta.1] - 2008-10-31

A pre-release of [0.6.0].

### More Info

* [Changes in 0.6.0-beta.1](https://github.com/fluid-project/infusion/compare/v0.5.0...v0.6.0-beta.1)

## [0.5.0] - 2008-09-30

### Added

* New Inline Edit feature: Undo
* Added `fluid.version` property

### Changed

* Improved/expanded Reorderer events
* Updated Reorderer API to match styles of other components
* Renamed Lightbox to Image Reorderer
* Renamed Layout Customizer to Layout Reorderer

For more details see: [Upgrading to version 0.5]

### Deprecated

* The Lightbox name is deprecated and replaced by Image Reorderer
* The Layout Customizer name is deprecated and replaced by Layout Reorderer

### Fixed

* [FLUID-572](https://issues.fluidproject.org/browse/FLUID-572): Reorderer: calls to document.writeln() while moving an
  item can cause the page to break.
* [FLUID-1137](https://issues.fluidproject.org/browse/FLUID-1137): Runtime Error when dragging a nested reorderable
* [FLUID-1322](https://issues.fluidproject.org/browse/FLUID-1322): The undo/redo icons are not in the correct tab order
* [FLUID-1323](https://issues.fluidproject.org/browse/FLUID-1323): Focus does not remain on undo/redo button after
  pressing enter

### More Info

* [Issues addressed in 0.5.0](https://issues.fluidproject.org/projects/FLUID/versions/10011)
* [Changes in 0.5.0](https://github.com/fluid-project/infusion/compare/v0.4.0...v0.5.0)
* [Upgrading to version 0.5]

[Upgrading to version 0.5]: https://wiki.fluidproject.org/display/docsArchive/Upgrading+to+version+0.5

## [0.5.0-beta.1] - 2008-08-28

A pre-release of [0.5.0].

### More Info

* [Changes in 0.5.0-beta.1](https://github.com/fluid-project/infusion/compare/v0.4.0...v0.5.0-beta.1)

## [0.4.0] - 2008-07-30

### Added

* Preview versions of two new components:
  * Inline Edit
  * Pager
* Keyboard-a11y plugin: Ability to add/remove elements from the list of selectables
* Improved keyboard support for Uploader

### Fixed

* [FLUID-602](https://issues.fluidproject.org/browse/FLUID-602): Progress tests partially fail on IE6 and IE7
* [FLUID-904](https://issues.fluidproject.org/browse/FLUID-904): Uploader inside a table element - removing a file from
  the list causes the uploader to disappear.
* [FLUID-956](https://issues.fluidproject.org/browse/FLUID-956): Can only tab to the "Add Files" button in the pop-up
  version of uploader on first tab cycle, using IE

### More Info

* [Issues addressed in 0.4.0](https://issues.fluidproject.org/projects/FLUID/versions/10003)
* [Changes in 0.4.0](https://github.com/fluid-project/infusion/compare/v0.3.0...v0.4.0)

## [0.4.0-beta.1] - 2008-06-26

A pre-release of [0.4.0].

### More Info

* [Changes in 0.4.0-beta.1](https://github.com/fluid-project/infusion/compare/v0.3.0...v0.4.0-beta.1)

## [0.3.0] - 2008-06-02

### Added

* Layout Customizer
* Preview version of Uploader
* Keyboard accessibility plugin for jQuery
* Uploader design pattern
* Reorder supports multiples simultaneous key mappings

### Changed

* Simplified API for creating a Reorderer for grid, list and portlets/layouts

### Fixed

* [FLUID-134](https://issues.fluidproject.org/browse/FLUID-134): Cannot nest Reorderers
* [FLUID-401](https://issues.fluidproject.org/browse/FLUID-401): In IE 6+, you have to press the arrow key twice when
  attempting to move an item with the keyboard.
* [FLUID-511](https://issues.fluidproject.org/browse/FLUID-511): Key stroke captured when content of a selectable item
  has focus.

### More Info

* [Issues addressed in 0.3.0](https://issues.fluidproject.org/projects/FLUID/versions/10002)
* [Changes in 0.3.0](https://github.com/fluid-project/infusion/compare/v0.1.0...v0.3.0)

## [0.3.0-beta.1] - 2008-04-25

A pre-release of [0.3.0].

### More Info

* [Changes in 0.3.0-beta.1](https://github.com/fluid-project/infusion/compare/v0.1.0...v0.3.0-beta.1)

## [0.1.0] - 2007-11-30

### Added

* The Reorderer, a JavaScript library for sorting DOM elements
* The Lightbox, a component for organizing image thumbnails
* Drag and drop UI design patterns
* Checklists and protocols for doing UX walkthroughs
* Sample code, tutorials, and lots of documentation

### More Info

* [Issues addressed in 0.1.0](https://issues.fluidproject.org/projects/FLUID/versions/10000)
* [Changes in 0.1.0](https://github.com/fluid-project/infusion/commits/v0.1.0)

[Unreleased]: https://github.com/fluid-project/infusion/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/fluid-project/infusion/releases/tag/v4.0.0
[3.0.0]: https://github.com/fluid-project/infusion/releases/tag/v3.0.0
[2.0.0]: https://github.com/fluid-project/infusion/releases/tag/v2.0.0
[1.5.0]: https://github.com/fluid-project/infusion/releases/tag/v1.5.0
[1.4.1]: https://github.com/fluid-project/infusion/releases/tag/v1.4.1
[1.4.0]: https://github.com/fluid-project/infusion/releases/tag/v1.4.0
[1.3.1]: https://github.com/fluid-project/infusion/releases/tag/v1.3.1
[1.3.0]: https://github.com/fluid-project/infusion/releases/tag/v1.3.0
[1.2.1]: https://github.com/fluid-project/infusion/releases/tag/v1.2.1
[1.2.0]: https://github.com/fluid-project/infusion/releases/tag/v1.2.0
[1.2.0-beta.1]: https://github.com/fluid-project/infusion/releases/tag/v1.2.0-beta.1
[1.1.3]: https://github.com/fluid-project/infusion/releases/tag/v1.1.3
[1.1.2]: https://github.com/fluid-project/infusion/releases/tag/v1.1.2
[1.1.1]: https://github.com/fluid-project/infusion/releases/tag/v1.1.1
[1.1.0]: https://github.com/fluid-project/infusion/releases/tag/v1.1.0
[1.0.0]: https://github.com/fluid-project/infusion/releases/tag/v1.0.0
[0.8.1]: https://github.com/fluid-project/infusion/releases/tag/v0.8.1
[0.8.0]: https://github.com/fluid-project/infusion/releases/tag/v0.8.0
[0.7.0]: https://github.com/fluid-project/infusion/releases/tag/v0.7.0
[0.6.0]: https://github.com/fluid-project/infusion/releases/tag/v0.6.0
[0.6.0-beta.1]: https://github.com/fluid-project/infusion/releases/tag/v0.6.0-beta.1
[0.5.0]: https://github.com/fluid-project/infusion/releases/tag/v0.5.0
[0.5.0-beta.1]: https://github.com/fluid-project/infusion/releases/tag/v0.5.0-beta.1
[0.4.0]: https://github.com/fluid-project/infusion/releases/tag/v0.4.0
[0.4.0-beta.1]: https://github.com/fluid-project/infusion/releases/tag/v0.4.0-beta.1
[0.3.0]: https://github.com/fluid-project/infusion/releases/tag/v0.3.0
[0.3.0-beta.1]: https://github.com/fluid-project/infusion/releases/tag/v0.3.0-beta.1
[0.1.0]: https://github.com/fluid-project/infusion/releases/tag/v0.1.0
