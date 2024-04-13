---
title: Custom Challenges
---

:::caution
**The following functionality is opt-in and is not required for typical use!** SimpleWebAuthn remains focused on simplifying working with the WebAuthn API, and the functionality covered in [Packages &gt; @simplewebauthn/server](packages/server.md) will serve the majority of developers' use cases.
:::

## Introduction

Some Relying Parties have highly specialized requirements that require greater control over how options challenges are generated, and how challenges in authenticator responses are verified. SimpleWebAuthn supports some of these use cases with the following capabilities:

## Use a custom string for `challenge`

It is possible to specify custom strings for the `challenge` option when calling `generateRegistrationOptions()` and `generateAuthenticationOptions()`. These strings will be treated as **UTF-8 bytes** when preparing them for use as challenges:

```js
import { generateRegistrationOptions } from '@simplewebauthn/server';

const options = await generateRegistrationOptions({
  // ...
  challenge: 'simplewebauthn',
});
```

Authenticators will **sign over the base64url-encoded challenge** [as per the WebAuthn spec](https://www.w3.org/TR/webauthn-2/#dom-collectedclientdata-challenge). This **must be accounted for** when specifying the same custom string as the `expectedChallenge` option when calling `verifyRegistrationResponse()` and `verifyAuthenticationResponse()`:

```js
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const verification = await verifyRegistrationResponse({
  // ...
  expectedChallenge: isoBase64URL.fromString('simplewebauthn'),
});
```

## Customize challenge verification logic with `expectedChallenge`

(Pulling from https://github.com/MasterKale/SimpleWebAuthn/pull/172)

A small amount of arbitrary information can be signed over during registration and authentication by overloading the `challenge` value with a stringified complex value. Call `generateRegistrationOptions()` or `generateAuthenticationOptions()` like usual, then override the `challenge` value to add in additional data in a way that is suitable for the use case:

```js
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const options = await generateAuthenticationOptions({ ... });

// Remember the plain challenge
inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

// Add a simple amount of data to be signed using whatever
// data structure is most appropriate
options.challenge = isoBase64URL.fromString(JSON.stringify({
  actualChallenge: options.challenge,
  arbitraryData: 'arbitraryDataForSigning',
}));
```

After the WebAuthn ceremony is completed, call `verifyRegistrationResponse()` or `verifyAuthenticationResponse()` and pass in a function for `expectedChallenge` that accepts a `challenge` string and returns a `boolean`. This will need to perform the reverse of the logic used above to ensure that "`actualChallenge`" is the expected challenge:

```js
const expectedChallenge = inMemoryUserDeviceDB[loggedInUserId].currentChallenge;

const verification = await verifyAuthenticationResponse({
  // ...
  expectedChallenge: (challenge: string) => {
    const parsedChallenge = JSON.parse(base64url.decode(challenge));
    return parsedChallenge.actualChallenge === expectedChallenge;
  },
});
```

:::info
`expectedChallenge` **can also be an asynchronous function** to support e.g. making a network request to retrieve data needed to complete challenge verification.
:::

Once the response is **successfully** verified then use the `decodeClientDataJSON()` helper to retrieve the arbitrary data:

```js
import { decodeClientDataJSON } from '@simplewebauthn/server/helpers';

const { challenge } = decodeClientDataJSON(body.response.clientDataJSON);
const parsedChallenge = JSON.parse(base64url.decode(challenge));
console.log(parsedChallenge.arbitraryData); // 'arbitraryDataForSigning'
```
