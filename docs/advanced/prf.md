---
title: PRF
---

:::danger Proceed with extreme caution
Use of WebAuthn's `prf` extension **dangerously** ties vital encryption information to a user's
passkey. If a user inadvertently deletes their passkey, **they will lose all access to their
information** that your website chose to encrypt with that passkey's PRF seed. There is nothing
that can be done with SimpleWebAuthn to fix this problem if it occurs to you.

If your use case can benefit from use of the `prf` extension then it is worthwhile to [invest in
learning the ins and outs of it directly from the WebAuthn
spec](https://w3c.github.io/webauthn/#prf-extension), and to implement the logic yourself so that
full liability rests on your shoulders.

If you read the following and believe it to be an unsatisfactory explanation of how to use PRF then
that is intentional. There are no plans to make PRF simpler to use using SimpleWebAuthn because of
the footgun described above. **Passkeys are an authentication technology first and foremost**, and
SimpleWebAuthn prioritizes simplifying these use cases any other use of WebAuthn.
:::

WebAuthn's **pseudo-random function** extension (`prf`) can be used to reliably request a sequence
of sufficiently random bytes after a WebAuthn auth ceremony that are strongly associated to a user's
passkey. Useful encryption use cases, like end-to-end encryption, can be driven by this "PRF seed."

The seed is generated from the combined hashing of **server-controlled bytes** (a.k.a. "salt") and
**authenticator-controlled bytes** stored with the passkey private key. When hashed together, these
bytes can become useful input for things like an "HMAC-based Key Derivation Function" (HKDF).

The `prf` extension inputs during registration and authentication are of type `BufferSource` in the
WebAuthn spec. These are mapped to the `ArrayBuffer` type in JavaScript.

## Server: Bytes to Base64URL

After generating options using **@simplewebauthn/server**'s [`generateRegistrationOptions()`](packages/server.md#1-generate-registration-options) or
[`generateAuthenticationOptions()`](packages/server.md#1-generate-authentication-options), the following helper can be imported to add the `prf` extension
directly to the generated options. This will allow the salt to be sent to the browser as a
base64url-encoded string along with the rest of the generated options:

```ts
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const prfSaltBase64URL: string = isoBase64URL.fromBuffer(prfSaltBytes);
```

## Browser: Base64URL to Bytes

In the browser, you can then import the following helper from **@simplewebauthn/browser** to convert
the salt back into an `ArrayBuffer` before passing the options with the `prf` extension into
`startRegistration()` or `startAuthentication()`:

```ts
import { base64URLStringToBuffer } from '@simplewebauthn/browser';

const prfSaltBytes: ArrayBuffer = base64URLStringToBuffer(prfSaltBase64URL);
```

## More Info

To learn more about how to use PRF, please [consult the WebAuthn
spec](https://w3c.github.io/webauthn/#prf-extension).
