import { ParsedUrlQuery } from "querystring";
import { _userTypeOnly,userHttpPayloadTypes } from "./types/usersTypes";
import { _checksTypeOnly,checksHttpPayloadTypes } from "./types/checksTypes";
import http from 'http'


export type payloadType = {
    firstName? : string,
    lastName? : string,
    phone? : string,
    password? : string,
    tosAgreement? : boolean,
    id? : string,
    extend? :boolean,
    protocol? : string,
    url?:string,
    method?:string,
    successCodes? : number,
    timeoutSeconds?:number
}

export type verifiedTokenType =   ( id : string , phone : string , callback : ( message : boolean)=>void)=>void

export type httpPayloadTypes = {
    trimmedPath : string,
    queryStringObj : ParsedUrlQuery,
    method : string,
    headers : http.IncomingHttpHeaders,
    payload : payloadType
}

export type _userTypes = {
    [index : string] : (data : httpPayloadTypes , _userCallback:(statusCode : number , payload? :payloadType | {})=>void,)=>void
    POST :  (data :httpPayloadTypes,postCallback : (statusCode : number , payload? :payloadType| {})=>void)=>void,
    GET:(data :httpPayloadTypes,getCallback : (statusCode : number , payload?  : payloadType| {})=>void)=>void,
    PUT:(data :httpPayloadTypes,putCallback : (statusCode : number , payload? :payloadType | {})=>void)=>void,
    DELETE:(data :httpPayloadTypes,deleteCallback : (statusCode : number , payload? :payloadType | {})=>void)=>void
}

export type handlerType = {
    ping : (data: httpPayloadTypes,callback : (statusCode : number)=>void )=>void,
    notFound : ( data : httpPayloadTypes,callback : (statusCode : number)=>void )=>void,
    users :(data :userHttpPayloadTypes,userCallback : (statusCode : number , payload? :{error : string} | {})=>void)=>void,
    _users : _userTypeOnly,
    _tokens : _userTypes,
    _checks : _checksTypeOnly,
    tokens :(data :httpPayloadTypes,userCallback : (statusCode : number , payload? :payloadType | {})=>void)=>void,
    checks :(data :checksHttpPayloadTypes,checksCallback : (statusCode : number , payload? :{error : string} | {})=>void)=>void,

};

export type routertype = {
    [index : string] : any
}

export type hashType = {
    hash : (str : string)=>void,
    parseHJsonToObj : (str : string)=>any,
    createRandomString:(len : number | boolean )=> string 
}

export type environmentType  = {
    [index : string]  : { httpPort : number , httpsPort : number,envName : string,hashingSecret : string,maxChecks:number},
    staging : { httpPort : number ,httpsPort: number, envName : string,hashingSecret : string,maxChecks:number},
    production : { httpPort : number ,httpsPort : number, envName : string,hashingSecret : string,maxChecks:number}
}

export type libType = {
    baseDir :  string,
    create : (dir : string , file : string , data : {} , Createcallback : (para : string | boolean)=>void )=>void,
    read:(dir : string,file : string , readCallback : (err : NodeJS.ErrnoException | null|boolean , data : any )=>void)=>void,
    update : (dir : string, file : string , data : {}, updateCallback : (message :  string | boolean)=>void)=>void,
    delete : (dir:string,file : string,deleteCallback: ( message : string | boolean)=>void)=>void
}