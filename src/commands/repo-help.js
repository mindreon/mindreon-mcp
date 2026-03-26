import process from "node:process";

export function printRepoHelp() {
    process.stdout.write(`
Usage: mindreon repo <command> [options]

Commands:
  status                        Show current workspace binding and git/dvc status
  pull                          Run git pull, refresh credentials, then dvc pull
  add [paths...] [--threshold N] [--count-threshold N]
                                If tracked file count exceeds N, DVC-add top-level untracked dirs first (default: 2000)
                                Otherwise auto-run dvc add for files >= N MiB, then git add (default: 5 MiB)
  commit -m <message>           Run git commit in the current workspace
  push                          Refresh credentials, run dvc push, then git push
  install [--check]             Install or verify git, git-lfs, and dvc[s3]
`);
}
