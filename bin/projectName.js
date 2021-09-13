import chalk from 'chalk';
export async function getProjectName() {
    const args = process.argv.slice(2, process.argv.length);
    const name = args[0];
    const acceptedName = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
    if (!name) {
        console.log(`\n${chalk.bgRed(` Error! `)} Please specify a project name e.g. ${chalk.cyan(`npx react-esbuild-app`)} ${chalk.green('my-app')}\n`);
        process.exit();
    }
    if (!acceptedName) {
        console.log(`\n${chalk.bgRed(` npm naming restrictions! `)} Please specify a project name with lowercase characters separated by hyphen (-) e.g. ${chalk.green('my-app')}\n`);
        process.exit();
    }
    return name;
}
