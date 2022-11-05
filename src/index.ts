#!/usr/bin/env node
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { Listr } from "listr2";
import { readFile, writeFile, rm } from "node:fs/promises";
import { existsSync, mkdir } from "node:fs";
import { platform } from "node:os";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const asyncExec = promisify(exec);

// fix: inquirer list type not working in windows
const listType = platform() === "win32" ? "rawlist" : "list";

async function confirmRemoveDir(projectName: string) {
  return new Promise<boolean>((resolve, reject) => {
    inquirer
      .prompt({
        type: "confirm",
        name: "exists",
        message: `Project ${chalk.cyan(projectName)} is already exists. Do you want to remove it? (hit enter for NO)?`,
        default: false
      })
      .then((answer) => answer.exists && resolve(true))
      .catch((err) => reject(new Error(err)));
  });
}

async function welcomeMessage() {
  console.log(
    `${chalk.yellowBright(`
                                                  
            ${chalk.magenta("W  E  L  C  O  M  E      T  O")}         

      .d88b.  .d8888b       .d8888b 888d888 8888b.  
     d8P  Y8b 88K          d88P"    888P"      "88b 
     88888888 "Y8888b.     888      888    .d888888 
     Y8b.          X88     Y88b.    888    888  888 
      "Y8888   88888P'      "Y8888P 888    "Y888888 
                                                    
     `)}\nHello! ${chalk.bold(`esbuild create react app`)} is a minimal replacement of ${chalk.cyan(
      `create react app`
    )} using a truly blazing fast ${chalk.bold(
      `esbuild bundler.`
    )}\nUp and running in less than 1 minute with almost zero configuration needed.
     `
  );
}

async function templatechoice() {
  return new Promise<string>((resolve, reject) => {
    inquirer
      .prompt({
        type: listType,
        name: "selected",
        message: `To get started please choose a template`,
        choices: ["Javascript", "Typescript"]
      })
      .then((answer) => resolve(answer.selected))
      .catch((err) => reject(new Error(err)));
  });
}

async function fetchTemplateRepo(projectName: string, template: string) {
  const templates = {
    js: `https://github.com/awran5/esbuild-react-app-js-template`,
    ts: `https://github.com/awran5/esbuild-react-app-ts-template`
  };
  const templateChosen = template === "Typescript" ? templates.ts : templates.js;

  try {
    await asyncExec(`git clone ${templateChosen} .`, { cwd: projectName });
  } catch (err) {
    console.log(`Failed to clone repository. ${err}`);
    process.exit(1);
  }
}

async function isDependencies() {
  return new Promise<boolean>((resolve, reject) => {
    inquirer
      .prompt({
        type: listType,
        name: "dependencies",
        message: `Do you want to install dependencies?`,
        choices: ["Yes", "No"]
      })
      .then((answer) => resolve(answer.dependencies === "Yes"))
      .catch((err) => reject(new Error(err)));
  });
}

async function installDependencies(projectName: string) {
  try {
    await asyncExec("npm i", { cwd: projectName });
  } catch (err) {
    console.log(`Failed to install dependencies. ${err}`);
    process.exit(1);
  }
}

async function updateFiles(projectName: string) {
  // Get author name
  let author = "your-name";

  try {
    author = (await asyncExec(`git config --global user.name`)).stdout.trim();
  } catch (e) {
    author = "your-name";
  }

  // Update license year and author
  try {
    const license = `${projectName}/LICENSE`;
    let newLicense = await readFile(license, { encoding: "utf8" });
    newLicense = newLicense.replace(/<author>/, author);
    newLicense = newLicense.replace(/<year>/, `${new Date().getFullYear()}-present`);
    // Write a new license file
    await writeFile(license, newLicense, { encoding: "utf8" });
  } catch (err) {
    console.log(`Failed to update LICENSE. ${err}`);
    process.exit(1);
  }

  // Update package.json
  try {
    const packageJson = `${projectName}/package.json`;
    const read = await readFile(packageJson, { encoding: "utf8" });
    const parse = JSON.parse(read);
    const newPackageJson = {
      ...parse,
      name: projectName,
      author
    };
    // Write a new package.json
    await writeFile(packageJson, JSON.stringify(newPackageJson, null, 2), "utf8");
  } catch (err) {
    console.log(`Failed to update package.json. ${err}`);
    process.exit(1);
  }

  // Initialize a fresh Git
  try {
    await rm(`${projectName}/.git`, { recursive: true });
    await asyncExec(`git init && git add . && git commit -m "initial commit"`, { cwd: projectName });
  } catch (err) {
    console.log(`Failed to initialize git. ${err}`);
    process.exit(1);
  }
}

async function successfulMessage(projectName: string, dependencies: boolean) {
  const start = dependencies ? "npm run start" : "npm i && npm run start";
  const installed = dependencies ? `ALREADY` : `NOT`;
  console.log(
    `${chalk.green(`
                                                             
    .d8888b  888  888  .d8888b .d8888b .d88b.  .d8888b  .d8888b  
    88K      888  888 d88P"   d88P"   d8P  Y8b 88K      88K      
    "Y8888b. 888  888 888     888     88888888 "Y8888b. "Y8888b. 
         X88 Y88b 888 Y88b.   Y88b.   Y8b.          X88      X88 
     88888P'  "Y88888  "Y8888P "Y8888P "Y8888   88888P'  88888P' 
                                                              
    `)}\nNow just navigate to your ${chalk.cyan(projectName)} project and type ${chalk.cyan(
      start
    )}\n\nPlease note that all dependencies are ${chalk.yellow(
      installed
    )} installed!\n\nFor issues, questions please contact me at https://github.com/awran5/esbuild-create-react-app/issues\n\n${chalk.yellow(
      `Happy Coding!`
    )}\n`
  );
}

// Create a new project
(async () => {
  const args = process.argv.slice(2, process.argv.length);
  const projectName = args[0];
  const isValidName = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

  // Check if name is provided
  if (!projectName) {
    console.log(
      `\n${chalk.bgRed(` Error! `)} Please specify a project name e.g. ${chalk.cyan(
        `npx react-esbuild-app`
      )} ${chalk.green("my-app")}\n`
    );
    process.exit();
  }
  // Check if name is valid following npm name pattern
  if (!isValidName.test(projectName)) {
    console.log(
      `\n${chalk.bgRed(
        ` npm naming restrictions! `
      )} Please specify a project name with lowercase characters separated by hyphen (-) e.g. ${chalk.green(
        "my-app"
      )}\n`
    );
    process.exit();
  }
  // Check if project exists
  if (existsSync(projectName)) {
    const spinner = ora();

    const confirmRemove = await confirmRemoveDir(projectName);
    if (confirmRemove) {
      spinner.start(`Removing ${chalk.cyan(projectName)}, please wait`);

      try {
        await rm(projectName, { recursive: true });
        spinner.succeed("Done");
      } catch (err) {
        spinner.fail("Failed!");
        console.log(err);
        process.exit(1);
      }
    }
  }

  await welcomeMessage();

  // Get selected templates
  const selectedTemplate = await templatechoice();
  // Ask about installing dependencies
  const confirmDependencies = await isDependencies();

  const tasks = new Listr(
    [
      {
        title: `[1/5] 📂 Creating a New Project in ${chalk.cyan(projectName)}`,
        task: async (_, task): Promise<void> => {
          mkdir(projectName, { recursive: true }, (err) => {
            if (err) throw err;
          });

          await setTimeout(500);
          task.title = "[1/5] 📂 done!";
        }
      },
      {
        title: `[2/5] 🚀 Fetching Repositories...`,
        task: async (_, task): Promise<void> => {
          await fetchTemplateRepo(projectName, selectedTemplate);

          await setTimeout(500);
          task.title = "[2/5] 🚀 done!";
        }
      },
      {
        title: "[3/5] 🔗 Installing Dependencies...",
        task: async (_, task): Promise<void> => {
          if (!confirmDependencies) task.skip("skipping");
          else await installDependencies(projectName);

          await setTimeout(500);
          task.title = `[3/5] 🔗 ${confirmDependencies ? "done!" : "skipping.."}`;
        }
      },
      {
        title: "[4/5] 🎁 Updating files...",
        task: async (_, task): Promise<void> => {
          await updateFiles(projectName);

          await setTimeout(500);
          task.title = "[4/5] 🎁 done!";
        }
      },
      {
        title: "[5/5] ✨ All done...",
        task: async (_, task): Promise<void> => {
          await setTimeout(500);
          task.title = "[5/5] ✨ done!";
        }
      }
    ],
    {
      exitOnError: true
    }
  );

  try {
    await tasks.run();
    await successfulMessage(projectName, confirmDependencies);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
