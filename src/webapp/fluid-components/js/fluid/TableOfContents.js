/**
 * WARNING: This is not production code. It is a sketchy placeholder only. It is being replaced with real code soon.  
 */
function generateTOC() {
    var h1s = jQuery("h1,h2,h3");
    var toc = jQuery("<ul></ul>");
    for (var i = 0; i < h1s.length; i++) {
        toc.append("<li><a href='#" + h1s.eq(i).text() + "'>" + h1s.eq(i).text() + "</a></li>");
        generateAnchor(h1s.eq(i));
    }
//    jQuery("body").prepend(toc);

var parsedTemplate = fluid.selfRender(jQuery("[id=toc]"), fullTree);

}

function generateAnchor(el) {
    var a = jQuery("<a name='" + el.text() + "' />");
    el.before(a);
}

        var fullTree = {
            children: [
                {ID: "toc_item:",
                children: [
                    {ID: "toc_anchor", value: "Amphibians"}
                ]},
                {ID: "toc_item:",
                children: [
                    {ID: "toc_anchor", value: "Mammals"}
                ]}
                
            ]
        };
// abridged:
// "toc_item:": [ {ID: "toc_anchor" value: "Mammals"},  {ID: "toc_anchor", value: "Amphibian"}] , .etc
// So, the fullTree might be  {"toc_item:": [ {ID: "toc_anchor", value: "Mammals"},  {ID: "toc_anchor", value: "Amphibian"}]}

