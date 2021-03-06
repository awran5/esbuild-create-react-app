# esbuild Create React App [![NPM](https://img.shields.io/npm/v/esbuild-create-react-app.svg)](https://www.npmjs.com/package/esbuild-create-react-app) ![npm bundle size](https://img.shields.io/bundlephobia/min/esbuild-create-react-app) ![GitHub](https://img.shields.io/github/license/awran5/esbuild-create-react-app)

<br />
<img alt="Logo" align="right" src="./assets/logo.png" width="20%" />

A minimal replacement for create-react-app using a truly blazing fast [esbuild](https://esbuild.github.io/) bundler. Up and running in less than 1 minute with almost zero configuration needed.

<br />
<br />
<br />
<br />

## What is inside?

Truly minimal React app with almost zero configuration needed.

- [TypeScript](https://www.typescriptlang.org/)
- [esbuild](https://esbuild.github.io/)
- [Eslint](https://eslint.org/) with [airbnb](https://github.com/airbnb/javascript) Style Guide
- [Prettier](https://prettier.io/)
- [Husky](https://github.com/typicode/husky)
- [lint-staged](https://github.com/okonet/lint-staged)
- [live-server](https://github.com/tapio/live-server)

---

## Overview

<p align='center'>
<img src='./assets/overview.gif' width='800' alt='app overview'>
</p>

## Install

```sh
npx esbuild-create-react-app my-app

cd my-app

yarn start | npm run start
```

### Known issue

Inquirer select does't work on Windows 10 git bash Terminal [mintty](https://github.com/mintty/mintty), It works fine on integrated VS Code Terminal though.

## Available Templates

- Default [JS template](https://github.com/awran5/esbuild-react-app-js-template)
- [Typescript template](https://github.com/awran5/esbuild-react-app-ts-template)

### License

MIT © [awran5](https://github.com/awran5/)
