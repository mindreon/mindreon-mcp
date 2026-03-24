import process from "node:process";

export function printRootHelp() {
  process.stdout.write(`
Mindreon MCP CLI
A command-line interface for Mindreon AI platform workflows.

Usage:
  mindreon <command> [options]

Commands:
  login         Authenticate with Mindreon IAM service
  install       Install or verify git, git-lfs, and dvc[s3]
  dataset       Dataset and dataset version management
  model         Model and model version management
  repo          Local Git/DVC workspace operations
  workload      Create and manage training, dev, or inference workloads
  release       Maintainer command for CLI versioning and npm release
  help          Show this help message

Options:
  -h, --help    Show help message

Example:
  mindreon login
  mindreon login --username admin --password secret
  mindreon model connect --name example-model --version v1
  mindreon repo add
  mindreon repo add --threshold 5
`);
}

export function printReleaseHelp() {
  process.stdout.write(`
Usage: mindreon release [patch|minor|major] [options]

Options:
  --yes                  Skip confirmation prompts
  --dry-run              Print commands without executing them
  --skip-push            Do not push tags and commits to remote
  --skip-github-release  Do not create a GitHub release
  --skip-publish         Do not publish to npm
  -h, --help             Show this help message
`);
}
