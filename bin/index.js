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
    const { name } = JSON.parse(buffer.toString());
    const npmReg = new Registry();
    // console.log(name);

    npmReg.login(process.env.NPM_TOKEN);

    const pkg = await npmReg.package(name);
    const lastVer = pkg.version(pkg.lastVersion);
    // console.log(pkg.lastVersion);
    // console.log(lastVer.dependencies);

    let markdown = "";
    if (argv.get("clipboard") === true) {
        markdown += "## Dependencies\n\n";
        markdown += "|Name|Refactoring|Security Risk|Usage|\n";
        markdown += "|---|---|---|---|\n";
    }
    
    console.log("## Dependencies");
    console.log();
    console.log("|Name|Refactoring|Security Risk|Usage|");
    console.log("|---|---|---|---|");

    for (const [dep, version] of Object.entries(lastVer.dependencies)) {
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
