import {
  CodeLock,
  CodeLockApiResponse,
  CodeLocksApiResponse,
  CreateCodeLock,
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

export const createCodeLock = (schoolUnit: string, data: CreateCodeLock) => {
  return apiService.post<CodeLockApiResponse>(`/codelocks/${schoolUnit}`, data).then((res) => {
    if (res?.data?.data) {
      return res.data.data;
    }
  });
};

export const useCodeLock = (schoolUnit: string, lockId: string) => {
  const [data, setData] = useState<CodeLock | null>(null);
  const { handleGetOne, handleUpdate } = useCrudHelper('codelocks');

  const refresh = () => {
    handleGetOne(() => getCodeLock(schoolUnit, lockId)).then((res) => setData(res));
  };

  useEffect(() => {
    if (lockId && schoolUnit) {
      refresh();
    } else {
      setData(null);
    }
  }, [schoolUnit, lockId]);

  const update = (data: UpdateCodeLock) => {
    return handleUpdate<CodeLock>(() => updateCodeLock(schoolUnit, lockId, data)).then((res) => {
      if (res) {
        setData(res);
      }
    });
  };

  return { data, update, refresh };
};

export const useCodeLocks = (schoolUnit: string) => {
  const [data, setData] = useState<CodeLock[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { handleGetMany } = useCrudHelper('codelocks');

  const refresh = () => {
    if (schoolUnit) {
      return handleGetMany(() =>
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

  const create = (data: CreateCodeLock) => {
    return createCodeLock(schoolUnit, data).then((res) => {
      setData((data) => [...data, res]);
    });
  };

  const addLocal = (codeLock: CodeLock) => {
    refresh().then(() => {
      setData((data) => [
        ...data,
        ...(data.map((lock) => lock.codeLockId).includes(codeLock.codeLockId) ? [] : [codeLock]),
      ]);
    });
  };

  useEffect(() => {
    refresh();
  }, [schoolUnit]);

  return { data, addLocal, loaded, refresh, create };
};
