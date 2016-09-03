#!/usr/bin/env node

var jsdom = require("jsdom");
var nodePrinter = require("./nodePrinter.js")
var url = require('url');
var fs = require('fs');
var http = require('http');

function onLoad(window)
{
    nodePrinter.print(window.document.documentElement);
}


if (process.argv.length != 3) {
    console.log("Bad args");
    process.exit(-1);
}

function fileResourceLoader(resource, callback)
{
    try {
        var pu = url.parse(resource.url);
        if (pu.protocol == 'file:') {
            fs.readFile(pu.path, 'utf8', callback);
        } else if (resource.defaultFetch) {
            resource.defaultFetch(resource, callback);
        } else if (pu.protocol == 'http:' || pu.protocol == 'https:') {
            var body ='';
            http.request(pu, (response) => {
                response.on('data', (chunk) =>  body += chunk);
                response.on('end', () => callback(undefined, body));
                response.on('error', (err) => callback(err));
            });
        }
    } catch (err) {
        callback(err);
    }
}

var doc = jsdom.jsdom(undefined, {
    created: (err, view) => { if (err) { console.log("created: ", err); process.exit(-1); };},
    resourceLoader: fileResourceLoader
});

var window = doc.defaultView;

jsdom.changeURL(window, process.argv[2]);
fileResourceLoader({url: process.argv[2], baseUrl: process.argv[2]}, (err, body) => {
    if (err)
        throw err;
    window.document.write(body);
    onLoad(window);
});
