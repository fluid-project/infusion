# Overview

The "[sass](./)" directory contains Sass files for generating the Preference Framework stylesheets. These stylesheets
are used to style the Preference Editors as well provide the means for applying enactor styles to a website. The Sass
files may be used directly within an integrators own build tools, or the pre-built CSS equivalents can be used directly
on a web page.

_**Note:** The sass files are deprecated. In the future only css may be provided._

## How to prevent compiling utility Sass files

Some Sass files may only contain mixins or functions for other Sass files to import. Those files should not be
compiled into CSS. To prevent compiling them, ensure that their filename begins with an underscore, e.g. `_fonts.scss`.
For more information about this convention see [Sass's documentation on partials](https://sass-lang.com/guide#topic-4).

## Enactor Stylesheets

Enactors modify a website to meet the preferences specified in a Preferences Editor. However, not all enactors modify
the styling of a website. For those that do, stylesheets are provided to facilitate this application. Each stlying
related enactor will provide its own stylesheet(s), so that an integrator can import only the styles for the enactors
they are using in their particular configuration. Althernatively the `Enactors` stylesheets can be used to quickly
access all of the available styling enactors styles.

### Base Styleheets

The styling related enactors use [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
as hooks for applying the styling. Some enactors such as `Text Size`, set their CSS custom properties via JavaScript,
others supply them via classes in their related `*_base` stylesheet. For example the `Enhance Inputs` preference uses
the `EnhanceInputs_base` stylesheet. An integrator can hook into the enactor's CSS custom properties to implement their
own styles, allowing the site to automatically adapt along with the preference changes.

### Drop-in Style Application

To allow for quicker initial integration with the Preferences Framework/UI Options, an integrator may choose to use the
drop-in styles sheets, which will additionally provide a set of pre-designed styles to apply the prefernce. For example
the `Enhance Inputs` preference provides the `EnhanceInputs` stylesheet. `Enactors.css` will provide the complete set of
enactors styles with their application; similar to how previous versions of Infusion supported styling enactors.

_**NOTE**: The drop-in styles are necessarily heavy handed, and include `!important` to attempt to override default
styles. If these need to be overridden, it may be better to use the `*_base` stylesheets and build up custom styles for
the site._

## CSS Custom Properties

### Contrast

The below CSS custom properties are set when one of the contrast classes (e.g. `.fl-theme-bw`) is applied. However, not
every class sets all of the properties.

* `--fl-fgColor`: foreground colour, often text colour
* `--fl-bgColor`: background colour
* `--fl-linkColor`: text colour for links (deprecated: use `--fl-linkFgColor`)
* `--fl-linkFgColor`: text colour for links
* `--fl-linkBgColor`: background colour for links
* `--fl-disabledColor`: text colour for disabled inputs (deprecated: use `--fl-disabledFgColor`)
* `--fl-disabledFgColor`: text colour for disabled inputs
* `--fl-disabledBgColor`: background colour for disabled inputs
* `--fl-selectedFgColor`: colour for selected text
* `--fl-selectedBgColor`: selection background colour
* `--fl-buttonFgColor`: text colour for buttons
* `--fl-buttonBgColor`: background colour for buttons

### Enhance Inputs

The CSS Custom properties added by the `.fl-input-enhanced` class:

* `--fl-enhance-font-size-factor`: (default is 1.25) the factor of the font-size increase, can be used with `calc`.
* `--fl-enhance-font-size`: (default is 125%) the font-size value
* `--fl-enhance-font-weight`: (default is bold) font-weight value
* `--fl-enhance-text-decoration`: (default is underline) the text-decoration value. Used to enhance links.

### Font

Makes use of the `utils/_fonts.scss` for mixin functions; which may be useful if defining custom fonts for use with the
Preferences Framework.

The following custom property is set when one of the font classess (e.g. `fl-font-arial`) is applied.

* `--fl-font-family`: the font family to apply

### Letter Space

Set programmatically with JavaScript on the enactors container element, usually the body.

* `--fl-letterSpace-factor`: the factor of the letter space change, can be used with `calc`.
* `--fl-letterSpace`: the letter-spacing value

### Line Space

Set programmatically with JavaScript on the enactors container element, usually the body.

* `--fl-lineSpace-factor`: the factor of the line height change, can be used with `calc`.
* `--fl-lineSpace`: the line-height value

### Text Size

Set programmatically with JavaScript on the enactors container element, usually the body.

* `--fl-textSize-factor`: the factor of the font size change, can be used with `calc`.
* `--fl-textSize`: the font-size value

### Word Space

Set programmatically with JavaScript on the enactors container element, usually the body.

* `--fl-wordSpace-factor`: the factor of the word-spacing change, can be used with `calc`.
* `--fl-wordSpace`: the word-spacing value
