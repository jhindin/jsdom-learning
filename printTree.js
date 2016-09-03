#!/usr/bin/env node

var jsdom = require("jsdom");
var nodePrinter = require("./nodePrinter.js")

function onLoad(err, window)
{
    if (err) {
        console.log(err)
        return;
    }

    nodePrinter.print(window.document.documentElement);
}

jsdom.env(
    "<!DOCTYPE html><html lang=\"en\"><head><title>Title</title></head>" +
        "<body><h1>Hello, world!</h1></body></html>",
    onLoad);
