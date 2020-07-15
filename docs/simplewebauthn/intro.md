---
title: Introduction
---

## Overview

The SimpleWebAuthn project contains two complimentary libraries to help reduce the amount of work
needed to incorporate WebAuthn into a website. The following packages are maintained here:

- [@simplewebauthn/server](./packages/server)
- [@simplewebauthn/browser](./packages/browser)

An additional package is also included that contains shared TypeScript definitions:

- [@simplewebauthn/typescript-types](./packages/types)

**API Documentation**

In-depth, auto-generated API documentation for all of the packages in this project is available
here:
https://docs.simplewebauthn.dev/

## Supported Attestation Formats

SimpleWebAuthn supports [all six WebAuthn attestation formats](https://w3c.github.io/webauthn/#sctn-defined-attestation-formats), including:

- **Packed**
- **TPM**
- **Android Key**
- **Android SafetyNet**
- **FIDO U2F**
- **None**
