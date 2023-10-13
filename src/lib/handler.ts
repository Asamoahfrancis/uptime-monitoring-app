import { verifiedTokenType } from "../http-types";
import { handlerType } from "../http-types";
import { lib } from "./data";
import { helpers } from "./helpers";
import { environmentToExport } from "../config";
import { error } from "console";


export let handler : handlerType = {
    ping: function (data: {}, callback: (statusCode : 0 , payload:{})=>void): void {},
    notFound: function (data : {}, callback: (statusCode : 0 )=>void): void {},
    _users : {POST : ()=>{} , GET: ()=>{}, PUT: ()=>{},DELETE : ()=>{}},
    _tokens : {POST : ()=>{} , GET: ()=>{}, PUT: ()=>{},DELETE : ()=>{}},
    _checks : {POST : ()=>{} , GET: ()=>{}, PUT: ()=>{},DELETE : ()=>{}},
    users : (data : {} , userCallback : (statusCode : 0 , payload : {})=>void )=>{},
    tokens : (data : {} , tokenCallback : (statusCode : 0 , payload : {})=>void )=>{},
    checks : (data  , checksCallback : (statusCode : 0 , payload : {})=>void )=>{},
};


const verifiedToken : verifiedTokenType= (id,phone,callback)=>{
    lib.read('tokens',id,(error,_data)=>{
       if(!error && _data){
           if(_data.phone == phone && _data.expires > Date.now()){
               callback(true);
           }else{
               callback(false);
           }
       }else{
           callback(false);
       }
    })
};

//users

handler.users = (data,userCallback)=>{
   const acceptableMethods = ['POST','GET','PUT','DELETE'];
   if(acceptableMethods.indexOf(data.method) > -1){
    handler._users[data.method](data,(statusCode,payload)=>{
        userCallback(statusCode,payload);
    })
   }else{
    userCallback(405);
   }
}


handler.checks = (data,checksCallback)=>{
    const acceptableMethods = ['POST','GET','PUT','DELETE'];
    if(acceptableMethods.indexOf(data.method) > -1){
     handler._checks[data.method](data,(statusCode,payload)=>{
        checksCallback(statusCode,payload);
     })
    }else{
        checksCallback(405);
    }
 }


handler._users.POST = (data,postCallback)=>{
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true: false;

    if(firstName && lastName && phone && password && tosAgreement){
        lib.read('users',phone,(error,data)=>{
           
            if(error){
                const hashedPassword = helpers.hash(password);

                const userObj = {
                    firstName : firstName,
                    lastName : lastName,
                    phone : phone,
                    hashedPassword : hashedPassword,
                    tosAgreement : tosAgreement
                }

                lib.create('users',phone,userObj,(error)=>{
                    if(!error){
                        postCallback(200,userObj);
                    }else{
                        postCallback(500,{error : 'could not create a new user'})
                    }
                })
            }else{
                postCallback(401,{error:'phone number already exit'});
            }
        })
    }else{
        postCallback(400,{error : 'users incomplete users information'});
    }
}

handler._users.GET = (data,getCallback)=>{
    const phone = typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length > 0 ? data.queryStringObj.phone.trim() : false;

    if(phone){

        const token = typeof(data.headers.token)  == 'string' ? data.headers.token : false;
        if(token){
            verifiedToken(token,phone,(error)=>{
                if(error){
                    lib.read('users',phone,(error,_data)=>{
                        if(!error && _data){
                            delete _data.hashedPassword;
                            getCallback(200,_data);
                        }else{
                            getCallback(500,{'Error':'failed to read the phone'})
                        }
                    })
                }else{
                    getCallback(500,{'Error':'invalid token'})
                }
            })
        }else{
            getCallback(500,{'Error':'no token provided'});
        }

        

    }else{
        getCallback(402,{'Error':'phone number not present'})
    }
}

handler._users.PUT = (data,putCallback)=>{
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone){

        const token = typeof(data.headers.token)  == 'string' ? data.headers.token : false;
          
        if(token){
            verifiedToken(token,phone,(error)=>{
                if(error){
                    if(firstName || lastName || password ){
                        lib.read('users',phone,(error,_data)=>{
                            if(!error && _data){
                                if(firstName){
                                    _data.firstName = firstName;
                                }
                                if(lastName){
                                    _data.lastName = lastName;
                                }
                                if(password){
                                    _data.hashedPassword = helpers.hash(password);
                                }
                                lib.update('users',phone,_data,(resp)=>{
                                   if(!resp){
                                    putCallback(200,{response : 'updated successfully'})
                                   }else{
                                    putCallback(404,{'Error':'failed to update'});
                                   }
                                })
                            }else{
                                putCallback(401,{'Error':'failed to open uers'});
                            }
                        })
                    }else{
                        putCallback(401,{Error:'insufficient paramters'});
                    }
                }else{
                    putCallback(5000,{'Error':'phone number is wrong'})
                }
            })
        }else{
            putCallback(500,{'Error':'token is absent'});
        }
        

    }else{
        putCallback(402,{'error':'invalid phone'});
    }
}

handler._users.DELETE = (data,deleteCallback)=>{
    const phone = typeof(data.queryStringObj.phone) === 'string' && data.queryStringObj.phone.trim().length > 0 ? data.queryStringObj.phone.trim() : false;
    if(phone){

        const token = typeof(data.headers.token)  == 'string' ? data.headers.token : false;

        if(token){
            verifiedToken(token,phone,(error)=>{
                if(error){
                    lib.read('users',phone,(error,_data)=>{
                        if(!error && _data){
                            lib.delete('users',phone,(error)=>{
                                if(!error){
                                    deleteCallback(200,{'message':'deleled successfully'});
                                }else{
                                    deleteCallback(500,{'Error':'failed to delete'})
                                }
                            })
                        }else{
                            deleteCallback(402,{'Error':'unable to fetch phone number'});
                        }
                    })
                }else{
                    deleteCallback(400,{'Error':'wrong phone number'});
                }
            })
        }else{
            deleteCallback(500,{'Error':'no token available'})
        }
        
    }else{
        deleteCallback(401,{'Error':'invalid phone number'});
    }
}



//tokens

handler.tokens = (data,tokensCallback)=>{
    const acceptableMethods = ['POST','GET','PUT','DELETE'];
    if(acceptableMethods.indexOf(data.method) > -1){
     handler._tokens[data.method](data,(statusCode,payload)=>{
         tokensCallback(statusCode,payload);
     })
    }else{
        tokensCallback(405);
    }
 }


 
handler._tokens.POST = (data,posttokenCallback)=>{
  
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if( phone && password ){
        lib.read('users',phone,(error,_data)=>{
            if(!error && data){
                const hashedPassword = helpers.hash(password);
                if(hashedPassword == _data.hashedPassword){
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now()+1000 * 60 * 60;
                    const tokenObj = {
                        phone : phone,
                        tokenId : tokenId,
                        expires : expires
                    }
                    lib.create('tokens',tokenId,tokenObj,(error)=>{
                        if(!error){
                            posttokenCallback(200,tokenObj);
                        }else{
                            posttokenCallback(500,{error : 'could not create a new token'})
                        }
                    })
                }else{
                    posttokenCallback(500,{'Error':'password does not match'});
                }
               
            }else{
                posttokenCallback(401,{error:'phone number does not exit'});
            }
        })
    }else{
        posttokenCallback(400,{error : 'token incomplete users information'});
    }
}
 




handler._tokens.GET = (data,gettokenCallback)=>{
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length > 0 ? data.queryStringObj.id.trim() : false;
    if(id){
        lib.read('tokens',id,(error,_data)=>{
            if(!error && _data){
                gettokenCallback(200,_data);
            }else{
                gettokenCallback(500,{'Error':'failed to read the id'})
            }
        })

    }else{
        gettokenCallback(402,{'Error':'id number not present'})
    }
}




handler._tokens.PUT = (data,puttokenCallback)=>{
    const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true: false;

    if(id && extend){
            lib.read('tokens',id,(error,_data)=>{
                if(!error && _data){
                    if(_data.expires > Date.now()){
                        _data.expires = Date.now() + 1000 * 60 * 60;
                        lib.update('tokens',id,_data,(resp)=>{
                            if(!resp){
                             puttokenCallback(200,_data);
                            }else{
                             puttokenCallback(404,{'Error':'failed to update'});
                            }
                         })
                    }else{
                        puttokenCallback(500,{'Error':'token already expired'})
                    }
                }else{
                    puttokenCallback(401,{'Error':'failed to open tokens'});
                }
            })
        

    }else{
        puttokenCallback(401,{Error:'insufficient paramters'});
    }
}



handler._tokens.DELETE = (data,deletetokenCallback)=>{
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length > 0 ? data.queryStringObj.id.trim() : false;
    if(id){
        lib.read('tokens',id,(error,_data)=>{
            if(!error && _data){
                lib.delete('tokens',id,(error)=>{
                    if(!error){
                        deletetokenCallback(200,{'message':'deleled successfully'});
                    }else{
                        deletetokenCallback(500,{'Error':'failed to delete'})
                    }
                })
            }else{
                deletetokenCallback(402,{'Error':'unable to fetch phone number'});
            }
        })
    }else{
        deletetokenCallback(401,{'Error':'invalid phone number'});
    }
}


//checks



 
handler._checks.POST = (data,postcheckCallback)=>{
  
    const protocol = typeof(data.payload.protocol) === 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const methods = typeof(data.payload.methods) === 'string' && ['POST','GET','PUT','DELETE'].indexOf(data.payload.methods)> -1 ? data.payload.methods : false;
    const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds %1 ==0 && data.payload.timeoutSeconds <=5 ? data.payload.timeoutSeconds : false;
    //const successCodes = typeof(data.payload.successCodes) === 'number'  ? data.payload.successCodes : false;

    if(protocol && url && methods && successCodes && timeoutSeconds){

        const token = typeof(data.headers.token) ==='string' ? data.headers.token : false;
        if(token){
            lib.read('tokens',token,(error,_data)=>{
                if(!error && _data){
                    const userPhone = _data.phone;
                    lib.read('users',userPhone,(error,_data_)=>{
                        if(!error && _data_){
                            const userCheck = typeof(_data_.checks) ==='object' && _data_.checks instanceof Array ? _data_.checks : [];
                            if(userCheck.length <= environmentToExport.maxChecks){
                                const checkId = helpers.createRandomString(20);
                                const checkObj = {
                                    'id' : checkId,
                                    'userPhone' : userPhone,
                                    'protocol':protocol,
                                    'url':url,
                                    'methods':methods,
                                    'successCodes' : successCodes,
                                    'timeoutSeconds' : timeoutSeconds
                                }
                                lib.create('checks',checkId,checkObj,(error)=>{
                                    if(!error){
                                        _data_.checks = userCheck;
                                        _data_.checks.push(checkId);
                                        lib.update('users',userPhone,_data_,(error)=>{
                                            if(!error){
                                                postcheckCallback(200,checkObj);
                                            }else{
                                                postcheckCallback(500,{'Error':'failed to update user '})
                                            }
                                        })
                                    }else{
                                        postcheckCallback(400,{'Error':'could not create a check'})
                                    }
                                })

                            }else{
                                postcheckCallback(500,{'Error':'exceeded the max checks'})
                            }
                        }else{
                            postcheckCallback(500,{'Error':'could not read the user'});
                        }
                    })
                }else{
                    postcheckCallback(403,{'Error':'failed to read tokens'});
                }
            })
        }else{
            postcheckCallback(500,{'Error':'no token available'});
        }
        
   
    }else{
        postcheckCallback(404,{error : 'incomplete checks information'});
    }
}




handler._checks.GET = (data,getcheckCallback)=>{
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length > 0 ? data.queryStringObj.id.trim() : false;

    if(id){
        lib.read('checks',id,(error,checkdata)=>{
            if(!error && checkdata){
                const token = typeof(data.headers.token) =='string' ? data.headers.token : '';
                verifiedToken(token,checkdata.userPhone,(res)=>{
        
                    if(res){
                        getcheckCallback(200,checkdata);
                    }else{
                        getcheckCallback(500,{'Error':'invalid token'});
                    }
                })
            }else{
                getcheckCallback(402,{'Error':'failed to display check data'});
            }
        })
    }else{
        getcheckCallback(500,{'Error':'no parameters provided'});
    }
}

handler._checks.PUT = (data,putcheckcallback)=>{
    const protocol = typeof(data.payload.protocol) === 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const methods = typeof(data.payload.methods) === 'string' && ['POST','GET','PUT','DELETE'].indexOf(data.payload.methods)> -1 ? data.payload.methods : false;
    const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds %1 ==0 && data.payload.timeoutSeconds <=5 ? data.payload.timeoutSeconds : false;
    const id = typeof(data.payload.id) =='string' ? data.payload.id : false;
    if(id){
        if(protocol || url || methods || successCodes || timeoutSeconds ){
            lib.read('checks',id,(error,checkdata)=>{
                if(!error && checkdata){
                    const token = typeof(data.headers.token) =='string' ? data.headers.token : '';
                    verifiedToken(token,checkdata.userPhone,(res)=>{
                        if(res){
                            if(protocol){
                                checkdata.protocol = protocol;
                            }
                            if(url){
                                checkdata.url = url;
                            }
                            if(methods){
                                checkdata.methods = methods;
                            }
                            if(successCodes){
                                checkdata.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkdata.timeoutSeconds = timeoutSeconds;
                            }

                            lib.update('checks',id,checkdata,(error)=>{
                                if(!error){
                                    putcheckcallback(200,checkdata);
                                }else{
                                    putcheckcallback(500,{'Error':'failed to update the checks'})
                                }
                            })
                        }else{
                            putcheckcallback(500,{'Error':'invalid token'})
                        }
                    })
                }else{
                    putcheckcallback(500,{'Error':'failed to fetch data'});
                }
            })
        }else{
            putcheckcallback(500,{'Error':'insufficient data'});
        }
    }else{
        putcheckcallback(500,{'Error':'invalid id'});
    }
}


handler._checks.DELETE = (data,deletecheckCallback)=>{
    const id = typeof(data.queryStringObj.id) === 'string' && data.queryStringObj.id.trim().length > 0 ? data.queryStringObj.id.trim() : false;
    if(id){
        lib.read('checks',id,(error,checkdata)=>{
            if(!error && checkdata){
                const token = typeof(data.headers.token) ==='string' ? data.headers.token : '';
                verifiedToken(token,checkdata.userPhone,(mess)=>{
                    if(mess){
                        lib.delete('checks',id,(error)=>{
                            if(!error){
                                lib.read('users',checkdata.userPhone,(error,userData)=>{
                                    console.log("this is the user data",userData);
                                    if(!error){
                                        const usercheck = typeof(userData.checks) =='object' && userData.checks instanceof Array ? userData.checks : [];
                                        const checkposition = usercheck.indexOf(id);
                                        if(checkposition > -1){
                                            usercheck.splice(checkposition,1);
                                            lib.update('users',userData.phone,userData,(error)=>{
                                                if(!error){
                                                    deletecheckCallback(200,{'message':'deleted successfully'});
                                                }else{
                                                    deletecheckCallback(500,{'Error':'failed to update the user data'});
                                                }
                                            })
                                        }else{
                                            deletecheckCallback(500,{'Error':'check position is less than 1'})
                                        }
                                    }else{
                                        deletecheckCallback(500,{Error:"failed to read the users"})
                                    }
                                })
                            }else{
                                deletecheckCallback(500,{error:'Error to delete the check'})
                            }
                        })
                    }else{
                        deletecheckCallback(500,{'Error':'invalid toekn'})
                    }
                })
            }else{
                deletecheckCallback(500,{'Error':'failed to read the check'});
            }
        })
    }else{
        deletecheckCallback(401,{'Error':'invalid phone number'});
    }
}



handler.ping = (data,callback)=>{
    callback(200);
}

handler.notFound = (data,callback)=>{
    callback(404);
}
