# Infusion

![CI build status badge](https://github.com/fluid-project/infusion/workflows/Automated%20tests/badge.svg)
[![Coverage status badge](https://codecov.io/github/fluid-project/infusion/coverage.svg?branch=main)](https://codecov.io/github/fluid-project/infusion?branch=main)

## What Is Infusion?

Infusion is a different kind of JavaScript framework. Our approach is to leave you in control—it's your interface,
using your markup, your way. Infusion is accessible and very, very configurable.

Infusion includes:

* an application framework for developing flexible stuff with JavaScript and jQuery
* a collection of accessible UI components

## Where Can I See Infusion Components?

<https://fluidproject.org/infusion.html>

## How Do I Get Infusion?

* [Download a Release](https://github.com/fluid-project/infusion/releases)
* [Install from NPM](https://www.npmjs.com/package/infusion)
* [Fork on GitHub](https://github.com/fluid-project/infusion)
* [Use from a Content Distribution Network(CDN)](https://unpkg.com/browse/infusion)
  * To try out Infusion quickly you can use the following `script` tag to include the full framework from the CDN:
    `<script src='https://unpkg.com/browse/infusion@2.0.0/dist/infusion-all.js'></script>`

See [How Do I Create an Infusion Package?](#how-do-i-create-an-infusion-package), for details on creating complete or
custom packages of Infusion.

## Where is the Infusion Documentation?

Infusion has comprehensive documentation at <https://docs.fluidproject.org/infusion>.

## Who Makes Infusion, and How Can I Help?

The Fluid community is an international group of designers, developers, and testers who focus on a common mission:
improving the user experience and accessibility of the open web.

The best way to join the Fluid Community is to jump into any of our community activities. Visit our
[website](https://fluidproject.org/) for links to our mailing lists, chat room, wiki, etc.

## Inclusion

The Fluid community is dedicated to inclusive design&mdash;design that considers the full range of human diversity with
respect to ability, language, culture, gender, age and other forms of human difference. To help ensure that our
community is a safe space for all contributors, we have adopted a
[code of conduct](https://wiki.fluidproject.org/display/fluid/Inclusion+in+the+Fluid+Community) based on the
[Contributor Covenant](https://contributor-covenant.org/). All participants and contributors have the responsibility to
uphold this code. Please contact the [Advocacy working group](mailto:fluid-advocacy@fluidproject.org) if you encounter
unacceptable behaviour.

## Where is Infusion Used?

Infusion is the cornerstone of a number of Fluid's own projects dedicated to supporting inclusive design on the Web. You
can see some of them featured on our [Projects page](https://fluidproject.org/projects.html). Infusion is also used in a
variety of third-party applications, which are listed on the
[Infusion Integrations](https://wiki.fluidproject.org/display/fluid/Infusion+Integrations) wiki page.

## How Do I Create an Infusion Package?

For simplicity and performance reasons, Infusion distributions are minified. However, such a file is often difficult to
read. To address this, source maps for the minified files are automatically generated to make debugging easier.

### Source Maps

Source maps are supported in all of the major browsers:
[Chrome](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps),
[Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map),
[Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/debugger#source-maps), and Safari. To make use of
them, enable source maps in your debugging environment, and ensure that the source maps are hosted adjacent to the file
they are associated with.

#### Source Map Example

* From the command line, run `npm run build` to generate Infustion distributions
  * All Infusion distributions come with a source map for the concatenated JavaScript file
  * CSS files compiled from SASS also include source maps.
* In the Infusion package, modify one of the demos to replace the individual javascript includes with a reference to
  "infusion-all.js"
* The "infusion-all.js" includes a reference to the "infusion-all.js.map" file, which is assumed to be hosted as its
  sibling
* Open the demo in a browser
* In the browser's debugger ensure that source maps are enabled
  * In Firefox open the debugger
  * In the debugger options, ensure that "Show Original Sources" is enabled
  * see [MDN: Use a source map](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
* In the debugger you should now be able to view and debug the individual JavaScript files as though they were included
  separately

### Dependencies

* [node.js](https://nodejs.org/)

All other development dependencies will be installed by running the following from the project root:

```bash
npm install
```

### Build Types

#### Distribution Builds

Will build a set of predefined distribution bundles of Infusion, some of which include third-party dependencies and some
of which do not, for distribution on [NPM](https://www.npmjs.com/package/infusion). Each distribution file will be
placed in the `dist` directory and will be accompanied by a [source map](#source-maps).

```bash
npm run build
```

Distribution bundles can be [viewed on unpkg](https://unpkg.com/browse/infusion/dist/).

#### Infusion All Build

Will include all of Infusion, including third-party dependencies. The source files packaged along with the single
concatenated JavaScript file will include all of the demos, examples and unit tests. This is a good choice if you are
trying to learn Infusion.

```bash
npm run build:pkg
```

#### Custom Build

Will only include the modules you request, and all of their dependencies, minus any that are explicitly excluded. Unlike
the [Infusion All](#infusion-all-build) build, none of the demos, examples or tests are included with a custom package.

```bash
npm run build:pkg:custom
```

#### Custom Build Options

Any of the following options can be passed to a custom build by specifying the option after `--`. Examples are shown
below.

##### -i, --include

__value__: "module(s)" (String)
_only available to custom builds_

The `--include` option takes a comma-separated string of the [Modules](#modules) to be included in a custom package.
Only these modules and their dependencies will be included. By default, all modules are included; however, demos,
examples and tests are never included with custom builds.

```bash
npm run build:pkg:custom -- --include="fluid-inline-edit, fluid-ui-options"

# shorthand
npm run build:pkg:custom -- -i "fluid-inline-edit, fluid-ui-options"
```

##### -e, --exclude

__value__: "module(s)" (String)
_only available to custom builds_

The `--exclude` option takes a comma-separated string of the [Modules](#modules) to be excluded from a custom package.
By default, no modules are excluded. Excludes take priority over includes.

```bash
npm run build:pkg:custom -- --exclude=jquery

# shorthand
npm run build:pkg:custom -- -e jquery
```

##### -n, --name

__value__: "custom suffix" (String)
_only available to custom packages_

By default, custom packages are given a name in the form _infusion-custom-{version}.zip_ and the concatenated JavaScript
file is called _infusion-custom.js_. By supplying the `--name` option, you can replace "custom" with any valid string.

```bash
# this produces infusion-myPackage.js
npm run build:pkg:custom -- --name=myPackage

# shorthand
npm run build:pkg:custom -- -n myPackage
```

### Modules

#### Framework Modules

* fluid-enhancement
* fluid-framework
* fluid-preferences
* fluid-renderer

#### Component Modules

* fluid-inline-edit
* fluid-orator
* fluid-overview-panel
* fluid-pager
* fluid-progress
* fluid-reorderer
* fluid-sliding-panel
* fluid-switch
* fluid-table-of-contents
* fluid-textfield-controls
* fluid-text-to-speech
* fluid-tooltip
* fluid-ui-options
* fluid-undo
* fluid-uploader

#### External Libraries

* fast-xml-pull
* hypher
* jquery
* jquery-ui
* jquery-scrollto
* jquery-ui-touch-punch
* open-dyslexic
* opensans-webkit
* roboto-fontface

## How Do I Run Tests?

### Run Tests On Your Computer

To run both the browser and node tests for this package:

```bash
npm test
```

To run only the node tests:

```bash
npm run test:node
```

To run only the browser tests:

```bash
npm run test:browser
```

Testem will attempt to launch Chrome and Firefox sequentially with each browser running the full Infusion test suite.
The results will be returned in your terminal in the [TAP](https://testanything.org/) format.

If you would like to debug individual tests or view the test summary in a browser, you can:

1. Host the working directory:

   ```bash
   npm start
   ```

   Your terminal will show you the local address for the working directory, which will normally be <http://localhost:5000>.

2. Open the "rollup" file `tests/all-tests.html` that runs all tests in a browser.  Continuing the above example, you
   would load the URL <http://localhost:5000/tests/all-tests.html>.

To run tests of Infusion's distribution bundles:

```bash
npm run test:bundles
```

#### Coverage Reporting

When you run the tests using `npm test`, the full test suite will run and a coverage report will be saved to the
`reports` directory.

The `npm test` command has [two additional associated scripts](https://docs.npmjs.com/cli/v6/using-npm/scripts#pre--post-scripts).
The `pretest` script runs before the command defined for the `test` script.  The `posttest` script runs after.  In our
case we use a `pretest` script to clean up previous coverage data before we run the tests, and a `posttest` script to
compile the actual report (this can also be accomplished by running `npm run test:report` after running tests). You do
not need to run the `pretest` script manually before running either the node or browser tests, or to run the `posttest`
script afterwards.

### Run Tests In a Docker Container

You can also run the tests from a [Docker](https://docs.docker.com/get-docker) container.

Once you have Docker installed, run the following commands to build a Docker image and start a container:

* Build the image: `docker build -t infusion .`
* Run the container: `docker run --name infusion -p 8000:80 infusion`

Infusion will be available at [http://localhost:8000](http://localhost:8000)

* To stop and remove the container: `docker rm -f infusion`

If you make changes to Infusion, repeat the steps to build the image and start a new container.

## Other Scripts

Host the working directory (this will make it available at <http://localhost:5000> and let you access demos, examples,
and tests in your browser):

```bash
npm start
```

Copy Infusion's dependencies from "node_modules" into the "src/lib" directory:

```bash
npm run deps
```

Lint JavaScript, JSON, Markdown and other files using [fluid-lint-all](https://github.com/fluid-project/fluid-lint-all):

```bash
npm run lint
```

Remove all of the copied or built directories and files:

```bash
npm run clean
```

## Developing with the Preferences Framework

The Preferences Framework uses [Sass](http://sass-lang.com/) for CSS pre-processing. Only Sass files are included in the
GitHub repository.

For developing the Preferences Framework, run the following from the project root to compile Sass files to CSS:

```bash
# unminified
npm run build:sass

# minified
npm run build:sass:min
```

A `watch` task is also supplied to ease Sass development. This task launches a process that watches all Sass files in
the `src` directory and recompiles them when they are changed. This task can be started using the following command:

```bash
# unminified
npm run watch:sass

# minified
npm run watch:sass:min
```

For more information on styling the Preferences Framework, please review the documentation on
[using Sass with the Preferences Framework](./src/framework/preferences/css/sass/README.md).
