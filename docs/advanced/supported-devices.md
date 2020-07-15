---
title: Supported Devices
---

The FIDO Alliance [maintains a list of what currently supports WebAuthn](https://fidoalliance.org/fido2/fido2-web-authentication-webauthn/). If "WebAuthn API" is green, that combination of browser and OS *should* work fine with SimpleWebAuthn. That said, SimpleWebAuthn isn't perfect, so pull requests are welcome!

## Confirmed Combinations

WebAuthn support is currently spotty, but getting better. Here are combinations of OS's, browsers, and authenticators that have been successfully tested with SimpleWebAuthn:

| OS      | Browser |                  Authenticator |
| :------ | :-----: | -----------------------------: |
| macOS   | Firefox | Yubikey Security Key NFC (USB) |
| macOS   | Chrome  |                       Touch ID |
| iOS     | Safari  | Yubikey Security Key NFC (NFC) |
| Android | Chrome  |            Fingerprint Scanner |
| Android | Firefox |                     Screen PIN |
