@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0.."
for %%D in ("%ROOT%") do set "ROOT=%%~fD"
set "COMMIT_MESSAGE=%~1"
if not defined COMMIT_MESSAGE set "COMMIT_MESSAGE=update"
set "HAS_ERRORS=0"

echo Pushing repositories under "%ROOT%"
echo.

call :PushRepo "%ROOT%"

for /d %%D in ("%ROOT%\*") do (
    if exist "%%~fD\.git" call :PushRepo "%%~fD"
)

echo.
if "%HAS_ERRORS%"=="1" (
    echo Completed with one or more errors.
) else (
    echo Done.
)
pause
exit /b

:PushRepo
set "REPO_PATH=%~1"
echo ===== %REPO_PATH% =====
pushd "%REPO_PATH%" >nul || (
    echo Failed to open repository.
    set "HAS_ERRORS=1"
    echo.
    exit /b
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo Not a git repository.
    set "HAS_ERRORS=1"
    popd >nul
    echo.
    exit /b
)

git add -A
git diff --cached --quiet >nul 2>&1
if errorlevel 1 git commit -m "%COMMIT_MESSAGE%" >nul 2>&1

git push
if errorlevel 1 set "HAS_ERRORS=1"

popd >nul
echo.
exit /b
