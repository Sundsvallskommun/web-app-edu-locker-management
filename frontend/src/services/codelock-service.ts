import { CodeLock, CodeLockApiResponse, UpdateCodeLock } from '@data-contracts/backend/data-contracts';
import { apiService } from './api-service';
import { useEffect, useState } from 'react';
import { useCrudHelper } from '@utils/use-crud-helpers';

export const getCodeLock = (schoolUnit: string, lockId: string) => {
  return apiService.get<CodeLockApiResponse>(`/codelocks/${schoolUnit}/${lockId}`).then((res) => {
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
    if (lockId) {
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
