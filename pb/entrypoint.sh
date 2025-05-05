#!/bin/sh
set -e # exit on any non-zero status (error)

# this entrypoint script checks that all required setup is done.
# If not done, does it.
# And then proceeds to execute the main "command" for this container.
DIR=$(dirname $0)
cd $DIR
RELEASE=${RELEASE:-"standard"}
PB_VERSION=${PB_VERSION:-"0.27.2"}
PB_ARCH=${PB_ARCH:-"linux_amd64"}
CMD=$@

if [ "$RELEASE" = "standard" ]; then
  CMD=${CMD:-"./pocketbase serve --dev --http 0.0.0.0:8090 --publicDir ../sk/build"}
  if [ ! -x "pocketbase" ] || [ "`./pocketbase --version`" != "pocketbase version $PB_VERSION" ]; then
    echo "Fetching Pocketbase version: $PB_VERSION, architecture: $PB_ARCH"

    url="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip"
    wget -q "$url" -O /tmp/pb.zip
    unzip -o /tmp/pb.zip pocketbase
  fi
fi
if [ "$RELEASE" = "custom" ]; then
  # check for go and main.go, and use if present
  if [ -x "$(which go)" ] && [ -f "./main.go" ]; then
    CMD=${CMD:-"modd"}
    go mod tidy
    go build

    if [ ! -x "$(which modd)" ]; then
      echo "go install modd"
      go install github.com/cortesi/modd/cmd/modd@latest
      echo "modd installed"
    fi
  fi
fi

exec $CMD