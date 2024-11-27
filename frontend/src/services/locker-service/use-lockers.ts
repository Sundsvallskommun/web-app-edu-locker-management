import {
  SchoolLockerFilter,
  SchoolLockerApiResponse,
  CreateLockerBody,
  LockerAssign,
  EditLockerBody,
} from '@data-contracts/backend/data-contracts';
import { LockerOrderByType, OrderDirectionType, LockerStatus } from '@interfaces/locker.interface';
import { useSnackbar } from '@sk-web-gui/react';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounceCallback } from 'usehooks-ts';
import { useShallow } from 'zustand/react/shallow';
import { useLockerStore, initialLockerData } from './locker-store';
import {
  getLockers,
  removeLocker,
  updateLockerStatus,
  createLockers,
  unassignLocker,
  assignLocker,
  updateLocker,
} from './locker-service';

export const useLockers = () => {
  const [
    schoolUnit,
    setSchoolUnit,
    data,
    setLockers,
    setLoading,
    orderBy,
    orderDirection,
    setOrderBy,
    setOrderDirection,
    filter,
    setFilter,
    loaded,
    setLoaded,
    loading,
    totalPages,
    totalRecords,
    pageSize,
    pageNumber,
  ] = useLockerStore(
    useShallow((state) => [
      state.schoolUnit,
      state.setSchoolUnit,
      state.data,
      state.setLockers,
      state.setLoading,
      state.orderBy,
      state.orderDirection,
      state.setOrderBy,
      state.setOrderDirection,
      state.filter,
      state.setFilter,
      state.loaded,
      state.setLoaded,
      state.loading,
      state.totalPages,
      state.totalRecords,
      state.pageSize,
      state.pageNumber,
    ])
  );

  const message = useSnackbar();
  const { t } = useTranslation();
  const { handleGetMany, handleRemove, handleUpdate } = useCrudHelper('lockers');
  const PageSize = pageSize ?? 10;
  const PageNumber = pageNumber ?? 1;
  const OrderBy = orderBy;
  const OrderDirection = orderDirection;

  const refresh = async (
    unitId?: string,
    options?: {
      PageSize?: number;
      PageNumber?: number;
      OrderBy?: LockerOrderByType;
      OrderDirection?: OrderDirectionType;
    },
    filters?: SchoolLockerFilter
  ) => {
    const id = unitId || schoolUnit;
    setLoading(true);
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
          setLockers(initialLockerData);
        }
        setLoading(false);
        throw e;
      })
    )
      .then((res) => {
        if (res) {
          setLockers({
            data: res.data,
            pageNumber: res.pageNumber,
            pageSize: res.pageSize,
            totalPages: res.totalPages,
            totalRecords: res.totalRecords,
            loaded: true,
            loading: false,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSetPageNumber = (newPageNumber: number) => {
    if (newPageNumber && newPageNumber !== pageNumber) {
      refresh(schoolUnit, { PageNumber: newPageNumber });
    }
  };
  const handleSetPageSize = (newPageSize: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      refresh(schoolUnit, { PageSize: newPageSize, PageNumber: 1 });
    }
  };

  const handleSetOrderBy = (newOrderBy: LockerOrderByType) => {
    if (newOrderBy !== orderBy) {
      setOrderBy(newOrderBy);
      refresh(schoolUnit, { OrderBy: newOrderBy, OrderDirection: 'ASC' });
    }
  };

  const handleSetOrderDirection = (newOrderDirection: OrderDirectionType) => {
    if (newOrderDirection !== orderDirection) {
      setOrderDirection(newOrderDirection);
      refresh(schoolUnit, { OrderDirection: newOrderDirection });
    }
  };

  useEffect(() => {
    if (schoolUnit && (!data || !loaded) && !loading) {
      refresh(schoolUnit, { PageNumber: 1 });
    }
  }, [schoolUnit]);

  const handleSetSchoolUnit = async (unitId: string) => {
    if (unitId && unitId !== schoolUnit) {
      setLoaded(false);
      setSchoolUnit(unitId);
      setFilter({ ...filter, building: '', buildingFloor: '' });
      await refresh(unitId, { PageNumber: 1 }, { ...filter, building: '', buildingFloor: '' });
    }
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
    orderBy,
    orderDirection,
    setSchoolUnit: handleSetSchoolUnit,
    setPageNumber: handleSetPageNumber,
    setPageSize: handleSetPageSize,
    setOrderBy: handleSetOrderBy,
    setOrderDirection: handleSetOrderDirection,
  };
};
