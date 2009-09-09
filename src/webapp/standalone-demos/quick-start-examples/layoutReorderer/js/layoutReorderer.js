/**
 * @author Jacob
 */

jQuery(document).ready(function () {
    // layout system with locked portlets
    fluid.reorderLayout ("#fluid-LayoutReorderer-sample2", {
        selectors: {
            columns: ".myColumn",
            modules: "> div > div",
            lockedModules: ".locked",
            dropWarning: ".flc-reorderer-dropWarning"
        }
    });
  
});