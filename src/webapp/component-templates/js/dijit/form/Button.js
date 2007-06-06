dojo.provide("dijit.form.Button");

dojo.require("dijit.base.FormElement");
dojo.require("dijit.base.TemplatedWidget");

dojo.declare(
	"dijit.form.Button",
	[dijit.base.FormElement, dijit.base.TemplatedWidget],
	{
/*
 * usage
 *	<button dojoType="button" onClick="...">Hello world</button>
 *
 *  var button1 = dojo.widget.createWidget("Button", {caption: "hello world", onClick: foo});
 *	document.body.appendChild(button1.domNode);
 */
		// summary
		//	Basically the same thing as a normal HTML button, but with special styling.

		// caption: String
		//	text to display in button
		caption: "",

		type: "button",
		baseClass: "dijitButton",
		templateString:"<div class=\"dijit dijitLeft dijitInline dijitButton\" \n\tdojoAttachEvent=\"onclick:_onMouse;onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse\"><div class='dijitRight'>\n\t<button class=\"dijitStretch dijitButtonNode dijitButtonContents\" \n\t\ttabIndex=\"${tabIndex}\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\" \n\t\tdojoAttachPoint=\"containerNode;focusNode\">\n\t\t\t${caption}\n\t</button>\n</div></div>\n",
		
		onClick: function(/*Event*/ e){
			// summary: callback for when button is clicked; user can override this function
		},

		setCaption: function(/*String*/ content){
			// summary: reset the caption (text) of the button; takes an HTML string
			this.containerNode.innerHTML = this.caption = content;
			if(dojo.isMozilla){ // Firefox has re-render issues with tables
				var oldDisplay = dojo.getComputedStyle(this.domNode).display;
				this.domNode.style.display="none";
				var _this = this;
				setTimeout(function(){_this.domNode.style.display=oldDisplay;},1);
			}
		}		
	}
);

/*
 * usage
 *	<button dojoType="DropDownButton" menuId="mymenu">Hello world</button>
 *
 *  var button1 = dojo.widget.createWidget("DropDownButton", {caption: "hello world", menuId: foo});
 *	document.body.appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.DropDownButton",
	dijit.form.Button,
	{
		// summary
		//		push the button and a menu shows up

		// menuId: String
		//	widget id of the menu that this button should activate
		menuId: "",
		baseClass : "dijitDropDownButton",
		
		_orientation: {'BL':'TL', 'TL':'BL'},
		
		templateString:"<div class=\"dijit dijitLeft dijitInlineBox dijitDropDownButton\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onclick:_onArrowClick; onkeypress:_onKey;\"\n\t><div class='dijitRight'>\n\t<button tabIndex=\"${tabIndex}\" class=\"dijitStretch dijitButtonNode\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\tdojoAttachPoint=\"popupStateNode;focusNode\" waiRole=\"button\" waiState=\"haspopup-true\"\n\t\t><span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode\">${caption}</span\n\t\t><span class='dijitA11yDownArrow'>&#9660;</span>\n\t</button>\n</div></div>\n",

		postCreate: function(){
			dijit.form.DropDownButton.superclass.postCreate.apply(this, arguments);
			dijit.util.wai.setAttr(this.domNode, "waiState", "haspopup", this.menuId);
		},

		startup: function(){
			this._menu = dijit.byId(this.menuId);
			this.connect(this._menu, "onClose", function(){
				this.popupStateNode.removeAttribute("popupActive");
			}); 
		},

		_onKey: function(/*Event*/ e){
			// summary: callback when the user presses a key (on key-down)
			if(this.disabled){ return; }
			if(	   e.keyCode == dojo.keys.DOWN_ARROW
				|| e.keyCode == dojo.keys.ENTER
				|| e.keyCode == dojo.keys.SPACE){
				if(!this._menu || this._menu.domNode.style.display=="none"){
					this._onArrowClick(e);
				}
			}
		},

		_onArrowClick: function(/*Event*/ e){
			// summary: callback when button is clicked; user shouldn't override this function or else the menu won't toggle
			dojo.stopEvent(e);
			if(this.disabled){ return; }
			this.popupStateNode.focus();
			var menu = this._menu;
			if(!menu){ return; }
			if(!menu.isShowingNow){
				dijit.util.PopupManager.openAround(this.popupStateNode, menu, this._orientation);
				this.popupStateNode.setAttribute("popupActive", "true");
				this._opened=true;
			}else{
				dijit.util.PopupManager.closeAll();
				this._opened=false;
			}
		}
	});

/*
 * usage
 *	<button dojoType="ComboButton" onClick="..." menuId="mymenu">Hello world</button>
 *
 *  var button1 = dojo.widget.createWidget("DropDownButton", {caption: "hello world", onClick: foo, menuId: "myMenu"});
 *	document.body.appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.ComboButton",
	dijit.form.DropDownButton,
	{
		// summary
		//		left side is normal button, right side displays menu
		templateString:"<fieldset class='dijit dijitInline dijitLeft dijitComboButton' id=\"${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onclick:_onMouse; onkeypress:_onKey;\"\t\n>\n<table cellspacing='0' cellpadding='0'  waiRole=\"presentation\" >\n\t<tr>\n\t\t<td\tclass=\"dijitStretch dijitButtonContents dijitButtonNode\"\n\t\t\ttabIndex=\"${tabIndex}\" dojoAttachPoint=\"containerNode;focusNode\"\n\t\t\twaiRole=\"button\">\n\t\t\t${caption}\n\t\t</td>\n\t\t<td class='dijitReset dijitRight dijitButtonNode dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"popupStateNode\"\n\t\t\tdojoAttachEvent=\"onmouseover:_onArrowMouse;onmouseout:_onArrowMouse;onmousedown:_onArrowMouse;onclick:_onArrowClick; onkeypress:_onKey;\"\n\t\t\tbaseClass=\"dijitComboButtonDownArrow\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\n\t\t><div class='dijitRightSpacer'><span class='dijitA11yDownArrow'>&#9660;</span></div>\n\t</td></tr>\n</table>\n</fieldset>\n",
		_orientation: {'BR':'TR', 'TR':'BR'},
		
		// optionsTitle: String
		//  text that describes the options menu (accessibility)
		optionsTitle: "",

		baseClass: "dijitComboButton",
		_onArrowMouse : function(/*Event*/ e){
			this._onMouse(e, this.popupStateNode);
		}

	});
