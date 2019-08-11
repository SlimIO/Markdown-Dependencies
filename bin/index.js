#!/usr/bin/env node
"use strict";

require("make-promises-safe");

// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const Registry = require("@slimio/npm-registry");
const prettyJSON = require("@slimio/pretty-json");
const clipboardy = require("clipboardy");
const { white, red, cyan } = require("kleur");
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
        const buffer = await readFile(join(process.cwd(), "package.json"));
        const { name, dependencies } = JSON.parse(buffer.toString());
        const npmReg = new Registry();
        console.log(white().bold(`\n > Generating markdown dependencies for: ${cyan().bold(name)}\n`));

        npmReg.login(process.env.NPM_TOKEN);
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
