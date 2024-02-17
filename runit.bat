@echo off
setlocal

REM Navigate to the PocketBase directory and build the project
cd pb
call go build
start cmd /k "pocketbase serve"

REM Navigate to the SvelteKit directory and start the dev server
cd ../sk
start cmd /k "pnpm run dev"

endlocal
