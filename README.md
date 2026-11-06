# Website

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

### Installation

```sh
npm install
```

### Local Development

```sh
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```sh
npm run build
```

This command generates static content into the `build/` directory and can be served using any static contents hosting service.

### Deployment

This site is currently deployed through Netlify. The version of Node used to build the site is specified in **.nvmrc** in the root of this project (and overrides the version specified in **Build & Deploy > Dependency management** in the Netlify control panel.)

### Releasing docs for a new version

Make changes to docs in the **docs/** folder as usual. When changes are done for a new release, run the following command, changing "14.1.x" for the version these docs are for:

```sh
npx docusaurus docs:version 14.1.x
```
