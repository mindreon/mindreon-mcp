import process from "node:process";
import readline from "node:readline";
import { parseArgs } from "../cli/args.js";
import { saveConfig, loadConfig } from "../cli/config.js";
import { request, resolveBaseUrl } from "../api/client.js";
import { getServicePrefix } from "../utils/routes.js";

export async function runLogin({ argv }) {
    const args = parseArgs(argv);
    const config = await loadConfig();
    const configuredUrl = config.url || "";

    let username = args.username || args.u;
    let password = args.password || args.p;
    // IAM API URL or custom setup
    let url = args.url || configuredUrl;

    if ((!username || !password) && !process.stdin.isTTY) {
        throw new Error("Missing required arguments. Usage: mindreon login --username <user> --password <pass>");
    }

    if (process.stdin.isTTY) {
        if (!url) {
            url = await prompt("API URL", "https://dev-4-13.mindreon.com");
        }
        if (!username) {
            username = await prompt("Username");
        }
        if (!password) {
            password = await promptSecret("Password");
        }
    }

    if (!username || !password) {
        throw new Error("Username and password are required.");
    }

    // Save custom URL if provided, so subsequent commands use it
    if (url) {
        console.log(`Setting API URL to: ${url}`);
        await saveConfig({ url });
        // Update env for current process so request uses it
        process.env.MINDREON_API_URL = url;
    } else if (config.url) {
        process.env.MINDREON_API_URL = config.url;
    }

    console.log(`Logging in as ${username}...`);

    const baseUrl = resolveBaseUrl(await loadConfig());
    const iamPrefix = getServicePrefix("iam", baseUrl);
    const response = await request(`${iamPrefix}/api/v1/auth/login`, {
        method: "POST",
        skipAuth: true,
        body: {
            username,
            password,
        },
    });

    if (response && response.data && response.data.accessToken) {
        const token = response.data.accessToken;
        await saveConfig({ token, username, gitAccessToken: "" });
        console.log(`Successfully logged in as ${username}. Token saved to config.`);
    } else {
        throw new Error("Invalid response format from login API");
    }
}

function prompt(label, defaultValue = "") {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const suffix = defaultValue ? ` [${defaultValue}]` : "";
    return new Promise((resolve) => {
        rl.question(`${label}${suffix}: `, (answer) => {
            rl.close();
            const value = String(answer || "").trim();
            resolve(value || defaultValue);
        });
    });
}

function promptSecret(label) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        let value = "";
        const wasRaw = Boolean(stdin.isRaw);

        readline.emitKeypressEvents(stdin);
        stdout.write(`${label}: `);

        if (typeof stdin.setRawMode === "function") {
            stdin.setRawMode(true);
        }
        stdin.resume();

        const cleanup = () => {
            stdin.removeListener("keypress", onKeypress);
            if (typeof stdin.setRawMode === "function") {
                stdin.setRawMode(wasRaw);
            }
            stdin.pause();
            stdout.write("\n");
        };

        const onKeypress = (str, key = {}) => {
            if (key.name === "return" || key.name === "enter") {
                cleanup();
                resolve(value.trim());
                return;
            }
            if (key.name === "backspace") {
                value = value.slice(0, -1);
                return;
            }
            if (key.ctrl && key.name === "c") {
                cleanup();
                process.exit(130);
            }
            if (typeof str === "string" && str) {
                value += str;
            }
        };

        stdin.on("keypress", onKeypress);
    });
}
