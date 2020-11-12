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
* [Use from the CDNJS Content Distribution Network](https://cdnjs.com/libraries/infusion)
  * To try out Infusion quickly you can use the following `script` tag to include the full framework from the CDN:
    `<script src='https://cdnjs.cloudflare.com/ajax/libs/infusion/2.0.0/infusion-all.min.js'></script>`

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

For simplicity and performance reasons, you may wish to create a concatenated, minified file. However, such a file is
often difficult to read. To address this, source maps for the minified file are automatically generated to make
debugging easier.

### Source Maps

Source maps are supported in all of the major browsers:
[Chrome](https://developers.google.com/web/tools/chrome-devtools/javascript/source-maps),
[Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map),
[Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/debugger#source-maps), and Safari. To make use of
them, enable source maps in your debugging environment, and ensure that the source maps are hosted adjacent to the file
they are associated with.

#### Source Map Example

* From the command line, run `npm run build:all` to create a build of Infusion
  * All Infusion packages come with a source map for the concatenated JavaScript file
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

### Package Types

#### Infusion All Build

Will include all of Infusion, including third-party dependencies. The source files packaged along with the single
concatenated JavaScript file will include all of the demos and unit tests. This is a good choice if you are trying to
learn Infusion.

```bash
npm run build:all
```

By default all packages are minified. Running the build script with the `:source` suffix will allow you to maintain
readable spacing and comments.

```bash
npm run build:all:source
```

#### Custom Build

Will only include the modules you request, and all of their dependencies, minus any that are explicitly excluded. Unlike
the "all" build, none of the demos or tests are included with a custom package.

```bash
npm run build:custom
```

By default all packages are minified. Running the build script with the `:source` suffix will allow you to maintain
readable spacing and comments.

```bash
npm run build:custom:source
```

#### Custom Build Options

Any of the following options can be passed to a custom build by adding two hyphens and then the appropriate option.
Examples are shown below.

##### --include

__value__: "module(s)" (String)
_only available to custom builds_

The `--include` option takes in a comma-separated string of the [Modules](#modules) to be included in a custom package.
If omitted, all modules will be included (demos and tests will not be included).

```bash
npm run build:custom -- --include="inlineEdit, uiOptions"
```

##### --exclude

__value__: "module(s)" (String)
_only available to custom builds_

The exclude option takes in a comma-separated string of the [Modules](#modules) to be excluded from a custom package.
The `--exclude` option takes priority over `--include`.

```bash
npm run build:custom -- --exclude="jQuery"

npm run build:custom -- --include="framework" --exclude="jQuery"
```

##### --name

__value__: "custom suffix" (String)
_only available to custom packages_

By default, custom packages are given a name with the form _infusion-custom-<version>.zip_ and the concatenated
JavaScript file is called _infusion-custom.js_. By supplying the `--name` option, you can replace "custom" with any
other valid string you like.

```bash
# this produces infusion-myPackage.js
npm run build:custom -- --name="myPackage"
```

#### Distribution Builds

Will build a set of predefined distribution bundles of Infusion, some of which include third-party dependencies and some
of which do not, for distribution on [NPM](https://www.npmjs.com/package/infusion). Unlike the "all" build, none of the
demos or tests are included with a custom package. Each distribution file will be created in both minified and
unminified versions, and will include [source maps](#source-maps).

```bash
npm run build:dists
```

Distribution bundles can be [viewed on unpkg](https://unpkg.com/browse/infusion/dist/).

### Modules

#### Framework Modules

* enhancement
* framework
* preferences
* renderer

#### Component Modules

* inlineEdit
* overviewPanel
* pager
* progress
* reorderer
* slidingPanel
* switch
* tableOfContents
* textfieldControls
* textToSpeech
* tooltip
* uiOptions
* undo
* uploader

#### External Libraries

* fastXmlPull
* hypher
* jQuery
* jQueryUI
* jQueryScrollToPlugin
* jQueryTouchPunchPlugin
* normalize
* open-dyslexic
* opensans
* roboto
* url-polyfill

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

This command runs two subcommands:

1. `test:bundles:prepare`, which creates a [distribution build](#distribution-builds).
2. `test:bundles:run`, which runs bundle tests against each distribution bundle.

#### Coverage Reporting

When you run the tests using `npm test`, the full test suite will run and a coverage report will be saved to the
`reports` directory.

The `npm test` command has [two additional associated scripts](https://docs.npmjs.com/cli/v6/using-npm/scripts#pre--post-scripts).
The `pretest` script runs before the command defined for the `test` script.  The `posttest` script runs after.  In our case
we use a `pretest` script to clean up previous coverage data before we run the tests, and a `posttest` script to compile
the actual report (this can also be accomplished by running `npm run test:report` after running tests). You do not need
to run the `pretest` script manually before running either the node or browser tests, or to run the `posttest` script
afterwards.

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

Lint JavaScript, JSON, and Markdown files using [fluid-grunt-lint-all](https://github.com/fluid-project/fluid-grunt-lint-all):

```bash
npm run lint
```

## Developing with the Preferences Framework

The Preferences Framework uses [Sass](http://sass-lang.com/) for CSS pre-processing. Only Sass files are included in the
GitHub repository.

For developing the Preferences Framework, run the following from the project root to compile Sass files to CSS:

```bash
npm run build:sass
```

A `watch` task is also supplied to ease Sass development. This task launches a process that watches all Sass files in
the `src` directory and recompiles them when they are changed. This task can be started using the following command:

```bash
npm run watch:sass
```

For more information on styling the Preferences Framework, please review the documentation on
[using Sass with the Preferences Framework](./src/framework/preferences/css/sass/README.md).
