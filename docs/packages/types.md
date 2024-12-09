---
title: "@simplewebauthn/types"
---

:::danger Deprecation notice
It is no longer necessary to install this package if you are running v13+ of either **@simplewebauthn/browser** or **@simplewebauthn/server**. The types that were maintained in this package will be exported directly from those packages going forward. The last published version of @simplewebauthn/types remains available on [NPM](https://www.npmjs.com/package/@simplewebauthn/types/v/12.0.0) and [JSR](https://jsr.io/@simplewebauthn/types@12.0.0) but will no longer be updated going forward.

**Before:**
```ts
import type { WebAuthnCredential } from '@simplewebauthn/types';
```

**After:**
```ts
import { ..., type WebAuthnCredential } from '@simplewebauthn/server';
```
```ts
import { ..., type WebAuthnCredential } from '@simplewebauthn/browser';
```
:::
