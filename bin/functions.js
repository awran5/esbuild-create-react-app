"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDir = exports.templateInquirer = exports.confirmInquirer = void 0;
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
function confirmInquirer(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            inquirer_1.default
                .prompt({
                type: 'confirm',
                name: 'exists',
                message: `Project ${chalk_1.default.cyan(projectName)} is already exists. Do you want to remove it? (hit enter for NO)?`,
                default: false
            })
                .then((answer) => answer.exists && resolve(true))
                .catch((err) => reject(new Error(err)));
        });
    });
}
exports.confirmInquirer = confirmInquirer;
function templateInquirer() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            inquirer_1.default
                .prompt({
                type: 'list',
                name: 'selected',
                message: `To get started please choose a template`,
                choices: ['Javascript', 'Typescript']
            })
                .then((answer) => resolve(answer.selected))
                .catch((err) => reject(new Error(err)));
        });
    });
}
exports.templateInquirer = templateInquirer;
function removeDir(dirName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.rmdir(dirName, { recursive: true }, (err) => {
                if (err) {
                    reject(new Error(`Failed to remove ${chalk_1.default.cyan(dirName)}. ${err}`));
                }
                resolve();
            });
        });
    });
}
exports.removeDir = removeDir;
