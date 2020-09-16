# Overview

The "[stylus](./)" directory contains Stylus files for generating the Preference Framework stylesheets.

## How to add a new theme

Define your own theme variables in `utils/Themes.styl` using the following approach.

```stylus
    .fl-theme-selector { // The CSS class that the Preferences Framework uses to enable this contrast theme.
        --fl-fgColor: #000000;
        --fl-bgColor: #ffffff;
        --fl-linkColor: #000000; // Optional, defaults to --fl-fgColor.
        --fl-disabledColor: #cc0000; // Optional, ignored if not supplied.
        --fl-selectedFgColor: #ffffff; // Optional, ignored if not supplied.
        --fl-selectedBgColor: #008000; // Optional, ignored if not supplied.
        --fl-buttonFgColor: #ffffff; // Optional, defaults to --fl-fgColor.
        --fl-buttonBgColor: #000000; // Optional, defaults to --fl-bgColor.
    }
```

## How to prevent grunt from compiling utility Stylus files

Some Stylus files may only contain mixins or functions for other Stylus files to import. Those files should not be
compiled into CSS. To prevent the grunt task `grunt buildStylus` from compiling them, place these files in the
"[utils](./utils)" directory.
