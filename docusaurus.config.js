module.exports = {
  title: 'SimpleWebAuthn',
  tagline: 'A collection of TypeScript-first libraries for simpler WebAuthn integration. Supports modern browsers and Node.',
  url: 'https://simplewebauthn.dev',
  baseUrl: '/',
  favicon: 'img/logo_favicon.png',
  organizationName: 'MasterKale', // Usually your GitHub org/user name.
  projectName: 'SimpleWebAuthn', // Usually your repo name.
  themeConfig: {
    sidebarCollapsible: false,
    navbar: {
      title: 'SimpleWebAuthn',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo_favicon.png',
      },
      links: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
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
      apiKey: '0c7c51fc700e55ff051a454fec072878',
      indexName: 'simplewebauthn',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // Specify the doc ID to display as the `docs/` root page
          homePageId: 'simplewebauthn/intro',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/MasterKale/SimpleWebAuthn-homepage/edit/master',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
