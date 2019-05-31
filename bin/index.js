#!/usr/bin/env node
// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const Registry = require("@slimio/npm-registry");
const { parseArg, argDefinition } = require("@slimio/arg-parser");
const clipboardy = require("clipboardy");

// CONSTANTS
const PREFIX_VERSION = new Set(["^", "~", "*", ">"]);


const argv = parseArg([
    argDefinition("-c --clipboard", "Copy directly to clipboard")
]);

async function main() {
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
        const depPkg = await npmReg.package(dep);
        const refac = dep.includes("@slimio") ? "Minor" : "⚠️Major";
        const ver = PREFIX_VERSION.has(version.charAt(0)) ? version.substr(1) : version;
        const securityRisk = Object.keys(depPkg.version(ver).dependencies).length > 0 ? "High" : "Low";
        // console.log(`dep: ${dep}, version: ${version.substr(1)}`);
        if (argv.get("clipboard") === true) {
            markdown += `|[${dep}](${depPkg.homepage})|${refac}|${securityRisk}|TBC|\n`;
        }
        console.log(`|[${dep}](${depPkg.homepage})|${refac}|${securityRisk}|TBC|`);
    }
    if (argv.get("clipboard") === true) {
        await clipboardy.write(markdown);
    }
}
main().catch(console.error);
