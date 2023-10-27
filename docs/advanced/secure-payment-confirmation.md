---
title: Secure Payment Confirmation
---

If you've made it here then you probably know what Secure Payment Confirmation is! If not, you can read more about it here:

https://www.w3.org/TR/secure-payment-confirmation/

Secure payment confirmation requests can be supported by SimpleWebAuthn by setting the `expectedType` argument to `"payment.get"` when calling **@simplewebauthn/server**'s `verifyAuthenticationResponse()`:

```ts
const authVerify = verifyAuthenticationResponse({
  // ...
  expectedType: 'payment.get',
});
```

A single call to `verifyAuthenticationResponse()` can support verification of both WebAuthn and Secure Payment Confirmation responses (i.e. output from **@simplewebauthn/browser**'s `startAuthentication()` method) by specifying the following array of possible values:

```ts
const authVerify = verifyAuthenticationResponse({
  // ...
  expectedType: ['webauthn.get', 'payment.get'],
});
```
