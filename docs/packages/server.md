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
  credentialID: Buffer;
  credentialPublicKey: Buffer;
  counter: number;
  // ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
};
```

## Identifying your RP

Start by defining some constants that describe your "Relying Party" (RP) server to authenticators:

```js
// Human-readable title for your website
const rpName = 'SimpleWebAuthn Example';
// A unique identifier for your website
const rpID = 'localhost';
// The URL at which attestations and assertions should occur
const origin = `https://${rpID}`;
```

These will be referenced throughout attestations and assertions to ensure that authenticators generate and return credentials specifically for your server.

:::info
The following instructions are for setting up SimpleWebAuthn for 2FA support. Guides for "Passwordless"
and "Usernameless" support are coming soon.
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

const options = generateAttestationOptions({
  rpName,
  rpID,
  userID: user.id,
  userName: user.username,
  // Don't prompt users for additional information about the authenticator
  // (Recommended for smoother UX)
  attestationType: 'indirect',
  // Prevent users from re-registering existing authenticators
  excludeCredentials: userAuthenticators.map(authenticator => ({
    id: authenticator.credentialID,
    type: 'public-key',
    // Optional
    transports: authenticator.transports,
  })),
});

// (Pseudocode) Remember the challenge for this user
setUserCurrentChallenge(user, options.challenge);

return options;
```

These options can be passed directly into [**@simplewebauthn/browser**'s `startAttestation()`](packages/browser.md#startattestation) method.

:::tip Support for custom challenges

Power users can optionally generate and pass in their own unique challenges as `challenge` when calling `generateAttestationOptions()`. In this scenario `options.challenge` still needs to be saved to be used in verification as described below.

:::

### 2. Verify attestation response

The second endpoint (`POST`) should accept the value returned by [**@simplewebauthn/browser**'s `startAttestation()`](packages/browser.md#startattestation) method and then verify it:

```ts
const { body } = req;

// (Pseudocode) Retrieve the logged-in user
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Get `options.challenge` that was saved above
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

const { verified, attestationInfo } = verification;
```

:::tip Support for multiple origins and RP IDs
SimpleWebAuthn optionally supports verifying attestations from multiple origins and RP IDs! Simply pass in an array of possible origins and IDs for `expectedOrigin` and `expectedRPID` respectively.
:::

If `verification.verified` is true, then save the credential data in `attestationInfo` to the database:

```ts
const { credentialPublicKey, credentialID, counter } = attestationInfo;

const newAuthenticator: Authenticator = {
  credentialID,
  credentialPublicKey,
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
// (Pseudocode) Retrieve the logged-in user
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Retrieve any of the user's previously-
// registered authenticators
const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

const options = generateAssertionOptions({
  // Require users to use a previously-registered authenticator
  allowCredentials: userAuthenticators.map(authenticator => ({
    id: authenticator.credentialID,
    type: 'public-key',
    // Optional
    transports: authenticator.transports,
  })),
  userVerification: 'preferred',
});

// (Pseudocode) Remember this challenge for this user
setUserCurrentChallenge(user, options.challenge);

return options;
```

These options can be passed directly into [**@simplewebauthn/browser**'s `startAssertion()`](packages/browser.md#startassertion) method.

:::tip Support for custom challenges

Power users can optionally generate and pass in their own unique challenges as `challenge` when calling `generateAssertionOptions()`. In this scenario `options.challenge` still needs to be saved to be used in verification as described below.

:::

### 2. Verify assertion response

The second endpoint (`POST`) should accept the value returned by [**@simplewebauthn/browser**'s `startAssertion()`](packages/browser.md#startassertion) method and then verify it:

```ts
const { body } = req;

// (Pseudocode) Retrieve the logged-in user
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Get `options.challenge` that was saved above
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

const { verified, assertionInfo } = verification;
```

:::tip Support for multiple origins and RP IDs
SimpleWebAuthn optionally supports verifying assertions from multiple origins and RP IDs! Simply pass in an array of possible origins and IDs for `expectedOrigin` and `expectedRPID` respectively.
:::

If `verification.verified` is true, then update the user's authenticator's `counter` property in the DB:

```ts
const { newCounter } = assertionInfo;

saveUpdatedAuthenticatorCounter(authenticator, newCounter);
```

When finished, it's a good idea to return the verification status to the browser to display
appropriate UI:

```ts
return { verified };
```

## MetadataService

Metadata statements maintained by the FIDO Alliance can be referenced during attestation to cross-reference additional information about authenticators that may be used with SimpleWebAuthn. These statements contain cryptographically-signed "guarantees" about authenticators and what they are capable of, according to their manufacturer.

This package includes support for [FIDO Metadata Service (MDS)](https://fidoalliance.org/metadata/) metadata statements via `MetadataService`:

```ts
import {
  MetadataService,
} from '@simplewebauthn/server';
```

This service contains all of the logic necessary to interact with the MDS API, including signed data verification and automatic periodic refreshing of metadata.

:::info
Use of MetadataService is _not_ required to use @simplewebauthn/server! This is opt-in functionality that enables a more strict adherence to FIDO specifications and may not be appropriate for your use case.
:::

### Registering for an MDS API token

Requests to the MDS API require an access token. Head to https://mds2.fidoalliance.org/tokens/ to register for a free access token.

:::tip
When asked for an Organization Name, "Self" works just fine.
:::

You will receive your access token via email.

### Initializing MetadataService

Once you have an access token, you can then point `MetadataService` to the official MDS API:

```ts
// Use `dotenv` or similar to pull in the API token as an env var
const mdsAPIToken = process.env.MDS_API_TOKEN;

// Initialize MetadataService with MDS connection info
MetadataService.initialize({
  mdsServers: [
    {
      url: `https://mds2.fidoalliance.org/?token=${mdsAPIToken}`,
      rootCertURL: 'https://mds.fidoalliance.org/Root.cer',
      metadataURLSuffix: `?token=${mdsAPIToken}`,
    },
  ],
}).then(() => {
  console.log('🔐 MetadataService initialized');
});
```

## Supported Attestation Formats

SimpleWebAuthn supports [all current WebAuthn attestation formats](https://w3c.github.io/webauthn/#sctn-defined-attestation-formats), including:

- **Packed**
- **TPM**
- **Android Key**
- **Android SafetyNet**
- **FIDO U2F**
- **None**
- **Apple**

Once `MetadataService` is initialized, `verifyAttestationResponse()` will reference MDS metadata statements and error out if it receives authenticator responses with unexpected values.

## Additional API Documentation

Lower-level API docs for this package are available here:

https://api-docs.simplewebauthn.dev/modules/_simplewebauthn_server.html
