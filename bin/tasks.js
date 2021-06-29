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
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const util_1 = require("util");
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const listr2_1 = require("listr2");
const ora_1 = __importDefault(require("ora"));
const functions_1 = require("./functions");
const asyncExec = util_1.promisify(child_process_1.exec);
/**
 * Tasks
 *
 * make a dir
 * clone template repo
 * install dependencies
 * remove old .git
 * init git [ init, add, commit]
 * update package.json
 * done
 */
function fetchTemplateRepo(projectName, template) {
    return __awaiter(this, void 0, void 0, function* () {
        const templates = {
            js: `https://github.com/awran5/esbuild-react-app-js-template`,
            ts: `https://github.com/awran5/esbuild-react-app-ts-template`
        };
        const templateChosen = template === 'Typescript' ? templates.ts : templates.js;
        try {
            yield asyncExec(`git clone ${templateChosen} .`, { cwd: projectName });
        }
        catch (err) {
            console.log(`Failed to clone repository. ${err}`);
            process.exit(1);
        }
    });
}
function installDependencies(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        let pm = 'npm i';
        try {
            yield asyncExec('yarnpkg --version');
            pm = 'yarn';
        }
        catch (err) {
            pm = 'npm i';
        }
        try {
            yield asyncExec(pm, { cwd: projectName });
        }
        catch (err) {
            console.log(`Failed to install dependencies. ${err}`);
            process.exit(1);
        }
    });
}
function updateFiles(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get author name
        let author = 'your-name';
        try {
            author = (yield asyncExec(`git config --global user.email`)).stdout.trim();
        }
        catch (e) {
            author = 'your-name';
        }
        // Update package.json
        const packageJson = `${projectName}/package.json`;
        const read = yield promises_1.readFile(packageJson, 'utf-8');
        const parse = JSON.parse(read);
        const newPackageJson = Object.assign(Object.assign({}, parse), { name: projectName, author });
        // Write a new package.json
        try {
            yield promises_1.writeFile(packageJson, JSON.stringify(newPackageJson, null, 2), 'utf8');
        }
        catch (err) {
            console.log(`Failed to update package.json. ${err}`);
            process.exit(1);
        }
        // Initialize a fresh Git
        try {
            yield functions_1.removeDir(`${projectName}/.git`);
        }
        catch (err) {
            console.log(err);
            process.exit(1);
        }
        try {
            yield asyncExec(`git init && git add . && git commit -m "initial commit"`, { cwd: projectName });
        }
        catch (err) {
            console.log(`Failed to initialize git. ${err}`);
            process.exit(1);
        }
    });
}
function successfulMessage(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${chalk_1.default.green(`
                                                             
    .d8888b  888  888  .d8888b .d8888b .d88b.  .d8888b  .d8888b  
    88K      888  888 d88P"   d88P"   d8P  Y8b 88K      88K      
    "Y8888b. 888  888 888     888     88888888 "Y8888b. "Y8888b. 
         X88 Y88b 888 Y88b.   Y88b.   Y8b.          X88      X88 
     88888P'  "Y88888  "Y8888P "Y8888P "Y8888   88888P'  88888P' 
                                                              
    `)}\nNow just navigate to your ${chalk_1.default.cyan(projectName)} project and type ${chalk_1.default.cyan(`npm run start`)} or ${chalk_1.default.cyan(`yarn start`)}\n\nPlease note that all dependencies are already ${chalk_1.default.yellow(`INSTALLED`)}\n\n${chalk_1.default.yellow(`Happy Coding!`)}\n\nFor issues, questions please contact me at: https://github.com/awran5/esbuild-create-react-app/issues`);
    });
}
function createProject(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if project exists
        if (fs_1.existsSync(projectName)) {
            const confirm = yield functions_1.confirmInquirer(projectName);
            const spinner = ora_1.default();
            if (confirm) {
                spinner.start(`Removing ${chalk_1.default.cyan(projectName)}, please wait`);
                try {
                    yield functions_1.removeDir(projectName);
                    spinner.succeed('Done');
                }
                catch (err) {
                    spinner.fail('Failed!');
                    console.log(err);
                    process.exit(1);
                }
            }
        }
        // Greeting Message
        console.log(`${chalk_1.default.yellowBright(`
                                                  
            ${chalk_1.default.magenta('W  E  L  C  O  M  E      T  O')}         

      .d88b.  .d8888b       .d8888b 888d888 8888b.  
     d8P  Y8b 88K          d88P"    888P"      "88b 
     88888888 "Y8888b.     888      888    .d888888 
     Y8b.          X88     Y88b.    888    888  888 
      "Y8888   88888P'      "Y8888P 888    "Y888888 
                                                    
     `)}\nHello there! esbuild create react app is a minimal replacement for ${chalk_1.default.greenBright(`create react app`)} using a truly blazing fast ${chalk_1.default.greenBright(`esbuild`)} bundler.\nUp and running in less than 1 minute with almost zero configuration needed.
     `);
        // Get selected templates
        const selectedTemplate = yield functions_1.templateInquirer();
        const tasks = new listr2_1.Listr([
            {
                title: `[1/5] 🚀 Creating a New Project in ${chalk_1.default.cyan(projectName)}`,
                task: () => __awaiter(this, void 0, void 0, function* () { return promises_1.mkdir(projectName).catch((err) => console.log(`Failed to create ${chalk_1.default.cyan(projectName)}. ${err}`)); })
            },
            {
                title: `[2/5] 🍳 Fetching Repositories...`,
                task: () => __awaiter(this, void 0, void 0, function* () { return fetchTemplateRepo(projectName, selectedTemplate); })
            },
            {
                title: '[3/5] 🔗 Installing Dependencies...',
                task: () => installDependencies(projectName)
            },
            {
                title: '[4/5] 🎁 Updating files...',
                task: () => updateFiles(projectName)
            },
            {
                title: '[5/5] ✨ All done...',
                task: () => new Promise((resolve) => setTimeout(resolve, 500))
            }
        ], {
            exitOnError: true
        });
        // Run tasks and show successful message whhen done
        tasks
            .run()
            .then(() => successfulMessage(projectName))
            .catch(console.error);
    });
}
exports.default = createProject;
