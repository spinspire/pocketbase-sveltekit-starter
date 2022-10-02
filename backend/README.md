# Backend with PocketBase

There are two flavors of the backend:

1. standard release ([downloaded](https://ms-cp.office2.spinspire.com))
2. custom compiled (`go build`), possibly with your customizations

## standard release

Download from release archive from https://github.com/pocketbase/pocketbase/releases/latest, unzip it and place the `pocketbase`
binary in this folder.

## custom build

If you would like to extend PocketBase and use it as a framework
then there is a `main.go` in this folder that you can customize
and build using `go build`

See https://pocketbase.io/docs/use-as-framework/ for details.

# Running the backend

You can run the PocketBase backend direct with `./pocketbase serve`
or using `npm run backend` in the `app` directory. Note that if you
want the backend to also serve the frontend assets, then you must
add the `--publicDir ../frontend/build` option.

## Docker

Another option is to run it inside a Docker container. A `Dockerfile`
is included that builds the binary from your `main.go` sources and
builds a minimial container with nothing other than that statically
compiled binary. You can use it with your own `docker-compose.yml`
file.

## Active development with `air`

Finally, if you are going to actively develop using Go using PocketBase
as a framework, then you probably want to use [air](https://github.com/cosmtrek/air), a development tool that rebuilds and restarts your Go binary
everytime a source file changes (live reload on change). An basic
`air.toml` config file is included in this setup. You can run it
by installing `air` (`go install github.com/cosmtrek/air@latest`)
and then running `air serve`

# Sample Schema

Once the PocketBase server is running, login as admin and then
import the `pb_schema.json` schema file by visiting
`/_/#/settings/import-collections` to get a "posts" collection
that the frontend app uses.
