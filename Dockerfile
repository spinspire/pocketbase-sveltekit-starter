FROM golang:1.26-alpine AS builder
WORKDIR /build
COPY pb/go.mod pb/go.sum pb/main.go ./
COPY pb/hooks ./hooks
COPY pb/auditlog ./auditlog
COPY pb/webauthn ./webauthn
RUN apk --no-cache add upx make git gcc libtool musl-dev ca-certificates dumb-init \
  && go mod tidy \
  && CGO_ENABLED=0 go build \
  && upx pocketbase

FROM oven/bun:1-alpine
RUN apk --no-cache add curl wget unzip
WORKDIR /app/pb
COPY --from=builder /build/pocketbase /app/pb/pocketbase
COPY pb/pb_hooks ./pb_hooks
COPY pb/pb_migrations ./pb_migrations
COPY pb/data ./data
# Mountable paths (declare in docker-compose.yml or docker run -v):
#   /app/pb/pb_data      - PocketBase data directory
#   /app/pb/pb_public    - Public files
#   /app/pb/pb_migrations - Migrations
#   /app/pb/pb_hooks     - JS hooks
#   /app/pb/data         - Additional data
CMD ["/app/pb/pocketbase","serve", "--automigrate=false", "--http", "0.0.0.0:8090"]
