import { useEffect, useState } from 'react';
import { apiService } from './api-service';
import { SchoolLocker, SchoolLockerApiResponse } from '@data-contracts/backend/data-contracts';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

const getLockers = (schoolUnit: string) => {
  return apiService.get<SchoolLockerApiResponse>(`/lockers/${schoolUnit}`).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};

interface LockerData {
  data: SchoolLocker[];
  loaded: boolean;
  loading: boolean;
}
interface State {
  data: Record<string, LockerData>;
}

interface Actions {
  newSchool: (schoolUnit: string) => void;
  setLockers: (schoolUnit: string, data: SchoolLocker[]) => void;
  setLoaded: (schoolUnit: string, loaded: boolean) => void;
  setLoading: (schoolUnit: string, loading: boolean) => void;
  reset: () => void;
}

export const useLockerStore = create(
  persist<State & Actions>(
    (set) => ({
      data: {},

      newSchool: (schoolUnit) =>
        set((state) => ({ data: { ...state.data, [schoolUnit]: { data: [], loaded: false, loading: false } } })),
      setLockers: (schoolUnit, data) =>
        set((state) => ({ data: { ...state.data, [schoolUnit]: { loaded: true, loading: false, data } } })),
      setLoaded: (schoolUnit, loaded) =>
        set((state) => ({
          data: { ...state.data, [schoolUnit]: { ...state.data[schoolUnit], loaded } },
        })),
      setLoading: (schoolUnit, loading) =>
        set((state) => ({
          data: { ...state.data, [schoolUnit]: { ...state.data[schoolUnit], loading } },
        })),
      reset: () => set(() => ({ data: {} })),
    }),

    {
      name: 'locker-management-lockers',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

type UseLockers = (schoolUnit: string) => LockerData & { refresh: () => void };

export const useLockers: UseLockers = (schoolUnit) => {
  const message = useSnackbar();
  const { t } = useTranslation();

  const [schools, setLockers, newSchool, setLoaded, setLoading] = useLockerStore(
    useShallow((state) => [state.data, state.setLockers, state.newSchool, state.setLoaded, state.setLoading])
  );
  const school = schools?.[schoolUnit];
  const data = school?.data ?? [];
  const loaded = school?.loaded ?? false;
  const loading = school?.loading ?? false;

  useEffect(() => {
    if (schoolUnit && !school) {
      newSchool(schoolUnit);
    }
  }, [school]);

  const refresh = () => {
    setLoading(schoolUnit, true);
    getLockers(schoolUnit)
      .then((res) => {
        if (res) {
          setLockers(schoolUnit, res);
          setLoaded(schoolUnit, true);
          setLoading(schoolUnit, false);
        }
      })
      .catch((e) => {
        const errorCode = e.response.status;
        if (errorCode === 401 || errorCode === 403) {
          message({
            message: t('common:not_allowed_to_fetch', { resource: t('lockers:name_other') }),
            status: 'error',
          });
          setLockers(schoolUnit, []);
          setLoaded(schoolUnit, true);
        } else {
          message({ message: t('could_not_fetch', { resource: t('lockers:name_other') }), status: 'warning' });
        }
        setLoading(schoolUnit, false);
      });
  };

  useEffect(() => {
    if (schoolUnit) {
      refresh();
    }
  }, [schoolUnit]);

  return { data, loaded, loading, refresh };
};
