import { existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { promisify } from 'util'
import { exec } from 'child_process'
import chalk from 'chalk'
import { Listr } from 'listr2'
import ora from 'ora'
import { removeDir, confirmInquirer, templateInquirer } from './functions'

const asyncExec = promisify(exec)

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

async function fetchTemplateRepo(projectName: string, template: string) {
  const templates = {
    js: `https://github.com/awran5/esbuild-react-app-js-template`,
    ts: `https://github.com/awran5/esbuild-react-app-ts-template`
  }
  const templateChosen = template === 'Typescript' ? templates.ts : templates.js

  try {
    await asyncExec(`git clone ${templateChosen} .`, { cwd: projectName })
  } catch (err) {
    console.log(`Failed to clone repository. ${err}`)
    process.exit(1)
  }
}

async function installDependencies(projectName: string) {
  let pm = 'npm i'

  try {
    await asyncExec('yarnpkg --version')
    pm = 'yarn'
  } catch (err) {
    pm = 'npm i'
  }

  try {
    await asyncExec(pm, { cwd: projectName })
  } catch (err) {
    console.log(`Failed to install dependencies. ${err}`)
    process.exit(1)
  }
}

async function updateFiles(projectName: string) {
  // Get author name
  let author = 'your-name'

  try {
    author = (await asyncExec(`git config --global user.email`)).stdout.trim()
  } catch (e) {
    author = 'your-name'
  }

  // Update package.json
  const packageJson = `${projectName}/package.json`
  const read = await readFile(packageJson, 'utf-8')
  const parse = JSON.parse(read)
  const newPackageJson = {
    ...parse,
    name: projectName,
    author
  }

  // Write a new package.json
  try {
    await writeFile(packageJson, JSON.stringify(newPackageJson, null, 2), 'utf8')
  } catch (err) {
    console.log(`Failed to update package.json. ${err}`)
    process.exit(1)
  }

  // Initialize a fresh Git
  try {
    await removeDir(`${projectName}/.git`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  try {
    await asyncExec(`git init && git add . && git commit -m "initial commit"`, { cwd: projectName })
  } catch (err) {
    console.log(`Failed to initialize git. ${err}`)
    process.exit(1)
  }
}

async function successfulMessage(projectName: string) {
  console.log(
    `${chalk.green(`
                                                             
    .d8888b  888  888  .d8888b .d8888b .d88b.  .d8888b  .d8888b  
    88K      888  888 d88P"   d88P"   d8P  Y8b 88K      88K      
    "Y8888b. 888  888 888     888     88888888 "Y8888b. "Y8888b. 
         X88 Y88b 888 Y88b.   Y88b.   Y8b.          X88      X88 
     88888P'  "Y88888  "Y8888P "Y8888P "Y8888   88888P'  88888P' 
                                                              
    `)}\nNow just navigate to your ${chalk.cyan(projectName)} project and type ${chalk.cyan(
      `npm run start`
    )} or ${chalk.cyan(`yarn start`)}\n\nPlease note that all dependencies are already ${chalk.yellow(
      `INSTALLED`
    )}\n\n${chalk.yellow(
      `Happy Coding!`
    )}\n\nFor issues, questions please contact me at: https://github.com/awran5/esbuild-create-react-app/issues`
  )
}

export default async function createProject(projectName: string) {
  // Check if project exists
  if (existsSync(projectName)) {
    const confirm = await confirmInquirer(projectName)
    const spinner = ora()
    if (confirm) {
      spinner.start(`Removing ${chalk.cyan(projectName)}, please wait`)

      try {
        await removeDir(projectName)
        spinner.succeed('Done')
      } catch (err) {
        spinner.fail('Failed!')
        console.log(err)
        process.exit(1)
      }
    }
  }

  // Greeting Message
  console.log(
    `${chalk.yellowBright(`
                                                  
            ${chalk.magenta('W  E  L  C  O  M  E      T  O')}         

      .d88b.  .d8888b       .d8888b 888d888 8888b.  
     d8P  Y8b 88K          d88P"    888P"      "88b 
     88888888 "Y8888b.     888      888    .d888888 
     Y8b.          X88     Y88b.    888    888  888 
      "Y8888   88888P'      "Y8888P 888    "Y888888 
                                                    
     `)}\nHello there! esbuild create react app is a minimal replacement for ${chalk.greenBright(
      `create react app`
    )} using a truly blazing fast ${chalk.greenBright(
      `esbuild`
    )} bundler.\nUp and running in less than 1 minute with almost zero configuration needed.
     `
  )

  // Get selected templates
  const selectedTemplate = await templateInquirer()

  const tasks = new Listr(
    [
      {
        title: `[1/5] 🚀 Creating a New Project in ${chalk.cyan(projectName)}`,
        task: async () =>
          mkdir(projectName).catch((err) => console.log(`Failed to create ${chalk.cyan(projectName)}. ${err}`))
      },
      {
        title: `[2/5] 🍳 Fetching Repositories...`,
        task: async () => fetchTemplateRepo(projectName, selectedTemplate)
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
        task: () => new Promise<void>((resolve) => setTimeout(resolve, 500))
      }
    ],
    {
      exitOnError: true
    }
  )

  // Run tasks and show successful message whhen done
  tasks
    .run()
    .then(() => successfulMessage(projectName))
    .catch(console.error)
}
