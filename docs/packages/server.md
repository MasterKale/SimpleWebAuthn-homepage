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

/**
 * It is strongly advised that authenticators get their own DB
 * table, ideally with a foreign key to a specific UserModel.
 *
 * "SQL" tags below are suggestions for column data types and
 * how best to store data received during registration for use
 * in subsequent authentications.
 */
type Authenticator = {
  // SQL: Encode to base64url then store as `TEXT`. Index this column
  credentialID: Buffer;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  credentialPublicKey: Buffer;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  credentialDeviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  credentialBackedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
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
// The URL at which registrations and authentications should occur
const origin = `https://${rpID}`;
```

These will be referenced throughout registrations and authentications to ensure that authenticators generate and return credentials specifically for your server.

:::info
The following instructions are for setting up SimpleWebAuthn for 2FA support. Guides for "Passwordless"
and "Usernameless" support are coming soon.
:::

## Registration

"Registration" is analogous to new account creation. Registration uses the following exported methods from this package:

```ts
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
```

Registration occurs in two steps:

1. Generate registration options for the browser to pass to a supported authenticator
2. Verify the authenticator's response

Each of these steps need their own API endpoints:

### 1. Generate registration options

One endpoint (`GET`) needs to return the result of a call to `generateRegistrationOptions()`:

```ts
// (Pseudocode) Retrieve the user from the database
// after they've logged in
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Retrieve any of the user's previously-
// registered authenticators
const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

const options = generateRegistrationOptions({
  rpName,
  rpID,
  userID: user.id,
  userName: user.username,
  // Don't prompt users for additional information about the authenticator
  // (Recommended for smoother UX)
  attestationType: 'none',
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

These options can be passed directly into [**@simplewebauthn/browser**'s `startRegistration()`](packages/browser.mdx#startregistration) method.

:::tip Support for custom challenges

Power users can optionally generate and pass in their own unique challenges as `challenge` when calling `generateRegistrationOptions()`. In this scenario `options.challenge` still needs to be saved to be used in verification as described below.

:::

### 1a. Supported Attestation Formats

If `attestationType` is set to `"direct"` when generating registration options, the authenticator will return a more complex response containing an "attestation statement". This statement includes additional verifiable information about the authenticator.

Attestation statements are returned in one of several different formats. SimpleWebAuthn supports [all current WebAuthn attestation formats](https://w3c.github.io/webauthn/#sctn-defined-attestation-formats), including:

- **Packed**
- **TPM**
- **Android Key**
- **Android SafetyNet**
- **Apple**
- **FIDO U2F**
- **None**

:::info
Attestation statements are an advanced aspect of WebAuthn. You can ignore this concept if you're not particular about the kinds of authenticators your users can use for registration and authentication.
:::

### 2. Verify registration response

The second endpoint (`POST`) should accept the value returned by [**@simplewebauthn/browser**'s `startRegistration()`](packages/browser.mdx#startregistration) method and then verify it:

```ts
const { body } = req;

// (Pseudocode) Retrieve the logged-in user
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Get `options.challenge` that was saved above
const expectedChallenge: string = getUserCurrentChallenge(user);

let verification;
try {
  verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
} catch (error) {
  console.error(error);
  return res.status(400).send({ error: error.message });
}

const { verified } = verification;
```

:::tip Support for multiple origins and RP IDs
SimpleWebAuthn optionally supports verifying registrations from multiple origins and RP IDs! Simply pass in an **array** of possible origins and IDs for `expectedOrigin` and `expectedRPID` respectively.
:::

When finished, it's a good idea to return the verification status to the browser to display
appropriate UI:

```ts
return { verified };
```

### 3. Post-registration responsibilities

Assuming `verification.verified` is true then RP's must, at the very least, save the credential data in `registrationInfo` to the database:

```ts
const { registrationInfo } = verification;
const { credentialPublicKey, credentialID, counter } = registrationInfo;

const newAuthenticator: Authenticator = {
  credentialID,
  credentialPublicKey,
  counter,
};

// (Pseudocode) Save the authenticator info so that we can
// get it by user ID later
saveNewUserAuthenticatorInDB(user, newAuthenticator);
```

**Values:**

- `credentialID` (`bytes`): A unique identifier for the credential
- `credentialPublicKey` (`bytes`): The public key bytes, used for subsequent authentication signature verification
- `counter` (`number`): The number of times the authenticator has been used on this site so far

:::info Regarding `counter`
Tracking the ["signature counter"](https://www.w3.org/TR/webauthn/#signature-counter) allows Relying Parties to potentially identify misbehaving authenticators, or cloned authenticators. The counter on subsequent authentications should only ever increment; if your stored counter is greater than zero, and a subsequent authentication response's counter is the same or lower, then perhaps the authenticator just used to authenticate is in a compromised state.

It's also not unexpected for certain high profile authenticators, like Touch ID on macOS, to always return `0` (zero) for the signature counter. In this case there is nothing an RP can really do to detect a cloned authenticator, especially in the context of [multi-device credentials](https://fidoalliance.org/apple-google-and-microsoft-commit-to-expanded-support-for-fido-standard-to-accelerate-availability-of-passwordless-sign-ins/).

**@simplewebauthn/server** knows how to properly check the signature counter on subsequent authentications. RP's should only need to remember to store the value after registration, and then feed it back into `startAuthentication()` when the user attempts a subsequent login. RP's should remember to update the credential's counter value in the database afterwards. See [Post-authentication responsibilities](packages/server.md#3-post-authentication-responsibilities) below for how to do so.
:::

## Authentication

"Authentication" is analogous to existing account login. Authentication uses the following exported methods from this package:

```ts
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
```

Just like registration, authentication span two steps:

1. Generate authentication options for the browser to pass to a FIDO2 authenticator
2. Verify the authenticator's response

Each of these steps need their own API endpoints:

### 1. Generate authentication options

One endpoint (`GET`) needs to return the result of a call to `generateAuthenticationOptions()`:

```ts
// (Pseudocode) Retrieve the logged-in user
const user: UserModel = getUserFromDB(loggedInUserId);
// (Pseudocode) Retrieve any of the user's previously-
// registered authenticators
const userAuthenticators: Authenticator[] = getUserAuthenticators(user);

const options = generateAuthenticationOptions({
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

These options can be passed directly into [**@simplewebauthn/browser**'s `startAuthentication()`](packages/browser.mdx#startAuthentication) method.

:::tip Support for custom challenges

Power users can optionally generate and pass in their own unique challenges as `challenge` when calling `generateAuthenticationOptions()`. In this scenario `options.challenge` still needs to be saved to be used in verification as described below.

:::

### 2. Verify authentication response

The second endpoint (`POST`) should accept the value returned by [**@simplewebauthn/browser**'s `startAuthentication()`](packages/browser.mdx#startAuthentication) method and then verify it:

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
  verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator,
  });
} catch (error) {
  console.error(error);
  return res.status(400).send({ error: error.message });
}

const { verified } = verification;
```

When finished, it's a good idea to return the verification status to the browser to display
appropriate UI:

```ts
return { verified };
```

:::tip Support for multiple origins and RP IDs
SimpleWebAuthn optionally supports verifying authentications from multiple origins and RP IDs! Simply pass in an array of possible origins and IDs for `expectedOrigin` and `expectedRPID` respectively.
:::

### 3. Post-authentication responsibilities

Assuming `verification.verified` is true, then update the user's authenticator's `counter` property in the DB:

```ts
const { authenticationInfo } = verification;
const { newCounter } = authenticationInfo;

saveUpdatedAuthenticatorCounter(authenticator, newCounter);
```

## Advanced functionality

:::caution
**The following functionality is opt-in and is not required for typical use!** SimpleWebAuthn remains focused on simplifying working with the WebAuthn API, and the functionality covered so far will serve the majority of developers' use cases.

Some developers, though, may have more demanding requirements that require a higher degree of control over the types of  authenticators users may utilize when registering or authenticating. The features below enable such advanced uses of SimpleWebAuthn.
:::

## MetadataService

Metadata statements maintained by the FIDO Alliance can be referenced during registration to cross-reference additional information about authenticators used with SimpleWebAuthn. These statements contain cryptographically-signed "guarantees" about authenticators and what they are capable of, according to their manufacturer.

SimpleWebauthn includes support for the [FIDO Alliance Metadata Service (version 3.0)](https://fidoalliance.org/metadata/) API via its `MetadataService`:

```ts
import { MetadataService } from '@simplewebauthn/server';
```

This singleton service contains all of the logic necessary to interact with the MDS API, including signed data verification and automatic periodic refreshing of metadata statements.

:::info
Use of MetadataService is _not_ required to use @simplewebauthn/server! This is opt-in functionality that enables a more strict adherence to FIDO specifications and may not be appropriate for your use case.
:::

### `initialize()`

Simply call `initialize()` to enable `MetadataService` configured to use the official MDS API:

```js
import { MetadataService } from '@simplewebauthn/server';

MetadataService.initialize().then(() => {
  console.log('🔐 MetadataService initialized');
});
```

`MetadataService` can also be initialized with optional URLs to other MDS-compatible servers, any local metadata statements you may maintain, or both:

```js
import { MetadataService, MetadataStatement } from '@simplewebauthn/server';

const statements: MetadataStatement[] = [];

// Load in statements from JSON files
try {
  const mdsMetadataPath = './metadata-statements';
  const mdsMetadataFilenames = fs.readdirSync(mdsMetadataPath);
  for (const statementPath of mdsMetadataFilenames) {
    if (statementPath.endsWith('.json')) {
      const contents = fs.readFileSync(`${mdsMetadataPath}/${statementPath}`, 'utf-8');
      statements.push(JSON.parse(contents));
    }
  }
} catch (err) {
  // pass
}

MetadataService.initialize({
  mdsServers: ['https://mds-compatible-server.example.com'],
  statements: statements,
}).then(() => {
  console.log('🔐 MetadataService initialized');
});
```

Once `MetadataService` is initialized, `verifyRegistrationResponse()` will reference MDS metadata statements and error out if it receives authenticator responses with unexpected values.

:::caution
Make sure to set `attestationType` to `"direct"` when calling `generateRegistrationOptions()` to leverage the full power of metadata statements!
:::

## SettingsService

The `SettingsService` singleton offers various methods for customizing SimpleWebAuthn's functionality.

### `setRootCertificates()`

Some registration response attestation statements can be validated via root certificates prescribed by the company responsible for the format. It is possible to use `SettingsService` to register custom root certificates that will be used for validating certificate paths in subsequent registrations with matching attestation formats:

```ts
import { SettingsService } from '@simplewebauthn/server';

// A Buffer, or PEM-formatted certificate string
const appleCustomRootCert: Buffer | string = '...';
SettingsService.setRootCertificates({
  identifier: 'apple',
  certificates: [appleCustomRootCert],
});
```

The following values for `identifier` are supported:

```
"android-key" | "android-safetynet" | "apple" | "fido-u2f" | "packed" | "tpm" | "mds"
```

If root certificates have not been registered for an attestation statement format (or you set an empty array to one [e.g. `[]`]) then certificate path validation will not occur.

:::info
This method can come in handy when an attestation format requires use of a root certificate that SimpleWebAuthn has not yet been updated to use.
:::

SimpleWebAuthn includes known root certificates for the following such attestation formats:

- `"android-key"`
- `"android-safetynet"`
- `"apple"`
- `"mds"` (for use with `MetadataService` to validate MDS BLOBs)

### `getRootCertificates()`

This method returns existing root certificates for a specific identifier:

```js
import { SettingsService } from '@simplewebauthn/server';

const appleCerts: string[] = SettingsService.getRootCertificates({ identifier: 'apple' });
```

The returned certificates will be PEM-formatted strings;

## Additional API Documentation

Lower-level API docs for this package are available here:

https://api-docs.simplewebauthn.dev/modules/_simplewebauthn_server.html
