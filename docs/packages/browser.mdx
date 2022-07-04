---
title: Browser
---

## Installing

### npm

This package is available on **npm** for use in projects that contain a build step, like
in a single-page application:

```bash
npm install @simplewebauthn/browser
```

It can then be imported as usual:

```js
import SimpleWebAuthnBrowser from '@simplewebauthn/browser';
```

### UMD

The Browser package can also be installed using a traditional `<script>` tag. Copy-paste the code below into your HTML page's `<head>` element to begin:

```html
<script src="https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js"></script>
```

**NOTE:** If using this in production, we recommend that you...

1. Visit the URL in the above `<script>` tag to get the exact-version URL that it redirects you to.
2. Enter that versioned URL into the [SRI Hash Generator](https://www.srihash.org/) to create a version of that script tag that includes a subresource integrity checksum, to ensure you are always getting the exact, unmodified version of that file that you requested.

The library's methods will be available on the global `SimpleWebAuthnBrowser` object.

## Methods

The following methods are exported from **@simplewebauthn/browser**:

### `startRegistration()`

"Registration" is analogous to new account creation. The front end uses the following methods from this package to accomplish this:

```js
import { startRegistration } from '@simplewebauthn/browser';
```

The front end's primary job during registration is the following:

1. Get registration options from the Relying Party (your server)
    - See [@simplewebauthn/server's `generateRegistrationOptions()`](packages/server.md#1-generate-registration-options)
2. Submit registration options to the authenticator
3. Submit the authenticator's response to the Relying Party for verification
    - See [@simplewebauthn/server's `verifyRegistrationResponse()`](packages/server.md#2-verify-registration-response)

Below is all of the front end JavaScript needed to fulfill these three steps using this package:

:::info
The code below is a basic implementation written in **plain JavaScript** for placement **in a plain HTML document**. **@simplewebauthn/browser** is installed following the **"UMD"** installation method mentioned above.

That said, this general sequence of events should be easily adaptable to the front end framework of your choice (React/VueJS/Svelte/etc...) for use in projects that follow the above `npm install` installation method.
:::

```html
<script>
  const { startRegistration } = SimpleWebAuthnBrowser;

  // <button>
  const elemBegin = document.getElementById('btnBegin');
  // <span>/<p>/etc...
  const elemSuccess = document.getElementById('success');
  // <span>/<p>/etc...
  const elemError = document.getElementById('error');

  // Start registration when the user clicks a button
  elemBegin.addEventListener('click', async () => {
    // Reset success/error messages
    elemSuccess.innerHTML = '';
    elemError.innerHTML = '';

    // GET registration options from the endpoint that calls
    // @simplewebauthn/server -> generateRegistrationOptions()
    const resp = await fetch('/generate-registration-options');

    let attResp;
    try {
      // Pass the options to the authenticator and wait for a response
      attResp = await startRegistration(await resp.json());
    } catch (error) {
      // Some basic error handling
      if (error.name === 'InvalidStateError') {
        elemError.innerText = 'Error: Authenticator was probably already registered by user';
      } else {
        elemError.innerText = error;
      }

      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyRegistrationResponse()
    const verificationResp = await fetch('/verify-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      elemSuccess.innerHTML = 'Success!';
    } else {
      elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
        verificationJSON,
      )}</pre>`;
    }
  });
</script>
```

### `startAuthentication()`

"Authentication" is analogous to existing account login. Authentication in the front end uses the following methods from this package:

```js
import { startAuthentication } from '@simplewebauthn/browser';
```

The front end's primary job during authentication is the following:

1. Get authentication options from the Relying Party (your server)
    - See [@simplewebauthn/server's `generateAuthenticationOptions()`](packages/server.md#1-generate-authentication-options)
2. Submit authentication options to the authenticator
3. Submit the authenticator's response to the Relying Party for verification
    - See [@simplewebauthn/server's `verifyAuthenticationResponse()`](packages/server.md#2-verify-authentication-response)

Below is all of the front end JavaScript that is needed to fulfill these three steps using this package:

:::info
The code below is a basic implementation written in **plain JavaScript** for placement **in a plain HTML document**. **@simplewebauthn/browser** is installed following the **"UMD"** installation method mentioned above.

That said, this general sequence of events should be easily adaptable to the front end framework of your choice (React/VueJS/Svelte/etc...) for use in projects that follow the above "npm" installation method.
:::

```html
<script>
  const { startAuthentication } = SimpleWebAuthnBrowser;

  // <button>
  const elemBegin = document.getElementById('btnBegin');
  // <span>/<p>/etc...
  const elemSuccess = document.getElementById('success');
  // <span>/<p>/etc...
  const elemError = document.getElementById('error');

  // Start authentication when the user clicks a button
  elemBegin.addEventListener('click', async () => {
    // Reset success/error messages
    elemSuccess.innerHTML = '';
    elemError.innerHTML = '';

    // GET authentication options from the endpoint that calls
    // @simplewebauthn/server -> generateAuthenticationOptions()
    const resp = await fetch('/generate-authentication-options');

    let asseResp;
    try {
      // Pass the options to the authenticator and wait for a response
      asseResp = await startAuthentication(await resp.json());
    } catch (error) {
      // Some basic error handling
      elemError.innerText = error;
      throw error;
    }

    // POST the response to the endpoint that calls
    // @simplewebauthn/server -> verifyAuthenticationResponse()
    const verificationResp = await fetch('/verify-authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asseResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();

    // Show UI appropriate for the `verified` status
    if (verificationJSON && verificationJSON.verified) {
      elemSuccess.innerHTML = 'Success!';
    } else {
      elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
        verificationJSON,
      )}</pre>`;
    }
  });
</script>
```

### `browserSupportsWebauthn()`

This helper method is included in this package to help preemptively check for the browser's ability to make WebAuthn API calls:

```js
import { browserSupportsWebauthn } from '@simplewebauthn/browser';
```

`startRegistration()` and `startAuthentication()` both call this method internally. In some scenarios, though, it may be more desirable to hide UI when the page loads and a call to `browserSupportsWebauthn()` returns false:

```html
<script>
  const elemBegin = document.getElementById('btnBegin');
  const elemSuccess = document.getElementById('success');
  const elemError = document.getElementById('error');

  const { browserSupportsWebauthn } = SimpleWebAuthnBrowser;

  if (!browserSupportsWebauthn()) {
    elemBegin.style.display = 'none';
    elemError.innerText = 'It seems this browser does not support WebAuthn...';
    return;
  }

  // ...snip...
</script>
```

### `browserSupportsWebAuthnAutofill()`

This helper method checks for a browser's support for "[Conditional UI](https://github.com/w3c/webauthn/wiki/Explainer:-WebAuthn-Conditional-UI)". When this feature is present, the browser is capable of presenting a list of the user's discoverable credentials in the browser's native autofill prompt.

```js
import { browserSupportsWebAuthnAutofill } from '@simplewebauthn/browser';
```

This method is automatically called by `startAuthentication()` when `true` is passed as a second argument, but it may still be independently useful in, for example, single-page applications that may seek to initiate authentication after page load.

### `platformAuthenticatorIsAvailable()`

"Platform authenticators" are known by most users by their brand names: **Touch ID**, **Face ID**, **Windows Hello**...this asynchronous method helps you identify opportunities in which these types of authenticators can be used by your users:

```js
import { platformAuthenticatorIsAvailable } from '@simplewebauthn/browser';
```

These advanced types of authenticators are typically embedded into a user's computer or phone and offer quick confirmation of a user's identity via biometric scan or PIN fallback. As a result of their convenience, you may wish to prioritize user registration of such authenticators when one is available for use:

```html
<script>
  const { platformAuthenticatorIsAvailable } = SimpleWebAuthnBrowser;

  (async () => {
    if (await platformAuthenticatorIsAvailable()) {
      /**
       * Prompt the user to use Touch ID/Windows Hello/etc... or security keys to register or
       * authenticate
       *
       * How to decide which name to show for the device's platform authenticator is an exercise
       * left up to the developer (your best bet is User Agent analysis)
       */
    } else {
      /**
       * Only prompt the user to use security keys to register or authenticate
       */
    }
  })();
</script>
```

## Additional API Documentation

Lower-level API docs for this package are available here:

https://api-docs.simplewebauthn.dev/modules/_simplewebauthn_browser.html
