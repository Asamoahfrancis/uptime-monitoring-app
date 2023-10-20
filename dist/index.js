"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
const string_decoder_1 = require("string_decoder");
const config_js_1 = require("./config.js");
const path_1 = __importDefault(require("path"));
const handler_js_1 = require("./lib/handler.js");
const helpers_js_1 = require("./lib/helpers.js");
const certpath = path_1.default.join(__dirname, "/../src/https/cert.pem");
const keypath = path_1.default.join(__dirname, "/../src/https/key.pem");
const httpsOptions = {
    key: fs_1.default.readFileSync(keypath),
    cert: fs_1.default.readFileSync(certpath),
};
//  lib.create('test','newfile',{'f' : 'fohhoo'},(err)=>{
//     console.log('this is the outcome', err);
//  })
//  lib.read('test','newfile',(err,data)=>{
//     console.log(err, data);
//  })
// lib.delete('test','newdot',(error)=>{
//     console.log(error);
// })
const httpsServer = https_1.default.createServer(httpsOptions, (req, res) => {
    unifiedServer(req, res);
});
const httpServer = http_1.default.createServer((req, res) => {
    unifiedServer(req, res);
});
const unifiedServer = (req, res) => {
    const parsedUrl = url_1.default.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");
    const method = req.method;
    const queryStringObj = parsedUrl.query;
    const headers = req.headers;
    const decoder = new string_decoder_1.StringDecoder("utf-8");
    let buffer = "";
    req.on("data", (data) => {
        buffer += decoder.write(data);
    });
    req.on("end", () => {
        buffer += decoder.end();
        let chosenHandler = typeof router[trimmedPath] !== "undefined"
            ? router[trimmedPath]
            : handler_js_1.handler.notFound;
        const data = {
            trimmedPath: trimmedPath,
            queryStringObj: queryStringObj,
            method: method,
            headers: headers,
            payload: helpers_js_1.helpers.parseHJsonToObj(buffer),
        };
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof statusCode == "number" ? statusCode : 200;
            payload = typeof payload == "object" ? payload : { default: "default" };
            let stringifyPayload = JSON.stringify(payload);
            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(stringifyPayload);
        });
    });
};
httpServer.listen(config_js_1.environmentToExport.httpPort, () => {
    console.log("listening on port : " +
        config_js_1.environmentToExport.httpPort +
        " and the environment is " +
        config_js_1.environmentToExport.envName);
});
httpsServer.listen(config_js_1.environmentToExport.httpsPort, () => {
    console.log("listening on port : " +
        config_js_1.environmentToExport.httpsPort +
        " and the environment is " +
        config_js_1.environmentToExport.envName);
});
const router = {
    ping: handler_js_1.handler.ping,
    users: handler_js_1.handler.users,
    tokens: handler_js_1.handler.tokens,
    checks: handler_js_1.handler.checks,
};
