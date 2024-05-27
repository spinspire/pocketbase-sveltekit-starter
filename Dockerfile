FROM golang:1.22-alpine AS builder
WORKDIR /build
COPY pb/go.mod pb/go.sum pb/main.go ./
COPY pb/hooks ./hooks
COPY pb/auditlog ./auditlog
RUN apk --no-cache add upx make git gcc libtool musl-dev ca-certificates dumb-init \
  && go mod tidy \
  && CGO_ENABLED=0 go build \
  && upx pocketbase

FROM alpine
WORKDIR /app/pb
COPY --from=builder /build/pocketbase /app/pb/pocketbase
# COPY pb/pb_data ./pb_data #not needed
COPY pb/pb_hooks ./pb_hooks
COPY sk/build ./pb_public
COPY pb/pb_migrations ./pb_migrations
COPY pb/data ./data
# these are the volumes you could mount to your own dirs
VOLUME pb_data pb_public pb_migrations pb_hooks data
CMD ["/app/pb/pocketbase","serve", "--http", "0.0.0.0:8090"]