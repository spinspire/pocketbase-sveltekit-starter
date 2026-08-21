#!/bin/sh
set -e # exit on any non-zero status (error)

# this entrypoint script checks that all required setup is done.
# If not done, does it.
# And then proceeds to execute the main "command" for this container.
DIR=$(dirname $0)
cd $DIR
RELEASE=${RELEASE:-"standard"}
PB_VERSION=${PB_VERSION:-"0.38.0"}
PB_ARCH=${PB_ARCH:-"linux_amd64"}
CMD=$@

if [ "$RELEASE" = "standard" ]; then
  CMD=${CMD:-"./pocketbase serve --automigrate=false --dev --http 0.0.0.0:8090 --publicDir ../sk/build"}
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
  else
    echo "Either go or main.go is not present, cannot perform custom build"
  fi
fi

# Upsert superuser if credentials are provided
if [ -n "$PB_SUPERUSER_EMAIL" ] && [ -n "$PB_SUPERUSER_PASSWORD" ]; then
  echo "Upserting superuser: $PB_SUPERUSER_EMAIL"
  ./pocketbase superuser upsert "$PB_SUPERUSER_EMAIL" "$PB_SUPERUSER_PASSWORD"
fi

# Create user if credentials are provided
if [ -n "$PB_USER_EMAIL" ] && [ -n "$PB_USER_PASSWORD" ]; then
  echo "Creating user: $PB_USER_EMAIL"
  # Start server in background to use admin API
  ./pocketbase serve --automigrate=false --dev --http 0.0.0.0:8090 --publicDir ../sk/build &
  PB_PID=$!

  # Wait for server to be ready
  echo "Waiting for PocketBase to be ready..."
  until curl -sf http://127.0.0.1:8090/api/health >/dev/null 2>&1; do
    sleep 1
  done

  # Authenticate as superuser and create user
  if [ -n "$PB_SUPERUSER_EMAIL" ] && [ -n "$PB_SUPERUSER_PASSWORD" ]; then
    TOKEN=$(curl -s -X POST "http://127.0.0.1:8090/api/collections/_superusers/auth-with-password" \
      -H "Content-Type: application/json" \
      -d "{\"identity\":\"$PB_SUPERUSER_EMAIL\",\"password\":\"$PB_SUPERUSER_PASSWORD\"}" \
      | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || true)

    if [ -n "$TOKEN" ]; then
      RESULT=$(curl -s -X POST "http://127.0.0.1:8090/api/collections/users/records" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"email\":\"$PB_USER_EMAIL\",\"password\":\"$PB_USER_PASSWORD\",\"passwordConfirm\":\"$PB_USER_PASSWORD\"}" || true)
      echo "User create result: $RESULT"
    else
      echo "Failed to authenticate as superuser, skipping user creation"
    fi
  fi

  # Stop background server; exec will start the real one
  kill $PB_PID 2>/dev/null || true
  wait $PB_PID 2>/dev/null || true
fi

# Start SvelteKit dev server in dev mode
if [ "$DEV" = "true" ]; then
  echo "Starting SvelteKit dev server..."
  cd /app/sk && bun install && bunx svelte-kit sync && bun run dev -- --host 0.0.0.0 &
  SK_PID=$!
  echo "Waiting for SvelteKit dev server..."
  until curl -sf http://127.0.0.1:5173 >/dev/null 2>&1; do
    sleep 1
  done
  echo "SvelteKit dev server ready on http://localhost:5173"
fi

exec $CMD
