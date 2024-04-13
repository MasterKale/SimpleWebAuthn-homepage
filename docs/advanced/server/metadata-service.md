---
title: Metadata Service
---

:::caution
**The following functionality is opt-in and is not required for typical use!** SimpleWebAuthn remains focused on simplifying working with the WebAuthn API, and the functionality covered in [Packages &gt; @simplewebauthn/server](packages/server.md) will serve the majority of developers' use cases.
:::

## Introduction

Metadata statements maintained by the FIDO Alliance can be referenced during registration to cross-reference additional information about authenticators used with SimpleWebAuthn. These statements contain cryptographically-signed "guarantees" about authenticators and what they are capable of, according to their manufacturer.

**@simplewebauthn/server** includes support for the [FIDO Alliance Metadata Service (version 3.0)](https://fidoalliance.org/metadata/) API via its `MetadataService`:

```ts
import { MetadataService } from '@simplewebauthn/server';
```

This singleton service contains all of the logic necessary to interact with the MDS API, including signed data verification and automatic periodic refreshing of metadata statements.

:::info
Use of MetadataService is _not_ required to use @simplewebauthn/server! This is opt-in functionality that enables a more strict adherence to FIDO specifications and may not be appropriate for your use case.
:::

## `initialize()`

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
