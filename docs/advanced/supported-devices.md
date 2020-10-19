---
title: Supported Devices
---

The FIDO Alliance [maintains a list of what currently supports WebAuthn](https://fidoalliance.org/fido2/fido2-web-authentication-webauthn/). If "WebAuthn API" is green, that combination of browser and OS _should_ work fine with SimpleWebAuthn. That said, SimpleWebAuthn isn't _perfect_ so pull requests are welcome!

## Confirmed Combinations

Here are combinations of OS's, browsers, and authenticators that have been successfully tested with SimpleWebAuthn:

| OS      | Browser |                                                  Authenticator |
| :------ | :-----: | -------------------------------------------------------------: |
| macOS   | Firefox |           Yubikey Security Key NFC (USB), Yubikey 5Ci, SoloKey |
| macOS   | Chrome  |                                                       Touch ID |
| iOS     | Safari  | Yubikey Security Key NFC (NFC), Yubikey 5Ci, Face ID, Touch ID |
| Android | Chrome  |                                            Fingerprint Scanner |
| Android | Firefox |                                                     Screen PIN |
