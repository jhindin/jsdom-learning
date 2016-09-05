#!/usr/bin/env node

var jsdom = require("jsdom");
var nodePrinter = require("./nodePrinter.js")
var url = require('url');
var fs = require('fs');
var http = require('http');
var cliParser=require('minimist')

function optUnknown(a)
{
    c = a.charAt(0);
    if (c == '-') {
	console.log("Unknown options", a)
	return false;
    }
    return true;
}

parsedArgs = cliParser(process.argv.slice(2), {boolean: ["e", "h"], stopEarly: true, unknown: optUnknown })
help="[-e] url";


if (parsedArgs.h || parsedArgs.help) {
    console.log(help);
    process.exit(0);
}


jsdom.defaultDocumentFeatures = {
    FetchExternalResources: ["script", "frame", "iframe" ],
    ProcessExternalResources: ["script", "frame", "iframe" ]
};

function onLoad(window)
{
    nodePrinter.print(window.document.documentElement);
}

if (parsedArgs._.length != 1) {
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

var virtualConsole = jsdom.createVirtualConsole()
virtualConsole.on("jsdomError", (error) => console.log("JSDOM ERROR:", error));
virtualConsole.on("log", (msg) => console.log("JSDOM CONSOLE.LOG:", msg));

if (parsedArgs.e) {
    jsdom.env(parsedArgs._[0],
              {
                  virtualConsole: virtualConsole
              },
              function (err, window) {
                  if (err) {
                      console.log("Error:", err);
                  } else {
                      nodePrinter.print(window.document.documentElement);
                  }
              });
} else {
    var doc = jsdom.jsdom(undefined, {
        created: (err, view) => { if (err) { console.log("created: ", err); process.exit(-1) }},
        resourceLoader: fileResourceLoader,
        virtualConsole: virtualConsole
    });

    var window = doc.defaultView;

    jsdom.changeURL(window, parsedArgs._[0]);

    url = url.parse(parsedArgs._[0])
    fileResourceLoader({url: url, baseUrl: parsedArgs._[0]}, (err, body) => {
        if (err)
            throw err;
        window.document.write(body);
        onLoad(window);
    });
}
