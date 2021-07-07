---
title: Introduction 
---

At its core, WebAuthn, or Web Authentication, is a web standard published by W3C. It is a component of the FIDO2 specifications alongside CTAP2. WebAuthn is a web-based API that provides an easy-to-use abstraction for user authentication using support devices. CTAP2 and WebAuthn use advanced asymmetric cryptography to establish identity and trust between a user and a service.

With the evolution of the internet and cybersecurity, it became clear that password credentials and two-factor authentication were not enough to provide users with the necessary account safety. The most common 2FA methods, like SMS and OTP, are vulnerable to phishing attacks and ultimately provide low confidence in user account security.

WebAuthn is aiming to provide a solution to these problems.

## How to use this cookbook
SimpleWebAuthn is a set of client-side and server-side Javascript/Typescript packages that make the implementation of WebAuthn easy for developers wishing to take advantage of the protocols. WebAuthn is a new specification with many complex and arguably confusing details that could discourage early developer adoption.

This cookbook aims to provide the crucial details for using the WebAuthn API. It will give several real-life examples of how you can use WebAuthn, along with an exploration into the different options the protocol provides. Each example explanation will build off of the information learned from the previous one.

If you are looking for a quicker TLDR explanation of WebAuthn, [Guide to Web Authentication](https://webauthn.guide/) is a great start.

## Disclaimer
Before beginning, you should be familiar with Javascript or Typescript and secure methodologies for proper web authentication. The cookbook does not provide a production-ready authorization server and does not provide a secure session and cookie implementation.

The cookbook's focus is the implementation of the SimpleWebAuthn packages.

## Reading Sources
- [Guide to Web Authentication (webauthn.guide)](https://webauthn.guide/)
- [Web Authentication: An API for accessing Public Key Credentials - Level 2 (w3.org)](https://www.w3.org/TR/webauthn-2/)
