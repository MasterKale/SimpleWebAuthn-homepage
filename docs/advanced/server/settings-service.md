---
title: Settings Service
---

:::caution
**The following functionality is opt-in and is not required for typical use!** SimpleWebAuthn remains focused on simplifying working with the WebAuthn API, and the functionality covered in [Packages &gt; @simplewebauthn/server](packages/server.md) will serve the majority of developers' use cases.
:::

## Introduction

The `SettingsService` singleton offers methods for customizing **@simplewebauthn/server**'s functionality.

## `setRootCertificates()`

Some registration response attestation statements can be validated via root certificates prescribed by the company responsible for the format. It is possible to use `SettingsService` to register custom root certificates that will be used for validating certificate paths in subsequent registrations with matching attestation formats:

```ts
import { SettingsService } from '@simplewebauthn/server';

// A Uint8Array, or PEM-formatted certificate string
const appleCustomRootCert: Uint8Array | string = '...';
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

## `getRootCertificates()`

This method returns existing root certificates for a specific identifier:

```js
import { SettingsService } from '@simplewebauthn/server';

const appleCerts: string[] = SettingsService.getRootCertificates({ identifier: 'apple' });
```

The returned certificates will be PEM-formatted strings.
