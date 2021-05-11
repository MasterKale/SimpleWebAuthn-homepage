---
title: WebAuthn as a 2nd Factor
---

## What is MFA?
MFA, or Multi-factor Authenticatoin, is a method of requiring a user to perform two or more verfication factors before they can successfully gain access to their account, application, or whatever resource being guarded. These verfication factors are:

- What you know.
- What you have.
- What you are.

Username and password credentials only cover one of those factors (what you know). Most applications provide MFA using SMS, push notifications, or one-time passowrds. These examples all over the "what you have" factor. The least common factor, what you are, is most commonly seen with biometrics like face ID and touch ID.

## Why use WebAuthn as a 2nd Factor?
WebAuthn as a 2nd is currently seen as one of the most secure factor methods. WebAuthn uses public key cryptography and even has standards that prevent websites and malicious actors from surreptitiously looking for information about your WebAuthn credentials. Because each credential is scoped to a specific domain, WebAuthn also prevents man-in-the-middle and phising attacks. Another great aspect about WebAuthn is that, in many cases, WebAuthn can act as two factors. What you have, and either what you know or what you are.

## The Recipe
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
We will start with looking at the log in and sign-up page. There is not a lot going on with this page. There are two basic forms, each submitting to their respective server side routes.

```html
  <div class="container">
    <h1>🚪&nbsp;Register</h1>
    <form method="POST" action="/signup">
      <input type="text" required name="username" placeholder="Username">
      <input type="password" required name="password" placeholder="Password">
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign Up</button>
    </form>

    <h1>🚪&nbsp;Login</h1> 
    <form method="POST" action="/login">
      <input type="text" required name="username" placeholder="Username">
      <input type="password" required name="password" placeholder="Password">
      <button class="btn btn-lg btn-primary btn-block" type="submit">Login</button>
    </form>
  </div>
```

The sign-up route will be the first to make use of our server side state. In this case, we have an in-memory dictionary to mock a database. Once we extract the username and password from the request body, we persist the user in our "database". 

```javascript
const { username, password } = req.body;
const user: LoggedInUser = {
	id: crypto.randomBytes(15).toString('hex'),
	username,
	password,
	loggedIn: false,
	devices: [],
}

inMemoryUserDeviceDB[user.id] = user;

// This needs to be a signed token, in a real application
// A jwt or some other opaque token containing the status of the session
// with the ability to validate a signature
res.cookie('id', user.id, { maxAge: 900000, secure: true });

// Now that we have started the signup flow, we need to finish it with MFA registration

res.redirect('/webauthn-attestation')
```

As you can see, this route redirects to the webauthn-attestation page. We will cover that later. Before we redirect, we add a cookie to response. This is done to mock out the functionality of a session in a real server. At this point, the user has started signing up, but has not been granted full access to the application.

> ***Important***: In a real server, its very important that the cookie added to the response is some type of signed token, like a JWT, containing the state of the session. The signed cookie should be validated upon every request.

### WebAuthn Attestation
With WebAuthn, there are two types of certificates used for registration and authentication. These are attestation and assertion. 

When a new key pair is registered with a service, the authenticator can be instructed the public key with an attestation certificate. Checking the device attestation signature is covered in the mini recipe [[4- Check Device Attestation]]. For this examples purpose, attestation is simply another way of saying that a new key pair credential is being created. Since our new user needs a second factor, we need to create a WebAuthn credential to act as the second factor.

The WebAuthn Attestation page has a handful of responsibilites.

 We start off with grabbing the `startAttestation` and `supportsWebauthn` methods from `SimpleWebAuthnBrowser` package. Before trying to use the WebAuthn API, it is important to check that the API is available in the browser being used.
 
 ```javascript
// Imported using a CDN script
const { startAttestation, supportsWebauthn } = SimpleWebAuthnBrowser;

// Hide the Begin button if the browser is incapable of using WebAuthn
if (!supportsWebauthn()) {
  elemBegin.style.display = 'none';
  elemError.innerText = 'It seems this browser doesn\'t support WebAuthn...';
}
```

Once the "begin" button is clicked, we fetch the attestation options from the server.

```javascript
 const resp = await fetch('/generate-attestation-options');
```

 With SimpleWebAuthn, the generation of attestation options is very straightforward. However, there are a lot of options that can seem intimidating. Because of the amount of information that could be provided with these options, we have created an assortment of mini-recipes to provide in-depth examples of many of the options. Links to the mini-recipes will be provided as we go.

 Using our mock session cookie, we can query for our user from the database. We will want extract the username and any devices the current user has, in case they are an existing user registering a new type of device. 
 
 WebAuthn scopes each new key pair to a specific relying party, covered in depth with [[5 - Credential Scoping and Subdomains]]. Because of this scoping, we have to pass information about the organization that owns the service into our options. `rpName` and `rpID` are the name and domain of the organization, in that order. The `userId` is a special value, and one that we will see in more depth starting with [[4 -  WebAuthn Usernameless]]. This is _not_ the unique identifier that the resource or authorization server use as a primary key in their database. Instead, it is a randomly generated string, preferrably 64 bytes, that will be used specifically for associating authenticators to a user account. This _cannot_ be private information or a string that can be used to identify someone outside of your system. This is often called the `user handle` and should be used as the `userId` for all WebAuthn authenticators registered with the account. You can just save it as a column or property in your database with your user.
 
```javascript

import { generateAssertionOptions } from '@simplewebauthn/server';

// Omitted

const options = generateAttestationOptions({
	rpName: 'SimpleWebAuthn Example',
	rpID,
	userID: userHandle
	userName: username,
	timeout: 60000,
	attestationType: 'indirect',
	excludeCredentials: devices.map(dev => ({
	  id: dev.credentialID,
	  type: 'public-key',
	  transports: ['usb', 'ble', 'nfc', 'internal'],
	})),
	authenticatorSelection: {
	  userVerification: 'preferred',
	  requireResidentKey: false,
	},
});

```

The `timeout` property seems self explanatory, but its ultimately important. It allows us to specifiy the amount of time we want to allow a user to spending finding their devices, connecting them, and using them. `attestationType` is an advanced option to specifiy what type of attestation data we want to received from the authenticators attestation response. This is covered in [[4- Check Device Attestation]], so we will simply leave it as indirect, meaning the server will accept anonymized attestation data.

Next is `excludeCredentials`. This option can include the credentials of previously registered devices, which allows the relying party to prevent a user from using the same device to create multiple credentials. The `transports` property is another option covered in a mini-recipe, [[2 - Device Transports]].

Lastly, we have `authenticatorSelection`. `userVerification` is a property to determine if a local authentication ceremony, like a pin code, should be performed. This property is explored in depth with the [[1 - User Verification and User Prescence]] mini-recipe. The `requireResidentKey` is another advanced option with WebAuthn and is in depth in the following examples for [[3 - WebAuthn Passwordless]] and [[4 -  WebAuthn Usernameless]].

Now that we have covered the basics of our attestation options, we have to look at arguably the most important variable in the whole ceremony: the `challenge`. SimpleWebAuthn allows the server to generate its own challenge, however if one is not provided the library will create one for you. This value ultimately becomes  a base64 encoded value, which the authenticator will sign later. We add it onto our users record in the database for use in attestation verification.

```javascript

// It is very important that the challenges is persisted on the user in our state or database
inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

res.send(options);
```

The server returns the generated options to the client.

Finally, back on the client, we can start attestation using the SimpleWebAuthn `startAttestation` method. This method is a wrapper around the WebAuthn API implemented with [PublicKeyCredential](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential). More specifically, the [CredentialsContainer.create()](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create) method. Using the options generated by the server, this method will interface with the authenticator paired or built into the device to create an instance of the PublicKeyCredential, mentioned above.
 
 ```javascript
  let attResp;
  try {
	attResp = await startAttestation(await resp.json());
  } catch (error) {
	if (error.name === 'InvalidStateError') {
	  elemError.innerText = 'Error: Authenticator was probably already registered by user';
	} else {
	  elemError.innerText = error;
	}

	throw error;
  }
```

Once we have the attestation response, we will POST this data to our `verify-attestation` endpoint. The response from that endpoint will determine if the authenticator can be verified or not.

```javascript
  const verificationResp = await fetch('/verify-attestation', {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json',
	},
	body: JSON.stringify(attResp),
  });

  const verificationJSON = await verificationResp.json();
```

Attestation verification is also made very simple with SimpleWebAuthn. The `verifyAttestationResponse` method takes the previously verification response from the authenticator, the expected challenge, the expected origin, and the expected rpId (relying party identifier).

```javascript
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
```

The `expectedChallenge` is the same challange value we previously created and save on our user stored in the database. The `expectedOrigin` and `expectedRPID` are the servers origin and allowed domain, in that order. You may think, aren't these the same value? They definitely can be. However, as explained more in [[5 - Credential Scoping and Subdomains]], the domain is the full origin of the client we want to allow registration from while the rpId is the domain of the authorization server. You might see these values differ when using sub-domains and single-page applications (SPAs).

During attestation verification, SimpleWebAuthn will parse the [clientDataJSON](https://www.w3.org/TR/webauthn-2/#dom-authenticatorresponse-clientdatajson) and the [attestationObject](https://www.w3.org/TR/webauthn-2/#dom-authenticatorattestationresponse-attestationobject). The data extracted is used to verify the expected values from the relying party. The method then returns the crucial credential data for the server to save in the database as a device. We can now finish the registration of our user! You'll notice the user is redirected to a basic profile page where we can see a blob of the JSON data we are storing in our makeshift database on the server. There is nothing too important going on with the profile page and route, aside from fetching the user data and validating that they were logged in with the `user.loggedIn` value from our database.

> ***Important***: This is not a safe way to actually implement a session or checking if a user is authenticated. Like before, it is recommended to use some sort of token that can be signed and verified by the server.

```javascript
  const { verified, attestationInfo } = verification;

  if (verified && attestationInfo) {
    const { credentialPublicKey, credentialID, counter } = attestationInfo;

    const existingDevice = user.devices.find(device => device.credentialID === credentialID);

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
    res.status(401).send('unauthorized');
  }
```

Before we move forward with logging in and `WebAuthn Assertions`, lets look at the values returned in from attestation in detail, so you can understand what we are saving in our database. 

We will start with the `credentialPublicKey`. If you are familiar with asymmetric cryptography, or public-key cryptography, you will immediately know what this is for. When a user registers and authenticates with their WebAuthn compatible authenticator, the server needs to be absolutely sure that the entity requesting authentication is who we are expecting. The server will generate a challenge and send that to the authenticator. From there, the authenticator will use a private key to sign the challenge. The server then uses the `credentialPublicKey` to validate the signature and prove that we know who is requesting access. With asymmetric cryptography, it is assumed that anyone and everyone can have access to the _public_ key. However, its imperitive that only the authenticator has access to the unencrypted _private_ key.

Next, lets look at the [`credentialId`](https://www.w3.org/TR/webauthn-2/#credential-id). This value is very important. The `credentialId` is the [public key credential source](https://www.w3.org/TR/webauthn-2/#public-key-credential-source) for the credential. In other words, this data contains the private key and identification properties for this credential, like the rpId and an ID for the credential.

> The WebAuthn specification points out two different potential values for the `credentialId`, one that was just explained and another is just some bytes. This detail is an abstraction that is more important for how an authenticator's firmware was implemented. Relying Parties do not need to distinguish these two Credential ID forms.

But wait a second! I thought that only the authenticator should have access to the private key?! Even though the `credentialId` is made using the public key credential source, it is comepletely safe to hand off to the relying party. The value is created using Key Wrapping, which is a type of _symmetric_ encryption where one private key is used to encryption another private key. As you might have guessed, this means that we have a second private key at play here! When a device is manufactorer, there is a private key embedded on each device. This single private key is used to encrypt and decrypt all of the private keys that are generated while using the authenticator. Don't worry if this is hard to follow. It is not crucial to actually using WebAuthn, but is certainly a good detail to know when handling the credentials in your server.

Finally, we have the `counter`. [Counters)](https://www.w3.org/TR/webauthn-2/#signature-counter) are the more basic concepts with authentication devices. They are a value that is incremented upon every assertion done by the device. Basically, its just a value to track how many times an authenticator has been used. This is used to mitigated the possibility of an authenticator being cloned by a malicious entity.

###  Log In with Password Credentials
The login route is pretty much identical to the registration route, excepted we find an existing user based on the password credentials and redirect to the WebAuthn Assertion page.

### WebAuthn Assertions
The workflow for assertions is very similar to attestation. Back on the client, we generate our options, start the assertion with WebAuthn using SimpleWebAuthn's `startAssertion` method. Once we have the response from the authenticator, we will send it to the server.

```javascript
	  const resp = await fetch('/generate-assertion-options');

      let asseResp;
      try {
        const opts = await resp.json();
        asseResp = await startAssertion(opts);
      } catch (error) {
        elemError.innerText = error;
        throw new Error(error);
      }

      const verificationResp = await fetch('/verify-assertion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asseResp),
      });

      const verificationJSON = await verificationResp.json();
```

Lets take a closer look at the assertion options we created on the server.

```javascript

  const options = generateAssertionOptions({
    timeout: 60000,
    allowCredentials: user.devices.map(dev => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: ['usb', 'ble', 'nfc', 'internal'],
    })),
    userVerification: 'preferred',
    rpID,
  });

  inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;
```

There are some similarities between these options and the ones generated for attestation. The unfamiliar property, `allowedCredentials`, is at sounds. It lets you decide which credentials are allowed for this particular authentication. For example, if a user had 3 devices, but lost one of them, you could just send the 2 credentials that you know they still have access too. As youll notice when testing, if you have mutliple WebAuthn compatible devices, the browser will prompt for you to choose a device to authenticate with. This property can help shape that list.

Next, like before, we save the newest challenge on these user so that we can verify the signature during verification.

Once the browser has generated the assertion response, the response payload is sent to the server's assertion-verification endpoint.
Much like with assertion, we have to retrived the challenge and provided all of the expected values for the challange, rp, and origin of the client.

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
 
 What is new here is a parameter for `authenticator`. With `SimpleWebAuthn.verifyAssertionResponse`,  the authenticator is an interface that represents the credential specific data we saved during attestation. This object must contain the `credentialPublicKey`, the `credentialId`, and the `counter`. SimpleWebAuthn validates the signature, the expectations, and the counter. 
 
Within our `verification` response, we have two _very_ important properties - `verified` and `assertionInfo`. `verified` will tell us if the assertion was succesful. We must check that this value is true. Next, `assertionInfo` contains the `newCounter` that we must update our database with. Incrementing the counter is an absolute must. The counter of an autenticator plays a crucial role in preventing authenticator cloning and replay attacks.
 
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

This will complete the 2FA login ceremony and route you back to the profile page to see the data. Make note of how the counter should increment.

Feel free to go through signing up and logging in multiple times to see how the data changes.

With that, we have succesfully seen what it takes to implement WebAuthn using SimpleWebAuthn, and then using it as a second factor to meet the criteria of a multi-factor authentication system.

While we cover a lot of the important WebAuthn details that can be carried over into the next recipes, we have just started scratching the surface of how we can leverage WebAuthn in our applications.

Next up, we will see what it takes to turn our application from a password credential with 2FA authentication flow, to a passwordless one.
