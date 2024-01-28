FROM golang:1.21.6-alpine AS builder
WORKDIR /build
COPY pb/go.mod pb/go.sum pb/main.go ./
COPY pb/hooks ./hooks
RUN apk --no-cache add upx make git gcc libtool musl-dev ca-certificates dumb-init \
  && go mod tidy \
  && CGO_ENABLED=0 go build \
  && upx pocketbase

FROM alpine
WORKDIR /app/pb
COPY --from=builder /build/pocketbase /app/pb/pocketbase
COPY pb/pb_migrations ./pb_migrations
COPY ./sk/build /app/pb/pb_public
CMD ["/app/pb/pocketbase","serve", "--http", "0.0.0.0:8090"]