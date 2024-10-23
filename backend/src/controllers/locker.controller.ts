import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { SchoolLocker, SchoolLockerApiResponse } from '@/responses/locker.response';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Controller, Get, Param, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class LockerController {
  private apiService = new ApiService();

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
    @Res() response: Response<SchoolLockerApiResponse>,
  ): Promise<Response<SchoolLockerApiResponse>> {
    const { name, username } = req.user;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const data = await this.apiService.get<SchoolLocker[]>({ url: `education/1.0/lockers/${unitId}?loginName=${username}` });

      return response.send({ data: data.data, message: 'success' });
    } catch (e) {
      console.log(e);
      throw new HttpException(500, e.message);
    }
  }
}
