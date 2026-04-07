@echo off

set repos=. docs frontend git-agent rest-api sessions-api users-api

for %%r in (%repos%) do (
    echo =========================
    echo Pushing %%r...
    echo =========================

    pushd %%r

    git fetch
    git reset --hard origin/main

    popd
)

echo.
echo Done pushing all repositories.
pause
