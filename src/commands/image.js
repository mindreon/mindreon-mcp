import { parseArgs } from "../cli/args.js";
import { commandExists, runCommand } from "../utils/shell.js";

function parseBooleanOption(value, defaultValue) {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    if (typeof value === "boolean") {
        return value;
    }

    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalized)) {
        return true;
    }
    if (["0", "false", "no", "n", "off"].includes(normalized)) {
        return false;
    }

    throw new Error(`Invalid boolean value: ${value}`);
}

function normalizeImageRef(ref, label) {
    const value = String(ref || "").trim();
    if (!value) {
        throw new Error(`${label} image is required.`);
    }
    return value.startsWith("docker://") ? value : `docker://${value}`;
}

function formatCommand(args) {
    return args
        .map((arg) => (/\s/.test(arg) ? JSON.stringify(arg) : arg))
        .join(" ");
}

export async function runImage({ argv }) {
    const args = parseArgs(argv);
    const subCommand = args._[0] || "";
    const implicitPush = subCommand && subCommand !== "push";

    const src = args.from || args.src || (implicitPush ? args._[0] : args._[1]) || "";
    const dst = args.to || args.dst || (implicitPush ? args._[1] : args._[2]) || "";

    if (!src || !dst) {
        throw new Error("Usage: mindreon image <src> <dst>");
    }

    const skopeoArgs = [
        "copy",
        "--all",
        `--src-tls-verify=${parseBooleanOption(args["src-tls-verify"], false)}`,
        `--dest-tls-verify=${parseBooleanOption(args["dest-tls-verify"], false)}`,
        normalizeImageRef(src, "Source"),
        normalizeImageRef(dst, "Destination"),
    ];

    if (args["dry-run"]) {
        console.log(`skopeo ${formatCommand(skopeoArgs)}`);
        return;
    }

    if (!commandExists("skopeo")) {
        throw new Error("skopeo is required for image push. Please install skopeo first.");
    }

    console.log(`Pushing image from ${src} to ${dst}...`);
    runCommand("skopeo", skopeoArgs);
    console.log(`Image push completed: ${dst}`);
}
