import { APIS, MUNICIPALITY_ID } from '@/config';
import {
  EditLockerResponse,
  GetLockersModelOrderBy,
  GetLockersModelPagedOffsetResponse,
  SortDirection,
} from '@/data-contracts/pupillocker/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import {
  CreateLockerBody,
  EditLockerBody,
  LockerAssignBody,
  LockerEditResponse,
  LockerStatusUpdate,
  LockerUnassignResponse,
  SchoolLockerApiResponse,
  SchoolLockerEditApiResponse,
  SchoolLockerQueryParams,
  SchoolLockerUnassignApiResponse,
  SchoolLockerUpdateApiResponse,
  SingleSchoolLockerApiResponse,
} from '@/responses/locker.response';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, QueryParams, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class LockerController {
  private apiService = new ApiService();
  private api = APIS.find(api => api.name === 'pupillocker');

  @Get('/lockers/:unitId')
  @OpenAPI({
    summary: 'Get all lockers for a school',
  })
  @ResponseSchema(SchoolLockerApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getSchoolLockers(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @QueryParams() params: SchoolLockerQueryParams,
    @Res() response: Response<SchoolLockerApiResponse>,
  ): Promise<Response<SchoolLockerApiResponse>> {
    const { username } = req.user;

    const { filter, ...pagination } = params;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<GetLockersModelPagedOffsetResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/${unitId}`,
        params: {
          loginName: username,
          ...(filter || {}),
          ...pagination,
        },
      });

      return response.send({ ...res.data, message: 'success' } as SchoolLockerApiResponse);
    } catch (e) {
      if (e?.status === 404) {
        return response.send({
          data: [],
          pageNumber: 1,
          totalPages: 1,
          totalRecords: 0,
          pageSize: pagination?.PageSize || 25,
          message: 'not_found',
        } as SchoolLockerApiResponse);
      }
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Get('/lockers/:unitId/:lockerId/:lockerName')
  @OpenAPI({
    summary: 'Get a locker from a school',
  })
  @ResponseSchema(SingleSchoolLockerApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getSchoolLocker(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Param('lockerId') lockerId: string,
    @Param('lockerName') lockerName: string,
    @Res() response: Response<SingleSchoolLockerApiResponse>,
  ): Promise<Response<SingleSchoolLockerApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<GetLockersModelPagedOffsetResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/${unitId}`,
        params: {
          loginName: username,
          nameQueryFilter: lockerName,
          OrderBy: GetLockersModelOrderBy.Name,
          OrderDirection: SortDirection.ASC,
        },
      });
      console.log('res: ', res);
      const mylocker = res?.data?.data.find(locker => locker.lockerId === lockerId);
      if (mylocker) {
        return response.send({ data: mylocker, message: 'success' } as SingleSchoolLockerApiResponse);
      } else {
        throw new HttpException(404, 'No locker found');
      }
    } catch (e) {
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/status/:unitId')
  @OpenAPI({
    summary: 'Change the status for lockers at a school',
  })
  @ResponseSchema(SchoolLockerUpdateApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(LockerStatusUpdate, 'body'))
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Body() body: LockerStatusUpdate,
    @Res() response: Response<SchoolLockerUpdateApiResponse>,
  ): Promise<Response<SchoolLockerUpdateApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<LockerEditResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/status/${unitId}?loginName=${username}`,
        data: body,
      });
      return response.send({ message: 'success', data: res.data });
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Post('/lockers/:unitId')
  @OpenAPI({
    summary: 'Create lockers',
  })
  @ResponseSchema(SchoolLockerUpdateApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(CreateLockerBody, 'body'))
  async createLockers(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Body() body: CreateLockerBody,
    @Res() response: Response<SchoolLockerUpdateApiResponse>,
  ): Promise<Response<SchoolLockerUpdateApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.post<EditLockerResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/${unitId}`,
        data: body,
        params: {
          loginName: username,
        },
      });
      return response.send({ message: 'success', data: res.data } as SchoolLockerUpdateApiResponse);
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/assign/:unitId')
  @OpenAPI({
    summary: 'Assign pupils to lockers',
  })
  @ResponseSchema(SchoolLockerUpdateApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(LockerAssignBody, 'body'))
  async assignLockers(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Body() body: LockerAssignBody,
    @Res() response: Response<SchoolLockerUpdateApiResponse>,
  ): Promise<Response<SchoolLockerUpdateApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<EditLockerResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/assigntopupil/${unitId}`,
        data: body.data,
        params: {
          loginName: username,
        },
      });
      return response.send({ message: 'success', data: res.data } as SchoolLockerUpdateApiResponse);
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/unassign/:unitId')
  @OpenAPI({
    summary: 'Unassign pupils from lockers',
  })
  @ResponseSchema(SchoolLockerUnassignApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(LockerStatusUpdate, 'body'))
  async unassignLockers(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Body() body: LockerStatusUpdate,
    @Res() response: Response<SchoolLockerUnassignApiResponse>,
  ): Promise<Response<SchoolLockerUnassignApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<LockerUnassignResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/unassign/${unitId}?loginName=${username}`,
        data: body,
      });
      return response.send({ message: 'success', data: res.data });
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/:unitId/:lockerId')
  @OpenAPI({
    summary: 'Update locker information',
  })
  @ResponseSchema(SchoolLockerEditApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(EditLockerBody, 'body'))
  async updateLocker(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Param('lockerId') lockerId: string,
    @Body() body: EditLockerBody,
    @Res() response: Response<SchoolLockerEditApiResponse>,
  ): Promise<Response<SchoolLockerEditApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<null>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${unitId}/${lockerId}`,
        data: body,
        params: {
          loginName: username,
        },
      });

      if (res) {
        return response.send({ message: 'success', data: true });
      }
    } catch (e) {
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Delete('/lockers/:unitId/:lockerId')
  @OpenAPI({
    summary: 'Remove a locker from a school',
  })
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async removeLocker(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Param('lockerId') lockerId: string,
    @Res() response: Response<Boolean>,
  ): Promise<Response<Boolean>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      await this.apiService.delete({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${unitId}/${lockerId}?loginName=${username}`,
      });
      return response.send(true);
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }
}
