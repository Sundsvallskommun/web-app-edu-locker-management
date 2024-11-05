import {
  CodeLock,
  CodeLockApiResponse,
  CodeLocksApiResponse,
  UpdateCodeLock,
} from '@data-contracts/backend/data-contracts';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useEffect, useState } from 'react';
import { apiService } from './api-service';

export const getCodeLock = (schoolUnit: string, lockId: string) => {
  return apiService.get<CodeLockApiResponse>(`/codelocks/${schoolUnit}/${lockId}`).then((res) => {
    if (res?.data?.data) {
      return res.data.data;
    }
  });
};

export const getCodeLocks = (schoolUnit: string) => {
  return apiService.get<CodeLocksApiResponse>(`/codelocks/${schoolUnit}`).then((res) => {
    if (res?.data?.data) {
      return res.data.data;
    }
  });
};

export const updateCodeLock = (schoolUnit: string, lockId: string, data: UpdateCodeLock) => {
  return apiService.patch<CodeLockApiResponse>(`/codelocks/${schoolUnit}/${lockId}`, data).then((res) => {
    if (res?.data?.data) {
      return res.data.data;
    }
  });
};

export const useCodeLock = (schoolUnit: string, lockId: string) => {
  const [data, setData] = useState<CodeLock | null>(null);
  const { handleGetOne, handleUpdate } = useCrudHelper('codelocks');
  useEffect(() => {
    if (lockId && schoolUnit) {
      handleGetOne(() => getCodeLock(schoolUnit, lockId)).then((res) => setData(res));
    } else {
      setData(null);
    }
  }, [schoolUnit, lockId]);

  const update = (data: UpdateCodeLock) => {
    handleUpdate<CodeLock>(() => updateCodeLock(schoolUnit, lockId, data)).then((res) => {
      if (res) {
        setData(res);
      }
    });
  };

  return { data, update };
};

export const useCodeLocks = (schoolUnit: string) => {
  const [data, setData] = useState<CodeLock[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { handleGetMany } = useCrudHelper('codelocks');

  const refresh = () => {
    if (schoolUnit) {
      handleGetMany(() =>
        getCodeLocks(schoolUnit).catch((e) => {
          setData([]);
          throw e;
        })
      ).then((res) => {
        setData(res || []);
        setLoaded(true);
      });
    }
  };

  useEffect(() => {
    refresh();
  }, [schoolUnit]);

  return { data, loaded, refresh };
};
