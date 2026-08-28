---
title: Secure Payment Confirmation
---

## Introduction

If you've made it here then you probably know what Secure Payment Confirmation (SPC) is! If not, you can read more about it here:

https://www.w3.org/TR/secure-payment-confirmation/

SPC responses are almost identical to WebAuthn responses, save for a slightly different value in their `type` value within `clientDataJSON`. Fortunately it's easy to verify such SPC responses using **@simplewebauthn/server**.

## Specify a custom `expectedType`

Secure Payment Confirmation requests can be supported by SimpleWebAuthn by setting the `expectedType` argument to `"payment.get"` when calling **@simplewebauthn/server**'s `verifyAuthenticationResponse()`:

```ts
import { verifyAuthenticationResponse } from '@simplewebauthn/server';

const authVerify = await verifyAuthenticationResponse({
  // ...
  expectedType: 'payment.get',
});
```

If desired, a single call to `verifyAuthenticationResponse()` can support verification of both WebAuthn and Secure Payment Confirmation responses (i.e. output from **@simplewebauthn/browser**'s `startAuthentication()` method) by specifying the following array of possible values:

```ts
import { verifyAuthenticationResponse } from '@simplewebauthn/server';

const authVerify = await verifyAuthenticationResponse({
  // ...
  expectedType: ['webauthn.get', 'payment.get'],
});
```
