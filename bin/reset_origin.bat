@echo off
setlocal EnableExtensions

set "ROOT=%~dp0.."
for %%D in ("%ROOT%") do set "ROOT=%%~fD"
set "HAS_ERRORS=0"

echo Resetting repositories under "%ROOT%"
echo.

call :ResetRepo "%ROOT%"
call :ScanRepos "%ROOT%"

echo.
if "%HAS_ERRORS%"=="1" (
    echo Completed with one or more errors.
) else (
    echo Done.
)
pause
exit /b

:ScanRepos
set "SCAN_PATH=%~1"
for /d %%D in ("%SCAN_PATH%\*") do (
    if /I not "%%~nxD"==".git" (
        if exist "%%~fD\.git" call :ResetRepo "%%~fD"
        call :ScanRepos "%%~fD"
    )
)
exit /b

:ResetRepo
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

git fetch origin
if errorlevel 1 set "HAS_ERRORS=1"

git reset --hard origin/main
if errorlevel 1 set "HAS_ERRORS=1"

popd >nul
echo.
exit /b
