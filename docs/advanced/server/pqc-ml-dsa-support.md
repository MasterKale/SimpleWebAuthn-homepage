---
title: PQC ML-DSA Support
---

## Introduction

**Post-Quantum Cryptography (PQC)** algorithms are new cryptographic standards designed to protect digital communications against future quantum computers. WebAuthn implementations today rely on "classical" signature algorithms like ES256 and RS256, which quantum computers will eventually become capable of breaking by quickly deriving a private key from its public key to forge passkey authentication responses.

Migrating users from classical passkeys to ones that leverage the PQC **ML-DSA** signature algorithm ensures long-term protection against these kinds of attacks. Relying Parties that wish to transition their users to ML-DSA passkeys can follow the steps below to begin requesting and verifying such passkeys in supported runtimes.

## Supported Runtimes

PQC algorithm support is available in the following runtimes targeted by SimpleWebAuthn:

- **Node:** v24.7.0 and up
- **Deno:** v2.8.2 and up

If support for ML-DSA is not available in the runtime, the library will identify this in the error that is raised:

```
Error: This runtime's WebCrypto.subtle does not support use of
ML-DSA-44. See the `cause` property of this error for more info
      throw new Error(
            ^
    at verifyAKP (...)
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async verifyAuthenticationResponse (...)
    at async ...
Caused by: NotSupportedError: Unrecognized algorithm name
    at normalizeAlgorithm (ext:deno_crypto/00_crypto.js:269:11)
    at normalizeAlgorithm (ext:deno_crypto/00_crypto.js:241:12)
    at SubtleCrypto.importKey (ext:deno_crypto/00_crypto.js:975:33)
    at importJWKKey (...)
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async verifyAKP (...)
    at async verifyAuthenticationResponse (...)
    at async ...
```

## Requesting ML-DSA passkeys

To request registration of ML-DSA passkeys, first define an array of [COSE algorithm IDs](https://www.iana.org/assignments/cose#algorithms) sorted from most preferred to least preferred. For ease of use, the `COSEALG` enum exported from `@simplewebauthn/server/helpers` contains many common algorithm IDs in a more readable format than their numeric values:

```ts
import { COSEALG } from '@simplewebauthn/server/helpers';

const supportedPublicKeyAlgorithms: number[] = [
  COSEALG.ML_DSA_87,
  COSEALG.ML_DSA_65,
  COSEALG.ML_DSA_44,
  COSEALG.EdDSA,
  COSEALG.ES256,
  COSEALG.RS256,
];
```

Next, pass this list of algorithm IDs into [`generateRegistrationOptions()`](packages/server.md#1-generate-registration-options) as the `supportedAlgorithmIDs` argument:

```ts
import { generateRegistrationOptions } from '@simplewebauthn/server';

const options = await generateRegistrationOptions({
  // ...
  supportedAlgorithmIDs: supportedPublicKeyAlgorithms,
});
```

Also pass this list into [`verifyRegistrationResponse()`](packages/server.md#2-verify-registration-response) as the `supportedAlgorithmIDs` argument so WebAuthn responses containing ML-DSA passkeys won't be rejected for containing a passkey public key that isn't using one of the default algorithms:

```ts
import { verifyRegistrationResponse } from '@simplewebauthn/server';

const options = await verifyRegistrationResponse({
  // ...
  supportedAlgorithmIDs: supportedPublicKeyAlgorithms,
});
```

Once the registration is verified, store the passkey as usual.

:::warning
ML-DSA public keys are many times larger than common ECDSA P-256 (aka "ES256"/`-7`) public keys:

|  Algorithm  | Public Key | vs ECDSA P-256 |
| ----------- |------------|----------------|
| ECDSA P-256 |    64 B    |       -        | 
|  ML-DSA-44  |   1,312 B  |     20.5x      |
|  ML-DSA-65  |   1,952 B  |     30.5x      |
|  ML-DSA-87  |   2,592 B  |     40.5x      |

Before requesting ML-DSA passkeys, **ensure your `Passkeys` database table is using the right data type for its `publicKey` column**. See [Packages > @simplewebauthn/server > Additional data structures](packages/server.md#additional-data-structures) for guidance on suitable column data types.
:::
