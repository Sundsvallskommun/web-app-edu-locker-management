import { SchoolLocker } from '@data-contracts/backend/data-contracts';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useState, useEffect } from 'react';
import { getLocker } from './locker-service';

export const useLocker = (schoolUnit?: string, lockerId?: string, lockerName?: string) => {
  const [data, setData] = useState<SchoolLocker | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { handleGetOne } = useCrudHelper('lockers');

  useEffect(() => {
    setLoaded(false);
    if (schoolUnit && lockerId && lockerName) {
      setLoading(true);
      handleGetOne(() =>
        getLocker(schoolUnit, lockerId, lockerName).catch((e) => {
          setLoading(false);
          throw e;
        })
      ).then((res) => {
        if (res?.data) {
          setData(res.data);
          setLoaded(true);
        }
        setLoading(false);
      });
    } else {
      setData(null);
      setLoading(false);
    }
  }, [schoolUnit, lockerId]);

  return { data, loaded, loading };
};
