import LoaderFullScreen from '@components/loader/loader-fullscreen';
import { LockerTable } from '@components/locker-table/locker-table.component';
import { MainMenu } from '@components/main-menu/main-menu.component';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { TopBar } from '@layouts/top-bar/top-bar.component';
import { useLockers } from '@services/locker-service';
import { useUserStore } from '@services/user-service/user-service';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useShallow } from 'zustand/react/shallow';
import { capitalize } from 'underscore.string';

export const Lockers: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore(useShallow((state) => state.user));
  const { loaded } = useLockers(user.schoolUnits?.[0]);

  return !loaded ?
      <LoaderFullScreen />
    : <DefaultLayout postTitle={capitalize(t('lockers:name', { count: 2 }))}>
        <Main>
          <TopBar>
            <MainMenu />
          </TopBar>
          {loaded && <LockerTable schoolUnit={user.schoolUnits?.[0]} />}
        </Main>
      </DefaultLayout>;
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'example', 'layout', 'lockers', 'pupils', 'crud'])),
  },
});

export default Lockers;
