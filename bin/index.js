#!/usr/bin/env node
// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join } = require("path");

require("dotenv").config({ path: join(__dirname, "..", ".env") });

// Require Third-party Dependencies
const Registry = require("@slimio/npm-registry");
const { parseArg, argDefinition } = require("@slimio/arg-parser");
const prettyJSON = require("@slimio/pretty-json");
const clipboardy = require("clipboardy");

// CONSTANTS
const PREFIX_VERSION = new Set(["^", "~", "*", ">"]);

/* eslint-disable max-len */
const KNOW_DEPS = new Map([
    // [Key, [Homepage, Refactoring, Severity Risk, Usage]]
    ["@slimio/addon", ["https://github.com/SlimIO/Addon", "Minor", "Low", "Addon container"]],
    ["@slimio/addon-factory", ["https://github.com/SlimIO/Addon-Factory", "Minor", "Low", "Addon generator"]],
    ["@slimio/alert", ["https://github.com/SlimIO/Alert", "Minor", "Low", "Create & manage addon's alerts"]],
    ["@slimio/arg-parser", ["https://github.com/SlimIO/Arg-parser", "Minor", "Low", "Script argument parser"]],
    ["@slimio/async-cli-spinner", ["https://github.com/SlimIO/Async-cli-spinner", "Minor", "Low", "Multi async cli spinner"]],
    ["@slimio/github", ["https://github.com/SlimIO/github", "Minor", "Medium", "Github repositories downloader"]],
    ["@slimio/is", ["https://github.com/SlimIO/is", "Minor", "Low", "Type checker"]],
    ["@slimio/lazy", ["https://github.com/SlimIO/Lazy", "Minor", "Low", "Setup lazy props on Objects"]],
    ["@slimio/Manifest", ["https://github.com/SlimIO/Manifest", "Minor", "Low", "Load & manage SlimIO Manifest"]],
    ["@slimio/metrics", ["https://github.com/SlimIO/Metrics", "Minor", "Low", "Create & manage addon's metrics"]],
    ["@slimio/npm-registry", ["https://github.com/SlimIO/Npm-registry", "Minor", "Low", "GET data from NPM registry"]],
    ["@slimio/pretty-json", ["https://github.com/SlimIO/Pretty-JSON", "Minor", "Low", "Stdout beautified JSON"]],
    ["@slimio/safe-emitter", ["https://github.com/SlimIO/Safe-emitter", "Minor", "Medium", "Node.js Safe Emitter"]],
    ["@slimio/tcp-sdk", ["https://github.com/SlimIO/Tcp-Sdk", "Minor", "Low", "SlimIO TCP-Sdk"]],
    ["@slimio/timer", ["https://github.com/SlimIO/Timer", "Minor", "Low", "Driftless interval"]],
    ["@slimio/unzipper", ["https://github.com/SlimIO/unzipper", "Minor", "High", "Modern yauzl wrapper used to unzip .zip archive in extract() method."]],
    ["@slimio/units", ["https://github.com/SlimIO/Units", "Minor", "Low", "Bunch of units for metrics"]],
    ["@slimio/utils", ["https://github.com/SlimIO/Utils", "Minor", "Low", "Bunch of useful functions"]],

    ["make-promise-safe", ["https://github.com/mcollina/make-promises-safe", "⚠️Major", "Low", "Force Node.js [DEP00018](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections)"]],
    ["dotenv", ["https://github.com/motdotla/dotenv", "Minor", "Low", "Env file"]],

    ["polka", ["https://github.com/lukeed/polka", "⚠️Major", "Low", "Native HTTP server"]],
    ["@polka/send-type", ["https://github.com/lukeed/polka", "Minor", "Low", "HTTP response helper"]],

    ["lodash.get", ["https://github.com/lodash/lodash", "Minor", "Low", "Get a value"]],
    ["lodash.set", ["https://github.com/lodash/lodash", "Minor", "Low", "Set a value"]],
    ["lodash.clonedeep", ["https://github.com/lodash/lodash", "Minor", "Low", "Clone deep Objects"]],

    ["repos", ["https://github.com/jonschlinkert/repos", "⚠️Major", "Low", "Get all GIT repositories"]],
    ["kleur", ["https://github.com/lukeed/kleur", "Minor", "Low", "TTY color"]],
    ["httpie", ["https://github.com/jakubroztocil/httpie", "Minor", "Low", "	HTTP request"]],
    ["zen-observable", ["https://github.com/zenparsing/zen-observable", "Minor", "Low", "Observable Implementation"]],
    ["body-parser", ["https://github.com/expressjs/body-parser", "⚠️Major", "High", "Body Parser"]],
    ["semver", ["https://github.com/npm/node-semver", "⚠️Major", "Low", "SemVer validation"]]
]);
/* eslint-enable max-len */

const argv = parseArg([
    argDefinition("-c --clipboard", "Copy directly to clipboard"),
    argDefinition("-d --dependency [array=[]]", "Give line of specific dependencies")
]);

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
