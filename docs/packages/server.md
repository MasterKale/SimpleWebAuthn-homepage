---
title: "@simplewebauthn/server"
---

import useBaseUrl from '@docusaurus/useBaseUrl';

## Current version

The content below should be accurate for **@simplewebauthn/server@^13.0.0**. Please open an issue [here](https://github.com/MasterKale/SimpleWebAuthn-homepage/issues) to report any inaccuracies.

## Installation

This package can be installed from **[NPM](https://www.npmjs.com/package/@simplewebauthn/server)**
and **[JSR](https://jsr.io/@simplewebauthn/server)**:

### Node LTS 20.x and higher

```sh
npm install @simplewebauthn/server
```

### Deno v1.43 and higher

```sh
deno add jsr:@simplewebauthn/server
```

## Types

This package exports almost all of its types for TypeScript projects to import. For example:

```ts
import type { WebAuthnCredential } from '@simplewebauthn/server';
// -or-
import { ..., type WebAuthnCredential } from '@simplewebauthn/server';
```

See the [auto-generated API docs for this project on JSR](https://jsr.io/@simplewebauthn/server/doc) for a comprehensive list of available imports.

## Additional data structures

Documentation below will refer to the following TypeScript types. These are intended to be inspirational, a simple means of communicating the shape of the values you'll need to be capable of persisting in your database:

```ts
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  Base64URLString,
} from '@simplewebauthn/server';

type UserModel = {
  id: any;
  username: string;
};

/**
 * It is strongly advised that credentials get their own DB
 * table, ideally with a foreign key somewhere connecting it
 * to a specific UserModel.
 *
 * "SQL" tags below are suggestions for column data types and
 * how best to store data received during registration for use
 * in subsequent authentications.
 */
type Passkey = {
  // SQL: Store as `TEXT`. Index this column
  id: Base64URLString;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  //      Caution: Node ORM's may map this to a Buffer on retrieval,
  //      convert to Uint8Array as necessary
  publicKey: Uint8Array;
  // SQL: Foreign Key to an instance of your internal user model
  user: UserModel;
  // SQL: Store as `TEXT`. Index this column. A UNIQUE constraint on
  //      (webAuthnUserID + user) also achieves maximum user privacy
  webauthnUserID: Base64URLString;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  deviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  backedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb']
  transports?: AuthenticatorTransportFuture[];
};
```

Below is a sample database schema showing how a **passkeys** table can track WebAuthn-specific user IDs while still allowing use of typical internal database user IDs through the rest of the site ([click here for an interactive version of the schema](https://dbdiagram.io/d/SimpleWebAuthn-Example-DB-Schema-661a046303593b6b61e34628)):

<img alt="FIDO2 Metadata download button" src={useBaseUrl('img/docs/packages/server-sample-db-schema.png')} />

Keep this table structure in mind as you proceed through the following sections.

## Identifying your RP

Start by defining some constants that describe your "Relying Party" (RP) server to authenticators:

```js
/**
 * Human-readable title for your website
 */
const rpName = 'SimpleWebAuthn Example';
/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const rpID = 'simplewebauthn.dev';
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const origin = `https://${rpID}`;
```

These will be referenced throughout registrations and authentications to ensure that authenticators generate and return credentials specifically for your server.

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
const userPasskeys: Passkey[] = getUserPasskeys(user);

const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
  rpName,
  rpID,
  userName: user.username,
  // Don't prompt users for additional information about the authenticator
  // (Recommended for smoother UX)
  attestationType: 'none',
  // Prevent users from re-registering existing authenticators
  excludeCredentials: userPasskeys.map(passkey => ({
    id: passkey.id,
    // Optional
    transports: passkey.transports,
  })),
  // See "Guiding use of authenticators via authenticatorSelection" below
  authenticatorSelection: {
    // Defaults
    residentKey: 'preferred',
    userVerification: 'preferred',
    // Optional
    authenticatorAttachment: 'platform',
  },
});

// (Pseudocode) Remember these options for the user
setCurrentRegistrationOptions(user, options);

return options;
```

These options can be passed directly into [**@simplewebauthn/browser**'s `startRegistration()`](packages/browser.mdx#startregistration) method.

#### Guiding use of authenticators via `authenticatorSelection`

`generateRegistrationOptions()` also accepts an `authenticatorSelection` option that can be used to fine-tune the registration experience. When unspecified, defaults are provided according to [passkeys best practices](advanced/passkeys.md#generateregistrationoptions). These values can be overridden based on Relying Party needs, however:

**`authenticatorSelection.residentKey`**:

- `'discouraged'`
  - Won't consume discoverable credential slots on security keys, but also won't generate synced passkeys on Android devices.
- `'preferred'`
  - Will always generate synced passkeys on Android devices, but will consume discoverable credential slots on security keys.
- `'required'`
  - Same as `'preferred'`

**`authenticatorSelection.userVerification`:**

- `'discouraged'`
  - Won't perform user verification if interacting with an authenticator won't automatically perform it (i.e. security keys won't prompt for PIN, but interacting with Touch ID on a macOS device will always perform user verification.) User verification will usually be `false`.
- `'preferred'`
  - Will perform user verification when possible, but will skip any prompts for PIN or local login password when possible. In these instances user verification can sometimes be `false`.
- `'required'`
  - Will always provides multi-factor authentication, at the expense of always requiring some users to enter their local login password during auth. User verification should never be `false`.

**`authenticatorSelection.authenticatorAttachment`:**

- `'cross-platform'`
  - Browsers will guide users towards registering a security key, or mobile device via hybrid registration.
- `'platform'`
  - Browser will guide users to registering the locally integrated hardware authenticator.

#### Fine-tuning the registration experience with `preferredAuthenticatorType`

[WebAuthn hints](https://w3c.github.io/webauthn/#dom-publickeycredentialrequestoptions-hints) allow a Relying Party to further refine the registration experience compared to specifying a value for `authenticatorSelection.authenticatorAttachment` as detailed above. SimpleWebAuthn enables use of hints via the `preferredAuthenticatorType` argument that can be passed into `generateRegistrationOptions()`:

**`preferredAuthenticatorType`:**

- `'securityKey'`
  - A security key, like a [YubiKey 5](https://www.yubico.com/products/yubikey-5-overview/), [Feitian K40](https://www.ftsafe.com/Products/FIDO/NFC), and other such FIDO2-compatible USB tokens
- `'localDevice'`
  - Typically the platform authenticator available on the device that they are logging in from
- `'remoteDevice'`
  - A platform authenticator with access to a valid passkey but that is **not** on the device the user is logging in from (a.k.a. "hybrid auth" a.k.a. "the one that shows a QR code")

When this value is specified, browsers that support hints will try to tailor their experience to encourage registration of an authenticator of the specified type. **Hints are a suggestion**, though, and browsers will often allow a user to ultimately choose a different type of authenticator to register. RPs should be prepared for this possibility when using this.

:::important
Setting a value for `preferredAuthenticatorType` will overwrite any value that may have been specified for `authenticatorSelection.authenticatorAttachment`! This is to help maintain backwards compatibility with browsers that may not yet know about hints.
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
const currentOptions: PublicKeyCredentialCreationOptionsJSON =
  getCurrentRegistrationOptions(user);

let verification;
try {
  verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: currentOptions.challenge,
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
const {
  credential,
  credentialDeviceType,
  credentialBackedUp,
} = registrationInfo;

const newPasskey: Passkey = {
  // `user` here is from Step 2
  user,
  // Created by `generateRegistrationOptions()` in Step 1
  webAuthnUserID: currentOptions.user.id,
  // A unique identifier for the credential
  id: credential.id,
  // The public key bytes, used for subsequent authentication signature verification
  publicKey: credential.publicKey,
  // The number of times the authenticator has been used on this site so far
  counter: credential.counter,
  // How the browser can talk with this credential's authenticator
  transports: credential.transports,
  // Whether the passkey is single-device or multi-device
  deviceType: credentialDeviceType,
  // Whether the passkey has been backed up in some way
  backedUp: credentialBackedUp,
};

// (Pseudocode) Save the authenticator info so that we can
// get it by user ID later
saveNewPasskeyInDB(newPasskey);
```

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
const userPasskeys: Passkey[] = getUserPasskeys(user);

const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
  rpID,
  // Require users to use a previously-registered authenticator
  allowCredentials: userPasskeys.map(passkey => ({
    id: passkey.id,
    transports: passkey.transports,
  })),
});

// (Pseudocode) Remember this challenge for this user
setCurrentAuthenticationOptions(user, options);

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
const currentOptions: PublicKeyCredentialRequestOptionsJSON =
  getCurrentAuthenticationOptions(user);
// (Pseudocode} Retrieve a passkey from the DB that
// should match the `id` in the returned credential
const passkey: Passkey = getUserPasskey(user, body.id);

if (!passkey) {
  throw new Error(`Could not find passkey ${body.id} for user ${user.id}`);
}

let verification;
try {
  verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: currentOptions.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.id,
      publicKey: passkey.publicKey,
      counter: passkey.counter,
      transports: passkey.transports,
    },
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

saveUpdatedCounter(passkey, newCounter);
```

## Troubleshooting

Below are errors you may see while using this library, and potential solutions to them:

### DOMException [NotSupportedError]: Unrecognized name.

Authentication responses may unexpectedly error out during verification. This appears as the throwing of an "Unrecognized name" error from a call to `verifyAuthenticationResponse()` with the following stack trace:

```
DOMException [NotSupportedError]: Unrecognized name.
    at new DOMException (node:internal/per_context/domexception:70:5)
    at __node_internal_ (node:internal/util:477:10)
    at normalizeAlgorithm (node:internal/crypto/util:220:15)
    at SubtleCrypto.importKey (node:internal/crypto/webcrypto:503:15)
    at importKey (/Users/swan/Developer/simplewebauthn/packages/server/src/helpers/iso/isoCrypto/importKey.ts:9:27)
    at verifyOKP (/Users/swan/Developer/simplewebauthn/packages/server/src/helpers/iso/isoCrypto/verifyOKP.ts:57:30)
    at Object.verify (/Users/swan/Developer/simplewebauthn/packages/server/src/helpers/iso/isoCrypto/verify.ts:31:21)
    at verifySignature (/Users/swan/Developer/simplewebauthn/packages/server/src/helpers/verifySignature.ts:34:20)
    at verifyAuthenticationResponse (/Users/swan/Developer/simplewebauthn/packages/server/src/authentication/verifyAuthenticationResponse.ts:206:36)
    at async /Users/swan/Developer/simplewebauthn/packages/server/345.ts:26:24
```

This appears to be an issue with some environments running **versions of Node prior to v18 LTS**.

To fix this, update your call to `generateRegistrationOptions()` to exclude `-8` (Ed25519) from the list of algorithms:

```ts
const options = await generateRegistrationOptions({
  // ...
  supportedAlgorithmIDs: [-7, -257],
});
```

You will then need to re-register any authenticators that generated credentials that cause this error.

### Error: Signature verification with public key of kty OKP is not supported by this method

Authentication responses may unexpectedly error out during verification. This appears as the throwing of a "Signature verification with public key of kty OKP is not supported" error from a call to `verifyAuthenticationResponse()` with the following stack trace:

```
Error: Signature verification with public key of kty OKP is not supported by this method
    at Object.verify (/xxx/node_modules/@simplewebauthn/server/script/helpers/iso/isoCrypto/verify.js:30:11)
    at verifySignature (/xxx/node_modules/@simplewebauthn/server/script/helpers/verifySignature.js:25:76)
    at verifyAuthenticationResponse (/xxx/node_modules/@simplewebauthn/server/script/authentication/verifyAuthenticationResponse.js:162:66)
```

This is caused by **security key responses in Firefox 118 and earlier being incorrectly composed by the browser** when the security key uses **Ed25519** for its credential keypair.

To fix this, update your call to `generateRegistrationOptions()` to exclude `-8` (Ed25519) from the list of algorithms:

```ts
const options = await generateRegistrationOptions({
  // ...
  supportedAlgorithmIDs: [-7, -257],
});
```

You will then need to re-register any authenticators that generated credentials that cause this error.

### ERROR extractStrings is not a function

Registration responses may unexpectedly error out during verification. This appears as the throwing of an "extractStrings is not a function" error from a call to `verifyRegistrationResponse()` with the following stack trace:

```
ERROR  extractStrings is not a function
    at readString (/node_modules/.pnpm/cbor-x@1.5.6/node_modules/cbor-x/dist/node.cjs:520:1)
    at read (/node_modules/.pnpm/cbor-x@1.5.6/node_modules/cbor-x/dist/node.cjs:343:1)
    at read (/node_modules/.pnpm/cbor-x@1.5.6/node_modules/cbor-x/dist/node.cjs:363:1)
    at checkedRead (/node_modules/.pnpm/cbor-x@1.5.6/node_modules/cbor-x/dist/node.cjs:202:1)
    at Encoder.decode (/node_modules/.pnpm/cbor-x@1.5.6/node_modules/cbor-x/dist/node.cjs:153:1)
    at Encoder.decodeMultiple (/node_modules/.pnpm/cbor-x@1.5.6/node_modules/cbor-x/dist/node.cjs:170:1)
    at Object.decodeFirst (/node_modules/.pnpm/@simplewebauthn+server@8.3.5/node_modules/@simplewebauthn/server/script/helpers/iso/isoCBOR.js:30:1)
    at decodeAttestationObject (/node_modules/.pnpm/@simplewebauthn+server@8.3.5/node_modules/@simplewebauthn/server/script/helpers/decodeAttestationObject.js:12:1)
    at verifyRegistrationResponse (/node_modules/.pnpm/@simplewebauthn+server@8.3.5/node_modules/@simplewebauthn/server/script/registration/verifyRegistrationResponse.js:100:1)
    at AuthnService.verifyRegistrationResponse (/home/deploy/mx/modules/authn/authn.service.js:89:1)
```

This is caused by the `@vercel/ncc` dependency not supporting runtime use of `require()` within other third-party packages used by the project, like **@simplewebauthn/server**'s use of **cbor-x**.

To fix this, add `CBOR_NATIVE_ACCELERATION_DISABLED=true` in your project's env file to disable the use of `require()` in **cbor-x**.

**Alternatively**, the following can be added to your project to inject this value into your project's runtime environment:

```js
function nodeEnvInjection() {
  /**
   * `@vercel/ncc` does not support the use of `require()` so disable its
   * use in the `@simplewebauthn/server` dependency called `cbor-x`.
   *
   * https://github.com/kriszyp/cbor-x/blob/master/node-index.js#L10
   */
  process.env['CBOR_NATIVE_ACCELERATION_DISABLED'] = 'true';
}

// Call this at the start of the project, before any imports
nodeEnvInjection()
```

### Error: No data

Calls to `verifyAuthenticationResponse()` may unexpectedly error out with `Error: No data` in projects that store credential public keys as `Binary` data types in [MongoDB](https://www.mongodb.com):

```
Error: No data
    at Module.decodePartialCBOR (file:///path/to/app/node_modules/@levischuck/tiny-cbor/esm/cbor/cbor.js:351:15)
    at Module.decodeFirst (file:///path/to/app/node_modules/@simplewebauthn/server/esm/helpers/iso/isoCBOR.js:22:30)
    at decodeCredentialPublicKey (file:///path/to/app/node_modules/@simplewebauthn/server/esm/helpers/decodeCredentialPublicKey.js:3:65)
    at verifySignature (file:///path/to/app/node_modules/@simplewebauthn/server/esm/helpers/verifySignature.js:17:25)
    at verifyAuthenticationResponse (file:///path/to/app/node_modules/@simplewebauthn/server/esm/authentication/verifyAuthenticationResponse.js:154:25)
    at async file:///path/to/app/dist/controller/auth.controller.js:202:28
```

To fix this, massage the `Binary` public key bytes into an instance of `Uint8Array` that `verifyAuthenticationResponse()` expects:

```js
const verification = await verifyAuthenticationResponse({
  // ...
  authenticator: {
    // ...
    credentialPublicKey: new Uint8Array(credentialPublicKey.buffer),
  },
});
```

### Error: String values for \`userID\` are no longer supported

See [Advanced Guides > @simplewebauthn/server > Custom User IDs](advanced/server/custom-user-ids.md#error-string-values-for-userid-are-no-longer-supported) for more information.
