# Infusion

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
[Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging#source-maps),
[Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map),
[IE 11](https://msdn.microsoft.com/library/dn255007#source_maps), and Safari. To make use of them, enable source maps
in your debugging environment, and ensure that the source maps are hosted adjacent to the file they are associated with.

#### Source Map Example

* From the command line, run `grunt` to create a build of Infusion
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
* [grunt-cli](https://gruntjs.com/)

All other development dependencies will be installed by running the following from the project root:

```bash
npm install
```

### Package Types

#### Infusion All Build

Will include all of Infusion. The source files packaged along with the single concatenated js file will include all of
the demos and unit tests. This is a good choice if you are trying to learn Infusion.

```bash
grunt
```

##### Custom Build

Will only include the modules you request, and all of their dependencies, minus any that are explicitly excluded. Unlike
the "all" build, none of the demos or tests are included with a custom package.

```bash
grunt custom
```

### Build Options

#### --source

__value__: true (Boolean)
_the value can be omitted if --source is the last flag specified_

By default all packages are minified. This option will allow you to maintain the readable spacing and comments.

```bash
grunt --source=true

grunt custom --source=true
```

#### --include

__value__: "module(s)" (String)
_only available to custom packages_

The `--include` option takes in a comma-separated string of the [Modules](#modules) to be included in a custom package.
If omitted, all modules will be included (demos and tests will not be included).

```bash
grunt custom --include="inlineEdit, uiOptions"
```

#### --exclude

__value__: "module(s)" (String)
_only available to custom packages_

The exclude option takes in a comma-separated string of the [Modules](#modules) to be excluded from a custom package.
The `--exclude` option takes priority over `--include`.

```bash
grunt custom --exclude="jQuery"

grunt custom --include="framework" --exclude="jQuery"
```

#### --name

__value__: "custom suffix" (String)
_only available to custom packages_

By default, custom packages are given a name with the form _infusion-custom-<version>.zip_ and the concatenated js file
is called _infusion-custom.js_. By supplying the `--name` option, you can replace "custom" with any other valid string
you like.

```bash
# this produces infusion-myPackage.js
grunt custom --name="myPackage"
```

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

There are two options available for running tests. The first option involves using the browsers installed on your
computer.  The second uses browsers available in a VM.

### Run Tests On Your Computer

To run both the browser and node tests for this package, use the command `npm test` or `yarn test`.

To run only the node tests, use the command `npm run test:node` or `yarn run test:node`.

To run only the browser tests, use the command `npm run test:browser` or `yarn run test:browser`.  Any browsers that
Testem finds on your system will be launched sequentially with each browser running the full Infusion test suite. The
results will be returned in your terminal in the [TAP](https://testanything.org/) format. Once you have run
`npm install`, you can use the command ``node node_modules/testem/testem.js launchers`` from the root of this repository
to get a list of browsers that Testem can launch on your system.

If you would like to debug individual tests or view the test summary in a browser, you can:

1. Host the working directory, for example, using a command like the following from the root of the repository:
   `python -m SimpleHTTPServer 4102`
2. Open the "rollup" file `tests/all-tests.html` that runs all tests in a browser.  Continuing the above example, you
   would load the URL `http://localhost:4102/tests/all-tests.html`.

**Note:** Any browser launched will need to be focused and remain the active window. Some of the tests require focus,
and will report errors if they are not focused.  If you want to run the tests consistently, your best option is to run
the tests in a VM (see below).

### Run Tests In a VM

The tests in this package can be run within a virtual machine (VM).  The benefits of using a VM include the following:

* Does not require Testem to be installed on the host machine.
* Allows other applications on the host machine to have focus while the tests are run.
* Isolates the test run from issues specific to one operating system or machine.

Before you can run tests within a VM, your machine will need to meet the
[QI development VM requirements](https://github.com/GPII/qi-development-environments/#requirements).  Once you have
that, a [Fedora VM](https://github.com/idi-ops/packer-fedora) can be automatically created using tools provided by the
[Prosperity4All Quality Infrastructure](https://github.com/GPII/qi-development-environments/).

* To run both the Node and browser tests in a VM: `npm run test:vagrant`
* To run the Node tests only: `npm run test:vagrantNode`
* To run the browser tests only: `npm run test:vagrantBrowser`

Each of these commands will create the VM (if needed).  The test results from the VM will be displayed in your terminal.

If you just want to create the VM yourself, you can use a command like ``vagrant up``, and connect to it either
from VirtualBox, or from the command line using a command like ``vagrant ssh``.

When this VM is first created, Chrome and Firefox will be upgraded to the latest versions available in the Fedora and
Google package repositories. The ``vagrant provision`` command can be used at a later time to trigger the browser
upgrade and general VM provisioning mechanism.

#### Coverage Reporting

The preferred way to consistently generate a code coverage report is to use Vagrant as described above.  When you
start a VM using `vagrant up` and run `npm run test:vagrant`, the full test suite will run in the VM,  and a coverage
report will be saved to the `reports` directory.  You can also run the `npm test` command on your local machine, but
you will need to ensure that browsers receive focus when they are launched (see above).

The `npm test` command has [two additional associated scripts](https://docs.npmjs.com/misc/scripts).  The `pretest`
script runs before the command defined for the `test` script.  The `posttest` script runs after.  In our case
we use a `pretest` script to clean up previous coverage data before we run the tests, and a `posttest` script to
compile the actual report.  You should not need to run the `pretest` scripts manually before running either the node or
browser tests, or to run the `posttest` scripts afterward.

### Run Tests In a Docker Container

You can also run the tests from a [Docker](https://docs.docker.com/get-docker) container.

Once you have Docker installed, run the following commands to build a Docker image and start a container:

* Build the image: `docker build -t infusion .`
* Run the container: `docker run --name infusion -p 8000:80 infusion`

Infusion will be available at [http://localhost:8000](http://localhost:8000)

* To stop and remove the container: `docker rm -f infusion`

If you make changes to Infusion, repeat the steps to build the image and start a new container.

## Developing with the Preferences Framework

Infusion is in the process of switching to use [Stylus](http://learnboost.github.io/stylus/) for CSS pre-processing.
CSS files for the Preferences Framework have been re-written in Stylus. Only Stylus files are pushed into the GitHub
repository.

For developing the Preferences Framework, run the following from the project root to compile Stylus files to CSS:

```bash
grunt buildStylus
```

A `watch` task using [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch) is also supplied to ease
Stylus development. This task launches a process that watches all Stylus files in the `src` directory and recompiles
them when they are changed. This task can be run using the following command:

```bash
grunt watch:buildStylus
```
