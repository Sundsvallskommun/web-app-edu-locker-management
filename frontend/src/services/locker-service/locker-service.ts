import {
  CreateLockerBody,
  EditLockerBody,
  LockerAssign,
  LockerStatusUpdate,
  SchoolLockerApiResponse,
  SchoolLockerEditApiResponse,
  SchoolLockerFilter,
  SchoolLockerUnassignApiResponse,
  SchoolLockerUpdateApiResponse,
  SingleSchoolLockerApiResponse,
  UnassignLockerBody,
} from '@data-contracts/backend/data-contracts';
import { LockerOrderByType, OrderDirectionType } from '@interfaces/locker.interface';
import { apiService } from '../api-service';

export const getLockers = (
  schoolUnit: string,
  options?: {
    PageNumber?: number;
    PageSize?: number;
    OrderBy?: LockerOrderByType;
    OrderDirection?: OrderDirectionType;
    filter?: SchoolLockerFilter;
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
      return res?.data;
    });
};

export const getLocker = (schoolUnit: string, lockerId: string): Promise<SingleSchoolLockerApiResponse> => {
  return apiService.get<SingleSchoolLockerApiResponse>(`/lockers/${schoolUnit}/${lockerId}`).then((res) => {
    return res?.data;
  });
};

export const removeLocker = (schoolUnit: string, lockerId: string) => {
  return apiService.delete<boolean>(`/lockers/${schoolUnit}/${lockerId}`);
};

export const updateLockerStatus = (schoolUnit: string, data: LockerStatusUpdate) => {
  return apiService.patch<SchoolLockerUpdateApiResponse>(`/lockers/status/${schoolUnit}`, data).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};

export const unassignLocker = (schoolUnit: string, data: UnassignLockerBody) => {
  return apiService
    .patch<
      SchoolLockerUnassignApiResponse,
      UnassignLockerBody
    >(`/lockers/unassign/${schoolUnit}`, data, { params: { notice: true } })
    .then((res) => {
      if (res.data.data) {
        return res.data.data;
      }
    });
};

export const assignLocker = (schoolUnit: string, data: Array<LockerAssign>) => {
  return apiService
    .patch<SchoolLockerUpdateApiResponse>(`/lockers/assign/${schoolUnit}`, { data }, { params: { notice: true } })
    .then((res) => {
      if (res.data.data) {
        return res.data.data;
      }
    });
};

export const updateLocker = (schoolUnit: string, lockerId: string, data: EditLockerBody, notice: boolean = true) => {
  return apiService
    .patch<
      SchoolLockerEditApiResponse,
      EditLockerBody
    >(`/lockers/${schoolUnit}/${lockerId}`, data, { params: { notice: notice } })
    .then((res) => {
      if (res.data.data) {
        return res.data.data;
      }
    });
};

export const createLockers = (schoolUnit: string, data: CreateLockerBody) => {
  return apiService.post<SchoolLockerUpdateApiResponse>(`/lockers/${schoolUnit}`, data).then((res) => {
    if (res.data.data) {
      return res.data.data;
    }
  });
};
