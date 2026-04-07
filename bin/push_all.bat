@echo off

set repos=. docs frontend git-agent rest-api sessions-api users-api

for %%r in (%repos%) do (
    echo =========================
    echo Pushing %%r...
    echo =========================

    pushd %%r

    git add .

    git commit -m "update" 2>nul

    git push

    popd
)

echo.
echo Done pushing all repositories.
pause
