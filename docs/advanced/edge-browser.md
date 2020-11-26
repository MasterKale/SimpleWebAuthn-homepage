---
title: Edge Browser
---

The Microsoft Edge browser refers to two different browsers: the original release from 2015 (now called ["Microsoft Edge Legacy"](https://support.microsoft.com/en-us/microsoft-edge/what-is-microsoft-edge-legacy-3e779e55-4c55-08e6-ecc8-2333768c0fb0)), and the Chromium-based version from June 2020 that inherited the name "Microsoft Edge".

When adding support for WebAuthn, special considerations must be made for **Microsoft Edge Legacy**:

* [The browser global `TextEncoder` is not supported.](https://caniuse.com/textencoder) This means **@simplewebauthn/browser** will not work in this browser without a polyfill for this API. [MDN includes a spec-compliant polyfill](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Polyfill) that can be copied into your project. Various browser [polyfill libraries exist on NPM](https://www.npmjs.com/search?q=textencoder%20polyfill%20browser) as well.
