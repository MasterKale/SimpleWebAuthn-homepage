---
title: Passwordless Authentication
---

Passwordless authentication is a way of authenticating a user without the use of a memorized or saved password. Instead, a person is typically authenticated using a possesion based factor. One-time passwords and SMS are two of the more popular ways to provide passwordless authentication. However, as we learned before, those types of factors are not as secure as we want.

This is where WebAuthn really starts to shine.

## Passwordless
One of the best things about moving towards passwordless authentication as a first class citizen is that we can start to delete code and reduce complexity. In this example, you will see a lot of code that has already been covered. As a matter of fact, the WebAuthn endpoints will be almost exactly the same as the 2FA example. The only differences we have with passwordless flow is that when we start to generate WebAuthn attestation and assertion options, we do not have an active session with the server.

### Passwordless Login and Signup
Since we are no longer using password authentication, we do not require a password to be entered or a form submission to a specific login route.

`$ public/passwordless/index.html`
```html
<div class="container">
  <h1>SimpleWebAuthn for Passwordless</h1>
  <input id="username" type="text" required placeholder="Username" />
  <button id="attest">Sign Up</button>
  <button id="assert">Login</button>
  <p id="success"></p>
  <p id="error"></p>
</div>
```
Instead, we signup up by performing WebAuthn attestation and use a username to store our records in the database. Our largest change is that we are now POSTing the username to our server when we rrequest attestation options.

`$ public/passwordless/webauthn.js`
```javascript
  // Omitted
  const resp = await fetch("/webauthn-passwordless/generate-attestation-options", { 
    method: 'POST' ,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  // Omitted
 ```

### Attestation
Now that the server has the username for the user trying to register, we can create the new user and generate our attestation options. 

`$ routes/webauthn-passwordless.ts`
```javascript
router.post("/generate-attestation-options", (req, res) => {
  const { username } = req.body;
  const user: LoggedInUser = {
    username,
    loggedIn: false,
    devices: [],
  };
  const options = generateAttestationOptions({
    rpName: "SimpleWebAuthn Example",
    rpID,
    userID: user.username,
    userName: user.username,
    timeout: 60000,
    attestationType: "indirect",
    authenticatorSelection: {
      userVerification: 'discouraged',
    },
  });

  user.currentChallenge = options.challenge;
  database[user.username] = user;

  res.cookie("user", user.username, { maxAge: 900000 });

  res.send(options);
});
```
> In a passwordless flow, it is highly recommended, though not required, to set this value to `required` in order to enforce a device-based authentication ceremony. Because this can lead to some devices failing, we will not require user verification for the examples.

We will still add this new user to our database, save the challenge on the user, add a cookie to the session, and return the options.

With attestation verificatioin unchanged from the previous example, we redirect the user to their profile page when they have officially signed up. Notice that the new user objects no longer have a password saved to our database. This alone is an awesome feat!

### Assertion
The changes needed for passwordless login and WebAuthn assertion is almost unchanged from the pervious example as well. When we want to login, we need to provide the username we would like to authenticate.

`$ public/passwordless/webauthn.js`
```javascript
  // Omitted
  const resp = await fetch("/webauthn-passwordless/generate-assertion-options", { 
    method: 'POST' ,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  // Omitted
 ```

Next we find that user and their device credentials based on their username, and then authenticate them. 

`$ routes/webauthn-passwordless.ts`
```javascript
router.post("/generate-assertion-options", (req, res) => {
    const { username } = req.body;
    const user = database[username];

    const options = generateAssertionOptions({
      timeout: 60000,
      allowCredentials: user?.devices.map((dev) => ({
        id: dev.credentialID,
        type: "public-key",
        transports: ["usb", "ble", "nfc", "internal"],
      })),
      rpID,
    });

    user!.currentChallenge = options.challenge;
    res.cookie("user", user.username, { maxAge: 900000 });

    res.send(options);
  });
```

Once we have created our assertion options, we return them to our client and allow the user to complete the login flow with their authenticator.

In our assertion verification, SimpleWebAuthn still validates the assertion response from the authenticator, and increments our authenticators counter in our database. Assertion verification remains unchanged for this flow.

#### Why Is This More Secure?
Because passwordless authentication is so simple, you might ask yourself - _How is this more secure_?

First, asymmetric cryptography has proven is strength over password based authenticatiion on my occastions. This methodology is much hard to brute force.

Next, the credentials created with WebAuthn are scoped to a specific domain name, preventing man-in-the-middle and phising attacks.

Lastly, the more unique factors we can challenge when authenticating a user, the more confident we can be about user identity. Remember, those factors are "what you know",  "what you have", and "what you are". When we require user verification, we are able to cover two of those factors. The authenticator will perform a local authentication ceremony to cover the "what you know" factor, while simply the use of a WebAuthn compliant device covers the "what you have". If you are using a platform authenticator, like Mac TouchID, this will cover the "what you are" factor, instead of "what you know". 

Not only is this methodology more secure, its more efficient and convienient.

