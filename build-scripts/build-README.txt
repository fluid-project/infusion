Infusion Build System
=====================

The Infusion build system is a collection of Ant, Maven, and JavaScript-based scripts that are responsible
for managing dependencies between parts of Infusion, concatenating and minifying scripts, and creating release 
packages of Infusion.

Builder
=======

In most cases, users can use the Infusion Builder, a web application designed to easily create custom 
packages of Infusion based only on the things you need. The Builder is available on our web site at:

http://builder.fluidproject.org/

A daily version of Builder is also available, which will build the latest daily development version of
Infusion directly from our Github repository:

http://build.fluidproject.org/infusionBuilder/html/InfusionBuilder.html

Command Line Builds
===================

In rare cases, you may want to make a custom build of Infusion using our command line tools. In particular,
you need to use the command line if you'd like to exclude certain parts of Infusion from your build (for example,
jQuery). Here's how:

http://wiki.fluidproject.org/display/fluid/Custom+Infusion+Builds+With+Ant

Installing the Infusion Build Scripts
=====================================

To run the Infusion build scripts, you'll need to set up the following:

1. The latest version of Ant
    a. Download it from http://ant.apache.org
    b. Replace the default installation that may have shipped with your machine (/usr/share/ant on Mac OS X)
    c. Run ant -f fetch.xml to fetch Ant's optional tasks
    d. Remove the version of Rhino that ships with Ant (js.jar in ant/lib) 
2. Maven
    a. Download it from http://maven.apache.org/download.html
    b. Follow the installation instructions at http://maven.apache.org/download.html#Installation
3. A clone of Infusion "git clone git://github.com/fluid-project/infusion.git"


