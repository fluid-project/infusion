## Overview ##

The stylus directory contained stylus files were used to generate css files used by the preferences framework through the grunt task 'stylus'. Some of generated css files have stronger precedence so they could be used to apply different contrast themes in Preferences Editor

### How to add a new theme ###
1. In "UtilityThemes.styl", modify "themes" variable to add the foreground and background colors of the new theme;
2. In the infusion root directory, run "grunt stylus" to rebuild css files with the new theme.

### Prefix renaming ###

The following class prefix needs to be renamed

- "fl-theme-" -> "fl-theme-prefsEditor-"

