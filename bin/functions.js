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
const util_1 = require("util");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const listr2_1 = require("listr2");
const ora_1 = __importDefault(require("ora"));
const asyncExec = util_1.promisify(child_process_1.exec);
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
function removeProject(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = ora_1.default();
        return new Promise((resolve, reject) => {
            spinner.start(`Removing ${chalk_1.default.cyan(projectName)}, please wait`);
            fs_1.rmdir(projectName, { recursive: true }, (error) => {
                if (error) {
                    reject(new Error(`Directory ${chalk_1.default.red(projectName)} can not be removed. Please close any open files and try again`));
                }
                spinner.succeed('Done');
                resolve(true);
            });
        });
    });
}
function isProjectExists(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.existsSync(projectName)) {
            return new Promise((resolve, reject) => {
                inquirer_1.default
                    .prompt([
                    {
                        type: 'confirm',
                        name: 'exists',
                        message: `Project ${chalk_1.default.cyan(projectName)} is already exists. Do you want to remove it? (just hit enter for NO)?`,
                        default: false
                    }
                ])
                    .then((answer) => answer.exists && resolve(removeProject(projectName)))
                    .catch((err) => reject(err));
            });
        }
        return false;
    });
}
function getSelectedTemplate() {
    return __awaiter(this, void 0, void 0, function* () {
        const templates = fs_1.readdirSync(`${__dirname}/../templates`, { withFileTypes: true });
        const templatesDirectories = templates.filter((folder) => folder.isDirectory()).map((template) => template.name);
        return new Promise((resolve, reject) => {
            inquirer_1.default
                .prompt({
                type: 'list',
                name: 'selected',
                message: 'Welcome! To get started please choose a template',
                choices: [...templatesDirectories]
            })
                .then((answer) => resolve(answer.selected))
                .catch((err) => reject(err));
        });
    });
}
function copyFolderSync(source, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        fs_1.mkdirSync(destination);
        fs_1.readdirSync(source).map((file) => {
            const srcPath = path_1.default.join(source, file);
            const destPath = path_1.default.join(destination, file);
            return fs_1.lstatSync(srcPath).isFile() ? fs_1.copyFileSync(srcPath, destPath) : copyFolderSync(srcPath, destPath);
        });
    });
}
function updatePackageJson(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        const author = (process.env.USERPROFILE && process.env.USERPROFILE.split(path_1.default.sep)[2]) || 'package-author';
        const packageJsonPath = `${projectName}/package.json`;
        const oldPackageJson = JSON.parse(fs_1.readFileSync(packageJsonPath, 'utf8'));
        const newPackageJson = Object.assign(Object.assign({}, oldPackageJson), { name: projectName, author });
        fs_1.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2), 'utf8');
    });
}
function installDependencies(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        let pm = 'npm i';
        try {
            yield asyncExec('yarnpkg --version');
            pm = 'yarn';
        }
        catch (e) {
            pm = 'npm i';
        }
        const options = { cwd: projectName };
        yield asyncExec(pm, options);
        yield asyncExec(`git init && git add . && git commit -m "initial commit"`, options);
    });
}
function successfulMessage(projectName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\n${chalk_1.default.black.bgGreen('  SUCCESS!  ')}\n\nAll dependencies are installed already, to get started, just navigate to your ${chalk_1.default.cyan(projectName)} project and type ${chalk_1.default.cyan('npm run start')} or ${chalk_1.default.cyan('yarn start')}\n\n${chalk_1.default.yellow('Happy Coding!')}\n\nQuestions? Feedback? Please let me know!
    ${chalk_1.default.green('https://github.com/awran5/esbuild-create-react-app/issues')}`);
    });
}
function createProject() {
    return __awaiter(this, void 0, void 0, function* () {
        // Read project name from args
        const projectName = yield getProjectName();
        // Check if project exists
        yield isProjectExists(projectName);
        // Greeting Message
        console.log(`${chalk_1.default.greenBright(`
    :::::::::: ::::::::        ::::::::  :::::::::      :::     
    :+:       :+:    :+:      :+:    :+: :+:    :+:   :+: :+:   
    +:+       +:+             +:+        +:+    +:+  +:+   +:+  
    +#++:++#  +#++:++#++      +#+        +#++:++#:  +#++:++#++: 
    +#+              +#+      +#+        +#+    +#+ +#+     +#+ 
    #+#       #+#    #+#      #+#    #+# #+#    #+# #+#     #+# 
    ########## ########        ########  ###    ### ###     ### `)}\n`);
        // Read templates
        const template = yield getSelectedTemplate();
        const tasks = new listr2_1.Listr([
            {
                title: `[1/4] 🚀 Creating a new project in ${chalk_1.default.cyan(projectName)}`,
                task: () => copyFolderSync(path_1.default.join(`${__dirname}/../templates`, template), projectName)
            },
            {
                title: '[2/4] 🎁 Modifying package.json...',
                task: () => updatePackageJson(projectName)
            },
            {
                title: '[3/4] 🍳 Installing dependencies...',
                task: () => installDependencies(projectName)
            },
            {
                title: '[4/4] ✨ All done...',
                task: () => new Promise((resolve) => setTimeout(resolve, 500))
            }
        ]);
        // Run and show successful message
        tasks
            .run()
            .then(() => __awaiter(this, void 0, void 0, function* () { return successfulMessage(projectName); }))
            .catch(console.error);
    });
}
exports.default = createProject;
