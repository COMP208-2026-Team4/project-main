@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo  C208 Project Setup
echo ============================================
echo.

REM Check prerequisites
call :check_prerequisites
if %ERRORLEVEL% neq 0 exit /b 1

REM Setup environment files
call :setup_env_files

REM Install dependencies
call :install_dependencies
if %ERRORLEVEL% neq 0 exit /b 1

REM Run database migrations
call :run_migrations
if %ERRORLEVEL% neq 0 exit /b 1

REM Setup git submodules
call :setup_submodules

echo.
echo ============================================
echo  Setup complete!
echo ============================================
echo.
echo To start the project, run one of:
echo   docker-compose up -d    (Docker mode)
echo   npm run dev             (Local PM2 mode)
echo.
echo Services will be available at:
echo   Frontend:     http://localhost:5173
echo   REST API:     http://localhost:3000
echo   Users API:    http://localhost:6024
echo   Sessions API: http://localhost:6023
echo   Git Agent:    http://localhost:6025
echo   Docs:         http://localhost:6054
echo.

pause
exit /b 0

:check_prerequisites
echo [1/5] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+.
    exit /b 1
)
echo   - Node.js: OK

REM Check npm
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed.
    exit /b 1
)
echo   - npm: OK

REM Check Docker
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Docker not found. Docker mode will not be available.
) else (
    echo   - Docker: OK
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    docker compose version >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] Docker Compose not found. Docker mode will not be available.
    ) else (
        echo   - Docker Compose (plugin): OK
    )
) else (
    echo   - Docker Compose: OK
)

REM Check Rust/Cargo for git-agent
cargo --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Cargo not found. Git-agent will not be available in local mode.
    echo           Install Rust from https://rustup.rs/
) else (
    echo   - Cargo: OK
)

echo.
exit /b 0

:setup_env_files
echo [2/5] Setting up environment files...

if not exist "rest-api\.env" (
    copy "rest-api\.env.example" "rest-api\.env" >nul
    echo   - Created rest-api\.env
) else (
    echo   - rest-api\.env already exists
)

if not exist "sessions-api\.env" (
    copy "sessions-api\.env.example" "sessions-api\.env" >nul
    echo   - Created sessions-api\.env
) else (
    echo   - sessions-api\.env already exists
)

if not exist "users-api\.env" (
    copy "users-api\.env.example" "users-api\.env" >nul
    echo   - Created users-api\.env
    echo   [WARNING] Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in users-api\.env
) else (
    echo   - users-api\.env already exists
)

if not exist "git-agent\.env" (
    copy "git-agent\.env.example" "git-agent\.env" >nul
    echo   - Created git-agent\.env
) else (
    echo   - git-agent\.env already exists
)

if not exist "frontend\.env" (
    copy "frontend\.env" "frontend\.env" >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo VITE_API_URL="http://localhost:3000" > "frontend\.env"
        echo   - Created frontend\.env
    )
) else (
    echo   - frontend\.env already exists
)

echo.
exit /b 0

:install_dependencies
echo [3/5] Installing npm dependencies...
npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo   - Root dependencies installed

REM Verify workspace installations
echo   - Workspaces configured: docs, frontend, rest-api, sessions-api, users-api
echo.
exit /b 0

:run_migrations
echo [4/5] Setting up database and running migrations...

REM Start MariaDB container first for migrations
docker-compose up -d mariadb >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Could not start MariaDB container. Skipping migrations.
    echo           Run 'docker-compose up -d mariadb' manually, then:
    echo           cd users-api ^&^& npx prisma migrate dev
    echo           cd sessions-api ^&^& npx prisma migrate dev
    exit /b 0
)

echo   - Waiting for MariaDB to be healthy...
:wait_for_mariadb
docker-compose exec -T mariadb mysqladmin ping -h localhost -u root -ppassword >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 /nobreak >nul
    goto :wait_for_mariadb
)
timeout /t 2 /nobreak >nul

echo   - MariaDB is ready

REM Users API migrations
echo   - Running users-api migrations...
cd "users-api"
call npx prisma migrate dev --name init >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo     [INFO] Migration may have already been applied or requires manual review
) else (
    echo     Migrations applied successfully
)
cd ".."

REM Sessions API migrations
echo   - Running sessions-api migrations...
cd "sessions-api"
call npx prisma migrate dev --name init >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo     [INFO] Migration may have already been applied or requires manual review
) else (
    echo     Migrations applied successfully
)
cd ".."

echo   - Stopping MariaDB container (use 'docker-compose up -d' to start all services)
docker-compose stop mariadb >nul 2>&1

echo.
exit /b 0

:setup_submodules
echo [5/5] Setting up git submodules...

git submodule update --init --recursive >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   - Git submodules initialized
) else (
    echo   - No submodules to initialize or already initialized
)

echo.
exit /b 0
