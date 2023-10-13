
import { environmentType } from "./http-types";
const environment: environmentType = {
    staging: {
        httpsPort:0,
        httpPort:0,
        envName: "",
        hashingSecret : "",
        maxChecks : 0
    },
    production: {
        httpsPort:0,
        httpPort:0,
        envName: "",
        hashingSecret :"",
        maxChecks : 0

    }
};

environment.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName':'staging',
    'hashingSecret' : 'thisisaSecret',
    'maxChecks' : 5
};

environment.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName':'production',
    'hashingSecret' : 'thisisaSecret',
    'maxChecks':5
};


const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 export const environmentToExport = typeof(environment[currentEnvironment]) == 'object' ? environment[currentEnvironment] : environment.staging;

