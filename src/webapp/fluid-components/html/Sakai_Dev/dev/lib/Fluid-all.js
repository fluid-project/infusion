(function(){
/*
 * jQuery 1.2.6 - New Wave Javascript
 *
 * Copyright (c) 2008 John Resig (jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-05-24 14:22:17 -0400 (Sat, 24 May 2008) $
 * $Rev: 5685 $
 */

// Map over jQuery in case of overwrite
var _jQuery = window.jQuery,
// Map over the $ in case of overwrite
	_$ = window.$;

var jQuery = window.jQuery = window.$ = function( selector, context ) {
	// The jQuery object is actually just the init constructor 'enhanced'
	return new jQuery.fn.init( selector, context );
};

// A simple way to check for HTML strings or ID strings
// (both of which we optimize for)
var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#(\w+)$/,

// Is it a simple selector
	isSimple = /^.[^:#\[\.]*$/,

// Will speed up references to undefined, and allows munging its name.
	undefined;

jQuery.fn = jQuery.prototype = {
	init: function( selector, context ) {
		// Make sure that a selection was provided
		selector = selector || document;

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this[0] = selector;
			this.length = 1;
			return this;
		}
		// Handle HTML strings
		if ( typeof selector == "string" ) {
			// Are we dealing with HTML string or an ID?
			var match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] )
					selector = jQuery.clean( [ match[1] ], context );

				// HANDLE: $("#id")
				else {
					var elem = document.getElementById( match[3] );

					// Make sure an element was located
					if ( elem ){
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id != match[3] )
							return jQuery().find( selector );

						// Otherwise, we inject the element directly into the jQuery object
						return jQuery( elem );
					}
					selector = [];
				}

			// HANDLE: $(expr, [context])
			// (which is just equivalent to: $(content).find(expr)
			} else
				return jQuery( context ).find( selector );

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) )
			return jQuery( document )[ jQuery.fn.ready ? "ready" : "load" ]( selector );

		return this.setArray(jQuery.makeArray(selector));
	},

	// The current version of jQuery being used
	jquery: "1.2.6",

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	// The number of elements contained in the matched element set
	length: 0,

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == undefined ?

			// Return a 'clean' array
			jQuery.makeArray( this ) :

			// Return just the object
			this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {
		// Build a new jQuery matched element set
		var ret = jQuery( elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Force the current matched set of elements to become
	// the specified array of elements (destroying the stack in the process)
	// You should use pushStack() in order to do this, but maintain the stack
	setArray: function( elems ) {
		// Resetting the length to 0, then using the native Array push
		// is a super-fast way to populate an object with array-like properties
		this.length = 0;
		Array.prototype.push.apply( this, elems );

		return this;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		var ret = -1;

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem && elem.jquery ? elem[0] : elem
		, this );
	},

	attr: function( name, value, type ) {
		var options = name;

		// Look for the case where we're accessing a style value
		if ( name.constructor == String )
			if ( value === undefined )
				return this[0] && jQuery[ type || "attr" ]( this[0], name );

			else {
				options = {};
				options[ name ] = value;
			}

		// Check to see if we're setting style values
		return this.each(function(i){
			// Set all the styles
			for ( name in options )
				jQuery.attr(
					type ?
						this.style :
						this,
					name, jQuery.prop( this, options[ name ], type, i, name )
				);
		});
	},

	css: function( key, value ) {
		// ignore negative width and height values
		if ( (key == 'width' || key == 'height') && parseFloat(value) < 0 )
			value = undefined;
		return this.attr( key, value, "curCSS" );
	},

	text: function( text ) {
		if ( typeof text != "object" && text != null )
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );

		var ret = "";

		jQuery.each( text || this, function(){
			jQuery.each( this.childNodes, function(){
				if ( this.nodeType != 8 )
					ret += this.nodeType != 1 ?
						this.nodeValue :
						jQuery.fn.text( [ this ] );
			});
		});

		return ret;
	},

	wrapAll: function( html ) {
		if ( this[0] )
			// The elements to wrap the target around
			jQuery( html, this[0].ownerDocument )
				.clone()
				.insertBefore( this[0] )
				.map(function(){
					var elem = this;

					while ( elem.firstChild )
						elem = elem.firstChild;

					return elem;
				})
				.append(this);

		return this;
	},

	wrapInner: function( html ) {
		return this.each(function(){
			jQuery( this ).contents().wrapAll( html );
		});
	},

	wrap: function( html ) {
		return this.each(function(){
			jQuery( this ).wrapAll( html );
		});
	},

	append: function() {
		return this.domManip(arguments, true, false, function(elem){
			if (this.nodeType == 1)
				this.appendChild( elem );
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, true, function(elem){
			if (this.nodeType == 1)
				this.insertBefore( elem, this.firstChild );
		});
	},

	before: function() {
		return this.domManip(arguments, false, false, function(elem){
			this.parentNode.insertBefore( elem, this );
		});
	},

	after: function() {
		return this.domManip(arguments, false, true, function(elem){
			this.parentNode.insertBefore( elem, this.nextSibling );
		});
	},

	end: function() {
		return this.prevObject || jQuery( [] );
	},

	find: function( selector ) {
		var elems = jQuery.map(this, function(elem){
			return jQuery.find( selector, elem );
		});

		return this.pushStack( /[^+>] [^+>]/.test( selector ) || selector.indexOf("..") > -1 ?
			jQuery.unique( elems ) :
			elems );
	},

	clone: function( events ) {
		// Do the clone
		var ret = this.map(function(){
			if ( jQuery.browser.msie && !jQuery.isXMLDoc(this) ) {
				// IE copies events bound via attachEvent when
				// using cloneNode. Calling detachEvent on the
				// clone will also remove the events from the orignal
				// In order to get around this, we use innerHTML.
				// Unfortunately, this means some modifications to
				// attributes in IE that are actually only stored
				// as properties will not be copied (such as the
				// the name attribute on an input).
				var clone = this.cloneNode(true),
					container = document.createElement("div");
				container.appendChild(clone);
				return jQuery.clean([container.innerHTML])[0];
			} else
				return this.cloneNode(true);
		});

		// Need to set the expando to null on the cloned set if it exists
		// removeData doesn't work here, IE removes it from the original as well
		// this is primarily for IE but the data expando shouldn't be copied over in any browser
		var clone = ret.find("*").andSelf().each(function(){
			if ( this[ expando ] != undefined )
				this[ expando ] = null;
		});

		// Copy the events from the original to the clone
		if ( events === true )
			this.find("*").andSelf().each(function(i){
				if (this.nodeType == 3)
					return;
				var events = jQuery.data( this, "events" );

				for ( var type in events )
					for ( var handler in events[ type ] )
						jQuery.event.add( clone[ i ], type, events[ type ][ handler ], events[ type ][ handler ].data );
			});

		// Return the cloned set
		return ret;
	},

	filter: function( selector ) {
		return this.pushStack(
			jQuery.isFunction( selector ) &&
			jQuery.grep(this, function(elem, i){
				return selector.call( elem, i );
			}) ||

			jQuery.multiFilter( selector, this ) );
	},

	not: function( selector ) {
		if ( selector.constructor == String )
			// test special case where just one selector is passed in
			if ( isSimple.test( selector ) )
				return this.pushStack( jQuery.multiFilter( selector, this, true ) );
			else
				selector = jQuery.multiFilter( selector, this );

		var isArrayLike = selector.length && selector[selector.length - 1] !== undefined && !selector.nodeType;
		return this.filter(function() {
			return isArrayLike ? jQuery.inArray( this, selector ) < 0 : this != selector;
		});
	},

	add: function( selector ) {
		return this.pushStack( jQuery.unique( jQuery.merge(
			this.get(),
			typeof selector == 'string' ?
				jQuery( selector ) :
				jQuery.makeArray( selector )
		)));
	},

	is: function( selector ) {
		return !!selector && jQuery.multiFilter( selector, this ).length > 0;
	},

	hasClass: function( selector ) {
		return this.is( "." + selector );
	},

	val: function( value ) {
		if ( value == undefined ) {

			if ( this.length ) {
				var elem = this[0];

				// We need to handle select boxes special
				if ( jQuery.nodeName( elem, "select" ) ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type == "select-one";

					// Nothing was selected
					if ( index < 0 )
						return null;

					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];

						if ( option.selected ) {
							// Get the specifc value for the option
							value = jQuery.browser.msie && !option.attributes.value.specified ? option.text : option.value;

							// We don't need an array for one selects
							if ( one )
								return value;

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;

				// Everything else, we just grab the value
				} else
					return (this[0].value || "").replace(/\r/g, "");

			}

			return undefined;
		}

		if( value.constructor == Number )
			value += '';

		return this.each(function(){
			if ( this.nodeType != 1 )
				return;

			if ( value.constructor == Array && /radio|checkbox/.test( this.type ) )
				this.checked = (jQuery.inArray(this.value, value) >= 0 ||
					jQuery.inArray(this.name, value) >= 0);

			else if ( jQuery.nodeName( this, "select" ) ) {
				var values = jQuery.makeArray(value);

				jQuery( "option", this ).each(function(){
					this.selected = (jQuery.inArray( this.value, values ) >= 0 ||
						jQuery.inArray( this.text, values ) >= 0);
				});

				if ( !values.length )
					this.selectedIndex = -1;

			} else
				this.value = value;
		});
	},

	html: function( value ) {
		return value == undefined ?
			(this[0] ?
				this[0].innerHTML :
				null) :
			this.empty().append( value );
	},

	replaceWith: function( value ) {
		return this.after( value ).remove();
	},

	eq: function( i ) {
		return this.slice( i, i + 1 );
	},

	slice: function() {
		return this.pushStack( Array.prototype.slice.apply( this, arguments ) );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function(elem, i){
			return callback.call( elem, i, elem );
		}));
	},

	andSelf: function() {
		return this.add( this.prevObject );
	},

	data: function( key, value ){
		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			var data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			if ( data === undefined && this.length )
				data = jQuery.data( this[0], key );

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;
		} else
			return this.trigger("setData" + parts[1] + "!", [parts[0], value]).each(function(){
				jQuery.data( this, key, value );
			});
	},

	removeData: function( key ){
		return this.each(function(){
			jQuery.removeData( this, key );
		});
	},

	domManip: function( args, table, reverse, callback ) {
		var clone = this.length > 1, elems;

		return this.each(function(){
			if ( !elems ) {
				elems = jQuery.clean( args, this.ownerDocument );

				if ( reverse )
					elems.reverse();
			}

			var obj = this;

			if ( table && jQuery.nodeName( this, "table" ) && jQuery.nodeName( elems[0], "tr" ) )
				obj = this.getElementsByTagName("tbody")[0] || this.appendChild( this.ownerDocument.createElement("tbody") );

			var scripts = jQuery( [] );

			jQuery.each(elems, function(){
				var elem = clone ?
					jQuery( this ).clone( true )[0] :
					this;

				// execute all scripts after the elements have been injected
				if ( jQuery.nodeName( elem, "script" ) )
					scripts = scripts.add( elem );
				else {
					// Remove any inner scripts for later evaluation
					if ( elem.nodeType == 1 )
						scripts = scripts.add( jQuery( "script", elem ).remove() );

					// Inject the elements into the document
					callback.call( obj, elem );
				}
			});

			scripts.each( evalScript );
		});
	}
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

function evalScript( i, elem ) {
	if ( elem.src )
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});

	else
		jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );

	if ( elem.parentNode )
		elem.parentNode.removeChild( elem );
}

function now(){
	return +new Date;
}

jQuery.extend = jQuery.fn.extend = function() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

	// Handle a deep copy situation
	if ( target.constructor == Boolean ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target != "object" && typeof target != "function" )
		target = {};

	// extend jQuery itself if only one argument is passed
	if ( length == i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ )
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null )
			// Extend the base object
			for ( var name in options ) {
				var src = target[ name ], copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy )
					continue;

				// Recurse if we're merging object values
				if ( deep && copy && typeof copy == "object" && !copy.nodeType )
					target[ name ] = jQuery.extend( deep, 
						// Never move original objects, clone them
						src || ( copy.length != null ? [ ] : { } )
					, copy );

				// Don't bring in undefined values
				else if ( copy !== undefined )
					target[ name ] = copy;

			}

	// Return the modified object
	return target;
};

var expando = "jQuery" + now(), uuid = 0, windowData = {},
	// exclude the following css properties to add px
	exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	// cache defaultView
	defaultView = document.defaultView || {};

jQuery.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep )
			window.jQuery = _jQuery;

		return jQuery;
	},

	// See test/unit/core.js for details concerning this function.
	isFunction: function( fn ) {
		return !!fn && typeof fn != "string" && !fn.nodeName &&
			fn.constructor != Array && /^[\s[]?function/.test( fn + "" );
	},

	// check if an element is in a (or is an) XML document
	isXMLDoc: function( elem ) {
		return elem.documentElement && !elem.body ||
			elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
	},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		data = jQuery.trim( data );

		if ( data ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				script = document.createElement("script");

			script.type = "text/javascript";
			if ( jQuery.browser.msie )
				script.text = data;
			else
				script.appendChild( document.createTextNode( data ) );

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
	},

	cache: {},

	data: function( elem, name, data ) {
		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ];

		// Compute a unique ID for the element
		if ( !id )
			id = elem[ expando ] = ++uuid;

		// Only generate the data cache if we're
		// trying to access or manipulate it
		if ( name && !jQuery.cache[ id ] )
			jQuery.cache[ id ] = {};

		// Prevent overriding the named cache with undefined values
		if ( data !== undefined )
			jQuery.cache[ id ][ name ] = data;

		// Return the named cache data, or the ID for the element
		return name ?
			jQuery.cache[ id ][ name ] :
			id;
	},

	removeData: function( elem, name ) {
		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ];

		// If we want to remove a specific section of the element's data
		if ( name ) {
			if ( jQuery.cache[ id ] ) {
				// Remove the section of cache data
				delete jQuery.cache[ id ][ name ];

				// If we've removed all the data, remove the element's cache
				name = "";

				for ( name in jQuery.cache[ id ] )
					break;

				if ( !name )
					jQuery.removeData( elem );
			}

		// Otherwise, we want to remove all of the element's data
		} else {
			// Clean up the element expando
			try {
				delete elem[ expando ];
			} catch(e){
				// IE has trouble directly removing the expando
				// but it's ok with using removeAttribute
				if ( elem.removeAttribute )
					elem.removeAttribute( expando );
			}

			// Completely remove the data cache
			delete jQuery.cache[ id ];
		}
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0, length = object.length;

		if ( args ) {
			if ( length == undefined ) {
				for ( name in object )
					if ( callback.apply( object[ name ], args ) === false )
						break;
			} else
				for ( ; i < length; )
					if ( callback.apply( object[ i++ ], args ) === false )
						break;

		// A special, fast, case for the most common use of each
		} else {
			if ( length == undefined ) {
				for ( name in object )
					if ( callback.call( object[ name ], name, object[ name ] ) === false )
						break;
			} else
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
		}

		return object;
	},

	prop: function( elem, value, type, i, name ) {
		// Handle executable functions
		if ( jQuery.isFunction( value ) )
			value = value.call( elem, i );

		// Handle passing in a number to a CSS property
		return value && value.constructor == Number && type == "curCSS" && !exclude.test( name ) ?
			value + "px" :
			value;
	},

	className: {
		// internal only, use addClass("class")
		add: function( elem, classNames ) {
			jQuery.each((classNames || "").split(/\s+/), function(i, className){
				if ( elem.nodeType == 1 && !jQuery.className.has( elem.className, className ) )
					elem.className += (elem.className ? " " : "") + className;
			});
		},

		// internal only, use removeClass("class")
		remove: function( elem, classNames ) {
			if (elem.nodeType == 1)
				elem.className = classNames != undefined ?
					jQuery.grep(elem.className.split(/\s+/), function(className){
						return !jQuery.className.has( classNames, className );
					}).join(" ") :
					"";
		},

		// internal only, use hasClass("class")
		has: function( elem, className ) {
			return jQuery.inArray( className, (elem.className || elem).toString().split(/\s+/) ) > -1;
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};
		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( var name in options )
			elem.style[ name ] = old[ name ];
	},

	css: function( elem, name, force ) {
		if ( name == "width" || name == "height" ) {
			var val, props = { position: "absolute", visibility: "hidden", display:"block" }, which = name == "width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ];

			function getWH() {
				val = name == "width" ? elem.offsetWidth : elem.offsetHeight;
				var padding = 0, border = 0;
				jQuery.each( which, function() {
					padding += parseFloat(jQuery.curCSS( elem, "padding" + this, true)) || 0;
					border += parseFloat(jQuery.curCSS( elem, "border" + this + "Width", true)) || 0;
				});
				val -= Math.round(padding + border);
			}

			if ( jQuery(elem).is(":visible") )
				getWH();
			else
				jQuery.swap( elem, props, getWH );

			return Math.max(0, val);
		}

		return jQuery.curCSS( elem, name, force );
	},

	curCSS: function( elem, name, force ) {
		var ret, style = elem.style;

		// A helper method for determining if an element's values are broken
		function color( elem ) {
			if ( !jQuery.browser.safari )
				return false;

			// defaultView is cached
			var ret = defaultView.getComputedStyle( elem, null );
			return !ret || ret.getPropertyValue("color") == "";
		}

		// We need to handle opacity special in IE
		if ( name == "opacity" && jQuery.browser.msie ) {
			ret = jQuery.attr( style, "opacity" );

			return ret == "" ?
				"1" :
				ret;
		}
		// Opera sometimes will give the wrong display answer, this fixes it, see #2037
		if ( jQuery.browser.opera && name == "display" ) {
			var save = style.outline;
			style.outline = "0 solid black";
			style.outline = save;
		}

		// Make sure we're using the right name for getting the float value
		if ( name.match( /float/i ) )
			name = styleFloat;

		if ( !force && style && style[ name ] )
			ret = style[ name ];

		else if ( defaultView.getComputedStyle ) {

			// Only "float" is needed here
			if ( name.match( /float/i ) )
				name = "float";

			name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

			var computedStyle = defaultView.getComputedStyle( elem, null );

			if ( computedStyle && !color( elem ) )
				ret = computedStyle.getPropertyValue( name );

			// If the element isn't reporting its values properly in Safari
			// then some display: none elements are involved
			else {
				var swap = [], stack = [], a = elem, i = 0;

				// Locate all of the parent display: none elements
				for ( ; a && color(a); a = a.parentNode )
					stack.unshift(a);

				// Go through and make them visible, but in reverse
				// (It would be better if we knew the exact display type that they had)
				for ( ; i < stack.length; i++ )
					if ( color( stack[ i ] ) ) {
						swap[ i ] = stack[ i ].style.display;
						stack[ i ].style.display = "block";
					}

				// Since we flip the display style, we have to handle that
				// one special, otherwise get the value
				ret = name == "display" && swap[ stack.length - 1 ] != null ?
					"none" :
					( computedStyle && computedStyle.getPropertyValue( name ) ) || "";

				// Finally, revert the display styles back
				for ( i = 0; i < swap.length; i++ )
					if ( swap[ i ] != null )
						stack[ i ].style.display = swap[ i ];
			}

			// We should always get a number back from opacity
			if ( name == "opacity" && ret == "" )
				ret = "1";

		} else if ( elem.currentStyle ) {
			var camelCase = name.replace(/\-(\w)/g, function(all, letter){
				return letter.toUpperCase();
			});

			ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if ( !/^\d+(px)?$/i.test( ret ) && /^\d/.test( ret ) ) {
				// Remember the original values
				var left = style.left, rsLeft = elem.runtimeStyle.left;

				// Put in the new values to get a computed value out
				elem.runtimeStyle.left = elem.currentStyle.left;
				style.left = ret || 0;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret;
	},

	clean: function( elems, context ) {
		var ret = [];
		context = context || document;
		// !context.createElement fails in IE with an error but returns typeof 'object'
		if (typeof context.createElement == 'undefined')
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;

		jQuery.each(elems, function(i, elem){
			if ( !elem )
				return;

			if ( elem.constructor == Number )
				elem += '';

			// Convert html string into DOM nodes
			if ( typeof elem == "string" ) {
				// Fix "XHTML"-style tags in all browsers
				elem = elem.replace(/(<(\w+)[^>]*?)\/>/g, function(all, front, tag){
					return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
						all :
						front + "></" + tag + ">";
				});

				// Trim whitespace, otherwise indexOf won't work as expected
				var tags = jQuery.trim( elem ).toLowerCase(), div = context.createElement("div");

				var wrap =
					// option or optgroup
					!tags.indexOf("<opt") &&
					[ 1, "<select multiple='multiple'>", "</select>" ] ||

					!tags.indexOf("<leg") &&
					[ 1, "<fieldset>", "</fieldset>" ] ||

					tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
					[ 1, "<table>", "</table>" ] ||

					!tags.indexOf("<tr") &&
					[ 2, "<table><tbody>", "</tbody></table>" ] ||

				 	// <thead> matched above
					(!tags.indexOf("<td") || !tags.indexOf("<th")) &&
					[ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||

					!tags.indexOf("<col") &&
					[ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

					// IE can't serialize <link> and <script> tags normally
					jQuery.browser.msie &&
					[ 1, "div<div>", "</div>" ] ||

					[ 0, "", "" ];

				// Go to html and back, then peel off extra wrappers
				div.innerHTML = wrap[1] + elem + wrap[2];

				// Move to the right depth
				while ( wrap[0]-- )
					div = div.lastChild;

				// Remove IE's autoinserted <tbody> from table fragments
				if ( jQuery.browser.msie ) {

					// String was a <table>, *may* have spurious <tbody>
					var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ?
						div.firstChild && div.firstChild.childNodes :

						// String was a bare <thead> or <tfoot>
						wrap[1] == "<table>" && tags.indexOf("<tbody") < 0 ?
							div.childNodes :
							[];

					for ( var j = tbody.length - 1; j >= 0 ; --j )
						if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length )
							tbody[ j ].parentNode.removeChild( tbody[ j ] );

					// IE completely kills leading whitespace when innerHTML is used
					if ( /^\s/.test( elem ) )
						div.insertBefore( context.createTextNode( elem.match(/^\s*/)[0] ), div.firstChild );

				}

				elem = jQuery.makeArray( div.childNodes );
			}

			if ( elem.length === 0 && (!jQuery.nodeName( elem, "form" ) && !jQuery.nodeName( elem, "select" )) )
				return;

			if ( elem[0] == undefined || jQuery.nodeName( elem, "form" ) || elem.options )
				ret.push( elem );

			else
				ret = jQuery.merge( ret, elem );

		});

		return ret;
	},

	attr: function( elem, name, value ) {
		// don't set attributes on text and comment nodes
		if (!elem || elem.nodeType == 3 || elem.nodeType == 8)
			return undefined;

		var notxml = !jQuery.isXMLDoc( elem ),
			// Whether we are setting (or getting)
			set = value !== undefined,
			msie = jQuery.browser.msie;

		// Try to normalize/fix the name
		name = notxml && jQuery.props[ name ] || name;

		// Only do all the following if this is a node (faster for style)
		// IE elem.getAttribute passes even for style
		if ( elem.tagName ) {

			// These attributes require special treatment
			var special = /href|src|style/.test( name );

			// Safari mis-reports the default selected property of a hidden option
			// Accessing the parent's selectedIndex property fixes it
			if ( name == "selected" && jQuery.browser.safari )
				elem.parentNode.selectedIndex;

			// If applicable, access the attribute via the DOM 0 way
			if ( name in elem && notxml && !special ) {
				if ( set ){
					// We can't allow the type property to be changed (since it causes problems in IE)
					if ( name == "type" && jQuery.nodeName( elem, "input" ) && elem.parentNode )
						throw "type property can't be changed";

					elem[ name ] = value;
				}

				// browsers index elements by id/name on forms, give priority to attributes.
				if( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) )
					return elem.getAttributeNode( name ).nodeValue;

				return elem[ name ];
			}

			if ( msie && notxml &&  name == "style" )
				return jQuery.attr( elem.style, "cssText", value );

			if ( set )
				// convert the value to a string (all browsers do this but IE) see #1070
				elem.setAttribute( name, "" + value );

			var attr = msie && notxml && special
					// Some attributes require a special call on IE
					? elem.getAttribute( name, 2 )
					: elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}

		// elem is actually elem.style ... set the style

		// IE uses filters for opacity
		if ( msie && name == "opacity" ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				elem.zoom = 1;

				// Set the alpha filter to set the opacity
				elem.filter = (elem.filter || "").replace( /alpha\([^)]*\)/, "" ) +
					(parseInt( value ) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
			}

			return elem.filter && elem.filter.indexOf("opacity=") >= 0 ?
				(parseFloat( elem.filter.match(/opacity=([^)]*)/)[1] ) / 100) + '':
				"";
		}

		name = name.replace(/-([a-z])/ig, function(all, letter){
			return letter.toUpperCase();
		});

		if ( set )
			elem[ name ] = value;

		return elem[ name ];
	},

	trim: function( text ) {
		return (text || "").replace( /^\s+|\s+$/g, "" );
	},

	makeArray: function( array ) {
		var ret = [];

		if( array != null ){
			var i = array.length;
			//the window, strings and functions also have 'length'
			if( i == null || array.split || array.setInterval || array.call )
				ret[0] = array;
			else
				while( i )
					ret[--i] = array[i];
		}

		return ret;
	},

	inArray: function( elem, array ) {
		for ( var i = 0, length = array.length; i < length; i++ )
		// Use === because on IE, window == document
			if ( array[ i ] === elem )
				return i;

		return -1;
	},

	merge: function( first, second ) {
		// We have to loop this way because IE & Opera overwrite the length
		// expando of getElementsByTagName
		var i = 0, elem, pos = first.length;
		// Also, we need to make sure that the correct elements are being returned
		// (IE returns comment nodes in a '*' query)
		if ( jQuery.browser.msie ) {
			while ( elem = second[ i++ ] )
				if ( elem.nodeType != 8 )
					first[ pos++ ] = elem;

		} else
			while ( elem = second[ i++ ] )
				first[ pos++ ] = elem;

		return first;
	},

	unique: function( array ) {
		var ret = [], done = {};

		try {

			for ( var i = 0, length = array.length; i < length; i++ ) {
				var id = jQuery.data( array[ i ] );

				if ( !done[ id ] ) {
					done[ id ] = true;
					ret.push( array[ i ] );
				}
			}

		} catch( e ) {
			ret = array;
		}

		return ret;
	},

	grep: function( elems, callback, inv ) {
		var ret = [];

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ )
			if ( !inv != !callback( elems[ i ], i ) )
				ret.push( elems[ i ] );

		return ret;
	},

	map: function( elems, callback ) {
		var ret = [];

		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			var value = callback( elems[ i ], i );

			if ( value != null )
				ret[ ret.length ] = value;
		}

		return ret.concat.apply( [], ret );
	}
});

var userAgent = navigator.userAgent.toLowerCase();

// Figure out what browser is being used
jQuery.browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
	safari: /webkit/.test( userAgent ),
	opera: /opera/.test( userAgent ),
	msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
	mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
};

var styleFloat = jQuery.browser.msie ?
	"styleFloat" :
	"cssFloat";

jQuery.extend({
	// Check to see if the W3C box model is being used
	boxModel: !jQuery.browser.msie || document.compatMode == "CSS1Compat",

	props: {
		"for": "htmlFor",
		"class": "className",
		"float": styleFloat,
		cssFloat: styleFloat,
		styleFloat: styleFloat,
		readonly: "readOnly",
		maxlength: "maxLength",
		cellspacing: "cellSpacing"
	}
});

jQuery.each({
	parent: function(elem){return elem.parentNode;},
	parents: function(elem){return jQuery.dir(elem,"parentNode");},
	next: function(elem){return jQuery.nth(elem,2,"nextSibling");},
	prev: function(elem){return jQuery.nth(elem,2,"previousSibling");},
	nextAll: function(elem){return jQuery.dir(elem,"nextSibling");},
	prevAll: function(elem){return jQuery.dir(elem,"previousSibling");},
	siblings: function(elem){return jQuery.sibling(elem.parentNode.firstChild,elem);},
	children: function(elem){return jQuery.sibling(elem.firstChild);},
	contents: function(elem){return jQuery.nodeName(elem,"iframe")?elem.contentDocument||elem.contentWindow.document:jQuery.makeArray(elem.childNodes);}
}, function(name, fn){
	jQuery.fn[ name ] = function( selector ) {
		var ret = jQuery.map( this, fn );

		if ( selector && typeof selector == "string" )
			ret = jQuery.multiFilter( selector, ret );

		return this.pushStack( jQuery.unique( ret ) );
	};
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function(name, original){
	jQuery.fn[ name ] = function() {
		var args = arguments;

		return this.each(function(){
			for ( var i = 0, length = args.length; i < length; i++ )
				jQuery( args[ i ] )[ original ]( this );
		});
	};
});

jQuery.each({
	removeAttr: function( name ) {
		jQuery.attr( this, name, "" );
		if (this.nodeType == 1)
			this.removeAttribute( name );
	},

	addClass: function( classNames ) {
		jQuery.className.add( this, classNames );
	},

	removeClass: function( classNames ) {
		jQuery.className.remove( this, classNames );
	},

	toggleClass: function( classNames ) {
		jQuery.className[ jQuery.className.has( this, classNames ) ? "remove" : "add" ]( this, classNames );
	},

	remove: function( selector ) {
		if ( !selector || jQuery.filter( selector, [ this ] ).r.length ) {
			// Prevent memory leaks
			jQuery( "*", this ).add(this).each(function(){
				jQuery.event.remove(this);
				jQuery.removeData(this);
			});
			if (this.parentNode)
				this.parentNode.removeChild( this );
		}
	},

	empty: function() {
		// Remove element nodes and prevent memory leaks
		jQuery( ">*", this ).remove();

		// Remove any remaining nodes
		while ( this.firstChild )
			this.removeChild( this.firstChild );
	}
}, function(name, fn){
	jQuery.fn[ name ] = function(){
		return this.each( fn, arguments );
	};
});

jQuery.each([ "Height", "Width" ], function(i, name){
	var type = name.toLowerCase();

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		return this[0] == window ?
			// Opera reports document.body.client[Width/Height] properly in both quirks and standards
			jQuery.browser.opera && document.body[ "client" + name ] ||

			// Safari reports inner[Width/Height] just fine (Mozilla and Opera include scroll bar widths)
			jQuery.browser.safari && window[ "inner" + name ] ||

			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			document.compatMode == "CSS1Compat" && document.documentElement[ "client" + name ] || document.body[ "client" + name ] :

			// Get document width or height
			this[0] == document ?
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					Math.max(document.body["scroll" + name], document.documentElement["scroll" + name]),
					Math.max(document.body["offset" + name], document.documentElement["offset" + name])
				) :

				// Get or set width or height on the element
				size == undefined ?
					// Get width or height on the element
					(this.length ? jQuery.css( this[0], type ) : null) :

					// Set the width or height on the element (default to pixels if value is unitless)
					this.css( type, size.constructor == String ? size : size + "px" );
	};
});

// Helper function used by the dimensions and offset modules
function num(elem, prop) {
	return elem[0] && parseInt( jQuery.curCSS(elem[0], prop, true), 10 ) || 0;
}var chars = jQuery.browser.safari && parseInt(jQuery.browser.version) < 417 ?
		"(?:[\\w*_-]|\\\\.)" :
		"(?:[\\w\u0128-\uFFFF*_-]|\\\\.)",
	quickChild = new RegExp("^>\\s*(" + chars + "+)"),
	quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)"),
	quickClass = new RegExp("^([#.]?)(" + chars + "*)");

jQuery.extend({
	expr: {
		"": function(a,i,m){return m[2]=="*"||jQuery.nodeName(a,m[2]);},
		"#": function(a,i,m){return a.getAttribute("id")==m[2];},
		":": {
			// Position Checks
			lt: function(a,i,m){return i<m[3]-0;},
			gt: function(a,i,m){return i>m[3]-0;},
			nth: function(a,i,m){return m[3]-0==i;},
			eq: function(a,i,m){return m[3]-0==i;},
			first: function(a,i){return i==0;},
			last: function(a,i,m,r){return i==r.length-1;},
			even: function(a,i){return i%2==0;},
			odd: function(a,i){return i%2;},

			// Child Checks
			"first-child": function(a){return a.parentNode.getElementsByTagName("*")[0]==a;},
			"last-child": function(a){return jQuery.nth(a.parentNode.lastChild,1,"previousSibling")==a;},
			"only-child": function(a){return !jQuery.nth(a.parentNode.lastChild,2,"previousSibling");},

			// Parent Checks
			parent: function(a){return a.firstChild;},
			empty: function(a){return !a.firstChild;},

			// Text Check
			contains: function(a,i,m){return (a.textContent||a.innerText||jQuery(a).text()||"").indexOf(m[3])>=0;},

			// Visibility
			visible: function(a){return "hidden"!=a.type&&jQuery.css(a,"display")!="none"&&jQuery.css(a,"visibility")!="hidden";},
			hidden: function(a){return "hidden"==a.type||jQuery.css(a,"display")=="none"||jQuery.css(a,"visibility")=="hidden";},

			// Form attributes
			enabled: function(a){return !a.disabled;},
			disabled: function(a){return a.disabled;},
			checked: function(a){return a.checked;},
			selected: function(a){return a.selected||jQuery.attr(a,"selected");},

			// Form elements
			text: function(a){return "text"==a.type;},
			radio: function(a){return "radio"==a.type;},
			checkbox: function(a){return "checkbox"==a.type;},
			file: function(a){return "file"==a.type;},
			password: function(a){return "password"==a.type;},
			submit: function(a){return "submit"==a.type;},
			image: function(a){return "image"==a.type;},
			reset: function(a){return "reset"==a.type;},
			button: function(a){return "button"==a.type||jQuery.nodeName(a,"button");},
			input: function(a){return /input|select|textarea|button/i.test(a.nodeName);},

			// :has()
			has: function(a,i,m){return jQuery.find(m[3],a).length;},

			// :header
			header: function(a){return /h\d/i.test(a.nodeName);},

			// :animated
			animated: function(a){return jQuery.grep(jQuery.timers,function(fn){return a==fn.elem;}).length;}
		}
	},

	// The regular expressions that power the parsing engine
	parse: [
		// Match: [@value='test'], [@foo]
		/^(\[) *@?([\w-]+) *([!*$^~=]*) *('?"?)(.*?)\4 *\]/,

		// Match: :contains('foo')
		/^(:)([\w-]+)\("?'?(.*?(\(.*?\))?[^(]*?)"?'?\)/,

		// Match: :even, :last-child, #id, .class
		new RegExp("^([:.#]*)(" + chars + "+)")
	],

	multiFilter: function( expr, elems, not ) {
		var old, cur = [];

		while ( expr && expr != old ) {
			old = expr;
			var f = jQuery.filter( expr, elems, not );
			expr = f.t.replace(/^\s*,\s*/, "" );
			cur = not ? elems = f.r : jQuery.merge( cur, f.r );
		}

		return cur;
	},

	find: function( t, context ) {
		// Quickly handle non-string expressions
		if ( typeof t != "string" )
			return [ t ];

		// check to make sure context is a DOM element or a document
		if ( context && context.nodeType != 1 && context.nodeType != 9)
			return [ ];

		// Set the correct context (if none is provided)
		context = context || document;

		// Initialize the search
		var ret = [context], done = [], last, nodeName;

		// Continue while a selector expression exists, and while
		// we're no longer looping upon ourselves
		while ( t && last != t ) {
			var r = [];
			last = t;

			t = jQuery.trim(t);

			var foundToken = false,

			// An attempt at speeding up child selectors that
			// point to a specific element tag
				re = quickChild,

				m = re.exec(t);

			if ( m ) {
				nodeName = m[1].toUpperCase();

				// Perform our own iteration and filter
				for ( var i = 0; ret[i]; i++ )
					for ( var c = ret[i].firstChild; c; c = c.nextSibling )
						if ( c.nodeType == 1 && (nodeName == "*" || c.nodeName.toUpperCase() == nodeName) )
							r.push( c );

				ret = r;
				t = t.replace( re, "" );
				if ( t.indexOf(" ") == 0 ) continue;
				foundToken = true;
			} else {
				re = /^([>+~])\s*(\w*)/i;

				if ( (m = re.exec(t)) != null ) {
					r = [];

					var merge = {};
					nodeName = m[2].toUpperCase();
					m = m[1];

					for ( var j = 0, rl = ret.length; j < rl; j++ ) {
						var n = m == "~" || m == "+" ? ret[j].nextSibling : ret[j].firstChild;
						for ( ; n; n = n.nextSibling )
							if ( n.nodeType == 1 ) {
								var id = jQuery.data(n);

								if ( m == "~" && merge[id] ) break;

								if (!nodeName || n.nodeName.toUpperCase() == nodeName ) {
									if ( m == "~" ) merge[id] = true;
									r.push( n );
								}

								if ( m == "+" ) break;
							}
					}

					ret = r;

					// And remove the token
					t = jQuery.trim( t.replace( re, "" ) );
					foundToken = true;
				}
			}

			// See if there's still an expression, and that we haven't already
			// matched a token
			if ( t && !foundToken ) {
				// Handle multiple expressions
				if ( !t.indexOf(",") ) {
					// Clean the result set
					if ( context == ret[0] ) ret.shift();

					// Merge the result sets
					done = jQuery.merge( done, ret );

					// Reset the context
					r = ret = [context];

					// Touch up the selector string
					t = " " + t.substr(1,t.length);

				} else {
					// Optimize for the case nodeName#idName
					var re2 = quickID;
					var m = re2.exec(t);

					// Re-organize the results, so that they're consistent
					if ( m ) {
						m = [ 0, m[2], m[3], m[1] ];

					} else {
						// Otherwise, do a traditional filter check for
						// ID, class, and element selectors
						re2 = quickClass;
						m = re2.exec(t);
					}

					m[2] = m[2].replace(/\\/g, "");

					var elem = ret[ret.length-1];

					// Try to do a global search by ID, where we can
					if ( m[1] == "#" && elem && elem.getElementById && !jQuery.isXMLDoc(elem) ) {
						// Optimization for HTML document case
						var oid = elem.getElementById(m[2]);

						// Do a quick check for the existence of the actual ID attribute
						// to avoid selecting by the name attribute in IE
						// also check to insure id is a string to avoid selecting an element with the name of 'id' inside a form
						if ( (jQuery.browser.msie||jQuery.browser.opera) && oid && typeof oid.id == "string" && oid.id != m[2] )
							oid = jQuery('[@id="'+m[2]+'"]', elem)[0];

						// Do a quick check for node name (where applicable) so
						// that div#foo searches will be really fast
						ret = r = oid && (!m[3] || jQuery.nodeName(oid, m[3])) ? [oid] : [];
					} else {
						// We need to find all descendant elements
						for ( var i = 0; ret[i]; i++ ) {
							// Grab the tag name being searched for
							var tag = m[1] == "#" && m[3] ? m[3] : m[1] != "" || m[0] == "" ? "*" : m[2];

							// Handle IE7 being really dumb about <object>s
							if ( tag == "*" && ret[i].nodeName.toLowerCase() == "object" )
								tag = "param";

							r = jQuery.merge( r, ret[i].getElementsByTagName( tag ));
						}

						// It's faster to filter by class and be done with it
						if ( m[1] == "." )
							r = jQuery.classFilter( r, m[2] );

						// Same with ID filtering
						if ( m[1] == "#" ) {
							var tmp = [];

							// Try to find the element with the ID
							for ( var i = 0; r[i]; i++ )
								if ( r[i].getAttribute("id") == m[2] ) {
									tmp = [ r[i] ];
									break;
								}

							r = tmp;
						}

						ret = r;
					}

					t = t.replace( re2, "" );
				}

			}

			// If a selector string still exists
			if ( t ) {
				// Attempt to filter it
				var val = jQuery.filter(t,r);
				ret = r = val.r;
				t = jQuery.trim(val.t);
			}
		}

		// An error occurred with the selector;
		// just return an empty set instead
		if ( t )
			ret = [];

		// Remove the root context
		if ( ret && context == ret[0] )
			ret.shift();

		// And combine the results
		done = jQuery.merge( done, ret );

		return done;
	},

	classFilter: function(r,m,not){
		m = " " + m + " ";
		var tmp = [];
		for ( var i = 0; r[i]; i++ ) {
			var pass = (" " + r[i].className + " ").indexOf( m ) >= 0;
			if ( !not && pass || not && !pass )
				tmp.push( r[i] );
		}
		return tmp;
	},

	filter: function(t,r,not) {
		var last;

		// Look for common filter expressions
		while ( t && t != last ) {
			last = t;

			var p = jQuery.parse, m;

			for ( var i = 0; p[i]; i++ ) {
				m = p[i].exec( t );

				if ( m ) {
					// Remove what we just matched
					t = t.substring( m[0].length );

					m[2] = m[2].replace(/\\/g, "");
					break;
				}
			}

			if ( !m )
				break;

			// :not() is a special case that can be optimized by
			// keeping it out of the expression list
			if ( m[1] == ":" && m[2] == "not" )
				// optimize if only one selector found (most common case)
				r = isSimple.test( m[3] ) ?
					jQuery.filter(m[3], r, true).r :
					jQuery( r ).not( m[3] );

			// We can get a big speed boost by filtering by class here
			else if ( m[1] == "." )
				r = jQuery.classFilter(r, m[2], not);

			else if ( m[1] == "[" ) {
				var tmp = [], type = m[3];

				for ( var i = 0, rl = r.length; i < rl; i++ ) {
					var a = r[i], z = a[ jQuery.props[m[2]] || m[2] ];

					if ( z == null || /href|src|selected/.test(m[2]) )
						z = jQuery.attr(a,m[2]) || '';

					if ( (type == "" && !!z ||
						 type == "=" && z == m[5] ||
						 type == "!=" && z != m[5] ||
						 type == "^=" && z && !z.indexOf(m[5]) ||
						 type == "$=" && z.substr(z.length - m[5].length) == m[5] ||
						 (type == "*=" || type == "~=") && z.indexOf(m[5]) >= 0) ^ not )
							tmp.push( a );
				}

				r = tmp;

			// We can get a speed boost by handling nth-child here
			} else if ( m[1] == ":" && m[2] == "nth-child" ) {
				var merge = {}, tmp = [],
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
						m[3] == "even" && "2n" || m[3] == "odd" && "2n+1" ||
						!/\D/.test(m[3]) && "0n+" + m[3] || m[3]),
					// calculate the numbers (first)n+(last) including if they are negative
					first = (test[1] + (test[2] || 1)) - 0, last = test[3] - 0;

				// loop through all the elements left in the jQuery object
				for ( var i = 0, rl = r.length; i < rl; i++ ) {
					var node = r[i], parentNode = node.parentNode, id = jQuery.data(parentNode);

					if ( !merge[id] ) {
						var c = 1;

						for ( var n = parentNode.firstChild; n; n = n.nextSibling )
							if ( n.nodeType == 1 )
								n.nodeIndex = c++;

						merge[id] = true;
					}

					var add = false;

					if ( first == 0 ) {
						if ( node.nodeIndex == last )
							add = true;
					} else if ( (node.nodeIndex - last) % first == 0 && (node.nodeIndex - last) / first >= 0 )
						add = true;

					if ( add ^ not )
						tmp.push( node );
				}

				r = tmp;

			// Otherwise, find the expression to execute
			} else {
				var fn = jQuery.expr[ m[1] ];
				if ( typeof fn == "object" )
					fn = fn[ m[2] ];

				if ( typeof fn == "string" )
					fn = eval("false||function(a,i){return " + fn + ";}");

				// Execute it against the current filter
				r = jQuery.grep( r, function(elem, i){
					return fn(elem, i, m, r);
				}, not );
			}
		}

		// Return an array of filtered elements (r)
		// and the modified expression string (t)
		return { r: r, t: t };
	},

	dir: function( elem, dir ){
		var matched = [],
			cur = elem[dir];
		while ( cur && cur != document ) {
			if ( cur.nodeType == 1 )
				matched.push( cur );
			cur = cur[dir];
		}
		return matched;
	},

	nth: function(cur,result,dir,elem){
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] )
			if ( cur.nodeType == 1 && ++num == result )
				break;

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType == 1 && n != elem )
				r.push( n );
		}

		return r;
	}
});
/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code orignated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function(elem, types, handler, data) {
		if ( elem.nodeType == 3 || elem.nodeType == 8 )
			return;

		// For whatever reason, IE has trouble passing the window object
		// around, causing it to be cloned in the process
		if ( jQuery.browser.msie && elem.setInterval )
			elem = window;

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid )
			handler.guid = this.guid++;

		// if data is passed, bind to handler
		if( data != undefined ) {
			// Create temporary function pointer to original handler
			var fn = handler;

			// Create unique handler function, wrapped around original handler
			handler = this.proxy( fn, function() {
				// Pass arguments and context to original handler
				return fn.apply(this, arguments);
			});

			// Store data in unique handler
			handler.data = data;
		}

		// Init the element's event structure
		var events = jQuery.data(elem, "events") || jQuery.data(elem, "events", {}),
			handle = jQuery.data(elem, "handle") || jQuery.data(elem, "handle", function(){
				// Handle the second event of a trigger and when
				// an event is called after a page has unloaded
				if ( typeof jQuery != "undefined" && !jQuery.event.triggered )
					return jQuery.event.handle.apply(arguments.callee.elem, arguments);
			});
		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native
		// event in IE.
		handle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		jQuery.each(types.split(/\s+/), function(index, type) {
			// Namespaced event handlers
			var parts = type.split(".");
			type = parts[0];
			handler.type = parts[1];

			// Get the current list of functions bound to this event
			var handlers = events[type];

			// Init the event handler queue
			if (!handlers) {
				handlers = events[type] = {};

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !jQuery.event.special[type] || jQuery.event.special[type].setup.call(elem) === false ) {
					// Bind the global event handler to the element
					if (elem.addEventListener)
						elem.addEventListener(type, handle, false);
					else if (elem.attachEvent)
						elem.attachEvent("on" + type, handle);
				}
			}

			// Add the function to the element's handler list
			handlers[handler.guid] = handler;

			// Keep track of which events have been used, for global triggering
			jQuery.event.global[type] = true;
		});

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	guid: 1,
	global: {},

	// Detach an event or set of events from an element
	remove: function(elem, types, handler) {
		// don't do events on text and comment nodes
		if ( elem.nodeType == 3 || elem.nodeType == 8 )
			return;

		var events = jQuery.data(elem, "events"), ret, index;

		if ( events ) {
			// Unbind all events for the element
			if ( types == undefined || (typeof types == "string" && types.charAt(0) == ".") )
				for ( var type in events )
					this.remove( elem, type + (types || "") );
			else {
				// types is actually an event object here
				if ( types.type ) {
					handler = types.handler;
					types = types.type;
				}

				// Handle multiple events seperated by a space
				// jQuery(...).unbind("mouseover mouseout", fn);
				jQuery.each(types.split(/\s+/), function(index, type){
					// Namespaced event handlers
					var parts = type.split(".");
					type = parts[0];

					if ( events[type] ) {
						// remove the given handler for the given type
						if ( handler )
							delete events[type][handler.guid];

						// remove all handlers for the given type
						else
							for ( handler in events[type] )
								// Handle the removal of namespaced events
								if ( !parts[1] || events[type][handler].type == parts[1] )
									delete events[type][handler];

						// remove generic event handler if no more handlers exist
						for ( ret in events[type] ) break;
						if ( !ret ) {
							if ( !jQuery.event.special[type] || jQuery.event.special[type].teardown.call(elem) === false ) {
								if (elem.removeEventListener)
									elem.removeEventListener(type, jQuery.data(elem, "handle"), false);
								else if (elem.detachEvent)
									elem.detachEvent("on" + type, jQuery.data(elem, "handle"));
							}
							ret = null;
							delete events[type];
						}
					}
				});
			}

			// Remove the expando if it's no longer used
			for ( ret in events ) break;
			if ( !ret ) {
				var handle = jQuery.data( elem, "handle" );
				if ( handle ) handle.elem = null;
				jQuery.removeData( elem, "events" );
				jQuery.removeData( elem, "handle" );
			}
		}
	},

	trigger: function(type, data, elem, donative, extra) {
		// Clone the incoming data, if any
		data = jQuery.makeArray(data);

		if ( type.indexOf("!") >= 0 ) {
			type = type.slice(0, -1);
			var exclusive = true;
		}

		// Handle a global trigger
		if ( !elem ) {
			// Only trigger if we've ever bound an event for it
			if ( this.global[type] )
				jQuery("*").add([window, document]).trigger(type, data);

		// Handle triggering a single element
		} else {
			// don't do events on text and comment nodes
			if ( elem.nodeType == 3 || elem.nodeType == 8 )
				return undefined;

			var val, ret, fn = jQuery.isFunction( elem[ type ] || null ),
				// Check to see if we need to provide a fake event, or not
				event = !data[0] || !data[0].preventDefault;

			// Pass along a fake event
			if ( event ) {
				data.unshift({
					type: type,
					target: elem,
					preventDefault: function(){},
					stopPropagation: function(){},
					timeStamp: now()
				});
				data[0][expando] = true; // no need to fix fake event
			}

			// Enforce the right trigger type
			data[0].type = type;
			if ( exclusive )
				data[0].exclusive = true;

			// Trigger the event, it is assumed that "handle" is a function
			var handle = jQuery.data(elem, "handle");
			if ( handle )
				val = handle.apply( elem, data );

			// Handle triggering native .onfoo handlers (and on links since we don't call .click() for links)
			if ( (!fn || (jQuery.nodeName(elem, 'a') && type == "click")) && elem["on"+type] && elem["on"+type].apply( elem, data ) === false )
				val = false;

			// Extra functions don't get the custom event object
			if ( event )
				data.shift();

			// Handle triggering of extra function
			if ( extra && jQuery.isFunction( extra ) ) {
				// call the extra function and tack the current return value on the end for possible inspection
				ret = extra.apply( elem, val == null ? data : data.concat( val ) );
				// if anything is returned, give it precedence and have it overwrite the previous value
				if (ret !== undefined)
					val = ret;
			}

			// Trigger the native events (except for clicks on links)
			if ( fn && donative !== false && val !== false && !(jQuery.nodeName(elem, 'a') && type == "click") ) {
				this.triggered = true;
				try {
					elem[ type ]();
				// prevent IE from throwing an error for some hidden elements
				} catch (e) {}
			}

			this.triggered = false;
		}

		return val;
	},

	handle: function(event) {
		// returned undefined or false
		var val, ret, namespace, all, handlers;

		event = arguments[0] = jQuery.event.fix( event || window.event );

		// Namespaced event handlers
		namespace = event.type.split(".");
		event.type = namespace[0];
		namespace = namespace[1];
		// Cache this now, all = true means, any handler
		all = !namespace && !event.exclusive;

		handlers = ( jQuery.data(this, "events") || {} )[event.type];

		for ( var j in handlers ) {
			var handler = handlers[j];

			// Filter the functions by class
			if ( all || handler.type == namespace ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
				event.handler = handler;
				event.data = handler.data;

				ret = handler.apply( this, arguments );

				if ( val !== false )
					val = ret;

				if ( ret === false ) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}

		return val;
	},

	fix: function(event) {
		if ( event[expando] == true )
			return event;

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = { originalEvent: originalEvent };
		var props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view wheelDelta which".split(" ");
		for ( var i=props.length; i; i-- )
			event[ props[i] ] = originalEvent[ props[i] ];

		// Mark it as fixed
		event[expando] = true;

		// add preventDefault and stopPropagation since
		// they will not work on the clone
		event.preventDefault = function() {
			// if preventDefault exists run it on the original event
			if (originalEvent.preventDefault)
				originalEvent.preventDefault();
			// otherwise set the returnValue property of the original event to false (IE)
			originalEvent.returnValue = false;
		};
		event.stopPropagation = function() {
			// if stopPropagation exists run it on the original event
			if (originalEvent.stopPropagation)
				originalEvent.stopPropagation();
			// otherwise set the cancelBubble property of the original event to true (IE)
			originalEvent.cancelBubble = true;
		};

		// Fix timeStamp
		event.timeStamp = event.timeStamp || now();

		// Fix target property, if necessary
		if ( !event.target )
			event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either

		// check if target is a textnode (safari)
		if ( event.target.nodeType == 3 )
			event.target = event.target.parentNode;

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement )
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
		}

		// Add which for key events
		if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) )
			event.which = event.charCode || event.keyCode;

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey )
			event.metaKey = event.ctrlKey;

		// Add which for click: 1 == left; 2 == middle; 3 == right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button )
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));

		return event;
	},

	proxy: function( fn, proxy ){
		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || this.guid++;
		// So proxy can be declared as an argument
		return proxy;
	},

	special: {
		ready: {
			setup: function() {
				// Make sure the ready event is setup
				bindReady();
				return;
			},

			teardown: function() { return; }
		},

		mouseenter: {
			setup: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).bind("mouseover", jQuery.event.special.mouseenter.handler);
				return true;
			},

			teardown: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).unbind("mouseover", jQuery.event.special.mouseenter.handler);
				return true;
			},

			handler: function(event) {
				// If we actually just moused on to a sub-element, ignore it
				if ( withinElement(event, this) ) return true;
				// Execute the right handlers by setting the event type to mouseenter
				event.type = "mouseenter";
				return jQuery.event.handle.apply(this, arguments);
			}
		},

		mouseleave: {
			setup: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).bind("mouseout", jQuery.event.special.mouseleave.handler);
				return true;
			},

			teardown: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).unbind("mouseout", jQuery.event.special.mouseleave.handler);
				return true;
			},

			handler: function(event) {
				// If we actually just moused on to a sub-element, ignore it
				if ( withinElement(event, this) ) return true;
				// Execute the right handlers by setting the event type to mouseleave
				event.type = "mouseleave";
				return jQuery.event.handle.apply(this, arguments);
			}
		}
	}
};

jQuery.fn.extend({
	bind: function( type, data, fn ) {
		return type == "unload" ? this.one(type, data, fn) : this.each(function(){
			jQuery.event.add( this, type, fn || data, fn && data );
		});
	},

	one: function( type, data, fn ) {
		var one = jQuery.event.proxy( fn || data, function(event) {
			jQuery(this).unbind(event, one);
			return (fn || data).apply( this, arguments );
		});
		return this.each(function(){
			jQuery.event.add( this, type, one, fn && data);
		});
	},

	unbind: function( type, fn ) {
		return this.each(function(){
			jQuery.event.remove( this, type, fn );
		});
	},

	trigger: function( type, data, fn ) {
		return this.each(function(){
			jQuery.event.trigger( type, data, this, true, fn );
		});
	},

	triggerHandler: function( type, data, fn ) {
		return this[0] && jQuery.event.trigger( type, data, this[0], false, fn );
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments, i = 1;

		// link all the functions, so any of them can unbind this click handler
		while( i < args.length )
			jQuery.event.proxy( fn, args[i++] );

		return this.click( jQuery.event.proxy( fn, function(event) {
			// Figure out which function to execute
			this.lastToggle = ( this.lastToggle || 0 ) % i;

			// Make sure that clicks stop
			event.preventDefault();

			// and execute the function
			return args[ this.lastToggle++ ].apply( this, arguments ) || false;
		}));
	},

	hover: function(fnOver, fnOut) {
		return this.bind('mouseenter', fnOver).bind('mouseleave', fnOut);
	},

	ready: function(fn) {
		// Attach the listeners
		bindReady();

		// If the DOM is already ready
		if ( jQuery.isReady )
			// Execute the function immediately
			fn.call( document, jQuery );

		// Otherwise, remember the function for later
		else
			// Add the function to the wait list
			jQuery.readyList.push( function() { return fn.call(this, jQuery); } );

		return this;
	}
});

jQuery.extend({
	isReady: false,
	readyList: [],
	// Handle when the DOM is ready
	ready: function() {
		// Make sure that the DOM is not already loaded
		if ( !jQuery.isReady ) {
			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If there are functions bound, to execute
			if ( jQuery.readyList ) {
				// Execute all of them
				jQuery.each( jQuery.readyList, function(){
					this.call( document );
				});

				// Reset the list of functions
				jQuery.readyList = null;
			}

			// Trigger any bound ready events
			jQuery(document).triggerHandler("ready");
		}
	}
});

var readyBound = false;

function bindReady(){
	if ( readyBound ) return;
	readyBound = true;

	// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
	if ( document.addEventListener && !jQuery.browser.opera)
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", jQuery.ready, false );

	// If IE is used and is not in a frame
	// Continually check to see if the document is ready
	if ( jQuery.browser.msie && window == top ) (function(){
		if (jQuery.isReady) return;
		try {
			// If IE is used, use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			document.documentElement.doScroll("left");
		} catch( error ) {
			setTimeout( arguments.callee, 0 );
			return;
		}
		// and execute any waiting functions
		jQuery.ready();
	})();

	if ( jQuery.browser.opera )
		document.addEventListener( "DOMContentLoaded", function () {
			if (jQuery.isReady) return;
			for (var i = 0; i < document.styleSheets.length; i++)
				if (document.styleSheets[i].disabled) {
					setTimeout( arguments.callee, 0 );
					return;
				}
			// and execute any waiting functions
			jQuery.ready();
		}, false);

	if ( jQuery.browser.safari ) {
		var numStyles;
		(function(){
			if (jQuery.isReady) return;
			if ( document.readyState != "loaded" && document.readyState != "complete" ) {
				setTimeout( arguments.callee, 0 );
				return;
			}
			if ( numStyles === undefined )
				numStyles = jQuery("style, link[rel=stylesheet]").length;
			if ( document.styleSheets.length != numStyles ) {
				setTimeout( arguments.callee, 0 );
				return;
			}
			// and execute any waiting functions
			jQuery.ready();
		})();
	}

	// A fallback to window.onload, that will always work
	jQuery.event.add( window, "load", jQuery.ready );
}

jQuery.each( ("blur,focus,load,resize,scroll,unload,click,dblclick," +
	"mousedown,mouseup,mousemove,mouseover,mouseout,change,select," +
	"submit,keydown,keypress,keyup,error").split(","), function(i, name){

	// Handle event binding
	jQuery.fn[name] = function(fn){
		return fn ? this.bind(name, fn) : this.trigger(name);
	};
});

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function(event, elem) {
	// Check if mouse(over|out) are still within the same parent element
	var parent = event.relatedTarget;
	// Traverse up the tree
	while ( parent && parent != elem ) try { parent = parent.parentNode; } catch(error) { parent = elem; }
	// Return true if we actually just moused on to a sub-element
	return parent == elem;
};

// Prevent memory leaks in IE
// And prevent errors on refresh with events like mouseover in other browsers
// Window isn't included so as not to unbind existing unload events
jQuery(window).bind("unload", function() {
	jQuery("*").add(document).unbind();
});
jQuery.fn.extend({
	// Keep a copy of the old load
	_load: jQuery.fn.load,

	load: function( url, params, callback ) {
		if ( typeof url != 'string' )
			return this._load( url );

		var off = url.indexOf(" ");
		if ( off >= 0 ) {
			var selector = url.slice(off, url.length);
			url = url.slice(0, off);
		}

		callback = callback || function(){};

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params )
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = null;

			// Otherwise, build a param string
			} else {
				params = jQuery.param( params );
				type = "POST";
			}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			complete: function(res, status){
				// If successful, inject the HTML into all the matched elements
				if ( status == "success" || status == "notmodified" )
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div/>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(res.responseText.replace(/<script(.|\s)*?\/script>/g, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						res.responseText );

				self.each( callback, [res.responseText, status, res] );
			}
		});
		return this;
	},

	serialize: function() {
		return jQuery.param(this.serializeArray());
	},
	serializeArray: function() {
		return this.map(function(){
			return jQuery.nodeName(this, "form") ?
				jQuery.makeArray(this.elements) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				(this.checked || /select|textarea/i.test(this.nodeName) ||
					/text|hidden|password/i.test(this.type));
		})
		.map(function(i, elem){
			var val = jQuery(this).val();
			return val == null ? null :
				val.constructor == Array ?
					jQuery.map( val, function(val, i){
						return {name: elem.name, value: val};
					}) :
					{name: elem.name, value: val};
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","), function(i,o){
	jQuery.fn[o] = function(f){
		return this.bind(o, f);
	};
});

var jsc = now();

jQuery.extend({
	get: function( url, data, callback, type ) {
		// shift arguments if data argument was ommited
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = null;
		}

		return jQuery.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	getScript: function( url, callback ) {
		return jQuery.get(url, null, callback, "script");
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get(url, data, callback, "json");
	},

	post: function( url, data, callback, type ) {
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = {};
		}

		return jQuery.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	ajaxSetup: function( settings ) {
		jQuery.extend( jQuery.ajaxSettings, settings );
	},

	ajaxSettings: {
		url: location.href,
		global: true,
		type: "GET",
		timeout: 0,
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		data: null,
		username: null,
		password: null,
		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			script: "text/javascript, application/javascript",
			json: "application/json, text/javascript",
			text: "text/plain",
			_default: "*/*"
		}
	},

	// Last-Modified header cache for next request
	lastModified: {},

	ajax: function( s ) {
		// Extend the settings, but re-extend 's' so that it can be
		// checked again later (in the test suite, specifically)
		s = jQuery.extend(true, s, jQuery.extend(true, {}, jQuery.ajaxSettings, s));

		var jsonp, jsre = /=\?(&|$)/g, status, data,
			type = s.type.toUpperCase();

		// convert data if not already a string
		if ( s.data && s.processData && typeof s.data != "string" )
			s.data = jQuery.param(s.data);

		// Handle JSONP Parameter Callbacks
		if ( s.dataType == "jsonp" ) {
			if ( type == "GET" ) {
				if ( !s.url.match(jsre) )
					s.url += (s.url.match(/\?/) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			} else if ( !s.data || !s.data.match(jsre) )
				s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
			s.dataType = "json";
		}

		// Build temporary JSONP function
		if ( s.dataType == "json" && (s.data && s.data.match(jsre) || s.url.match(jsre)) ) {
			jsonp = "jsonp" + jsc++;

			// Replace the =? sequence both in the query string and the data
			if ( s.data )
				s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
			s.url = s.url.replace(jsre, "=" + jsonp + "$1");

			// We need to make sure
			// that a JSONP style response is executed properly
			s.dataType = "script";

			// Handle JSONP-style loading
			window[ jsonp ] = function(tmp){
				data = tmp;
				success();
				complete();
				// Garbage collect
				window[ jsonp ] = undefined;
				try{ delete window[ jsonp ]; } catch(e){}
				if ( head )
					head.removeChild( script );
			};
		}

		if ( s.dataType == "script" && s.cache == null )
			s.cache = false;

		if ( s.cache === false && type == "GET" ) {
			var ts = now();
			// try replacing _= if it is there
			var ret = s.url.replace(/(\?|&)_=.*?(&|$)/, "$1_=" + ts + "$2");
			// if nothing was replaced, add timestamp to the end
			s.url = ret + ((ret == s.url) ? (s.url.match(/\?/) ? "&" : "?") + "_=" + ts : "");
		}

		// If data is available, append data to url for get requests
		if ( s.data && type == "GET" ) {
			s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;

			// IE likes to send both get and post data, prevent this
			s.data = null;
		}

		// Watch for a new set of requests
		if ( s.global && ! jQuery.active++ )
			jQuery.event.trigger( "ajaxStart" );

		// Matches an absolute URL, and saves the domain
		var remote = /^(?:\w+:)?\/\/([^\/?#]+)/;

		// If we're requesting a remote document
		// and trying to load JSON or Script with a GET
		if ( s.dataType == "script" && type == "GET"
				&& remote.test(s.url) && remote.exec(s.url)[1] != location.host ){
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = s.url;
			if (s.scriptCharset)
				script.charset = s.scriptCharset;

			// Handle Script loading
			if ( !jsonp ) {
				var done = false;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function(){
					if ( !done && (!this.readyState ||
							this.readyState == "loaded" || this.readyState == "complete") ) {
						done = true;
						success();
						complete();
						head.removeChild( script );
					}
				};
			}

			head.appendChild(script);

			// We handle everything using the script element injection
			return undefined;
		}

		var requestDone = false;

		// Create the request object; Microsoft failed to properly
		// implement the XMLHttpRequest in IE7, so we use the ActiveXObject when it is available
		var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();

		// Open the socket
		// Passing null username, generates a login popup on Opera (#2865)
		if( s.username )
			xhr.open(type, s.url, s.async, s.username, s.password);
		else
			xhr.open(type, s.url, s.async);

		// Need an extra try/catch for cross domain requests in Firefox 3
		try {
			// Set the correct header, if data is being sent
			if ( s.data )
				xhr.setRequestHeader("Content-Type", s.contentType);

			// Set the If-Modified-Since header, if ifModified mode.
			if ( s.ifModified )
				xhr.setRequestHeader("If-Modified-Since",
					jQuery.lastModified[s.url] || "Thu, 01 Jan 1970 00:00:00 GMT" );

			// Set header so the called script knows that it's an XMLHttpRequest
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

			// Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				s.accepts[ s.dataType ] + ", */*" :
				s.accepts._default );
		} catch(e){}

		// Allow custom headers/mimetypes
		if ( s.beforeSend && s.beforeSend(xhr, s) === false ) {
			// cleanup active request counter
			s.global && jQuery.active--;
			// close opended socket
			xhr.abort();
			return false;
		}

		if ( s.global )
			jQuery.event.trigger("ajaxSend", [xhr, s]);

		// Wait for a response to come back
		var onreadystatechange = function(isTimeout){
			// The transfer is complete and the data is available, or the request timed out
			if ( !requestDone && xhr && (xhr.readyState == 4 || isTimeout == "timeout") ) {
				requestDone = true;

				// clear poll interval
				if (ival) {
					clearInterval(ival);
					ival = null;
				}

				status = isTimeout == "timeout" && "timeout" ||
					!jQuery.httpSuccess( xhr ) && "error" ||
					s.ifModified && jQuery.httpNotModified( xhr, s.url ) && "notmodified" ||
					"success";

				if ( status == "success" ) {
					// Watch for, and catch, XML document parse errors
					try {
						// process the data (runs the xml through httpData regardless of callback)
						data = jQuery.httpData( xhr, s.dataType, s.dataFilter );
					} catch(e) {
						status = "parsererror";
					}
				}

				// Make sure that the request was successful or notmodified
				if ( status == "success" ) {
					// Cache Last-Modified header, if ifModified mode.
					var modRes;
					try {
						modRes = xhr.getResponseHeader("Last-Modified");
					} catch(e) {} // swallow exception thrown by FF if header is not available

					if ( s.ifModified && modRes )
						jQuery.lastModified[s.url] = modRes;

					// JSONP handles its own success callback
					if ( !jsonp )
						success();
				} else
					jQuery.handleError(s, xhr, status);

				// Fire the complete handlers
				complete();

				// Stop memory leaks
				if ( s.async )
					xhr = null;
			}
		};

		if ( s.async ) {
			// don't attach the handler to the request, just poll it instead
			var ival = setInterval(onreadystatechange, 13);

			// Timeout checker
			if ( s.timeout > 0 )
				setTimeout(function(){
					// Check to see if the request is still happening
					if ( xhr ) {
						// Cancel the request
						xhr.abort();

						if( !requestDone )
							onreadystatechange( "timeout" );
					}
				}, s.timeout);
		}

		// Send the data
		try {
			xhr.send(s.data);
		} catch(e) {
			jQuery.handleError(s, xhr, null, e);
		}

		// firefox 1.5 doesn't fire statechange for sync requests
		if ( !s.async )
			onreadystatechange();

		function success(){
			// If a local callback was specified, fire it and pass it the data
			if ( s.success )
				s.success( data, status );

			// Fire the global callback
			if ( s.global )
				jQuery.event.trigger( "ajaxSuccess", [xhr, s] );
		}

		function complete(){
			// Process result
			if ( s.complete )
				s.complete(xhr, status);

			// The request was completed
			if ( s.global )
				jQuery.event.trigger( "ajaxComplete", [xhr, s] );

			// Handle the global AJAX counter
			if ( s.global && ! --jQuery.active )
				jQuery.event.trigger( "ajaxStop" );
		}

		// return XMLHttpRequest to allow aborting the request etc.
		return xhr;
	},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) s.error( xhr, status, e );

		// Fire the global callback
		if ( s.global )
			jQuery.event.trigger( "ajaxError", [xhr, s, e] );
	},

	// Counter for holding the number of active queries
	active: 0,

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol == "file:" ||
				( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223 ||
				jQuery.browser.safari && xhr.status == undefined;
		} catch(e){}
		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		try {
			var xhrRes = xhr.getResponseHeader("Last-Modified");

			// Firefox always returns 200. check Last-Modified date
			return xhr.status == 304 || xhrRes == jQuery.lastModified[url] ||
				jQuery.browser.safari && xhr.status == undefined;
		} catch(e){}
		return false;
	},

	httpData: function( xhr, type, filter ) {
		var ct = xhr.getResponseHeader("content-type"),
			xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.tagName == "parsererror" )
			throw "parsererror";
			
		// Allow a pre-filtering function to sanitize the response
		if( filter )
			data = filter( data, type );

		// If the type is "script", eval it in global context
		if ( type == "script" )
			jQuery.globalEval( data );

		// Get the JavaScript object, if JSON is used.
		if ( type == "json" )
			data = eval("(" + data + ")");

		return data;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a ) {
		var s = [];

		// If an array was passed in, assume that it is an array
		// of form elements
		if ( a.constructor == Array || a.jquery )
			// Serialize the form elements
			jQuery.each( a, function(){
				s.push( encodeURIComponent(this.name) + "=" + encodeURIComponent( this.value ) );
			});

		// Otherwise, assume that it's an object of key/value pairs
		else
			// Serialize the key/values
			for ( var j in a )
				// If the value is an array then the key names need to be repeated
				if ( a[j] && a[j].constructor == Array )
					jQuery.each( a[j], function(){
						s.push( encodeURIComponent(j) + "=" + encodeURIComponent( this ) );
					});
				else
					s.push( encodeURIComponent(j) + "=" + encodeURIComponent( jQuery.isFunction(a[j]) ? a[j]() : a[j] ) );

		// Return the resulting serialization
		return s.join("&").replace(/%20/g, "+");
	}

});
jQuery.fn.extend({
	show: function(speed,callback){
		return speed ?
			this.animate({
				height: "show", width: "show", opacity: "show"
			}, speed, callback) :

			this.filter(":hidden").each(function(){
				this.style.display = this.oldblock || "";
				if ( jQuery.css(this,"display") == "none" ) {
					var elem = jQuery("<" + this.tagName + " />").appendTo("body");
					this.style.display = elem.css("display");
					// handle an edge condition where css is - div { display:none; } or similar
					if (this.style.display == "none")
						this.style.display = "block";
					elem.remove();
				}
			}).end();
	},

	hide: function(speed,callback){
		return speed ?
			this.animate({
				height: "hide", width: "hide", opacity: "hide"
			}, speed, callback) :

			this.filter(":visible").each(function(){
				this.oldblock = this.oldblock || jQuery.css(this,"display");
				this.style.display = "none";
			}).end();
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2 ){
		return jQuery.isFunction(fn) && jQuery.isFunction(fn2) ?
			this._toggle.apply( this, arguments ) :
			fn ?
				this.animate({
					height: "toggle", width: "toggle", opacity: "toggle"
				}, fn, fn2) :
				this.each(function(){
					jQuery(this)[ jQuery(this).is(":hidden") ? "show" : "hide" ]();
				});
	},

	slideDown: function(speed,callback){
		return this.animate({height: "show"}, speed, callback);
	},

	slideUp: function(speed,callback){
		return this.animate({height: "hide"}, speed, callback);
	},

	slideToggle: function(speed, callback){
		return this.animate({height: "toggle"}, speed, callback);
	},

	fadeIn: function(speed, callback){
		return this.animate({opacity: "show"}, speed, callback);
	},

	fadeOut: function(speed, callback){
		return this.animate({opacity: "hide"}, speed, callback);
	},

	fadeTo: function(speed,to,callback){
		return this.animate({opacity: to}, speed, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		return this[ optall.queue === false ? "each" : "queue" ](function(){
			if ( this.nodeType != 1)
				return false;

			var opt = jQuery.extend({}, optall), p,
				hidden = jQuery(this).is(":hidden"), self = this;

			for ( p in prop ) {
				if ( prop[p] == "hide" && hidden || prop[p] == "show" && !hidden )
					return opt.complete.call(this);

				if ( p == "height" || p == "width" ) {
					// Store display property
					opt.display = jQuery.css(this, "display");

					// Make sure that nothing sneaks out
					opt.overflow = this.style.overflow;
				}
			}

			if ( opt.overflow != null )
				this.style.overflow = "hidden";

			opt.curAnim = jQuery.extend({}, prop);

			jQuery.each( prop, function(name, val){
				var e = new jQuery.fx( self, opt, name );

				if ( /toggle|show|hide/.test(val) )
					e[ val == "toggle" ? hidden ? "show" : "hide" : val ]( prop );
				else {
					var parts = val.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
						start = e.cur(true) || 0;

					if ( parts ) {
						var end = parseFloat(parts[2]),
							unit = parts[3] || "px";

						// We need to compute starting value
						if ( unit != "px" ) {
							self.style[ name ] = (end || 1) + unit;
							start = ((end || 1) / e.cur(true)) * start;
							self.style[ name ] = start + unit;
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] )
							end = ((parts[1] == "-=" ? -1 : 1) * end) + start;

						e.custom( start, end, unit );
					} else
						e.custom( start, val, "" );
				}
			});

			// For JS strict compliance
			return true;
		});
	},

	queue: function(type, fn){
		if ( jQuery.isFunction(type) || ( type && type.constructor == Array )) {
			fn = type;
			type = "fx";
		}

		if ( !type || (typeof type == "string" && !fn) )
			return queue( this[0], type );

		return this.each(function(){
			if ( fn.constructor == Array )
				queue(this, type, fn);
			else {
				queue(this, type).push( fn );

				if ( queue(this, type).length == 1 )
					fn.call(this);
			}
		});
	},

	stop: function(clearQueue, gotoEnd){
		var timers = jQuery.timers;

		if (clearQueue)
			this.queue([]);

		this.each(function(){
			// go in reverse order so anything added to the queue during the loop is ignored
			for ( var i = timers.length - 1; i >= 0; i-- )
				if ( timers[i].elem == this ) {
					if (gotoEnd)
						// force the next step to be the last
						timers[i](true);
					timers.splice(i, 1);
				}
		});

		// start the next in the queue if the last step wasn't forced
		if (!gotoEnd)
			this.dequeue();

		return this;
	}

});

var queue = function( elem, type, array ) {
	if ( elem ){

		type = type || "fx";

		var q = jQuery.data( elem, type + "queue" );

		if ( !q || array )
			q = jQuery.data( elem, type + "queue", jQuery.makeArray(array) );

	}
	return q;
};

jQuery.fn.dequeue = function(type){
	type = type || "fx";

	return this.each(function(){
		var q = queue(this, type);

		q.shift();

		if ( q.length )
			q[0].call( this );
	});
};

jQuery.extend({

	speed: function(speed, easing, fn) {
		var opt = speed && speed.constructor == Object ? speed : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && easing.constructor != Function && easing
		};

		opt.duration = (opt.duration && opt.duration.constructor == Number ?
			opt.duration :
			jQuery.fx.speeds[opt.duration]) || jQuery.fx.speeds.def;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function(){
			if ( opt.queue !== false )
				jQuery(this).dequeue();
			if ( jQuery.isFunction( opt.old ) )
				opt.old.call( this );
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],
	timerId: null,

	fx: function( elem, options, prop ){
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		if ( !options.orig )
			options.orig = {};
	}

});

jQuery.fx.prototype = {

	// Simple function for setting a style value
	update: function(){
		if ( this.options.step )
			this.options.step.call( this.elem, this.now, this );

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );

		// Set display property to block for height/width animations
		if ( this.prop == "height" || this.prop == "width" )
			this.elem.style.display = "block";
	},

	// Get the current size
	cur: function(force){
		if ( this.elem[this.prop] != null && this.elem.style[this.prop] == null )
			return this.elem[ this.prop ];

		var r = parseFloat(jQuery.css(this.elem, this.prop, force));
		return r && r > -10000 ? r : parseFloat(jQuery.curCSS(this.elem, this.prop)) || 0;
	},

	// Start an animation from one number to another
	custom: function(from, to, unit){
		this.startTime = now();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || "px";
		this.now = this.start;
		this.pos = this.state = 0;
		this.update();

		var self = this;
		function t(gotoEnd){
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		jQuery.timers.push(t);

		if ( jQuery.timerId == null ) {
			jQuery.timerId = setInterval(function(){
				var timers = jQuery.timers;

				for ( var i = 0; i < timers.length; i++ )
					if ( !timers[i]() )
						timers.splice(i--, 1);

				if ( !timers.length ) {
					clearInterval( jQuery.timerId );
					jQuery.timerId = null;
				}
			}, 13);
		}
	},

	// Simple 'show' function
	show: function(){
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.attr( this.elem.style, this.prop );
		this.options.show = true;

		// Begin the animation
		this.custom(0, this.cur());

		// Make sure that we start at a small width/height to avoid any
		// flash of content
		if ( this.prop == "width" || this.prop == "height" )
			this.elem.style[this.prop] = "1px";

		// Start by showing the element
		jQuery(this.elem).show();
	},

	// Simple 'hide' function
	hide: function(){
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.attr( this.elem.style, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function(gotoEnd){
		var t = now();

		if ( gotoEnd || t > this.options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			this.options.curAnim[ this.prop ] = true;

			var done = true;
			for ( var i in this.options.curAnim )
				if ( this.options.curAnim[i] !== true )
					done = false;

			if ( done ) {
				if ( this.options.display != null ) {
					// Reset the overflow
					this.elem.style.overflow = this.options.overflow;

					// Reset the display
					this.elem.style.display = this.options.display;
					if ( jQuery.css(this.elem, "display") == "none" )
						this.elem.style.display = "block";
				}

				// Hide the element if the "hide" operation was done
				if ( this.options.hide )
					this.elem.style.display = "none";

				// Reset the properties, if the item has been hidden or shown
				if ( this.options.hide || this.options.show )
					for ( var p in this.options.curAnim )
						jQuery.attr(this.elem.style, p, this.options.orig[p]);
			}

			if ( done )
				// Execute the complete function
				this.options.complete.call( this.elem );

			return false;
		} else {
			var n = t - this.startTime;
			this.state = n / this.options.duration;

			// Perform the easing function, defaults to swing
			this.pos = jQuery.easing[this.options.easing || (jQuery.easing.swing ? "swing" : "linear")](this.state, n, 0, 1, this.options.duration);
			this.now = this.start + ((this.end - this.start) * this.pos);

			// Perform the next step of the animation
			this.update();
		}

		return true;
	}

};

jQuery.extend( jQuery.fx, {
	speeds:{
		slow: 600,
 		fast: 200,
 		// Default speed
 		def: 400
	},
	step: {
		scrollLeft: function(fx){
			fx.elem.scrollLeft = fx.now;
		},

		scrollTop: function(fx){
			fx.elem.scrollTop = fx.now;
		},

		opacity: function(fx){
			jQuery.attr(fx.elem.style, "opacity", fx.now);
		},

		_default: function(fx){
			fx.elem.style[ fx.prop ] = fx.now + fx.unit;
		}
	}
});
// The Offset Method
// Originally By Brandon Aaron, part of the Dimension Plugin
// http://jquery.com/plugins/project/dimensions
jQuery.fn.offset = function() {
	var left = 0, top = 0, elem = this[0], results;

	if ( elem ) with ( jQuery.browser ) {
		var parent       = elem.parentNode,
		    offsetChild  = elem,
		    offsetParent = elem.offsetParent,
		    doc          = elem.ownerDocument,
		    safari2      = safari && parseInt(version) < 522 && !/adobeair/i.test(userAgent),
		    css          = jQuery.curCSS,
		    fixed        = css(elem, "position") == "fixed";

		// Use getBoundingClientRect if available
		if ( elem.getBoundingClientRect ) {
			var box = elem.getBoundingClientRect();

			// Add the document scroll offsets
			add(box.left + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
				box.top  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));

			// IE adds the HTML element's border, by default it is medium which is 2px
			// IE 6 and 7 quirks mode the border width is overwritable by the following css html { border: 0; }
			// IE 7 standards mode, the border is always 2px
			// This border/offset is typically represented by the clientLeft and clientTop properties
			// However, in IE6 and 7 quirks mode the clientLeft and clientTop properties are not updated when overwriting it via CSS
			// Therefore this method will be off by 2px in IE while in quirksmode
			add( -doc.documentElement.clientLeft, -doc.documentElement.clientTop );

		// Otherwise loop through the offsetParents and parentNodes
		} else {

			// Initial element offsets
			add( elem.offsetLeft, elem.offsetTop );

			// Get parent offsets
			while ( offsetParent ) {
				// Add offsetParent offsets
				add( offsetParent.offsetLeft, offsetParent.offsetTop );

				// Mozilla and Safari > 2 does not include the border on offset parents
				// However Mozilla adds the border for table or table cells
				if ( mozilla && !/^t(able|d|h)$/i.test(offsetParent.tagName) || safari && !safari2 )
					border( offsetParent );

				// Add the document scroll offsets if position is fixed on any offsetParent
				if ( !fixed && css(offsetParent, "position") == "fixed" )
					fixed = true;

				// Set offsetChild to previous offsetParent unless it is the body element
				offsetChild  = /^body$/i.test(offsetParent.tagName) ? offsetChild : offsetParent;
				// Get next offsetParent
				offsetParent = offsetParent.offsetParent;
			}

			// Get parent scroll offsets
			while ( parent && parent.tagName && !/^body|html$/i.test(parent.tagName) ) {
				// Remove parent scroll UNLESS that parent is inline or a table to work around Opera inline/table scrollLeft/Top bug
				if ( !/^inline|table.*$/i.test(css(parent, "display")) )
					// Subtract parent scroll offsets
					add( -parent.scrollLeft, -parent.scrollTop );

				// Mozilla does not add the border for a parent that has overflow != visible
				if ( mozilla && css(parent, "overflow") != "visible" )
					border( parent );

				// Get next parent
				parent = parent.parentNode;
			}

			// Safari <= 2 doubles body offsets with a fixed position element/offsetParent or absolutely positioned offsetChild
			// Mozilla doubles body offsets with a non-absolutely positioned offsetChild
			if ( (safari2 && (fixed || css(offsetChild, "position") == "absolute")) ||
				(mozilla && css(offsetChild, "position") != "absolute") )
					add( -doc.body.offsetLeft, -doc.body.offsetTop );

			// Add the document scroll offsets if position is fixed
			if ( fixed )
				add(Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
					Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));
		}

		// Return an object with top and left properties
		results = { top: top, left: left };
	}

	function border(elem) {
		add( jQuery.curCSS(elem, "borderLeftWidth", true), jQuery.curCSS(elem, "borderTopWidth", true) );
	}

	function add(l, t) {
		left += parseInt(l, 10) || 0;
		top += parseInt(t, 10) || 0;
	}

	return results;
};


jQuery.fn.extend({
	position: function() {
		var left = 0, top = 0, results;

		if ( this[0] ) {
			// Get *real* offsetParent
			var offsetParent = this.offsetParent(),

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft 
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= num( this, 'marginTop' );
			offset.left -= num( this, 'marginLeft' );

			// Add offsetParent borders
			parentOffset.top  += num( offsetParent, 'borderTopWidth' );
			parentOffset.left += num( offsetParent, 'borderLeftWidth' );

			// Subtract the two offsets
			results = {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		}

		return results;
	},

	offsetParent: function() {
		var offsetParent = this[0].offsetParent;
		while ( offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && jQuery.css(offsetParent, 'position') == 'static') )
			offsetParent = offsetParent.offsetParent;
		return jQuery(offsetParent);
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ['Left', 'Top'], function(i, name) {
	var method = 'scroll' + name;
	
	jQuery.fn[ method ] = function(val) {
		if (!this[0]) return;

		return val != undefined ?

			// Set the scroll offset
			this.each(function() {
				this == window || this == document ?
					window.scrollTo(
						!i ? val : jQuery(window).scrollLeft(),
						 i ? val : jQuery(window).scrollTop()
					) :
					this[ method ] = val;
			}) :

			// Return the scroll offset
			this[0] == window || this[0] == document ?
				self[ i ? 'pageYOffset' : 'pageXOffset' ] ||
					jQuery.boxModel && document.documentElement[ method ] ||
					document.body[ method ] :
				this[0][ method ];
	};
});
// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function(i, name){

	var tl = i ? "Left"  : "Top",  // top or left
		br = i ? "Right" : "Bottom"; // bottom or right

	// innerHeight and innerWidth
	jQuery.fn["inner" + name] = function(){
		return this[ name.toLowerCase() ]() +
			num(this, "padding" + tl) +
			num(this, "padding" + br);
	};

	// outerHeight and outerWidth
	jQuery.fn["outer" + name] = function(margin) {
		return this["inner" + name]() +
			num(this, "border" + tl + "Width") +
			num(this, "border" + br + "Width") +
			(margin ?
				num(this, "margin" + tl) + num(this, "margin" + br) : 0);
	};

});})();
/*
Copyright 2008 University of Cambridge
Copyright 2008 University of Toronto

Licensed under the GNU General Public License or the MIT license.
You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the GPL and MIT License at
https://source.fluidproject.org/svn/sandbox/tabindex/trunk/LICENSE.txt
*/

/*global jQuery*/

// Tabindex normalization
(function ($) {
    // -- Private functions --
    
    var normalizeTabindexName = function () {
	    return $.browser.msie ? "tabIndex" : "tabindex";
	};

	var canHaveDefaultTabindex = function (elements) {
       if (elements.length <= 0) {
           return false;
       }

	   return jQuery (elements[0]).is ("a, input, button, select, area, textarea, object");
	};
    
	var getValue = function (elements) {
        if (elements.length <= 0) {
            return undefined;
        }

		if (!elements.hasTabindexAttr ()) {
		    return canHaveDefaultTabindex (elements) ? Number (0) : undefined;
		}

        // Get the attribute and return it as a number value.
		var value = elements.attr (normalizeTabindexName ());
		return Number (value);
	};

	var setValue = function (elements, toIndex) {
		return elements.each (function (i, item) {
			$ (item).attr (normalizeTabindexName (), toIndex);
		});
	};
    
    // -- Public API --
    
    /**
     * Gets the value of the tabindex attribute for the first item, or sets the tabindex value of all elements
     * if toIndex is specified.
     * 
     * @param {String|Number} toIndex
     */
    $.fn.tabindex = function (toIndex) {
		if (toIndex !== null && toIndex !== undefined) {
			return setValue (this, toIndex);
		} else {
			return getValue (this);
		}
	};

    /**
     * Removes the tabindex attribute altogether from each element.
     */
	$.fn.removeTabindex = function () {
		return this.each(function (i, item) {
			$ (item).removeAttr (normalizeTabindexName ());
		});
	};

    /**
     * Determines if an element actually has a tabindex attribute present.
     */
	$.fn.hasTabindexAttr = function () {
	    if (this.length <= 0) {
	        return false;
	    }

	    var attributeNode = this[0].getAttributeNode (normalizeTabindexName ());
        return attributeNode ? attributeNode.specified : false;
	};

    /**
     * Determines if an element either has a tabindex attribute or is naturally tab-focussable.
     */
	$.fn.hasTabindex = function () {
        return this.hasTabindexAttr () || canHaveDefaultTabindex (this);
	};
})(jQuery);


// Keyboard navigation
(function ($) {    
    // Public, static constants needed by the rest of the library.
    $.a11y = $.a11y || {};

    $.a11y.keys = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32,
        ENTER: 13,
        DELETE: 46,
        TAB: 9,
        CTRL: 17,
        SHIFT: 16,
        ALT: 18
    };

    $.a11y.orientation = {
        HORIZONTAL: 0,
        VERTICAL: 1,
        BOTH: 2
    };

    // Private constants.
    var NAMESPACE_KEY = "keyboard-a11y";
    var CONTEXT_KEY = "selectionContext";
    var HANDLERS_KEY = "userHandlers";
    var ACTIVATE_KEY = "defaultActivate";
    
    var NO_SELECTION = -32768;

    var UP_DOWN_KEYMAP = {
        next: $.a11y.keys.DOWN,
        previous: $.a11y.keys.UP
    };

    var LEFT_RIGHT_KEYMAP = {
        next: $.a11y.keys.RIGHT,
        previous: $.a11y.keys.LEFT
    };

    // Private functions.
    var unwrap = function (element) {
        return element.jquery ? element[0] : element; // Unwrap the element if it's a jQuery.
    };

    var cleanUpWhenLeavingContainer = function (selectionContext) {
        if (selectionContext.onLeaveContainer) {
            selectionContext.onLeaveContainer (
              selectionContext.selectables[selectionContext.activeItemIndex]);
        } else if (selectionContext.onUnselect) {
            selectionContext.onUnselect (
            selectionContext.selectables[selectionContext.activeItemIndex]);
        }

        if (!selectionContext.options.rememberSelectionState) {
            selectionContext.activeItemIndex = NO_SELECTION;
        }
    };

    var checkForModifier = function (binding, evt) {
        // If no modifier was specified, just return true.
        if (!binding.modifier) {
            return true;
        }

        var modifierKey = binding.modifier;
        var isCtrlKeyPresent = (modifierKey && evt.ctrlKey);
        var isAltKeyPresent = (modifierKey && evt.altKey);
        var isShiftKeyPresent = (modifierKey && evt.shiftKey);

        return (isCtrlKeyPresent || isAltKeyPresent || isShiftKeyPresent);
    };

    var activationHandler = function (binding) {
        return function (evt) {
// The following 'if' clause works in the real world, but there's a bug in the jQuery simulation
// that causes keyboard simulation to fail in Safari, causing our tests to fail:
//     http://ui.jquery.com/bugs/ticket/3229
// The replacement 'if' clause works around this bug.
// When this issue is resolved, we should revert to the original clause.
//            if (evt.which === binding.key && binding.activateHandler && checkForModifier (binding, evt)) {
            var code = (evt.which? evt.which : evt.keyCode);
            if (code === binding.key && binding.activateHandler && checkForModifier (binding, evt)) {
                binding.activateHandler (evt.target, evt);
                evt.preventDefault ();
            }
        };
    };

    /**
     * Does the work of selecting an element and delegating to the client handler.
     */
    var drawSelection = function (elementToSelect, handler) {
        if (handler) {
            handler(elementToSelect);
        }
    };

    /**
     * Does does the work of unselecting an element and delegating to the client handler.
     */
    var eraseSelection = function (selectedElement, handler) {
        if (handler && selectedElement) {
            handler(selectedElement);
        }
    };

    var unselectElement = function (selectedElement, selectionContext) {
        eraseSelection (selectedElement, selectionContext.options.onUnselect);
    };

    var selectElement = function (elementToSelect, selectionContext) {
        // It's possible that we're being called programmatically, in which case we should clear any previous selection.
        unselectElement(selectionContext.selectedElement(), selectionContext);

        elementToSelect = unwrap(elementToSelect);
        var newIndex = selectionContext.selectables.index(elementToSelect);

        // Next check if the element is a known selectable. If not, do nothing.
        if (newIndex === -1) {
           return;
        }

        // Select the new element.
        selectionContext.activeItemIndex = newIndex;
        drawSelection (elementToSelect, selectionContext.options.onSelect);
    };

    var selectableFocusHandler = function (selectionContext) {
        return function (evt) {
            selectElement (evt.target, selectionContext);

            // Force focus not to bubble on some browsers.
            return evt.stopPropagation ();
        };
    };

    var selectableBlurHandler = function (selectionContext) {
        return function (evt) {
            unselectElement (evt.target, selectionContext);

            // Force blur not to bubble on some browsers.
            return evt.stopPropagation ();
        };
    };

    var reifyIndex = function(sc_that) {
      var elements = sc_that.selectables;
      if (sc_that.activeItemIndex >= elements.length) {
        sc_that.activeItemIndex = 0;
      }
      if (sc_that.activeItemIndex < 0 && sc_that.activeItemIndex !== NO_SELECTION) {
        sc_that.activeItemIndex = elements.length - 1;
      }
      if (sc_that.activeItemIndex >= 0) {
        $(elements[sc_that.activeItemIndex]).focus();
      }
    };

    var prepareShift = function(selectionContext) {
        unselectElement(selectionContext.selectedElement(), selectionContext);
        if (selectionContext.activeItemIndex === NO_SELECTION) {
          selectionContext.activeItemIndex = -1;
        }
    };

    var focusNextElement = function(selectionContext) {
        prepareShift(selectionContext);
        ++selectionContext.activeItemIndex;
        reifyIndex(selectionContext);
    };

    var focusPreviousElement = function(selectionContext) {
        prepareShift(selectionContext);
        --selectionContext.activeItemIndex;
        reifyIndex(selectionContext);
    };

    var arrowKeyHandler = function (selectionContext, keyMap, userHandlers) {
        return function (evt) {
            if (evt.which === keyMap.next) {
                focusNextElement (selectionContext);
                evt.preventDefault ();
            } else if (evt.which === keyMap.previous) {
                focusPreviousElement (selectionContext);
                evt.preventDefault ();
            }
        };
    };

    var getKeyMapForDirection = function (direction) {
        // Determine the appropriate mapping for next and previous based on the specified direction.
        var keyMap;
        if (direction === $.a11y.orientation.HORIZONTAL) {
            keyMap = LEFT_RIGHT_KEYMAP;
        } else {
            // Assume vertical in any other case.
            keyMap = UP_DOWN_KEYMAP;
        }

        return keyMap;
    };

    var containerFocusHandler = function (selectionContext) {
        return function (evt) {
            var shouldOrig = selectionContext.options.autoSelectFirstItem;
            var shouldSelect = typeof(shouldOrig) === "function" ? 
               shouldOrig () : shouldOrig;

            // Override the autoselection if we're on the way out of the container.
            if (selectionContext.focusIsLeavingContainer) {
                shouldSelect = false;
            }

            // This target check works around the fact that sometimes focus bubbles, even though it shouldn't.
            if (shouldSelect && evt.target === selectionContext.container.get(0)) {
                if (selectionContext.activeItemIndex === NO_SELECTION) {
                    selectionContext.activeItemIndex = 0;
                }
                $(selectionContext.selectables[selectionContext.activeItemIndex]).focus();
            }


           // Force focus not to bubble on some browsers.
           return evt.stopPropagation ();
        };
    };

    var containerBlurHandler = function (selectionContext) {
        return function (evt) {
            selectionContext.focusIsLeavingContainer = false;

            // Force blur not to bubble on some browsers.
            return evt.stopPropagation ();
        };
    };

    var makeElementsTabFocussable = function (elements) {
        // If each element doesn't have a tabindex, or has one set to a negative value, set it to 0.
        elements.each (function (idx, item) {
            item = $ (item);
            if (!item.hasTabindex () || (item.tabindex () < 0)) {
                item.tabindex (0);
            }
        });
    };

    var makeElementsActivatable = function (elements, onActivateHandler, defaultKeys, options) {
        // Create bindings for each default key.
        var bindings = [];
        $ (defaultKeys).each (function (index, key) {
            bindings.push ({
                modifier: null,
                key: key,
                activateHandler: onActivateHandler
            });
        });

        // Merge with any additional key bindings.
        if (options && options.additionalBindings) {
            bindings = bindings.concat (options.additionalBindings);
        }

        // Add listeners for each key binding.
        for (var i = 0; i < bindings.length; i = i + 1) {
            var binding = bindings[i];
            elements.keydown (activationHandler (binding));
        }
    };

    var tabKeyHandler = function (selectionContext) {
        return function (evt) {
            if (evt.which !== $.a11y.keys.TAB) {
                return;
            }

            cleanUpWhenLeavingContainer (selectionContext);

            // Catch Shift-Tab and note that focus is on its way out of the container.
            if (evt.shiftKey) {
                selectionContext.focusIsLeavingContainer = true;
            }
        };
    };

    var makeElementsSelectable = function (container, defaults, userOptions) {

        var options = $.extend (true, {}, defaults, userOptions);

        var keyMap = getKeyMapForDirection (options.direction);

        var selectableElements = options.selectableElements? options.selectableElements :
          container.find(options.selectableSelector);
          
        // Context stores the currently active item (undefined to start) and list of selectables.
        var that = {
            container: container,
            activeItemIndex: NO_SELECTION,
            selectables: selectableElements,
            focusIsLeavingContainer: false,
            options: options
        };

        that.selectablesUpdated = function() {
          // Remove selectables from the tab order and add focus/blur handlers
            that.selectables.tabindex(-1);
            that.selectables.unbind("focus." + NAMESPACE_KEY);
            that.selectables.unbind("blur." + NAMESPACE_KEY);
            that.selectables.bind("focus."+ NAMESPACE_KEY, selectableFocusHandler(that));
            that.selectables.bind("blur." + NAMESPACE_KEY, selectableBlurHandler(that));
            reifyIndex(that);
        };

        that.refresh = function() {
          if (!that.options.selectableSelector) {
              throw ("Cannot refresh selectable context which was not initialised by a selector");
          }
          that.selectables = container.find(options.selectableSelector);
          that.selectablesUpdated();
        };
        
        that.selectedElement = function() {
            return that.activeItemIndex < 0? null : that.selectables[that.activeItemIndex];
        };
        
        // Add various handlers to the container.
        container.keydown (arrowKeyHandler (that, keyMap));
        container.keydown (tabKeyHandler (that));
        container.focus (containerFocusHandler (that));
        container.blur (containerBlurHandler (that));
        
        that.selectablesUpdated();

        return that;
    };

    var createDefaultActivationHandler = function (activatables, userActivateHandler) {
        return function (elementToActivate) {
            if (!userActivateHandler) {
                return;
            }

            elementToActivate = unwrap (elementToActivate);
            if (activatables.index (elementToActivate) === -1) {
                return;
            }

            userActivateHandler (elementToActivate);
        };
    };

    /**
     * Gets stored state from the jQuery instance's data map.
     */
    var getData = function (aJQuery, key) {
        var data = aJQuery.data (NAMESPACE_KEY);
        return data ? data[key] : undefined;
    };

    /**
     * Stores state in the jQuery instance's data map.
     */
    var setData = function (aJQuery, key, value) {
        var data = aJQuery.data (NAMESPACE_KEY) || {};
        data[key] = value;
        aJQuery.data (NAMESPACE_KEY, data);
    };

    // Public API.
    /**
     * Makes all matched elements available in the tab order by setting their tabindices to "0".
     */
    $.fn.tabbable = function () {
        makeElementsTabFocussable (this);
        return this;
    };

    /**
     * Makes all matched elements selectable with the arrow keys.
     * Supply your own handlers object with onSelect: and onUnselect: properties for custom behaviour.
     * Options provide configurability, including direction: and autoSelectFirstItem:
     * Currently supported directions are jQuery.a11y.directions.HORIZONTAL and VERTICAL.
     */
    $.fn.selectable = function (options) {
        var that = makeElementsSelectable (this, this.selectable.defaults, options);
        setData (this, CONTEXT_KEY, that);
        return this;
    };
    
    $.fn.getSelectableContext = function() {
        return getData(this, CONTEXT_KEY);
    };

    /**
     * Makes all matched elements activatable with the Space and Enter keys.
     * Provide your own handler function for custom behaviour.
     * Options allow you to provide a list of additionalActivationKeys.
     */
    $.fn.activatable = function (fn, options) {
        makeElementsActivatable (this, fn, this.activatable.defaults.keys, options);
        setData (this, ACTIVATE_KEY, createDefaultActivationHandler (this, fn));
        return this;
    };

    /**
     * Selects the specified element.
     */
    $.fn.select = function (elementToSelect) {
        elementToSelect.focus ();
        return this;
    };

    /**
     * Selects the next matched element.
     */
    $.fn.selectNext = function () {
        focusNextElement(getData(this, CONTEXT_KEY));
        return this;
    };

    /**
     * Selects the previous matched element.
     */
    $.fn.selectPrevious = function () {
        focusPreviousElement(getData(this, CONTEXT_KEY));
        return this;
    };

    /**
     * Returns the currently selected item wrapped as a jQuery object.
     */
    $.fn.currentSelection = function () {
        var that = getData(this, CONTEXT_KEY);
        return $(that.selectedElement());
    };

    /**
     * Activates the specified element.
     */
    $.fn.activate = function (elementToActivate) {
        var handler = getData (this, ACTIVATE_KEY);
        handler (elementToActivate);
        return this;
    };

    // Public Defaults.
    $.fn.activatable.defaults = {
        keys: [$.a11y.keys.ENTER, $.a11y.keys.SPACE]
    };

    $.fn.selectable.defaults = {
        direction: this.VERTICAL,
        autoSelectFirstItem: true,
        rememberSelectionState: true,
        selectableSelector: ".selectable",
        selectableElements: null,
        onSelect: null,
        onUnselect: null,
        onLeaveContainer: null
    };
}) (jQuery);
/***
 Copyright 2007 Chris Hoffman
 
 This software is dual licensed under the MIT (MIT-LICENSE.txt)
 and GPL (GPL-LICENSE.txt) licenses.

 You may obtain a copy of the GPL License at 
 https://source.fluidproject.org/svn/fluid/components/trunk/src/webapp/fluid-components/js/jquery/GPL-LICENSE.txt

 You may obtain a copy of the MIT License at 
 https://source.fluidproject.org/svn/fluid/components/trunk/src/webapp/fluid-components/js/jquery/MIT-LICENSE.txt
***/

/******************************
  Commonly used variable names

  args - an array of function arguments
  attr - an attribute name
  el   - a DOM element
  i    - an array index
  jq   - a jQuery object
  val  - a value
 ******************************/

(function($){

var ariaStatesNS = "http://www.w3.org/2005/07/aaa";

var xhtmlRoles = [
	"main",
	"secondary",
	"navigation",
	"banner",
	"contentinfo",
	"statements",
	"note",
	"seealso",
	"search"
];

var xhtmlRolesRegex = new RegExp("^" + xhtmlRoles.join("|") + "$");

var isFF2 = $.browser.mozilla && (parseFloat($.browser.version) < 1.9);

var ariaStateAttr = (function() {
	if (isFF2) {
		// Firefox < v3, so use States & Properties namespace.
		return function(jq, attr, val) {
			if (typeof val != "undefined") {
				jq.each(function(i, el) {
					el.setAttributeNS(ariaStatesNS, "aaa:" + attr, val);
				});
  			} else {
 				return jq.get(0).getAttributeNS(ariaStatesNS, attr);
			}
		};
	} else {
		// Use the aria- attribute form.
		return function(jq, attr, val) {
			if (typeof val != "undefined") {
				jq.each(function(i, el) {
					$(el).attr("aria-" + attr, val);
				});
			} else {
				return jq.attr("aria-" + attr);
			}
		};
	}
})();
  
$.fn.extend({  
	ariaRole : function(role){
		var jq = this;
		if (role) {

			// Add the role: prefix, unless it's one of the XHTML Role Module roles

			role = (xhtmlRolesRegex.test(role) || !isFF2) ? role : "wairole:" + role;

			jq.each(function(i, el) {
				$(el).attr("role", role);
			});
			return jq;
		} else {
			var role = jq.eq(0).attr("role");
			if (role) {
				role = role.replace(/^wairole:/, "");
			}
			return role;
		}
	},

	ariaState : function() {
		var args = arguments;
		var jq = this;
		if (args.length == 2) {

			// State and value were given as separate arguments.

			jq.each(function(i, el) {
				ariaStateAttr($(el), args[0], args[1]);
			});
			return jq;
		} else {
			if (typeof args[0] == "string") {

				// Just a state was supplied, so return a value.

				return ariaStateAttr(jq.eq(0), args[0]);
			} else {

				// An object was supplied. Set states and values based on the keys/values.

				jq.each(function(i, el){
					$.each(args[0], function(state, val) {
						$(el).ariaState(state, val);
					});
				});
				return jq;
			}
 		}
  	}
});

// Add :ariaRole(role) and :ariaState(state[=value]) filters.

$.extend($.expr[':'], {
	// a is the element being tested, m[3] is the argument to the selector.

	ariaRole : "jQuery(a).ariaRole()==m[3]",
	ariaState : "jQuery(a).ariaState(m[3].split(/=/)[0])==(/=/.test(m[3])?m[3].split(/=/)[1]:'true')"
});

})(jQuery);
/* Copyright (c) 2006 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * $LastChangedDate: 2008-07-18 18:13:15 -0400 (Fri, 18 Jul 2008) $
 * $Rev: 5243 $
 *
 * Version 2.1
 */

(function($){

/**
 * The bgiframe is chainable and applies the iframe hack to get 
 * around zIndex issues in IE6. It will only apply itself in IE 
 * and adds a class to the iframe called 'bgiframe'. The iframe
 * is appeneded as the first child of the matched element(s) 
 * with a tabIndex and zIndex of -1.
 * 
 * By default the plugin will take borders, sized with pixel units,
 * into account. If a different unit is used for the border's width,
 * then you will need to use the top and left settings as explained below.
 *
 * NOTICE: This plugin has been reported to cause perfromance problems
 * when used on elements that change properties (like width, height and
 * opacity) a lot in IE6. Most of these problems have been caused by 
 * the expressions used to calculate the elements width, height and 
 * borders. Some have reported it is due to the opacity filter. All 
 * these settings can be changed if needed as explained below.
 *
 * @example $('div').bgiframe();
 * @before <div><p>Paragraph</p></div>
 * @result <div><iframe class="bgiframe".../><p>Paragraph</p></div>
 *
 * @param Map settings Optional settings to configure the iframe.
 * @option String|Number top The iframe must be offset to the top
 * 		by the width of the top border. This should be a negative 
 *      number representing the border-top-width. If a number is 
 * 		is used here, pixels will be assumed. Otherwise, be sure
 *		to specify a unit. An expression could also be used. 
 * 		By default the value is "auto" which will use an expression 
 * 		to get the border-top-width if it is in pixels.
 * @option String|Number left The iframe must be offset to the left
 * 		by the width of the left border. This should be a negative 
 *      number representing the border-left-width. If a number is 
 * 		is used here, pixels will be assumed. Otherwise, be sure
 *		to specify a unit. An expression could also be used. 
 * 		By default the value is "auto" which will use an expression 
 * 		to get the border-left-width if it is in pixels.
 * @option String|Number width This is the width of the iframe. If
 *		a number is used here, pixels will be assume. Otherwise, be sure
 * 		to specify a unit. An experssion could also be used.
 *		By default the value is "auto" which will use an experssion
 * 		to get the offsetWidth.
 * @option String|Number height This is the height of the iframe. If
 *		a number is used here, pixels will be assume. Otherwise, be sure
 * 		to specify a unit. An experssion could also be used.
 *		By default the value is "auto" which will use an experssion
 * 		to get the offsetHeight.
 * @option Boolean opacity This is a boolean representing whether or not
 * 		to use opacity. If set to true, the opacity of 0 is applied. If
 *		set to false, the opacity filter is not applied. Default: true.
 * @option String src This setting is provided so that one could change 
 *		the src of the iframe to whatever they need.
 *		Default: "javascript:false;"
 *
 * @name bgiframe
 * @type jQuery
 * @cat Plugins/bgiframe
 * @author Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 */
$.fn.bgIframe = $.fn.bgiframe = function(s) {
	// This is only for IE6
	if ( $.browser.msie && parseInt($.browser.version) <= 6 ) {
		s = $.extend({
			top     : 'auto', // auto == .currentStyle.borderTopWidth
			left    : 'auto', // auto == .currentStyle.borderLeftWidth
			width   : 'auto', // auto == offsetWidth
			height  : 'auto', // auto == offsetHeight
			opacity : true,
			src     : 'javascript:false;'
		}, s || {});
		var prop = function(n){return n&&n.constructor==Number?n+'px':n;},
		    html = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+
		               'style="display:block;position:absolute;z-index:-1;'+
			               (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
					       'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
					       'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
					       'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
					       'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
					'"/>';
		return this.each(function() {
			if ( $('> iframe.bgiframe', this).length == 0 )
				this.insertBefore( document.createElement(html), this.firstChild );
		});
	}
	return this;
};

// Add browser.version if it doesn't exist
if (!$.browser.version)
	$.browser.version = navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)[1];

})(jQuery);/*
 * jQuery Tooltip plugin 1.2
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-tooltip/
 * http://docs.jquery.com/Plugins/Tooltip
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.tooltip.js 5243 2008-07-18 22:13:15Z antranig@caret.cam.ac.uk $
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
 
;(function($) {
	
		// the tooltip element
	var helper = {},
		// the current tooltipped element
		current,
		// the title of the current element, used for restoring
		title,
		// timeout id for delayed tooltips
		tID,
		// IE 5.5 or 6
		IE = $.browser.msie && /MSIE\s(5\.5|6\.)/.test(navigator.userAgent),
		// flag for mouse tracking
		track = false;
	
	$.tooltip = {
		blocked: false,
		defaults: {
			delay: 200,
			showURL: true,
			extraClass: "",
			top: 15,
			left: 15,
			id: "tooltip"
		},
		block: function() {
			$.tooltip.blocked = !$.tooltip.blocked;
		}
	};
	
	$.fn.extend({
		tooltip: function(settings) {
			settings = $.extend({}, $.tooltip.defaults, settings);
			createHelper(settings);
			return this.each(function() {
					$.data(this, "tooltip-settings", settings);
					// copy tooltip into its own expando and remove the title
					this.tooltipText = this.title;
					$(this).removeAttr("title");
					// also remove alt attribute to prevent default tooltip in IE
					this.alt = "";
				})
				.hover(save, hide)
				.click(hide);
		},
		fixPNG: IE ? function() {
			return this.each(function () {
				var image = $(this).css('backgroundImage');
				if (image.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
					image = RegExp.$1;
					$(this).css({
						'backgroundImage': 'none',
						'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
					}).each(function () {
						var position = $(this).css('position');
						if (position != 'absolute' && position != 'relative')
							$(this).css('position', 'relative');
					});
				}
			});
		} : function() { return this; },
		unfixPNG: IE ? function() {
			return this.each(function () {
				$(this).css({'filter': '', backgroundImage: ''});
			});
		} : function() { return this; },
		hideWhenEmpty: function() {
			return this.each(function() {
				$(this)[ $(this).html() ? "show" : "hide" ]();
			});
		},
		url: function() {
			return this.attr('href') || this.attr('src');
		}
	});
	
	function createHelper(settings) {
		// there can be only one tooltip helper
		if( helper.parent )
			return;
		// create the helper, h3 for title, div for url
		helper.parent = $('<div id="' + settings.id + '"><h3></h3><div class="body"></div><div class="url"></div></div>')
			// add to document
			.appendTo(document.body)
			// hide it at first
			.hide();
			
		// apply bgiframe if available
		if ( $.fn.bgiframe )
			helper.parent.bgiframe();
		
		// save references to title and url elements
		helper.title = $('h3', helper.parent);
		helper.body = $('div.body', helper.parent);
		helper.url = $('div.url', helper.parent);
	}
	
	function settings(element) {
		return $.data(element, "tooltip-settings");
	}
	
	// main event handler to start showing tooltips
	function handle(event) {
		// show helper, either with timeout or on instant
		if( settings(this).delay )
			tID = setTimeout(show, settings(this).delay);
		else
			show();
		
		// if selected, update the helper position when the mouse moves
		track = !!settings(this).track;
		$(document.body).bind('mousemove', update);
			
		// update at least once
		update(event);
	}
	
	// save elements title before the tooltip is displayed
	function save() {
		// if this is the current source, or it has no title (occurs with click event), stop
		if ( $.tooltip.blocked || this == current || (!this.tooltipText && !settings(this).bodyHandler) )
			return;

		// save current
		current = this;
		title = this.tooltipText;
		
		if ( settings(this).bodyHandler ) {
			helper.title.hide();
			var bodyContent = settings(this).bodyHandler.call(this);
			if (bodyContent.nodeType || bodyContent.jquery) {
				helper.body.empty().append(bodyContent)
			} else {
				helper.body.html( bodyContent );
			}
			helper.body.show();
		} else if ( settings(this).showBody ) {
			var parts = title.split(settings(this).showBody);
			helper.title.html(parts.shift()).show();
			helper.body.empty();
			for(var i = 0, part; part = parts[i]; i++) {
				if(i > 0)
					helper.body.append("<br/>");
				helper.body.append(part);
			}
			helper.body.hideWhenEmpty();
		} else {
			helper.title.html(title).show();
			helper.body.hide();
		}
		
		// if element has href or src, add and show it, otherwise hide it
		if( settings(this).showURL && $(this).url() )
			helper.url.html( $(this).url().replace('http://', '') ).show();
		else 
			helper.url.hide();
		
		// add an optional class for this tip
		helper.parent.addClass(settings(this).extraClass);

		// fix PNG background for IE
		if (settings(this).fixPNG )
			helper.parent.fixPNG();
			
		handle.apply(this, arguments);
	}
	
	// delete timeout and show helper
	function show() {
		tID = null;
		helper.parent.show();
		update();
	}
	
	/**
	 * callback for mousemove
	 * updates the helper position
	 * removes itself when no current element
	 */
	function update(event)	{
		if($.tooltip.blocked)
			return;
		
		// stop updating when tracking is disabled and the tooltip is visible
		if ( !track && helper.parent.is(":visible")) {
			$(document.body).unbind('mousemove', update)
		}
		
		// if no current element is available, remove this listener
		if( current == null ) {
			$(document.body).unbind('mousemove', update);
			return;	
		}
		
		// remove position helper classes
		helper.parent.removeClass("viewport-right").removeClass("viewport-bottom");
		
		var left = helper.parent[0].offsetLeft;
		var top = helper.parent[0].offsetTop;
		if(event) {
			// position the helper 15 pixel to bottom right, starting from mouse position
			left = event.pageX + settings(current).left;
			top = event.pageY + settings(current).top;
			helper.parent.css({
				left: left + 'px',
				top: top + 'px'
			});
		}
		
		var v = viewport(),
			h = helper.parent[0];
		// check horizontal position
		if(v.x + v.cx < h.offsetLeft + h.offsetWidth) {
			left -= h.offsetWidth + 20 + settings(current).left;
			helper.parent.css({left: left + 'px'}).addClass("viewport-right");
		}
		// check vertical position
		if(v.y + v.cy < h.offsetTop + h.offsetHeight) {
			top -= h.offsetHeight + 20 + settings(current).top;
			helper.parent.css({top: top + 'px'}).addClass("viewport-bottom");
		}
	}
	
	function viewport() {
		return {
			x: $(window).scrollLeft(),
			y: $(window).scrollTop(),
			cx: $(window).width(),
			cy: $(window).height()
		};
	}
	
	// hide helper and restore added classes and the title
	function hide(event) {
		if($.tooltip.blocked)
			return;
		// clear timeout if possible
		if(tID)
			clearTimeout(tID);
		// no more current element
		current = null;
		
		helper.parent.hide().removeClass( settings(this).extraClass );
		
		if( settings(this).fixPNG )
			helper.parent.unfixPNG();
	}
	
	$.fn.Tooltip = $.fn.tooltip;
	
})(jQuery);
/*
 * jQuery UI 1.5.1
 *
 * Copyright (c) 2008 Paul Bakaus (ui.jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
;(function($) {

$.ui = {
	plugin: {
		add: function(module, option, set) {
			var proto = $.ui[module].prototype;
			for(var i in set) {
				proto.plugins[i] = proto.plugins[i] || [];
				proto.plugins[i].push([option, set[i]]);
			}
		},
		call: function(instance, name, args) {
			var set = instance.plugins[name];
			if(!set) { return; }
			
			for (var i = 0; i < set.length; i++) {
				if (instance.options[set[i][0]]) {
					set[i][1].apply(instance.element, args);
				}
			}
		}	
	},
	cssCache: {},
	css: function(name) {
		if ($.ui.cssCache[name]) { return $.ui.cssCache[name]; }
		var tmp = $('<div class="ui-gen">').addClass(name).css({position:'absolute', top:'-5000px', left:'-5000px', display:'block'}).appendTo('body');
		
		//if (!$.browser.safari)
			//tmp.appendTo('body'); 
		
		//Opera and Safari set width and height to 0px instead of auto
		//Safari returns rgba(0,0,0,0) when bgcolor is not set
		$.ui.cssCache[name] = !!(
			(!(/auto|default/).test(tmp.css('cursor')) || (/^[1-9]/).test(tmp.css('height')) || (/^[1-9]/).test(tmp.css('width')) || 
			!(/none/).test(tmp.css('backgroundImage')) || !(/transparent|rgba\(0, 0, 0, 0\)/).test(tmp.css('backgroundColor')))
		);
		try { $('body').get(0).removeChild(tmp.get(0));	} catch(e){}
		return $.ui.cssCache[name];
	},
	disableSelection: function(e) {
		e.unselectable = "on";
		e.onselectstart = function() { return false; };
		if (e.style) { e.style.MozUserSelect = "none"; }
	},
	enableSelection: function(e) {
		e.unselectable = "off";
		e.onselectstart = function() { return true; };
		if (e.style) { e.style.MozUserSelect = ""; }
	},
	hasScroll: function(e, a) {
		var scroll = /top/.test(a||"top") ? 'scrollTop' : 'scrollLeft', has = false;
		if (e[scroll] > 0) return true; e[scroll] = 1;
		has = e[scroll] > 0 ? true : false; e[scroll] = 0;
		return has;
	}
};


/** jQuery core modifications and additions **/

var _remove = $.fn.remove;
$.fn.remove = function() {
	$("*", this).add(this).trigger("remove");
	return _remove.apply(this, arguments );
};

// $.widget is a factory to create jQuery plugins
// taking some boilerplate code out of the plugin code
// created by Scott González and Jörn Zaefferer
function getter(namespace, plugin, method) {
	var methods = $[namespace][plugin].getter || [];
	methods = (typeof methods == "string" ? methods.split(/,?\s+/) : methods);
	return ($.inArray(method, methods) != -1);
}

$.widget = function(name, prototype) {
	var namespace = name.split(".")[0];
	name = name.split(".")[1];
	
	// create plugin method
	$.fn[name] = function(options) {
		var isMethodCall = (typeof options == 'string'),
			args = Array.prototype.slice.call(arguments, 1);
		
		if (isMethodCall && getter(namespace, name, options)) {
			var instance = $.data(this[0], name);
			return (instance ? instance[options].apply(instance, args)
				: undefined);
		}
		
		return this.each(function() {
			var instance = $.data(this, name);
			if (isMethodCall && instance && $.isFunction(instance[options])) {
				instance[options].apply(instance, args);
			} else if (!isMethodCall) {
				$.data(this, name, new $[namespace][name](this, options));
			}
		});
	};
	
	// create widget constructor
	$[namespace][name] = function(element, options) {
		var self = this;
		
		this.widgetName = name;
		this.widgetBaseClass = namespace + '-' + name;
		
		this.options = $.extend({}, $.widget.defaults, $[namespace][name].defaults, options);
		this.element = $(element)
			.bind('setData.' + name, function(e, key, value) {
				return self.setData(key, value);
			})
			.bind('getData.' + name, function(e, key) {
				return self.getData(key);
			})
			.bind('remove', function() {
				return self.destroy();
			});
		this.init();
	};
	
	// add widget prototype
	$[namespace][name].prototype = $.extend({}, $.widget.prototype, prototype);
};

$.widget.prototype = {
	init: function() {},
	destroy: function() {
		this.element.removeData(this.widgetName);
	},
	
	getData: function(key) {
		return this.options[key];
	},
	setData: function(key, value) {
		this.options[key] = value;
		
		if (key == 'disabled') {
			this.element[value ? 'addClass' : 'removeClass'](
				this.widgetBaseClass + '-disabled');
		}
	},
	
	enable: function() {
		this.setData('disabled', false);
	},
	disable: function() {
		this.setData('disabled', true);
	}
};

$.widget.defaults = {
	disabled: false
};


/** Mouse Interaction Plugin **/

$.ui.mouse = {
	mouseInit: function() {
		var self = this;
	
		this.element.bind('mousedown.'+this.widgetName, function(e) {
			return self.mouseDown(e);
		});
		
		// Prevent text selection in IE
		if ($.browser.msie) {
			this._mouseUnselectable = this.element.attr('unselectable');
			this.element.attr('unselectable', 'on');
		}
		
		this.started = false;
	},
	
	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		
		// Restore text selection in IE
		($.browser.msie
			&& this.element.attr('unselectable', this._mouseUnselectable));
	},
	
	mouseDown: function(e) {
		// we may have missed mouseup (out of window)
		(this._mouseStarted && this.mouseUp(e));
		
		this._mouseDownEvent = e;
		
		var self = this,
			btnIsLeft = (e.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(e.target).is(this.options.cancel) : false);
		if (!btnIsLeft || elIsCancel || !this.mouseCapture(e)) {
			return true;
		}
		
		this._mouseDelayMet = !this.options.delay;
		if (!this._mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self._mouseDelayMet = true;
			}, this.options.delay);
		}
		
		if (this.mouseDistanceMet(e) && this.mouseDelayMet(e)) {
			this._mouseStarted = (this.mouseStart(e) !== false);
			if (!this._mouseStarted) {
				e.preventDefault();
				return true;
			}
		}
		
		// these delegates are required to keep context
		this._mouseMoveDelegate = function(e) {
			return self.mouseMove(e);
		};
		this._mouseUpDelegate = function(e) {
			return self.mouseUp(e);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		
		return false;
	},
	
	mouseMove: function(e) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !e.button) {
			return this.mouseUp(e);
		}
		
		if (this._mouseStarted) {
			this.mouseDrag(e);
			return false;
		}
		
		if (this.mouseDistanceMet(e) && this.mouseDelayMet(e)) {
			this._mouseStarted =
				(this.mouseStart(this._mouseDownEvent, e) !== false);
			(this._mouseStarted ? this.mouseDrag(e) : this.mouseUp(e));
		}
		
		return !this._mouseStarted;
	},
	
	mouseUp: function(e) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		
		if (this._mouseStarted) {
			this._mouseStarted = false;
			this.mouseStop(e);
		}
		
		return false;
	},
	
	mouseDistanceMet: function(e) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - e.pageX),
				Math.abs(this._mouseDownEvent.pageY - e.pageY)
			) >= this.options.distance
		);
	},
	
	mouseDelayMet: function(e) {
		return this._mouseDelayMet;
	},
	
	// These are placeholder methods, to be overriden by extending plugin
	mouseStart: function(e) {},
	mouseDrag: function(e) {},
	mouseStop: function(e) {},
	mouseCapture: function(e) { return true; }
};

$.ui.mouse.defaults = {
	cancel: null,
	distance: 1,
	delay: 0
};

})(jQuery);
/*
 * jQuery UI Dialog
 *
 * Copyright (c) 2008 Richard D. Worth (rdworth.org)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	ui.core.js
 *	ui.draggable.js
 *	ui.resizable.js
 */
(function($) {

var setDataSwitch = {
	dragStart: "start.draggable",
	drag: "drag.draggable",
	dragStop: "stop.draggable",
	maxHeight: "maxHeight.resizable",
	minHeight: "minHeight.resizable",
	maxWidth: "maxWidth.resizable",
	minWidth: "minWidth.resizable",
	resizeStart: "start.resizable",
	resize: "drag.resizable",
	resizeStop: "stop.resizable"
};

$.widget("ui.dialog", {
	init: function() {
		var self = this,
			options = this.options,
			resizeHandles = typeof options.resizable == 'string'
				? options.resizable
				: 'n,e,s,w,se,sw,ne,nw',
			
			uiDialogContent = this.element
				.addClass('ui-dialog-content')
				.wrap('<div/>')
				.wrap('<div/>'),
			
			uiDialogContainer = (this.uiDialogContainer = uiDialogContent.parent()
				.addClass('ui-dialog-container')
				.css({position: 'relative', width: '100%', height: '100%'})),
			
			title = options.title || uiDialogContent.attr('title') || '',
			uiDialogTitlebar = (this.uiDialogTitlebar =
				$('<div class="ui-dialog-titlebar"/>'))
				.append('<span class="ui-dialog-title">' + title + '</span>')
				.append('<a href="#" class="ui-dialog-titlebar-close"><span>X</span></a>')
				.prependTo(uiDialogContainer),
			
			uiDialog = (this.uiDialog = uiDialogContainer.parent())
				.appendTo(document.body)
				.hide()
				.addClass('ui-dialog')
				.addClass(options.dialogClass)
				// add content classes to dialog
				// to inherit theme at top level of element
				.addClass(uiDialogContent.attr('className'))
					.removeClass('ui-dialog-content')
				.css({
					position: 'absolute',
					width: options.width,
					height: options.height,
					overflow: 'hidden',
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function(ev) {
					if (options.closeOnEscape) {
						var ESC = 27;
						(ev.keyCode && ev.keyCode == ESC && self.close());
					}
				})
				.mousedown(function() {
					self.moveToTop();
				}),
			
			uiDialogButtonPane = (this.uiDialogButtonPane = $('<div/>'))
				.addClass('ui-dialog-buttonpane')
				.appendTo(uiDialog);
		
		this.uiDialogTitlebarClose = $('.ui-dialog-titlebar-close', uiDialogTitlebar)
			.hover(
				function() {
					$(this).addClass('ui-dialog-titlebar-close-hover');
				},
				function() {
					$(this).removeClass('ui-dialog-titlebar-close-hover');
				}
			)
			.mousedown(function(ev) {
				ev.stopPropagation();
			})
			.click(function() {
				self.close();
				return false;
			});
		
		if ($.fn.draggable) {
			uiDialog.draggable({
				helper: options.dragHelper,
				handle: '.ui-dialog-titlebar',
				start: function(e, ui) {
					self.moveToTop();
					(options.dragStart && options.dragStart.apply(self.element[0], arguments));
				},
				drag: function(e, ui) {
					(options.drag && options.drag.apply(self.element[0], arguments));
				},
				stop: function(e, ui) {
					(options.dragStop && options.dragStop.apply(self.element[0], arguments));
					$.ui.dialog.overlay.resize();
				}
			});
			(options.draggable || uiDialog.draggable('disable'));
		}
		
		if ($.fn.resizable) {
			uiDialog.resizable({
				proxy: options.resizeHelper,
				maxWidth: options.maxWidth,
				maxHeight: options.maxHeight,
				minWidth: options.minWidth,
				minHeight: options.minHeight,
				start: function() {
					(options.resizeStart && options.resizeStart.apply(self.element[0], arguments));
				},
				resize: function(e, ui) {
					(options.autoResize && self.size.apply(self));
					(options.resize && options.resize.apply(self.element[0], arguments));
				},
				handles: resizeHandles,
				stop: function(e, ui) {
					(options.autoResize && self.size.apply(self));
					(options.resizeStop && options.resizeStop.apply(self.element[0], arguments));
					$.ui.dialog.overlay.resize();
				}
			});
			(options.resizable || uiDialog.resizable('disable'));
		}
		
		this.createButtons(options.buttons);
		this.isOpen = false;
		
		(options.bgiframe && $.fn.bgiframe && uiDialog.bgiframe());
		(options.autoOpen && this.open());
	},
	
	setData: function(key, value){
		(setDataSwitch[key] && this.uiDialog.data(setDataSwitch[key], value));
		switch (key) {
			case "buttons":
				this.createButtons(value);
				break;
			case "draggable":
				this.uiDialog.draggable(value ? 'enable' : 'disable');
				break;
			case "height":
				this.uiDialog.height(value);
				break;
			case "position":
				this.position(value);
				break;
			case "resizable":
				(typeof value == 'string' && this.uiDialog.data('handles.resizable', value));
				this.uiDialog.resizable(value ? 'enable' : 'disable');
				break;
			case "title":
				$(".ui-dialog-title", this.uiDialogTitlebar).text(value);
				break;
			case "width":
				this.uiDialog.width(value);
				break;
		}
		
		$.widget.prototype.setData.apply(this, arguments);
	},
	
	position: function(pos) {
		var wnd = $(window), doc = $(document),
			pTop = doc.scrollTop(), pLeft = doc.scrollLeft(),
			minTop = pTop;
		
		if ($.inArray(pos, ['center','top','right','bottom','left']) >= 0) {
			pos = [
				pos == 'right' || pos == 'left' ? pos : 'center',
				pos == 'top' || pos == 'bottom' ? pos : 'middle'
			];
		}
		if (pos.constructor != Array) {
			pos = ['center', 'middle'];
		}
		if (pos[0].constructor == Number) {
			pLeft += pos[0];
		} else {
			switch (pos[0]) {
				case 'left':
					pLeft += 0;
					break;
				case 'right':
					pLeft += wnd.width() - this.uiDialog.width();
					break;
				default:
				case 'center':
					pLeft += (wnd.width() - this.uiDialog.width()) / 2;
			}
		}
		if (pos[1].constructor == Number) {
			pTop += pos[1];
		} else {
			switch (pos[1]) {
				case 'top':
					pTop += 0;
					break;
				case 'bottom':
					pTop += wnd.height() - this.uiDialog.height();
					break;
				default:
				case 'middle':
					pTop += (wnd.height() - this.uiDialog.height()) / 2;
			}
		}
		
		// prevent the dialog from being too high (make sure the titlebar
		// is accessible)
		pTop = Math.max(pTop, minTop);
		this.uiDialog.css({top: pTop, left: pLeft});
	},

	size: function() {
		var container = this.uiDialogContainer,
			titlebar = this.uiDialogTitlebar,
			content = this.element,
			tbMargin = parseInt(content.css('margin-top')) + parseInt(content.css('margin-bottom')),
			lrMargin = parseInt(content.css('margin-left')) + parseInt(content.css('margin-right'));
		content.height(container.height() - titlebar.outerHeight() - tbMargin);
		content.width(container.width() - lrMargin);
	},
	
	open: function() {
		if (this.isOpen) { return; }
		
		this.overlay = this.options.modal ? new $.ui.dialog.overlay(this) : null;
		this.uiDialog.appendTo('body');
		this.position(this.options.position);
		this.uiDialog.show(this.options.show);
		this.options.autoResize && this.size();
		this.moveToTop(true);
		
		// CALLBACK: open
		var openEV = null;
		var openUI = {
			options: this.options
		};
		this.uiDialogTitlebarClose.focus();
		this.element.triggerHandler("dialogopen", [openEV, openUI], this.options.open);
		
		this.isOpen = true;
	},
	
	// the force parameter allows us to move modal dialogs to their correct
	// position on open
	moveToTop: function(force) {
		if ((this.options.modal && !force)
			|| (!this.options.stack && !this.options.modal)) { return; }
		
		var maxZ = this.options.zIndex, options = this.options;
		$('.ui-dialog:visible').each(function() {
			maxZ = Math.max(maxZ, parseInt($(this).css('z-index'), 10) || options.zIndex);
		});
		(this.overlay && this.overlay.$el.css('z-index', ++maxZ));
		this.uiDialog.css('z-index', ++maxZ);
	},
	
	close: function() {
		(this.overlay && this.overlay.destroy());
		this.uiDialog.hide(this.options.hide);

		// CALLBACK: close
		var closeEV = null;
		var closeUI = {
			options: this.options
		};
		this.element.triggerHandler("dialogclose", [closeEV, closeUI], this.options.close);
		$.ui.dialog.overlay.resize();
		
		this.isOpen = false;
	},
	
	destroy: function() {
		(this.overlay && this.overlay.destroy());
		this.uiDialog.hide();
		this.element
			.unbind('.dialog')
			.removeData('dialog')
			.removeClass('ui-dialog-content')
			.hide().appendTo('body');
		this.uiDialog.remove();
	},
	
	createButtons: function(buttons) {
		var self = this,
			hasButtons = false,
			uiDialogButtonPane = this.uiDialogButtonPane;
		
		// remove any existing buttons
		uiDialogButtonPane.empty().hide();
		
		$.each(buttons, function() { return !(hasButtons = true); });
		if (hasButtons) {
			uiDialogButtonPane.show();
			$.each(buttons, function(name, fn) {
				$('<button/>')
					.text(name)
					.click(function() { fn.apply(self.element[0], arguments); })
					.appendTo(uiDialogButtonPane);
			});
		}
	}
});

$.extend($.ui.dialog, {
	defaults: {
		autoOpen: true,
		autoResize: true,
		bgiframe: false,
		buttons: {},
		closeOnEscape: true,
		draggable: true,
		height: 200,
		minHeight: 100,
		minWidth: 150,
		modal: false,
		overlay: {},
		position: 'center',
		resizable: true,
		stack: true,
		width: 300,
		zIndex: 1000
	},
	
	overlay: function(dialog) {
		this.$el = $.ui.dialog.overlay.create(dialog);
	}
});

$.extend($.ui.dialog.overlay, {
	instances: [],
	events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
		function(e) { return e + '.dialog-overlay'; }).join(' '),
	create: function(dialog) {
		if (this.instances.length === 0) {
			// prevent use of anchors and inputs
			// we use a setTimeout in case the overlay is created from an
			// event that we're going to be cancelling (see #2804)
			setTimeout(function() {
				$('a, :input').bind($.ui.dialog.overlay.events, function() {
					// allow use of the element if inside a dialog and
					// - there are no modal dialogs
					// - there are modal dialogs, but we are in front of the topmost modal
					var allow = false;
					var $dialog = $(this).parents('.ui-dialog');
					if ($dialog.length) {
						var $overlays = $('.ui-dialog-overlay');
						if ($overlays.length) {
							var maxZ = parseInt($overlays.css('z-index'), 10);
							$overlays.each(function() {
								maxZ = Math.max(maxZ, parseInt($(this).css('z-index'), 10));
							});
							allow = parseInt($dialog.css('z-index'), 10) > maxZ;
						} else {
							allow = true;
						}
					}
					return allow;
				});
			}, 1);
			
			// allow closing by pressing the escape key
			$(document).bind('keydown.dialog-overlay', function(e) {
				var ESC = 27;
				(e.keyCode && e.keyCode == ESC && dialog.close()); 
			});
			
			// handle window resize
			$(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
		}
		
		var $el = $('<div/>').appendTo(document.body)
			.addClass('ui-dialog-overlay').css($.extend({
				borderWidth: 0, margin: 0, padding: 0,
				position: 'absolute', top: 0, left: 0,
				width: this.width(),
				height: this.height()
			}, dialog.options.overlay));
		
		(dialog.options.bgiframe && $.fn.bgiframe && $el.bgiframe());
		
		this.instances.push($el);
		return $el;
	},
	
	destroy: function($el) {
		this.instances.splice($.inArray(this.instances, $el), 1);
		
		if (this.instances.length === 0) {
			$('a, :input').add([document, window]).unbind('.dialog-overlay');
		}
		
		$el.remove();
	},
	
	height: function() {
		if ($.browser.msie && $.browser.version < 7) {
			var scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			var offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);
			
			if (scrollHeight < offsetHeight) {
				return $(window).height() + 'px';
			} else {
				return scrollHeight + 'px';
			}
		} else {
			return $(document).height() + 'px';
		}
	},
	
	width: function() {
		if ($.browser.msie && $.browser.version < 7) {
			var scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			var offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);
			
			if (scrollWidth < offsetWidth) {
				return $(window).width() + 'px';
			} else {
				return scrollWidth + 'px';
			}
		} else {
			return $(document).width() + 'px';
		}
	},
	
	resize: function() {
		/* If the dialog is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the overlay. If the user then drags the
		 * dialog back to the left, the document will become narrower,
		 * so we need to shrink the overlay to the appropriate size.
		 * This is handled by shrinking the overlay before setting it
		 * to the full document size.
		 */
		var $overlays = $([]);
		$.each($.ui.dialog.overlay.instances, function() {
			$overlays = $overlays.add(this);
		});
		
		$overlays.css({
			width: 0,
			height: 0
		}).css({
			width: $.ui.dialog.overlay.width(),
			height: $.ui.dialog.overlay.height()
		});
	}
});

$.extend($.ui.dialog.overlay.prototype, {
	destroy: function() {
		$.ui.dialog.overlay.destroy(this.$el);
	}
});

})(jQuery);
/*
 * jQuery UI Draggable
 *
 * Copyright (c) 2008 Paul Bakaus
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.draggable", $.extend($.ui.mouse, {
	init: function() {
		
		//Initialize needed constants
		var o = this.options;

		//Position the node
		if (o.helper == 'original' && !(/(relative|absolute|fixed)/).test(this.element.css('position')))
			this.element.css('position', 'relative');

		this.element.addClass('ui-draggable');
		(o.disabled && this.element.addClass('ui-draggable-disabled'));
		
		this.mouseInit();
		
	},
	mouseStart: function(e) {
		var o = this.options;
		
		if (this.helper || o.disabled || $(e.target).is('.ui-resizable-handle')) return false;
		
		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		
	
		$(this.options.handle, this.element).find("*").andSelf().each(function() {
			if(this == e.target) handle = true;
		});
		if (!handle) return false;
		
		if($.ui.ddmanager) $.ui.ddmanager.current = this;
		
		//Create and append the visible helper
		this.helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [e])) : (o.helper == 'clone' ? this.element.clone() : this.element);
		if(!this.helper.parents('body').length) this.helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));
		if(this.helper[0] != this.element[0] && !(/(fixed|absolute)/).test(this.helper.css("position"))) this.helper.css("position", "absolute");
		
		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */
		
		this.margins = {																				//Cache the margins
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0)
		};		
		
		this.cssPosition = this.helper.css("position");													//Store the helper's css position
		this.offset = this.element.offset();															//The element's absolute position on the page
		this.offset = {																					//Substract the margins from the element's absolute offset
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};
		
		this.offset.click = {																			//Where the click happened, relative to the element
			left: e.pageX - this.offset.left,
			top: e.pageY - this.offset.top
		};
		
		this.offsetParent = this.helper.offsetParent(); var po = this.offsetParent.offset();			//Get the offsetParent and cache its position
		if(this.offsetParent[0] == document.body && $.browser.mozilla) po = { top: 0, left: 0 };		//Ugly FF3 fix
		this.offset.parent = {																			//Store its position plus border
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};
		
		var p = this.element.position();																//This is a relative to absolute position minus the actual position calculation - only used for relative positioned helpers
		this.offset.relative = this.cssPosition == "relative" ? {
			top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.offsetParent[0].scrollTop,
			left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.offsetParent[0].scrollLeft
		} : { top: 0, left: 0 };
		
		this.originalPosition = this.generatePosition(e);												//Generate the original position
		this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() };//Cache the helper size
		
		if(o.cursorAt) {
			if(o.cursorAt.left != undefined) this.offset.click.left = o.cursorAt.left + this.margins.left;
			if(o.cursorAt.right != undefined) this.offset.click.left = this.helperProportions.width - o.cursorAt.right + this.margins.left;
			if(o.cursorAt.top != undefined) this.offset.click.top = o.cursorAt.top + this.margins.top;
			if(o.cursorAt.bottom != undefined) this.offset.click.top = this.helperProportions.height - o.cursorAt.bottom + this.margins.top;
		}
		
		
		/*
		 * - Position constraining -
		 * Here we prepare position constraining like grid and containment.
		 */	
		
		if(o.containment) {
			if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
			if(o.containment == 'document' || o.containment == 'window') this.containment = [
				0 - this.offset.relative.left - this.offset.parent.left,
				0 - this.offset.relative.top - this.offset.parent.top,
				$(o.containment == 'document' ? document : window).width() - this.offset.relative.left - this.offset.parent.left - this.helperProportions.width - this.margins.left - (parseInt(this.element.css("marginRight"),10) || 0),
				($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.offset.relative.top - this.offset.parent.top - this.helperProportions.height - this.margins.top - (parseInt(this.element.css("marginBottom"),10) || 0)
			];
			
			if(!(/^(document|window|parent)$/).test(o.containment)) {
				var ce = $(o.containment)[0];
				var co = $(o.containment).offset();
				
				this.containment = [
					co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) - this.offset.relative.left - this.offset.parent.left,
					co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) - this.offset.relative.top - this.offset.parent.top,
					co.left+Math.max(ce.scrollWidth,ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - this.offset.relative.left - this.offset.parent.left - this.helperProportions.width - this.margins.left - (parseInt(this.element.css("marginRight"),10) || 0),
					co.top+Math.max(ce.scrollHeight,ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - this.offset.relative.top - this.offset.parent.top - this.helperProportions.height - this.margins.top - (parseInt(this.element.css("marginBottom"),10) || 0)
				];
			}
		}
		
		//Call plugins and callbacks
		this.propagate("start", e);
		
		this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() };//Recache the helper size
		if ($.ui.ddmanager && !o.dropBehaviour) $.ui.ddmanager.prepareOffsets(this, e);
		
		this.helper.addClass("ui-draggable-dragging");
		this.mouseDrag(e); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;
	},
	convertPositionTo: function(d, pos) {
		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		return {
			top: (
				pos.top																	// the calculated relative position
				+ this.offset.relative.top	* mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- (this.cssPosition == "fixed" || (this.cssPosition == "absolute" && this.offsetParent[0] == document.body) ? 0 : this.offsetParent[0].scrollTop) * mod	// The offsetParent's scroll position, not if the element is fixed
				+ (this.cssPosition == "fixed" ? $(document).scrollTop() : 0) * mod
				+ this.margins.top * mod												//Add the margin (you don't want the margin counting in intersection methods)
			),
			left: (
				pos.left																// the calculated relative position
				+ this.offset.relative.left	* mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- (this.cssPosition == "fixed" || (this.cssPosition == "absolute" && this.offsetParent[0] == document.body) ? 0 : this.offsetParent[0].scrollLeft) * mod	// The offsetParent's scroll position, not if the element is fixed
				+ (this.cssPosition == "fixed" ? $(document).scrollLeft() : 0) * mod
				+ this.margins.left * mod												//Add the margin (you don't want the margin counting in intersection methods)
			)
		};
	},
	generatePosition: function(e) {
		
		var o = this.options;
		var position = {
			top: (
				e.pageY																	// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ (this.cssPosition == "fixed" || (this.cssPosition == "absolute" && this.offsetParent[0] == document.body) ? 0 : this.offsetParent[0].scrollTop)	// The offsetParent's scroll position, not if the element is fixed
				- (this.cssPosition == "fixed" ? $(document).scrollTop() : 0)
			),
			left: (
				e.pageX																	// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ (this.cssPosition == "fixed" || (this.cssPosition == "absolute" && this.offsetParent[0] == document.body) ? 0 : this.offsetParent[0].scrollLeft)	// The offsetParent's scroll position, not if the element is fixed
				- (this.cssPosition == "fixed" ? $(document).scrollLeft() : 0)
			)
		};
		
		if(!this.originalPosition) return position;										//If we are not dragging yet, we won't check for options
		
		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */
		if(this.containment) {
			if(position.left < this.containment[0]) position.left = this.containment[0];
			if(position.top < this.containment[1]) position.top = this.containment[1];
			if(position.left > this.containment[2]) position.left = this.containment[2];
			if(position.top > this.containment[3]) position.top = this.containment[3];
		}
		
		if(o.grid) {
			var top = this.originalPosition.top + Math.round((position.top - this.originalPosition.top) / o.grid[1]) * o.grid[1];
			position.top = this.containment ? (!(top < this.containment[1] || top > this.containment[3]) ? top : (!(top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
			
			var left = this.originalPosition.left + Math.round((position.left - this.originalPosition.left) / o.grid[0]) * o.grid[0];
			position.left = this.containment ? (!(left < this.containment[0] || left > this.containment[2]) ? left : (!(left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
		}
		
		return position;
	},
	mouseDrag: function(e) {
		
		//Compute the helpers position
		this.position = this.generatePosition(e);
		this.positionAbs = this.convertPositionTo("absolute");
		
		//Call plugins and callbacks and use the resulting position if something is returned		
		this.position = this.propagate("drag", e) || this.position;
		
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, e);
		
		return false;
	},
	mouseStop: function(e) {
		
		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, e);
			
		if(this.options.revert) {
			var self = this;
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revert, 10) || 500, function() {
				self.propagate("stop", e);
				self.clear();
			});
		} else {
			this.propagate("stop", e);
			this.clear();
		}
		
		return false;
	},
	clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.options.helper != 'original' && !this.cancelHelperRemoval) this.helper.remove();
		//if($.ui.ddmanager) $.ui.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},
	
	// From now on bulk stuff - mainly helpers
	plugins: {},
	uiHash: function(e) {
		return {
			helper: this.helper,
			position: this.position,
			absolutePosition: this.positionAbs,
			options: this.options			
		};
	},
	propagate: function(n,e) {
		$.ui.plugin.call(this, n, [e, this.uiHash()]);
		return this.element.triggerHandler(n == "drag" ? n : "drag"+n, [e, this.uiHash()], this.options[n]);
	},
	destroy: function() {
		if(!this.element.data('draggable')) return;
		this.element.removeData("draggable").unbind(".draggable").removeClass('ui-draggable');
		this.mouseDestroy();
	}
}));

$.extend($.ui.draggable, {
	defaults: {
		appendTo: "parent",
		axis: false,
		cancel: ":input",
		delay: 0,
		distance: 1,
		helper: "original"
	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function(e, ui) {
		var t = $('body');
		if (t.css("cursor")) ui.options._cursor = t.css("cursor");
		t.css("cursor", ui.options.cursor);
	},
	stop: function(e, ui) {
		if (ui.options._cursor) $('body').css("cursor", ui.options._cursor);
	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(e, ui) {
		var t = $(ui.helper);
		if(t.css("zIndex")) ui.options._zIndex = t.css("zIndex");
		t.css('zIndex', ui.options.zIndex);
	},
	stop: function(e, ui) {
		if(ui.options._zIndex) $(ui.helper).css('zIndex', ui.options._zIndex);
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(e, ui) {
		var t = $(ui.helper);
		if(t.css("opacity")) ui.options._opacity = t.css("opacity");
		t.css('opacity', ui.options.opacity);
	},
	stop: function(e, ui) {
		if(ui.options._opacity) $(ui.helper).css('opacity', ui.options._opacity);
	}
});

$.ui.plugin.add("draggable", "iframeFix", {
	start: function(e, ui) {
		$(ui.options.iframeFix === true ? "iframe" : ui.options.iframeFix).each(function() {					
			$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});
	},
	stop: function(e, ui) {
		$("div.DragDropIframeFix").each(function() { this.parentNode.removeChild(this); }); //Remove frame helpers	
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function(e, ui) {
		var o = ui.options;
		var i = $(this).data("draggable");
		o.scrollSensitivity	= o.scrollSensitivity || 20;
		o.scrollSpeed		= o.scrollSpeed || 20;
		
		i.overflowY = function(el) {
			do { if(/auto|scroll/.test(el.css('overflow')) || (/auto|scroll/).test(el.css('overflow-y'))) return el; el = el.parent(); } while (el[0].parentNode);
			return $(document);
		}(this);
		i.overflowX = function(el) {
			do { if(/auto|scroll/.test(el.css('overflow')) || (/auto|scroll/).test(el.css('overflow-x'))) return el; el = el.parent(); } while (el[0].parentNode);
			return $(document);
		}(this);
		
		if(i.overflowY[0] != document && i.overflowY[0].tagName != 'HTML') i.overflowYOffset = i.overflowY.offset();
		if(i.overflowX[0] != document && i.overflowX[0].tagName != 'HTML') i.overflowXOffset = i.overflowX.offset();
		
	},
	drag: function(e, ui) {
		
		var o = ui.options;
		var i = $(this).data("draggable");
		
		if(i.overflowY[0] != document && i.overflowY[0].tagName != 'HTML') {
			if((i.overflowYOffset.top + i.overflowY[0].offsetHeight) - e.pageY < o.scrollSensitivity)
				i.overflowY[0].scrollTop = i.overflowY[0].scrollTop + o.scrollSpeed;
			if(e.pageY - i.overflowYOffset.top < o.scrollSensitivity)
				i.overflowY[0].scrollTop = i.overflowY[0].scrollTop - o.scrollSpeed;
							
		} else {
			if(e.pageY - $(document).scrollTop() < o.scrollSensitivity)
				$(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
			if($(window).height() - (e.pageY - $(document).scrollTop()) < o.scrollSensitivity)
				$(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
		}
		
		if(i.overflowX[0] != document && i.overflowX[0].tagName != 'HTML') {
			if((i.overflowXOffset.left + i.overflowX[0].offsetWidth) - e.pageX < o.scrollSensitivity)
				i.overflowX[0].scrollLeft = i.overflowX[0].scrollLeft + o.scrollSpeed;
			if(e.pageX - i.overflowXOffset.left < o.scrollSensitivity)
				i.overflowX[0].scrollLeft = i.overflowX[0].scrollLeft - o.scrollSpeed;
		} else {
			if(e.pageX - $(document).scrollLeft() < o.scrollSensitivity)
				$(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
			if($(window).width() - (e.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
				$(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
		}
		
	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function(e, ui) {
		
		var inst = $(this).data("draggable");
		inst.snapElements = [];
		$(ui.options.snap === true ? '.ui-draggable' : ui.options.snap).each(function() {
			var $t = $(this); var $o = $t.offset();
			if(this != inst.element[0]) inst.snapElements.push({
				item: this,
				width: $t.outerWidth(), height: $t.outerHeight(),
				top: $o.top, left: $o.left
			});
		});
		
	},
	drag: function(e, ui) {
		
		var inst = $(this).data("draggable");
		var d = ui.options.snapTolerance || 20;
		var x1 = ui.absolutePosition.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.absolutePosition.top, y2 = y1 + inst.helperProportions.height;
		
		for (var i = inst.snapElements.length - 1; i >= 0; i--){
			
			var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width, 
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;
			
			//Yes, I know, this is insane ;)
			if(!((l-d < x1 && x1 < r+d && t-d < y1 && y1 < b+d) || (l-d < x1 && x1 < r+d && t-d < y2 && y2 < b+d) || (l-d < x2 && x2 < r+d && t-d < y1 && y1 < b+d) || (l-d < x2 && x2 < r+d && t-d < y2 && y2 < b+d))) continue;
			
			if(ui.options.snapMode != 'inner') {
				var ts = Math.abs(t - y2) <= 20;
				var bs = Math.abs(b - y1) <= 20;
				var ls = Math.abs(l - x2) <= 20;
				var rs = Math.abs(r - x1) <= 20;
				if(ts) ui.position.top = inst.convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top;
				if(bs) ui.position.top = inst.convertPositionTo("relative", { top: b, left: 0 }).top;
				if(ls) ui.position.left = inst.convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left;
				if(rs) ui.position.left = inst.convertPositionTo("relative", { top: 0, left: r }).left;
			}
			
			if(ui.options.snapMode != 'outer') {
				var ts = Math.abs(t - y1) <= 20;
				var bs = Math.abs(b - y2) <= 20;
				var ls = Math.abs(l - x1) <= 20;
				var rs = Math.abs(r - x2) <= 20;
				if(ts) ui.position.top = inst.convertPositionTo("relative", { top: t, left: 0 }).top;
				if(bs) ui.position.top = inst.convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top;
				if(ls) ui.position.left = inst.convertPositionTo("relative", { top: 0, left: l }).left;
				if(rs) ui.position.left = inst.convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left;
			}
			
		};
	}
});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(e,ui) {
	
		var inst = $(this).data("draggable");
		inst.sortables = [];
		$(ui.options.connectToSortable).each(function() {
			if($.data(this, 'sortable')) {
				var sortable = $.data(this, 'sortable');
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshItems();	//Do a one-time refresh at start to refresh the containerCache	
				sortable.propagate("activate", e, inst);
			}
		});

	},
	stop: function(e,ui) {
		
		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("draggable");
		
		$.each(inst.sortables, function() {
			if(this.instance.isOver) {
				this.instance.isOver = 0;
				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)
				if(this.shouldRevert) this.instance.options.revert = true; //revert here
				this.instance.mouseStop(e);
				
				//Also propagate receive event, since the sortable is actually receiving a element
				this.instance.element.triggerHandler("sortreceive", [e, $.extend(this.instance.ui(), { sender: inst.element })], this.instance.options["receive"]);

				this.instance.options.helper = this.instance.options._helper;
			} else {
				this.instance.propagate("deactivate", e, inst);
			}

		});
		
	},
	drag: function(e,ui) {

		var inst = $(this).data("draggable"), self = this;
		
		var checkPos = function(o) {
				
			var l = o.left, r = l + o.width,
				t = o.top, b = t + o.height;

			return (l < (this.positionAbs.left + this.offset.click.left) && (this.positionAbs.left + this.offset.click.left) < r
					&& t < (this.positionAbs.top + this.offset.click.top) && (this.positionAbs.top + this.offset.click.top) < b);				
		};
		
		$.each(inst.sortables, function(i) {

			if(checkPos.call(inst, this.instance.containerCache)) {

				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {
					this.instance.isOver = 1;

					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(self).clone().appendTo(this.instance.element).data("sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };
				
					e.target = this.instance.currentItem[0];
					this.instance.mouseCapture(e, true);
					this.instance.mouseStart(e, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;
					
					inst.propagate("toSortable", e);
				
				}
				
				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) this.instance.mouseDrag(e);
				
			} else {
				
				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {
					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;
					this.instance.options.revert = false; //No revert here
					this.instance.mouseStop(e, true);
					this.instance.options.helper = this.instance.options._helper;
					
					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) this.instance.placeholder.remove();
					
					inst.propagate("fromSortable", e);
				}
				
			};

		});

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function(e,ui) {
		var group = $.makeArray($(ui.options.stack.group)).sort(function(a,b) {
			return (parseInt($(a).css("zIndex"),10) || ui.options.stack.min) - (parseInt($(b).css("zIndex"),10) || ui.options.stack.min);
		});
		
		$(group).each(function(i) {
			this.style.zIndex = ui.options.stack.min + i;
		});
		
		this[0].style.zIndex = ui.options.stack.min + group.length;
	}
});

})(jQuery);
/*
 * jQuery UI Droppable
 *
 * Copyright (c) 2008 Paul Bakaus
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	ui.core.js
 *	ui.draggable.js
 */
(function($) {

$.widget("ui.droppable", {
	init: function() {

		this.element.addClass("ui-droppable");
		this.isover = 0; this.isout = 1;
		
		//Prepare the passed options
		var o = this.options, accept = o.accept;
		o = $.extend(o, {
			accept: o.accept && o.accept.constructor == Function ? o.accept : function(d) {
				return $(d).is(accept);
			}
		});
		
		//Store the droppable's proportions
		this.proportions = { width: this.element.outerWidth(), height: this.element.outerHeight() };
		
		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables.push(this);
		
	},
	plugins: {},
	ui: function(c) {
		return {
			draggable: (c.currentItem || c.element),
			helper: c.helper,
			position: c.position,
			absolutePosition: c.positionAbs,
			options: this.options,
			element: this.element
		};
	},
	destroy: function() {
		var drop = $.ui.ddmanager.droppables;
		for ( var i = 0; i < drop.length; i++ )
			if ( drop[i] == this )
				drop.splice(i, 1);
		
		this.element
			.removeClass("ui-droppable ui-droppable-disabled")
			.removeData("droppable")
			.unbind(".droppable");
	},
	over: function(e) {
		
		var draggable = $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element
		
		if (this.options.accept.call(this.element,(draggable.currentItem || draggable.element))) {
			$.ui.plugin.call(this, 'over', [e, this.ui(draggable)]);
			this.element.triggerHandler("dropover", [e, this.ui(draggable)], this.options.over);
		}
		
	},
	out: function(e) {
		
		var draggable = $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element
		
		if (this.options.accept.call(this.element,(draggable.currentItem || draggable.element))) {
			$.ui.plugin.call(this, 'out', [e, this.ui(draggable)]);
			this.element.triggerHandler("dropout", [e, this.ui(draggable)], this.options.out);
		}
		
	},
	drop: function(e,custom) {
		
		var draggable = custom || $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return false; // Bail if draggable and droppable are same element
		
		var childrenIntersection = false;
		this.element.find(".ui-droppable").not(".ui-draggable-dragging").each(function() {
			var inst = $.data(this, 'droppable');
			if(inst.options.greedy && $.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)) {
				childrenIntersection = true; return false;
			}
		});
		if(childrenIntersection) return false;
		
		if(this.options.accept.call(this.element,(draggable.currentItem || draggable.element))) {
			$.ui.plugin.call(this, 'drop', [e, this.ui(draggable)]);
			this.element.triggerHandler("drop", [e, this.ui(draggable)], this.options.drop);
			return true;
		}
		
		return false;
		
	},
	activate: function(e) {
		
		var draggable = $.ui.ddmanager.current;
		$.ui.plugin.call(this, 'activate', [e, this.ui(draggable)]);
		if(draggable) this.element.triggerHandler("dropactivate", [e, this.ui(draggable)], this.options.activate);
		
	},
	deactivate: function(e) {
		
		var draggable = $.ui.ddmanager.current;
		$.ui.plugin.call(this, 'deactivate', [e, this.ui(draggable)]);
		if(draggable) this.element.triggerHandler("dropdeactivate", [e, this.ui(draggable)], this.options.deactivate);
		
	}
});

$.extend($.ui.droppable, {
	defaults: {
		disabled: false,
		tolerance: 'intersect'
	}
});

$.ui.intersect = function(draggable, droppable, toleranceMode) {
	
	if (!droppable.offset) return false;
	
	var x1 = (draggable.positionAbs || draggable.position.absolute).left, x2 = x1 + draggable.helperProportions.width,
		y1 = (draggable.positionAbs || draggable.position.absolute).top, y2 = y1 + draggable.helperProportions.height;
	var l = droppable.offset.left, r = l + droppable.proportions.width,
		t = droppable.offset.top, b = t + droppable.proportions.height;
	
	switch (toleranceMode) {
		case 'fit':
			return (l < x1 && x2 < r
				&& t < y1 && y2 < b);
			break;
		case 'intersect':
			return (l < x1 + (draggable.helperProportions.width / 2) // Right Half
				&& x2 - (draggable.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (draggable.helperProportions.height / 2) // Bottom Half
				&& y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
			break;
		case 'pointer':
			return (l < ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left) && ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left) < r
				&& t < ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top) && ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top) < b);
			break;
		case 'touch':
			return (
					(y1 >= t && y1 <= b) ||	// Top edge touching
					(y2 >= t && y2 <= b) ||	// Bottom edge touching
					(y1 < t && y2 > b)		// Surrounded vertically
				) && (
					(x1 >= l && x1 <= r) ||	// Left edge touching
					(x2 >= l && x2 <= r) ||	// Right edge touching
					(x1 < l && x2 > r)		// Surrounded horizontally
				);
			break;
		default:
			return false;
			break;
		}
	
};

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: [],
	prepareOffsets: function(t, e) {
		
		var m = $.ui.ddmanager.droppables;
		var type = e ? e.type : null; // workaround for #2317
		for (var i = 0; i < m.length; i++) {
			
			if(m[i].options.disabled || (t && !m[i].options.accept.call(m[i].element,(t.currentItem || t.element)))) continue;
			m[i].visible = m[i].element.is(":visible"); if(!m[i].visible) continue; //If the element is not visible, continue
			m[i].offset = m[i].element.offset();
			m[i].proportions = { width: m[i].element.outerWidth(), height: m[i].element.outerHeight() };
			
			if(type == "dragstart" || type == "sortactivate") m[i].activate.call(m[i], e); //Activate the droppable if used directly from draggables
		}
		
	},
	drop: function(draggable, e) {
		
		var dropped = false;
		$.each($.ui.ddmanager.droppables, function() {
			
			if(!this.options) return;
			if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance))
				dropped = this.drop.call(this, e);
			
			if (!this.options.disabled && this.visible && this.options.accept.call(this.element,(draggable.currentItem || draggable.element))) {
				this.isout = 1; this.isover = 0;
				this.deactivate.call(this, e);
			}
			
		});
		return dropped;
		
	},
	drag: function(draggable, e) {
		
		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) $.ui.ddmanager.prepareOffsets(draggable, e);
		
		//Run through all droppables and check their positions based on specific tolerance options
		$.each($.ui.ddmanager.droppables, function() {
			
			if(this.options.disabled || this.greedyChild || !this.visible) return;
			var intersects = $.ui.intersect(draggable, this, this.options.tolerance);
			
			var c = !intersects && this.isover == 1 ? 'isout' : (intersects && this.isover == 0 ? 'isover' : null);
			if(!c) return;
			
			var parentInstance;
			if (this.options.greedy) {
				var parent = this.element.parents('.ui-droppable:eq(0)');
				if (parent.length) {
					parentInstance = $.data(parent[0], 'droppable');
					parentInstance.greedyChild = (c == 'isover' ? 1 : 0);
				}
			}
			
			// we just moved into a greedy child
			if (parentInstance && c == 'isover') {
				parentInstance['isover'] = 0;
				parentInstance['isout'] = 1;
				parentInstance.out.call(parentInstance, e);
			}
			
			this[c] = 1; this[c == 'isout' ? 'isover' : 'isout'] = 0;
			this[c == "isover" ? "over" : "out"].call(this, e);
			
			// we just moved out of a greedy child
			if (parentInstance && c == 'isout') {
				parentInstance['isout'] = 0;
				parentInstance['isover'] = 1;
				parentInstance.over.call(parentInstance, e);
			}
		});
		
	}
};

/*
 * Droppable Extensions
 */

$.ui.plugin.add("droppable", "activeClass", {
	activate: function(e, ui) {
		$(this).addClass(ui.options.activeClass);
	},
	deactivate: function(e, ui) {
		$(this).removeClass(ui.options.activeClass);
	},
	drop: function(e, ui) {
		$(this).removeClass(ui.options.activeClass);
	}
});

$.ui.plugin.add("droppable", "hoverClass", {
	over: function(e, ui) {
		$(this).addClass(ui.options.hoverClass);
	},
	out: function(e, ui) {
		$(this).removeClass(ui.options.hoverClass);
	},
	drop: function(e, ui) {
		$(this).removeClass(ui.options.hoverClass);
	}
});

})(jQuery);
/*
Copyright 2007-2008 University of Cambridge
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/

var fluid = fluid || {};

(function (jQuery, fluid) {
    fluid.keys = {
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        META: 19,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        i: 73,
        j: 74,
        k: 75,
        m: 77
    };
    
    /**
     * These roles are used to add ARIA roles to orderable items. This list can be extended as needed,
     * but the values of the container and item roles must match ARIA-specified roles.
     */  
    fluid.roles = {
        GRID: { container: "grid", item: "gridcell" },
        LIST: { container: "list", item: "listitem" },
        REGIONS: { container: "main", item: "article" }
    };
    
    fluid.orientation = {
        HORIZONTAL: "horiz",
        VERTICAL: "vert"
    };
    
    /**
     * This is the position, relative to a given drop target, that a dragged item should be dropped.
     */
    fluid.position = {
        BEFORE: 0, 
        AFTER: 1,
        INSIDE: 2,
        USE_LAST_KNOWN: 3,  // given configuration meaningless, use last known drop target
        DISALLOWED: -1      // cannot drop in given configuration
    };
    
    /**
     * For incrementing/decrementing a count or index.
     */
    fluid.direction = {
        NEXT: 1,
        PREVIOUS: -1
    };
    
    fluid.defaultKeysets = [{
        modifier : function (evt) {
            return evt.ctrlKey;
        },
        up : fluid.keys.UP,
        down : fluid.keys.DOWN,
        right : fluid.keys.RIGHT,
        left : fluid.keys.LEFT
    },
    {
        modifier : function (evt) {
            return evt.ctrlKey;
        },
        up : fluid.keys.i,
        down : fluid.keys.m,
        right : fluid.keys.k,
        left : fluid.keys.j
    }];
    
    fluid.wrap = function (obj) {
        return ((!obj || obj.jquery) ? obj : jQuery(obj)); 
    };
    
    fluid.unwrap = function (obj) {
        return obj.jquery ? obj[0] : obj; // Unwrap the element if it's a jQuery.
    };
    
    /**
     * Fetches a single container element and returns it as a jQuery.
     * 
     * @param {String||jQuery||element} an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @return a single-element jQuery of container
     */
    fluid.container = function (container) {
        if (typeof container === "string" || 
          container.nodeType && (container.nodeType === 1  || container.nodeType === 9)) {
            container = jQuery(container);
        }
        
        // Throw an exception if we've got more or less than one element.
        if (!container || !container.jquery || container.length !== 1) {
            fluid.fail({
                name: "NotOne",
                message: "A single container element was not found."
            });
        }
        
        return container;
    };
    
    /**
     * Retreives and stores a component's default settings centrally.
     * 
     * @param {String} componentName the name of the component
     * @param {Object} (optional) an container of key/value pairs to set
     * 
     */
    var defaultsStore = {};
    fluid.defaults = function (componentName, defaultsObject) {
        if (arguments.length > 1) {
            defaultsStore[componentName] = defaultsObject;   
            return defaultsObject;
        }
        
        return defaultsStore[componentName];
    };
    
    fluid.dumpEl = function (element) {
        if (!element) {
            return "null";
        }
        element = jQuery(element);
        var togo = element.get(0).tagName;
        if (element.attr("id")) {
            togo += "#" + element.attr("id");
        }
        if (element.attr("class")) {
            togo += "." + element.attr("class");
        }
        return togo;
    };
    
    fluid.fail = function (message) {
        fluid.utils.setLogging(true);
        fluid.utils.debug(message.message? message.message : message);
        message.fail(); // Intentionally cause a browser error by invoking a nonexistent function.
    };
    
    function getNextNode(iterator) {
        if (iterator.node.firstChild) {
            iterator.node = iterator.node.firstChild;
            iterator.depth += 1;
            return iterator;
        }
        while (iterator.node) {
            if (iterator.node.nextSibling) {
                iterator.node = iterator.node.nextSibling;
                return iterator;
            }
            iterator.node = iterator.node.parentNode;
            iterator.depth -= 1;
        }
        return iterator;
    }
    
    // Work around IE circular DOM issue. This is the default max DOM depth on IE.
    // http://msdn2.microsoft.com/en-us/library/ms761392(VS.85).aspx
    fluid.DOM_BAIL_DEPTH = 256;
    
    fluid.iterateDom = function (node, acceptor) {
        var currentNode = {node: node, depth: 0};
        while (currentNode.node !== null && currentNode.depth >= 0 && currentNode.depth < fluid.DOM_BAIL_DEPTH) {
            if (currentNode.nodeType === 1) {
                acceptor(currentNode.node, currentNode.depth);
            }
            currentNode = getNextNode(currentNode);
        }
    };
    
    fluid.createDomBinder = function (container, selectors) {
        var cache = {}, that = {};
        
        function cacheKey(name, thisContainer) {
            return jQuery.data(fluid.unwrap(thisContainer)) + "-" + name;
        }

        function record(name, thisContainer, result) {
            cache[cacheKey(name, thisContainer)] = result;
        }

        that.locate = function (name, localContainer) {
            var selector, thisContainer, togo;
            
            selector = selectors[name];
            thisContainer = localContainer? localContainer: container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }

            if (!selector) {
                return thisContainer;
            }

            if (typeof(selector) === "function") {
                togo = jQuery(selector.call(null, fluid.unwrap(thisContainer)));
            } else {
                togo = jQuery(selector, thisContainer);
            }
            if (togo.get(0) === document) {
                togo = [];
                //fluid.fail("Selector " + name + " with value " + selectors[name] +
                //            " did not find any elements with container " + fluid.dumpEl(container));
            }
            record(name, thisContainer, togo);
            return togo;
        };
        that.fastLocate = function (name, localContainer) {
            var thisContainer = localContainer? localContainer: container;
            var key = cacheKey(name, thisContainer);
            var togo = cache[key];
            return togo? togo : that.locate(name, localContainer);
        };
        that.clear = function () {
            cache = {};
        };
        that.refresh = function (names, localContainer) {
            if (typeof names === "string") {
                names = [names];
            }
            if (! (localContainer instanceof Array)) {
                localContainer = [localContainer];
            }
            for (var i = 0; i < names.length; ++ i) {
                for (var j = 0; j < localContainer.length; ++ j) {
                    that.locate(names[i], localContainer[j]);
                }
            }
        };
        
        return that;
    };
    
    /**
     * Merges the component's declared defaults, as obtained from fluid.defaults(),
     * with the user's specified overrides.
     * 
     * @param {Object} that the instance to attach the options to
     * @param {String} componentName the unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {Object} userOptions the user-specified configuration options for this component
     */
    fluid.mergeComponentOptions = function (that, componentName, userOptions) {
        var defaults = fluid.defaults(componentName); 
        that.options = fluid.utils.merge(defaults? defaults.mergePolicy: null, {}, defaults, userOptions);    
    };
    
    /** 
     * The central initialisation method called as the first act of every 
     * Fluid view. This function automatically merges user options with defaults
     * and attaches a DOM Binder to the instance.
     * 
     * @param {String} componentName The unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {jQueryable} container A specifier for the single root "container node" in the
     * DOM which will house all the markup for this component.
     * @param {Object} userOptions The configuration options for this component.
     */
    fluid.initView = function (componentName, container, userOptions) {
        var that = {};
        fluid.mergeComponentOptions(that, componentName, userOptions);
        
        if (container) {
            that.container = fluid.container(container);
            fluid.initDomBinder(that);
        }

        return that;
    };
    
    fluid.initDomBinder = function (that) {
        that.dom = fluid.createDomBinder(that.container, that.options.selectors);
        that.locate = that.dom.locate;      
    };
    
    fluid.initDecorators = function (that) {
        var decorators = that.options.componentDecorators;
        if (!decorators) {
            return;
        }
      
        if (typeof(decorators) === 'string') {
            decorators = [decorators];
        }
        for (var i = 0; i < decorators.length; i += 1) {
            var decoratorName = decorators[i];
            fluid.utils.invokeGlobalFunction(decoratorName, [that, that.options[decoratorName]]);
        }
    };
    
    var fluid_guid = 1;
    
    // A hash of (jQuery data id) elements to "true" indicating whether the corresponding
    // DOM element is the source of an event for the current cycle.
    var fluid_sourceElements = {};
    
    fluid.event = {};
    
    fluid.event.getEventFirer = function () {
        var log = fluid.utils.debug;
        var listeners = {};
        return {
            addListener: function (listener, namespace, exclusions) {
                if (!namespace) {
                    if (!listener.$$guid) {
                        listener.$$guid = fluid_guid += 1;
                    }
                    namespace = listener.$$guid;
                }

                var excludeids = [];
                if (exclusions) {
                    for (var i in exclusions) {
                        excludeids.push(jQuery.data(exclusions[i]));
                    }
                }
                listeners[namespace] = {listener: listener, exclusions: excludeids};
            },

            removeListener: function (listener) {
                if (typeof(listener) === 'string') {
                    delete listeners[listener];
                }
                else if (typeof(listener) === 'object' && listener.$$guid) {
                    delete listeners[listener.$$guid];
                }
            },
        
            fireEvent: function () {
                for (var i in listeners) {
                    var lisrec = listeners[i];
                    var excluded = false;
                    for (var j in lisrec.exclusions) {
                        var exclusion = lisrec.exclusions[j];
                        log("Checking exclusion for " + exclusion);
                        if (fluid_sourceElements[exclusion]) {
                            log("Excluded");
                            excluded = true;
                            break;
                        }
                    }
                    if (!excluded) {
                        try {
                            log("Firing to listener " + i + " with arguments " + arguments);
                            lisrec.listener.apply(null, arguments);
                        }
                        catch (e) {
                            log("FireEvent received exception " + e.message + " e " + e + " firing to listener " + i);
                            throw (e);       
                        }
                    }
                }
            }
        };
    };
    
    fluid.model = {};
    
   
    /** Copy a source "model" onto a target **/
    fluid.model.copyModel = function copyModel(target, source) {
        fluid.utils.clear(target);
        jQuery.extend(true, target, source);
    };
    
    fluid.model.parseEL = function (EL) {
        return EL.split('.');
    };
  
    /** This function implements the RSF "DARApplier" **/
    fluid.model.setBeanValue = function (root, EL, newValue) {
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length - 1; i += 1) {
            if (!root[segs[i]]) {
                root[segs[i]] = {};
            }
            root = root[segs[i]];
        }
        root[segs[segs.length - 1]] = newValue;
    };
      
    fluid.model.getBeanValue = function (root, EL) {
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length; i += 1) {
            root = root[segs[i]];
            if (!root) {
                return root;
            }
        }
        return root;
    };
      
    /*
     * Utilities object for providing various general convenience functions
     */
    fluid.utils = {};
    
    /** Returns the absolute position of a supplied DOM node in pixels.
     * Implementation taken from quirksmode http://www.quirksmode.org/js/findpos.html
     */
    fluid.utils.computeAbsolutePosition = function (element) {
        var curleft = 0, curtop = 0;
	    if (element.offsetParent) {
	        do {
	            curleft += element.offsetLeft;
	            curtop += element.offsetTop;
	        } while (element = element.offsetParent);
	        return [curleft, curtop];
	    }
	};
    
    fluid.utils.computeDomDepth = function (element) {
        var depth = 0;
        while (element) {
            element = element.parentNode;
            depth += 1;
        }
        return depth;
    };
    
    /**
     * Useful for drag-and-drop during a drag:  is the mouse over the "before" half
     * of the droppable?  In the case of a vertically oriented set of orderables,
     * "before" means "above".  For a horizontally oriented set, "before" means
     * "left of".
     */
    fluid.utils.mousePosition = function (droppableEl, orientation, x, y) {        
        var mid;
        var isBefore;
        if (orientation === fluid.orientation.VERTICAL) {
            mid = jQuery(droppableEl).offset().top + (droppableEl.offsetHeight / 2);
            isBefore = y < mid;
        } else {
            mid = jQuery(droppableEl).offset().left + (droppableEl.offsetWidth / 2);
            isBefore = x < mid;
        }
        
        return (isBefore ? fluid.position.BEFORE : fluid.position.AFTER);
    };  
    
    // Custom query method seeks all tags descended from a given root with a 
    // particular tag name, whose id matches a regex. The Dojo query parser
    // is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
    // it might do anyway, and this will be plenty fast.
    fluid.utils.seekNodesById = function (rootnode, tagname, idmatch) {
        var inputs = rootnode.getElementsByTagName(tagname);
        var togo = [];
        for (var i = 0; i < inputs.length; i += 1) {
            var input = inputs[i];
            var id = input.id;
            if (id && id.match(idmatch)) {
                togo.push(input);
            }
        }
        return togo;
    };
          
    fluid.utils.escapeSelector = function (id) {
        return id.replace(/\:/g, "\\:");
    };
      
    fluid.utils.findForm = function (element) {
        while (element) {
            if (element.nodeName.toLowerCase() === "form") {
                return element;
            }
            element = element.parentNode;
        }
    };
    
    /** 
     * Clears an object or array of its contents. For objects, each property is deleted.
     * 
     * @param {Object|Array} target the thing to clear
     */
    fluid.utils.clear = function (target) {
        if (target instanceof Array) {
            target.length = 0;
        }
        else {
            for (var i in target) {
                delete target[i];
            }
        }
    };
    
    function mergeImpl(policy, basePath, target, source) {
        var thisPolicy = policy? policy[basePath] : policy;
        if (typeof(thisPolicy) === "function") {
            thisPolicy.apply(null, target, source);
            return target;
        }
        if (thisPolicy === "replace") {
            fluid.utils.clear(target);
        }
      
        for (var name in source) {
            var path = (basePath? basePath + ".": "") + name;
            var thisTarget = target[name];
            var thisSource = source[name];
    
            if (thisSource !== undefined) {
                if (thisSource !== null && typeof(thisSource) === 'object') {
                    if (!thisTarget) {
                        target[name] = thisTarget = thisSource instanceof Array? [] : {};
                    }
                    mergeImpl(policy, path, thisTarget, thisSource);
                }
                else {
                    target[name] = thisSource;
                }
            }
        }
        return target;    
    }
    
    fluid.utils.permute = function () {
      
    };
    
    fluid.utils.merge = function (policy, target) {
        var path = "";
        
        for (var i = 2; i < arguments.length; i += 1) {
            var source = arguments[i];
            mergeImpl(policy, path, target, source);
        }
        if (policy) {
            for (var key in policy) {
                var elrh = policy[key];
                if (typeof(elrh) === 'string' && elrh !== "replace") {
                    var oldValue = fluid.model.getBeanValue(target, key);
                    if (oldValue === null || oldValue === undefined) {
                        var value = fluid.model.getBeanValue(target, elrh);
                        fluid.model.setBeanValue(target, key, value);
                    }
                }
            }
        }
        return target;     
    };
    
    fluid.utils.invokeGlobalFunction = function (functionPath, args) {
        return fluid.model.getBeanValue(window, functionPath).apply(null, args);
    };
    
    /**
     * Returns a jQuery object given the id of a DOM node
     */
    fluid.utils.jById = function (id) {
        var el = jQuery("[id=" + id + "]");
        if (el[0] && el[0].id === id) {
            return el;        
        }       
        
        return null;
    };

    var fluid_logging = false;

    fluid.utils.debug = function (str) {
        if (fluid_logging) {
            str = new Date().toTimeString() + ":  " + str;
            if (typeof(console) !== "undefined") {
                if (console.debug) {
                    console.debug(str);
                } else {
                    console.log(str);
                }
            }
            else if (typeof(YAHOO) !== "undefined") {
                YAHOO.log(str);
            }
            else if (typeof(opera) !== "undefined") {
                opera.postError(str);
            }
        }
    };
    
    fluid.log = fluid.utils.debug;
    
     /** method to allow user to enable logging (off by default) */
    fluid.utils.setLogging = function (enabled) {
        if (typeof enabled === "boolean") {
            fluid_logging = enabled;
        } else {
            fluid_logging = false;
        }
    };
    

    fluid.utils.derivePercent = function (num, total) {
        return Math.round((num * 100) / total);
    };
    
    /**
     * Simple string template system. 
     * Takes a template string containing tokens in the form of "%value".
     * Returns a new string with the tokens replaced by the specified values.
     * Keys and values can be of any data type that can be coerced into a string. Arrays will work here as well.
     * 
     * @param {String}    template    a string (can be HTML) that contains tokens embedded into it
     * @param {object}    values        a collection of token keys and values
     */
    fluid.utils.stringTemplate = function (template, values) {
        var newString = template;
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var searchStr = "%" + key;
                newString = newString.replace(searchStr, values[key]);
            }
        }
        return newString;
    };

    /**
     * Finds the ancestor of the element that passes the test
     * @param {Element} element DOM element
     * @param {Function} test A function which takes an element as a parameter and return true or false for some test
     */
    fluid.utils.findAncestor = function (element, test) {
        return test(element) ? element : jQuery.grep(jQuery(element).parents(), test)[0];
    };
    
})(jQuery, fluid);
/*
Copyright 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {

  function updateDepth(opId, element) {
      var elDirty = jQuery.data(element, "fluid-dom-dirtiness");
      var depth;
      if (!elDirty || elDirty < opId) {
        depth = fluid.utils.computeDomDepth(element);
        jQuery.data(element, "fluid-dom-depth", depth);
        jQuery.data(element, "fluid-dom-dirtiness", opId);
      }
      if (!depth) {
        depth = jQuery.data(element, "fluid-dom-depth");
      }
      return depth;
    } 
  

  fluid.dragManager = function() {

    // An incrementing integer representing a unique identifier for any current
    // drag operation. This will eventually become a global proxy for a 
    // "DOM modification counter".
    var dragId = 0;
    // A map of jQuery data ids to the set of active drop targets - that is,
    // those ones for which we have received an "over" but not an out.
    var lightMap = {};
    
    var that = {};
  
    that.computeTopTarget = function() {
        var maxDepth = 0;
        var maxEl;
        for (var i in lightMap) {
          var light = lightMap[i];
          if (light.depth > maxDepth) {
            maxDepth = light.depth;
            maxEl = light.element;
          }
        }
        return maxEl;
      };
        
    that.startDrag = function() {
        ++ dragId;
    };
    
    that.recordOver = function(element) {
        var depth = updateDepth(dragId, element);
        lightMap[jQuery.data(element)] = {element: element, depth: depth};
      };
      
    that.recordOut = function(element) {
        delete lightMap[jQuery.data(element)];
    };
    
    that.clear = function() {
      lightMap = {};
    };
    
    return that;
  };
  
}) (jQuery, fluid);/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

var fluid = fluid || {};

(function (jQuery, fluid) {

    fluid.dropManager = fluid.dropManager || {};

    var cacheGeometry = function(element, cache) {
      // These measurements taken from ui.droppable.js
      cache.visible = cache.element.is(":visible"); 
      if(!m[i].visible) return;
      var offset = cache.element.offset();
      var width = cache.element.outerWidth();
      var height = cache.element.outerHeight();
      cache.rect = offset;
      cache.rect.right = offset.left + width;
      cache.rect.bottom = offset.top + height;
      return cache;
    };
    
    fluid.dropManager.NO_CHANGE = "no change";
    
    fluid.dropManager = function () {
        var cache = {};
        var that = {};
        
        var lastClosest;
        
        that.updateGeometry = function(geometricInfo) {
            cache = {};
            for (var i = 0; i < geometricInfo.length; ++ i) {
            var thisInfo = geometricInfo[i];
            var expanse = thisInfo.expanseType;
            for (var j = 0; j < thisInfo.elements.length; ++ j) {
               var element = jQuery(thisInfo.elements[j]);
               var cacheelem = cacheGeometry(element, {});
               cacheelem.id = element.data();
               cache[cacheelem.id] = cacheelem;
               }
            }   
        };
        
        that.beginDrag = function() {
            lastClosest = null;
        };
        
        that.mouseMove = function(x, y) {
            var closestTarget = that.closestTarget(x, y, lastClosest);
            if (closetTarget !== fluid.dropManager.NO_CHANGE) {
               lastClosest = closestTarget;
               dropChangerFirer.fireEvent(closestTarget);
            }
        };
        
        that.dropChangeFirer = fluid.getEventFirer();
        
        that.closestTarget = function (x, y, lastClosest) {
            var mindistance = MAX_VALUE;
            var minelem;
            for (var i in cache) {
                var cacheelem = cache[i];
                var distance = fluid.geom.minPointRectangle(x, y, cacheelem.rect);
                if (distance < mindistance) {
                    mindistance = distance;
                    minelem = cacheelem;
                }
                if (distance === 0) {
                    break;
                }
            }
            var position = fluid.position.INSIDE;
            if (cacheelem.expanse === fluid.orientation.HORIZONTAL) {
                position = x < (cacheelem.rect.left + cacheelem.rect.right) / 2?
                    fluid.position.BEFORE : fluid.position.AFTER;
            }
            else if (cacheelem.expanse === fluid.orientation.VERTICAL) {
                position = y < (cacheelem.rect.top + cacheelem.rect.bottom) / 2?
                    fluid.position.BEFORE : fluid.position.AFTER;
            }
            if (lastClosest && lastClosest.position === position &&
                lastClosest.element.data() === minelem.element.data()) {
                return fluid.dropManager.NO_CHANGE;
            }
            return {
              position: position,
              element: minelem.element
            };
        };
        
        return that;
    };


    fluid.geom = fluid.geom || {};
    
    fluid.geom.minPointRectangle = function (x, y, rectangle) {
        var dx = x < rectangle.left? (rectangle.left - x) : 
                  (x > rectangle.right? (x - rectangle.right) : 0);
        var dy = y < rectangle.top? (rectangle.top - y) : 
                  (y > rectangle.bottom? (y - rectangle.bottom) : 0);
        return dx * dx + dy * dy;
    };
    
    
  
}) (jQuery, fluid);/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

fluid.moduleLayout = fluid.moduleLayout || {};

(function (jQuery, fluid) {
  
    var internals = {
        layoutWalker: function (fn, layout) {
            for (var col = 0; col < layout.columns.length; col++) {
                var idsInCol = layout.columns[col].children;
                for (var i = 0; i < idsInCol.length; i++) {
                    var fnReturn = fn(idsInCol, i, col);
                    if (fnReturn) {
                        return fnReturn;
                    }
                }
            }
        },
        
        /**
         * Calculate the location of the item and the column in which it resides.
         * @return  An object with column index and item index (within that column) properties.
         *          These indices are -1 if the item does not exist in the grid.
         */
        findColumnAndItemIndices: function (itemId, layout) {
            var findIndices = function (idsInCol, index, col) {
                if (idsInCol[index] === itemId) {
                    return {columnIndex: col, itemIndex: index};
                }  
            };
            
            var indices = internals.layoutWalker (findIndices, layout);
            return indices || { columnIndex: -1, itemIndex: -1 };
        },
        
        findColIndex: function (colId, layout) {
            for (var col = 0; col < layout.columns.length; col++ ) {
                if (colId === layout.columns[col].id) {
                    return col;
                }
            }
            return -1;
        },
        
        findItemIndex: function (itemId, layout) {
            return internals.findColumnAndItemIndices(itemId, layout).itemIndex;
        },
        
        numColumns: function (layout) {
            return layout.columns.length;
        },
        
        numModules: function (layout) {
            var numModules = 0;
            for (var col = 0; col < layout.columns.length; col++) {
                numModules += layout.columns[col].children.length;
            }
            return numModules;
        },
        
        isColumnIndex: function (index, layout) {
            return (index < layout.columns.length) && (index >= 0);
        },
        
        /**
         * Returns targetIndex
         * This could have been written in two functions for clarity however it gets called a lot and 
         * the two functions were considerably less performant then this single function.
         * 
         * Item index is the row in the permissions object pertaining to the item.
         * Target index is the column in the permission object refering to the postion before or after the target.
         */
        findItemAndTargetIndices: function (itemId, targetId, position, layout) {
            var columns = layout.columns;
            
            // Default to not found.
            var foundIndices = {
                itemIndex: -1,
                targetIndex: -1
            };
            
            // If the ids are invalid, bail immediately.
            if (!itemId || !targetId) {            
                return foundIndices;
            }

            var itemIndexCounter = 0;
            var targetIndexCounter = position;
            
            for (var i = 0; i < columns.length; i++) {
                var idsInCol = columns[i].children;
                for (var j = 0; j < idsInCol.length; j++) {
                    var currId = idsInCol[j];                    
                    if (currId === itemId) {
                        foundIndices.itemIndex = itemIndexCounter; 
                    }
                    if (currId === targetId) {
                        foundIndices.targetIndex = targetIndexCounter; 
                    }
                    
                    // Check if we're done, and if so, bail early.
                    if (foundIndices.itemIndex >= 0 && foundIndices.targetIndex >= 0) {
                        return foundIndices;
                    }
                    
                    // Increment our index counters and keep searching.
                    itemIndexCounter++;
                    targetIndexCounter++;
                }
                
                // Make sure we account for the additional drop target at the end of a column.
                targetIndexCounter++;
            }

            return foundIndices;     
        },
        
        /**
         * Return the item in the given column (index) and at the given position (index)
         * in that column.  If either of the column or item index is out of bounds, this
         * returns null.
         */
        getItemAt: function (columnIndex, itemIndex, layout) {
            var itemId = null;
            var cols = layout.columns;
            
            if (columnIndex >= 0 && columnIndex < cols.length) {
                var idsInCol = cols[columnIndex].children;
                if (itemIndex >= 0 && itemIndex < idsInCol.length) {
                    itemId = idsInCol[itemIndex];
                }
            }
            
            return itemId;
        },
        
        canItemMove: function (itemIndex, perms) {
            var itemPerms = perms[itemIndex];
            for (var i = 0; i < itemPerms.length; i++) {
                if (itemPerms[i] === 1) {
                    return true;
                }
            }
            return false;
        }, 
        
        isDropTarget: function (beforeTargetIndex, perms) {
            for (var i = 0; i < perms.length; i++) {
                if (perms[i][beforeTargetIndex] === 1 || perms[i][beforeTargetIndex + 1] === 1) {
                    return true;
                }
            }
            return false;
        },
        
        targetAndPos: function(itemId, position, layout, perms){
            var inc = (position === fluid.position.BEFORE) ? -1 : 1;            
            var startCoords = internals.findColumnAndItemIndices (itemId, layout);
            var defaultTarg = {
                    id: itemId,
                    position: fluid.position.USE_LAST_KNOWN
                };
            
            // If invalid column, return USE_LAST_KNOWN
            if (startCoords.columnIndex < 0) {
                return defaultTarg;
            }
            
            // Loop thru the target column's items, starting with the item adjacent to the given item,
            // looking for an item that can be moved to.
            var idsInCol = layout.columns[startCoords.columnIndex].children;
            var firstTarg;
            for (var i = startCoords.itemIndex + inc; i > -1 && i < idsInCol.length; i = i + inc) {
                var targetId = idsInCol[i];
                if (fluid.moduleLayout.canMove(itemId, targetId, position, layout, perms)) {
                    // Found a valid move - return
                    return {
                        id: targetId,
                        position: position
                    };
                } else if (!firstTarg) {
                    firstTarg = { id: targetId, position: fluid.position.DISALLOWED};
                }
            }
        
            // Didn't find a valid move so return the first target
            return firstTarg || defaultTarg;                        
        },
            
        findPortletsInColumn: function (portlets, column) {
            var portletsForColumn = [];
            portlets.each(function (idx, portlet) {
                if (jQuery("[id=" + portlet.id + "]", column)[0]) {
                    portletsForColumn.push(portlet);
                }
            });
            
            return portletsForColumn;
        },
    
        columnStructure: function (column, portletsInColumn) {
            var structure = {};
            structure.id = column.id;
            structure.children = [];
            jQuery(portletsInColumn).each(function (idx, portlet) {
                structure.children.push(portlet.id);
            });
            
            return structure;
        }

    };   
    
    /** PUBLIC API **/
    
    fluid.moduleLayout.internals = internals;

    fluid.moduleLayout.isColumn = function (id, layout) {
        var colIndex = internals.findColIndex(id, layout);
        return (colIndex > -1);
    };
    
   /**
    * Determine if a given item can move before or after the given target position, given the
    * permissions information.
    */
    fluid.moduleLayout.canMove = function (itemId, targetItemId, position, layout, perms) {
        if ((position === fluid.position.USE_LAST_KNOWN) || (position === fluid.position.DISALLOWED)) {
            return false;
        }
        if (position === fluid.position.INSIDE) {
            return true;
        }
        var indices = internals.findItemAndTargetIndices (itemId, targetItemId, position, layout);
        return (!!perms[indices.itemIndex][indices.targetIndex]); 
    };
    
    /**
     * Given an item id, and a direction, find the top item in the next/previous column.
     */
    fluid.moduleLayout.firstItemInAdjacentColumn =  function (itemId, /* PREVIOUS, NEXT */ direction, layout) {
        var findItemInAdjacentCol = function (idsInCol, index, col) {
            var id = idsInCol[index];
            if (id === itemId) {
                var adjacentCol = col + direction;
                var adjacentItem = internals.getItemAt (adjacentCol, 0, layout);
                // if there are no items in the adjacent column, keep checking further columns
                while (!adjacentItem) {
                    adjacentCol = adjacentCol + direction;
                    if (internals.isColumnIndex(adjacentCol, layout)) {
                        adjacentItem = internals.getItemAt (adjacentCol, 0, layout);
                    } else {
                        adjacentItem = itemId;
                    }
                }
                return adjacentItem; 
            //    return internals.getItemAt (adjacentCol, 0, layout);
            }
        };
        
        return internals.layoutWalker (findItemInAdjacentCol, layout) || itemId; 
    };
    
    /**
     * Return the item above/below the given item within that item's column.  If at
     * bottom of column or at top, return the item itelf (no wrapping).
     */
    fluid.moduleLayout.itemAboveBelow = function (itemId, /*PREVIOUS, NEXT*/ direction, layout) {
        var findItemAboveBelow = function (idsInCol, index) {
            if (idsInCol[index] === itemId) {
                var siblingIndex = index + direction;
                if ((siblingIndex < 0) || (siblingIndex >= idsInCol.length)) {
                    return itemId;
                } else {
                    return idsInCol[siblingIndex];
                }
            }
        };

        return internals.layoutWalker(findItemAboveBelow, layout) || itemId;
    };
      
        /**
         * Move an item within the layout object. 
         */
    fluid.moduleLayout.updateLayout = function (itemId, targetId, position, layout) {
        if (!itemId || !targetId || itemId === targetId) { 
            return; 
        }
        var itemIndices = internals.findColumnAndItemIndices(itemId, layout);
        layout.columns[itemIndices.columnIndex].children.splice(itemIndices.itemIndex, 1);
        var targetCol;
        if (position === fluid.position.INSIDE || position === fluid.position.USE_LAST_KNOWN) {
            targetCol = layout.columns[internals.findColIndex(targetId, layout)].children;
            targetCol.splice (targetCol.length, 0, itemId);

        } else {
            var relativeItemIndices = internals.findColumnAndItemIndices(targetId, layout);
            targetCol = layout.columns[relativeItemIndices.columnIndex].children;
            targetCol.splice (relativeItemIndices.itemIndex + position, 0, itemId);
        }

      };
      
      /**
       * Find the first target that can be moved to in the given column, possibly moving to the end
       * of the column if there are no valid drop targets. 
       * @return Object containing id (the id of the target) and position (relative to the target)
       */
     fluid.moduleLayout.findTarget = function (itemId, /* NEXT, PREVIOUS */ direction, layout, perms) {
        var targetColIndex = internals.findColumnAndItemIndices(itemId, layout).columnIndex + direction;
        var targetCol = layout.columns[targetColIndex];
        
        // If column is invalid, bail returning the current position.
        if (targetColIndex < 0 || targetColIndex >= internals.numColumns (layout)) {
            return { id: itemId, position: fluid.position.BEFORE };               
        }
        
        // Loop thru the target column's items, looking for the first item that can be moved to.
        var idsInCol = targetCol.children;
        for (var i = 0; (i < idsInCol.length); i++) {
            var targetId = idsInCol[i];
            if (fluid.moduleLayout.canMove(itemId, targetId, fluid.position.BEFORE, layout, perms)) {
                return { id: targetId, position: fluid.position.BEFORE };
            }
            else if (fluid.moduleLayout.canMove (itemId, targetId, fluid.position.AFTER, layout, perms)) {
                return { id: targetId, position: fluid.position.AFTER };
            }
        }
        
        // no valid modules found, so target is the column itself
        return { id: targetCol.id, position: fluid.position.INSIDE };
    };

    /**
     * Returns a valid drop target and position above the item being moved.
     * @param {Object} itemId The id of the item being moved
     * @param {Object} layout 
     * @param {Object} perms
     * @returns {Object} id: the target id, position: a 'fluid.position' value relative to the target
     */
    fluid.moduleLayout.targetAndPositionAbove = function (itemId, layout, perms) {
        return internals.targetAndPos(itemId, fluid.position.BEFORE, layout, perms);
    };
    
    /**
     * Returns a valid drop target and position below the item being moved.
     * @param {Object} itemId The id of the item being moved
     * @param {Object} layout 
     * @param {Object} perms
     * @returns {Object} id: the target id, position: a 'fluid.position' value relative to the target
     */
    fluid.moduleLayout.targetAndPositionBelow = function (itemId, layout, perms) {
        return internals.targetAndPos(itemId, fluid.position.AFTER, layout, perms);
    };
    
    /**
     * Determine the moveables, selectables, and drop targets based on the information
     * in the layout and permission objects.
     */
    fluid.moduleLayout.inferSelectors = function (layout, perms, grabHandle) {
        perms = perms || fluid.moduleLayout.buildEmptyPerms(layout);

        var selectablesSelector;
        var movablesSelector;
        var dropTargets;
        
        var cols = layout.columns;
        for (var i = 0; i < cols.length; i++) {
            var idsInCol = cols[i].children;
            for (var j = 0; j < idsInCol.length; j++) {
                var itemId = idsInCol[j];
                var idSelector = "[id=" + itemId  + "]";
                selectablesSelector = selectablesSelector ? selectablesSelector + "," + idSelector : idSelector;
                
                var indices = internals.findItemAndTargetIndices (itemId, itemId, fluid.position.BEFORE, layout);
                if (internals.canItemMove (indices.itemIndex, perms)) {
                    movablesSelector = movablesSelector ? movablesSelector + "," + idSelector : idSelector; 
                }
                if (internals.isDropTarget (indices.targetIndex, perms)) {
                    dropTargets = dropTargets ? dropTargets + "," + idSelector : idSelector;
                }
            }
            // now add the column itself
            var colIdSelector = "[id=" + cols[i].id  + "]";
            dropTargets = dropTargets ? dropTargets + "," + colIdSelector : colIdSelector;
        }
        
        var togo = {
          movables: movablesSelector,
          selectables: selectablesSelector,
          dropTargets: dropTargets,
          grabHandle: grabHandle
        };
                  
        return togo;
    };
    
    fluid.moduleLayout.containerId = function (layout) {
        return layout.id;
    };
    
    fluid.moduleLayout.lastItemInCol = function (colId, layout) {
        var colIndex = internals.findColIndex(colId, layout);
        var col = layout.columns[colIndex];
        var numChildren = col.children.length;
        if (numChildren > 0) {
            return col.children[numChildren-1];                
        }
        return undefined;
    };
    
    /**
     * Builds a fake permission object stuffed with 1s.
     * @param {Object} layout
     */
    fluid.moduleLayout.buildEmptyPerms = function (layout) {
        var numCols = internals.numColumns(layout);
        var numModules = internals.numModules(layout);
        
        var permsStructure = [];
        // Each column has a drop target at its top.
        // Each portlet has a drop target below it.
        var numItemsInBitmap = numCols + numModules;
        for (var i = 0; i < numModules; i++) {
            var rowForPortlet = [];
            // Stuff the whole structure with 1s to dispense with permissions altogether.
            for (var j = 0; j < numItemsInBitmap; j++) {
                rowForPortlet.push(1);
            }
            permsStructure.push(rowForPortlet);                
        }
        
        return permsStructure;
    };
  
    /**
     * Builds a permissions object that captures a simple set of rules for locked modules.
     * This permissions object is designed to support modules that are locked at the top of columns.
     * In this definition of locked, the modules cannot be picked up by mouse or keyboard,
     * and if they are at the top of a column, nothing can be placed above them.
     * 
     * @param {jQuery} lockedModules
     * @param {Object} layout
     */
    fluid.moduleLayout.buildPermsForLockedModules = function (lockedModules, layout) {            
        if (lockedModules.length <= 0) {
            return fluid.moduleLayout.buildEmptyPerms(layout);
        }
        
        function isLocked(id) {
            return jQuery.grep(lockedModules, function (el) {return el.id === id;})[0];   
        }
        
        // Build the perms rows
        var permsRow = []; 
        var lockedPermsRow = [];
        var moduleIds = [];

        // Walk the layout and create two interim data structures: 
        // one for unlocked modules and another for locked modules.
        for (var col = 0; col < layout.columns.length; col += 1) {
            var idsInCol = layout.columns[col].children;
            var prevId = null;
            for (var i = 0; i < idsInCol.length; i += 1) {
                var id = idsInCol[i];
                moduleIds.push(id);
                // Check if we're locked at the top of column, or the thing above is locked.
                if (isLocked(id) && (!prevId || isLocked(prevId))) {
                    permsRow.push(0);
                } else {
                   permsRow.push(1);
                } 
                lockedPermsRow.push(0);
                prevId = id; 
            }
            permsRow.push(1);
            lockedPermsRow.push(0);
        }

        // Based on the locked and unlock rows, build up the final permissions object.
        var permsStructure = [];
        for (i = 0; i < moduleIds.length; i += 1) {
            if (isLocked(moduleIds[i])) {
                permsStructure.push(lockedPermsRow);
            }
            else {
                permsStructure.push(permsRow);
            }
        }
        
        return permsStructure;
    };
       
      /**
       * Builds a layout object from a set of columns and modules.
       * @param {jQuery} container
       * @param {jQuery} columns
       * @param {jQuery} portlets
       */
    fluid.moduleLayout.buildLayout = function (container, columns, portlets) {
        var layoutStructure = {};
        layoutStructure.id = container[0].id;
        layoutStructure.columns = [];
        columns.each(function (idx, column) {
            var portletsInColumn = internals.findPortletsInColumn(portlets, column);
            layoutStructure.columns.push(internals.columnStructure(column, portletsInColumn));
        });
        
        return layoutStructure;
      };
    
    var defaultWillShowKBDropWarning = function (item, dropWarning) {
        if (dropWarning) {
            var offset = jQuery(item).offset();
            dropWarning = jQuery(dropWarning);
            dropWarning.css("position", "absolute");
            dropWarning.css("top", offset.top);
            dropWarning.css("left", offset.left);
        }
    };
    
    /*
     * Module Layout Handler for reordering content modules.
     * 
     * General movement guidelines:
     * 
     * - Arrowing sideways will always go to the top (moveable) module in the column
     * - Moving sideways will always move to the top available drop target in the column
     * - Wrapping is not necessary at this first pass, but is ok
     */
    fluid.moduleLayoutHandler = function (container, options) {
            
        var that = fluid.initView("fluid.moduleLayoutHandler", container, options);
        // TODO: actually place some defaults in this structure, and resolve the way
        // that defaults from subsidiary components (layouts) could interact with
        // defaults at a higher level. 
        var orientation = fluid.orientation.VERTICAL;
        
        // Configure optional parameters
        var layout = options.moduleLayout.layout;
        var targetPerms = options.moduleLayout.permissions || fluid.moduleLayout.buildEmptyPerms(layout);
        
        options = options || {};
        var orderChangedCallback = options.orderChangedCallback || function () {};
        if (options.orderChangedCallbackUrl) {
            // Create the orderChangedCallback function
            orderChangedCallback = function (item) {
                jQuery.post(options.orderChangedCallbackUrl, 
                    JSON.stringify(layout),
                    function (data, textStatus) { 
                        targetPerms = data; 
                    }, 
                    "json");
            };
        }
        var dropWarning = fluid.utils.jById(options.dropWarningId);
        var willShowKBDropWarning = options.willShowKBDropWarning || defaultWillShowKBDropWarning;
        
        // Private Methods.
        /*
         * Find an item's sibling in the vertical direction based on the
         * layout.  This assumes that there is no wrapping the top and
         * bottom of the columns, and returns the given item if at top
         * and seeking the previous item, or at the bottom and seeking
         * the next item.
         */
        var getVerticalSibling = function (item, /* NEXT, PREVIOUS */ direction) {
            var siblingId = fluid.moduleLayout.itemAboveBelow(item.id, direction, layout);
            return fluid.utils.jById(siblingId)[0];
        };
    
        /*
         * Find an item's sibling in the horizontal direction based on the
         * layout.  This assumes that there is no wrapping the ends of
         * the rows, and returns the given item if left most and
         * seeking the previous item, or if right most and seeking
         * the next item.
         */
        var getHorizontalSibling = function (item, /* NEXT, PREVIOUS */ direction) {
            var itemId = fluid.moduleLayout.firstItemInAdjacentColumn(item.id, direction, layout);
            return fluid.utils.jById(itemId)[0];
        };
                
        // This should probably be part of the public API so it can be configured.
        var move = function (item, relatedItem, position /* BEFORE, AFTER or INSIDE */) {
            if (!item || !relatedItem) {
                return;
            }           
            if (position === fluid.position.BEFORE) {
                jQuery(relatedItem).before(item);
            } else if (position === fluid.position.AFTER) {
                jQuery(relatedItem).after(item);
            } else if (position === fluid.position.INSIDE) {
                jQuery(relatedItem).append(item);
            }  // otherwise it's either DISALLOWED or USE_LAST_KNOWN
            
            fluid.moduleLayout.updateLayout(item.id, relatedItem.id, position, layout);
            orderChangedCallback(item);
        };
        
        var moveHorizontally = function (item, direction /* PREVIOUS, NEXT */) {
            var targetInfo = fluid.moduleLayout.findTarget(item.id, direction, layout, targetPerms);
            var targetItem = fluid.utils.jById(targetInfo.id)[0];
            move(item, targetItem, targetInfo.position);
        };
        
        var moveVertically = function (item, targetFunc) {
            var targetAndPos = targetFunc(item.id, layout, targetPerms);
            var target = fluid.utils.jById(targetAndPos.id)[0]; 
            if (targetAndPos.position === fluid.position.DISALLOWED) {
                if (dropWarning) {
                    willShowKBDropWarning(item, dropWarning[0]);
                    dropWarning.show();
                }
            } else if (targetAndPos.position !== fluid.position.USE_LAST_KNOWN) {
                move(item, target, targetAndPos.position);
            }
        };
        
        // Public Methods
        that.getRightSibling = function (item) {
            return getHorizontalSibling(item, fluid.direction.NEXT);
        };
        
        that.moveItemRight = function (item) {
            moveHorizontally(item, fluid.direction.NEXT);
        };
    
        that.getLeftSibling = function (item) {
            return getHorizontalSibling(item, fluid.direction.PREVIOUS);
        };
    
        that.moveItemLeft = function (item) {
            moveHorizontally(item, fluid.direction.PREVIOUS);
        };
    
        that.getItemAbove = function (item) {
            return getVerticalSibling(item, fluid.direction.PREVIOUS);
        };
        
        that.moveItemUp = function (item) {
            moveVertically(item, fluid.moduleLayout.targetAndPositionAbove);
        };
            
        that.getItemBelow = function (item) {
            return getVerticalSibling(item, fluid.direction.NEXT);
        };
    
        that.moveItemDown = function (item) {
            moveVertically(item, fluid.moduleLayout.targetAndPositionBelow);
        };
        
        that.dropPosition = function (target, moving, x, y) {
            if (fluid.moduleLayout.isColumn (target.id, layout)) {
                var lastItemInColId = fluid.moduleLayout.lastItemInCol(target.id, layout);
                if (lastItemInColId === undefined) {
                    return fluid.position.INSIDE;
                }
                var lastItem = fluid.utils.jById(lastItemInColId);
                var topOfEmptySpace = lastItem.offset().top + lastItem.height();
                
                if (y > topOfEmptySpace) {
                    return fluid.position.INSIDE;
                } else {
                    return fluid.position.USE_LAST_KNOWN;
                }
            }
            
            var position = fluid.utils.mousePosition(target, orientation, x, y);
            var canDrop = fluid.moduleLayout.canMove(moving.id, target.id, position, layout, targetPerms);
            if (canDrop) {
                return position;
            }
            else {
                return fluid.position.DISALLOWED;
            }
        };

        that.mouseMoveItem = function (moving, target, x, y, position) {
            move(moving, target, position);
        };
        
        return that;
    };
}) (jQuery, fluid);
/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {
    
    var defaultAvatarCreator = function(item, cssClass, dropWarning) {
        var avatar = jQuery(item).clone();
        fluid.iterateDom(avatar.get(0), function(node) {
            node.removeAttribute("id");
            if (node.tagName === "input") {
                node.setAttribute("disabled", "disabled");
                }
            }
          );
        avatar.removeAttr("id");
        //jQuery("[id]", avatar).removeAttr("id");
        //jQuery(":hidden", avatar).remove();
        //jQuery("input", avatar).attr("disabled", "true");
        // dropping in the same column fails if the avatar is considered a droppable.
        // droppable ("destroy") should take care of this, but it doesn't seem to remove
        // the class, which is what is checked, so we remove it manually
        // (see http://dev.jquery.com/ticket/2599)
        // 2008-05-12: 2599 has been fixed now in trunk
        //                    avatar.droppable ("destroy");
        avatar.removeClass("ui-droppable");
        avatar.addClass(cssClass);
        
        if (dropWarning) {
            // Will a 'div' always be valid in this position?
            var avatarContainer = jQuery(document.createElement("div"));
            avatarContainer.append(avatar);
            avatarContainer.append(dropWarning);
            return avatarContainer;
        } else {
            return avatar;
        }
    };   
    
    fluid.defaults("fluid.reorderer", {
        containerRole: fluid.roles.LIST,
        instructionMessageId: "message-bundle:",
        styles: {
            defaultStyle: "orderable-default",
            selected: "orderable-selected",
            dragging: "orderable-dragging",
            mouseDrag: "orderable-dragging",
            hover: "orderable-hover",
            dropMarker: "orderable-drop-marker",
            avatar: "orderable-avatar"
            },
        selectors: {
          movables: ".movables",
          grabHandle: ""
        },
        avatarCreator: defaultAvatarCreator,
        keysets: fluid.defaultKeysets,
        layoutHandlerName: "fluid.listLayoutHandler",
        
        mergePolicy: {
          keysets: "replace",
          "selectors.selectables": "selectors.movables",
          "selectors.dropTargets": "selectors.movables"
        }
    });
    
    function firstSelectable (that) {
        var selectables = that.locate("selectables");
        if (selectables.length <= 0) {
            return null;
        }
        return selectables[0];
    }
    
    function bindHandlersToContainer (container, focusHandler, keyDownHandler, keyUpHandler, mouseMoveHandler) {
        container.focus(focusHandler);
        container.keydown(keyDownHandler);
        container.keyup(keyUpHandler);
        container.mousemove(mouseMoveHandler);
        // FLUID-143. Disable text selection for the reorderer.
        // ondrag() and onselectstart() are Internet Explorer specific functions.
        // Override them so that drag+drop actions don't also select text in IE.
        if (jQuery.browser.msie) {
            container[0].ondrag = function () { return false; }; 
            container[0].onselectstart = function () { return false; };
        } 
    }
    
    function addRolesToContainer(that) {
        var first = (that.locate("selectables")[0]);
        if (first) {
            that.container.ariaState("activedescendent", first.id);
        }
        that.container.ariaRole(that.options.containerRole.container);
        that.container.ariaState("multiselectable", "false");
        that.container.ariaState("readonly", "false");
        that.container.ariaState("disabled", "false");
    }
    
    function changeSelectedToDefault(jItem, styles) {
        jItem.removeClass(styles.selected);
        jItem.addClass(styles.defaultStyle);
        jItem.ariaState("selected", "false");
    }
    

    function createAvatarId (parentId) {
        // Generating the avatar's id to be containerId_avatar
        // This is safe since there is only a single avatar at a time
        return parentId + "_avatar";
    }
    
    var adaptKeysets = function (options) {
        if (options.keysets && !(options.keysets instanceof Array)) {
            options.keysets = [options.keysets];    
        }
    };
    
    /**
     * Creates a reorderer
     * 
     * @param {Object} container a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings. See http://wiki.fluidproject.org/x/Woo7 
     */
    fluid.reorderer = function (container, options) {
        var thatReorderer = fluid.initView("fluid.reorderer", container, options);
        
        thatReorderer.layoutHandler = fluid.utils.invokeGlobalFunction(
           thatReorderer.options.layoutHandlerName, [container, thatReorderer.options]);
        
        thatReorderer.activeItem = undefined;

        adaptKeysets(thatReorderer.options);
 
        var kbDropWarning = fluid.utils.jById(thatReorderer.options.dropWarningId);
        var mouseDropWarning;
        if (kbDropWarning) {
            mouseDropWarning = kbDropWarning.clone();
        }
        
        thatReorderer.focusActiveItem = function (evt) {
            // If the active item has not been set yet, set it to the first selectable.
            if (!thatReorderer.activeItem) {
                var first = firstSelectable(thatReorderer);
                if (!first) {  
                    return evt.stopPropagation();
                }
                jQuery(first).focus();
            } else {
                jQuery(thatReorderer.activeItem).focus();
            }
            return evt.stopPropagation();
        };

        var isMove = function (evt) {
            var keysets = thatReorderer.options.keysets;
            for (var i = 0; i < keysets.length; i++) {
                if (keysets[i].modifier(evt)) {
                    return true;
                }
            }
            return false;
        };
        
        var isActiveItemMovable = function () {
            return (jQuery.inArray(thatReorderer.activeItem, thatReorderer.locate("movables")) >= 0);
        };
        
        var setDropEffects = function (value) {
            thatReorderer.dom.fastLocate("dropTargets").ariaState("dropeffect", value);
        };
        
        var styles = thatReorderer.options.styles;
        
        thatReorderer.handleKeyDown = function (evt) {
            if (!thatReorderer.activeItem || (thatReorderer.activeItem !== evt.target)) {
                return true;
            }
            // If the key pressed is ctrl, and the active item is movable we want to restyle the active item.
            var jActiveItem = jQuery(thatReorderer.activeItem);
            if (!jActiveItem.hasClass(styles.dragging) && isMove(evt)) {
               // Don't treat the active item as dragging unless it is a movable.
                if (isActiveItemMovable()) {
                    jActiveItem.removeClass(styles.selected);
                    jActiveItem.addClass(styles.dragging);
                    jActiveItem.ariaState("grab", "true");
                    setDropEffects("move");
                }
                return false;
            }
            // The only other keys we listen for are the arrows.
            return thatReorderer.handleDirectionKeyDown(evt);
        };

        thatReorderer.handleKeyUp = function (evt) {
          
            if (!thatReorderer.activeItem || (thatReorderer.activeItem !== evt.target)) {
                return true;
            }
            var jActiveItem = jQuery(thatReorderer.activeItem);
            
            // Handle a key up event for the modifier
            if (jActiveItem.hasClass(styles.dragging) && !isMove(evt)) {
                if (kbDropWarning) {
                    kbDropWarning.hide();
                }
                jActiveItem.removeClass(styles.dragging);
                jActiveItem.addClass(styles.selected);
                jActiveItem.ariaState("grab", "supported");
                setDropEffects("none");
                return false;
            }
            
            return false;
        };

        var moveItem = function(moveFunc) {
            if (isActiveItemMovable()) {
                moveFunc(thatReorderer.activeItem);
                // refocus on the active item because moving places focus on the body
                thatReorderer.activeItem.focus();
                jQuery(thatReorderer.activeItem).removeClass(thatReorderer.options.styles.selected);
            }
        };
        
        var noModifier = function (evt) {
            return (!evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey);
        };
        
        var moveItemForKeyCode = function (keyCode, keyset, layoutHandler) {
            var didMove = false;
            switch (keyCode) {
                case keyset.up:
                    moveItem(layoutHandler.moveItemUp);
                    didMove = true;
                    break;
                case keyset.down:
                    moveItem(layoutHandler.moveItemDown);
                    didMove = true;
                    break;
                case keyset.left:
                    moveItem(layoutHandler.moveItemLeft);
                    didMove = true;
                    break;
                case keyset.right:
                    moveItem(layoutHandler.moveItemRight);
                    didMove = true;
                    break;
            }
            
            return didMove;
        };
        
        var focusItemForKeyCode = function(keyCode, keyset, layoutHandler, activeItem){
            var didFocus = false;
            var item;
            switch (keyCode) {
                case keyset.up:
                    item = layoutHandler.getItemAbove(activeItem);
                    didFocus = true;
                    break;
                case keyset.down:
                    item = layoutHandler.getItemBelow(activeItem);
                    didFocus = true;
                    break;
                case keyset.left:
                    item = layoutHandler.getLeftSibling(activeItem);
                    didFocus = true;
                    break;
                case keyset.right:
                    item = layoutHandler.getRightSibling(activeItem);
                    didFocus = true;
                    break;
            }
            jQuery(item).focus();
            
            return didFocus;
        };
        
        thatReorderer.handleDirectionKeyDown = function (evt) {
            if (!thatReorderer.activeItem) {
                return true;
            }
            var keysets = thatReorderer.options.keysets;
            for (var i = 0; i < keysets.length; i++) {
                var keyset = keysets[i];
                var didProcessKey = false;
                if (keyset.modifier(evt)) {
                    if (kbDropWarning) {
                        kbDropWarning.hide();
                    }
                    didProcessKey = moveItemForKeyCode(evt.keyCode, keyset, thatReorderer.layoutHandler);
            
                } else if (noModifier(evt)) {
                    didProcessKey = focusItemForKeyCode(evt.keyCode, keyset, thatReorderer.layoutHandler, thatReorderer.activeItem);
                }
                
                // We got the right key press. Bail right away by swallowing the event.
                if (didProcessKey) {
                    return false;
                }
            }
            
            return true;
        };

        // Drag and drop setup code starts here. This needs to be refactored to be better contained.
        var dropMarker;

        var createDropMarker = function (tagName) {
            var dropMarker = jQuery(document.createElement(tagName));
            dropMarker.addClass(thatReorderer.options.styles.dropMarker);
            dropMarker.hide();
            return dropMarker;
        };

        var dragManager = fluid.dragManager();
        // Storing the most recent valid target and drop position to implement correct behaviour for locked modules
        var validTargetAndPos;
        
        fluid.utils.setLogging(true);
        
        /**
         * Creates an event handler for mouse move events that moves, shows and hides the drop marker accordingly
         * @param {Object} dropTargets    a list of valid drop targets
         */
        var createTrackMouse = function(dropTargets) {
            dropTargets = fluid.wrap(dropTargets);
            var avatarId = createAvatarId(thatReorderer.container.id);
           
            return function(evt) {
//                fluid.utils.debug("target " + fluid.dumpEl(evt.target) + " targetOver " + fluid.dumpEl(targetOver) + " X " + evt.clientX + " Y " + evt.pageY);
                
                var target = dragManager.computeTopTarget();
                
                if (target) {
                    //fluid.utils.debug("Computed target: " + fluid.dumpEl(target));
                
                    var position = thatReorderer.layoutHandler.dropPosition(target, thatReorderer.activeItem, evt.clientX, evt.pageY);
                    if (position === fluid.position.DISALLOWED) {
                        if (mouseDropWarning) {
                            mouseDropWarning.show();
                        }
                    } 
                    else {
                        if (mouseDropWarning) {
                            mouseDropWarning.hide();
                        }

                        validTargetAndPos = {
                            target: target,
                            position: position
                        };
                        if (validTargetAndPos.position === fluid.position.BEFORE) {
                            jQuery(target).before(dropMarker);
                        }
                        else if (validTargetAndPos.position === fluid.position.AFTER) {
                            jQuery(target).after(dropMarker);
                        }
                        else if (validTargetAndPos.position === fluid.position.INSIDE) {
                            jQuery(target).append(dropMarker);
                        }
                        dropMarker.show();
                    }
                }
                else {
                    dropMarker.hide();
                    if (mouseDropWarning) {
                        mouseDropWarning.hide();
                    }
                    validTargetAndPos = null;
                }
            };
        };

        /**
         * Takes a jQuery object and adds 'movable' functionality to it
         */
        function initMovable(item) {
            var styles = thatReorderer.options.styles;
            item.addClass(styles.defaultStyle);
            item.ariaState("grab", "supported");

            item.mouseover( 
                function () {
                    thatReorderer.dom.fastLocate("grabHandle", jQuery(item[0])).addClass(styles.hover);
                }
            );
        
            item.mouseout(  
                function () {
                    thatReorderer.dom.fastLocate("grabHandle", jQuery(item[0])).removeClass(styles.hover);
                }
            );
        
            item.draggable ({
                refreshPositions: false,
                scroll: true,
                helper: function () {
                    var dropWarningEl;
                    if (mouseDropWarning) {
                        dropWarningEl = mouseDropWarning[0];
                    }
                    var avatar = jQuery(thatReorderer.options.avatarCreator(item[0], styles.avatar, dropWarningEl));
                    avatar.attr("id", createAvatarId(thatReorderer.container.id));
                    return avatar;
                },
                start: function (e, ui) {
                    item.focus();
                    item.removeClass(thatReorderer.options.styles.selected);
                    item.addClass(thatReorderer.options.styles.mouseDrag);
                    item.ariaState("grab", "true");
                    setDropEffects("move");
                    dragManager.startDrag();
                },
                stop: function(e, ui) {
                    if (validTargetAndPos) {
                        thatReorderer.layoutHandler.mouseMoveItem(this, validTargetAndPos.target, e.clientX, e.pageY, validTargetAndPos.position);
                    }
                    fluid.utils.debug("Drag stopped");
                    item.removeClass(thatReorderer.options.styles.mouseDrag);
                    item.addClass(thatReorderer.options.styles.selected);
                    jQuery(thatReorderer.activeItem).ariaState("grab", "supported");
                    dropMarker.hide();
                    ui.helper = null;
                    validTargetAndPos = null;
                    setDropEffects("none");
                    dragManager.clear();
                    
                    // refocus on the active item because moving places focus on the body
                    thatReorderer.activeItem.focus();
                },
                handle: thatReorderer.dom.fastLocate("grabHandle", item[0])
            });
        }

        /**
         * Takes a jQuery object and a selector that matches movable items
         */
        function initDropTarget (item, selector) {
            
            item.ariaState("dropeffect", "none");

            item.droppable({
                accept: selector,
                greedy: true,
                tolerance: "pointer",
                over: function (e, ui) {
                    dragManager.recordOver(ui.element[0]);
                },
                out: function (e, ui) {
                    dragManager.recordOut(ui.element[0]);
                }
            });
        }
   
        var initSelectables = function () {
            var handleBlur = function (evt) {
                changeSelectedToDefault (jQuery(this), thatReorderer.options.styles);
                return evt.stopPropagation();
            };
        
            var handleFocus = function (evt) {
                thatReorderer.selectItem (this);
                return evt.stopPropagation();
            };
            
            var selectables = thatReorderer.locate("selectables");
            // set up selectables 
            // Remove the selectables from the taborder
            for (var i = 0; i < selectables.length; i++) {
                var item = jQuery(selectables[i]);
                item.tabindex("-1");
                item.blur(handleBlur);
                item.focus(handleFocus);
            
                item.ariaRole(thatReorderer.options.containerRole.item);
                item.ariaState("selected", "false");
                item.ariaState("disabled", "false");
            }
        };
    
        var initItems = function () {
            var movables = thatReorderer.locate("movables");
            var dropTargets = thatReorderer.locate("dropTargets");
            initSelectables();
        
            // Setup movables
            for (var i = 0; i < movables.length; i++) {
                var item = movables[i];
                initMovable(jQuery(item));
            }

            // In order to create valid html, the drop marker is the same type as the node being dragged.
            // This creates a confusing UI in cases such as an ordered list. 
            // drop marker functionality should be made pluggable. 
            if (movables.length > 0) {
                dropMarker = createDropMarker(movables[0].tagName);
            }

            // Create a simple predicate function that will identify items that can be dropped.
            var droppablePredicate = function (potentialDroppable) {
                return (movables.index(potentialDroppable) > -1);    
            };
        
            // Setup dropTargets
            for (i = 0; i < dropTargets.length; i++) {
                initDropTarget(jQuery (dropTargets[i]), droppablePredicate);
            }         
        };

        // Final initialization of the Reorderer at the end of the construction process 
        if (thatReorderer.container) {
            bindHandlersToContainer (thatReorderer.container, 
                thatReorderer.focusActiveItem,
                thatReorderer.handleKeyDown,
                thatReorderer.handleKeyUp,
                createTrackMouse(thatReorderer.locate("dropTargets")));
            addRolesToContainer(thatReorderer);
            // ensure that the Reorderer container is in the tab order
            if (!thatReorderer.container.hasTabindex() || (thatReorderer.container.tabindex() < 0)) {
                thatReorderer.container.tabindex("0");
            }
            initItems();
        }
        
       thatReorderer.selectItem = function (anItem) {
           var styles = thatReorderer.options.styles;
           // Set the previous active item back to its default state.
           if (thatReorderer.activeItem && thatReorderer.activeItem !== anItem) {
               changeSelectedToDefault(jQuery(thatReorderer.activeItem), styles);
           }
           // Then select the new item.
           thatReorderer.activeItem = anItem;
           var jItem = jQuery(anItem);
           jItem.removeClass(styles.defaultStyle);
           jItem.addClass(styles.selected);
           jItem.ariaState("selected", "true");
           thatReorderer.container.ariaState("activedescendent", anItem.id);
           };
           
       thatReorderer.refresh = function() {
           thatReorderer.dom.refresh("grabHandle", thatReorderer.locate("movables"));
           thatReorderer.dom.refresh("dropTargets");
       };
       
       thatReorderer.refresh();
           
       return thatReorderer;
       };
    
    
    var defaultInitOptions = {
        selectors: {}
    };
    
    // Simplified API for reordering lists and grids.
    var simpleInit = function (container, layoutHandlerName, options) {
        options = fluid.utils.merge({}, {}, defaultInitOptions, options);  
        options.layoutHandlerName = layoutHandlerName;
        return fluid.reorderer(container, options);
    };
    
    fluid.reorderList = function (container, options) {
        return simpleInit(container, "fluid.listLayoutHandler", options);
    };
    
    fluid.reorderGrid = function (container, options) {
        return simpleInit(container, "fluid.gridLayoutHandler", options); 
    };
}) (jQuery, fluid);

/*******************
 * Layout Handlers *
 *******************/
(function (jQuery, fluid) {
    // Shared private functions.
    var moveItem = function (item, relatedItemInfo, position, wrappedPosition) {
        var itemPlacement = position;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPosition;
        }
        
        if (itemPlacement === fluid.position.AFTER) {
            jQuery(relatedItemInfo.item).after(item);
        } else {
            jQuery(relatedItemInfo.item).before(item);
        } 
    };
    
    var itemInfoFinders = {
        /*
         * A general get{Left|Right}SiblingInfo() given an item, a list of orderables and a direction.
         * The direction is encoded by either a +1 to move right, or a -1 to
         * move left, and that value is used internally as an increment or
         * decrement, respectively, of the index of the given item.
         */
        getSiblingInfo: function (item, orderables, /* NEXT, PREVIOUS */ direction) {
            var index = jQuery(orderables).index (item) + direction;
            var hasWrapped = false;
                
            // Handle wrapping to 'before' the beginning. 
            if (index === -1) {
                index = orderables.length - 1;
                hasWrapped = true;
            }
            // Handle wrapping to 'after' the end.
            else if (index === orderables.length) {
                index = 0;
                hasWrapped = true;
            } 
            // Handle case where the passed-in item is *not* an "orderable"
            // (or other undefined error).
            //
            else if (index < -1 || index > orderables.length) {
                index = 0;
            }
            
            return {item: orderables[index], hasWrapped: hasWrapped};
        },

        /*
         * Returns an object containing the item that is to the right of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getRightSiblingInfo: function (item, orderables) {
            return itemInfoFinders.getSiblingInfo(item, orderables, fluid.direction.NEXT);
        },
        
        /*
         * Returns an object containing the item that is to the left of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getLeftSiblingInfo: function (item, orderables) {
            return itemInfoFinders.getSiblingInfo(item, orderables, fluid.direction.PREVIOUS);
        },
        
        /*
         * Returns an object containing the item that is below the given item in the current grid
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the column that the given item is in. The flag is necessary because when an image is being
         * moved to the resulting item location, the decision of whether or not to insert before or
         * after the item changes if the process wrapped around the column.
         */
        getItemInfoBelow: function (inItem, orderables) {
            var curCoords = jQuery(inItem).offset();
            var i, iCoords;
            var firstItemInColumn, currentItem;
            
            for (i = 0; i < orderables.length; i++) {
                currentItem = orderables [i];
                iCoords = jQuery(orderables[i]).offset();
                if (iCoords.left === curCoords.left) {
                    firstItemInColumn = firstItemInColumn || currentItem;
                    if (iCoords.top > curCoords.top) {
                        return {item: currentItem, hasWrapped: false};
                    }
                }
            }
    
            firstItemInColumn = firstItemInColumn || orderables [0];
            return {item: firstItemInColumn, hasWrapped: true};
        },
        
        /*
         * Returns an object containing the item that is above the given item in the current grid
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the column that the given item is in. The flag is necessary because when an image is being
         * moved to the resulting item location, the decision of whether or not to insert before or
         * after the item changes if the process wrapped around the column.
         */
         getItemInfoAbove: function (inItem, orderables) {
            var curCoords = jQuery(inItem).offset();
            var i, iCoords;
            var lastItemInColumn, currentItem;
            
            for (i = orderables.length - 1; i > -1; i--) {
                currentItem = orderables [i];
                iCoords = jQuery(orderables[i]).offset();
                if (iCoords.left === curCoords.left) {
                    lastItemInColumn = lastItemInColumn || currentItem;
                    if (curCoords.top > iCoords.top) {
                        return {item: currentItem, hasWrapped: false};
                    }
                }
            }
    
            lastItemInColumn = lastItemInColumn || orderables [0];
            return {item: lastItemInColumn, hasWrapped: true};
        }
    
    };
    
    // Public layout handlers.
    fluid.listLayoutHandler = function (container, options) {
        var that = fluid.initView("fluid.listLayoutHandler", container, options);
      
        var orderChangedCallback = function () {};
        var orientation = fluid.orientation.VERTICAL;
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
            orientation = options.orientation || orientation;
        }
        
        that.getGeometricInfo = function () {
          var geometry = {};
        };
        
        that.getRightSibling = function (item) {
            return itemInfoFinders.getRightSiblingInfo(item, that.locate("selectables")).item;
            };
        
        that.moveItemRight = function (item) {
            var rightSiblingInfo = itemInfoFinders.getRightSiblingInfo (item, that.locate("movables"));
            moveItem(item, rightSiblingInfo, fluid.position.AFTER, fluid.position.BEFORE);
            orderChangedCallback(item);
            };
    
        that.getLeftSibling = function (item) {
            return itemInfoFinders.getLeftSiblingInfo(item, that.locate("selectables")).item;
            };
    
        that.moveItemLeft = function (item) {
            var leftSiblingInfo = itemInfoFinders.getLeftSiblingInfo(item, that.locate("movables"));
            moveItem(item, leftSiblingInfo, fluid.position.BEFORE, fluid.position.AFTER);
            orderChangedCallback(item);
            };
    
        that.getItemBelow = that.getRightSibling;
    
        that.getItemAbove = that.getLeftSibling;
        
        that.moveItemUp = that.moveItemLeft;
        
        that.moveItemDown = that.moveItemRight;
    
        that.dropPosition = function (target, moving, x, y) {
            return fluid.utils.mousePosition(target, orientation, x, y);
        };
        
        that.mouseMoveItem = function (moving, target, x, y) {
            var whereTo = this.dropPosition(target, moving, x, y);
            if (whereTo === fluid.position.BEFORE) {
                jQuery(target).before(moving);
            } else if (whereTo === fluid.position.AFTER) {
                jQuery(target).after(moving);
            }
            orderChangedCallback(moving);
        };
        
        return that;
    }; // End ListLayoutHandler
    
    /*
     * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
     * changes dimensions when the window changes size. As a result, when the user presses the up or
     * down arrow key, what lies above or below depends on the current window size.
     * 
     * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
     * in the window, and of informing the Lightbox of which items surround a given item.
     */
    fluid.gridLayoutHandler = function (container, options) {
        var that = fluid.listLayoutHandler(container, options);

        var orderChangedCallback = function () {};
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
        }
        
        var orientation = fluid.orientation.HORIZONTAL;
        
        that.getItemBelow = function(item) {
            return itemInfoFinders.getItemInfoBelow(item, that.locate("selectables")).item;
        };
    
        that.moveItemDown = function (item) {
            var itemBelow = itemInfoFinders.getItemInfoBelow(item, that.locate("movables"));
            moveItem(item, itemBelow, fluid.position.AFTER, fluid.position.BEFORE);
            orderChangedCallback(item);
        };
                
        that.getItemAbove = function (item) {
            return itemInfoFinders.getItemInfoAbove(item, that.locate("selectables")).item;   
        }; 
        
        that.moveItemUp = function (item) {
            var itemAbove = itemInfoFinders.getItemInfoAbove(item, that.locate("movables"));
            moveItem(item, itemAbove, fluid.position.BEFORE, fluid.position.AFTER);
            orderChangedCallback(item);
        };
                    
        // We need to override ListLayoutHandler.dropPosition to ensure that the local private
        // orientation is used.
        that.dropPosition = function (target, moving, x, y) {
            return fluid.utils.mousePosition (target, orientation, x, y);
        };
        return that;
        
    }; // End of GridLayoutHandler

}) (jQuery, fluid);
/*
Copyright 2007 - 2008 University of Toronto
Copyright 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {
    var createLayoutCustomizer = function (layout, perms, orderChangedCallbackUrl, userOptions) {
        var selectors, assembleOptions, options, reordererRoot;
        
        // Configure options
        userOptions = userOptions || {};
        selectors = fluid.moduleLayout.inferSelectors(layout, perms, userOptions.grabHandle);
        assembleOptions = {
            containerRole: fluid.roles.REGIONS,
            orderChangedCallbackUrl: orderChangedCallbackUrl,
            layoutHandlerName: "fluid.moduleLayoutHandler",
            moduleLayout: {
                permissions: perms,
                layout: layout
            },
            selectors: selectors
        };
        options = jQuery.extend({}, assembleOptions, userOptions);
        
        reordererRoot = fluid.utils.jById(fluid.moduleLayout.containerId(layout));

        return fluid.reorderer(reordererRoot, options);
    };
    

    /**
     * Creates a layout customizer from a combination of a layout and permissions object.
     * @param {Object} layout a layout object. See http://wiki.fluidproject.org/x/FYsk for more details
     * @param {Object} perms a permissions data structure. See the above documentation
     */
    fluid.initLayoutCustomizer = function (layout, perms, orderChangedCallbackUrl, options) {        
        return createLayoutCustomizer(layout, perms, orderChangedCallbackUrl, options);
    };

    /**
     * Simple way to create a layout customizer.
     * @param {Object} container a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings.  
     */
    fluid.reorderLayout = function (container, options) {
        var selectors, columns, modules, lockedModules, layout, perms;
        
        options = options || {};
        selectors = fluid.utils.merge({}, {}, fluid.defaults("reorderLayout").selectors, options.selectors);
        
        container = fluid.container(container);
        columns = jQuery(selectors.columns, container);
        modules = jQuery(selectors.modules, container);
        lockedModules = jQuery(selectors.lockedModules, container);
        layout = fluid.moduleLayout.buildLayout(container, columns, modules);
        perms = fluid.moduleLayout.buildPermsForLockedModules(lockedModules, layout);
        
        // clear the selectors because they aren't needed by the reorderer and in fact confuse matters 
        options.selectors = undefined;
        return fluid.initLayoutCustomizer(layout, perms, null, options);
    };
    
    fluid.defaults("reorderLayout", {  
        selectors: {
            columns: ".columns",
            modules: ".modules",
            lockedModules: ".lockedModules"
        }
    });
        
})(jQuery, fluid);
/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 - 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function (jQuery, fluid) {
    var deriveLightboxCellBase, addThumbnailActivateHandler, createItemFinder, defaultOrderChangedCallback;
    
    deriveLightboxCellBase = function (namebase, index) {
        return namebase + "lightbox-cell:" + index + ":";
    };
            
    addThumbnailActivateHandler = function (lightboxContainer) {
        var enterKeyHandler = function (evt) {
            if (evt.which === fluid.keys.ENTER) {
                var thumbnailAnchors = jQuery("a", evt.target);
                document.location = thumbnailAnchors.attr('href');
            }
        };
        
        jQuery(lightboxContainer).keypress(enterKeyHandler);
    };
    
    createItemFinder = function (parentNode, containerId) {
        // This orderable finder knows that the lightbox thumbnails are 'div' elements
        var lightboxCellNamePattern = "^" + deriveLightboxCellBase(containerId, "[0-9]+") + "$";
        
        return function () {
            return fluid.utils.seekNodesById(parentNode, "div", lightboxCellNamePattern);
        };
    };
    
    /**
     * Returns the default Lightbox order change callback. This callback is used by the Lightbox
     * to send any changes in image order back to the server. It is implemented by nesting
     * a form and set of hidden fields within the Lightbox container which contain the order value
     * for each image displayed in the Lightbox. The default callback submits the form's default 
     * action via AJAX.
     * 
     * @param {Element} lightboxContainer The DOM element containing the form that is POSTed back to the server upon order change 
     */
    defaultOrderChangedCallback = function (lightboxContainer) {
        var reorderform = fluid.utils.findForm(lightboxContainer);
        
        return function () {
            var inputs, i;
            inputs = fluid.utils.seekNodesById(
                reorderform, 
                "input", 
                "^" + deriveLightboxCellBase(lightboxContainer.id, "[^:]*") + "reorder-index$");
            
            for (i = 0; i < inputs.length; i += 1) {
                inputs[i].value = i;
            }
        
            if (reorderform && reorderform.action) {
                jQuery.post(reorderform.action, 
                jQuery(reorderform).serialize(),
                function (type, data, evt) { /* No-op response */ });
            }
        };
    };

    // Public Lightbox API
    /**
     * Creates a new Lightbox instance from the specified parameters, providing full control over how
     * the Lightbox is configured.
     * 
     * @param {Object} container 
     * @param {Object} options 
     */
    fluid.lightbox = function (container, options) {
        var containerEl, orderChangedFn, itemFinderFn, reordererOptions;
        options = options || {};
        container = fluid.container(container);

        // Remove the anchors from the taborder.
        jQuery("a", container).tabindex(-1);
        addThumbnailActivateHandler(container);
        
        containerEl = fluid.unwrap(container);
        orderChangedFn = options.orderChangedCallback || defaultOrderChangedCallback(containerEl);
        itemFinderFn = (options.selectors && options.selectors.movables) || createItemFinder(containerEl, containerEl.id);

        reordererOptions = {
            layoutHandlerName: "fluid.gridLayoutHandler",
            containerRole: fluid.roles.GRID,
            orderChangedCallback: orderChangedFn,
            selectors: {
                movables: itemFinderFn
            }
        };
        
        jQuery.extend(true, reordererOptions, options);
        
        return fluid.reorderer(container, reordererOptions);
    };
        
})(jQuery, fluid);
/* Fluid Multi-File Uploader Component
 * 
 * Built by The Fluid Project (http://www.fluidproject.org)
 * 
 * LEGAL
 * 
 * Copyright 2008 University of California, Berkeley
 * Copyright 2008 University of Cambridge
 * Copyright 2008 University of Toronto
 * 
 * Licensed under the Educational Community License (ECL), Version 2.0 or the New
 * BSD license. You may not use this file except in compliance with one these
 * Licenses.
 * 
 * You may obtain a copy of the ECL 2.0 License and BSD License at
 * https://source.fluidproject.org/svn/LICENSE.txt
 * 
 * DOCUMENTATION
 * Technical documentation is available at: http://wiki.fluidproject.org/x/d4ck
 * 
 */

/* TODO:
 * - handle duplicate file error
 * - make fields configurable
 *	   - strings (for i18n)
 * - refactor 'options' into more than one object as needed
 * - clean up debug code
 * - remove commented-out code
 * - use swfObj status to check states, etc. > drop our status obj
 */

/* ABOUT RUNNING IN LOCAL TEST MODE
 * To run locally using a fake upload, set uploadDefaults.uploadUrl to ''
 */

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($,fluid) {
      
    /* these are the internal UI elements of the Uploader as defined in the 
     * default HTML for the Fluid Uploader
     */
    var defaultSelectors = {
        upload: ".fluid-uploader-upload",
        resume: ".fluid-uploader-resume",
        pause: ".fluid-uploader-pause",
        done: ".fluid-uploader-done",
        cancel: ".fluid-uploader-cancel",
        browse: ".fluid-uploader-browse",
        fluidUploader: ".fluid-uploader-queue-wrapper",
        fileQueue: ".fluid-uploader-queue",
        queueRow: "tr",
        scrollingElement: ".fluid-scroller",
        emptyRow : ".fluid-uploader-row-placeholder",
        txtTotalFiles: ".fluid-uploader-totalFiles",
        txtTotalBytes: ".fluid-uploader-totalBytes",
        txtTotalFilesUploaded : ".fluid-uploader-num-uploaded",
        txtTotalBytesUploaded : ".fluid-uploader-bytes-uploaded",
        osModifierKey: ".fluid-uploader-modifierKey",
        txtFileStatus: ".removeFile",
        uploaderFooter : '.fluid-scroller-table-foot',
        qRowTemplate: '#queue-row-tmplt',
        qRowFileName: '.fileName',
        qRowFileSize: '.fileSize',
        qRowRemove: '.removeFile',
        fileProgressor: '.file-progress',
        fileProgressText: ".file-progress-text",
        totalProgressor: '.total-progress',
        totalProgressText: ".fluid-scroller-table-foot .footer-total",
        debug: false
    };
    
    // Default configuration options.
    var uploadDefaults = {
        uploadUrl : "",
        flashUrl : "",
        fileSizeLimit : "20480",
        fileTypes : "*.*", 
        fileTypesText : "image files",
        fileUploadLimit : 0,
        fileQueueLimit : 0,
        elmUploaderControl: "",
        whenDone: "", // this can be a URL [String], or a function, "" will refresh the page
        whenCancel: "", // this can be a URL [String], or a function, "" will refresh the page
        whenFileUploaded: function(fileName, serverResponse) {},
        postParams: {},
        httpUploadElm: "",
        continueAfterUpload: true,
        continueDelay: 2000, //in milles
        queueListMaxHeight : 190,
        fragmentSelectors: defaultSelectors,
        // when to show the File browser
        // if false then the browser shows when the Browse button is clicked
        // if true
            // if using dialog then browser will show immediately
            // else browser will show as soon as dialog shows
        browseOnInit: false, 
        // dialog settings
        dialogDisplay: false,
        addFilesBtn: ".fluid-add-files-btn", // used in conjunction with dialog display to activate the Uploader
        debug: false
    };
    
    var dialog_settings = {
        title: "Upload Files", 
        width: 482,
        height: '', // left empty so that the dialog will auto-resize
        draggable: true, 
        modal: false, 
        resizable: false,
        autoOpen: false
    };
    
    var strings = {
        macControlKey: "Command",
        browseText: "Browse files",
        addMoreText: "Add more",
        fileUploaded: "File Uploaded",
            // tokens replaced by fluid.util.stringTemplate
        pausedLabel: "Paused at: %curFileN of %totalFilesN files (%currBytes of %totalBytes)",
        totalLabel: "Uploading: %curFileN of %totalFilesN files (%currBytes of %totalBytes)", 
        completedLabel: "Uploaded: %curFileN files (%totalCurrBytes)"
    };
        
    /* DOM Manipulation */
    
    /** 
    * adds a new file to the file queue in DOM
    * note: there are cases where a file will be added to the file queue but will not be in the actual queue 
    */
    var addFileToQueue = function(uploaderContainer, file, fragmentSelectors, swfObj, status, maxHeight) {
        // make a new row
        var newQueueRow = $(fragmentSelectors.qRowTemplate).clone();
        // update the file name
        $(newQueueRow).children(fragmentSelectors.qRowFileName).text(file.name);
        // update the file size
        $(newQueueRow).children(fragmentSelectors.qRowFileSize).text(fluid.utils.formatFileSize(file.size));
        // update the file id and add the hover action
        newQueueRow.attr('id', file.id).css('display','none').addClass("ready row").hover(function(){
            if ($(this).hasClass('ready') && !$(this).hasClass('uploading')) {
                $(this).addClass('hover');
            }
        }, function(){
            if ($(this).hasClass('ready') && !$(this).hasClass('uploading')) {
                $(this).removeClass('hover');
            }
        });
        // insert the new row into the file queue
        var fileQueue = $(fragmentSelectors.fileQueue, uploaderContainer);
        fileQueue.append(newQueueRow);
        
        var removeThisRow = function() {
            if (uploadState(uploaderContainer) !== "uploading") {
                removeRow(uploaderContainer, fragmentSelectors, newQueueRow, swfObj, status, maxHeight);
            }
        };
        
        // add remove action to the button
        $('#' + file.id, uploaderContainer).find(fragmentSelectors.qRowRemove).click(removeThisRow);

        newQueueRow.activatable(null, {additionalBindings: [
          {key: $.a11y.keys.DELETE, activateHandler: function(){
                  $('#' + file.id, uploaderContainer).find(fragmentSelectors.qRowRemove).click();
              }
          }
        ]});
        
        updateSelectable(fileQueue);
        
        // display the new row
        $('#' + file.id, uploaderContainer).fadeIn('slow');
    };


    /** 
    * removes the defined row from the file queue 
    * @param {jQuery} 	uploaderContainer
    * @param {Object} 	fragmentSelectors	collection of Uploader DOM selectors 
    * @param {jQuery} 	row					a jQuery object for the row
    * @param {SWFUpload} swfObj				the SWF upload object
    * @param {Object} 	status				the status object to be updated
    * @return {jQuery}	returns row			the same jQuery object
    */
    var removeRow = function(uploaderContainer, fragmentSelectors, row, swfObj, status, maxHeight) {
        row.fadeOut('fast', function (){
            var fileId = row.attr('id');
            var file = swfObj.getFile(fileId);
            queuedBytes (status, -file.size);
            swfObj.cancelUpload(fileId);
            row.remove();
            updateQueueHeight($(fragmentSelectors.scrollingElement, uploaderContainer), maxHeight);
            updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
            updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
            updateStateByState(uploaderContainer,fragmentSelectors.fileQueue);
            updateBrowseBtnText(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.browse, status);
            var fileQueue = $(fragmentSelectors.fileQueue, uploaderContainer);
            updateSelectable(fileQueue);
        });
        return row;
    };
    
    var updateSelectable = function(container) {
        container.getSelectableContext().refresh();
    };
    
    var updateQueueHeight = function(scrollingElm, maxHeight){
        var overMaxHeight = (scrollingElm.children().eq(0).height() > maxHeight);
        var setHeight = (overMaxHeight) ? maxHeight : '';
        scrollingElm.height( setHeight ) ;
        return overMaxHeight;
    };
    
    var scrollBottom = function(scrollingElm){
        // cast potentially a jQuery obj to a regular obj
        scrollingElm = $(scrollingElm)[0];
        // set the scrollTop to the scrollHeight
        scrollingElm.scrollTop = scrollingElm.scrollHeight;
    };
    
    var scrollTo = function(scrollingElm,row){
        if ($(row).prev().length) {
            var nextRow = $(row).next();
            row = (nextRow.length === 0) ? row : nextRow ;
        }
        
        var rowPosTop = $(row)[0].offsetTop;
        var rowHeight = $(row).height();
        var containerScrollTop = $(scrollingElm)[0].scrollTop;
        var containerHeight = $(scrollingElm).height();
        
        // if the top of the row is ABOVE the view port move the row into position
        if (rowPosTop < containerScrollTop) {
            $(scrollingElm)[0].scrollTop = rowPosTop;
        }
        
        // if the bottom of the row is BELOW the viewport then scroll it into position
        if ((rowPosTop + rowHeight) > (containerScrollTop + containerHeight)) {
            $(scrollingElm)[0].scrollTop = (rowPosTop - containerHeight + rowHeight);
        }
        //$(scrollingElm)[0].scrollTop = $(row)[0].offsetTop;
    };
    
    /**
     * Updates the total number of rows in the queue in the UI
     */
    var updateNumFiles = function(uploaderContainer, totalFilesSelector, fileQueueSelector) {
        $(totalFilesSelector, uploaderContainer).text(numberOfRows(uploaderContainer, fileQueueSelector));
    };
    
    /**
     * Updates the total number of bytes in the UI
     */
    var updateTotalBytes = function(uploaderContainer, totalBytesSelector, status) {
        $(totalBytesSelector, uploaderContainer).text(fluid.utils.formatFileSize(queuedBytes(status)));
    };
     
    /*
     * Figures out the state of the uploader based on 
     * the number of files in the queue, and the number of files uploaded, 
     * or have errored, or are still to be uploaded
     * @param {String} uploaderContainer    the uploader container
     * @param {String} fileQueueSelector    the file queue used to test numbers.
     */
    var updateStateByState = function(uploaderContainer, fileQueueSelector) {
        var totalRows = numberOfRows(uploaderContainer, fileQueueSelector);
        var rowsUploaded = numFilesUploaded(uploaderContainer, fileQueueSelector);
        var rowsReady = numFilesToUpload(uploaderContainer, fileQueueSelector);
        
        fluid.utils.debug(
            "totalRows = " + totalRows + 
            "\nrowsUploaded = " + rowsUploaded + 
            "\nrowsReady = " + rowsReady
        );
        if (rowsUploaded > 0) { // we've already done some uploads
            if (rowsReady === 0) {
                updateState(uploaderContainer, 'empty');
            } else {
                updateState(uploaderContainer, 'reloaded');
            }
        } else if (totalRows === 0) {
            updateState(uploaderContainer, 'start');
        } else {
            updateState(uploaderContainer, 'loaded');
        }
    };
    
    /*
     * Sets the state (using a css class) for the top level element
     * @param {String} uploaderContainer    the uploader container
     * @param {String} stateClass    the file queue used to test numbers.
     */
    var updateState = function(uploaderContainer, stateClass) {
        $(uploaderContainer).children("div:first").attr('className',stateClass);
    };
    
    var uploadState = function(uploaderContainer) {
        return $(uploaderContainer).children("div:first").attr('className');
    };
    
    var updateBrowseBtnText = function(uploaderContainer, fileQueueSelector, browseButtonSelector, status) {
        if (numberOfRows(uploaderContainer, fileQueueSelector) > 0) {
            $(browseButtonSelector, uploaderContainer).text(strings.addMoreText);
        } else {
            $(browseButtonSelector, uploaderContainer).text(strings.browseText);
        }
    };
    
    var markRowComplete = function(row, fileStatusSelector, removeBtnSelector) {
        // update the status of the row to "uploaded"
        rowChangeState(row, removeBtnSelector, fileStatusSelector, 'uploaded', strings.fileUploaded);
    };
    
    var markRowError = function(row, fileStatusSelector, removeBtnSelector, scrollingElm, maxHeight, humanError) {
        // update the status of the row to "error"
        rowChangeState(row, removeBtnSelector, fileStatusSelector, 'error', 'File Upload Error');
        
        updateQueueHeight(scrollingElm, maxHeight);
        
        if (humanError !== '') {
            displayHumanReableError(row, humanError);
        }	
    };
    
    /* rows can only go from ready to error or uploaded */
    var rowChangeState = function(row, removeBtnSelector, fileStatusSelector, stateClass, stateMessage) {
        
        // remove the ready status and add the new status
        row.removeClass('ready').addClass(stateClass);
        
        // remove click event on Remove button
        $(row).find(removeBtnSelector).unbind('click');
        
        // remove the state on the Remove button
        
        // remove the tabFocus on the Remove button
        $(row).find(removeBtnSelector).tabindex(-1);
        
        // add text status
        $(row).find(fileStatusSelector).attr('title',stateMessage);
    };
    
    var displayHumanReableError = function(row, humanError) {
        var newErrorRow = $('#queue-error-tmplt').clone();
        $(newErrorRow).find('.queue-error').html(humanError);
        $(newErrorRow).removeAttr('id').insertAfter(row);
    };
        
    // UTILITY SCRIPTS
    /**
     * displays URL/URI or runs provided function
     * does not validate action, unknown what it would do with other types of input
     * @param {String, Function} action
     */
    var variableAction = function(action) {
        if (action !== undefined) {
            if (typeof action === "function") {
                action();
            }
            else {
                location.href = action;
            }
        }
    };
    
    // SWF Upload Callback Handlers

    /*
     * @param {String} uploaderContainer    the uploader container
     * @param {int} maxHeight    maximum height in pixels for the file queue before scrolling
     * @param {Object} status    
     */
    var createFileQueuedHandler = function (uploaderContainer, fragmentSelectors, maxHeight, status, dialogObj) {
        return function(file){
            var swfObj = this;
            try {
                // what have we got?
                fluid.utils.debug(file.name + " file.size = " + file.size); // DEBUG
                
                if (dialogObj) {
                    $(dialogObj).dialog("open");
                }
                
                // add the file to the queue
                addFileToQueue(uploaderContainer, file, fragmentSelectors, swfObj, status, maxHeight);
                
                updateStateByState(uploaderContainer, fragmentSelectors.fileQueue);

                var scrollingElm = $(fragmentSelectors.scrollingElement, uploaderContainer);
                
                // scroll to the bottom to reviel element
                if (updateQueueHeight(scrollingElm, maxHeight)) {
                    scrollBottom(scrollingElm);
                }
                
                // add the size of the file to the variable maintaining the total size
                queuedBytes(status, file.size);
                // update the UI
                updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
                updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
                
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
    };
        
    var createSWFReadyHandler = function (browseOnInit, allowMultipleFiles, useDialog) {
        return function(){
            if (browseOnInit && !useDialog) {
                browseForFiles(this,allowMultipleFiles);
            }
        };
    };
    
    function browseForFiles(swfObj,allowMultipleFiles) {
        if (allowMultipleFiles) {
            swfObj.selectFiles();
        }
        else {
            swfObj.selectFile();
        }
    }

    var createFileDialogStartHandler = function(uploaderContainer){
        return function(){
            try {
                $(uploaderContainer).children("div:first").addClass('browsing');
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
    };

    var createFileDialogCompleteHandler = function(uploaderContainer, fragmentSelectors, status) {
        return function(numSelected, numQueued){
            try {
                updateBrowseBtnText(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.browse, status);
                $(uploaderContainer).children("div:first").removeClass('browsing');
                if (numberOfRows(uploaderContainer, fragmentSelectors.fileQueue)){
                    $(fragmentSelectors.upload, uploaderContainer).focus();
                }
                debugStatus(status);
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
    };

    function fileQueueError(file, error_code, message) {
        // surface these errors in the queue
        try {
            var error_name = "";
            switch (error_code) {
            case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                error_name = "QUEUE LIMIT EXCEEDED";
                break;
            case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                error_name = "FILE EXCEEDS SIZE LIMIT";
                break;
            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                error_name = "ZERO BYTE FILE";
                break;
            case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                error_name = "INVALID FILE TYPE";
                break;
            default:
                error_name = "UNKNOWN";
                break;
            }
            var error_string = error_name + ":File ID: " + (typeof(file) === "object" && file !== null ? file.id : "na") + ":" + message;
            fluid.utils.debug ('error_string = ' + error_string);
        } catch (ex) {
            fluid.utils.debug (ex);
        }
    }	

    var createUploadStartHandler = function (uploaderContainer, fragmentSelectors, progressBar, status) {
        return function (file) {
            uploadStart (file, uploaderContainer, fragmentSelectors, progressBar, status);
        };
    };
    
    var uploadStart = function(file, uploaderContainer, fragmentSelectors, progressBar, status) {
        fluid.utils.debug("Upload Start Handler");
        updateState(uploaderContainer,'uploading');
        status.currError = ''; // zero out the error so we can check it later
        $("#"+file.id,uploaderContainer).addClass("uploading");
        progressBar.init('#'+file.id);
        scrollTo($(fragmentSelectors.scrollingElement, uploaderContainer),$("#"+file.id, uploaderContainer));
        uploadProgress(progressBar, uploaderContainer, file, 0, file.size, fragmentSelectors, status);
        fluid.utils.debug (
            "Starting Upload: " + (file.index + 1) + ' (' + file.id + ')' + ' [' + file.size + ']' + ' ' + file.name
        );
        $(fragmentSelectors.pause, uploaderContainer).focus();
    };

    
    /* File and Queue Upload Progress */

    var createUploadProgressHandler = function (progressBar, uploaderContainer, fragmentSelectors, status) {
        return function(file, bytes, totalBytes) {
            uploadProgress (progressBar, uploaderContainer, file, bytes, totalBytes, fragmentSelectors, status);
        };
    };
    
    /* File Upload Error */
    var createUploadErrorHandler = function (uploaderContainer, progressBar, fragmentSelectors, maxHeight, status, options) {
        return function(file, error_code, message){
            uploadError(file, error_code, message,uploaderContainer, progressBar, fragmentSelectors, maxHeight, status, options);
        };
    };
    
    var uploadError = function (file, error_code, message, uploaderContainer, progressBar, fragmentSelectors, maxHeight, status, options) {
        fluid.utils.debug("Upload Error Handler");
        status.currError = '';
        status.continueOnError = false;
        var humanErrorMsg = '';
        var markError = true;
        try {
            switch (error_code) {
                case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                    status.currError = "Error Code: HTTP Error, File name: " + file.name + ", Message: " + message;
                    humanErrorMsg = 'An error occurred on the server during upload. It could be that the file already exists on the server.' + 
                        formatErrorCode(message);
                    status.continueOnError = true;
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                    status.currError = "Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                    break;
                case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                    status.currError = "Error Code: IO Error, File name: " + file.name + ", Message: " + message;
                    humanErrorMsg = 'An error occurred attempting to read the file from disk. The file was not uploaded.' + 
                        formatErrorCode(message);
                    status.continueOnError = true;
                    break;
                case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                    status.currError = "Error Code: Security Error, File name: " + file.name + ", Message: " + message;
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                    status.currError = "Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                    break;
                case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                    status.currError = "Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                    break;
                case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                    status.currError = "File cancelled by user";
                    status.continueOnError = true;
                    markError = false;
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                    status.currError = "Upload Stopped by user input";
                    var pauseStrings = {
                        curFileN: numFilesUploaded(uploaderContainer,fragmentSelectors.fileQueue), 
                        totalFilesN: numberOfRows(uploaderContainer,fragmentSelectors.fileQueue), 
                        currBytes: fluid.utils.formatFileSize(status.currBytes), 
                        totalBytes: fluid.utils.formatFileSize(status.totalBytes)
                    };
                    var pausedString = fluid.utils.stringTemplate(strings.pausedLabel,pauseStrings);
                    $(fragmentSelectors.totalProgressText, uploaderContainer).html(pausedString);

                    updateState(uploaderContainer,'paused');
                    
                    markError = false;
                    break;
                default:
                    //				progress.SetStatus("Unhandled Error: " + error_code);
                    status.currError = "Error Code: " + error_code + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                    break;
            }
                            
            if (markError) {
                markRowError($('tr#' + file.id, uploaderContainer), fragmentSelectors.txtFileStatus, fragmentSelectors.qRowRemove, $(fragmentSelectors.scrollingElement, uploaderContainer), maxHeight, humanErrorMsg);
            }
            
            fluid.utils.debug(status.currError + '\n' + humanErrorMsg);
            
            // override continueAfterUpload
            options.continueAfterUpload = false;
        } 
        catch (ex) {
            fluid.utils.debug(ex);
        }		
    };
    
    var formatErrorCode = function(str) {
        return " (Error code: " + str + ")";
    };
    
    /* File Upload Success */
    
    var createUploadSuccessHandler =  function(uploaderContainer, progressBar, fragmentSelectors, whenFileUploaded, status){
        return function(file, server_data) {
            uploadSuccess(uploaderContainer, file, progressBar, fragmentSelectors, status, whenFileUploaded, server_data);
        };
    };	
    
    var uploadSuccess = function (uploaderContainer, file, progressBar, fragmentSelectors, status, whenFileUploaded, server_data){
        fluid.utils.debug("Upload Success Handler");
        
        uploadProgress(progressBar, uploaderContainer, file, file.size, file.size, fragmentSelectors, status);
        markRowComplete($('tr#' + file.id, uploaderContainer), fragmentSelectors.txtFileStatus, fragmentSelectors.qRowRemove);
        
        try {
            whenFileUploaded(file.name, server_data);
        } 
        catch (ex) {
             fluid.utils.debug(ex);
        }
    };
    
    
    /* File Upload Complete */
    
    var createUploadCompleteHandler = function (uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj) {
        return function(file){
            uploadComplete(this, file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj);
        };
    };
    
    var uploadComplete = function (swfObj, file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj) {
        fluid.utils.debug("Upload Complete Handler");
        
        $("#"+file.id,uploaderContainer).removeClass("uploading");
        
        var totalCount = numberOfRows(uploaderContainer, fragmentSelectors.fileQueue);
        
        var currStats = swfObj.getStats();
        
        fluid.utils.debug(
        "currStats.files_queued = " + currStats.files_queued + 
        "\ncurrStats.successful_uploads = " + currStats.successful_uploads + 
        "\ncurrStats.upload_errors = " + currStats.upload_errors
        );
                
        if (currStats.files_queued === 0) {
            // we've completed all the files in this upload
            return fileQueueComplete(uploaderContainer, swfObj, options, progressBar, fragmentSelectors, dialogObj, status);
        }
        else if (!status.currError || status.continueOnError) {
            // there was no error and there are still files to go
            uploadedBytes(status,file.size); // update the number of bytes that have actually be uploaded so far
            return swfObj.startUpload();  
        }
        else { 
            // there has been an error that we should stop on
            // note: do not update the bytes because we didn't complete that last file
            return hideProgress(progressBar, true, $(fragmentSelectors.resume, uploaderContainer));
        }
    };
    
    /* File Queue Complete */
    
    var fileQueueComplete = function(uploaderContainer, swfObj, options, progressBar, fragmentSelectors, dialogObj, status) {
        fluid.utils.debug("File Queue Complete Handler");
        
        updateState(uploaderContainer, 'done');
        var stats = swfObj.getStats();
        var newStrings = {
            curFileN: stats.successful_uploads,
            totalCurrBytes: fluid.utils.formatFileSize(status.totalBytes)
        };
         
        $(fragmentSelectors.totalProgressText, uploaderContainer).html(fluid.utils.stringTemplate(strings.completedLabel,newStrings));
        hideProgress(progressBar, true, $(fragmentSelectors.done, uploaderContainer));
        options.continueDelay = (!options.continueDelay) ? 0 : options.continueDelay;
        if (options.continueAfterUpload) {
            setTimeout(function(){
                variableAction(options.whenDone);
            },options.continueDelay);
        }
    };
    
    /*
     * Return the queue size. If a number is passed in, increment the size first.
     */
    var queuedBytes = function (status, delta) {
        if (typeof delta === 'number') {
            status.totalBytes += delta;
        }
        return status.totalBytes;
    };
    
    var uploadedBytes = function (status, delta) {
        if (typeof delta === 'number') {
            status.currBytes += delta;
        }
        return status.currBytes;
    };
    
    function readyBytes(status) {
        return (status.totalBytes - status.currBytes);
    }

    
    function numberOfRows(uploaderContainer, fileQueueSelector) {
        return $(fileQueueSelector, uploaderContainer).find('.row').length ;
    }

    function numFilesToUpload(uploaderContainer, fileQueueSelector) {
        return $(fileQueueSelector, uploaderContainer).find('.ready').length ;
    }
    
    function numFilesUploaded(uploaderContainer, fileQueueSelector) {
        return $(fileQueueSelector, uploaderContainer).find('.uploaded').length;
    }
    
    /* PROGRESS
     * 
     */
    
    var uploadProgress = function(progressBar, uploaderContainer, file, fileBytes, totalFileBytes, fragmentSelectors, status) {
        fluid.utils.debug("Upload Progress Handler");
        
        fluid.utils.debug ('Upload Status : \n' + file.name + ' : ' + fileBytes + ' of ' + totalFileBytes + " bytes : \ntotal : " + (status.currBytes + fileBytes)  + ' of ' + queuedBytes(status) + " bytes");
        
        // update file progress
        var filePercent = fluid.utils.derivePercent(fileBytes,totalFileBytes);
        progressBar.updateProgress("file", filePercent, filePercent+"%");
        
        // update total 
        var totalQueueBytes = queuedBytes(status);
        var currQueueBytes = status.currBytes + fileBytes;
        var totalPercent = fluid.utils.derivePercent(currQueueBytes, totalQueueBytes);
        var fileIndex = file.index + 1;
        var numFilesInQueue = numberOfRows(uploaderContainer, fragmentSelectors.fileQueue);
        
        var totalHTML = totalStr(fileIndex,numFilesInQueue,currQueueBytes,totalQueueBytes);
        
        progressBar.updateProgress("total", totalPercent, totalHTML);		
    };
    
    function totalStr(fileIndex,numRows,bytes,totalBytes) {		
        var newStrings = {
            curFileN: fileIndex, 
            totalFilesN: numRows, 
            currBytes: fluid.utils.formatFileSize(bytes), 
            totalBytes: fluid.utils.formatFileSize(totalBytes)
        };
        
        return fluid.utils.stringTemplate(strings.totalLabel, newStrings);
    }
    
    var hideProgress = function(progressBar, dontPause, focusAfterHide) {
        progressBar.hide(dontPause);
        focusAfterHide.focus();
    };
    
    /* DIALOG
     * 
     */
    
    var initDialog = function(uploaderContainer, addBtnSelector, browseOnInit, fileBrowseSelector) {
        dialogObj = uploaderContainer.dialog(dialog_settings).css('display','block');
        
        var clickBehaviour = function(){
            // set timeout is required for keyboard a11y. Without it, the dialog does not appear.
            
            if (browseOnInit) {
                $(fileBrowseSelector, uploaderContainer).click();
            } else {
                setTimeout(function(){
                    $(dialogObj).dialog("open");
                    $(fileBrowseSelector).focus();
                }, 0);
            }
        };

        var addBtn = $(addBtnSelector);
        addBtn.click(clickBehaviour);
        addBtn.activatable(clickBehaviour);				
                                    
        return dialogObj;
    };
        
    var closeDialog = function(dialogObj) {
        $(dialogObj).dialog("close");
    };

    /* DEV CODE
     * to be removed after beta or factored into unit tests
     */
    
    function debugStatus(status) {
        fluid.utils.debug (
            "\n status.totalBytes = " + queuedBytes (status) + 
            "\n status.currCount = " + status.currCount + 
            "\n status.currBytes = " + status.currBytes + 
            "\n status.currError = " + status.currError +
            "\n status.continueOnError = " + status.continueOnError
            
        );
    }
    
    /* DEMO CODE
     * this is code that fakes an upload with out a server
     */

 
    // need to pass in current uploader
    
    var demoUpload = function (uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj) {
        fluid.utils.debug("demoUpload Handler");
        var demoState = {};
        
        // used to break the demo upload into byte-sized chunks
        demoState.byteChunk = 200000; 
        
        // set up data
        demoState.row = $(fragmentSelectors.fileQueue + ' tbody tr:not(".fluid-uploader-placeholder"):not(".uploaded):not(".error)', uploaderContainer).eq(0);
        
        demoState.fileId = jQuery(demoState.row).attr('id');
        demoState.file = swfObj.getFile(demoState.fileId);
        
        fluid.utils.debug("num of ready files = " + numFilesToUpload(uploaderContainer, fragmentSelectors.fileQueue)); // check the current state 
        
        if (status.stop === true) { // we're pausing
            demoPause(swfObj, demoState.file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj, 0);
        } else if (numFilesToUpload(uploaderContainer, fragmentSelectors.fileQueue)) { // there are still files to upload
            status.stop = false;
            demoState.bytes = 0;
            demoState.totalBytes = demoState.file.size;
            demoState.numChunks = Math.ceil(demoState.totalBytes / demoState.byteChunk);
            fluid.utils.debug ('DEMO :: ' + demoState.fileId + ' :: totalBytes = ' 
                + demoState.totalBytes + ' numChunks = ' + demoState.numChunks);
            
            // start the demo upload
            uploadStart(demoState.file, uploaderContainer, fragmentSelectors, progressBar, status);
            
            // perform demo progress
            demoProgress(demoState, swfObj, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj);
        } else { // no more files to upload close the display
            fileQueueComplete(uploaderContainer, swfObj, options, progressBar, fragmentSelectors, dialogObj, status);
        }

        function demoProgress(demoState, swfObj, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj) {
            var timer;
            var delay = Math.floor(Math.random() * 1000 + 100);
            if (status.stop === true) { // user paused the upload
                // throw the pause error
                demoPause(swfObj, demoState.file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj, delay);
            } else {
                status.stop = false;
                var tmpBytes = (demoState.bytes + demoState.byteChunk);
                
                if (tmpBytes < demoState.totalBytes) { // we're still in the progress loop
                    fluid.utils.debug ('tmpBytes = ' + tmpBytes + ' totalBytes = ' + demoState.totalBytes);
                    uploadProgress(progressBar, uploaderContainer, demoState.file, tmpBytes, demoState.totalBytes, fragmentSelectors, status);
                    demoState.bytes = tmpBytes;
                    timer = setTimeout(function(){
                        demoProgress(demoState, swfObj, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj);
                    }, delay);			
                }
                else { // progress is complete
                    // one last progress update just for nice
                    uploadSuccess(uploaderContainer, demoState.file, progressBar, fragmentSelectors, status);
                    // change Stats here
                    timer = setTimeout(function(){
                        uploadComplete(swfObj, demoState.file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj);
                    }, delay);
                    // remove the file from the queue
                    swfObj.cancelUpload(demoState.fileId);
                }
            }  
            status.stop = false;
        }
        
        function demoPause (swfObj, file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj, delay) {
            uploadError(file, -290, "", uploaderContainer, progressBar, fragmentSelectors, options.queueListMaxHeight, status, options);
            uploadComplete(swfObj, file, uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj);
            status.stop = false;
        }
        
     };    

    function initSWFUpload(uploaderContainer, uploadURL, flashURL, progressBar, status, fragmentSelectors, options, allowMultipleFiles, dialogObj) {
        // Initialize the uploader SWF component
        // Check to see if SWFUpload is available
        if (typeof(SWFUpload) === "undefined") {
            return null;
        }
        
        var swf_settings = {
            // File Upload Settings
            upload_url: uploadURL,
            flash_url: flashURL,
            post_params: options.postParams,
            
            file_size_limit: options.fileSizeLimit,
            file_types: options.fileTypes,
            file_types_description: options.fileTypesDescription,
            file_upload_limit: options.fileUploadLimit,
            file_queue_limit: options.fileQueueLimit,
                        
            // Event Handler Settings
            swfupload_loaded_handler : createSWFReadyHandler(options.browseOnInit, allowMultipleFiles, options.dialogDisplay),
            file_dialog_start_handler: createFileDialogStartHandler (uploaderContainer),
            file_queued_handler: createFileQueuedHandler (uploaderContainer, fragmentSelectors, options.queueListMaxHeight, status, dialogObj),
            file_queue_error_handler: fileQueueError,
            file_dialog_complete_handler: createFileDialogCompleteHandler (uploaderContainer, fragmentSelectors, status),
            upload_start_handler: createUploadStartHandler (uploaderContainer, fragmentSelectors, progressBar, status),
            upload_progress_handler: createUploadProgressHandler (progressBar, uploaderContainer, fragmentSelectors, status),
            upload_error_handler: createUploadErrorHandler (uploaderContainer, progressBar, fragmentSelectors, options.queueListMaxHeight, status, options),
            upload_success_handler: createUploadSuccessHandler (uploaderContainer, progressBar, fragmentSelectors, options.whenFileUploaded, status),
            upload_complete_handler: createUploadCompleteHandler (uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj),
            // debug_handler : debug_function, // a new event handler in swfUpload that we don't really know what to do with yet
            // Debug setting
            debug: options.debug
        }; 
        
        return new SWFUpload(swf_settings);
    }
    
    var whichOS = function () {
        if (navigator.appVersion.indexOf("Win") !== -1) {
            return "Windows";
        }
        if (navigator.appVersion.indexOf("Mac") !== -1) {
            return "MacOS";
        }
        if (navigator.appVersion.indexOf("X11") !== -1) {
            return "UNIX";
        }
        if (navigator.appVersion.indexOf("Linux") !== -1) {
            return "Linux";
        }
        else {
            return "unknown";
        }
    };
    
    var setKeyboardModifierString = function (uploaderContainer, modifierKeySelector) {
        // set the text difference for the instructions based on Mac or Windows
        if (whichOS() === 'MacOS') {
            $(modifierKeySelector, uploaderContainer).text(strings.macControlKey);
        }
    };
    
    var bindEvents = function (uploader, uploaderContainer, swfObj, allowMultipleFiles, whenDone, whenCancel) {

        // browse button
        var activateBrowse = function () {
            if (uploadState(uploaderContainer) !== "uploading") {
                return (allowMultipleFiles) ? swfObj.selectFiles() : swfObj.selectFile();
            }
        };
        var browseButton = $(uploader.fragmentSelectors.browse, uploaderContainer);		
        browseButton.click(activateBrowse);
        browseButton.tabbable();
        
        fluid.utils.debug();
        
        var fileQueue = $(uploader.fragmentSelectors.fileQueue, uploaderContainer);
        fileQueue.selectable({selectableSelector: uploader.fragmentSelectors.queueRow });
        
        // upload button
        $(uploader.fragmentSelectors.upload, uploaderContainer).click(function(){
            if ($(uploader.fragmentSelectors.upload, uploaderContainer).css('cursor') === 'pointer') {
                uploader.actions.beginUpload();
            }
        });
        
        // resume button
        $(uploader.fragmentSelectors.resume, uploaderContainer).click(function(){
            if ($(uploader.fragmentSelectors.resume, uploaderContainer).css('cursor') === 'pointer') {
                uploader.actions.beginUpload();
            }
        });
        
        // pause button
        $(uploader.fragmentSelectors.pause, uploaderContainer).click(function(){
            swfObj.stopUpload();
        });
        
        // done button
        $(uploader.fragmentSelectors.done, uploaderContainer).click(function(){
            if (uploadState(uploaderContainer) !== "uploading") {
                variableAction(whenDone);
            }
        });
        
        // cancel button
        $(uploader.fragmentSelectors.cancel, uploaderContainer).click(function(){
            variableAction(whenCancel);
        });
    };
    
    var enableDemoMode = function (uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj) {
        // this is a local override to do a fake upload
        swfObj.startUpload = function(){
            demoUpload(uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj);
        };
        swfObj.stopUpload = function(){
            status.stop = true;
        };
    };
    
    /* Public API */
    fluid.Uploader = function(uploaderContainerId, uploadURL, flashURL, settings){
        
        this.uploaderContainer = fluid.utils.jById(uploaderContainerId);
        
        // Mix user's settings in with our defaults.
        // temporarily public; to be made private after beta
        this.options = $.extend({}, uploadDefaults, settings);
        
        this.fragmentSelectors = this.options.fragmentSelectors;
        
        // Should the status object be more self-aware? Should various functions that operate on
        // it (and do little else) be encapsulated in it?
        this.status = {
            totalBytes:0,
            currBytes:0,
            currError:'',
            continueOnError: false,
            stop: false
        };
        
        var progressOptions = {
            progress: this.uploaderContainer,
            fileProgressor: this.fragmentSelectors.fileProgressor,
            fileText: this.fragmentSelectors.fileProgressText,
            totalProgressor: this.fragmentSelectors.totalProgressor,
            totalText: this.fragmentSelectors.totalProgressText,
            totalProgressContainer: this.fragmentSelectors.uploaderFooter
        };
        
        var progressBar = new fluid.Progress(progressOptions);
                    
        var allowMultipleFiles = (this.options.fileQueueLimit !== 1);

        // displaying Uploader in a dialog
        if (this.options.dialogDisplay) {
            var dialogObj = initDialog(this.uploaderContainer, this.options.addFilesBtn, this.options.browseOnInit, this.fragmentSelectors.browse);
        }

        var swfObj = initSWFUpload(this.uploaderContainer, uploadURL, flashURL, progressBar, this.status, this.fragmentSelectors, this.options, allowMultipleFiles, dialogObj);
        
        // remove the swfObj from the focusable elements (mostly for IE6)
        $('#' + swfObj.movieName).tabindex('-1');
        
        this.actions = new fluid.SWFWrapper(swfObj);
        
        setKeyboardModifierString(this.uploaderContainer, this.fragmentSelectors.osModifierKey);
        
        // Bind all our event handlers.
        bindEvents(this, this.uploaderContainer, swfObj, allowMultipleFiles, this.options.whenDone, this.options.whenCancel);
        
        // make the file queue tabbable
        $(this.fragmentSelectors.fileQueue).tabbable();
        
        // If we've been given an empty URL, kick into demo mode.
        if (uploadURL === '') {
            enableDemoMode(this.uploaderContainer, swfObj, progressBar, this.options, this.fragmentSelectors, this.status, dialogObj);
        }
    };
    
    // temporary debuggin' code to be removed after beta
    // USE: call from the console to check the current state of the options and fragmentSelectors objects
    
    fluid.Uploader.prototype._test = function() {
        var str = "";
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                str += key + ' = ' + options[key] + '\n';
            }
        }
        for (key in this.fragmentSelectors) {
           if (this.fragmentSelectors.hasOwnProperty(key)) {
               str += key + ' = ' + this.fragmentSelectors[key] + '\n';
           }
        }
        fluid.utils.debug (str);
    };
    
    fluid.SWFWrapper = function (swfObject) {
        this.swfObj = swfObject;
    };
    
    fluid.SWFWrapper.prototype.beginUpload = function() {
        this.swfObj.startUpload();
    };
    
})(jQuery,fluid);

/* PROGRESS
 *  
 */

(function ($) {
         
    function animateToWidth(elm,width) {
        elm.animate({ 
            width: width,
            queue: false
        }, 200 );
    }
    
    var hideNow = function(which){
        $(which).fadeOut('slow');
    };      

	var initARIA = function(container){
		container.ariaRole("progressbar");
		container.ariaState("valuemin","0");
		container.ariaState("valuemax","100");
		container.ariaState("live","assertive");
		container.ariaState("busy","false");
		container.ariaState("valuenow","0");
		container.ariaState("valuetext","");
	};
    
    var updateARIA = function(container, percent){
        var busy = percent < 100 && percent > 0;
        container.ariaState("busy",busy);
	    container.ariaState("valuenow",percent);	
        if (busy){
            container.ariaState("valuetext", "Upload is "+percent+" percent complete");
        } else if (percent === 100) {
            container.ariaState("valuetext", "Upload is complete. To upload more files, click the Add More button.");
        }
	};

    /* Constructor */
    fluid.Progress = function (options) {
        this.minWidth = 5;
        this.progressContainer = options.progress;
        this.fileProgressElm = $(options.fileProgressor, this.progressContainer);
        this.fileTextElm = $(options.fileText, this.progressContainer);
        this.totalProgressElm = $(options.totalProgressor, this.progressContainer);
        this.totalTextElm = $(options.totalText, this.progressContainer);
        this.totalProgressContainer = $(options.totalProgressContainer, this.progressContainer);
        
        this.totalProgressElm.width(this.minWidth);
        
        this.fileProgressElm.hide();
        this.totalProgressElm.hide();

	    initARIA(this.totalProgressContainer);
    };
    
    fluid.Progress.prototype.init = function(fileRowSelector){
        
        this.currRowElm = $(fileRowSelector,this.progressContainer);
        
        // hide file progress in case it is showing
        this.fileProgressElm.width(this.minWidth);
        
        // set up the file row
        this.fileProgressElm.css('top',(this.currRowElm.position().top)).height(this.currRowElm.height()).width(this.minWidth);
        // here to make up for an IE6 bug
        if ($.browser.msie && $.browser.version < 7) {
            this.totalProgressElm.height(this.totalProgressElm.siblings().height());
        }	
        
        // show both
        this.totalProgressElm.show();
        this.fileProgressElm.show();
    };
    
    fluid.Progress.prototype.updateProgress = function(which, percent, text, dontAnimate) {
        if (which === 'file') {
            setProgress(percent, text, this.fileProgressElm, this.currRowElm, this.fileTextElm, dontAnimate);
        } else {
            setProgress(percent, text, this.totalProgressElm, this.totalProgressContainer, this.totalTextElm, dontAnimate);
            updateARIA(this.totalProgressContainer, percent);
        }
    };

    var setProgress = function(percent, text, progressElm, containerElm, textElm, dontAnimate) {
        var containerWidth = containerElm.width();	
        var currWidth = progressElm.width();
        var newWidth = ((percent * containerWidth)/100);
        
        // de-queue any left over animations
        progressElm.queue("fx", []); 
        
        textElm.html(text);
        
        if (percent === 0) {
            progressElm.width(this.minWidth);
        } else if (newWidth < currWidth || dontAnimate) {
            progressElm.width(newWidth);
        } else {
            animateToWidth(progressElm,newWidth);
        }
    };
        
    fluid.Progress.prototype.hide = function(dontPause) {
        var delay = 1600;
        if (dontPause) {
            hideNow(this.fileProgressElm);
            hideNow(this.totalProgressElm);
        } else {
            var timeOut = setTimeout(function(){
                hideNow(this.fileProgressElm);
                hideNow(this.totalProgressElm);
            }, delay);
        }
    };
    
    fluid.Progress.prototype.show = function() {
        this.progressContainer.fadeIn('slow');
    };
    
    /*****************************
     * Public Utility Functions. *
     *****************************/
    
    fluid.utils = fluid.utils || {};
    
    /**
     * Pretty prints a file's size, converting from bytes to kilobytes or megabytes.
     * 
     * @param {Number} bytes the files size, specified as in number bytes.
     */
    fluid.utils.formatFileSize = function (bytes) {
        if (typeof bytes === "number") {
            if (bytes === 0) {
                return "0.0 KB";
            } else if (bytes > 0) {
                if (bytes < 1048576) {
                    return (Math.ceil(bytes / 1024 * 10) / 10).toFixed(1) + " KB";
                }
                else {
                    return (Math.ceil(bytes / 1048576 * 10) / 10).toFixed(1) + " MB";
                }
            }
        }
        return "";
    };
    
})(jQuery, fluid);




//fluid.Progress.update('.fluid-progress','.file-progress',40,"Label Change");


/* GRAVEYARD and SCRATCH
    
    // eventually used to create fileTypes sets.
    var fileTypes = {
        all: {
            ext: "*.*",
            desc: 'all files'
        },
        images: {
            ext: "*.gif;*.jpeg;*.jpg;*.png;*.tiff",
            desc: "image files"
        },
        text:"*.txt;*.text",
        Word:"*.doc;*.xdoc",
        Excel:"*.xls",
    }

    // for use in a better way of setting state to simplify structure
    states: "start uploading browse loaded reloaded paused empty done",

*/
/*

Copyright 2008 University of Cambridge
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {
    
  // The three states of the undo component
    var STATE_INITIAL = "state_initial", 
        STATE_CHANGED = "state_changed",
        STATE_REVERTED = "state_reverted";
  
    function defaultRenderer(that, targetContainer) {
        var markup = "<span class='fluid-undo'>" + 
          "<span class='undoContainer'>[<a href='#' class='undoControl'>undo</a>]</span>" + 
          "<span class='redoContainer'>[<a href='#' class='redoControl'>redo</a>]</span>" + 
        "</span>";
        var markupNode = $(markup);
        targetContainer.append(markupNode);
        return markupNode;
    }
  
    function render(that) {
        if (that.state === STATE_INITIAL) {
            that.locate("undoContainer").hide();
            that.locate("redoContainer").hide();
        }
        else if (that.state === STATE_CHANGED) {
            that.locate("undoContainer").show();
            that.locate("redoContainer").hide();
        }
        else if (that.state === STATE_REVERTED) {
            that.locate("undoContainer").hide();
            that.locate("redoContainer").show();          
        }
    }
    
    function bindHandlers(that) {
        that.component.modelFirer.addListener(
            function () {
                that.state = STATE_CHANGED;
                render(that);
            }
        );
        
        that.locate("undoControl").click( 
            function () {
                fluid.model.copyModel(that.extremalModel, that.component.model);
                fluid.model.copyModel(that.component.model, that.initialModel);
                that.component.render();
                that.state = STATE_REVERTED;
                render(that);
            }
        );
        that.locate("redoControl").click( 
            function () {
                fluid.model.copyModel(that.component.model, that.extremalModel);
                that.component.render();
                that.state = STATE_CHANGED;
                render(that);
            }
        );
    }
    /**
     * Decorates a target component with the function of "undoability"
     * 
     * @param {Object} component a "model-bearing" standard Fluid component to receive the "undo" functionality
     * @param {Object} options a collection of options settings
     */
    fluid.undoDecorator = function (component, userOptions) {
        var that = fluid.initView("undo", null, userOptions);
        that.container = that.options.renderer(that, component.container);
        fluid.initDomBinder(that);
        
        that.component = component;
        that.initialModel = {};
        that.extremalModel = {};
        fluid.model.copyModel(that.initialModel, component.model);
        
        that.state = STATE_INITIAL;
        
        render(that);
        bindHandlers(that);
        return that;
    };
  
    fluid.defaults("undo", {  
        selectors: {
            undoContainer: ".undoContainer",
            undoControl: ".undoControl",
            redoContainer: ".redoContainer",
            redoControl: ".redoControl"
        },
                    
        renderer: defaultRenderer
    });
        
})(jQuery, fluid);/*
Copyright 2008 University of Cambridge
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {
    function setCaretToStart(control) {
        if (control.createTextRange) {
            var range = control.createTextRange();
            range.collapse(true);
            range.select();
        } else if (control.setSelectionRange) {
            control.focus();
            control.setSelectionRange(0, 0);
        }
    }
    
    // Is paddings doing what we want? Should it be in the CSS file instead?
    function edit(that) {
        var viewEl = that.viewEl;
        var displayText = viewEl.text();
        that.updateModel(displayText === that.options.defaultViewText? "" : displayText);
        that.editField.width(Math.max(viewEl.width() + that.options.paddings.edit, that.options.paddings.minimumEdit));

        viewEl.removeClass(that.options.styles.invitation);
        viewEl.removeClass(that.options.styles.focus);
        viewEl.hide();
        that.editContainer.show();
        if (that.tooltipEnabled()) {
            $("#" + that.options.tooltipId).hide();
        }

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            that.editField.focus();
            if (that.options.selectOnEdit) {
                that.editField[0].select();
            }
            else {
                setCaretToStart(that.editField[0]);
            }
        }, 0);
    }



    function clearEmptyViewStyles(textEl, defaultViewStyle, originalViewPadding) {
        textEl.removeClass(defaultViewStyle);
        textEl.css('padding-right', originalViewPadding);
    }
    
    
    function showDefaultViewText(that) {
        that.viewEl.text(that.options.defaultViewText);
        that.viewEl.addClass(that.options.styles.defaultViewText);
    }
    

    function showNothing(that) {
        that.viewEl.text("");
       // workaround for FLUID-938, IE can not style an empty inline element, so force element to be display: inline-block
       
        if ($.browser.msie) {
            if (that.viewEl.css('display') === 'inline') {
                that.viewEl.css('display', "inline-block");
            }
        }
        
        // If necessary, pad the view element enough that it will be evident to the user.
        if (that.existingPadding < that.options.paddings.minimumView) {
            that.viewEl.css('padding-right',  that.options.paddings.minimumView);
        }
    }

    function showEditedText(that) {
        that.viewEl.text(that.model.value);
        clearEmptyViewStyles(that.viewEl, that.options.defaultViewStyle, that.existingPadding);
    }

    function finish(that) {
        if (that.options.finishedEditing) {
            that.options.finishedEditing(that.editField[0], that.viewEl[0]);
        }
        that.updateModel(that.editField.val());
        
        that.editContainer.hide();
        that.viewEl.show();
    }
        
    function makeEditHandler(that) {
        return function () {
            edit(that);
            return false;
        }; 
    }
    
    function bindHoverHandlers(viewEl, invitationStyle) {
        var over = function (evt) {
            viewEl.addClass(invitationStyle);
        };     
        var out = function (evt) {
            viewEl.removeClass(invitationStyle);
        };

        viewEl.hover(over, out);
    }
    
    function bindMouseHandlers(that) {
        bindHoverHandlers(that.viewEl, that.options.styles.invitation);
        that.viewEl.click(makeEditHandler(that));
    }
    
    function bindKeyHighlight(viewEl, focusStyle, invitationStyle) {
        var focusOn = function () {
            viewEl.addClass(focusStyle);
            viewEl.addClass(invitationStyle); 
        };
        var focusOff = function () {
            viewEl.removeClass(focusStyle);
            viewEl.removeClass(invitationStyle);
        };
        viewEl.focus(focusOn);
        viewEl.blur(focusOff);
    }
    
    function bindKeyboardHandlers(that) {
        that.viewEl.tabbable();
        bindKeyHighlight(that.viewEl, that.options.styles.focus, that.options.styles.invitation);
        that.viewEl.activatable(makeEditHandler(that));
    } 
    
    function bindEditFinish(that) {
        var finishHandler = function (evt) {
            // Fix for handling arrow key presses see FLUID-760
            var code = (evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0));
            if (code !== $.a11y.keys.ENTER) {
                return true;
            }
            
            finish(that);
            that.viewEl.focus();  // Moved here from inside "finish" to fix FLUID-857
            return false;
        };
        that.editContainer.keypress(finishHandler);
    }
    
    function bindBlurHandler(that) {
        var blurHandler = function (evt) {
            finish(that);
            return false;
        };
        that.editField.blur(blurHandler);
    }
    
    function aria(viewEl, editContainer) {
        viewEl.ariaRole("button");
    }
    
    var bindToDom = function (that, container) {
        // Bind to the DOM.
        that.viewEl = that.locate("text");

        // If an edit container is found in the markup, use it. Otherwise generate one based on the view text.
        that.editContainer = $(that.options.selectors.editContainer, that.container);
        if (that.editContainer.length >= 1) {
            var isEditSameAsContainer = that.editContainer.is(that.options.selectors.edit);
            var containerConstraint = isEditSameAsContainer ? that.container : that.editContainer;
            that.editField =  $(that.options.selectors.edit, containerConstraint);
        } else {
            var editElms = that.options.editModeRenderer(that);
            that.editContainer = editElms.container;
            that.editField = editElms.field;
        }
    };
    
    var defaultEditModeRenderer = function (that) {
        // Template strings.
        var editModeTemplate = "<span><input type='text' class='edit'/></span>";

        // Create the edit container and pull out the textfield.
        var editContainer = $(editModeTemplate);
        var editField = jQuery("input", editContainer);
        
        var componentContainerId = that.container.attr("id");
        // Give the container and textfield a reasonable set of ids if necessary.
        if (componentContainerId) {
            var editContainerId = componentContainerId + "-edit-container";
            var editFieldId = componentContainerId + "-edit";   
            editContainer.attr("id", editContainerId);
            editField.attr("id", editFieldId);
        }
        
        editField.val(that.model.value);
        
        // Inject it into the DOM.
        that.container.append(editContainer);
        
        // Package up the container and field for the component.
        return {
            container: editContainer,
            field: editField
        };
    };
    
    
    var setupInlineEdit = function (componentContainer, that) {
        bindToDom(that, componentContainer);
        var padding = that.viewEl.css("padding-right");
        that.existingPadding = padding? parseFloat(padding) : 0;
        that.updateModel(that.viewEl.text());
        
        // Add event handlers.
        bindMouseHandlers(that);
        bindKeyboardHandlers(that);
        bindEditFinish(that);
        bindBlurHandler(that);
        
        // Add ARIA support.
        aria(that.viewEl, that.editContainer);
                
        // Hide the edit container to start
        that.editContainer.hide();
        
        var initTooltip = function () {
            // Add tooltip handler if required and available
            if (that.tooltipEnabled()) {
                $(componentContainer).tooltip({
                    delay: that.options.tooltipDelay,
                    extraClass: that.options.styles.tooltip,
                    bodyHandler: function () { 
                        return that.options.tooltipText; 
                    },
                    id: that.options.tooltipId
                });
            }
        };

        // when the document is ready, initialize the tooltip
        // see http://issues.fluidproject.org/browse/FLUID-1030
        jQuery(initTooltip);
    };
    
    
    /**
     * Instantiates a new Inline Edit component
     * 
     * @param {Object} componentContainer a selector, jquery, or a dom element representing the component's container
     * @param {Object} options a collection of options settings
     */
    fluid.inlineEdit = function (componentContainer, userOptions) {
      
        var that = fluid.initView("inlineEdit", componentContainer, userOptions);
       
        that.model = {value: ""};
       
        that.modelFirer = fluid.event.getEventFirer();
        
        that.edit = function () {
            edit(that);
        };
        
        that.finish = function () {
            finish(that);
        };
            
        that.tooltipEnabled = function () {
            return that.options.useTooltip && $.fn.tooltip;
        };
        
        that.render = function (source) {
            if (that.model.value) {
                showEditedText(that);
            } else if (that.options.defaultViewText) {
                showDefaultViewText(that);
            } else {
                showNothing(that);
            }
          
            if (that.editField && that.editField.index(source) === -1) {
                that.editField.val(that.model.value);
            }
        };
        
        that.updateModel = function (newValue, source) {
            var change = that.model.value !== newValue;
            if (change) {
                that.model.value = newValue;
                that.modelFirer.fireEvent(newValue);
            }
            that.render(source); // Always render, because of possibility of initial event
        };

        setupInlineEdit(componentContainer, that);
        
        fluid.initDecorators(that);
        
        return that;
    };
    
    /**
     * A set of inline edit fields.
     */
    var setupInlineEdits = function (editables, options) {
        var editors = [];
        editables.each(function (idx, editable) {
            editors.push(fluid.inlineEdit(jQuery(editable), options));
        });
        
        return editors;
    };

    fluid.inlineEdits = function (componentContainer, options) {
        options = options || {};
        var selectors = $.extend({}, fluid.defaults("inlineEdits").selectors, options.selectors);
        
        // Bind to the DOM.
        var container = fluid.container(componentContainer);
        var editables = $(selectors.editables, container);
        
        return setupInlineEdits(editables, options);
    };
    
    fluid.defaults("inlineEdit", {  
        selectors: {
            text: ".text",
            editContainer: ".editContainer",
            edit: ".edit"
        },
        
        styles: {
            invitation: "inlineEdit-invitation",
            defaultViewText: "inlineEdit-invitation-text",
            tooltip: "inlineEdit-tooltip",
            focus: "inlineEdit-focus"
        },
        
        paddings: {
            edit: 10,
            minimumEdit: 80,
            minimumView: 60
        },
        
        editModeRenderer: defaultEditModeRenderer,
        
        defaultViewText: "Click here to edit",
        
        tooltipText: "Click item to edit",
        
        tooltipId: "tooltip",
        
        useTooltip: false,
        
        tooltipDelay: 2000,
        
        selectOnEdit: false
    });
    
    
    fluid.defaults("inlineEdits", {
        selectors: {
            editables: ".inlineEditable"
        }
    });
})(jQuery, fluid);
/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {
    
    /*
     * Start Pager Link Display 
     */
    
    /**   Private stateless functions   **/
    var updateStyles = function (pageLinks, currentPageStyle, pageNum, oldPageNum) {
        var pageLink, oldLink;
        
        pageLink = $(pageLinks[pageNum - 1]);
        pageLink.addClass(currentPageStyle); 

        if (oldPageNum) {
            oldLink = $(pageLinks[oldPageNum - 1]);
            oldLink.removeClass(currentPageStyle);
        }
        
    };

    var updatePreviousNext = function (previous, next, pageNum, numPageLinks, disabledStyle) {
        if (pageNum < 2) {
            previous.addClass(disabledStyle);
        } else {
            previous.removeClass(disabledStyle);
        }
        
        if (pageNum >= numPageLinks) {
            next.addClass(disabledStyle);
        } else {
            next.removeClass(disabledStyle);
        }
    };
   
    /**   Pager Link Display creator   **/
   
    fluid.pagerLinkDisplay = function (pageLinks, previous, next, currentPageStyle, disabledStyle, pageWillChange) {

        return {
            pageLinks: pageLinks,
            previous: previous,
            next: next,
            selectPage: function (pageNum, oldPageNum) {
                // Do we really want to pass the DOM element or do we just want the page number?
                if (pageWillChange) {
                    var pageLink = $(pageLinks[pageNum - 1]);
                    pageWillChange(pageLink[0]);
                }
                updateStyles(pageLinks, currentPageStyle, pageNum, oldPageNum);
                updatePreviousNext(previous, next, pageNum, pageLinks.length, disabledStyle);        
            },
            pageIsSelected: function (pageNum, oldPageNum) {
                updateStyles(pageLinks, currentPageStyle, pageNum, oldPageNum);        
                updatePreviousNext(previous, next, pageNum, pageLinks.length, disabledStyle);        
            }

        };
    };
   
    /*
     * Start of Pager Bar
     */

    /**   Pager Bar creator   **/

    fluid.pagerBar = function (bar, selectors, currentPageStyle, disabledStyle, pageWillChange) {  
        var pageLinks, previous, next, linkDisplay, isPageLink, isNext, isPrevious;
              
        pageLinks = $(selectors.pageLinks, bar);
        previous = $(selectors.previous, bar);
        next = $(selectors.next, bar);
        
        linkDisplay = fluid.pagerLinkDisplay(pageLinks, previous, next, currentPageStyle, disabledStyle, pageWillChange);
        
        isPageLink = function (element) {
            return pageLinks.index(element) > -1;
        };
        isNext = function (element) {
            return (element === next[0]);
        };
        isPrevious = function (element) {
            return (element === previous[0]);
        };
    
        return {
            bar: bar,
            linkDisplay: linkDisplay,
            selectPage: function (pageNum, oldPageNum) {
                linkDisplay.selectPage(pageNum, oldPageNum);
            },
            pageIsSelected: function (pageNum, oldPageNum) {
                linkDisplay.pageIsSelected(pageNum, oldPageNum);
            },
            pageNumOfLink: function (link) {
                link = fluid.utils.findAncestor(link, isPageLink);
                return pageLinks.index(link) + 1;
            },
            isNext: function (link) {
                return !!fluid.utils.findAncestor(link, isNext);
            },
            isPrevious: function (link) {
                return !!fluid.utils.findAncestor(link, isPrevious);
            }
        };
    };

    /* 
     * Start of the Pager
     */
    
    /**   Private stateless functions   **/
    var bindSelectHandler = function (pager) {
        var selectHandler = function (evt) {
            // We need a better way of checking top and bottom bar. This is so repetitive.
            if (pager.topBar.isNext(evt.target) || pager.bottomBar.isNext(evt.target)) {
                pager.next();
                return false;
            }
            if (pager.topBar.isPrevious(evt.target) || pager.bottomBar.isPrevious(evt.target)) {
                pager.previous();
                return false;
            }
            var newPageNum = pager.topBar.pageNumOfLink(evt.target) || pager.bottomBar.pageNumOfLink(evt.target);
            if (newPageNum < 1) {
                return true;
            }

            pager.selectPage(newPageNum);
            return false;
        };

        pager.container.click(selectHandler);
    };

    /**   Constructor  **/ 
               
    fluid.Pager = function (componentContainerId, options) {
        var selectors, top, bottom;
        
        // Mix in the user's configuration options.
        options = options || {};
        selectors = $.extend({}, this.defaults.selectors, options.selectors);
        this.styles = $.extend({}, this.defaults.styles, options.styles);
        this.pageWillChange = options.pageWillChange || this.defaults.pageWillChange; 

        // Bind to the DOM.
        this.container = fluid.utils.jById(componentContainerId);
        
        // Create pager bars
        top = $(selectors.pagerTop, this.container);
        this.topBar = fluid.pagerBar(top, selectors, this.styles.currentPage, this.styles.disabled, this.pageWillChange);
        bottom = $(selectors.pagerBottom, this.container);
        this.bottomBar = fluid.pagerBar(bottom, selectors, this.styles.currentPage, this.styles.disabled, this.pageWillChange);

        this.pageNum = 1;
        this.topBar.pageIsSelected(this.pageNum);
        this.bottomBar.pageIsSelected(this.pageNum);
        
        bindSelectHandler(this);
    };
 
     /**   Public stuff   **/   
     
    fluid.Pager.prototype.defaults = {
        selectors: {
            pagerTop: ".pager-top",
            pagerBottom: ".pager-bottom",
            pageLinks: ".page-link",
            previous: ".previous",
            next: ".next"
        },

        styles: {
            currentPage: "current-page",
            disabled: "disabled"
        },
        
        pageWillChange: function (link) {
            // AJAX call here
        }
    };
    
    fluid.Pager.prototype.selectPage = function (pageNum) {
        if (pageNum === this.pageNum) {
            return;
        }
        this.topBar.selectPage(pageNum, this.pageNum);
        this.bottomBar.pageIsSelected(pageNum, this.pageNum);
        this.pageNum = pageNum;
    };
    
    fluid.Pager.prototype.next = function () {
        // this test needs to be refactored - we know too much about the implementation I think
        if (this.pageNum < this.topBar.linkDisplay.pageLinks.length) {
            this.selectPage(this.pageNum + 1);
        }
    };
   
    fluid.Pager.prototype.previous = function () {
        if (this.pageNum > 1) {
            this.selectPage(this.pageNum - 1);
        }
    };
    
})(jQuery, fluid);
/*
    json2.js
    2007-11-06

    Public Domain

    No warranty expressed or implied. Use at your own risk.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods:

        JSON.stringify(value, whitelist)
            value       any JavaScript value, usually an object or array.

            whitelist   an optional that determines how object values are
                        stringified.

            This method produces a JSON text from a JavaScript value.
            There are three possible ways to stringify an object, depending
            on the optional whitelist parameter.

            If an object has a toJSON method, then the toJSON() method will be
            called. The value returned from the toJSON method will be
            stringified.

            Otherwise, if the optional whitelist parameter is an array, then
            the elements of the array will be used to select members of the
            object for stringification.

            Otherwise, if there is no whitelist parameter, then all of the
            members of the object will be stringified.

            Values that do not have JSON representaions, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped, in arrays will be replaced with null. JSON.stringify()
            returns undefined. Dates will be stringified as quoted ISO dates.

            Example:

            var text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'

        JSON.parse(text, filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function that can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = JSON.parse(text, function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load third party
    code into your pages.
*/

/*jslint evil: true */
/*extern JSON */

if (!this.JSON) {

    JSON = function () {

        function f(n) {    // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function () {

// Eventually, this method will be based on the date.toISOString method.

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };


        var m = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

        function stringify(value, whitelist) {
            var a,          // The array holding the partial texts.
                i,          // The loop counter.
                k,          // The member key.
                l,          // Length.
                r = /["\\\x00-\x1f\x7f-\x9f]/g,
                v;          // The member value.

            switch (typeof value) {
            case 'string':

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe sequences.

                return r.test(value) ?
                    '"' + value.replace(r, function (a) {
                        var c = m[a];
                        if (c) {
                            return c;
                        }
                        c = a.charCodeAt();
                        return '\\u00' + Math.floor(c / 16).toString(16) +
                                                   (c % 16).toString(16);
                    }) + '"' :
                    '"' + value + '"';

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                return String(value);

            case 'object':

// Due to a specification blunder in ECMAScript,
// typeof null is 'object', so watch out for that case.

                if (!value) {
                    return 'null';
                }

// If the object has a toJSON method, call it, and stringify the result.

                if (typeof value.toJSON === 'function') {
                    return stringify(value.toJSON());
                }
                a = [];
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    l = value.length;
                    for (i = 0; i < l; i += 1) {
                        a.push(stringify(value[i], whitelist) || 'null');
                    }

// Join all of the elements together and wrap them in brackets.

                    return '[' + a.join(',') + ']';
                }
                if (whitelist) {

// If a whitelist (array of keys) is provided, use it to select the components
// of the object.

                    l = whitelist.length;
                    for (i = 0; i < l; i += 1) {
                        k = whitelist[i];
                        if (typeof k === 'string') {
                            v = stringify(value[k], whitelist);
                            if (v) {
                                a.push(stringify(k) + ':' + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (typeof k === 'string') {
                            v = stringify(value[k], whitelist);
                            if (v) {
                                a.push(stringify(k) + ':' + v);
                            }
                        }
                    }
                }

// Join all of the member texts together and wrap them in braces.

                return '{' + a.join(',') + '}';
            }
        }

        return {
            stringify: stringify,
            parse: function (text, filter) {
                var j;

                function walk(k, v) {
                    var i, n;
                    if (v && typeof v === 'object') {
                        for (i in v) {
                            if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                                n = walk(i, v[i]);
                                if (n !== undefined) {
                                    v[i] = n;
                                }
                            }
                        }
                    }
                    return filter(k, v);
                }


// Parsing happens in three stages. In the first stage, we run the text against
// regular expressions that look for non-JSON patterns. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we want to reject all
// unexpected forms.

// We split the first stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace all backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.test(text.replace(/\\./g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

// In the optional third stage, we recursively walk the new structure, passing
// each name/value pair to a filter function for possible transformation.

                    return typeof filter === 'function' ? walk('', j) : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('parseJSON');
            }
        };
    }();
}
