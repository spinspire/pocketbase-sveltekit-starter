#!/bin/sh
set -e # exit on any non-zero status (error)

# this entrypoint script checks that all required setup is done
# if not done, does it
# and then proceeds to execute the main "command" for this container

# build if needed
go mod tidy
go build

if [ ! -x "$(which modd)" ]; then
  echo "go install modd"
  go install github.com/cortesi/modd/cmd/modd@latest
fi

exec "$@"