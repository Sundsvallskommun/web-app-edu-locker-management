import { Pupil, PupilApiResponse } from '@data-contracts/backend/data-contracts';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { apiService } from './api-service';
import { useCrudHelper } from '@utils/use-crud-helpers';

export const searchFreePupils = (schoolUnit: string, query: string) => {
  return apiService.get<PupilApiResponse>(`/pupils/searchfree/${schoolUnit}/${query}`).then((res) => {
    if (res.data) {
      return res.data.data;
    }
  });
};

export const useFreePupils = (schoolUnit: string, query: string) => {
  const [data, setData] = useState<Pupil[]>([]);
  const { handleGetMany } = useCrudHelper('pupils');

  const refresh = useDebounceCallback(() => {
    handleGetMany(() => searchFreePupils(schoolUnit, query)).then((res) => {
      if (res) {
        setData(res);
      }
    });
  }, 250);

  useEffect(() => {
    if (query?.length > 1) {
      refresh();
    } else {
      setData([]);
    }
  }, [schoolUnit, query]);

  return data;
};
