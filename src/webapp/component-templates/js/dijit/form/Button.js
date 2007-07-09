if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"] = true;
dojo.provide("dijit.form.Button");

dojo.require("dijit.form._FormWidget");
dojo.require("dijit.util.popup");

dojo.declare(
	"dijit.form.Button",
	dijit.form._FormWidget,
	{
/*
 * usage
 *	<button dojoType="button" onClick="...">Hello world</button>
 *
 *  var button1 = dojo.widget.createWidget("Button", {label: "hello world", onClick: foo});
 *	document.body.appendChild(button1.domNode);
 */
		// summary
		//	Basically the same thing as a normal HTML button, but with special styling.

		// label: String
		//	text to display in button
		label: "",

		// iconClass: String
		//	class to apply to div in button to make it display an icon
		iconClass: "",

		type: "button",
		baseClass: "dijitButton",
		templateString:"<div class=\"dijit dijitLeft dijitInline dijitButton\" baseClass=\"${baseClass}\"\n\tdojoAttachEvent=\"onclick:onClick;onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse\"\n\t><div class='dijitRight'\n\t><button class=\"dijitStretch dijitButtonNode dijitButtonContents\"\n\t\ttabIndex=\"${tabIndex}\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\t\t><div class=\"dijitInline ${iconClass}\"></div\n\t\t><span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode;focusNode\">${label}</span\n\t></button\n></div></div>\n",

		// TODO: set button's title to this.containerNode.innerText

		onClick: function(/*Event*/ e){
			// summary: callback for when button is clicked; user can override this function
		},

		setLabel: function(/*String*/ content){
			// summary: reset the label (text) of the button; takes an HTML string
			this.containerNode.innerHTML = this.label = content;
			if(dojo.isMozilla){ // Firefox has re-render issues with tables
				var oldDisplay = dojo.getComputedStyle(this.domNode).display;
				this.domNode.style.display="none";
				var _this = this;
				setTimeout(function(){_this.domNode.style.display=oldDisplay;},1);
			}
			// TODO: set button's title to this.containerNode.innerText
		}		
	}
);

/*
 * usage
 *	<button dojoType="DropDownButton" label="Hello world"><div dojotype=dijit.Menu>...</div></button>
 *
 *  var button1 = dojo.widget.createWidget("DropDownButton", {label: "hello world", dropDownId: foo});
 *	document.body.appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.DropDownButton",
	[dijit.form.Button, dijit._Container],
	{
		// summary
		//		push the button and a menu shows up

		baseClass : "dijitDropDownButton",

		templateString:"<div class=\"dijit dijitLeft dijitInlineBox dijitDropDownButton\" baseClass=\"dijitDropDownButton\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onclick:_onArrowClick; onkeypress:_onKey;\"\n\t><div class='dijitRight'>\n\t<button tabIndex=\"${tabIndex}\" class=\"dijitStretch dijitButtonNode\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\t\t><div class=\"dijitInline ${iconClass}\"></div\n\t\t><span class=\"dijitButtonContents\" \tdojoAttachPoint=\"containerNode;popupStateNode;focusNode\"\n\t\t waiRole=\"button\" waiState=\"haspopup-true;labelledby-${id}_label\" id=\"${id}_label\">${label}</span\n\t\t><span class='dijitA11yDownArrow'>&#9660;</span>\n\t</button>\n</div></div>\n",

		_fillContent: function(){
			// my inner HTML contains both the button text and a drop down widget, like
			// <DropDownButton>  <button>push me</button>  <Menu> ... </Menu> </DropDownButton>
			// first part holds button label and second part is popup
			if(this.srcNodeRef){
				var nodes = dojo.query("*", this.srcNodeRef);
				dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);
				
				// save pointer to srcNode so we can grab the drop down widget after it's instantiated
				this.dropDownContainer = this.srcNodeRef;
			}
		},

		startup: function(){
			// we didn't copy the dropdown widget from the this.srcNodeRef, so it's in no-man's
			// land now.  move it to document.body.
			if(!this.dropDown){
				var node = dojo.query("[widgetId]", this.dropDownContainer)[0];
				this.dropDown = dijit.util.manager.byNode(node);
			}
			dojo.body().appendChild(this.dropDown.domNode);
			this.dropDown.domNode.style.display="none";
		},

		_onArrowClick: function(/*Event*/ e){
			// summary: callback when the user mouse clicks on menu popup node
			if(this.disabled){ return; }
			this._toggleDropDown();
		},

		_onKey: function(/*Event*/ e){
			// summary: callback when the user presses a key on menu popup node
			if(this.disabled){ return; }
			if(e.keyCode == dojo.keys.DOWN_ARROW){
				if(!this.dropDown || this.dropDown.domNode.style.display=="none"){
					dojo.stopEvent(e);
					return this._toggleDropDown();
				}
			}
		},

		_toggleDropDown: function(){
			// summary: toggle the drop-down widget; if it is up, close it, if not, open it
			if(this.disabled){ return; }
			this.popupStateNode.focus();
			var dropDown = this.dropDown;
			if(!dropDown){ return false; }
			if(!dropDown.isShowingNow){
				var oldWidth=dropDown.domNode.style.width;
				var self = this;
				dijit.util.popup.open({
					popup: dropDown,
					around: this.domNode,
					onClose: function(){
						dropDown.domNode.style.width = oldWidth;
						self.popupStateNode.removeAttribute("popupActive");
					}
				});
				if(this.domNode.offsetWidth > dropDown.domNode.offsetWidth){
					// make menu at least as wide as the button
					dojo.marginBox(dropDown.domNode, {w:this.domNode.offsetWidth});
				}
				this.popupStateNode.setAttribute("popupActive", "true");
				this._opened=true;
			}else{
				dijit.util.popup.closeAll();
				this._opened=false;
			}
			// TODO: set this.selected and call setStateClass(), to affect button look while drop down is shown
			return false;
		}
	});

/*
 * usage
 *	<button dojoType="ComboButton" onClick="..."><span>Hello world</span><div dojoType=dijit.Menu>...</div></button>
 *
 *  var button1 = dojo.widget.createWidget("DropDownButton", {label: "hello world", onClick: foo, dropDownId: "myMenu"});
 *	document.body.appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.ComboButton",
	dijit.form.DropDownButton,
	{
		// summary
		//		left side is normal button, right side displays menu
		templateString:"<fieldset class='dijit dijitInline dijitLeft dijitComboButton'  baseClass='dijitComboButton'\n\tid=\"${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;\"\t\n>\n<table cellspacing='0' cellpadding='0'  waiRole=\"presentation\" >\n\t<tr>\n\t\t<td\tclass=\"dijitStretch dijitButtonContents dijitButtonNode\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\tdojoAttachEvent=\"onklick:_onButtonClick\"\n\t\t\twaiRole=\"button\">\n\t\t\t<div class=\"dijitInline ${iconClass}\"></div>\n\t\t\t<span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode;focusNode\" id=\"${id}_label\">${label}</span>\n\t\t</td>\n\t\t<td class='dijitReset dijitRight dijitButtonNode dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"popupStateNode\"\n\t\t\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onklick:_onArrowClick; onkeypress:_onKey;\"\n\t\t\tbaseClass=\"dijitComboButtonDownArrow\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\n\t\t><div waiRole=\"presentation\">&#9660;</div>\n\t</td></tr>\n</table>\n</fieldset>\n",

		// optionsTitle: String
		//  text that describes the options menu (accessibility)
		optionsTitle: "",

		baseClass: "dijitComboButton",

		_onButtonClick: function(/*Event*/ e){
			// summary: callback when the user mouse clicks the button portion
			dojo.stopEvent(e);
			if(this.disabled){ return; }
			this.focusNode.focus();
			return this.onClick(e);
		}
	});

dojo.declare(
	"dijit.form.ToggleButton",
	dijit.form.Button,
{
	// summary
	//	A button that can be in two states (selected or not).
	//	Can be base class for things like tabs or checkbox or radio buttons

	baseClass: "dijitToggleButton",

	// selected: Boolean
	//		True if the button is depressed, or the checkbox is checked,
	//		or the radio button is selected, etc.
	selected: false,

	onChange: function(/*Boolean*/ selected){
		// summary: callback for when state changes
	},

	onClick: function(/*Event*/ evt){
		this.setSelected(!this.selected);
	},

	setSelected: function(/*Boolean*/ selected){
		// summary
		//	Programatically deselect the button
		this.selected=selected;
		this._setStateClass();
		this.onChange(selected);	// TODO: finalize arg list to onChange()
	}
});

}
