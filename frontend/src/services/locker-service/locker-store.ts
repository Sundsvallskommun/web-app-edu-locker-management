import { SchoolLocker, SchoolLockerFilter } from '@data-contracts/backend/data-contracts';
import { LockerOrderByType, OrderDirectionType } from '@interfaces/locker.interface';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LockerData {
  data: SchoolLocker[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  loaded: boolean;
  loading: boolean;
}

interface State extends LockerData {
  orderBy: LockerOrderByType;
  orderDirection: OrderDirectionType;
  filter: SchoolLockerFilter;
  schoolUnit: string;
}

export const initialLockerData: LockerData = {
  data: [],
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
  loaded: false,
  loading: false,
};

interface Actions {
  setLockers: (data: LockerData) => void;
  setLoaded: (loaded: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  setOrderBy: (orderBy: LockerOrderByType) => void;
  setOrderDirection: (orderDirection: OrderDirectionType) => void;
  setFilter: (filter: SchoolLockerFilter) => void;
  setSchoolUnit: (schoolUnit: string) => void;
  setPageSize: (pageSize: number) => void;
  setPageNumber: (pageNumber: number) => void;
}

export const useLockerStore = create(
  persist<State & Actions>(
    (set) => ({
      ...initialLockerData,
      setLockers: (data) => set(() => ({ ...data })),
      setLoaded: (loaded) => set(() => ({ loaded })),
      setLoading: (loading) => set(() => ({ loading })),
      reset: () => set(() => ({ ...initialLockerData })),
      orderBy: 'Name',
      orderDirection: 'ASC',
      setOrderBy: (orderBy) => set(() => ({ orderBy })),
      setOrderDirection: (orderDirection) => set(() => ({ orderDirection })),
      filter: {},
      setFilter: (filter) => set(() => ({ filter })),
      schoolUnit: '',
      setSchoolUnit: (schoolUnit) => set(() => ({ schoolUnit })),
      setPageSize: (pageSize: number) => set(() => ({ pageSize })),
      setPageNumber: (pageNumber: number) => set(() => ({ pageNumber })),
    }),

    {
      name: 'locker-management-lockers',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
