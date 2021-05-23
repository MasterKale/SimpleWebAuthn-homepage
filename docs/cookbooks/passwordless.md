---
title: Passwordless Authentication
---

Passwordless authentication is a way of authenticating a user without the use of a memorized or saved password. Instead, a person authenticates using a possession-based factor. Time-based one-time passwords and SMS are two of the most popular ways to provide passwordless authentication. However, as we learned before, those types of factors are not as secure as we want.

## Passwordless
In this example, you will see a lot of similar code as the last example. The WebAuthn endpoints will be nearly the same as the second-factor example. However, the passwordless flow will not have a session when the WebAuthn attestation and assertion options are requested.

### Passwordless Login and Signup
Since we no longer use password authentication, we do not require a password or submission to a specific login route.

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
 Before, we used a form to submit a username and password. With WebAuthn passwordless, we will asynchronously POST a username to request attestation options from the server.

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
Now that the server has the username for the user trying to register, we can create a new user and generate our attestation options. 

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
> In a passwordless flow, setting user verification to "required" is recommended. This configuration will request a device to enforce a local authentication ceremony. Because this can lead to some devices failing, we will not require user verification for the examples.

We will still add this new user to our database, save the challenge on the user, add a cookie to the session, and return the options.

With attestation verification unchanged from the previous example, we redirect users to their profile page when they have officially signed up. Notice that the new user objects no longer have a password saved to our database!

### Assertion
The changes needed for passwordless login and WebAuthn assertion are almost unchanged from the previous example as well. When we want to log in, we need to provide the username we would like to authenticate.

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

Next, we find the user and their device credentials and authenticate them. 

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

In assertion verification, SimpleWebAuthn validates the assertion response from the authenticator. The library then increments the authenticator's counter in the database. Assertion verification remains unchanged for this flow.

#### Why Is This More Secure?
Because passwordless authentication is so simple, you might ask yourself - _How is this more secure_?

First, asymmetric cryptography has proven its strength over password-based authentication on my occasions. This methodology is much hard to brute force.

Next, the credentials created with WebAuthn are scoped to a specific domain name, preventing man-in-the-middle and phishing attacks.

Lastly, the more unique factors we can challenge when authenticating a user, the more confident we can be about user identity. Remember, those factors are "what you know," "what you have," and "what you are." When we require user verification, we can cover two of those factors. The authenticator will perform a local authentication ceremony to cover the "what you know" factor while simply using a WebAuthn compliant device covers the "what you have." If you use a platform authenticator, like Mac TouchID, the "what you are" factor is fulfilled instead of "what you know." 

Not only is this methodology more secure, but it is also more efficient and convenient.

