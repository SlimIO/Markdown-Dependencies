#!/usr/bin/env node
"use strict";

// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const Registry = require("@slimio/npm-registry");
const { parseArg, argDefinition } = require("@slimio/arg-parser");
const prettyJSON = require("@slimio/pretty-json");
const clipboardy = require("clipboardy");

// Require Internal Packages
const packages = require("../src/packages.json");

// CONSTANTS
const PREFIX_VERSION = new Set(["^", "~", "*", ">"]);
const KNOW_DEPS = new Map(packages);

const argv = parseArg([
    argDefinition("-c --clipboard", "Copy directly to clipboard"),
    argDefinition("-d --dependency [array=[]]", "Give line of specific dependencies")
]);

/**
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
    if (argv.has("dependency")) {
        if (argv.get("dependency").length === 0) {
            console.log("List of all dependencies repertoried");
            prettyJSON([...KNOW_DEPS.keys()]);
        }
        else {
            const unknows = [];
            markdown = "";
            for (const dep of argv.get("dependency")) {
                if (!KNOW_DEPS.has(dep)) {
                    unknows.push(dep);
                    continue;
                }
                const [homepage, refac, securityRisk, usage] = KNOW_DEPS.get(dep);
                markdown += `|[${dep}](${homepage})|${refac}|${securityRisk}|${usage}}|\n`;
                console.log(`|[${dep}](${homepage})|${refac}|${securityRisk}|${usage}}|`);
            }

            if (unknows.length > 0) {
                console.log(`Unknow dep: ${[...unknows]}`);
            }

            if (argv.get("clipboard") === true) {
                await clipboardy.write(markdown);
            }
        }
    }
    else {
        const buffer = await readFile(join(process.cwd(), "package.json"));
        const { name, dependencies } = JSON.parse(buffer.toString());
        const npmReg = new Registry();
        console.log(name);

        npmReg.login(process.env.NPM_TOKEN);
        const entries = Object.entries(dependencies || {});

        let markdown = "";
        if (argv.get("clipboard") === true) {
            markdown += "## Dependencies\n\n";

            if (entries.length > 0) {
                markdown += "|Name|Refactoring|Security Risk|Usage|\n";
                markdown += "|---|---|---|---|\n";
            }
            else {
                markdown += "This project have no dependencies.";
            }
        }

        console.log("## Dependencies");
        console.log();
        if (entries.length > 0) {
            console.log("|Name|Refactoring|Security Risk|Usage|");
            console.log("|---|---|---|---|");
        }
        else {
            console.log("This project have no dependencies.");
        }

        for (const [dep, version] of entries) {
            let homepage = "";
            let refac = "";
            let securityRisk = "";
            let usage = "";
            if (KNOW_DEPS.has(dep)) {
                const [page, refactor, security, usag] = KNOW_DEPS.get(dep);
                homepage = page;
                refac = refactor;
                securityRisk = security;
                usage = usag;
            }
            else {
                const depPkg = await npmReg.package(dep);
                homepage = depPkg.homepage;
                refac = dep.includes("@slimio") ? "Minor" : "⚠️Major";
                const ver = PREFIX_VERSION.has(version.charAt(0)) ? version.substr(1) : version;
                securityRisk = Object.keys(depPkg.version(ver).dependencies).length > 0 ? "High" : "Low";
                usage = "TBC";
            }
            // console.log(`dep: ${dep}, version: ${version.substr(1)}`);
            if (argv.get("clipboard") === true) {
                markdown += `|[${dep}](${homepage})|${refac}|${securityRisk}|${usage}|\n`;
            }
            console.log(`|[${dep}](${homepage})|${refac}|${securityRisk}|${usage}|`);
        }
        if (argv.get("clipboard") === true) {
            await clipboardy.write(markdown);
        }
    }
}
main().catch(console.error);
