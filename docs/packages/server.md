---
title: Server
---

## Installing

This package is available on **npm**:

```bash
npm install @simplewebauthn/server
```

It can then be imported into all types of Node projects thanks to its support for both ES Module and CommonJS import patterns:

```ts
// ES Module (TypeScript, Babel, etc...)
import SimpleWebAuthnServer from '@simplewebauthn/server';

// CommonJS (NodeJS)
const SimpleWebAuthnServer = require('@simplewebauthn/server');
```

Documentation below will refer to the following types representing basic data structures. These types are intended only for inspiration, to convey the general types of values you'll need to be capable of persisting in your database:

```ts
type UserModel = {
  id: string;
  username: string;
  currentChallenge?: string;
};

type Authenticator = {
  credentialID: string;
  publicKey: string;
  counter: number;
};
```

## Identifying your RP

Start by defining some constants that describe your "Relying Party" (RP) server to authenticators:

```js
// Human-readable title for your website
const serviceName = 'SimpleWebAuthn Example';
// An identifier unique to your website to ensure that credentials generated
// here can only be used here
const rpID = 'localhost';
```

These will be referenced throughout attestations and assertions to ensure that authenticators generate and return credentials specifically for your server.

:::info
The following instructions are for setting up SimpleWebAuthn for 2FA support. Guides for "Passwordless"
and "Usernameless" support can be found under the **Advanced Guides** section.
:::

## Attestation

"Attestation" is analogous to new account registration. Attestation occurs in two steps:

1. Generate a collection of "attestation options" for the browser to pass to a FIDO2 authenticator
2. Verify the authenticator's response

Attestation uses the following exported methods from this package:

```ts
import {
  generateAttestationOptions,
  verifyAttestationResponse,
} from '@simplewebauthn/server';
```

Each of these steps need to be handled as individual API endpoints:

### 1. Generate attestation options

One endpoint (`GET`) needs to return the result of a call to `generateAttestationOptions()`:

```ts
// (Pseudocode) Retrieve the user from the database
// after they've logged in
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Retrieve any of the user's previously-
// registered authenticators
const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

// (Pseudocode) Generate something random and at least
// 16 characters long
const challenge: string = getRandomChallenge();

// (Pseudocode) Remember this challenge for this user
setUserCurrentChallenge(user, challenge);

return generateAttestationOptions({
  serviceName,
  rpID,
  challenge,
  userID: user.id,
  userName: user.username,
  // Prompt users for additional information about the authenticator.
  attestationType: 'direct',
  // Prevent users from re-registering existing authenticators
  excludedCredentialIDs: userAuthenticators.map(dev => dev.credentialID),
});
```

These options can be passed directly into **@simplewebauthn/browser**'s `startAttestation()` method.

### 2. Verify attestation response

The second endpoint (`POST`) should accept the value returned by **@simplewebauthn/browser**'s `startAttestation()` method and then verify it:

```ts
const { body } = req;

// (Pseudocode) Retrieve the logged-in user's challenge to
// compare it to the one in the attestation response
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Get the challenge that was sent to the
// user's authenticator
const expectedChallenge: string = getUserCurrentChallenge(user);

let verification;
try {
  verification = await verifyAttestationResponse({
    credential: body,
    expectedChallenge,
    expectedOrigin: `https://${rpID}`,
    expectedRPID: rpID,
  });
} catch (error) {
  console.error(error);
  return res.status(400).send({ error: error.message });
}

const { verified, authenticatorInfo } = verification;
```

If `verification.verified` is true, then store `authenticatorInfo` in the database:

```ts
const { base64PublicKey, base64CredentialID, counter } = authenticatorInfo;

const newAuthenticator: Authenticator = {
  credentialID: base64CredentialID
  publicKey: base64PublicKey
  counter,
};

// (Pseudocode) Save the authenticator info so that we can
// get it by user ID later
saveNewUserAuthenticatorInDB(user, newAuthenticator);

// Return the verification status to the browser to display
// appropriate UI
return { verified };
```

## Assertion

"Assertion" is analogous to existing account login.

## Supported Attestation Formats

SimpleWebAuthn supports [all six WebAuthn attestation formats](https://w3c.github.io/webauthn/#sctn-defined-attestation-formats), including:

- **Packed**
- **TPM**
- **Android Key**
- **Android SafetyNet**
- **FIDO U2F**
- **None**

## MetadataService

Supports FIDO Metadata Service (MDS)

Metadata enables a greater degree of certainty that the devices interacting with this server are
what they claim to be according to their manufacturer.

Use of MetadataService is _not_ required to use @simplewebauthn/server. If you do choose to use
it, you'll need to provide at least one MDS endpoint

See https://mds2.fidoalliance.org/tokens/ to register for a free access token. When they ask for
an Organization Name, "Self" works just fine.
