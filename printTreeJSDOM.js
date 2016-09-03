#!/usr/bin/env node

var jsdom = require("jsdom");
var nodePrinter = require("./nodePrinter.js")
var url = require('url');
var fs = require('fs');
var http = require('http');


jsdom.defaultDocumentFeatures = {
    FetchExternalResources: ["script", "frame", "iframe" ],
    ProcessExternalResources: ["script", "frame", "iframe" ]
};

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
        console.log("Loading", resource.url.href);
        if (resource.url.protocol == 'file:') {
            fs.readFile(resource.url.path, 'utf8', callback);
        } else if (resource.url.protocol == 'http:' || resource.url.protocol == 'https:') {
            var body ='';
            http.request(resource.url, (response) => {
                response.on('data', (chunk) =>  body += chunk);
                response.on('end', () => callback(undefined, body));
                response.on('error', (err) => callback(err));
            }).end();
        } else {
            callback(new Error("Unsupported protocol " + resource.url.protocol));
        }
    } catch (err) {
        callback(err);
    }
}

var doc = jsdom.jsdom(undefined, {
    created: (err, view) => { if (err) { console.log("created: ", err); process.exit(-1) }},
    resourceLoader: fileResourceLoader,
});

var window = doc.defaultView;

jsdom.changeURL(window, process.argv[2]);

url = url.parse(process.argv[2])
fileResourceLoader({url: url, baseUrl: process.argv[2]}, (err, body) => {
    if (err)
        throw err;
    window.document.write(body);
    onLoad(window);
});
