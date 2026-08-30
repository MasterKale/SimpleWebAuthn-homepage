const isDevelopment = (
  // Docusaurus, locally
  process.env.NODE_ENV === 'development'
  // Netlify, in CI for PR preview builds
  || process.env.CONTEXT === 'deploy-preview'
);

module.exports = {
  title: 'SimpleWebAuthn',
  tagline: 'A collection of TypeScript-first libraries for simpler WebAuthn integration. Supports modern browsers and Node.',
  url: 'https://simplewebauthn.dev',
  baseUrl: '/',
  favicon: 'img/logo_favicon.png',
  organizationName: 'MasterKale', // Usually your GitHub org/user name.
  projectName: 'SimpleWebAuthn', // Usually your repo name.

  /* Try to keep track of when links break */
  onBrokenLinks: 'throw',

  /* Prepare for Docusaurus v4 */
  future: {
    faster: true,
    v4: true,
  },

  /* Markdown settings */
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw'
    },
  },

  themeConfig: {
    navbar: {
      title: 'SimpleWebAuthn',
      logo: {
        alt: 'SimpleWebAuthn Logo',
        src: 'img/logo_favicon.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://tools.passkeys.dev/responsedecoder',
          label: 'Debugger',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/MasterKale/SimpleWebAuthn',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      copyright: `
        <strong>Copyright © ${new Date().getFullYear()} Matthew Miller. Built with Docusaurus.</strong>
        <sub>FIDO® is a trademark of FIDO Alliance, Inc.</sub>
        <sub><a href="https://a0.to/signup/simplewebauthn">Sponsored by Auth0 by Okta</a></sub>
      `,
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.vsDark,
    },
    algolia: {
      appId: 'E0FZF1RZXD',
      apiKey: '3780e98137ff937b60274da866ac2cc2',
      indexName: 'simplewebauthn',
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/MasterKale/SimpleWebAuthn-homepage/edit/master',
          sidebarCollapsed: false,
          includeCurrentVersion: isDevelopment,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
