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

## `verifyMDSBlob()`

Some projects that wish to use `MetadataService` may have restrictions preventing runtime network requests to FIDO MDS for fresh data. In these cases it becomes necessary to pull down the MDS data (a "blob" in MDS parlance), verify its integrity, then cache the metadata statements within for loading later as the `statements` argument when `MetadataService` is initialized.

To support these projects, the `verifyMDSBlob()` helper can be used to verify the integrity of an MDS blob and then extract its contents. These contents can then be cached and loaded into `MetadataService` without making any subsequent MDS-related network calls:

### 1. Manually cache MDS data

Use `verifyMDSBlob()` in a runtime that **can** make external network requests:

```ts
import { verifyMDSBlob } from '@simplewebauthn/server/helpers';

// A JWT downloaded from an MDS server (e.g. https://mds3.fidoalliance.org)
const blob: string = manuallyFetchMDSBlob();

// Network requests will be made here for things like CRL checks
const { statements, parsedNextUpdate, payload } = await verifyMDSBlob(blob);

// Store the array of JSON objects in whatever way is appropriate
await writeStatementsToDisk(statements);
```

`parsedNextUpdate` is a parsed `Date` instance of the **YYYY-MM-DD**-formatted `nextUpdate` string in the MDS blob payload. You should use this to remind yourself to check for a new version of MDS data after that date.

`payload` is the raw [MDS blob payload](https://fidoalliance.org/specs/mds/fido-metadata-service-v3.1-ps-20250521.html#sctn-mds-payload-blob). This _may_ be useful to certain projects wanting to e.g. further filter the FIDO2 metadata statements by some arbitrary business logic.

### 2. Load cached data

Load the cached statements into `MetadataService` that is running in a runtime that **cannot** make external network requests:

```ts
import { MetadataService } from '@simplewebauthn/server';

// Read the stored array of JSON objects in whatever way is appropriate
const savedStatements = await readStatementsFromDisk();

// No network requests nor validation happen here because the statements
// are assumed trusted
await MetadataService.initialize({
  // Do not query any MDS servers
  mdsServers: [],
  // Load the cached statements
  statements: savedStatements,
});
```
