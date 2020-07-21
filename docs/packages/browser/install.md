---
title: Browser - Installation
sidebar_label: Installation
---

## npm

This package is available on **npm** for use in projects that contain a build/bundling step, like
in a single-page application:

```bash
$> npm install @simplewebauthn/browser
```

It can then be imported into a project as usual:

```js
import {
  startAttestation,
  startAssertion,
  supportsWebauthn,
} from '@simplewebauthn/browser';
```

## UMD

The Browser package can also be installed using a traditional `<script>` tag. Copy-paste the code below into your HTML page's `<head>` element to begin:

```html
<script src="https://unpkg.com/@simplewebauthn/browser/dist/simplewebauthn-browser.min.js"></script>
```

The library's methods will be available on the global `SimpleWebAuthnBrowser` object.
