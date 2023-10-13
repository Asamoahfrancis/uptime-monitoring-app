"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
exports.helpers = {
    hash: (str) => { },
    parseHJsonToObj: (str) => { },
    createRandomString: (len) => ''
};
exports.helpers.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto_1.default.createHmac('sha256', config_1.environmentToExport.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else {
        return false;
    }
};
exports.helpers.parseHJsonToObj = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    }
    catch (error) {
        return { 'Error': 'could not parse josn' };
    }
};
exports.helpers.createRandomString = (len) => {
    len = typeof (len) == 'number' && len > 0 ? len : false;
    if (len) {
        const possiblechararters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let index = 1; index <= len; index++) {
            const randomcharact = possiblechararters.charAt(Math.floor(Math.random() * possiblechararters.length));
            str += randomcharact;
        }
        return str;
    }
    else {
        return 'false';
    }
};
