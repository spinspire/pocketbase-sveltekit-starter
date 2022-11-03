FROM golang:1.19-alpine AS builder
WORKDIR /build
COPY go.mod go.sum main.go ./
COPY hooks ./hooks
COPY migrations ./migrations
# RUN apk --no-cache upx build-base
RUN apk --no-cache add upx make git gcc libtool musl-dev ca-certificates dumb-init \
  && go mod tidy \
  && CGO_ENABLED=0 go build \
  && upx pocketbase

FROM scratch
WORKDIR /
COPY --from=builder /build/pocketbase /pocketbase
CMD ["/pocketbase","serve"]