import { APIS, MUNICIPALITY_ID } from '@/config';
import { PupilsLockerResponseOrderBy, PupilsLockerResponsePagedOffsetResponse, SortDirection } from '@/data-contracts/pupillocker/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { PupilApiResponse, PupilsQueryParams } from '@/responses/pupil.response';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Controller, Get, Param, QueryParams, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class PupilController {
  private apiService = new ApiService();
  private api = APIS.find(api => api.name === 'pupillocker');

  @Get('/pupils/:schoolId')
  @OpenAPI({
    summary: 'Get pupils in school',
  })
  @ResponseSchema(PupilApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getPupils(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @QueryParams() params: PupilsQueryParams,
    @Res() response: Response<PupilApiResponse>,
  ): Promise<Response<PupilApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    const { filter, ...pagination } = params;

    try {
      const res = await this.apiService.get<PupilsLockerResponsePagedOffsetResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/pupilslocker/${schoolId}`,
        params: {
          loginName: username,
          PageSize: 10,
          PageNumber: 1,
          OrderBy: PupilsLockerResponseOrderBy.Name,
          OrderDirection: SortDirection.ASC,
          ...(filter || {}),
          ...(pagination || {}),
        },
      });
      if (res.data) {
        const { data, ...rest } = res.data;
        return response.send({ message: 'success', data: data, ...rest } as PupilApiResponse);
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.status || 500, e.message);
    }
  }

  @Get('/pupils/searchfree/:schoolId/:query')
  @OpenAPI({
    summary: 'Get pupils with max 1 locker',
  })
  @ResponseSchema(PupilApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async searchPupils(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Param('query') query: string,
    @Res() response: Response<PupilApiResponse>,
  ): Promise<Response<PupilApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<PupilsLockerResponsePagedOffsetResponse>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/pupilslocker/${schoolId}`,
        params: {
          loginName: username,
          nameQueryFilter: query,
          pageSize: 100,
          OrderBy: PupilsLockerResponseOrderBy.Name,
          OrderDirection: SortDirection.ASC,
        },
      });
      if (res.data) {
        const { data, ...rest } = res.data;
        const filtereddata = data.filter(pupil => pupil.lockers?.length < 2);
        return response.send({ message: 'success', data: filtereddata, ...rest } as PupilApiResponse);
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.status || 500, e.message);
    }
  }
}
