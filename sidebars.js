module.exports = {
  docsSidebar: {
    SimpleWebAuthn: [
      'simplewebauthn/intro',
      'simplewebauthn/philosophy',
    ],
    Packages: [
      'packages/browser',
      'packages/server',
      'packages/types',
    ],
    'Advanced Guides': [
      'advanced/browser-quirks',
      'advanced/example-project',
      'advanced/fido-conformance',
      'advanced/passkeys',
      'advanced/supported-devices',
      {
        type: 'category',
        label: '@simplewebauthn/server',
        description: 'Advanced functionality specific to @simplewebauthn/server',
        items: [
          'advanced/server/custom-challenges',
          'advanced/server/custom-user-ids',
          'advanced/server/metadata-service',
          'advanced/server/secure-payment-confirmation',
          'advanced/server/settings-service',
        ],
      },
    ],
  },
};
