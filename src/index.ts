
import http from 'http';
import fs from 'fs';
import https from 'https';
import url from 'url';
import { StringDecoder } from 'string_decoder';
import {  routertype,payloadType} from './http-types.js';
import { environmentToExport } from './config.js';
import path from 'path'
import { lib } from './lib/data.js';
import { handler } from './lib/handler.js';
import { helpers } from './lib/helpers.js';


const certpath = path.join(__dirname,'/../src/https/cert.pem');
const keypath = path.join(__dirname,'/../src/https/key.pem');


 const httpsOptions = {
    key : fs.readFileSync(keypath),
    cert : fs.readFileSync(certpath)
 }

//  lib.create('test','newfile',{'f' : 'fohhoo'},(err)=>{
//     console.log('this is the outcome', err);
//  })


//  lib.read('test','newfile',(err,data)=>{
//     console.log(err, data);
//  })

// lib.delete('test','newdot',(error)=>{
//     console.log(error);
// })

const httpsServer = https.createServer(httpsOptions,(req,res)=>{
    unifiedServer(req,res);
});
const httpServer = http.createServer((req,res)=>{
    unifiedServer(req,res);
});
const unifiedServer = (req: http.IncomingMessage,res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; })=>{
    const parsedUrl = url.parse(req.url!,true);
    const path = parsedUrl.pathname;
    const trimmedPath = path!.replace(/^\/+|\/+$/g,'');
    const method = req.method;
    const queryStringObj = parsedUrl.query;
    const headers = req.headers;
    const decoder = new StringDecoder('utf-8');
    let buffer  = '';
    req.on('data',(data)=>{
        buffer +=decoder.write(data)
    });
    req.on('end',()=>{
        buffer +=decoder.end();
        let chosenHandler = typeof(router[trimmedPath]) !=='undefined' ? router[trimmedPath] : handler.notFound;
        const data = {
            trimmedPath : trimmedPath,
            queryStringObj : queryStringObj,
            method : method,
            headers : headers,
            payload : helpers.parseHJsonToObj(buffer)
        }
        chosenHandler(data,(statusCode:number,payload:payloadType| {})=>{
                 statusCode  = typeof(statusCode) == 'number' ? statusCode : 200;
                 payload = typeof(payload) =='object' ? payload : {};
                 let stringifyPayload = JSON.stringify(payload);
                 res.setHeader('Content-Type','application/json')
                 res.writeHead(statusCode);
                 res.end(stringifyPayload);
        });
    });
}

httpServer.listen(environmentToExport.httpPort,()=>{
    console.log('listening on port : ' + environmentToExport.httpPort + ' and the environment is ' + environmentToExport.envName);
});

httpsServer.listen(environmentToExport.httpsPort,()=>{
    console.log('listening on port : ' + environmentToExport.httpsPort + ' and the environment is ' + environmentToExport.envName);
});


const router : routertype = {
    ping : handler.ping,
    users : handler.users,
    tokens : handler.tokens,
    checks : handler.checks
}

