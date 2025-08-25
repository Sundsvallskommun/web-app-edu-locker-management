import { PupilFilters } from '@components/pupil-filters/pupil-filters.component';
import { PupilTable } from '@components/pupil-table/pupil-table.component';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { TopBar } from '@layouts/top-bar/top-bar.component';
import { usePupils } from '@services/pupil-service';
import { useUserStore } from '@services/user-service/user-service';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { capitalize } from 'underscore.string';
import { useShallow } from 'zustand/react/shallow';

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
        <div>
          <TopBar>
            <PupilFilters />
          </TopBar>
          <TopBar className="items-end h-64">
            <div className="flex gap-24 items-end">
              <h1 className="text-h3-sm md:text-h3-md xl:text-h3-lg m-0 leading-label-medium">
                {capitalize(t('pupils:name_other'))}
              </h1>
              <span aria-hidden className="text-label-medium ">
                {t('common:show_count_resource', {
                  first: firstRecord,
                  last: lastRecord,
                  resource: t('pupils:count', { count: totalRecords }),
                })}
              </span>
            </div>
          </TopBar>
        </div>
        <PupilTable />
      </Main>
    </DefaultLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'sv', [
      'common',
      'example',
      'layout',
      'lockers',
      'pupils',
      'schools',
      'codelocks',
      'crud',
      'notice',
    ])),
  },
});

export default Pupils;
