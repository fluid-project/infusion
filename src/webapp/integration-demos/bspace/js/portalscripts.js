/**********************************************************************************
 * Copyright (c) 2003, 2004, 2005, 2006, 2007, 2008 The Sakai Foundation.
 * 
 * Licensed under the Educational Community License, Version 1.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at
 * 
 *      http://www.opensource.org/licenses/ecl1.php
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License.
 *
 **********************************************************************************/

/* Script for pop-up dhtml more tabs implementation 
 * uses jQuery library
 */

/* dhtml_more_tabs
 * displays the More Sites div 
 * note the technique of recasting the function after initalization
 */

var dhtml_more_tabs = function() {
	// first time through set up the DOM
	jQuery('div#selectNav').appendTo('#linkNav').addClass('dhtml_more_tabs'); // move the selectNav in the DOM
	jQuery('div#selectNav').css('top',jQuery('#linkNav').height());       // set its top position
	jQuery('div#selectNav').width(Math.round(jQuery('#linkNav').width()*0.75));           // set its width to fix an IE6 bug
	jQuery('#selectNav').css('z-index',9900);                                 // explicitely set the z-index
	jQuery('.more-tab').css('z-index',9800);                                  //  " for the More Tabs div element
	
	// then recast the function to the post initialized state which will run from then on
	dhtml_more_tabs = function() {
		if (jQuery('#selectNav').css('display') == 'none' ) {
			// mask the rest of the page
			createDHTMLMask() ;
			// show the more-sites box
			jQuery('div#selectNav').show();
			//jQuery('div#selectNav').bgiframe();
			// highlight the more tab
			jQuery('.more-tab').addClass('more-active');
			// dim the current tab
			jQuery('.selectedTab').addClass('tab-dim');
			// bind this function to the More Tabs tab to close More Tabs on click
			jQuery('.selectedTab').bind('click',function(){dhtml_more_tabs();return false;});
		} else {
			// hide the mask
			removeDHTMLMask();
			// remove the click binding
			jQuery('.selectedTab').unbind('click');
			// undim the currently selected tab
			jQuery('.selectedTab').removeClass('tab-dim');
			// unhighlight the more tab
			jQuery('.more-tab').removeClass('more-active');
			// hide the more-sites box
			jQuery('div#selectNav').hide(); 
		}
	}
	// finally run the inner function, first time through
	dhtml_more_tabs();
}

function createDHTMLMask() {
	var portalMask = jQuery('<div id="portalMask"></div>').css('z-index',1000).bind("click",function(event){
		dhtml_more_tabs();
		return false;
	});
	if (jQuery.browser.msie && jQuery.browser.version < 7) {
		jQuery(portalMask).appendTo('body').css('width','100%');
		jQuery(portalMask).css('height',browserSafeDocHeight());
		jQuery('#portalMask').bgiframe();
	} else {
		jQuery(portalMask).appendTo('#container').css('width','100%');
		jQuery(portalMask).css('height','100%');
	}
}

function removeDHTMLMask() {
	jQuery('#portalMask').remove();
}

/* Copyright (c) 2006 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * $LastChangedDate: 2008-03-31 13:22:55 -0700 (Mon, 31 Mar 2008) $
 * $Rev: 44772 $
 *
 * Version 2.1.1
 */
(function($){$.fn.bgIframe=$.fn.bgiframe=function(s){if($.browser.msie&&/6.0/.test(navigator.userAgent)){s=$.extend({top:'auto',left:'auto',width:'auto',height:'auto',opacity:true,src:'javascript:false;'},s||{});var prop=function(n){return n&&n.constructor==Number?n+'px':n;},html='<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+'style="display:block;position:absolute;z-index:-1;'+(s.opacity!==false?'filter:Alpha(Opacity=\'0\');':'')+'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+'"/>';return this.each(function(){if($('> iframe.bgiframe',this).length==0)this.insertBefore(document.createElement(html),this.firstChild);});}return this;};})(jQuery);
