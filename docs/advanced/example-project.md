---
title: Example Project
---

## Introduction

What follows is a more in-depth look at the [example project](https://github.com/MasterKale/SimpleWebAuthn/tree/master/example) available in the repo. A single-file Express server and a few HTML files have been combined with the packages in this project to demonstrate what it takes to get up and running with WebAuthn. This is intended to be a practical reference for implementing the SimpleWebAuthn libraries to add WebAuthn-based Two-Factor Authentication (2FA) support to your website.

Before going any further, though, it's worth noting that the WebAuthn browser API by itself isn't very useful. Developers that want to leverage this API and these libraries are required to have a server with a few things already up and running:

- A **stateful** server capable of temporarily persisting values
- A database that can store information linked to individual users

:::tip

Don't fret if you don't already have a setup like this! The example project mocks out enough of this functionality to offer you a simple WebAuthn sandbox to play around with before you dive in further.

:::

## Getting started

The example server is a Node server, so you'll need the following available on your machine:

- Node.js
  - [Install the current LTS release](https://nodejs.org/en/download/) if you're new to all of this
  - The `npm` (Node Package Manager) executable comes with an installation of Node

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
./example/ $>
```

Next, install dependencies with `npm`:

```bash
./example/ $> npm install
```

### Starting the server

Once the two files above are in-place, you can start the server:

```bash
./example/ $> npm start
```

The example server should now be available at [http://localhost:8000](http://localhost:8000)!

## Setting up HTTPS support

:::info
Setting up HTTPS support will enable you to access the example project from other devices on your intranet, including smartphones, so that you can test WebAuthn across multiple environments from the safety of your own network, no internet access needed!
:::

:::caution
The following steps assume you own a custom domain and have full access to its DNS configuration. You must be able to create DNS A and CNAME records for your domain/subdomain to complete the steps below.

For the steps below, replace **dev.example.com** with your own domain/subdomain. To clarify, **this setup will *not* expose this server to the internet.**
:::

:::tip
Below are a suggested list of steps to host the example project over HTTPS from a development machine. They are not the only way to accomplish this task, so feel free to deviate as you see fit. The end goal is what's important here, not necessarily how you get there.
:::

WebAuthn must be run from a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), that is from either `http://localhost` or from an `https://` address using a valid SSL certificate. While the example project works fine over localhost right out of the box, additional work is needed to get it running over HTTPS:

1. Determine your intranet IP address. This will likely be an address in the **192.168.1.\*** range
2. Create an A record for **dev.example.com** in your domain's DNS configuration pointing to the IP address above.
3. Install EFF's [certbot](https://certbot.eff.org/instructions) according to your local OS
   1. Select **"None of the Above"** and then **your OS** to see instructions
   2. Stop once you complete the **"Install Certbot"** step
4. Run the following `certbot` command and follow its instructions to generate SSL certificates for **dev.example.com**:

```bash
$> sudo certbot --manual -d dev.example.com --preferred-challenges dns certonly
```

:::info
These SSL certificates are only good for 90 days. To renew your local SSL certificates after 90 days, simply re-run the command above.
:::

5. Copy the resulting **/etc/letsencrypt/live/dev.example.com/fullchain.pem** to **./example/dev.example.com.crt**
6. Copy the resulting **/etc/letsencrypt/live/dev.example.com/privkey.pem** to **./example/dev.example.com.key**
7. Create a **.env** file and add the following environment variable:

```env title="example/.env"
ENABLE_HTTPS=true
```

8. Open **index.ts** and update `rpID`:

```js title="example/index.ts"
const rpID = 'dev.example.com';
```

9. Once everything is in place, start the server:

```sh
./example $> npm start
```

Assuming everything is in place, the server will then be accessible at https://dev.example.com.

Additionally, since the **dev.example.com** DNS A record points to your local machine's intranet IP address, any device connected to your intranet will be able to access the example project at https://dev.example.com to test the device's support for WebAuthn.
