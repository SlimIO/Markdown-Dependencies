# markdown-dependencies
![Version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Markdown-Dependencies/master/package.json?token=Aeue0P3eryCYRikk9tHZScyXOpqtMvFIks5ca-XwwA%3D%3D&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Markdown-Dependencies/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/Markdown-Dependencies)
![size](https://img.shields.io/github/languages/code-size/SlimIO/Markdown-Dependencies)
[![Known Vulnerabilities](https://snyk.io//test/github/SlimIO/Markdown-Dependencies/badge.svg?targetFile=package.json)](https://snyk.io//test/github/SlimIO/Markdown-Dependencies?targetFile=package.json)

This tool has been created to create or update the **Dependencies section in README.md** of the SlimIO projects.

<p align="center">
    <img src="https://i.imgur.com/LIi9Wh7.png">
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v10 or higher

## Getting Started

Clone and link the project.

```bash
$ git clone https://github.com/SlimIO/Markdown-Dependencies.git
$ cd Markdown-Dependencies
$ npm link
```

## Environment Variables

To configure the project you have to register (set) environment variables on your system. These variables can be set in a **.env** file (that file must be created at the root of the project).
```
NPM_TOKEN=
```

To known how to get a **NPM_TOKEN** or how to register environment variables follow our [Governance Guide](https://github.com/SlimIO/Governance/blob/master/docs/tooling.md#environment-variables).

## Usage example
When installed globally the `mddep` executable will be exposed in your terminal

```bash
$ cd yourProject
$ mddep generate
```

Use the argument `-c` or `clipboard` to copy the stdout to the clipboard.

## How to complete
- **Refactoring**: Minor if the project can be easily replaced by another **package** (or by a native implementation).
- **Security Risk**: Does the project have indirect dependencies? Does it perform operations on http or fs ?

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/npm-registry](https://github.com/SlimIO/Npm-registry)|Minor|Low|GET data from NPM registry|
|[@slimio/pretty-json](https://github.com/SlimIO/Pretty-JSON)|Minor|Low|Stdout beautified JSON|
|[clipboardy](https://github.com/sindresorhus/clipboardy#readme)|Minor|High|Copy to clipboard|
|[dotenv](https://github.com/motdotla/dotenv)|Minor|Low|Loads environment variables from .env|
|[kleur](https://github.com/lukeed/kleur)|Minor|Low|The fastest Node.js library for formatting terminal text with ANSI colors|
|[make-promises-safe](https://github.com/mcollina/make-promises-safe#readme)|Minor|Low|Force Node.js [DEP00018](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections)|
|[marked](https://marked.js.org)|Minor|Low|Markdown tokenizer|
|[sade](https://github.com/lukeed/sade#readme)|Minor|Low|Sade is a small but powerful tool for building command-line interface (CLI) applications for Node.js that are fast, responsive, and helpful!|

## License
MIT
