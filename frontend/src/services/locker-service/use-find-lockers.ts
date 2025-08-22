import { SchoolLocker, SchoolLockerFilter } from '@data-contracts/backend/data-contracts';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { getLockers } from './locker-service';

export const useFindLockers = (schoolUnit: string, filter?: SchoolLockerFilter) => {
  const [data, setData] = useState<SchoolLocker[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterString, setFilterString] = useDebounceValue(JSON.stringify(filter), 300);

  const { handleGetMany } = useCrudHelper('lockers');

  useEffect(() => {
    setFilterString(JSON.stringify(filter));
  }, [filter]);

  useEffect(() => {
    if (schoolUnit) {
      setLoading(true);
      handleGetMany(() =>
        getLockers(schoolUnit, {
          filter,
          PageSize: 100,
          PageNumber: 1,
          OrderBy: 'Name',
          OrderDirection: 'ASC',
        }).catch((e) => {
          setLoaded(false);
          setLoading(false);
          setData([]);
          throw e;
        })
      ).then((res) => {
        if (res) {
          setData(res.data);
          setLoaded(true);
        }
        setLoading(false);
      });
    } else {
      setData([]);
      setLoaded(false);
      setLoading(false);
    }
  }, [schoolUnit, filterString]);

  return { data, loaded, loading };
};
