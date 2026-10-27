'use client';

import { PupilFilters } from '@components/pupil-filters/pupil-filters.component';
import { PupilTable } from '@components/pupil-table/pupil-table.component';
import { TopBar } from '@layouts/top-bar/top-bar.component';
import { usePupils } from '@services/pupil-service';
import { useUserStore } from '@services/user-service/user-service';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { useShallow } from 'zustand/react/shallow';

export const PupilsPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore(useShallow((state) => state.user));
  const { schoolUnit, setSchoolUnit, totalRecords, pageSize, pageNumber } = usePupils();

  const firstRecord = (pageNumber - 1) * pageSize + 1;
  const lastRecord = Math.min(firstRecord - 1 + pageSize, totalRecords);

  useEffect(() => {
    if (!schoolUnit || !user?.schoolUnits?.includes(schoolUnit)) {
      setSchoolUnit(user.schoolUnits[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
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
    </>
  );
};
