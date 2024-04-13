---
title: Philosophy
---

WebAuthn is a browser API that empowers us all to secure our accounts with a user-friendly experience powered by public-key cryptography.

Website back ends that wish to leverage this technology must be set up to do two things:

1. Provide to the front end a specific collection of values that the hardware authenticator will understand for "registration" and "authentication".
2. Parse responses from hardware authenticators.

Website front ends have their own part to play in the process:

1. Pass the server-provided values into the WebAuthn API's `navigator.credentials.create()` and `navigator.credentials.get()` so the user can interact with their compatible authenticator.
2. Pass the authenticator's response returned from these methods back to the server.

On the surface, this is a relatively straightforward dance. Unfortunately the values passed into the `navigator.credentials` methods and the responses received from them make heavy use of `ArrayBuffer`'s which are difficult to transmit as JSON between front end and back end. Not only that, there are many complex ways in which authenticator responses must be parsed, and though finalized, [the W3C spec](https://w3c.github.io/webauthn/) is quite complex and is being expanded all the time.

**Enter SimpleWebAuthn.**

SimpleWebAuthn offers a developer-friendly pair of libraries that simplify the above dance. **@simplewebauthn/server** exports a small number of methods requiring a handful of simple inputs that pair with the two primary methods exported by **@simplewebauthn/browser**. No converting back and forth between `Uint8Array` (or was this supposed to be an `ArrayBuffer`...?) and `String`, no worrying about JSON compatibility - **SimpleWebAuthn takes care of it all!**

