module.exports = {
  title: 'SimpleWebAuthn',
  tagline: 'A collection of TypeScript-first libraries for simpler WebAuthn integration. Supports modern browsers and Node.',
  url: 'https://simplewebauthn.dev',
  baseUrl: '/',
  favicon: 'img/logo_favicon.png',
  organizationName: 'MasterKale', // Usually your GitHub org/user name.
  projectName: 'SimpleWebAuthn', // Usually your repo name.
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
          href: 'https://debugger.simplewebauthn.dev',
          label: 'Debugger',
          position: 'left',
        },
        {
          href: 'https://github.com/MasterKale/SimpleWebAuthn',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: '@simplewebauthn/browser',
        //       to: 'docs/browser/',
        //     },
        //     {
        //       label: '@simplewebauthn/server',
        //       to: 'docs/server/',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/MasterKale/SimpleWebAuthn',
        //     },
        //   ],
        // },
      ],
      copyright: `
        <strong>Copyright © ${new Date().getFullYear()} Matthew Miller. Built with Docusaurus.</strong>
        <br>
        <sub>FIDO® is a trademark (registered in numerous countries) of FIDO Alliance, Inc.</sub>
      `,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/vsDark'),
    },
    algolia: {
      appId: 'E0FZF1RZXD',
      apiKey: '1493c1848b6dea84a2a52014d5e68c10',
      indexName: 'simplewebauthn',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/MasterKale/SimpleWebAuthn-homepage/edit/master',
          sidebarCollapsed: false,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
