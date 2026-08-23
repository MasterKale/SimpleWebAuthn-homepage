---
title: Browser Quirks
---

## Safari

When adding support for WebAuthn, special considerations must be made for the Safari browser on both iOS and macOS:

* [@simplewebauthn/browser's `startRegistration()`](packages/browser.mdx#startregistration) and [`startAuthentication()`](packages/browser.mdx#startauthentication) must be called in a **native** click listener (user gesture detection). Some JS UI libraries may not use native click handling without the use of framework-specific functionality.
* Safari only supports the use of XHR and `fetch` within native click handlers for requesting WebAuthn registration and authentication options. `fetch` and XHR wrappers like [ofetch](https://github.com/unjs/ofetch) or [axios](https://github.com/axios/axios) might cause problems with user gesture detection. To avoid problems with user gesture detection, it's best to have a single native `fetch` or XHR call and not use any other async operations (promises, timeouts, ...) before calling `startRegistration()` / `startAuthentication()`.
* Websites viewed in Safari running **in iOS 17.4 and macOS 14.4 and later** are free to invoke WebAuthn as needed. There is [an internal rate limiter within Safari](https://forums.developer.apple.com/forums/thread/747036) to prevent abuse of WebAuthn, but "well-behaving" Relying Parties should no longer have user gesture requirements to contend with anymore (see below.)
  * Versions of Safari running **in iOS 17.3 and macOS 14.3 and earlier**...
    * ...may experience issues with session replay tools such as Sentry Session Replay or LogRocket causing problems with user gesture detection.
    * ...allow websites to make **one** call to `navigator.credentials.create()` or `navigator.credentials.get()` (via [`startRegistration()`](packages/browser.mdx#startregistration) or [`startAuthentication()`](packages/browser.mdx#startauthentication) respectively) for every browser navigation event without requiring a user gesture, e.g. to support Conditional UI. When using a Single-Page Application (SPA) this limit only gets reset after reloading the page.

## Microsoft Edge

The Microsoft Edge browser refers to two different browsers: the original release from 2015 (now called ["Microsoft Edge Legacy"](https://support.microsoft.com/en-us/microsoft-edge/what-is-microsoft-edge-legacy-3e779e55-4c55-08e6-ecc8-2333768c0fb0)), and the Chromium-based version from June 2020 that inherited the name "Microsoft Edge".

When adding support for WebAuthn, special considerations must be made for **Microsoft Edge Legacy**:

* [The browser global `TextEncoder` is not supported.](https://caniuse.com/textencoder) This means **@simplewebauthn/browser** will not work in this browser without a polyfill for this API. [MDN includes a spec-compliant polyfill](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Polyfill) that can be copied into your project. Various browser [polyfill libraries exist on NPM](https://www.npmjs.com/search?q=textencoder%20polyfill%20browser) as well.

## Firefox

WebAuthn responses from security keys that generate keypairs using Ed25519 (i.e. `-8`) can fail response verification during registration due to a bug in the browser itself. This can manifest as the following error message from **@simplewebauthn/server** methods:

```
Error: Leftover bytes detected while parsing authenticator data
```

These responses may also fail to be verified by `verifyRegistrationResponse()`, **even when the same server setup and security key are used in a different browser**:

```ts
const verifiedFirefox = await verifyRegistrationResponse({ ... });

console.log(verifiedFirefox.verified); // false
```

The issue was caused by a bug in authenticator-rs ([mozilla/authenticator-rs#292](https://github.com/mozilla/authenticator-rs/pull/292)), and according to Mozilla ([Bugzilla Bug 1852812](https://bugzilla.mozilla.org/show_bug.cgi?id=1852812)) **should be resolved as of Firefox 119**.
