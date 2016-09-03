var jsdom = require("jsdom");


function printAttributes(element)
{
    var attrs = element.attributes;
    if (attrs && attrs.length > 0) {
        for (var i = 0; i < attrs.length; i++) {
            process.stdout.write(" " + attrs[i].name + "=\"" + attrs[i].value + "\"");
        }
    }
}

function printRecursively(element, level)
{
    for (var i = 0; i < level; i++)
        process.stdout.write(' ');

    if (element.nodeType == 3) { // Text
        process.stdout.write(element.nodeValue + "\n");
        return;
    }

    if (element.nodeType != 1) // Element
        return;


    if (element.childNodes && element.childNodes.length != 0) {

        process.stdout.write('<' + element.nodeName);
        printAttributes(element);
        process.stdout.write('>\n');

        for (var c = 0; c < element.childNodes.length; c++) {
            printRecursively(element.childNodes[c], level + 2);
        }

        for (var i = 0; i < level; i++)
            process.stdout.write(' ');
        process.stdout.write('</' + element.nodeName + '>\n');
    } else {
        process.stdout.write('<' + element.nodeName);
        printAttributes(element);
        process.stdout.write('/>\n');
    }
}

function onLoad(err, window)
{
    if (err) {
        console.log(err)
        return;
    }

    printRecursively(window.document.documentElement, 0)
}

jsdom.env(
    "<!DOCTYPE html><html lang=\"en\"><head><title>Title</title></head>" +
        "<body><h1>Hello, world!</h1></body></html>",
    onLoad);
