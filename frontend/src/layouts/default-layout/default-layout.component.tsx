import { MainMenu } from '@components/main-menu/main-menu.component';
import { UserMenu } from '@components/user-menu/user-menu.component';
import { Footer, Header, Link, Logo } from '@sk-web-gui/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { capitalize } from 'underscore.string';

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
    contentElement?.focus();
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

      <NextLink href="#content" onClick={setFocusToMain} className="next-link-a" data-cy="systemMessage-a">
        {t('layout:header.goto_content')}
      </NextLink>

      <Header
        data-cy="nav-header"
        title={headerTitle ? headerTitle : appName}
        subtitle={headerSubtitle ? headerSubtitle : ''}
        aria-label={`${headerTitle ? headerTitle : appName} ${headerSubtitle}`}
        logoLinkOnClick={handleLogoClick}
        LogoLinkWrapperComponent={<NextLink legacyBehavior href={logoLinkHref} passHref />}
        userMenu={<UserMenu />}
        wrapperClasses="py-12"
      >
        <MainMenu />
      </Header>

      {preContent && preContent}

      <div className={`main-container flex-grow relative w-full flex flex-col`}>
        <div className="main-content-padding">{children}</div>
      </div>

      {postContent && postContent}

      <Footer className="bg-primary-surface text-light-primary pt-4 pb-8">
        <Footer.Content className="flex justify-between align-center pt-16 pb-0">
          <Footer.LogoWrapper className="mb-0">
            <Logo inverted className="!h-56" />
          </Footer.LogoWrapper>
          <Footer.ListWrapper className="flex-col gap-16 justify-start w-fit grow-0 pt-4">
            <Footer.ListItem className="flex flex-col text-left items-start gap-0">
              <label>{capitalize(t('common:contact'))}</label>
              <Link variant="tertiary" inverted href="mailto:admin.bou@sundsvall.se">
                admin.bou@sundsvall.se
              </Link>
            </Footer.ListItem>
            <Footer.ListItem></Footer.ListItem>
          </Footer.ListWrapper>
        </Footer.Content>
      </Footer>
    </div>
  );
}
