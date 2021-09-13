import { rmdir } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
export async function confirmInquirer(projectName) {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt({
            type: 'confirm',
            name: 'exists',
            message: `Project ${chalk.cyan(projectName)} is already exists. Do you want to remove it? (hit enter for NO)?`,
            default: false
        })
            .then((answer) => answer.exists && resolve(true))
            .catch((err) => reject(new Error(err)));
    });
}
export async function templateInquirer() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt({
            type: 'list',
            name: 'selected',
            message: `To get started please choose a template`,
            choices: ['Javascript', 'Typescript']
        })
            .then((answer) => resolve(answer.selected))
            .catch((err) => reject(new Error(err)));
    });
}
export async function removeDir(dirName) {
    return new Promise((resolve, reject) => {
        rmdir(dirName, { recursive: true }, (err) => {
            if (err) {
                reject(new Error(`Failed to remove ${chalk.cyan(dirName)}. ${err}`));
            }
            resolve();
        });
    });
}
