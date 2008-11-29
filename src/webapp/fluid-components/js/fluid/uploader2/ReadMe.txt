FLUID UPLOADER READ ME

1) Known Issues
2) Troubleshooting
3) Running the Uploader with out a Server

--------------------------------------

KNOWN ISSUES: 

* The Uploader is currently NOT COMPATIBLE with Flash 10 (released on 9/26/2008). This 
  bug is caused by a change in Adobe's security protocols for Flash 10, which block the SWFUpload 
  code from calling the OS File browser. The SWFUpload community is still implementing a fix based 
  on overlaying a transparent Flash object over the HTML Browse button. The Uploader in Fluid 0.6 
  will include this fix, or a fix of our own.
  
--------------------------------------

TROUBLE SHOOTING:

* When running the Uploader sample code on a local system without a server, check to make 
  sure that you have followed the instructions below under "RUNNING THE UPLOADER ON A 
  LOCAL SYSTEM WITHOUT A SERVER". 

* If you see this error in your console: 
  [Exception... "'Invalid function name' when calling method: [nsIDOMEventListener::handleEvent]" 
  nsresult: "0x8057001e (NS_ERROR_XPC_JS_THREW_STRING)" location: "<unknown>" data: no]

  The flashUrl option is probably wrong. Check that first. 

--------------------------------------

RUNNING THE UPLOADER ON A LOCAL SYSTEM WITHOUT A SERVER

Running the Uploader locally without a server is intended for basic testing purposes only. The 
DemoUploadManager provides a simulated conversation with the server, but it doesn't represent a
fully accurate picture of the component's behaviour when used in a real deployment environment.

So see the Uploader in action with a real server, have a look at Fluid's Image Gallery demo:

http://build.fluidproject.org:8080/sakai-imagegallery2-web/site/AddImages/


Additionally, you may need to modify some of your Flash settings to allow the local SWFUpload 
object to access your file system. To do so, follow these directions:

1. Open your browser
2. Browse to:
   http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html

3. In the Flash Settings panel, click "Edit locations..."
4. Select "Add location..."
5. Click "Browse for files..."
6. Select the swfupload.swf file that is in your local /src/webapp/fluid-components/flash/ directory
7. Restart your browser

You should be good to go! 

However, if you move your installation, you'll need to do this all over again. There are settings 
that will allow the file to be run from any location on your local machine but these instructions 
are the minimum settings and therefor pose the least security risk.

These settings are global and do not need to repeated for every browser on a given system. 
