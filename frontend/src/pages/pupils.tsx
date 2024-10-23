import { MainMenu } from '@components/main-menu/main-menu.component';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { TopBar } from '@layouts/top-bar/top-bar.component';
import { useUserStore } from '@services/user-service/user-service';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useShallow } from 'zustand/react/shallow';
import { capitalize } from 'underscore.string';

export const Pupils: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore(useShallow((state) => state.user));

  return (
    <DefaultLayout postTitle={capitalize(t('pupils:name', { count: 2 }))}>
      <Main>
        <TopBar>
          <MainMenu />
        </TopBar>
      </Main>
    </DefaultLayout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'example', 'layout', 'lockers', 'pupils'])),
  },
});

export default Pupils;
