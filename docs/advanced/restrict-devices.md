---
title: Restrict Device Types
---

Within the WebAuthn specification, there are two "types" of authenticators that can be used - cross-platform and platform.

Cross-platform authenticators, also known as roaming authenticators, are authenitcators that can be used across multiple difference devices (phones, computers, etc). The most common cross-platform authenticators are security keys, like yubikey.

Platform authenticators, also known as internal authenticators, are embedded into the device being used to authenticate. The most common platform authenitcators are cell phones, MacOS TouchID, and Windows Hello.

In order to restrcit the type of authenticator allowed in an application, the `authenticatorAttachment` property must be set to the authenticator type that is desired. 

```javascript
  const options = generateAttestationOptions({
    rpName: 'SimpleWebAuthn Example',
    rpID,
    userID: user.userHandle,
    userName: user.username,
    timeout: 60000,
    attestationType: 'indirect',
    authenticatorSelection: {
      authenticatorAttachment: [ 'cross-platform' ] // <-- Specify Authentcation Attachment as either cross-platform or platform
    },
  });
```

Read the [low-level documentation](https://api-docs.simplewebauthn.dev/modules/_simplewebauthn_typescript_types.html#authenticatorattachment) for more details.
