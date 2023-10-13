"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lib = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
exports.lib = {
    baseDir: '',
    create: () => { },
    read: () => { },
    update: () => { },
    delete: () => { }
};
exports.lib.baseDir = path_1.default.join(__dirname, '/../../src/.data/');
exports.lib.create = (dir, file, data, Createcallback) => {
    fs_1.default.open(exports.lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);
            fs_1.default.write(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs_1.default.close(fileDescriptor, (err) => {
                        if (!err) {
                            Createcallback(false);
                        }
                        else {
                            Createcallback('could not close the file');
                        }
                    });
                }
                else {
                    Createcallback('could not write to the file');
                }
            });
        }
        else {
            Createcallback('file already exist');
        }
    });
};
exports.lib.read = (dir, file, readCallback) => {
    fs_1.default.readFile(exports.lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers_1.helpers.parseHJsonToObj(data);
            readCallback(false, parsedData);
        }
        else {
            readCallback(err, data);
        }
    });
};
exports.lib.update = (dir, file, data, updateCallback) => {
    fs_1.default.open(exports.lib.baseDir + dir + '/' + file + '.json', 'r+', (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
            const stringifyData = JSON.stringify(data);
            fs_1.default.ftruncate(fileDescriptor, (error) => {
                if (!error) {
                    fs_1.default.writeFile(fileDescriptor, stringifyData, (error) => {
                        if (!error) {
                            fs_1.default.close(fileDescriptor, (error) => {
                                if (!error) {
                                    updateCallback(false);
                                }
                                else {
                                    updateCallback('failed to close the file');
                                }
                            });
                        }
                        else {
                            updateCallback('failed to write to the file');
                        }
                    });
                }
                else {
                    updateCallback('failed to truncate');
                }
            });
        }
        else {
            updateCallback('file does not exist');
        }
    });
};
exports.lib.delete = (dir, file, deleteCallback) => {
    fs_1.default.unlink(exports.lib.baseDir + dir + '/' + file + '.json', (error) => {
        if (!error) {
            deleteCallback(false);
        }
        else {
            deleteCallback('failed to delete');
        }
    });
};
