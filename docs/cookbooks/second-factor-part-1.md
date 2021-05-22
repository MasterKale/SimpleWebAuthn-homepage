---
title: Second Factor Attestation
---

## What is MFA?
MFA, or Multi-factor Authenticatoin, is a method of requiring a user to perform two or more verfication factors before they can successfully gain access to their account, application, or whatever resource being guarded. These verfication factors are:

- What you know.
- What you have.
- What you are.

Username and password credentials only cover one of those factors (what you know). Most applications provide MFA using SMS, push notifications, or one-time passowrds. These examples all over the "what you have" factor. The least common factor, what you are, is most commonly seen with biometrics like face ID and touch ID.

## Why use WebAuthn as a 2nd Factor?
WebAuthn as a 2nd is currently seen as one of the most secure factor methods. WebAuthn uses public key cryptography and even has standards that prevent websites and malicious actors from surreptitiously looking for information about your WebAuthn credentials. Because each credential is scoped to a specific domain, WebAuthn also prevents man-in-the-middle and phising attacks. Another great aspect about WebAuthn is that, in many cases, WebAuthn can act as two factors. What you have, and either what you know or what you are.

## WebAuthn as a 2nd Factor
As you may have guessed, we are going to be looking at how to use SimpleWebAuthn for implementing the WebAuthn protocol as a 2nd factor for a username and password account. Important details will be highlighted through each step. Since this is the first of 3 examples using the same packages, it is the most verbose.

 If you haven't already, clone the project to follow along. See [[1 - Getting Started]] for more instructions. Make note that we will not be covering the nuances of Express or NodeJS..

### The User
The shape of the user data for our example is simple. We have an ID, username, password, logged in status , a list of devices, and a current challenge for WebAuthn.

```typescript
import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types';

interface LoggedInUser {
  id: string;
  username: string;
  password: string;
  loggedIn: boolean;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}
```

### Sign up with Password Credentials
We will start with looking at the log in and sign-up page. There is not a lot going on with this page. We have a single form for our usernamen and password along with two action buttons responsible for either signing up a new user or logging in as an existing user.

`$ public/two-factor/index.html`
```html
<div class="container">
  <h1>SimpleWebAuthn as a Second Factor</h1>
  <form action="/login" method="POST">
    <input name="username" type="text" required placeholder="Username" />
    <input name="password" type="text" required placeholder="Password" />
    <button name="action" value="signup">Sign Up</button>
    <button name="action" value="login">Login</button>
  </form>
  <p id="success"></p>
  <p id="error"></p>
</div>
```

The signup route will be the first to make use of our server side state. The route will handle signup and signin In this case, we are sining up a new user.

We have an in-memory dictionary to mock a database. Once we extract the username and password from the request body, we persist the user in our "database". 

`$ index.ts`
```javascript
app.post("/login", (req, res) => {
    const { username, password, action } = req.body;
    switch (action) {
      case "signup":
        inMemoryUserDeviceDB[username] = {
          username,
          password,
          devices: [],
          loggedIn: true,
        };
        res.cookie("user", username, { maxAge: 900000 });
        return res.redirect("/profile");
      case "login":
        const user = inMemoryUserDeviceDB[username];
        if (user.password === password) {
          res.cookie("user", username, { maxAge: 900000 });
          // If the user has a device, we should require the assertion
          if (user.devices?.length) {
            return res.redirect("/two-factor/webauthn/assertion");
          } L
          // Otherwise, login as normal
          user.loggedIn = true;
          return res.redirect("/profile");
        } else {
          res.status(401).send("unauthorized");
        }
        break;
    }
  });
```

Once the user is saved in our database, we can mark the user as logged in, add a cookie to the request so we do not lose our session, and redirect them to the profile page.

This user can now logout and login back in. Since they do not have any regsiterd devices, we will not require MFA.

> ***Important***: In a real server, its very important that the cookie added to the response is some type of signed token, like a JWT, containing the state of the session. The signed cookie should be validated upon every request.

`$ public/profile/index.html`

```html
  <div class="container">
    <h1>🚪&nbsp;Profile</h1>
    <pre id="user-data"></pre>
    <a href="/two-factor/webauthn/attestation">Add WebAuthn Device</a>
  </div>
  <script>
    const pre = document.getElementById('user-data');
    fetch('/user')
    .then(res => res.json())
    .then(data => {
      pre.innerHTML = JSON.stringify(data);
    });
  </script>
```
The profile page will spit out our user details. On this page, we can decide to register a second factor with WebAuthn. Registration-like actions with WebAuthn are often referred to as "attestation".


### WebAuthn Attestation
With WebAuthn, there are two types of certificates used for registration and authentication. These are attestation and assertion. Both are requests that are made to a WebAuthn-supported device that result in payloads that will be validated and verified by the browser and the server.

Attestation is used to verify that the device used is genuine and contains specific characteristics and can be used to make sure a device is real hardware. A relying party (the service responsible for authentication) can also use the attestatioin cerrtificate to ensure the brand of devices used. This is a complex use case that will not be covered in these examples. We will consider attestation as just the method for generating a new credential key pair.

 Since our new user wants a second factor, we need to create a WebAuthn credential to act as the second factor.

The WebAuthn Attestation page has a handful of responsibilites.

 We start off with grabbing the `startAttestation` and `supportsWebauthn` methods from `SimpleWebAuthnBrowser` package. Before trying to use the WebAuthn API, it is important to check that the API is available in the browser being used.
 
 `$ public/two-factor/webauthn/webauthn.js`

 ```javascript 
// Imported using a CDN script
const { startAttestation, supportsWebauthn } = SimpleWebAuthnBrowser;

// Hide the Begin button if the browser is incapable of using WebAuthn
if (!supportsWebauthn()) {
  elemBegin.style.display = 'none';
  elemError.innerText = 'It seems this browser doesn\'t support WebAuthn...';
}
```

Once the "Use WebAuthn" button is clicked, we fetch the attestation options from the server.

```javascript
  const resp = await fetch("/webauthn/generate-attestation-options");
```

 With SimpleWebAuthn, the generation of attestation options is very straightforward. However, there are a lot of options that can seem intimidating. Reading the [low-level documentation](https://rickrolled.com/) could provide more confidence, however we will cover the most important options.

We will move onto our server-side route responsible for generating webauthn attestatioin options.
 
 `$ routes/webauthn.ts`
 ```javascript
 import {
  generateAttestationOptions,
  verifyAttestationResponse,
  generateAssertionOptions,
  verifyAssertionResponse,
} from "@simplewebauthn/server";

import type {
  AttestationCredentialJSON,
  AssertionCredentialJSON,
  AuthenticatorDevice,
} from "@simplewebauthn/typescript-types";

 // Omitted

const rpID = "localhost";
const expectedOrigin = `http://${rpID}:3000`;

//Omitted

router.get("/generate-attestation-options", (req, res) => {
  const user = database[req.cookies.user];
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
  Using our mock session cookie, we can query for our user from the database. We will want extract the username and any devices the current user has, in case they are an existing user registering a new type of device. 


 WebAuthn scopes each new key pair to a specific relying party. Because of this scoping, we have to pass information about the organization that owns the service into our options. `rpName` and `rpID` are the name and domain of the organization, in that order. 

The `userId` is a special value, and one that we will see in more depth starting with [[4 -  WebAuthn Usernameless]]. This is _not_ the unique identifier that the resource or authorization server use as a primary key in their database. Instead, it is a randomly generated string, preferrably 64 bytes, that will be used specifically for associating authenticators to a user account. This _cannot_ be private information or a string that can be used to identify someone outside of your system. This is often called the `user handle` and should be used as the `userId` for all WebAuthn authenticators registered with the account. You can just save it as a column or property in your database with your user.

The `timeout` property seems self explanatory, but its important. It allows us to specifiy the amount of time we want to allow a user to spending finding their devices, connecting them, and using them. `attestationType` specifies what type of attestation data we want to received from the authenticators attestation response. We will leave it as indirect, meaning the server will accept anonymized attestation data.

Next is `excludeCredentials`. This option can include the credentials of previously registered devices, which allows the relying party to prevent a user from using the same device to create multiple credentials. The `transports` property indicates the transport protocol allowed.

Lastly, we have `authenticatorSelection`. `userVerification` is a property to determine if a local authentication ceremony, like a pin code, should be performed.

Now that we have covered the basics of our attestation options, we have to look at arguably the most important variable in the whole ceremony: the `challenge`. SimpleWebAuthn allows the server to generate its own challenge, however if one is not provided the library will create one for you. This value ultimately becomes base64 encoded, which the authenticator will sign later. We add it onto our users record in the database for use in attestation verification.

It is very important that the challenges is persisted on the user in our state or database.

`$ routes/webauthn.ts`

```javascript
//Omitted
inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

res.send(options);
//Omitted
```

The server returns the generated options to the client.

Finally, back on the client, we can start attestation using the SimpleWebAuthn `startAttestation` method. This method is a wrapper around the WebAuthn API implemented with [PublicKeyCredential](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential). More specifically, the [CredentialsContainer.create()](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create) method. Using the options generated by the server, this method will interface with the authenticator paired or built into the device to create an instance of the PublicKeyCredential, mentioned above.
 
 `$ public/two-factor/webauthn/webauthn.js`
 ```javascript
  const attResp = await startAttestation(await resp.json());
```

Once we have the attestation response, we will POST this data to our `verify-attestation` endpoint. The response from that endpoint will determine if the authenticator can be verified or not.

 `$ public/two-factor/webauthn/webauthn.js`
```javascript
  const verificationResp = await fetch("/webauthn/verify-attestation", {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json',
	},
	body: JSON.stringify(attResp),
  });

  return verificationResp.json();
```

Server-side attestation verification is also made very simple with SimpleWebAuthn. The `verifyAttestationResponse` method takes the previously verification response from the authenticator, the expected challenge, the expected origin, and the expected rpId (relying party identifier).

`$ routes/webauthn.ts`
```javascript
router.post("/verify-attestation", async (req, res) => {
  const loggedInUser = req.cookies.user;
  const body: AttestationCredentialJSON = req.body;
  const user = database[loggedInUser];
  const expectedChallenge = user.currentChallenge;

  let verification;
  try {
    verification = await verifyAttestationResponse({
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message });
  }

  const { verified, attestationInfo } = verification;
// Omitted
});
```

The `expectedChallenge` is the same challange value we previously created and save on our user stored in the database. The `expectedOrigin` and `expectedRPID` are the servers origin and allowed domain, in that order. You may think, aren't these the same value? They definitely can be. However, registrable suffixs can be used with one or more subdomains. 

The domain is the full origin of the client we want to allow registration from while the rpId is the domain of the authorization server. You might see these values differ when using sub-domains and single-page applications (SPAs).

During attestation verification, SimpleWebAuthn will parse the [clientDataJSON](https://www.w3.org/TR/webauthn-2/#dom-authenticatorresponse-clientdatajson) and the [attestationObject](https://www.w3.org/TR/webauthn-2/#dom-authenticatorattestationresponse-attestationobject). The data extracted is used to verify the expected values from the relying party. The method then returns the crucial credential data for the server to save in the database as a device. We can now finish the registration of our user! You'll notice the user is redirected to a basic profile page where we can see a blob of the JSON data we are storing in our makeshift database on the server. There is nothing too important going on with the profile page and route, aside from fetching the user data and validating that they were logged in with the `user.loggedIn` value from our database.

`$ routes/webauthn.ts`
```javascript
if (verified && attestationInfo) {
  const { credentialPublicKey, credentialID, counter } = attestationInfo;

  const existingDevice = user.devices.find(
    (device) => device.credentialID === credentialID
  );

  if (!existingDevice) {
    const newDevice: AuthenticatorDevice = {
      credentialPublicKey,
      credentialID,
      counter,
    };
    user.devices.push(newDevice);
  }

  user.loggedIn = true;

  res.send({ verified });
} else {
  res.status(401).send("unauthorized");
}
```

> ***Important***: This is not a safe way to actually implement a session or checking if a user is authenticated. Like before, it is recommended to use some sort of token that can be signed and verified by the server.

Congratualations! Our new user has now secured their account with a FIDO-compliant device as a second factor.

