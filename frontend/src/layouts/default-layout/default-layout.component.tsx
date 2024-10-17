import { CookieConsent, Footer, Header, Link, Logo } from '@sk-web-gui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { capitalize } from 'underscore.string';
import { UserMenu } from '@components/user-menu/user-menu.component';

interface DefaultLayoutProps {
  children: React.ReactNode;
  title?: string;
  postTitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  preContent?: React.ReactNode;
  postContent?: React.ReactNode;
  logoLinkHref?: string;
}

export default function DefaultLayout({
  title,
  postTitle,
  headerTitle,
  headerSubtitle: _headerSubtitle,
  children,
  preContent = undefined,
  postContent = undefined,
  logoLinkHref = '/',
}: DefaultLayoutProps) {
  const { t } = useTranslation();

  const router = useRouter();
  const appName = t(`common:app_name`);
  const appSubtitle = t(`common:app_subtitle`);
  const headerSubtitle = _headerSubtitle ?? appSubtitle;
  const layoutTitle = `${appName}${headerSubtitle ? ` - ${headerSubtitle}` : ''}`;
  const fullTitle = postTitle ? `${postTitle} - ${layoutTitle}` : `${layoutTitle}`;

  const setFocusToMain = () => {
    const contentElement = document.getElementById('content');
    contentElement.focus();
  };

  const handleLogoClick = () => {
    router.push(logoLinkHref);
  };

  return (
    <div className="DefaultLayout full-page-layout">
      <Head>
        <title>{title ? title : fullTitle}</title>
        <meta name="description" content={`${appName}`} />
      </Head>

      <NextLink href="#content" legacyBehavior passHref>
        <a onClick={setFocusToMain} accessKey="s" className="next-link-a" data-cy="systemMessage-a">
          {t('layout:header.goto_content')}
        </a>
      </NextLink>

      <Header
        data-cy="nav-header"
        title={headerTitle ? headerTitle : appName}
        subtitle={headerSubtitle ? headerSubtitle : ''}
        aria-label={`${headerTitle ? headerTitle : appName} ${headerSubtitle}`}
        logoLinkOnClick={handleLogoClick}
        LogoLinkWrapperComponent={<NextLink legacyBehavior href={logoLinkHref} passHref />}
        userMenu={<UserMenu />}
      />

      {preContent && preContent}

      <div className={`main-container flex-grow relative w-full flex flex-col`}>
        <div className="main-content-padding">{children}</div>
      </div>

      {postContent && postContent}

      <Footer className="bg-primary-surface text-light-primary">
        <Footer.Content className="flex justify-between align-center pt-16">
          <Footer.LogoWrapper>
            <Logo inverted />
          </Footer.LogoWrapper>
          <Footer.ListWrapper className="flex-col gap-16 justify-start w-fit grow-0">
            <Footer.ListItem>
              <label>{capitalize(t('common:contact'))}</label>
            </Footer.ListItem>
            <Footer.ListItem>
              <Link variant="tertiary" inverted href="mailto:admin.bou@sundsvall.se">
                admin.bou@sundsvall.se
              </Link>
            </Footer.ListItem>
          </Footer.ListWrapper>
        </Footer.Content>
      </Footer>

      <CookieConsent
        title={t('layout:cookies.title', { app: appName })}
        body={
          <p>
            {t('layout:cookies.description')}{' '}
            <NextLink href="/kakor" passHref legacyBehavior>
              <Link>{t('layout:cookies.read_more')}</Link>
            </NextLink>
          </p>
        }
        cookies={[
          {
            optional: false,
            displayName: t('layout:cookies.necessary.displayName'),
            description: t('layout:cookies.necessary.description'),
            cookieName: 'necessary',
          },
          {
            optional: true,
            displayName: t('layout:cookies.func.displayName'),
            description: t('layout:cookies.func.description'),
            cookieName: 'func',
          },
          {
            optional: true,
            displayName: t('layout:cookies.stats.displayName'),
            description: t('layout:cookies.stats.description'),
            cookieName: 'stats',
          },
        ]}
        resetConsentOnInit={false}
        onConsent={() => {
          // FIXME: do stuff with cookies?
          // NO ANO FUNCTIONS
        }}
      />
    </div>
  );
}
