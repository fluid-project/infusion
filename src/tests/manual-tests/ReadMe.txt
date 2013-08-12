This directory contains tests that are run manually. 

UI Options, Fat Panel:
    To run this test:
        1. open SomeKindOfNews.html in a browser
        2. activate the "Show Display Preferences" button in the top right corner of the screen
        3. experiment with the various UI Options settings and verify that the window
           contents are styled correctly.

UI Options, Full with Preview:
    To run this test:
        1. open uiOptionsFullWithPreview.html in a browser
        2. experiment with the various UI Options settings and verify that the preview window
           contents are styled correctly.
        3. use the "save and apply" button to apply the preview styles to UI Options
        4. use the "reset" button to reset the styles

UI Options, Full without Preview:
    To run this test:
        1. open uiOptionsFullWithoutPreview.html in a browser
        2. experiment with the various UI Options settings
        3. use the "save and apply" button to apply the styles to UI Options and verify that the
           contents are styled correctly.
        4. use the "reset and apply" button to reset the styles

Dropdown
    To run this test:
        1. open dropdown.html in a browser
        2. tab to the dropdown and hit enter
        3. use the arrow keys to select a different item in the dropdown
        4. press enter 
        5. use the mouse to select a different item in the dropdown
        
        
Dynamic Reorderer  - this will be turned into a unit test
    To run this test:
        1. open dynamic-reorderer.html in a browser
        2. move one of the items to a different place in the list
        3. click the new div button
        4. move the item above the new div to below the new div
        5. move the new div to a different place in the list
        
        
Renderer Component Types - once we have unit tests for nested list, joint container and script this will move to the simple demo area of the incubator


Simple Progress - this will move to the simple demo area of the incubator


Versioning  - this will be turned into a unit test
    To run this test:
        1. open versioning.html in a browser
        2. move an item in the first sortable list to another position in the list
        3. move an item in the second sortable list to another position in the list
        4. in the console, ensure fluid !== fluid_1_5 (or what ever the current version is)j