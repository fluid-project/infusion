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

To run a full Infusion build from the command line, issue the following command in your shell:

ant -lib lib/rhino

For a custom build of Infusion, use:

ant -lib lib/rhino customBuild \
    -Dinclude="<modules to include>" \
    -Dexclude="<modules to exclude>" \
    -Djsfilename="<desired file name>"

If you'd rather not specify the -lib parameter every time you run a build, you can upgrade the copy of Rhino 
installed by Ant inyour $ANT_HOME/lib directory with the newer version distributed in Infusion's 
build-scripts/lib/rhino directory. On Mac OS X, use:

sudo rm -rf /usr/share/ant/lib/js-1.6R7.jar
sudo cp lib/rhino/js.jar /usr/share/ant/lib/js-1.7R3.jar

Installing the Infusion Build Scripts
=====================================

To run the Infusion build scripts, you'll need to set up the following:

1. The latest version of Ant
    a. Download it from http://ant.apache.org
    b. Replace the default installation that may have shipped with your machine (/usr/share/ant on Mac OS X)
    c. Run ant -f fetch.xml to fetch Ant's optional tasks
2. Maven
    a. Download it from http://maven.apache.org/download.html
    b. Follow the installation instructions at http://maven.apache.org/download.html#Installation
3. A clone of Infusion "git clone git://github.com/fluid-project/infusion.git"


