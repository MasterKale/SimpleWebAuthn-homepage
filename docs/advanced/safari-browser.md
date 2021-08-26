---
title: Safari Browser
---

When adding support for WebAuthn, special considerations must be made for the Safari browser on both iOS and macOS:

* [@simplewebauthn/browser's `startRegistration()`](packages/browser.md#startregistration) must be called in a **native** click listener. Some JS UI libraries, like VueJS, may not use native click handling without the use of framework-specific functionality [like Vue's `.native` modifier](https://vuejs.org/v2/guide/components-custom-events.html#Binding-Native-Events-to-Components).
* ~~Safari only supports the use of XHR and `fetch` within click handlers for requesting WebAuthn attestation and assertion options.~~ (Fixed as of February 2021. See [here](https://bugs.webkit.org/show_bug.cgi?id=213595))
* ~~Not all browsers on iOS or macOS support Touch ID or Face ID. Check [Supported Devices](advanced/supported-devices.md) for more information on which iOS and macOS browsers support which Apple-specific hardware authenticator.~~ (Fixed as of iOS 14.5. See [here](https://twitter.com/IAmKale/status/1386795055856308229))
