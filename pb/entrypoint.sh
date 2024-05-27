#!/bin/sh
set -e # exit on any non-zero status (error)

# this entrypoint script checks that all required setup is done.
# If not done, does it.
# And then proceeds to execute the main "command" for this container.
DIR=$(dirname $0)
cd $DIR
VERSION="0.22.12"
ARCH="linux_amd64"

# check for go and main.go, and use if present
if [ -x "$(which go)" ] && [ -f "$DIR/main.go" ]; then
  go mod tidy
  go build

  if [ ! -x "$(which modd)" ]; then
    echo "go install modd"
    go install github.com/cortesi/modd/cmd/modd@latest
  fi
else
  if [ ! -x "./pocketbase" ]; then
    DLURL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_${ARCH}.zip"
    wget -q ${DLURL} -O pb.zip && unzip -q -o pb.zip pocketbase
  fi
fi

exec "$@"