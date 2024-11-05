import LoaderFullScreen from '@components/loader/loader-fullscreen';
import { LockerFilters } from '@components/locker-filters/locker-filters.component';
import { LockerTable } from '@components/locker-table/locker-table.component';
import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { TopBar } from '@layouts/top-bar/top-bar.component';
import { useLockers } from '@services/locker-service';
import { useUserStore } from '@services/user-service/user-service';
import { Button, Icon } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';
import { capitalize } from 'underscore.string';
import { useShallow } from 'zustand/react/shallow';

export const Lockers: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore(useShallow((state) => state.user));
  const { loaded, schoolUnit, setSchoolUnit, totalRecords, pageSize, pageNumber } = useLockers();

  const firstRecord = (pageNumber - 1) * pageSize + 1;
  const lastRecord = firstRecord - 1 + pageSize <= totalRecords ? firstRecord - 1 + pageSize : totalRecords;

  useEffect(() => {
    if (!schoolUnit || !user?.schoolUnits?.includes(schoolUnit)) {
      setSchoolUnit(user.schoolUnits[0]);
    }
  }, [user]);

  return !loaded ?
      <LoaderFullScreen />
    : <DefaultLayout postTitle={capitalize(t('lockers:name', { count: 2 }))}>
        <Main>
          <div>
            <TopBar>
              <LockerFilters />
            </TopBar>
            <TopBar className="items-end">
              <div className="flex gap-24 items-end">
                <h1 className="text-h3-sm md:text-h3-md xl:text-h3-lg m-0 leading-label-medium">
                  {capitalize(t('lockers:name'))}
                </h1>
                <span aria-hidden className="text-label-medium ">
                  {t('common:show_count_resource', {
                    first: firstRecord,
                    last: lastRecord,
                    resource: t('lockers:count', { count: totalRecords }),
                  })}
                </span>
              </div>
              <Button variant="primary" color="vattjom" disabled leftIcon={<Icon icon={<Plus />} />}>
                {capitalize(t('common:add_resource', { resource: t('lockers:name') }))}
              </Button>
            </TopBar>
          </div>

          {loaded && <LockerTable />}
        </Main>
      </DefaultLayout>;
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

export default Lockers;
