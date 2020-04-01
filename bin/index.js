#!/usr/bin/env node
"use strict";

// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

require("make-promises-safe");
require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const Registry = require("@slimio/npm-registry");
const prettyJSON = require("@slimio/pretty-json");
const clipboardy = require("clipboardy");
const { white, red, cyan } = require("kleur");
const marked = require("marked");
const sade = require("sade");

// Require Internal Packages
const packages = require("../src/packages.json");

// CONSTANTS
const PREFIX_VERSION = new Set(["^", "~", "*", ">"]);
const KNOW_DEPS = new Map(packages);

const prog = sade("mddep").version("0.1.0");

prog
    .command("show [dependenciesName]")
    .describe("show/get one/many/all dependencies")
    .option("-c, --clipboard", "copy to clipboard", false)
    .action(async(depName, opts) => {
        const names = typeof depName === "string" ? depName.split(",") : [];
        console.log("");
        if (names.length === 0) {
            console.log(white().bold(" > Available dependencies:"));
            prettyJSON([...KNOW_DEPS.keys()]);

            return;
        }

        const unknows = new Set();
        let markdown = "";
        for (const dep of names) {
            if (!KNOW_DEPS.has(dep)) {
                unknows.add(dep);
                continue;
            }
            const [homepage, refac, securityRisk, usage] = KNOW_DEPS.get(dep);
            markdown += `|[${dep}](${homepage})|${refac}|${securityRisk}|${usage}}|\n`;
            console.log(`|[${dep}](${homepage})|${refac}|${securityRisk}|${usage}}|`);
        }

        if (unknows.size > 0) {
            console.log(red().bold("\n Unknown dependencies:"));
            prettyJSON([...unknows]);
        }

        if (opts.clipboard === true) {
            await clipboardy.write(markdown);
        }
    });

prog
    .command("generate")
    .describe("generate markdown table for current project dependencies")
    .option("-c, --clipboard", "copy to clipboard", false)
    .action(async(opts) => {
        const currentDependencies = Object.create(null);
        {
            const str = await readFile(join(process.cwd(), "README.md"), "utf-8");
            const tokens = marked.lexer(str);

            for (let id = 0; id < tokens.length; id++) {
                const row = tokens[id];
                if (row.type === "heading" && row.text === "Dependencies") {
                    const nextRow = tokens[id + 1];
                    if (nextRow.type !== "table") {
                        break;
                    }

                    nextRow.cells.reduce((prev, [fullName, refactoring, security, usage]) => {
                        const [, name, url] = /\[(.*)\]\((.*)\)/g.exec(fullName);
                        prev[name] = { url, refactoring, security, usage };

                        return prev;
                    }, currentDependencies);

                    break;
                }
            }
        }

        const buffer = await readFile(join(process.cwd(), "package.json"));
        const { name, dependencies } = JSON.parse(buffer.toString());
        const npmReg = new Registry();
        console.log(white().bold(`\n > Generating markdown dependencies for: ${cyan().bold(name)}\n`));

        if (typeof process.env.NPM_TOKEN === "string") {
            npmReg.login(process.env.NPM_TOKEN);
        }
        const entries = Object.entries(dependencies || {});

        let markdown = "## Dependencies\n\n";
        if (entries.length > 0) {
            markdown += "|Name|Refactoring|Security Risk|Usage|\n";
            markdown += "|---|---|---|---|\n";
        }
        else {
            markdown += "This project have no dependencies.";
        }
        console.log(markdown);

        for (const [dep, version] of entries) {
            if (Reflect.has(currentDependencies, dep)) {
                const { url, refactoring, security, usage } = currentDependencies[dep];

                const line = `|[${dep}](${url})|${refactoring}|${security}|${usage}|`;
                if (opts.clipboard === true) {
                    markdown += `${line}\n`;
                }
                console.log(line);
                continue;
            }

            // eslint-disable-next-line
            let [homepage = "", refactoring = "Minor", securityRisk = "", usage = "TBC"] = KNOW_DEPS.get(dep) || [];
            if (!KNOW_DEPS.has(dep)) {
                const depPkg = await npmReg.package(dep);
                homepage = depPkg.homepage;
                const ver = PREFIX_VERSION.has(version.charAt(0)) ? version.substr(1) : version;
                securityRisk = Object.keys(depPkg.version(ver).dependencies).length > 0 ? "High" : "Low";
            }

            const line = `|[${dep}](${homepage})|${refactoring}|${securityRisk}|${usage}|`;
            if (opts.clipboard === true) {
                markdown += `${line}\n`;
            }
            console.log(line);
        }

        if (opts.clipboard === true) {
            await clipboardy.write(markdown);
        }
    });

prog.parse(process.argv);
