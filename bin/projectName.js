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
exports.getProjectName = void 0;
const chalk_1 = __importDefault(require("chalk"));
function getProjectName() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2, process.argv.length);
        const name = args[0];
        const acceptedName = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
        if (!name) {
            console.log(`\n${chalk_1.default.bgRed(` Error! `)} Please specify a project name e.g. ${chalk_1.default.cyan(`npx react-esbuild-app`)} ${chalk_1.default.green('my-app')}\n`);
            process.exit();
        }
        if (!acceptedName) {
            console.log(`\n${chalk_1.default.bgRed(` npm naming restrictions! `)} Please specify a project name with lowercase characters separated by hyphen (-) e.g. ${chalk_1.default.green('my-app')}\n`);
            process.exit();
        }
        return name;
    });
}
exports.getProjectName = getProjectName;
