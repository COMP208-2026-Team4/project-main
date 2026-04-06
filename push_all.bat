@echo off

set repos=.^ docs frontend git-agent sessions-api users-api

for %%r in (%repos%) do (
    echo =========================
    echo Pushing %%r...
    echo =========================

    cd %%r

    git add .

    git commit -m "update" 2>nul

    git push

    cd ..
)

echo.
echo Done pushing all repositories.
pause