---
title: Server - Usage
sidebar_label: Usage
---

import TabItem from '@theme/TabItem';
import LanguageTabs from '../../LanguageTabs';

## Importing

<LanguageTabs>
  <TabItem value="ts">

  ```ts
  import {
    // Registration ("Attestation")
    generateAttestationOptions,
    verifyAttestationResponse,
    // Login ("Assertion")
    generateAssertionOptions,
    verifyAssertionResponse,
  } from '@simplewebauthn/server';
  ```

  </TabItem>
  <TabItem value="js">

  ```js
  const {
    // Registration ("Attestation")
    generateAttestationOptions,
    verifyAttestationResponse,
    // Login ("Assertion")
    generateAssertionOptions,
    verifyAssertionResponse,
  } = require('@simplewebauthn/server');
  ```

  </TabItem>
</LanguageTabs>

## Attestation

"Attestation" is analogous to new account registration. Attestation occurs in two steps:

1. Generate a collection of "options" for the browser to pass to a FIDO2 authenticator
2. Verify the authenticator's response

Each of these steps needs to be handled as individual API endpoints:

### 1. Generate attestation options

One attestation endpoint needs to return the result of a call to `generateAttestationOptions()`:



### 2. Verify attestation response

The second attestation endpoint

## Assertion

"Assertion" is analogous to existing account login.

## Supported Attestation Formats

SimpleWebAuthn supports [all six WebAuthn attestation formats](https://w3c.github.io/webauthn/#sctn-defined-attestation-formats), including:

- **Packed**
- **TPM**
- **Android Key**
- **Android SafetyNet**
- **FIDO U2F**
- **None**

## MetadataService

Supports FIDO Metadata Service (MDS)

Metadata enables a greater degree of certainty that the devices interacting with this server are
what they claim to be according to their manufacturer.

Use of MetadataService is _not_ required to use @simplewebauthn/server. If you do choose to use
it, you'll need to provide at least one MDS endpoint

See https://mds2.fidoalliance.org/tokens/ to register for a free access token. When they ask for
an Organization Name, "Self" works just fine.
