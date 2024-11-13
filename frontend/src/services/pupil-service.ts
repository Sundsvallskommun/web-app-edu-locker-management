import { Pupil, PupilApiResponse, PupilsFilter, PupilsQueryParams } from '@data-contracts/backend/data-contracts';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { apiService } from './api-service';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { OrderDirectionType } from '@interfaces/locker.interface';
import { PupilOrderByType } from '@interfaces/pupil.interface';

export const searchFreePupils = (schoolUnit: string, query: string) => {
  return apiService.get<PupilApiResponse>(`/pupils/searchfree/${schoolUnit}/${query}`).then((res) => {
    if (res.data) {
      return res.data.data;
    }
  });
};
export const getPupils = (schoolUnit: string, params: PupilsQueryParams) => {
  return apiService.get<PupilApiResponse>(`/pupils/${schoolUnit}`, { params }).then((res) => {
    if (res.data) {
      return res.data;
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

interface State {
  data: Pupil[];
  loaded: boolean;
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  schoolUnit: string;
  filter: PupilsFilter;
  orderBy: PupilOrderByType;
  orderDirection: OrderDirectionType;
}

interface Actions {
  setAll: (
    state: Pick<State, 'data' | 'loaded' | 'loading' | 'pageNumber' | 'pageSize' | 'totalPages' | 'totalRecords'>
  ) => void;
  setData: (data: Pupil[]) => void;
  setLoaded: (loaded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setPageNumber: (pageNumber: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalPages: (totalPages: number) => void;
  setTotalRecords: (totalRecords: number) => void;
  setSchoolUnit: (schoolUnit: string) => void;
  setFilter: (filter: PupilsFilter) => void;
  setOrderBy: (orderBy: PupilOrderByType) => void;
  setOrderDirection: (orderDirection: OrderDirectionType) => void;
}

const usePupilStore = create(
  persist<State & Actions>(
    (set) => ({
      data: [],
      loaded: false,
      loading: false,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      totalRecords: 0,
      schoolUnit: '',
      orderBy: 'Name',
      orderDirection: 'ASC',
      filter: {},
      setAll: (all) => set(() => ({ ...all })),
      setData: (data) => set(() => ({ data })),
      setLoaded: (loaded) => set(() => ({ loaded })),
      setLoading: (loading) => set(() => ({ loading })),
      setPageNumber: (pageNumber) => set(() => ({ pageNumber })),
      setPageSize: (pageSize) => set(() => ({ pageSize })),
      setTotalPages: (totalPages) => set(() => ({ totalPages })),
      setTotalRecords: (totalRecords) => set(() => ({ totalRecords })),
      setSchoolUnit: (schoolUnit) => set(() => ({ schoolUnit })),
      setFilter: (filter) => set(() => ({ filter })),
      setOrderBy: (orderBy) => set(() => ({ orderBy })),
      setOrderDirection: (orderDirection) => set(() => ({ orderDirection })),
    }),
    {
      name: 'locker-management-pupils',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const usePupils = () => {
  const { handleGetMany } = useCrudHelper('pupils');
  const [
    data,
    setAll,
    loaded,
    loading,
    setLoaded,
    setLoading,
    schoolUnit,
    setSchoolUnit,
    pageSize,
    pageNumber,
    orderBy,
    orderDirection,
    setPageSize,
    setPageNumber,
    setOrderBy,
    setOrderDirection,
    filter,
    setFilter,
    totalPages,
    totalRecords,
  ] = usePupilStore(
    useShallow((state) => [
      state.data,
      state.setAll,
      state.loaded,
      state.loading,
      state.setLoaded,
      state.setLoading,
      state.schoolUnit,
      state.setSchoolUnit,
      state.pageSize,
      state.pageNumber,
      state.orderBy,
      state.orderDirection,
      state.setPageSize,
      state.setPageNumber,
      state.setOrderBy,
      state.setOrderDirection,
      state.filter,
      state.setFilter,
      state.totalPages,
      state.totalRecords,
    ])
  );

  const fetchAndSet = (unitId?: string, params?: Partial<PupilsQueryParams>) => {
    setLoading(true);
    return handleGetMany(() =>
      getPupils(unitId || schoolUnit, {
        PageNumber: params?.PageNumber || pageNumber,
        PageSize: params?.PageSize || pageSize,
        OrderBy: params?.OrderBy || orderBy,
        OrderDirection: params?.OrderDirection || orderDirection,
        filter: params?.filter || filter,
      }).catch((e) => {
        setLoading(false);
        throw e;
      })
    ).then((res) => {
      if (res) {
        setAll({ ...res, loaded: true, loading: false });
      } else {
        setLoaded(false);
        setLoading(false);
      }
    });
  };

  const refresh = () => {
    if (schoolUnit) {
      fetchAndSet();
    }
  };

  const handleSetSchoolUnit = (unitID: string) => {
    if (unitID !== schoolUnit) {
      setSchoolUnit(unitID);
      fetchAndSet(unitID, { PageNumber: 1 });
    }
  };

  const handleSetFilter = (newFilter: PupilsFilter) => {
    setFilter(newFilter);
    fetchAndSet(schoolUnit, { PageNumber: 1, filter: newFilter });
  };

  useEffect(() => {
    if (schoolUnit && (!loaded || !data)) {
      refresh();
    }
  }, []);

  const handleSetPageSize = (newSize: number) => {
    if (newSize && newSize !== pageSize) {
      setPageSize(newSize);
      fetchAndSet(schoolUnit, { PageNumber: 1, PageSize: newSize });
    }
  };

  const handleSetPageNumber = (newNumber: number) => {
    if (newNumber && newNumber !== pageNumber) {
      setPageNumber(newNumber);
      fetchAndSet(schoolUnit, { PageNumber: newNumber });
    }
  };

  const handleSetOrderBy = (newOrderBy: PupilOrderByType) => {
    if (newOrderBy !== orderBy) {
      setOrderBy(newOrderBy);
      setOrderDirection('ASC');
      fetchAndSet(schoolUnit, { OrderBy: newOrderBy, OrderDirection: 'ASC' });
    }
  };

  const handleSetOrderDirection = (newOrderDirection: OrderDirectionType) => {
    if (newOrderDirection !== orderDirection) {
      setOrderDirection(newOrderDirection);
      fetchAndSet(schoolUnit, { OrderDirection: newOrderDirection });
    }
  };

  return {
    data,
    loaded,
    loading,
    refresh,
    schoolUnit,
    setSchoolUnit: handleSetSchoolUnit,
    filter,
    setFilter: handleSetFilter,
    totalPages,
    totalRecords,
    orderDirection,
    setOrderDirection: handleSetOrderDirection,
    orderBy,
    setOrderBy: handleSetOrderBy,
    pageNumber: pageNumber,
    setPageNumber: handleSetPageNumber,
    pageSize: pageSize,
    setPageSize: handleSetPageSize,
  };
};
