---
title: Secure Payment Confirmation
---

If you've made it here then you probably know what Secure Payment Confirmation (SPC) is! If not, you can read more about it here:

https://www.w3.org/TR/secure-payment-confirmation/

Secure Payment Confirmation requests can be supported by SimpleWebAuthn by setting the `expectedType` argument to `"payment.get"` when calling **@simplewebauthn/server**'s `verifyAuthenticationResponse()`:

```ts
const authVerify = await verifyAuthenticationResponse({
  // ...
  expectedType: 'payment.get',
});
```

If desired, a single call to `verifyAuthenticationResponse()` can support verification of both WebAuthn and Secure Payment Confirmation responses (i.e. output from **@simplewebauthn/browser**'s `startAuthentication()` method) by specifying the following array of possible values:

```ts
const authVerify = await verifyAuthenticationResponse({
  // ...
  expectedType: ['webauthn.get', 'payment.get'],
});
```
