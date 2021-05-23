---
title: Getting Started
---

Before we look at the in-depth examples, we need to establish how to set up and run the [cookbook project](https://github.com/MasterKale/SimpleWebAuthn/tree/master/examples) available in the repo. In this example, we have a few examples of how SimpleWebAuthn can be used to secure your web application: two-factor, passwordless, and usernameless. It consists of one express server, several server-side routes, and several static files for the client. Each method of authentication listed above will have a set of static files and server-side routes.

It's worth noting that the WebAuthn browser API isn't beneficial by itself. Developers that want to leverage the WebAuthn API must have the following:

-   A **stateful** and **secure** server capable of temporarily persisting values
-   A database that can store information linked to individual users

##### TIP

Don't fret if you don't already have a setup like this! The example projects mock out enough of this functionality to offer you a simple WebAuthn sandbox to play around with before you dive in further. 

***However***, there are many shortcuts taken to achieve a lightweight example of SimpleWebAuthn. These are not production-ready examples in their entirety.

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
./SimpleWebAuthn/ $\> cd example/

./example/ $\>
```

Next, install dependencies with `npm`:

```bash
./examples/ $\> npm install
```

## Starting the server

Once the two files above are in place, you can start the server:

```bash
./example/ $\> npm start
```

The example server should now be available at [https://localhost](https://localhost/)!
