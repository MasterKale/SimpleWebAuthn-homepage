---
title: Passwordless Authentication
---

### Passwordless Authentication
Passwordless authentication is a way of authenticating a user without the use of a memorized or saved password. Instead, a person is typically authenticated using a possesion based factor. One-time passwords and SMS are two of the more popular ways to provide passwordless authentication. However, as we learned before, those types of factors are not as secure as we want.

This is where WebAuthn really starts to shine.

### The Recipe
One of the best things about moving towards passwordless authentication as a first class citizen is that we can start to delete code and reduce complexity. In this example, you will see a lot of code that has already been covered. As a matter of fact, the WebAuthn endpoints will be almost exactly the same as the 2FA example. The only differences we have with passwordless flow is that when we start to generate WebAuthn attestation and assertion options, we do not have an active session with the server.

#### Passwordless Login and Signup
Since we are no longer using password authentication, we are able to completely get rid of the username/password forms. All that is needed is a username input to send to our endpoint for generating attestation options. Aside from the addition of this input, the code remains unchanged.

```html
    <h1>🚪&nbsp;Register</h1>
    <input id="username" type="text" required placeholder="Username">
    <button id="btnBegin">Sign Up</button>
    <p id="success"></p>
    <p id="error"></p>
```

#### WebAuthn Attestation & Assertion
Now that the server has the username for the user trying to register, we can create the new user and generate our attestation options. 

One small, but very important change that we can make is for the value of `userVerification`. 

```javascript
  const newUserId = crypto.randomBytes(15).toString('hex');
  const user: LoggedInUser = {
    id: newUserId,
    username: req.query.username!.toString(),
    userHandle: getRandomString(64),
    loggedIn: false,
    devices: [],
  }

  const options = generateAttestationOptions({
    rpName: 'SimpleWebAuthn Example',
    rpID,
    userID: user.userHandle,
    userName: user.username,
    timeout: 60000,
    attestationType: 'indirect',
    authenticatorSelection: {
      userVerification: 'required',
      requireResidentKey: false,
    },
  });
```

In a passwordless flow, it is highly recommended, though not required, to set this value to `required`. With the `required` value, we will force the authenticator to perform a local authentication ceremony. This can be a pin code, password, and even a pattern pin on a smartphone. This value, along with other flags, will be covered in more depth in [[1 - User Verification and User Prescence]].

We will still add this new user to our database, save the challenge on the user, add a cookie to the session, and return the options.

```javascript
  user.currentChallenge = options.challenge;
  inMemoryUserDeviceDB[user.id] = user;

  res.cookie('id', user.id, { maxAge: 900000});

  res.send(options);
```

With eveything else in registration unchanged, we redirect the user to their profile page when they have officially signed up. Notice that the new user objects no longer have a password saved to our database. This alone is an awesome feat!

Luckily, the changes needed for passwordless login and WebAuthn assertion is roughly the same. When we want to login, we just need to provide the username we would like to authenticate, find that user and their device credentials based on their username, and then authenticate them. 

```javascript
  const user = Object.values(inMemoryUserDeviceDB).find(u => u.username === req.query.username);

  const options = generateAssertionOptions({
    timeout: 60000,
    userVerification: 'required',
    allowCredentials: user.devices.map(dev => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: ['usb', 'ble', 'nfc', 'internal'],
    })),
    rpID,
  });

  user!.currentChallenge = options.challenge;

```

Like the attestation flow, we will set `userVerification` to `required`. Since we want to authenticate an existing user, we search our database by the username provided from the client. 

Once we have created our assertion options, we return them to our client and allow the user to complete the login flow with their authenticator.

In our assertion verification, SimpleWebAuthn still validates the assertion response from the authenticator, and increments our authenticators counter in our database. Assertion verification remains unchanged for this flow.

```javascript
  if (verified) {
    dbAuthenticator.counter = assertionInfo.newCounter;
    user.loggedIn = true;
    res.send({ verified })
  } else {
    res.status(401).send('unauthorized');
  };
});
```

#### Why Is This More Secure?
With as simple of a flow as usernameless authentication, you might ask yourself - How is this more secure?

When authenticating a user, the more unique factors we can challenge, the better. Remember, those factors are "what you know",  "what you have", and "what you are". When we require user verification, we are able to cover two of those factors. The authenticator will perform a local authentication ceremony to cover the "what you know" factor, while simply the use of a WebAuthn compliant device covers the "what you have". If you are using a platform authenticator, like Mac TouchID, this will cover the "what you are" factor, instead of "what you know". 

With a properly configured WebAuthn flow, we can cover two factors without our server having access to any unencrypted confidential information.
