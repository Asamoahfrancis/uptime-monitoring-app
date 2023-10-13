import fs from 'fs';
import path from 'path';
import { libType } from '../http-types';
import { helpers } from './helpers';

export const lib:libType = {
    baseDir : '',
    create : ()=>{},
    read:()=>{},
    update:()=>{},
    delete:()=>{}
};

lib.baseDir = path.join(__dirname,'/../../src/.data/');
lib.create = (dir,file,data,Createcallback)=>{
   fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx',(err,fileDescriptor)=>{
    if(!err && fileDescriptor){
        const stringData = JSON.stringify(data);
        fs.write(fileDescriptor,stringData,(err)=>{
            if(!err){
                fs.close(fileDescriptor,(err)=>{
                    if(!err){
                        Createcallback(false);
                    }else{
                        Createcallback('could not close the file');
                    }
                })
            }else{
                Createcallback('could not write to the file')
            }
        })
    }else{
        Createcallback('file already exist')
    }
   })
}

lib.read = (dir,file,readCallback)=>{
  fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',(err,data)=>{
    if(!err && data){
        const parsedData = helpers.parseHJsonToObj(data);
        readCallback(false,parsedData);
    }else{
        readCallback(err,data);
    }
  });
};

lib.update = (dir,file,data,updateCallback)=>{
   fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(error,fileDescriptor)=>{
    if(!error && fileDescriptor){
        const stringifyData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor,(error)=>{
            if(!error){
                fs.writeFile(fileDescriptor,stringifyData,(error)=>{
                    if(!error){
                        fs.close(fileDescriptor,(error)=>{
                            if(!error){
                                updateCallback(false);
                            }else{
                                updateCallback('failed to close the file');
                            }
                        })
                    }else{
                        updateCallback('failed to write to the file');
                    }
                })
            }else{
                updateCallback('failed to truncate');
            }
        })
    }else{
        updateCallback('file does not exist');
    }
   })
}

lib.delete = (dir,file,deleteCallback)=>{
   fs.unlink(lib.baseDir+dir+'/'+file+'.json',(error)=>{
    if(!error){
        deleteCallback(false);
    }else{
        deleteCallback('failed to delete')
    }
   })
}