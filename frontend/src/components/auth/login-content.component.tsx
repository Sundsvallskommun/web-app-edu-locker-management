'use client';

import LoaderFullScreen from '@components/loader/loader-fullscreen';
import EmptyLayout from '@layouts/empty-layout/empty-layout.component';
import { Button, Icon } from '@sk-web-gui/react';
import { apiURL } from '@utils/api-url';
import { appURL } from '@utils/app-url';
import { Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

// Turn on/off automatic login
const autoLogin = true;

export const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const initialFocus = useRef<HTMLButtonElement>(null);

  const isLoggedOut = searchParams.get('loggedout') === '';
  const failMessage = searchParams.get('failMessage');
  const errorMessage = failMessage ? t(`login:errors.${failMessage}`, { defaultValue: t('login:errors.UNKNOWN') }) : '';

  const onLogin = useCallback(() => {
    const path = searchParams.get('path') || '';

    const url = new URL(apiURL('/saml/login'));
    const queries = new URLSearchParams({
      successRedirect: appURL(path),
      failureRedirect: `${appURL()}/login`,
    });
    url.search = queries.toString();
    // NOTE: send user to login with SSO
    window.location.href = url.toString();
  }, [searchParams]);

  useEffect(() => {
    setTimeout(() => initialFocus.current?.focus());
    // to not flash the login-screen on autologin
    const timer = setTimeout(() => setMounted(true), 500);

    if (isLoggedOut) {
      router.replace('/login');
    } else if (!failMessage && autoLogin) {
      onLogin();
    }

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted && !failMessage) {
    // to not flash the login-screen on autologin
    return <LoaderFullScreen />;
  }

  return (
    <EmptyLayout>
      <main>
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-5xl w-full flex flex-col text-light-primary bg-inverted-background-content p-20 shadow-lg text-left">
            <div className="mb-14">
              <h1 className="mb-10 text-xl">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
              <p className="my-0">{capitalize(t('login:description'))}</p>
            </div>

            <Button inverted onClick={() => onLogin()} ref={initialFocus} data-cy="loginButton">
              {capitalize(t('common:login'))}
            </Button>

            {errorMessage && (
              <p className="flex gap-8 mt-lg text-inverted-error items-center" role="alert">
                <Icon icon={<Info />} size={20} /> {errorMessage}
              </p>
            )}
          </div>
        </div>
      </main>
    </EmptyLayout>
  );
};
