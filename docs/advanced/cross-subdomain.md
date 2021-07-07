---
title: Cross Subdomains
---

WebAuthn is designed to prevent man-in-the-middle attacks (MITM) and phishing. In order to achieve this, the protocol
requies that each creted credential is scoped to the domain that is registering the device on the front channel.
If a user registers a credential at example.com, that credential can only be used at example.com.
Because of the extreme difficulties of spoofing a domain, an attacker is otherwise unable to use common phishing and MITM techniques
to trick users into using their credential on a fake client application.

## Relying Party
In the FIDO2 specifications, a relying party refers to the organization that is responsible for 
registering and authenticating a user. 

When creating a credential, the information of the relying party must be provided.

## Subdomains
While a credential must be scoped to a specific relying party, this does not mean that a credential can only be used for one application.
The relying party for a credential can either be an exact match of the domain registering and authenticating a user,
or it can be a registrable suffix of the effective domain.

If a user registers a device at `app.example.com`, but the relying party identifier is set to `example.com`, that credential can be used with
`example.com`, `app.example.com`, and any other application resolving to a subdomain of `example.com`.

If a user registers a device and the relying party identifier is set to `app.example.com`, then only `app.example.com` can use that device - `example.com` would fail.

## Setting the Relying Party Identfier

````````javascript
// Register at the domain
const options = generateAttestationOptions({
  rpName: 'Example Website',
  rpID: 'example.com',
  userID: user.id,
  userName: user.username,
  attestationType: 'indirect',
});

return options;

// Register at the subdomain
const options = generateAttestationOptions({
  rpName: 'Example Website',
  rpID: 'app.example.com',
  userID: user.id,
  userName: user.username,
  attestationType: 'indirect',
});

return options;
