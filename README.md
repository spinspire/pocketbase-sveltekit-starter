# PocketBase / SvelteKit Starter App

Use this app as a starting point for your own _customized_
[PocketBase](https://github.com/pocketbase/pocketbase) backend
with [SvelteKit](https://kit.svelte.dev) frontend.
This is a high-performance frontend+backend combination, since frontend
is static and backend is a single compiled Golang binary (JAMstack baby!).

- SvelteKit frontend is fully static, client-side only, so that here is no need
  for NodeJS at runtime. It is generated using
  [`adapter-static`](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)
  and `ssr` is OFF.
- PocketBase provides complete (and _fast_) backend including:
  - databse (SQLite)
  - CRUD API for database
  - realtime subscriptions for LIVE data (server push to browser)
  - Authentication and Authorization (email + social login/oauth2)
  - file storage (local filesystem or S3)
  - Extend with hooks and API endpoints in ...
    - [JavaScript](https://pocketbase.io/docs/js-overview/) for easy development.
      See the example [main.pb.ts](./pb/pb_hooks/main.pb.ts).
    - OR [Golang](https://pocketbase.io/docs/go-overview/) for full performance
      See `main.go`
- PocketBase can be downloaded as binary, and yet be extended with JavaScript.
  But if you want to extend it with custom Golang code then code is included
  to compile it locally with extensions such as custom endpoints (e.g. `/api/hello`)
  and database event hooks (e.g. executing Go handler functions when a database row is created)
- A full live development setup is included
  - Hot Module Reloading (HMR) of your frontend app when you edit Svelte code (including proxying requests to the PocketBase backend via `vite`)
  - Hot reloading (restarting) of the PocketBase server using `modd` when you edit Go code
  - Hot reloading (restarting) of the PocketBase server when JS code is changed in `./pb/pb_hooks`

To understand the backend, see [./pb/README.md](./pb/README.md) ("pb" == PocketBase)
To understand the frontend, see [./sk/README.md](./sk/README.md) ("sk" == SvelteKit)

Read those README files before proceeding.

# Setup

Follow these steps CAREFULLY, or else it won't work. Also read the README files referred above before proceeding.

## With Docker

This method is the most recommended method for setting up this application in most use cases, especially when customizing with Go code.

Make sure your Docker daemon is running then complete the following steps:

1. Copy`.env.example` to `.env` and then edit it to match your environment.
   Also, if you wish, copy `docker-compose.override.yml` to `docker-compose.override.yml`
   and edit it to your taste before proceeding.
   And then just run `docker compose up -d`.
2. Open a new terminal and navigate to the `/sk` directory. Install dependencies by
   running `npx pnpm install`
3. In the same terminal, after the dependencies are installed, run the command `npm run dev:backend`
   This runs `go build` in the `/pb` directory and runs `modd` for live development on a
   backend server
4. Open a seperate terminal, navigate to the `/sk` directory, and run the command `npm run dev`.
   This starts the frontend dev server.
5. Both sides are working if you navigate to the "Hello" page on the development server
   and there is an API response that says "Hello World!"

## With pocketbase binary

This method is a good alternative for simple use cases that don't use either Docker or Go, and instead uses JavaScript-exclusive customizations.

1. [Download the latest version of PocketBase.](https://github.com/pocketbase/pocketbase/releases/latest)
   - The versions support Darwin, Linux, and Windows. Make sure that you download the correct version that supports itself within the OS that you are using.
2. Extract the `pocketbase.exe` from the `.zip` file you downloaded into the `/pb` folder within your project.
3. Set up the backend
   - Open a new terminal, navigate to the `/sk` directory and run the command `npm run backend`
     - _For Windows:_ You will have to edit the `"backend"` script in the `./sk/package.json` file to `cd .. && cd pb && pocketbase serve --publicDir=../sk/build`
     - _For Mac:_ _Please contribute_
4. Set up the frontend
   - Open a new terminal, navigate to the `/sk` directory and run the following
     - First install dependencies using `npx pnpm install`
     - Then, `npm run dev`
5. Extend JavaScript by [checking out this documentation here.](https://pocketbase.io/docs/js-overview/).

## With Go Tools

This method works if you have Go Tools installed and want to set up the machine directly on your specific OS and you don't want to use Docker.

1. Verify that the Go compiler is installed on your machine by opening a terminal and running `go version`. If there is an error, set up the go compiler in acccordance with the type of OS you are using.
2. Make sure you `go.mod` file is ready to be built by navigating to the `/pb` directory and running `go mod tidy` in the terminal, especially if the file is throwing errors.
3. In the same terminal, run `go build`. This may take a moment
   - If you want to use `modd` for live devlopment, after building, install the latest version by running `go install github.com/cortesi/modd/cmd/modd@latest`, test the installation by running `modd`. If successful, data migration should occur and a backend development server should be running. You can learn more by reading about it in the README located in the `/pb` directory.
4. Open a new terminal, and run `cd sk && npm run develop`. When you open the localhost page in your browser, the “Hello” page should have an “Hello World” message coming from the API response

# Developing

Visit http://localhost:5173 (sk) or http://localhost:8090 (pb)

If you are running `modd`, making changes in the Svelte code (frontend) or Go code (backend) will show
results (almost) immediately.

# Usage

To use the app as a user / tester ...

- visit the frontend URL (e.g. http://localhost:5173)
- Navigate around. The Home page is not very interesting.
- The `hello` page shows and example of frontend calling a custom backend API implemented in Go.
- The `posts` page shows all existing posts. If that page is empty, then you might want to create some posts. You must be logged in to be able to create posts.
- Into the `Login` form, you can enter an existing username/password, or check the `register` checkbox to create a new account (it registers the user and log in immediately).

The above are just some sample features. Now go ahead and implement all kinds of new features.

- Create new collections.
- Create new pages that manipulate the above collections.

# Building

See the build process details in the README files for backend and frontend.

# Configurable Hooks

Please read about the "hooks" system in [./pb/README.md](./pb/README.md)
It is a very easy and powerful way to extend your application with minimal
configuration and perhaps no code.

# Feedback

Please provide feedback by
[opening an issue](https://github.com/spinspire/pocketbase-sveltekit-starter/issues/new)
or
[starting a discussion](https://github.com/spinspire/pocketbase-sveltekit-starter/discussions).
