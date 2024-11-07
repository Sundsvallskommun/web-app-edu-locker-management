import { School, SchoolApiResponse } from '@data-contracts/backend/data-contracts';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiService } from './api-service';

export const getSchools = () => {
  return apiService.get<SchoolApiResponse>('/schools').then((res) => {
    if (res.data) {
      return res.data.data;
    }
  });
};

interface State {
  data: School[];
  loaded: boolean;
  updated: Date;
}

interface Actions {
  setData: (data: School[]) => void;
  setLoaded: (loaded: boolean) => void;
  setUpdated: (updated: Date) => void;
}

const useSchoolStore = create(
  persist<State & Actions>(
    (set) => ({
      data: [],
      loaded: false,
      setData: (data) => set(() => ({ data })),
      setLoaded: (loaded) => set(() => ({ loaded })),
      updated: new Date(),
      setUpdated: (updated) => set(() => ({ updated })),
    }),
    {
      name: 'locker-management-schools',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Time to live for schools
const ttl = 60 * 60;

export const useSchools = () => {
  const data = useSchoolStore(useShallow((state) => state.data));
  const setData = useSchoolStore((state) => state.setData);
  const loaded = useSchoolStore((state) => state.loaded);
  const setLoaded = useSchoolStore((state) => state.setLoaded);
  const updated = useSchoolStore(useShallow((state) => state.updated));
  const setUpdated = useSchoolStore((state) => state.setUpdated);

  const { handleGetMany } = useCrudHelper('schools');
  const isOld = new Date(new Date(updated).getTime() + ttl) < new Date();

  useEffect(() => {
    if (!data || !loaded || data?.length < 1 || isOld) {
      handleGetMany<School[]>(() => getSchools()).then((res) => {
        if (res) {
          setData(res);
          setLoaded(true);
          setUpdated(new Date());
        }
      });
    }
  }, []);

  return { data, loaded };
};

export const useSchool = (schoolUnit: string) => {
  const allSchools = useSchoolStore(useShallow((state) => state.data));
  const setData = useSchoolStore((state) => state.setData);
  const data = allSchools.find((school) => school.unitGUID === schoolUnit);
  const loaded = useSchoolStore((state) => state.loaded);
  const setLoaded = useSchoolStore((state) => state.setLoaded);
  const updated = useSchoolStore(useShallow((state) => state.updated));
  const setUpdated = useSchoolStore((state) => state.setUpdated);

  const { handleGetMany } = useCrudHelper('schools');
  const isOld = new Date(new Date(updated).getTime() + ttl) < new Date();

  useEffect(() => {
    if (!data || !loaded || allSchools?.length < 1 || isOld) {
      handleGetMany<School[]>(() => getSchools()).then((res) => {
        if (res) {
          setData(res);
          setLoaded(true);
          setUpdated(new Date());
        }
      });
    }
  }, [schoolUnit]);

  return { data, loaded };
};
