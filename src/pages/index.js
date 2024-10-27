import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './styles.module.css';

const features = [
  {
    title: 'Simple to Use',
    imageUrl: 'img/2FA.svg',
    description: (
      <>
        It's in the title! SimpleWebAuthn makes it as easy as possible to add WebAuthn-powered
        passkeys to your websites so that you can move on to the fun stuff.
      </>
    ),
  },
  {
    title: 'First-Class TypeScript Support',
    imageUrl: 'img/TS_logo.svg',
    description: (
      <>
        Everything is authored in 100% TypeScript! And a dedicated package for type declarations
        makes it even simpler to use SimpleWebAuthn in your own TypeScript projects.
      </>
    ),
  },
  {
    title: 'FIDO® Conformant',
    imageUrl: 'img/FIDO_Passkey_logo_dark_text.png',
    imageUrlDark: 'img/FIDO_Passkey_logo_light_text.png',
    description: (
      <>
        SimpleWebAuthn passes FIDO® Conformance Server Tests with flying colors! You can rest easy
        knowing that when you need to take things to the next level, SimpleWebAuthn will grow with
        you.
      </>
    ),
  },
];

function Feature({ imageUrl, imageUrlDark, title, description }) {
  const { colorMode } = useColorMode();

  const isDarkTheme = colorMode === 'dark';

  let imgUrl;
  if (isDarkTheme && imageUrlDark) {
    imgUrl = useBaseUrl(imageUrlDark);
  } else {
    imgUrl = useBaseUrl(imageUrl);
  }

  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      description="A collection of TypeScript-first libraries for simpler WebAuthn integration. Supports modern browsers and Node.">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
