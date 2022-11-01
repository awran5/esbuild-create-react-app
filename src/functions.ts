import { rm } from 'fs'
import Os from 'os'
import inquirer from 'inquirer'
import chalk from 'chalk'

/**
 * fix: inquirer list type not working in windows */
const listType = Os.platform() === 'win32' ? 'rawlist' : 'list'

export async function confirmInquirer(projectName: string) {
  return new Promise<boolean>((resolve, reject) => {
    inquirer
      .prompt({
        type: 'confirm',
        name: 'exists',
        message: `Project ${chalk.cyan(projectName)} is already exists. Do you want to remove it? (hit enter for NO)?`,
        default: false
      })
      .then((answer) => answer.exists && resolve(true))
      .catch((err) => reject(new Error(err)))
  })
}

export async function templateInquirer() {
  return new Promise<string>((resolve, reject) => {
    inquirer
      .prompt({
        type: listType,
        name: 'selected',
        message: `To get started please choose a template`,
        choices: ['Javascript', 'Typescript']
      })
      .then((answer) => resolve(answer.selected))
      .catch((err) => reject(new Error(err)))
  })
}

export async function removeDir(dirName: string) {
  return new Promise<void>((resolve, reject) => {
    rm(dirName, { recursive: true }, (err) => {
      if (err) {
        reject(new Error(`Failed to remove ${chalk.cyan(dirName)}. ${err}`))
      }
      resolve()
    })
  })
}
