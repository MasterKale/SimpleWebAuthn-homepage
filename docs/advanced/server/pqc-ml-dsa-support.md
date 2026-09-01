---
title: PQC ML-DSA Support
---

## Introduction

**Post-Quantum Cryptography (PQC)** algorithms are new cryptographic standards designed to protect digital communications against future quantum computers. WebAuthn implementations today rely on "classical" signature algorithms like ES256 and RS256, which quantum computers will eventually become capable of breaking by deriving a private key from its public key to forge passkey authentication responses.

Migrating users from classical passkeys to ones that leverage the PQC **ML-DSA** signature algorithm ensures long-term protection against these kinds of attacks. Relying Parties that wish to transition their users to ML-DSA passkeys can follow the steps below to begin requesting and verifying such passkeys in supported runtimes.

## Supported Runtimes

PQC algorithm support is available in the following runtimes targeted by SimpleWebAuthn:

- **Node:** v24.7.0 and up
- **Deno:** v2.8.2 and up

## Requesting ML-DSA passkeys

When the runtime supports ML-DSA-44 for signature verification, [`generateRegistrationOptions()`](packages/server.md#1-generate-registration-options) will **automatically include ML-DSA-44** as the most preferred algorithm in the default list of [passkey public key credential algorithms](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-pubkeycredparams). Note that this behavior will **not** overwrite the value of `supportedAlgorithmIDs` if it is set when calling `generateRegistrationOptions()`.

:::tip[Detecting runtime ML-DSA support]
It's not required, but [`SettingsService.runtimeSupportsPQC()`](advanced/server/settings-service.md#runtimesupportspqc) can be called manually at any time to check if the runtime supports use of ML-DSA algorithms. It's the same method that `generateRegistrationOptions()` uses to determine when to include ML-DSA-44 as a default algorithm.
:::

To request the use of other PQC algorithms, like ML-DSA-65 and/or ML-DSA-87, first define an array of [COSE algorithm IDs](https://www.iana.org/assignments/cose#algorithms) sorted from most preferred to least preferred. For ease of use, the `COSEALG` enum exported from `@simplewebauthn/server/helpers` contains many common algorithm IDs in a more readable format than their numeric values:

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

Next, pass this list of algorithm IDs into `generateRegistrationOptions()` as the `supportedAlgorithmIDs` argument:

```ts
import { generateRegistrationOptions } from '@simplewebauthn/server';

const options = await generateRegistrationOptions({
  // ...
  supportedAlgorithmIDs: supportedPublicKeyAlgorithms,
});
```

Also pass this list into [`verifyRegistrationResponse()`](packages/server.md#2-verify-registration-response) as its own `supportedAlgorithmIDs` argument so WebAuthn responses containing ML-DSA passkeys won't be rejected for containing a passkey public key that isn't using one of the default algorithms:

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
