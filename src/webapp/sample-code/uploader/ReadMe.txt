FLUID MULTI-FILE UPLOAD READ ME

1) Running the Uploader with out a Server
2) Setting up the Uploader on a Server

--------------------------------------

RUNNING THE UPLOADER ON A LOCAL SYSTEM WITHOUT A SERVER

NOTE: Running the Uploader locally without a server is officially an invalid configuration for anything other than UI development and testing. The browsing portion of the workflow is fine, but the upload portion is done with smoke and mirrors and fakery. Do not do QA while running locally.

Additionally in order to run locally you will need to make some minor modifications to your Flash settings in order to allow the Flash component to run with out a server.

SET UP:

1. Pull down a copy of the Fluid Multi-File Uploader to your local machine from SVN
2. Open sample-code/uploader/uploader.html
3. Check the following strings in settings:
        var settings =   {
            uploadUrl : "",
            flashUrl : "../../../fluid-components/swfupload/swfupload_f9.swf"

  ** uploadUrl must be empty.
  ** flashUrl must be a relative path to the swfupload_f9.swf file.

4. Open your browser
5. Browse to:
   http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html

6. In the Flash Settings panel, click "Edit locations..."
7. Select "Add location..."
8. Click "Browse for files..."
9. Select the swfupload_f9.swf file that is in your local /src/webapp/fluid-components/swfupload/ directory
10. Restart your browser

Now you should be good to run the uploader files in sample-code/uploader/

Please note that if you move your installation, you'll need to do this all over again. There are settings that will allow the file to be run from any location on your local machine but these instructions are the minimum settings and therefor pose the smallest security hole. (If a security hole even exists at all.)

Also it appears that these settings are global and do not need to repeated for every browser that you are using on that machine. 

KNOWN ISSUES: 
* The Uploader is currently NOT compatible with the Flash 10 beta. This bugs is caused by
  a change in Adobe's security protocols for Flash 10, which blocks the SWFUpload code from calling
  the OS File browser. The SWFUpload community is looking for fixes and work-arounds both in their
  own code and in Flash, and we anticipate a work-around or fix before Flash 10 goes final.
  
* After pausing, the queue sometimes won't resume
  
TROUBLE SHOOTING:

* When running the Uploader sample code on a local system without a server, check to make 
  sure that you have followed the instructions above under "RUNNING THE UPLOADER ON A 
  LOCAL SYSTEM WITHOUT A SERVER". 

* If you see this error in your console: 
	[Exception... "'Invalid function name' when calling method: [nsIDOMEventListener::handleEvent]" nsresult: "0x8057001e (NS_ERROR_XPC_JS_THREW_STRING)" location: "<unknown>" data: no]
	[Break on this error] if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCod...

  The flashUrl setting is probably wrong. Check that first. 

--------------------------------------

RUNNING THE UPLOADER ON A SERVER

Two uploader applications have been provided as very rough examples of integrating the Uploader into your applications. This code is not intended for a production environment. 

* JAVA Uploader Reference Application:
  For our own internal testing the Fluid team wrote the following JAVA application:
  	https://source.fluidproject.org/svn/fluid/image-gallery/trunk/

  Please read https://source.fluidproject.org/svn/fluid/image-gallery/trunk/development-support/README.txt before proceeding.
  
* PHP Uploader Reference Application

  upload.php is a sample PHP reference application provided by the SWFUpload project. 
  As they say in thier Read Me: "These are sample files for different server 
  technologies that can help implement SWFUpload. These samples may not be 
  drop-in solutions for your application but may help you find the direction 
  you need to solve your particular issue."
  
  This file can be found in the php folder of the Uploader sample-code
  or can be downloaded from: http://code.google.com/p/swfupload/
