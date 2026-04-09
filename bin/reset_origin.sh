#!/bin/sh
set -u

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)"
HAS_ERRORS=0

echo "Resetting repositories under \"$ROOT\""
echo

reset_repo() {
    repo_path="$1"
    echo "===== $repo_path ====="

    if [ ! -d "$repo_path" ]; then
        echo "Failed to open repository."
        HAS_ERRORS=1
        echo
        return
    fi

    if ! git -C "$repo_path" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        echo "Not a git repository."
        HAS_ERRORS=1
        echo
        return
    fi

    if ! git -C "$repo_path" fetch origin; then
        HAS_ERRORS=1
    fi

    if ! git -C "$repo_path" reset --hard origin/main; then
        HAS_ERRORS=1
    fi

    echo
}

scan_repos() {
    scan_path="$1"

    for dir in "$scan_path"/*; do
        [ -d "$dir" ] || continue
        [ "$(basename "$dir")" = ".git" ] && continue

        if [ -e "$dir/.git" ]; then
            reset_repo "$dir"
        fi

        scan_repos "$dir"
    done
}

reset_repo "$ROOT"
scan_repos "$ROOT"

echo
if [ "$HAS_ERRORS" -eq 1 ]; then
    echo "Completed with one or more errors."
else
    echo "Done."
fi
