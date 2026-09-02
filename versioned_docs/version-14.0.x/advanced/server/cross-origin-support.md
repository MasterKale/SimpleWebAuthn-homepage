---
title: Cross-Origin Support
---

:::caution
**The following functionality is opt-in and is not required for typical use!** SimpleWebAuthn remains focused on simplifying working with the WebAuthn API, and the functionality covered in [Packages &gt; @simplewebauthn/server](packages/server.md) will serve the majority of developers' use cases.
:::

## Introduction

Some passkey-supporting Relying Parties may wish to be embedded in other websites to facilitate passkey usage while the user is on that other site. A common example of this is in e-commerce flows, where the user may appear to be signing in to https://example.com with a passkey. However the user is _actually_ using a passkey to sign into the e-commerce platform that Example.com is choosing to host their storefront on. This occurs via a "widget" within https://example.com that is an `<iframe>` pointing to an e-commerce platform's URL.

## Authentication

:::danger[Embedded Relying Parties Face Extra Risks]
A Relying Party that wishes to facilitate passkey authentication while being embedded in another site **must** take extra steps to secure their authentication flow. See https://web.dev/articles/webauthn-within-iframe for advice on how to support being an embedded Relying Party, as well as for defense-in-depth guidance to lock down passkey authentications to only allowed cross-origin sites.
:::

**For the Relying Party being embedded in another site**, [`verifyAuthenticationResponse()`](packages/server.md#2-verify-authentication-response) can be called with an `expectedTopOrigin` argument set to an origin string (or array of such strings) for site(s) at which passkey ceremonies can occur using passkeys scoped to the embedded Relying Party:

```ts
import { verifyAuthenticationResponse } from '@simplewebauthn/server';

const verified = await verifyAuthenticationResponse({
  expectedRPID: 'login.merchant.com',
  expectedOrigin: 'https://login.merchant.com',
  expectedTopOrigin: 'https://example.com',
  // ...
});
```

When `expectedTopOrigin` is set, the method will check that [`response.clientDataJSON.crossOrigin`](https://w3c.github.io/webauthn/#dom-collectedclientdata-crossorigin) is `true`, and that [`response.clientDataJSON.topOrigin`](https://w3c.github.io/webauthn/#dom-collectedclientdata-toporigin) is one of the value(s) of `expectedTopOrigin`.
