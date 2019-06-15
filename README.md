# markdown-dependencies
![version](https://img.shields.io/badge/version-0.1.0-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

This tool has been created to create or update the **Dependencies section in README.md** of the SlimIO projects.

## Requirements
- [Node.js](https://nodejs.org/en/) v10 or higher

## Getting Started

Clone and link the project.

```bash
$ git clone https://github.com/SlimIO/Markdown-Dependencies.git
$ cd Markdown-Dependencies
$ npm link
```

Then, create a local `.env` file with a npm access token
```
NPM_TOKEN=
```

> ⚠️ If you dont known how to create an access token, follow [this guide](https://docs.npmjs.com/creating-and-viewing-authentication-tokens)

## Usage example
When installed globally the `mddep` executable will be exposed in your terminal

```bash
$ cd yourProject
$ mddep
```

Use the argument `-c` or `clipboard` to copy the stdout to the clipboard.

## API
TBC

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/arg-parser](https://github.com/SlimIO/Arg-parser)|Minor|Low|Script argument parser}|
|[@slimio/npm-registry](https://github.com/SlimIO/Npm-registry)|Minor|Low|GET data from NPM registry}|
|[clipboardy](https://github.com/sindresorhus/clipboardy#readme)|Minor|High|Copy to clipboard|

## License
MIT
