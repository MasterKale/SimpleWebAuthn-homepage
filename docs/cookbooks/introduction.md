---
title: Introduction 
---

At its core, WebAuthn, or Web Authentication, is a web standard published by W3C. It is a core component of the FIDO2 specifications. More specifically, WebAuthn is a web-based API that provides an easy-to-use abstraction for user authentication using support devices.

With the evolution of the internet and cybersecurity, it became clear that password credentials and even two-factor authentication was not enough to provide users with the account safety that was needed. The common 2FA are vulnerable to phising attacks and ultimately provide a low amount of confidence in user account security.

WebAuthn is aiming to provide a solution to these problems.

## How to use the SimpleWebAuthn cookbook
SimpleWebAuthn is a set of client-side and server-side Javascript/Typescript packages that make the implementation of WebAuthn easy for developers wishing to take advantage of the protocols. WebAuthn is a new specification with a lot of complex, and arguably confusing details that could discourage early developer adoption.

This cookbook aims to provide the crucial details with using the WebAuthn API. It will provide several real-life examples of how you can use WebAuthn along with an exploration into the different options the protocol provides. Each recipe will build off of the information learned from the previous one and is meant to read along side the example code for each example.

If you are looking for a quicker TLDR explanation of WebAuthn, [Guide to Web Authentication](https://webauthn.guide/) is a great start.

## Disclaimer
It is highly recommend that you are familiar with Javascript or Typescript, as well as authorization protocols like OAuth 2 and OpenID. What the cookbook provides is not a production ready authorization server and therefore takes a handful of insecure shortcuts for simplicity. 

The cookbooks emphasis is on the implementation of the SimpleWebAuthn packages.

## Reading Sources
- [Guide to Web Authentication (webauthn.guide)](https://webauthn.guide/)
- [Web Authentication: An API for accessing Public Key Credentials - Level 2 (w3.org)](https://www.w3.org/TR/webauthn-2/)
