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
<script src="https://unpkg.com/@simplewebauthn/browser/dist/simplewebauthn-browser.min.js"></script>
```

The library's methods will be available on the global `SimpleWebAuthnBrowser` object.

## Methods

The following methods are exported from **@simplewebauthn/browser**:

### `startRegistration()`

**Registration** is analogous to new account creation. The front end uses the following methods from this package to accomplish this:

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

**Authentication** is analogous to existing account login. Authentication in the front end uses the following methods from this package:

```js
import { startAuthentication } from '@simplewebauthn/browser';
```

The front end's primary job during authentication is the following:

1. Get authentication options from the Relying Party (your server)
    - See [@simplewebauthn/server's `generateAssertionOptions()`](packages/server.md#1-generate-authentication-options)
2. Submit authentication options to the authenticator
3. Submit the authenticator's response to the Relying Party for verification
    - See [@simplewebauthn/server's `verifyAssertionResponse()`](packages/server.md#2-verify-authentication-response)

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
    // @simplewebauthn/server -> generateAssertionOptions()
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
    // @simplewebauthn/server -> verifyAssertionResponse()
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

### `supportsWebauthn()`

A helper method is included in this package to help preemptively check for the browser's ability to make WebAuthn API calls:

```js
import { supportsWebauthn } from '@simplewebauthn/browser';
```

`startRegistration()` and `startAuthentication()` both call this method internally. In some scenarios, though, it may be more desirable to hide UI when the page loads and a call to `supportsWebauthn()` returns false:

```html
<script>
  const elemBegin = document.getElementById('btnBegin');
  const elemSuccess = document.getElementById('success');
  const elemError = document.getElementById('error');

  const { startRegistration, supportsWebauthn } = SimpleWebAuthnBrowser;

  if (!supportsWebauthn()) {
    elemBegin.style.display = 'none';
    elemError.innerText = 'It seems this browser does not support WebAuthn...';
  }

  // ...snip...
</script>
```

## Additional API Documentation

Lower-level API docs for this package are available here:

https://api-docs.simplewebauthn.dev/modules/_simplewebauthn_browser.html
