module.exports = {
  docsSidebar: {
    SimpleWebAuthn: [
      'simplewebauthn/intro',
      'simplewebauthn/philosophy',
    ],
    Packages: [
      'packages/server',
      'packages/browser',
      'packages/types',
    ],
    'Advanced Guides': [
      'advanced/passkeys',
      'advanced/supported-devices',
      'advanced/browser-quirks',
      'advanced/example-project',
      'advanced/fido-conformance',
      {
        type: 'category',
        label: '@simplewebauthn/server',
        description: 'Advanced functionality specific to @simplewebauthn/server',
        items: [
          'advanced/server/metadata-service',
          'advanced/server/settings-service',
          'advanced/server/secure-payment-confirmation',
        ],
      },
    ],
  },
};
