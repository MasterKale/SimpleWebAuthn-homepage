---
title: Getting Started
---

Before we take a look at the in-depth recipes, we need to establish how to setup and run the [cookbook projects](https://github.com/MasterKale/SimpleWebAuthn/tree/master/examples) available in the repo. In all of these examples, a single-file Express server and a few HTML files have been combined with the SimpleWebAuthn packages to demonstrate what it takes to get up and running with WebAuthn. As mentioned before, these are intended as a look into how to use SimpleWebAuthn, not as a replacement for a real server.

It's worth noting that the WebAuthn browser API by itself isn't very useful. Developers that want to leverage this API and these libraries are required to have a server with a few things already up and running:

-   A **stateful** server capable of temporarily persisting values
-   A database that can store information linked to individual users

##### TIP

Don't fret if you don't already have a setup like this! The example projects mock out enough of this functionality to offer you a simple WebAuthn sandbox to play around with before you dive in further.

## Getting started

The example server is a Node server, so you'll need the following available on your machine:

-   Node v10.0.0+ ([install](https://nodejs.org/))
    -   Install the current LTS release if you're new to all of this
    -   The `npm` (Node Package Manager) executable comes with an installation of Node

### Downloading the code[#](https://simplewebauthn.dev/docs/advanced/example-project#downloading-the-code "Direct link to heading")

First and foremost, get the SimpleWebAuthn code downloaded to your machine. You can [click here to download](https://github.com/MasterKale/SimpleWebAuthn/archive/master.zip) a ZIP file containing a current snapshot of the codebase, or clone it with `git`:

```bash
$\> git clone https://github.com/MasterKale/SimpleWebAuthn.git
```

After unzipping or cloning the codebase, `cd` to it in a terminal before continuing:

```bash
$\> cd SimpleWebAuthn

./SimpleWebAuthn/ $\>
```

## Installing dependencies

First, navigate to the example project directory. We will be using the WebAuthn 2FA example, but these steps work for all of them:

```bash
./SimpleWebAuthn/ $\> cd examples/webauthn-2fa

./examples/multi-factor/ $\>
```

Next, install dependencies with `npm`:

```bash
./examples/multi-factor/ $\> npm install
```

## Starting the server

Once the two files above are in-place, you can start the server:

```bash
./example/multi-factor/ $\> npm start
```

The example server should now be available at [https://localhost](https://localhost/)!
