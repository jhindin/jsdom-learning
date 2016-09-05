
function printAttributes(element, stream)
{
    var attrs = element.attributes;
    if (attrs && attrs.length > 0) {
        for (var i = 0; i < attrs.length; i++) {
            stream.write(" " + attrs[i].name + "=\"" + attrs[i].value + "\"");
        }
    }
}

function printOffset(stream, level)
{
    for (var i = 0; i < level; i++)
        stream.write(' ');
}

function printRecursively(element, stream, level)
{
    if (element.nodeType == 3) { // Text
        var trimmed = element.nodeValue.replace(/\s+/g, " ");
        if (trimmed.length > 0) {
            printOffset(stream, level);
            stream.write(trimmed + "\n");
        }
    }

    if (element.nodeType != 1) // Element
        return;

    printOffset(stream, level)
    if (element.childNodes && element.childNodes.length != 0) {
        stream.write('<' + element.nodeName);
        printAttributes(element, stream);
        stream.write('>\n');

        for (var c = 0; c < element.childNodes.length; c++) {
            printRecursively(element.childNodes[c], stream, level + 2);
        }

        for (var i = 0; i < level; i++)
            stream.write(' ');
        stream.write('</' + element.nodeName + '>\n');
    } else {
        stream.write('<' + element.nodeName);
        printAttributes(element, stream);
        stream.write('/>\n');
    }
}

module.exports.print = function(htmlElement, stream) {
    if (!stream)
        stream = process.stdout;

    printRecursively(htmlElement, stream, 0);
}
