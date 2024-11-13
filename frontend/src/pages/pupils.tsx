import { MainMenu } from '@components/main-menu/main-menu.component';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { TopBar } from '@layouts/top-bar/top-bar.component';
import { useUserStore } from '@services/user-service/user-service';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useShallow } from 'zustand/react/shallow';
import { capitalize } from 'underscore.string';
import { usePupils } from '@services/pupil-service';
import { useEffect } from 'react';
import { PupilTable } from '@components/pupil-table/pupil-table.component';

export const Pupils: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore(useShallow((state) => state.user));
  const { schoolUnit, setSchoolUnit, totalRecords, pageSize, pageNumber } = usePupils();

  const firstRecord = (pageNumber - 1) * pageSize + 1;
  const lastRecord = firstRecord - 1 + pageSize <= totalRecords ? firstRecord - 1 + pageSize : totalRecords;

  useEffect(() => {
    if (!schoolUnit || !user?.schoolUnits?.includes(schoolUnit)) {
      setSchoolUnit(user.schoolUnits[0]);
    }
  }, [user]);

  return (
    <DefaultLayout postTitle={capitalize(t('pupils:name', { count: 2 }))}>
      <Main>
        <TopBar>
          <MainMenu />
        </TopBar>
        <PupilTable />
      </Main>
    </DefaultLayout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'common',
      'example',
      'layout',
      'lockers',
      'pupils',
      'schools',
      'codelocks',
      'crud',
    ])),
  },
});

export default Pupils;
