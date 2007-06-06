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
		baseClass: "dojoButton",
		templateString:"<div class=\"dojoInlineBox dojoButton\"><button class=\"dojoButtonNode\" tabIndex=\"${this.tabIndex}\" type=\"${this.type}\" id=\"${this.id}\" name=\"${this.name}\" alt=\"${this.alt}\" dojoAttachPoint=\"containerNode\" class=\"dojoButtonContents\" dojoAttachEvent=\"onclick:buttonClick;\"></button></div>\n",
		
		postCreate: function(){
			dijit.form.Button.superclass.postCreate.apply(this, arguments);
			if(this.caption){
				this.setCaption(this.caption);
			}
		},
	
		buttonClick: function(/*Event*/ e){
			// summary: internal function for handling button clicks via mouse or keybd
			dojo.stopEvent(e);
			if(!this.disabled){ 
				this.onClick(e); 
			}
		},

		onClick: function(/*Event*/ e){
			// summary: callback for when button is clicked; user can override this function
		},

		setCaption: function(/*String*/ content){
			// summary: reset the caption (text) of the button; takes an HTML string
			this.containerNode.innerHTML = this.caption = content;
			if (dojo.isMozilla){ // Firefox has re-render issues with tables
				var oldDisplay = dojo.getComputedStyle(this.domNode).display;
				this.domNode.style.display="none";
				var _this = this;
				setTimeout(function(){_this.domNode.style.display=oldDisplay;},1);
			}
		},

		_setDisabled: function(/*Boolean*/ disable){
			dojo.forEach(this.domNode.getElementsByTagName('BUTTON'),
				function(button){
					button.disabled = (disable != false);
				}
			);
			dijit.form.Button.superclass._setDisabled.apply(this, arguments);
		}
	});

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

		_orientation: {'BL':'TL', 'TL':'BL'},
		
		templateString:"<div class=\"dojoInlineBox dojoButton\"\n><button tabIndex=\"${this.tabIndex}\" class=\"dojoButtonNode\" type=\"${this.type}\" id=\"${this.id}\" name=\"${this.name}\" alt=\"${this.alt}\" dojoAttachEvent=\"onclick:arrowClick; onkeypress:arrowKey;\"\n    dojoAttachPoint=\"popupStateNode\"\n\t><table cellpadding=0 cellspacing=0 cols=2\n\t\t><tr\n\t\t\t><td class=\"dojoButtonContents dojoButtonContentsDropDown\" dojoAttachPoint=\"containerNode\"></td\n\t\t\t><td class=\"dojoNonPositionOnly\" style=\"height:100%;\"\n\t\t\t        ><div class=\"dojoDownArrowOuter\"\n\t\t\t                ><div class=\"dojoDownArrowInner\"></div\n\t\t\t        ></div\n\t\t\t></td\n\t\t></tr\n\t></table\n></button></div>\n",

		postCreate: function(){
			dijit.form.DropDownButton.superclass.postCreate.apply(this, arguments);
			dijit.util.wai.setAttr(this.domNode, "waiState", "haspopup", this.menuId);
		},

		arrowKey: function(/*Event*/ e){
			// summary: callback when the user presses a key (on key-down)
			if(this.disabled){ return; }
			if(e.keyCode == dojo.keys.DOWN_ARROW || (e.currentTarget == this.popupStateNode && (e.keyCode == dojo.keys.SPACE || e.keyCode == dojo.keys.ENTER))){
				if (!this._menu || this._menu.domNode.style.display=="none"){
					this.arrowClick(e);
				}
			}
		},

		arrowClick: function(/*Event*/ e){
			// summary: callback when button is clicked; user shouldn't override this function or else the menu won't toggle
			dojo.stopEvent(e);
			if(this.disabled){ return; }
			this.popupStateNode.focus();
			var menu = dijit.byId(this.menuId); 
			if(!menu){ return; }
			if(menu.open && menu.domNode.style.display=="none"){
				dijit.util.PopupManager.openAround(this.popupStateNode, menu, this._orientation, [0,0]);
				if(menu.domNode.style.display!="none"){
					this._menu = menu;
					this.popupStateNode.setAttribute("popupActive", "true");
					this._oldMenuClose = menu.close;
					var _this = this;
					menu.close = function(){
						_this._menu = null;
						if (typeof _this._oldMenuClose == "function"){
							_this.popupStateNode.removeAttribute("popupActive");
							this.close = _this._oldMenuClose;
							_this._oldMenuClose = null;
							this.close();
						}
					}
				}
			} else if ( menu.close && menu.domNode.style.display!="none" ){
				menu.close();
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
		templateString:"<table class=\"dojoInlineBox dojoButton\" cellspacing=0 cellpadding=0 id=\"${this.id}\" name=\"${this.name}\"\n\t><tr\n\t\t><td\n\t\t\t><button type=\"${this.type}\"\n\t\t\t    class=\"dojoNonPositionOnly dojoButtonContents dojoButtonNode\"\n\t\t\t    dojoAttachEvent=\"onclick:buttonClick; onkeypress:arrowKey;\"\n\t\t\t    tabIndex=\"${this.tabIndex}\" dojoAttachPoint=\"containerNode\"\n\t\t\t></button\n\t\t></td\n\t\t><td class=\"dojoButtonArrow dojoButtonNode\"\n\t\t    dojoAttachPoint=\"popupStateNode\"\n\t\t    dojoAttachEvent=\"onclick:arrowClick; onkeypress:arrowKey;\"\n\t\t    style=\"height:100%;\"\n\t\t\t><div tabIndex=\"${this.tabIndex}\" class=\"dojoDownArrowOuter\"\n\t\t\t\t><div class=\"dojoDownArrowInner\"></div\n\t\t\t></div\n\t\t></td\n\t></tr\n></table>\n",
		_orientation: {'BR':'TR', 'TR':'BR'}
	});
