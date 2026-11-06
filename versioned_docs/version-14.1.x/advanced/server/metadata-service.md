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

### Logging

The `logger` argument can be populated when calling `initialize()` to capture status output emitted by `MetadataService` in a project-specific way. This involves creating a logger that matches the `SimpleWebAuthnLogger` interface:

```ts
import { MetadataService } from '@simplewebauthn/server';
import { type SimpleWebAuthnLogger } from '@simplewebauthn/server/helpers';

// A custom logger in its simplest form
const logger: SimpleWebAuthnLogger = {
  debug: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error,
};

MetadataService.initialize({ logger }).then(() => {
  console.log('🔐 MetadataService initialized');
});
```

Each of the log levels is of type `(message: string, ...args: unknown[]) => void` so any function that matches this call signature can be used. If logging is captured via a third-party SaaS API, for example, a custom `debug` handler could look something like this:

```ts
function handleLogDebug(message: string, ...args: unknown[]): void {
  CustomLoggingSDK.log('DEBUG', message, ...args);
}

const logger: SimpleWebAuthnLogger = {
  debug: handleLogDebug,
}
```

:::tip[Partially defining your logger]
`SimpleWebAuthnLogger` does not require every logging level to be defined! If it only makes sense in your project to log Debug- and Error-level messages then only define handlers for `debug` and `error`.
:::

`MetadataService` logging output during initialization will generally look like this:

```
MetadataService is REFRESHING
Cached 100 statements from 1 metadata server(s)
MetadataService is READY
```

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

## Convenience Metadata Service

The FIDO Alliance also offers a **Convenience Metadata Service**. This API offers a streamlined subset of values from entries found in the larger Metadata Service. These values, like localized passkey provider names, and light and dark iconography, can be used by Relying Parties to assign useful nicknames to users' newly registered passkeys and to show meaningful passkey provider brand icons in passkey management UI.

**@simplewebauthn/server** includes support for the [FIDO Alliance Convenience Metadata Service](https://fidoalliance.org/metadata/) API via its `ConvenienceMetadataService`:

```ts
import { ConvenienceMetadataService } from '@simplewebauthn/server';
```
```ts
await ConvenienceMetadataService.initialize();
```

`ConvenienceMetadataService` also includes optional support for specifying server URLs via `mdsServers`, loading locally cached data via `payloads`, and enabling logging via `logger` (see [Logging](#logging) above). For example, here's how to use the service with only a locally-loaded payload and logging:

```ts
await ConvenienceMetadataService.initialize({
  // An empty array here prevents any network traffic during initialization
  mdsServers: [],
  // Pass in JSON document(s) loaded from the local filesystem
  payloads: [{ /* ... */ }],
  // Set up some logging that's specific to your deployment
  logging: {
    debug: console.log,
    info: console.log,
    warn: console.warn,
    error: console.error,
  },
});
```

:::warning
Nothing provided by the FIDO Convenience Metadata Service is cryptographically verifiable by design. **Therefore values provided by `ConvenienceMetadataService` cannot be used to assert any security properties of a registered passkey!** This service must only be used to display nicer UI to users.
:::

When `ConvenienceMetadataService` is initialized, calls to `verifyRegistrationResponse()` will include convenience metadata assuming the AAGUID returned in the response has been registered with the FIDO Convenience Metadata Service:

```ts
import { ConvenienceMetadataService, verifyRegistrationResponse } from '@simplewebauthn/server';

await ConvenienceMetadataService.initialize();

const verified = await verifyRegistrationResponse({ /* ... */ });

const { aaguid, passkeyProviderMetadata } = verified.registrationInfo;

console.log(aaguid);
// "531126d6-e717-415c-9320-3d9aa6981239"
console.log(passkeyProviderMetadata);
// {
//   "friendlyNames": {
//     "en-US": "Dashlane"
//   },
//   "icon": "data:image/svg+xml;base64,...",
//   "iconDark": "data:image/svg+xml;base64,...",
//   "providerLogoLight": "data:image/svg+xml;base64,...",
//   "providerLogoDark": "data:image/svg+xml;base64,..."
// }
```

`ConvenienceMetadataService.getProviderMetadata()` can also be called at any time to get this same information for a given AAGUID:

```ts
const passkeyProviderMetadata = await ConvenienceMetadataService.passkeyProviderMetadata(
  "531126d6-e717-415c-9320-3d9aa6981239",
);
console.log(passkeyProviderMetadata);
// {
//   "friendlyNames": {
//     "en-US": "Dashlane"
//   },
//   "icon": "data:image/svg+xml;base64,...",
//   "iconDark": "data:image/svg+xml;base64,...",
//   "providerLogoLight": "data:image/svg+xml;base64,...",
//   "providerLogoDark": "data:image/svg+xml;base64,..."
// }
```

:::tip
`getProviderMetadata()` has also been added to `MetadataService`! It is **not** necessary to initialize `ConvenienceMetadataService` to use `MetadataService.getProviderMetadata()` for those projects already using `MetadataService`.
:::

Calls to `getProviderMetadata()` will also automatically refresh data from the Convenience Metadata Service. `ConvenienceMetadataService` will attempt to refresh metadata every 24 hours. If an error occurs while refreshing data, `ConvenienceMetadataService` will wait three hours before trying again.

### Rendering names

`passkeyProviderMetadata.friendlyNames["en-US"]` will always be present. Other localized provider names may be present by [IETF language code [RFC5646]](https://www.rfc-editor.org/info/rfc5646/). Simply use these strings wherever it makes sense in your UI to help users remember where their passkey can be found.

### Rendering icons

Four possible icon values may be provided. It is recommended to utilize them in the following order when they are present:

1. `icon` (for light mode UI)
2. `iconDark` (for dark mode UI)
3. `providerLogoLight` (for light mode UI)
4. `providerLogoDark` (for dark mode UI)

If `icon` is present but `iconDark` is not, use `icon` for both light mode UI and dark mode UI. It is not uncommon for entries to only include values for `providerLogoLight` and `providerLogoDark`.

All icons are provided as base64-encoded `data:` URLs containing SVG data:

```js
"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlPkRhc2hsYW5lPC90aXRsZT4KPHBhdGggZD0iTTI1Ny40NzQgMzU5LjIwOUMyNTcuNDc0IDM1Ni4xODkgMjU0LjQ1NCAzNTMuMTY5IDI1MC4yMTUgMzUxLjk1OUwxOTkuNDExIDMzMy4yMzFDMTkwLjg5NSAzMjkuNjAxIDE4MS4yNjQgMzMzLjgzMSAxODEuMjY0IDMzOS44OVY0NzUuNzc5QzE4MS4yNjQgNDc4LjgwOSAxODQuMjgzIDQ4Mi40MzggMTg3LjMwMyA0ODMuNjQ4TDIzOS4zMjYgNTAyLjM3NkMyNDcuMTk1IDUwNS4zOTYgMjU3LjQ3NCA1MDEuMTY2IDI1Ny40NzQgNDk0LjUwOFYzNTkuMjA5WiIgZmlsbD0iIzA5MzYzRiIvPgo8cGF0aCBkPSJNMzUyLjczNiAzMjEuMTAzQzM1Mi43MzYgMzE4LjA4NCAzNDkuNzE3IDMxNS4wNjQgMzQ1LjQ3NyAzMTMuODU0TDI5NC42NzQgMjk1LjEyNkMyODYuMTU3IDI5MS40OTYgMjc2LjUyNiAyOTUuNzI2IDI3Ni41MjYgMzAxLjc4NVY0MzcuNjc0QzI3Ni41MjYgNDQwLjcwNCAyNzkuNTQ2IDQ0NC4zMzMgMjgyLjU2NiA0NDUuNTQzTDMzNC41ODkgNDY0LjI3MUMzNDIuNDU4IDQ2Ny4yOTEgMzUyLjczNiA0NjMuMDYxIDM1Mi43MzYgNDU2LjQwM1YzMjEuMTAzWiIgZmlsbD0iIzA5MzYzRiIvPgo8cGF0aCBkPSJNMjU3LjQ3NCAzNS4zMjExQzI1Ny40NzQgMzIuMzAxMyAyNTQuNDU0IDI5LjI4MTUgMjUwLjIxNSAyOC4wNzE3TDE5OS40MTEgOS4zNDM0M0MxOTAuODk1IDUuNzEzOTkgMTgxLjI2NCA5Ljk0MzU4IDE4MS4yNjQgMTYuMDAyMlYxNTEuODkyQzE4MS4yNjQgMTU0LjkyMSAxODQuMjgzIDE1OC41NTEgMTg3LjMwMyAxNTkuNzZMMjM5LjMyNiAxNzguNDg5QzI0Ny4xOTUgMTgxLjUwOCAyNTcuNDc0IDE3Ny4yNzkgMjU3LjQ3NCAxNzAuNjJWMzUuMzIxMVoiIGZpbGw9IiMwOTM2M0YiLz4KPHBhdGggZD0iTTM1Mi43MzYgOTIuNDc3N0MzNTIuNzM2IDg5LjQ1NzkgMzQ5LjcxNyA4Ni40MzgyIDM0NS40NzcgODUuMjI4M0wyOTQuNjc0IDY2LjVDMjg2LjE1NyA2Mi44NzA2IDI3Ni41MjYgNjcuMTAwMiAyNzYuNTI2IDczLjE1ODhWMjA5LjA0OEMyNzYuNTI2IDIxMi4wNzggMjc5LjU0NiAyMTUuNzA3IDI4Mi41NjYgMjE2LjkxN0wzMzQuNTg5IDIzNS42NDVDMzQyLjQ1OCAyMzguNjY1IDM1Mi43MzYgMjM0LjQzNiAzNTIuNzM2IDIyNy43NzdWOTIuNDc3N1oiIGZpbGw9IiMwOTM2M0YiLz4KPHBhdGggZD0iTTQ0OCAxNjguNjg3QzQ0OCAxNjUuNjY3IDQ0NC45OCAxNjIuNjQ3IDQ0MC43NDEgMTYxLjQzN0wzODkuOTM3IDE0Mi43MDlDMzgxLjQyMSAxMzkuMDc5IDM3MS43OSAxNDMuMzA5IDM3MS43OSAxNDkuMzY4VjM2MS40NjZDMzcxLjc5IDM2NC40OTUgMzc0LjgxIDM2OC4xMjUgMzc3LjgyOSAzNjkuMzM1TDQyOS44NTIgMzg4LjA2M0M0MzcuNzIxIDM5MS4wODMgNDQ4IDM4Ni44NTMgNDQ4IDM4MC4xOTRWMTY4LjY4N1oiIGZpbGw9IiMwOTM2M0YiLz4KPHBhdGggZD0iTTE2Mi4yMSAzNS4zMzA2QzE2Mi4yMSAzMi4zMTA4IDE1OS4xOSAyOS4yODE1IDE1NC45NTEgMjguMDcxN0wxMDQuMTQ4IDkuMzQzNDNDOTUuNjc4NyA1LjcxMzk5IDg2IDkuOTQzNTggODYgMTYuMDAyMlY0NzUuNzg5Qzg2IDQ3OC44MDggODkuMDE5OCA0ODIuNDM4IDkyLjA0OTIgNDgzLjY0OEwxNDQuMDYzIDUwMi4zNzZDMTUxLjkzMSA1MDUuMzk2IDE2Mi4yMSA1MDEuMTY2IDE2Mi4yMSA0OTQuNTA3VjM1LjMzMDZaIiBmaWxsPSIjMDkzNjNGIi8+Cjwvc3ZnPgo="
```

:::info
`icon` _may_ be a base64-encoded `data:` URL containing **PNG** data (i.e. `"data:image/png;base64,..."`). However this is only when no other icon is defined for the provider. Put another way, if `icon` is present **and any of the other SVG icons are defined**, then [as per the FIDO Convenience Metadata Specification](https://fidoalliance.org/specs/mds/fido-convenience-metadata-service-v1.0-ps-20250521.html#dom-conveniencedetails-icon) `icon` will contain an **SVG** as well.
:::

These strings can be placed directly into the `src` attribute of an `<img>` tag to render:

```html
<img style="height: 128px; width: 128px;" src="data:image/svg+xml;base64,..." />
```

<img style={{ height: 128, width: 128 }} src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlPkRhc2hsYW5lPC90aXRsZT4KPHBhdGggZD0iTTI1Ny40NzQgMzU5LjIwOUMyNTcuNDc0IDM1Ni4xODkgMjU0LjQ1NCAzNTMuMTY5IDI1MC4yMTUgMzUxLjk1OUwxOTkuNDExIDMzMy4yMzFDMTkwLjg5NSAzMjkuNjAxIDE4MS4yNjQgMzMzLjgzMSAxODEuMjY0IDMzOS44OVY0NzUuNzc5QzE4MS4yNjQgNDc4LjgwOSAxODQuMjgzIDQ4Mi40MzggMTg3LjMwMyA0ODMuNjQ4TDIzOS4zMjYgNTAyLjM3NkMyNDcuMTk1IDUwNS4zOTYgMjU3LjQ3NCA1MDEuMTY2IDI1Ny40NzQgNDk0LjUwOFYzNTkuMjA5WiIgZmlsbD0iIzA5MzYzRiIvPgo8cGF0aCBkPSJNMzUyLjczNiAzMjEuMTAzQzM1Mi43MzYgMzE4LjA4NCAzNDkuNzE3IDMxNS4wNjQgMzQ1LjQ3NyAzMTMuODU0TDI5NC42NzQgMjk1LjEyNkMyODYuMTU3IDI5MS40OTYgMjc2LjUyNiAyOTUuNzI2IDI3Ni41MjYgMzAxLjc4NVY0MzcuNjc0QzI3Ni41MjYgNDQwLjcwNCAyNzkuNTQ2IDQ0NC4zMzMgMjgyLjU2NiA0NDUuNTQzTDMzNC41ODkgNDY0LjI3MUMzNDIuNDU4IDQ2Ny4yOTEgMzUyLjczNiA0NjMuMDYxIDM1Mi43MzYgNDU2LjQwM1YzMjEuMTAzWiIgZmlsbD0iIzA5MzYzRiIvPgo8cGF0aCBkPSJNMjU3LjQ3NCAzNS4zMjExQzI1Ny40NzQgMzIuMzAxMyAyNTQuNDU0IDI5LjI4MTUgMjUwLjIxNSAyOC4wNzE3TDE5OS40MTEgOS4zNDM0M0MxOTAuODk1IDUuNzEzOTkgMTgxLjI2NCA5Ljk0MzU4IDE4MS4yNjQgMTYuMDAyMlYxNTEuODkyQzE4MS4yNjQgMTU0LjkyMSAxODQuMjgzIDE1OC41NTEgMTg3LjMwMyAxNTkuNzZMMjM5LjMyNiAxNzguNDg5QzI0Ny4xOTUgMTgxLjUwOCAyNTcuNDc0IDE3Ny4yNzkgMjU3LjQ3NCAxNzAuNjJWMzUuMzIxMVoiIGZpbGw9IiMwOTM2M0YiLz4KPHBhdGggZD0iTTM1Mi43MzYgOTIuNDc3N0MzNTIuNzM2IDg5LjQ1NzkgMzQ5LjcxNyA4Ni40MzgyIDM0NS40NzcgODUuMjI4M0wyOTQuNjc0IDY2LjVDMjg2LjE1NyA2Mi44NzA2IDI3Ni41MjYgNjcuMTAwMiAyNzYuNTI2IDczLjE1ODhWMjA5LjA0OEMyNzYuNTI2IDIxMi4wNzggMjc5LjU0NiAyMTUuNzA3IDI4Mi41NjYgMjE2LjkxN0wzMzQuNTg5IDIzNS42NDVDMzQyLjQ1OCAyMzguNjY1IDM1Mi43MzYgMjM0LjQzNiAzNTIuNzM2IDIyNy43NzdWOTIuNDc3N1oiIGZpbGw9IiMwOTM2M0YiLz4KPHBhdGggZD0iTTQ0OCAxNjguNjg3QzQ0OCAxNjUuNjY3IDQ0NC45OCAxNjIuNjQ3IDQ0MC43NDEgMTYxLjQzN0wzODkuOTM3IDE0Mi43MDlDMzgxLjQyMSAxMzkuMDc5IDM3MS43OSAxNDMuMzA5IDM3MS43OSAxNDkuMzY4VjM2MS40NjZDMzcxLjc5IDM2NC40OTUgMzc0LjgxIDM2OC4xMjUgMzc3LjgyOSAzNjkuMzM1TDQyOS44NTIgMzg4LjA2M0M0MzcuNzIxIDM5MS4wODMgNDQ4IDM4Ni44NTMgNDQ4IDM4MC4xOTRWMTY4LjY4N1oiIGZpbGw9IiMwOTM2M0YiLz4KPHBhdGggZD0iTTE2Mi4yMSAzNS4zMzA2QzE2Mi4yMSAzMi4zMTA4IDE1OS4xOSAyOS4yODE1IDE1NC45NTEgMjguMDcxN0wxMDQuMTQ4IDkuMzQzNDNDOTUuNjc4NyA1LjcxMzk5IDg2IDkuOTQzNTggODYgMTYuMDAyMlY0NzUuNzg5Qzg2IDQ3OC44MDggODkuMDE5OCA0ODIuNDM4IDkyLjA0OTIgNDgzLjY0OEwxNDQuMDYzIDUwMi4zNzZDMTUxLjkzMSA1MDUuMzk2IDE2Mi4yMSA1MDEuMTY2IDE2Mi4yMSA0OTQuNTA3VjM1LjMzMDZaIiBmaWxsPSIjMDkzNjNGIi8+Cjwvc3ZnPgo=" />
