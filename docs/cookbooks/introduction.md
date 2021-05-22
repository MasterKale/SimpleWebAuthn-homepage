---
title: Introduction 
---

At its core, WebAuthn, or Web Authentication, is a web standard published by W3C. It is a core component of the FIDO2 specifications along side CTAP2. More specifically, WebAuthn is a web-based API that provides an easy-to-use abstraction for user authentication using support devices. CTAP2 and WebAuthn use advanced asymmetric cryptography as a way to establish identity and trust between a user and a service.

With the evolution of the internet and cybersecurity, it became clear that password credentials and even two-factor authentication was not enough to provide users with the account safety that was needed. The common 2FA are vulnerable to phising attacks and ultimately provide a low amount of confidence in user account security.

WebAuthn is aiming to provide a solution to these problems.

## How to use this cookbook
SimpleWebAuthn is a set of client-side and server-side Javascript/Typescript packages that make the implementation of WebAuthn easy for developers wishing to take advantage of the protocols. WebAuthn is a new specification with a lot of complex, and arguably confusing details that could discourage early developer adoption.

This cookbook aims to provide the crucial details with using the WebAuthn API. It will provide several real-life examples of how you can use WebAuthn along with an exploration into the different options the protocol provides. Each example explanation will build off of the information learned from the previous one. The cookbook is meant to be read along side the example code provided.

If you are looking for a quicker TLDR explanation of WebAuthn, [Guide to Web Authentication](https://webauthn.guide/) is a great start.

## Disclaimer
It is highly recommend that you are familiar with Javascript or Typescript and secure methodologies for proper web authentication. What the cookbook provides is not a production ready authorization server with proper session and cookie management, despite both being implemented in the examples.

The cookbook's focus is the implementation of the SimpleWebAuthn packages.

## Reading Sources
- [Guide to Web Authentication (webauthn.guide)](https://webauthn.guide/)
- [Web Authentication: An API for accessing Public Key Credentials - Level 2 (w3.org)](https://www.w3.org/TR/webauthn-2/)
