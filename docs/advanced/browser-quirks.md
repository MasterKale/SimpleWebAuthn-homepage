---
title: Browser Quirks
---

## Safari

When adding support for WebAuthn, special considerations must be made for the Safari browser on both iOS and macOS:

* [@simplewebauthn/browser's `startRegistration()`](packages/browser.mdx#startregistration) and [`startAuthentication`](packages/browser.mdx#startauthentication) must be called in a **native** click listener. Some JS UI libraries, like VueJS, may not use native click handling without the use of framework-specific functionality [like Vue's `.native` modifier](https://vuejs.org/v2/guide/components-custom-events.html#Binding-Native-Events-to-Components).
* ~~Safari only supports the use of XHR and `fetch` within click handlers for requesting WebAuthn registration and authentication options.~~ (Fixed as of February 2021. See [here](https://bugs.webkit.org/show_bug.cgi?id=213595))
* ~~Not all browsers on iOS or macOS support Touch ID or Face ID. Check [Supported Devices](advanced/supported-devices.md) for more information on which iOS and macOS browsers support which Apple-specific hardware authenticator.~~ (Fixed as of iOS 14.5. See [here](https://twitter.com/IAmKale/status/1386795055856308229))

## Microsoft Edge

The Microsoft Edge browser refers to two different browsers: the original release from 2015 (now called ["Microsoft Edge Legacy"](https://support.microsoft.com/en-us/microsoft-edge/what-is-microsoft-edge-legacy-3e779e55-4c55-08e6-ecc8-2333768c0fb0)), and the Chromium-based version from June 2020 that inherited the name "Microsoft Edge".

When adding support for WebAuthn, special considerations must be made for **Microsoft Edge Legacy**:

* [The browser global `TextEncoder` is not supported.](https://caniuse.com/textencoder) This means **@simplewebauthn/browser** will not work in this browser without a polyfill for this API. [MDN includes a spec-compliant polyfill](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Polyfill) that can be copied into your project. Various browser [polyfill libraries exist on NPM](https://www.npmjs.com/search?q=textencoder%20polyfill%20browser) as well.

## Firefox

WebAuthn responses from security keys that generate keypairs using Ed12259 (i.e. `-8`) can fail response verification during registration due to a bug in the browser itself. This can manifest as the following error message from **@simplewebauthn/server** methods:

```
Error: Leftover bytes detected while parsing authenticator data
```

These responses may also fail to be verified by `verifyRegistrationResponse()`, **even when the same server setup and security key are used in a different browser**:

```ts
const verifiedFirefox = await verifyRegistrationResponse({ ... });

console.log(verifiedFirefox.verified); // false
```

The issue was caused by a bug in authenticator-rs ([mozilla/authenticator-rs#292](https://github.com/mozilla/authenticator-rs/pull/292)), and according to Mozilla ([Bugzilla Bug 1852812](https://bugzilla.mozilla.org/show_bug.cgi?id=1852812)) **should be resolved as of Firefox 119**.
