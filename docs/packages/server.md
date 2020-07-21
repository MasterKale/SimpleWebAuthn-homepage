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

Documentation below will refer to the following TypeScript types. These are intended to be inspirational, a simple means of communicating the...types...of values you'll need to be capable of persisting in your database:

```ts
type UserModel = {
  id: string;
  username: string;
  currentChallenge?: string;
};

// It is strongly advised that authenticators get their own DB
// table, ideally with a foreign key to a specific UserModel
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
// A unique identifier for your website
const rpID = 'localhost';
// The URL at which attestations and assertions should occur
const origin = `https://${rpID}`;
```

These will be referenced throughout attestations and assertions to ensure that authenticators generate and return credentials specifically for your server.

:::info
The following instructions are for setting up SimpleWebAuthn for 2FA support. Guides for "Passwordless"
and "Usernameless" support can be found under the **Advanced Guides** section.
:::

## Attestation

"Attestation" is analogous to new account registration. Attestation support uses the following exported methods from this package:

```ts
import {
  generateAttestationOptions,
  verifyAttestationResponse,
} from '@simplewebauthn/server';
```

Attestation occurs in two steps:

1. Generate a collection of "attestation options" for the browser to pass to a FIDO2 authenticator
2. Verify the authenticator's response

Each of these steps need their own API endpoints:

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
const challenge: string = generateRandomChallenge();

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
    expectedOrigin: origin,
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
```

When finished, it's a good idea to return the verification status to the browser to display
appropriate UI:

```ts
return { verified };
```

## Assertion

"Assertion" is analogous to existing account login. Assertions use the following exported methods from this package:

```ts
import {
  generateAssertionOptions,
  verifyAssertionResponse,
} from '@simplewebauthn/server';
```

Just like attestations, assertions span two steps:

1. Generate a collection of "assertion options" for the browser to pass to a FIDO2 authenticator
2. Verify the authenticator's response

Each of these steps need their own API endpoints:

### 1. Generate assertion options

One endpoint (`GET`) needs to return the result of a call to `generateAssertionOptions()`:

```ts
// (Pseudocode) Retrieve the user from the database
// after they've logged in
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Retrieve any of the user's previously-
// registered authenticators
const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

// (Pseudocode) Generate something random and at least
// 16 characters long
const challenge: string = generateRandomChallenge();

// (Pseudocode) Remember this challenge for this user
setUserCurrentChallenge(user, challenge);

return generateAssertionOptions({
  challenge,
  // Require users to use a previously-registered authenticator
  allowedCredentialIDs: userAuthenticators.map(data => data.credentialID),
});
```

These options can be passed directly into **@simplewebauthn/browser**'s `startAssertion()` method.

### 2. Verify assertion response

The second endpoint (`POST`) should accept the value returned by **@simplewebauthn/browser**'s `startAssertion()` method and then verify it:

```ts
const { body } = req;

// (Pseudocode) Retrieve the logged-in user's challenge to
// compare it to the one in the attestation response
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Get the challenge that was sent to the
// user's authenticator
const expectedChallenge: string = getUserCurrentChallenge(user);
// (Pseudocode} Retrieve an authenticator from the DB that
// should match the `id` in the returned credential
const authenticator = getUserAuthenticator(user, body.id);

if (!authenticator) {
  throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);
}

let verification;
try {
  verification = await verifyAssertionResponse({
    credential: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator,
  });
} catch (error) {
  console.error(error);
  return res.status(400).send({ error: error.message });
}

const { verified, authenticatorInfo } = verification;
```

If `verification.verified` is true, then update the user's authenticator's `counter` property in the DB:

```ts
const { counter } = authenticatorInfo;

saveUpdatedAuthenticatorCounter(authenticator, counter);
```

When finished, it's a good idea to return the verification status to the browser to display
appropriate UI:

```ts
return { verified };
```

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