---
title: Require a PIN Code
---

When authenticating with WebAuthn, the [authenticator data](https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data) returned during assertion and attestation contains a lot of different bits of data that we can use to verify the request further. One of the properties on the parsed data from a FIDO compliant authenticator is called `flags.` 

The `flags` property stores boolean information about the authentication ceremony executed on the authenticator device. At the moment, we will only focus on two - [user prescense](https://www.w3.org/TR/webauthn-2/#concept-user-present) (UP) and [user verification](https://www.w3.org/TR/webauthn-2/#user-verification) (UV).

## User Presence
The user presence flag denotes that a person was _present_ during the authentication request. The presence test can vary, but usually, it involves the user having to touch a button or a little metal piece on a security key. Using a biometric device could fulfill user presence, but user presence does not verify a user. In the most basic interpretation, the user presence flag means that some human was present during authenticator usage. Currently, there isn't any configuration to be done with WebAuthn to enforce or require user presence. The flag either exists or does not exist.

## User Verification
The user verification flag is an essential flag to check. When the flag evaluates to a true value, we can be confident that there was some technical process where the authenticator _locally_ authorizes a user. In other words, the authenticator required that the user used a pin code, password, biometric recognition, etc. The authenticator device and manufacturer of that device determine the type of local authentication.

Using the `UV` flag, one can make an educated assumption that the person using the authenticator is authorized to do so.

## Configuring User Verification
User verification has three possible configurations:

- Discouraged: The authenticator will likely not ask for local authentication.
- Preferred: The authenticator could request local authentication if available.
- Required: The authenticator _should_ request local authentication and failed if that action is unavailable.

User verification set to `required` will request the authenticator to require a pin code, passcode, or biometric reading.

```javascript
import {
  generateAttestationOptions,
} from '@simplewebauthn/server';

const options = generateAttestationOptions({
  rpName: 'SimpleWebAuthn Example',
  rpID,
  userID: user.userHandle,
  userName: user.username,
  timeout: 60000,
  attestationType: 'indirect',
  authenticatorSelection: {
    userVerification: 'required', // <--- Require User Verification
    requireResidentKey: false,
  },
});
```
