#!/usr/bin/env node
import process from "node:process";
import { extractCommand, hasHelpFlag } from "./cli/args.js";
import {
    printDatasetHelp,
    printInstallHelp,
    printLoginHelp,
    printModelHelp,
    printReleaseHelp,
    printRootHelp,
    printWorkloadHelp,
} from "./cli/help.js";
import { runLogin } from "./commands/login.js";
import { runInstall } from "./commands/install.js";
import { runDataset } from "./commands/dataset.js";
import { runModel } from "./commands/model.js";
import { runRepo } from "./commands/repo.js";
import { printRepoHelp } from "./commands/repo-help.js";
import { runWorkload } from "./commands/workload.js";
import { runRelease } from "./commands/release.js";

const argv = process.argv.slice(2);

if (argv.length === 0 || (argv.length === 1 && hasHelpFlag(argv))) {
    printRootHelp();
    process.exit(0);
}

const { command, argv: argvWithoutCommand } = extractCommand(argv);

function exitWithError(error) {
    const message = error?.message || String(error);
    process.stderr.write(`${message}\n`);
    process.exit(error?.exitCode || 1);
}

function printCommandHelp(command) {
    if (command === "login") return printLoginHelp();
    if (command === "install") return printInstallHelp();
    if (command === "dataset") return printDatasetHelp();
    if (command === "model") return printModelHelp();
    if (command === "repo") return printRepoHelp();
    if (command === "workload") return printWorkloadHelp();
    if (command === "release") return printReleaseHelp();
    return printRootHelp();
}

try {
    if (!command) {
        printRootHelp();
        process.exit(0);
    }

    if (command === "login") {
        if (hasHelpFlag(argvWithoutCommand)) {
            printLoginHelp();
            process.exit(0);
        }
        await runLogin({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "install") {
        if (hasHelpFlag(argvWithoutCommand)) {
            printInstallHelp();
            process.exit(0);
        }
        await runInstall({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "dataset") {
        if (argvWithoutCommand.length === 0 || hasHelpFlag(argvWithoutCommand)) {
            printDatasetHelp();
            process.exit(0);
        }
        await runDataset({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "model") {
        if (argvWithoutCommand.length === 0 || hasHelpFlag(argvWithoutCommand)) {
            printModelHelp();
            process.exit(0);
        }
        await runModel({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "workload") {
        if (argvWithoutCommand.length === 0 || hasHelpFlag(argvWithoutCommand)) {
            printWorkloadHelp();
            process.exit(0);
        }
        await runWorkload({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "repo") {
        if (argvWithoutCommand.length === 0 || hasHelpFlag(argvWithoutCommand)) {
            printRepoHelp();
            process.exit(0);
        }
        await runRepo({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "release") {
        if (hasHelpFlag(argvWithoutCommand)) {
            printReleaseHelp();
            process.exit(0);
        }
        await runRelease({ argv: argvWithoutCommand, env: process.env });
        process.exit(0);
    }

    if (command === "help") {
        printCommandHelp(argvWithoutCommand[0]);
        process.exit(0);
    }

    throw new Error(`Unknown subcommand: ${command}`);
} catch (error) {
    exitWithError(error);
}
