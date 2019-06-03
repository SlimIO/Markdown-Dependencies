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
const KNOW_DEPS = new Map([
    // [Key, [Refactoring, Severity Risk, Usage]]
    ["@slimio/addon", ["Minor", "Low", "Addon container"]],
    ["@slimio/addon-factory", ["Minor", "Low", "Addon generator"]],
    ["@slimio/alert", ["Minor", "Low", "Create & manage addon's alerts"]],
    ["@slimio/arg-parser", ["Minor", "Low", "Script argument parser"]],
    ["@slimio/async-cli-spinner", ["Minor", "Low", "Multi async cli spinner"]],
    ["@slimio/github", ["Minor", "Medium", "Github repositories downloader"]],
    ["@slimio/is", ["Minor", "Low", "Type checker"]],
    ["@slimio/lazy", ["Minor", "Low", "Setup lazy props on Objects"]],
    ["@slimio/Manifest", ["Minor", "Low", "Load & manage SlimIO Manifest"]],
    ["@slimio/metrics", ["Minor", "Low", "Create & manage addon's metrics"]],
    ["@slimio/npm-registry", ["Minor", "Low", "GET data from NPM registry"]],
    ["@slimio/pretty-json", ["Minor", "Low", "Stdout beautified JSON"]],
    ["@slimio/safe-emitter", ["Minor", "Medium", "Node.js Safe Emitter"]],
    ["@slimio/tcp-sdk", ["Minor", "Low", "SlimIO TCP-Sdk"]],
    ["@slimio/timer", ["Minor", "Low", "Driftless interval"]],
    ["@slimio/unzipper", ["Minor", "High", "Modern yauzl wrapper used to unzip .zip archive in extract() method."]],
    ["@slimio/units", ["Minor", "Low", "Bunch of units for metrics"]],
    ["@slimio/utils", ["Minor", "Low", "Bunch of useful functions"]],

    // eslint-disable-next-line max-len
    ["make-promise-safe", ["⚠️Major", "Low", "Force Node.js [DEP00018](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections)"]],
    ["dotenv", ["Minor", "Low", "Env file"]],

    ["polka", ["⚠️Major", "Low", "Native HTTP server"]],
    ["@polka/send-type", ["Minor", "Low", "HTTP response helper"]],

    ["lodash.get", ["Minor", "Low", "Get a value"]],
    ["lodash.set", ["Minor", "Low", "Set a value"]],
    ["lodash.clonedeep", ["Minor", "Low", "Clone deep Objects"]],

    ["repos", ["⚠️Major", "Low", "Get all GIT repositories"]],
    ["kleur", ["Minor", "Low", "TTY color"]],
    ["httpie", ["Minor", "Low", "	HTTP request"]],
    ["zen-observable", ["Minor", "Low", "Observable Implementation"]],
    ["body-parser", ["⚠️Major", "High", "Body Parser"]],
    ["semver", ["⚠️Major", "Low", "SemVer validation"]]
]);

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
