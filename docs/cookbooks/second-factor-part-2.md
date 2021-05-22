---
title: Second Factor Assertion
---

Now that we know the details of what attestation is, we can move onto asserting and using our WebAuthn device to login.

### WebAuthn Assertions
If a user that has a registered device attempts to login with username and password, they will be redirected to the WebAuthn Assertion page.

The page for assertions is very similar to attestation. Back on the client, we generate our options, start the assertion with WebAuthn using SimpleWebAuthn's `startAssertion` method. Once we have the response from the authenticator, we will send it to the server.

`$ public/two-factor/webauthn/webauthn.js`
```javascript
  const resp = await fetch("/webauthn/generate-assertion-options");

```

Lets take a look at the assertion options we created on the server.

`$ routes/webauthn.ts`
```javascript
  router.get("/generate-assertion-options", (req, res) => {
    const user = database[req.cookies.user];

    const options = generateAssertionOptions({
      timeout: 60000,
      userVerification: 'discouraged',
      rpID,
      allowCredentials: user?.devices.map((dev) => ({
        id: dev.credentialID,
        type: "public-key",
        transports: ["usb", "ble", "nfc", "internal"],
      })),
    });

    user!.currentChallenge = options.challenge;

    res.send(options);
  });
```

There are some similarities between these options and the ones generated for attestation. The new property is `allowedCredentials`. This lets you decide which credentials are allowed for this particular authentication. For example, if a user had 3 devices, but lost one of them, you could just send the 2 credentials that you know they still have access too. As youll notice when testing, if you have mutliple WebAuthn compatible devices, the browser will prompt for you to choose a device to authenticate with. This property can help shape that list.

Next, like before, we save the newest challenge on these user so that we can verify the signature during verification.

Once that returns to the client, we can begin assertion.

`$ public/two-factor/webauthn/webauthn.js`
```javascript
 const asseResp = await startAssertion(opts);

  const verificationResp = await fetch("/webauthn/verify-assertion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asseResp),
  });

  return verificationResp.json();
  ```

The `startAssertion` response is sent to the server's assertion-verification endpoint.

Much like with attestatioin, we have to query for the saved challenge and provide all of the expected values for the challange, rp, and origin of the client.

```javascript
  const expectedChallenge = user.currentChallenge;

  let dbAuthenticator;
  const bodyCredIDBuffer = base64url.toBuffer(body.rawId);

  for (const dev of user.devices) {
    if (dev.credentialID.equals(bodyCredIDBuffer)) {
      dbAuthenticator = dev;
      break;
    }
  }

  if (!dbAuthenticator) {
    throw new Error(`could not find authenticator matching ${body.id}`);
  }

  let verification;
  try {
    verification = verifyAssertionResponse({
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: dbAuthenticator,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message });
  }

```
 
 The new parameter, `authenticator`, is a SimpleWebAuthn interface that represents the credential specific data we saved during attestation. This object must contain the `credentialPublicKey`, the `credentialId`, and the `counter`. SimpleWebAuthn validates the signature, the expectations, and the counter. 
 
Within our `verification` response, we have two _very_ important properties - `verified` and `assertionInfo`. `verified` will tell us if the assertion was succesful. We must check that this value is true. Next, `assertionInfo` contains the `newCounter` that we must update our database with. Incrementing the counter is a must. Don't forget, the counter of an autenticator plays a crucial role in preventing authenticator cloning and replay attacks.
 
```javascript
  const { verified, assertionInfo } = verification;

  if (verified) {
    dbAuthenticator.counter = assertionInfo.newCounter;
    user.loggedIn = true;
    res.send({ verified })
  } else {
    res.status(401).send('unauthorized');
  };
});
```

If all goes well in the assertion, we will return the `verified` status to our client.

This will complete the 2FA login ceremony and route you back to the profile page to see the data..

With that, we have succesfully seen what it takes to implement WebAuthn using SimpleWebAuthn, and then using it as a second factor to meet the criteria of a multi-factor authentication system.

While we cover a lot of the important WebAuthn details that can be carried over into the next recipes, we have just started scratching the surface of how we can leverage WebAuthn in our applications.

Next up, we will see what it takes to remove passwords and make WebAuthn a primary means of authentication.
