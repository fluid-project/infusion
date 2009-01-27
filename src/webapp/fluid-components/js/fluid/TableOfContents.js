/**
 * WARNING: This is not production code. It is a sketchy placeholder only. It is being replaced with real code soon.  
 */

/*
 *  TODO: 
 *  - retrieve the headings in document order
 *  - indent based on heading level
 *  - move the template out into UIOptions.html
 *  - make into a fluid sub component.
 *  - write tests 
 *  - get and implement a design for the table of contents 
 */ 

function generateTOC() {
    var headers = jQuery("h1,h2,h3");
    var parsedTemplate = fluid.selfRender(jQuery("[id=toc]"), generateTree(headers));
}

function insertAnchor(el) {
    var a = jQuery("<a name='" + el.text() + "' />");
    el.before(a);
}

function generateTree(els) {
    var tree = {}, anchorList = [], i, anchorNode, heading;

    for(i=0; i<els.length; i++) {
        heading = els.eq(i);
        insertAnchor(heading);
        anchorNode = {ID: "toc_anchor"};
        anchorNode.linktext = heading.text();
        anchorNode.target = "#" + heading.text();
        anchorList.push(anchorNode);
    }

    tree["toc_item:"] = anchorList;    
    return tree;
}
