@echo off
setlocal enabledelayedexpansion

REM This entrypoint script checks that all required setup is done.
REM If not done, does it.
REM And then proceeds to execute the main "command" for this container.

cd /d "%~dp0"

REM Set default values if environment variables are not defined
if not defined RELEASE set "RELEASE=standard"
if not defined PB_VERSION set "PB_VERSION=0.27.2"
if not defined PB_ARCH set "PB_ARCH=windows_amd64"

REM Get command arguments
set "CMD=%*"

if /i "%RELEASE%"=="standard" (
    if "%CMD%"=="" set "CMD=.\pocketbase.exe serve --dev --http 0.0.0.0:8090 --publicDir ..\sk\build"
    
    if not exist "pocketbase.exe" (
        echo Fetching Pocketbase version: %PB_VERSION%, architecture: %PB_ARCH%
        set "url=https://github.com/pocketbase/pocketbase/releases/download/v%PB_VERSION%/pocketbase_%PB_VERSION%_%PB_ARCH%.zip"
        
        powershell -Command "Invoke-WebRequest -Uri '!url!' -OutFile '%TEMP%\pb.zip'"
        if errorlevel 1 (
            echo Failed to download Pocketbase
            exit /b 1
        )
        
        powershell -Command "Expand-Archive -Path '%TEMP%\pb.zip' -DestinationPath . -Force"
        if errorlevel 1 (
            echo Failed to extract Pocketbase
            exit /b 1
        )
    )
)

echo CMD is: %CMD%

if /i "%RELEASE%"=="custom" (
    where go >nul 2>nul
    if not errorlevel 1 (
        if exist "main.go" (
            if "%CMD%"=="" (
                for /f "tokens=*" %%g in ('go env GOPATH') do set "GOPATH=%%g"
                set "MODD_PATH=!GOPATH!\bin\modd.exe"
                echo No command provided, using default: !GOPATH!\bin\modd.exe
                set "CMD=!MODD_PATH!"
            )

            echo New CMD is: %CMD%
            
            echo Running go mod tidy...
            go mod tidy
            if errorlevel 1 (
                echo Failed to run go mod tidy
                exit /b 1
            )
            
            echo Building project...
            go build
            if errorlevel 1 (
                echo Failed to build project
                exit /b 1
            )
            
            where modd >nul 2>nul
            if errorlevel 1 (
                echo Installing modd...
                go install github.com/cortesi/modd/cmd/modd@latest
                if errorlevel 1 (
                    echo Failed to install modd
                    exit /b 1
                )
                echo modd installed successfully
            )
        )
    )
)

REM Execute the command
echo Executing: %CMD%
%CMD%
if errorlevel 1 (
    echo Command failed with error code %errorlevel%
    exit /b %errorlevel%
)