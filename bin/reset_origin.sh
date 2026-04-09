#!/bin/bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
HAS_ERRORS=0

echo "Resetting repositories under \"$ROOT\""
echo

reset_repo() {
    local repo_path="$1"
    echo "===== $repo_path ====="

    if ! pushd "$repo_path" >/dev/null; then
        echo "Failed to open repository."
        HAS_ERRORS=1
        echo
        return
    fi

    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        echo "Not a git repository."
        HAS_ERRORS=1
        popd >/dev/null
        echo
        return
    fi

    if ! git fetch origin; then
        HAS_ERRORS=1
    fi

    if ! git reset --hard origin/main; then
        HAS_ERRORS=1
    fi

    popd >/dev/null
    echo
}

scan_repos() {
    local scan_path="$1"
    local dir

    for dir in "$scan_path"/*; do
        [[ -d "$dir" ]] || continue
        [[ "$(basename "$dir")" == ".git" ]] && continue

        if [[ -e "$dir/.git" ]]; then
            reset_repo "$dir"
        fi

        scan_repos "$dir"
    done
}

reset_repo "$ROOT"
scan_repos "$ROOT"

echo
if [[ "$HAS_ERRORS" -eq 1 ]]; then
    echo "Completed with one or more errors."
else
    echo "Done."
fi
