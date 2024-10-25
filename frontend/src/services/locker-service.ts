import {
  LockerEditResponse,
  LockerStatusUpdate,
  LockerStatusUpdateStatusEnum,
  SchoolLocker,
  SchoolLockerApiResponse,
  SchoolLockerUpdateApiResponse,
} from '@data-contracts/backend/data-contracts';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiService } from './api-service';
import { AxiosResponse } from 'axios';
import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

const getLockers = (schoolUnit: string) => {
  return apiService.get<SchoolLockerApiResponse>(`/lockers/${schoolUnit}`).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};

const removeLocker = (schoolUnit: string, lockerId: string) => {
  return apiService.delete<boolean>(`/lockers/${schoolUnit}/${lockerId}`);
};

const updateLockerStatus = (schoolUnit: string, data: LockerStatusUpdate) => {
  return apiService.patch<SchoolLockerUpdateApiResponse>(`/lockers/status/${schoolUnit}`, data).then((res) => {
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

type UseLockers = (schoolUnit: string) => LockerData & {
  refresh: () => void;
  removeLocker: (lockerId: string) => Promise<AxiosResponse<boolean>>;
  updateStatus: (lockerIds: string[], status: LockerStatusUpdateStatusEnum) => Promise<LockerEditResponse>;
};

export const useLockers: UseLockers = (schoolUnit) => {
  const [schools, setLockers, newSchool, setLoaded, setLoading] = useLockerStore(
    useShallow((state) => [state.data, state.setLockers, state.newSchool, state.setLoaded, state.setLoading])
  );
  const message = useSnackbar();
  const { t } = useTranslation();
  const { handleGetMany, handleRemove } = useCrudHelper('lockers');
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

    handleGetMany(() =>
      getLockers(schoolUnit).catch((e) => {
        const errorCode = e.response.status;
        if (errorCode === 401 || errorCode === 403) {
          setLockers(schoolUnit, []);
          setLoaded(schoolUnit, true);
        }
        setLoading(schoolUnit, false);
        throw e;
      })
    ).then((res) => {
      if (res) {
        setLockers(schoolUnit, res);
        setLoaded(schoolUnit, true);
        setLoading(schoolUnit, false);
      }
    });
  };

  useEffect(() => {
    if (schoolUnit && (!data || !loaded)) {
      refresh();
    }
  }, [schoolUnit]);

  const remove = (lockerId) => {
    return handleRemove(() => removeLocker(schoolUnit, lockerId));
  };

  const updateStatus = (lockerIds: string[], status: LockerStatusUpdateStatusEnum) => {
    return updateLockerStatus(schoolUnit, { lockerIds, status })
      .then((res) => {
        if (res?.successfulLockers?.length > 0) {
          message({
            message: t('crud:update.success', {
              resource: t('lockers:count', { count: res?.successfulLockers?.length }),
            }),
            status: 'success',
          });
        }
        if (res?.failedLockers?.length > 0) {
          message({
            message: t('crud:update.error', {
              resource: t('lockers:count', { count: res?.failedLockers?.length }),
            }),
            status: 'error',
          });
        }
        return res;
      })
      .catch((e) => {
        message({
          message: t('crud:update.error', {
            resource: t('lockers:name', { count: lockerIds.length }),
          }),
          status: 'error',
        });
        return e;
      });
  };

  return { data, loaded, loading, refresh, removeLocker: remove, updateStatus };
};
