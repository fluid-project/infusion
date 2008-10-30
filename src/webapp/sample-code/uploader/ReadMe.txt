FLUID UPLOADER READ ME

1) Known Issues
2) Troubleshooting
3) Running the Uploader with out a Server
4) Setting up the Uploader on a Server

--------------------------------------

KNOWN ISSUES: 

* The Uploader is currently NOT COMPATIBLE with Flash 10 (released on 9/26/2008). This 
  bug is caused by a change in Adobe's security protocols for Flash 10, which block the SWFUpload 
  code from calling the OS File browser. The SWFUpload community is still implementing a fix based 
  on overlaying a transparent Flash object over the HTML Browse button. The Uploader in Fluid 0.6 
  will include this fix, or a fix of our own.
  
* After pausing, the queue sometimes won't resume
  
--------------------------------------

TROUBLE SHOOTING:

* When running the Uploader sample code on a local system without a server, check to make 
  sure that you have followed the instructions below under "RUNNING THE UPLOADER ON A 
  LOCAL SYSTEM WITHOUT A SERVER". 

* If you see this error in your console: 
  [Exception... "'Invalid function name' when calling method: [nsIDOMEventListener::handleEvent]" nsresult: "0x8057001e (NS_ERROR_XPC_JS_THREW_STRING)" location: "<unknown>" data: no]
  [Break on this error] if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCod...

  The flashUrl option is probably wrong. Check that first. 

--------------------------------------

RUNNING THE UPLOADER ON A LOCAL SYSTEM WITHOUT A SERVER

NOTE: Running the Uploader locally without a server is not a valid configuration for anything other than UI development and testing. The browsing portion of the workflow is fine, but the upload portion is done with smoke and mirrors and a bit of hand-waving. Do not do QA while running locally.

The Uploader sample files in the sample-code/uploader/ directory are configured for running locally. An empty uploadURL option indicates to the Uploader that the code is running with out a server. You may also need to ensure that the path for the flashURL option is set correctly. 

        var settings =   {
            uploadUrl : "",
            flashUrl : "../../../fluid-components/swfupload/swfupload_f9.swf"


Additionally, you may need to modify some of your Flash settings to allow the local SWFUpload object to access your file system. To do so, follow these directions:

1. Open your browser
2. Browse to:
   http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html

3. In the Flash Settings panel, click "Edit locations..."
4. Select "Add location..."
5. Click "Browse for files..."
6. Select the swfupload_f9.swf file that is in your local /src/webapp/fluid-components/swfupload/ directory
7. Restart your browser

You should be good to go! 

However, if you move your installation, you'll need to do this all over again. There are settings that will allow the file to be run from any location on your local machine but these instructions are the minimum settings and therefor pose the smallest security hole. (If a security hole even exists at all.)

Also it appears that these settings are global and do not need to repeated for every browser on a given system. 

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
