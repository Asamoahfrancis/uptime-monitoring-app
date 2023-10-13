import { ParsedUrlQuery } from "querystring";
import http from 'http'


export type checksPayloadType = {
   protocol : string,
   url : string,
   methods : string,
   successCodes : number[],
   timeoutSeconds : number,
   id? : string
}

export type checksHttpPayloadTypes = {
    trimmedPath : string,
    queryStringObj : ParsedUrlQuery,
    method : string,
    headers : http.IncomingHttpHeaders,
    payload : checksPayloadType
}


export type _checksTypeOnly = {
    [index : string] : (data : checksHttpPayloadTypes , _checksCallback:(statusCode : number , payload? :{error : string} | {})=>void,)=>void
    POST :  (data :checksHttpPayloadTypes,postCallback : (statusCode : number , payload? : {error : string} | {})=>void)=>void,
    GET:(data :checksHttpPayloadTypes,getCallback : (statusCode : number , payload?  : {error : string} | {})=>void)=>void,
    PUT:(data :checksHttpPayloadTypes,putCallback : (statusCode : number , payload? :{error : string} | {})=>void)=>void,
    DELETE:(data :checksHttpPayloadTypes,deleteCallback : (statusCode : number , payload? :{error : string} | {})=>void)=>void
}
