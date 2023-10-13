import { ParsedUrlQuery } from "querystring";
import http from 'http'


export type userPayloadType = {
    firstName : string,
    lastName : string,
    phone : string,
    password : string,
    tosAgreement : boolean,
}

export type userHttpPayloadTypes = {
    trimmedPath : string,
    queryStringObj : ParsedUrlQuery,
    method : string,
    headers : http.IncomingHttpHeaders,
    payload : userPayloadType
}


export type _userTypeOnly = {
    [index : string] : (data : userHttpPayloadTypes , _userCallback:(statusCode : number , payload? :{error : string} | {})=>void,)=>void
    POST :  (data :userHttpPayloadTypes,postCallback : (statusCode : number , payload? : {error : string} | {})=>void)=>void,
    GET:(data :userHttpPayloadTypes,getCallback : (statusCode : number , payload?  : {error : string} | {})=>void)=>void,
    PUT:(data :userHttpPayloadTypes,putCallback : (statusCode : number , payload? :{error : string} | {})=>void)=>void,
    DELETE:(data :userHttpPayloadTypes,deleteCallback : (statusCode : number , payload? :{error : string} | {})=>void)=>void
}