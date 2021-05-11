---
title: Require a PIN Code
---

When authenticating with WebAuthn, the [authenticator data](https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data) returned during assertion and attesstiation contains a lot of different bits of data that we can use to further verify the request. One of the properties on the parsed data from a FIDO compliant authenticator is called `flags`. 

The flags property is used to store boolean information about the authentication ceremony that was executed on the authenticator device. At the moment, we will only focus on two - [user prescense](https://www.w3.org/TR/webauthn-2/#concept-user-present) (UP) and [user verification](https://www.w3.org/TR/webauthn-2/#user-verification) (UV).

## User Prescence
The user presence flag denotes that a person was _present_ during the authentication request. The prescense test can vary, but usually it involves the user having to touch a button or a little metal piece on a security key. Using a biometric device, such as a fingerprint reader, _could_ fufill user presence, but user prescence is not intended to verify a user. In its most basic interpretation, the user prescense flag just means that _some_ human was present whenever the authenticator was used. At the moment, there isn't any configuration to be done with WebAuthn in order to enforce or require user prescence. The flag either exists or does not exist.

## User Verification
The user verification flag is a very important flag to check. When the flag is flipped to a true value, we can be confident that there was some technical process where the authenticator _locally_ authorizes a user. In other words, the authenticator required that the user was verified by a pincode, password, biometric recognition, etc. The type of local authroization that happens is ultimately determined by the authenticator device and manufacteror of that device. In short, we can use the `UV` flag to make an educated assumption that the person using the authenticator is also authorized to use the authenticator.

## Configuring User Verification
User verification has 3 possible configurations:

- Discouraged: The authenticator will likely not ask for local authenitcation.
- Preferred: The authenitcator could request local authentication if available.
- Required: The authenticator _should_ requeest local authentication and failed if that action is unavailable.

In order to require a PIN code or passcode, user verification must be configured with `required`.

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
