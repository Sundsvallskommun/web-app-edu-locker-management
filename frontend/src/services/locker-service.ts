import {
  CreateLockerBody,
  EditLockerBody,
  LockerAssign,
  LockerEditResponse,
  LockerStatusUpdate,
  LockerUnassignResponse,
  SchoolLocker,
  SchoolLockerApiResponse,
  SchoolLockerEditApiResponse,
  SchoolLockerFilter,
  SchoolLockerQueryParams,
  SchoolLockerUnassignApiResponse,
  SchoolLockerUpdateApiResponse,
} from '@data-contracts/backend/data-contracts';
import { useSnackbar } from '@sk-web-gui/react';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { AxiosResponse } from 'axios';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounceCallback } from 'usehooks-ts';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { apiService } from './api-service';
import { OrderByType, OrderDirectionType, LockerStatus } from '@interfaces/locker.interface';

const getLockers = (
  schoolUnit: string,
  options?: {
    PageNumber?: number;
    PageSize?: number;
    OrderBy?: OrderByType;
    OrderDirection?: OrderDirectionType;
  }
): Promise<SchoolLockerApiResponse> => {
  return apiService
    .get<SchoolLockerApiResponse>(`/lockers/${schoolUnit}`, {
      params: {
        OrderBy: 'Name',
        OrderDirection: 'ASC',
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

const updateLocker = (schoolUnit: string, lockerId: string, data: EditLockerBody) => {
  return apiService.patch<SchoolLockerEditApiResponse>(`/lockers/${schoolUnit}/${lockerId}`, data).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};

const createLockers = (schoolUnit: string, data: CreateLockerBody) => {
  return apiService.post<SchoolLockerUpdateApiResponse>(`/lockers/${schoolUnit}`, data).then((res) => {
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
  orderBy: OrderByType;
  orderDirection: OrderDirectionType;
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
  setOrderBy: (orderBy: OrderByType) => void;
  setOrderDirection: (orderDirection: OrderDirectionType) => void;
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
      orderBy: 'Name',
      orderDirection: 'ASC',
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
  OrderBy?: OrderByType;
  OrderDirection?: OrderDirectionType;
}) => LockerData & {
  refresh: () => void;
  removeLocker: (lockerId: string) => Promise<AxiosResponse<boolean>>;
  create: (data: CreateLockerBody) => Promise<LockerEditResponse>;
  updateStatus: (lockerIds: string[], status: LockerStatus) => Promise<LockerEditResponse>;
  assign: (data: Array<LockerAssign>) => Promise<boolean>;
  unassign: (lockerIds: string[], status: LockerStatus) => Promise<LockerUnassignResponse>;
  update: (lockerId: string, data: EditLockerBody) => Promise<boolean>;
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
  const { handleGetMany, handleRemove, handleUpdate } = useCrudHelper('lockers');
  const school = schools?.[schoolUnit];
  const data = school?.data ?? [];
  const loaded = school?.loaded ?? false;
  const loading = school?.loading ?? false;
  const totalPages = school?.totalPages ?? 0;
  const totalRecords = school?.totalRecords ?? 0;
  const PageSize = options?.PageSize ?? school?.pageSize ?? 10;
  const PageNumber = options?.PageNumber ?? school?.pageNumber ?? 1;
  const pageSize = school?.pageSize ?? 10;
  const pageNumber = school?.pageNumber ?? 1;
  const OrderBy = options?.OrderBy ?? orderBy;
  const OrderDirection = options?.OrderDirection ?? orderDirection;
  const optionsString = useMemo(() => JSON.stringify(options), [options]);

  const refresh = async (
    unitId?: string,
    options?: { PageSize?: number; PageNumber?: number },
    filters?: SchoolLockerFilter
  ) => {
    const id = unitId || schoolUnit;
    setLoading(id, true);
    const params = {
      OrderBy,
      OrderDirection,
      PageNumber,
      PageSize,
      ...filter,
      ...options,
      ...filters,
    };

    await handleGetMany<SchoolLockerApiResponse>(() =>
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

  const handleSetSchoolUnit = async (unitId: string) => {
    if (unitId && !schools?.[unitId]) {
      newSchool(unitId);
    }
    setLoading(schoolUnit, true);
    setFilter({ ...filter, building: '', buildingFloor: '' });
    await refresh(unitId, { PageNumber: 1 }, { ...filter, building: '', buildingFloor: '' });
    setLoading(schoolUnit, false);
    setSchoolUnit(unitId);
  };

  const handleSetFilter = useDebounceCallback((filter: SchoolLockerFilter) => {
    setFilter(filter);
    refresh(schoolUnit, { PageNumber: 1 }, filter);
  }, 250);

  const remove = (lockerId) => {
    return handleRemove(() => removeLocker(schoolUnit, lockerId));
  };

  const updateStatus = (lockerIds: string[], status: LockerStatus) => {
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

  const create = (data: CreateLockerBody) => {
    return createLockers(schoolUnit, data)
      .then((res) => {
        if (res?.successfulLockers?.length > 0) {
          message({
            message: t('crud:create.success', {
              resource: t('lockers:count', { count: res?.successfulLockers?.length }),
            }),
            status: 'success',
          });
        }
        if (res?.failedLockers?.length > 0) {
          message({
            message: t('crud:create.error', {
              resource: t('lockers:count', { count: res?.failedLockers?.length }),
            }),
            status: 'error',
          });
        }
        return res?.successfulLockers?.length > 0;
      })
      .catch((e) => {
        message({
          message: t('crud:create.error', {
            resource: t('lockers:name', { count: data?.newLockerNames?.length }),
          }),
          status: 'error',
        });
        return e;
      });
  };

  const unassign = (lockerIds: string[], status: LockerStatus) => {
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

  const update = (lockerId: string, data: EditLockerBody) => {
    return handleUpdate<boolean>(() => updateLocker(schoolUnit, lockerId, data)).then((res) => {
      if (res) {
        refresh();
      }
      return res;
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
    update,
    create,
    filter,
    setFilter: handleSetFilter,
    schoolUnit,
    setSchoolUnit: handleSetSchoolUnit,
  };
};
