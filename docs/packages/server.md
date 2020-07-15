---
title: Server
---

## Installation

This package is available on **npm**:

```bash
$> npm install @simplewebauthn/server
```

It can then be imported into a Node project as usual:

```ts
// ESModule (TypeScript, Babel, etc...)
import SimpleWebAuthnServer from '@simplewebauthn/server';
// CommonJS (NodeJS)
const SimpleWebAuthnServer = require('@simplewebauthn/server');
```

## Supported Attestation Formats

SimpleWebAuthn supports [all six WebAuthn attestation formats](https://w3c.github.io/webauthn/#sctn-defined-attestation-formats), including:

- **Packed**
- **TPM**
- **Android Key**
- **Android SafetyNet**
- **FIDO U2F**
- **None**
