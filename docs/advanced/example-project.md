---
title: Example Project
---

## Introduction

What follows is a more in-depth look at the [example project](https://github.com/MasterKale/SimpleWebAuthn/tree/master/example) available in the repo. This single-file Express server and a few HTML files have been combined with the packages in this repo to demonstrate what it takes to get up and running with WebAuthn. This is intended to be a practical reference for implementing the SimpleWebAuthn libraries to add WebAuthn support to your website.

Before going any further, though, it's worth noting that the WebAuthn browser API by itself isn't very useful. Developers that want to leverage this API and these libraries are required to have a server with a few things already up and running:

- A **stateful** server capable of temporarily persisting values
- A database that can store information linked to individual users

:::tip

Don't fret if you don't already have a setup like this! The example project mocks out enough of this functionality to offer developers a simple WebAuthn sandbox to play around in before they dive in further!

:::

## Getting started

The example server is a Node server, so you'll need the following available on your machine:

- Node v10.0.0+

### Downloading the code

First and foremost, get the SimpleWebAuthn code downloaded to your machine. You can [click here to download](https://github.com/MasterKale/SimpleWebAuthn/archive/master.zip) a ZIP file containing a current snapshot of the codebase, or clone it with `git`:

```bash
$> git clone https://github.com/MasterKale/SimpleWebAuthn.git
```

After unzipping or cloning the codebase, `cd` to it in a terminal before continuing:

```bash
$> cd SimpleWebAuthn
./SimpleWebAuthn/ $>
```

### Installing dependencies

First, navigate to the example project directory:

```bash
./SimpleWebAuthn/ $> cd example
./SimpleWebAuthn/example/ $>
```

Next, install dependencies with `npm`:

```bash
./SimpleWebAuthn/example/ $> npm install
```

### Setting up HTTPS support

Websites that want to use WebAuthn _must_ be served over HTTPS, **including during development!** Fortunately it's now simple to generate SSL certificates that can be used during development:

#### Let's Encrypt via certbot

TBD

#### mkcert

TBD (might replace Let's Encrypt setup)

### Starting the server

Once the certificates are in-place, you can start the server:

```bash
./SimpleWebAuthn/example/ $> npm start
```

## Server Architecture

TBD

## Browser Architecture

TBD
