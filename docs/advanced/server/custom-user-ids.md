---
title: Custom User IDs
---

:::caution
**The following functionality is opt-in and is not required for typical use!** SimpleWebAuthn remains focused on simplifying working with the WebAuthn API, and the functionality covered in [Packages &gt; @simplewebauthn/server](packages/server.md) will serve the majority of developers' use cases.
:::

## Introduction

Some Relying Parties may wish to use their own format of user IDs instead of allowing `generateRegistrationOptions()` to generate a **unique, random, WebAuthn-specific identifier** to [maximize user privacy](https://w3c.github.io/webauthn/#sctn-user-handle-privacy).

In SimpleWebAuthn v9 it was possible to use such string values directly by simply assigning them to `userID` when calling `generateRegistrationOptions()`. **As of SimpleWebAuthn v10**, though, RP's now must account for the library-orchestrated use of base64url string encoding to get `user.id` bytes to the browser during registration, and `userHandle` bytes to the server during authentication.

:::caution
This is not a guide on how to use e.g. a user's email as their WebAuthn ID. Values used for `userID` **MUST NOT** contain personally-identifying information (PII)! A value like `"WA1234567890ABC"` is okay, but a value like `"iamkale@simplewebauthn.dev"` is not!

If you don't want to worry about any of this then consider skipping the rest of this guide and revisiting the general guidance offered in [Packages &gt; @simplewebauthn/server](packages/server.md).
:::

### Registration

Use the `isoUint8Array` helper to convert the custom user identifier UTF-8 `string` into a `Uint8Array`:

```ts
import { isoUint8Array } from '@simplewebauthn/server/helpers';

const options = generateRegistrationOptions({
  // ...
  userID: isoUint8Array.fromUTF8String('customUserIDHere'),
});
```

The value `options.user.id` will be the **base64url-encoded UTF-8 bytes**. When passed into [**@simplewebauthn/browser**'s `startRegistration()`](packages/browser.mdx#startregistration) the bytes will be decoded back to the raw UTF-8 bytes and passed to the authenticator.

### Authentication

[**@simplewebauthn/browser**'s `startAuthentication()`](packages/browser.mdx#startauthentication) method will encode the raw `credential.response.userHandle` bytes out of the WebAuthn response to make it easy to send them to the back end.

Back on the server, the `isoBase64URL` helper can be used to convert `userHandle` back into a recognizable UTF-8 `string`:

```ts
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const credential = await receiveFromBrowser();
console.log(
  isoBase64URL.toUTF8String(credential.response.userhandle), // 'customUserIDHere'
);
```

## Error: String values for \`userID\` are no longer supported

[@simplewebauthn/server's `generateRegistrationOptions()`](packages/server.md#1-generate-registration-options) will throw this error when a `string` value is passed in for the `userID` argument. To fix the problem, review the **Registration** section above for guidance on refactoring your code to massage your `string` identifier into a `Uint8Array`.
