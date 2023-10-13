import crypto from 'crypto'
import { environmentToExport } from '../config';
import { hashType } from '../http-types';

export const helpers : hashType = {
    hash : (str : string)=>{},
    parseHJsonToObj : (str:string)=>{},
    createRandomString : (len : number | boolean )=>''
}

helpers.hash = (str)=>{
    if( typeof str === 'string' && str.length > 0 ){
        const hash = crypto.createHmac('sha256',environmentToExport.hashingSecret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
}

helpers.parseHJsonToObj = (str)=>{
     try {
        const obj = JSON.parse(str);
        return obj;
     } catch (error) {
         return {'Error': 'could not parse josn'}
     }
}

helpers.createRandomString = (len)=>{

    len = typeof(len) =='number' && len > 0 ? len : false;
    if(len){
        const possiblechararters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let index = 1; index <=len; index++) {
            const randomcharact = possiblechararters.charAt(Math.floor(Math.random() * possiblechararters.length))
            str +=randomcharact;
        }
        return str;
    }else{
        return 'false';
    }
}