import { promisify } from 'util'
import { exec } from 'child_process'
import { existsSync, copyFileSync, rmdir, readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync } from 'fs'
import chalk from 'chalk'
import path from 'path'
import inquirer from 'inquirer'
import { Listr } from 'listr2'
import ora from 'ora'

const asyncExec = promisify(exec)

async function getProjectName() {
  const args = process.argv.slice(2, process.argv.length)
  const name = args[0]
  const acceptedName = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name)

  if (!name) {
    console.log(
      `\n${chalk.bgRed(` Error! `)} Please specify a project name e.g. ${chalk.cyan(
        `npx react-esbuild-app`
      )} ${chalk.green('my-app')}\n`
    )
    process.exit()
  }

  if (!acceptedName) {
    console.log(
      `\n${chalk.bgRed(
        ` npm naming restrictions! `
      )} Please specify a project name with lowercase characters separated by hyphen (-) e.g. ${chalk.green(
        'my-app'
      )}\n`
    )
    process.exit()
  }
  return name
}

async function removeProject(projectName: string) {
  const spinner = ora()
  return new Promise<boolean>((resolve, reject) => {
    spinner.start(`Removing ${chalk.cyan(projectName)}, please wait`)
    rmdir(projectName, { recursive: true }, (error) => {
      if (error) {
        reject(
          new Error(`Directory ${chalk.red(projectName)} can not be removed. Please close any open files and try again`)
        )
      }
      spinner.succeed('Done')
      resolve(true)
    })
  })
}

async function isProjectExists(projectName: string) {
  if (existsSync(projectName)) {
    return new Promise<boolean>((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'exists',
            message: `Project ${chalk.cyan(
              projectName
            )} is already exists. Do you want to remove it? (just hit enter for NO)?`,
            default: false
          }
        ])
        .then((answer) => answer.exists && resolve(removeProject(projectName)))
        .catch((err) => reject(err))
    })
  }
  return false
}

async function getSelectedTemplate() {
  const templates = readdirSync(`${__dirname}/../templates`, { withFileTypes: true })
  const templatesDirectories = templates.filter((folder) => folder.isDirectory()).map((template) => template.name)

  return new Promise<string>((resolve, reject) => {
    inquirer
      .prompt({
        type: 'list',
        name: 'selected',
        message: 'Welcome! To get started please choose a template',
        choices: [...templatesDirectories]
      })
      .then((answer) => resolve(answer.selected))
      .catch((err) => reject(err))
  })
}

async function copyFolderSync(source: string, destination: string) {
  mkdirSync(destination)
  readdirSync(source).map((file) => {
    const srcPath = path.join(source, file)
    const destPath = path.join(destination, file)

    return lstatSync(srcPath).isFile() ? copyFileSync(srcPath, destPath) : copyFolderSync(srcPath, destPath)
  })
}

async function updatePackageJson(projectName: string) {
  const author = (process.env.USERPROFILE && process.env.USERPROFILE.split(path.sep)[2]) || 'package-author'

  const packageJsonPath = `${projectName}/package.json`
  const oldPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const newPackageJson = { ...oldPackageJson, name: projectName, author }

  writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2), 'utf8')
}

type InstallCommand = 'yarn' | 'npm i'
async function installDependencies(projectName: string) {
  let pm: InstallCommand = 'npm i'

  try {
    await asyncExec('yarnpkg --version')
    pm = 'yarn'
  } catch (e) {
    pm = 'npm i'
  }

  const options = { cwd: projectName }
  await asyncExec(pm, options)
  await asyncExec(`git init && git add . && git commit -m "initial commit"`, options)
}

async function successfulMessage(projectName: string) {
  console.log(
    `\n${chalk.black.bgGreen(
      '  SUCCESS!  '
    )}\n\nAll dependencies are installed already, to get started, just navigate to your ${chalk.cyan(
      projectName
    )} project and type ${chalk.cyan('npm run start')} or ${chalk.cyan('yarn start')}\n\n${chalk.yellow(
      'Happy Coding!'
    )}\n\nQuestions? Feedback? Please let me know!
    ${chalk.green('https://github.com/awran5/esbuild-create-react-app/issues')}`
  )
}

export default async function createProject() {
  // Read project name from args
  const projectName = await getProjectName()
  // Check if project exists
  await isProjectExists(projectName)

  // Greeting Message
  console.log(
    `${chalk.greenBright(`
    :::::::::: ::::::::        ::::::::  :::::::::      :::     
    :+:       :+:    :+:      :+:    :+: :+:    :+:   :+: :+:   
    +:+       +:+             +:+        +:+    +:+  +:+   +:+  
    +#++:++#  +#++:++#++      +#+        +#++:++#:  +#++:++#++: 
    +#+              +#+      +#+        +#+    +#+ +#+     +#+ 
    #+#       #+#    #+#      #+#    #+# #+#    #+# #+#     #+# 
    ########## ########        ########  ###    ### ###     ### `)}\n`
  )

  // Read templates
  const template = await getSelectedTemplate()

  const tasks = new Listr([
    {
      title: `[1/4] 🚀 Creating a new project in ${chalk.cyan(projectName)}`,
      task: () => copyFolderSync(path.join(`${__dirname}/../templates`, template), projectName)
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
  ])

  // Run and show successful message
  tasks
    .run()
    .then(async () => successfulMessage(projectName))
    .catch(console.error)
}
