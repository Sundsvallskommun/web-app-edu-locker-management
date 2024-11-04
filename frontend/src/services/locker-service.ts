import {
  LockerAssign,
  LockerEditResponse,
  LockerStatusUpdate,
  LockerStatusUpdateStatusEnum,
  LockerUnassignResponse,
  SchoolLocker,
  SchoolLockerApiResponse,
  SchoolLockerFilter,
  SchoolLockerQueryParamsOrderByEnum,
  SchoolLockerQueryParamsOrderDirectionEnum,
  SchoolLockerUnassignApiResponse,
  SchoolLockerUpdateApiResponse,
} from '@data-contracts/backend/data-contracts';
import { useSnackbar } from '@sk-web-gui/react';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { AxiosResponse } from 'axios';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiService } from './api-service';
import { useDebounceCallback } from 'usehooks-ts';

const getLockers = (
  schoolUnit: string,
  options?: {
    PageNumber?: number;
    PageSize?: number;
    OrderBy?: SchoolLockerQueryParamsOrderByEnum;
    OrderDirection?: SchoolLockerQueryParamsOrderDirectionEnum;
  }
): Promise<SchoolLockerApiResponse> => {
  return apiService
    .get<SchoolLockerApiResponse>(`/lockers/${schoolUnit}`, {
      params: {
        OrderBy: SchoolLockerQueryParamsOrderByEnum.Name,
        OrderDirection: SchoolLockerQueryParamsOrderDirectionEnum.ASC,
        ...options,
      },
    })
    .then((res) => {
      if (res.data.data) {
        return res.data;
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

const unassignLocker = (schoolUnit: string, data: LockerStatusUpdate) => {
  return apiService.patch<SchoolLockerUnassignApiResponse>(`/lockers/unassign/${schoolUnit}`, data).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};

const assignLocker = (schoolUnit: string, data: Array<LockerAssign>) => {
  return apiService.patch<SchoolLockerUpdateApiResponse>(`/lockers/assign/${schoolUnit}`, { data }).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};

interface LockerData {
  data: SchoolLocker[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  loaded: boolean;
  loading: boolean;
}
interface State {
  data: Record<string, LockerData>;
  orderBy: SchoolLockerQueryParamsOrderByEnum;
  orderDirection: SchoolLockerQueryParamsOrderDirectionEnum;
  filter: SchoolLockerFilter;
  schoolUnit: string;
}

const initialLockerData: LockerData = {
  data: [],
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
  loaded: false,
  loading: false,
};
interface Actions {
  newSchool: (schoolUnit: string) => void;
  setLockers: (schoolUnit: string, data: LockerData) => void;
  setLoaded: (schoolUnit: string, loaded: boolean) => void;
  setLoading: (schoolUnit: string, loading: boolean) => void;
  reset: () => void;
  setOrderBy: (orderBy: SchoolLockerQueryParamsOrderByEnum) => void;
  setOrderDirection: (orderDirection: SchoolLockerQueryParamsOrderDirectionEnum) => void;
  setFilter: (filter: SchoolLockerFilter) => void;
  setSchoolUnit: (schoolUnit: string) => void;
}

export const useLockerStore = create(
  persist<State & Actions>(
    (set) => ({
      data: {},

      newSchool: (schoolUnit) =>
        set((state) => ({
          data: {
            ...state.data,
            [schoolUnit]: initialLockerData,
          },
        })),
      setLockers: (schoolUnit, data) =>
        set((state) => ({
          data: { ...state.data, [schoolUnit]: { ...data } },
        })),
      setLoaded: (schoolUnit, loaded) =>
        set((state) => ({
          data: { ...state.data, [schoolUnit]: { ...state.data[schoolUnit], loaded } },
        })),
      setLoading: (schoolUnit, loading) =>
        set((state) => ({
          data: { ...state.data, [schoolUnit]: { ...state.data[schoolUnit], loading } },
        })),
      reset: () => set(() => ({ data: {} })),
      orderBy: SchoolLockerQueryParamsOrderByEnum.Name,
      orderDirection: SchoolLockerQueryParamsOrderDirectionEnum.ASC,
      setOrderBy: (orderBy) => set(() => ({ orderBy })),
      setOrderDirection: (orderDirection) => set(() => ({ orderDirection })),
      filter: {},
      setFilter: (filter) => set(() => ({ filter })),
      schoolUnit: '',
      setSchoolUnit: (schoolUnit) => set(() => ({ schoolUnit })),
    }),

    {
      name: 'locker-management-lockers',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

type UseLockers = (options?: {
  PageSize?: number;
  PageNumber?: number;
  OrderBy?: SchoolLockerQueryParamsOrderByEnum;
  OrderDirection?: SchoolLockerQueryParamsOrderDirectionEnum;
}) => LockerData & {
  refresh: () => void;
  removeLocker: (lockerId: string) => Promise<AxiosResponse<boolean>>;
  updateStatus: (lockerIds: string[], status: LockerStatusUpdateStatusEnum) => Promise<LockerEditResponse>;
  assign: (data: Array<LockerAssign>) => Promise<boolean>;
  unassign: (lockerIds: string[], status: LockerStatusUpdateStatusEnum) => Promise<LockerUnassignResponse>;
  filter: SchoolLockerFilter;
  setFilter: (filter: SchoolLockerFilter) => void;
  schoolUnit: string;
  setSchoolUnit: (schoolUnit: string) => void;
};

export const useLockers: UseLockers = (options) => {
  const [
    schoolUnit,
    setSchoolUnit,
    schools,
    setLockers,
    newSchool,
    setLoaded,
    setLoading,
    orderBy,
    orderDirection,
    setOrderBy,
    setOrderDirection,
    filter,
    setFilter,
  ] = useLockerStore(
    useShallow((state) => [
      state.schoolUnit,
      state.setSchoolUnit,
      state.data,
      state.setLockers,
      state.newSchool,
      state.setLoaded,
      state.setLoading,
      state.orderBy,
      state.orderDirection,
      state.setOrderBy,
      state.setOrderDirection,
      state.filter,
      state.setFilter,
    ])
  );

  const message = useSnackbar();
  const { t } = useTranslation();
  const { handleGetMany, handleRemove } = useCrudHelper('lockers');
  const school = schools?.[schoolUnit];
  const data = school?.data ?? [];
  const loaded = school?.loaded ?? false;
  const loading = school?.loading ?? false;
  const totalPages = school?.totalPages ?? 0;
  const totalRecords = school?.totalRecords ?? 0;
  const pageSize = options?.PageSize ?? school?.pageSize ?? 10;
  const PageNumber = options?.PageNumber ?? school?.pageNumber ?? 1;
  const pageNumber = school?.pageNumber ?? 1;
  const optionsString = useMemo(() => JSON.stringify(options), [options]);

  const refresh = (
    unitId?: string,
    options?: { PageSize?: number; PageNumber?: number },
    filters?: SchoolLockerFilter
  ) => {
    const id = unitId || schoolUnit;
    setLoading(id, true);
    const params = {
      OrderBy: orderBy,
      OrderDirection: orderDirection,
      PageNumber,
      PageSize: pageSize,
      ...filter,
      ...options,
      ...filters,
    };

    handleGetMany<SchoolLockerApiResponse>(() =>
      getLockers(id, params).catch((e) => {
        const errorCode = e.response.status;
        if (errorCode === 401 || errorCode === 403) {
          setLockers(id, initialLockerData);
        }
        setLoading(id, false);
        throw e;
      })
    )
      .then((res) => {
        if (res) {
          setLockers(id, {
            data: res.data,
            pageNumber: res.pageNumber,
            pageSize: res.pageSize,
            totalPages: res.totalPages,
            totalRecords: res.totalRecords,
            loaded: true,
            loading: false,
          });
        }
        setLoading(id, false);
      })
      .catch(() => setLoading(id, false));
  };

  useEffect(() => {
    let doRefresh = false;
    if (options?.OrderBy && options.OrderBy !== orderBy) {
      setOrderBy(options.OrderBy);
      doRefresh = true;
    }
    if (options?.OrderDirection && options.OrderDirection !== orderDirection) {
      setOrderDirection(options.OrderDirection);
      doRefresh = true;
    }
    if (options?.PageNumber && options.PageNumber !== school?.pageNumber) {
      doRefresh = true;
    }
    if (options?.PageSize && options.PageSize !== school?.pageSize) {
      doRefresh = true;
    }
    if (doRefresh) {
      refresh();
    }
  }, [optionsString]);

  useEffect(() => {
    if (schoolUnit && (!data || !loaded) && !loading) {
      refresh(schoolUnit, { PageNumber: 1 });
    }
  }, [schoolUnit]);

  const handleSetSchoolUnit = (unitId: string) => {
    if (unitId && !schools?.[unitId]) {
      newSchool(unitId);
    }
    setFilter({ ...filter, building: '', buildingFloor: '' });
    setSchoolUnit(unitId);
    refresh(unitId, { PageNumber: 1 }, { ...filter, building: '', buildingFloor: '' });
  };

  const handleSetFilter = useDebounceCallback((filter: SchoolLockerFilter) => {
    setFilter(filter);
    refresh(schoolUnit, { PageNumber: 1 }, filter);
  }, 250);

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
        return res?.successfulLockers?.length > 0;
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

  const unassign = (lockerIds: string[], status: LockerStatusUpdateStatusEnum) => {
    return unassignLocker(schoolUnit, { lockerIds, status })
      .then((res) => {
        if (res?.successfulLockerIds?.length > 0) {
          message({
            message: t('crud:update.success', {
              resource: t('lockers:count', { count: res?.successfulLockerIds?.length }),
            }),
            status: 'success',
          });
          refresh();
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

  const assign = (data: Array<LockerAssign>) => {
    return assignLocker(schoolUnit, data)
      .then((res) => {
        if (res?.successfulLockers?.length > 0) {
          message({
            message: t('crud:update.success', {
              resource: t('lockers:count', { count: res?.successfulLockers?.length }),
            }),
            status: 'success',
          });
          refresh();
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
            resource: t('lockers:name', { count: data.length }),
          }),
          status: 'error',
        });
        return e;
      });
  };

  return {
    data,
    loaded,
    loading,
    totalPages,
    totalRecords,
    pageNumber,
    pageSize,
    refresh,
    removeLocker: remove,
    updateStatus,
    unassign,
    assign,
    filter,
    setFilter: handleSetFilter,
    schoolUnit,
    setSchoolUnit: handleSetSchoolUnit,
  };
};
