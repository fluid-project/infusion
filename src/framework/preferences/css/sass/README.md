# Overview

The "[sass](./)" directory contains Sass files for generating the Preference Framework stylesheets.

## How to add a new theme

Define your own theme variables in `utils/Themes.scss` using the following approach.

```scss
    // The CSS class that the Preferences Framework uses to enable this contrast theme.
    // The convention is to give the theme a descriptive name (e.g. 'bw' for black on white)
    // and prefix it with 'fl-theme-'.
    .fl-theme-mytheme {
        --fl-fgColor: #000000; // General foreground colour (used for text and borders).
        --fl-bgColor: #ffffff; // General background colour.
        --fl-linkColor: #000000; // Optional, defaults to --fl-fgColor.
        --fl-disabledColor: #cc0000; // Optional, ignored if not supplied.
        --fl-selectedFgColor: #ffffff; // Optional, ignored if not supplied.
        --fl-selectedBgColor: #008000; // Optional, ignored if not supplied.
        --fl-buttonFgColor: #ffffff; // Optional, defaults to --fl-fgColor.
        --fl-buttonBgColor: #000000; // Optional, defaults to --fl-bgColor.
    }
```

## How to prevent compiling utility Sass files

Some Sass files may only contain mixins or functions for other Sass files to import. Those files should not be
compiled into CSS. To prevent compiling them, ensure that their filename begins with an underscore, e.g. `_fonts.scss`.
For more information about this convention see [Sass's documentation on partials](https://sass-lang.com/guide#topic-4).
