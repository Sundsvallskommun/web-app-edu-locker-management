import { Group, LockerBuilding, SchoolUnit } from '@/data-contracts/education/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { School, SchoolApiResponse } from '@/responses/school.response';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Controller, Get, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class SchoolController {
  private apiService = new ApiService();

  @Get('/schools')
  @OpenAPI({
    summary: 'Get my schools',
  })
  @ResponseSchema(SchoolApiResponse)
  @UseBefore(authMiddleware)
  async getMySchools(@Req() req: RequestWithUser, @Res() response: Response<SchoolApiResponse>): Promise<Response<SchoolApiResponse>> {
    const { username, schoolUnits } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }
    if (!schoolUnits) {
      throw new HttpException(400, 'No schoolunits');
    }

    try {
      const fullSchoolUnits: SchoolApiResponse['data'] = [];

      for (let index = 0; index < schoolUnits.length; index++) {
        const schoolres = await this.apiService.get<SchoolUnit>({
          url: `education/1.0/schoolunits/${schoolUnits[index]}`,
          params: {
            loginName: username,
          },
        });

        const buildings = await this.apiService.get<LockerBuilding[]>({
          url: `education/1.0/lockers/${schoolUnits[index]}/buildings`,
          params: {
            loginName: username,
          },
        });

        const groups = await this.apiService.get<Group[]>({
          url: `education/1.0/groups`,
          params: {
            unitGuid: schoolUnits[index],
          },
        });

        if (!schoolres.data) {
          throw new HttpException(500, 'Could not get school');
        }
        const school: School = schoolres.data;
        if (buildings?.data) {
          school.buildings = buildings.data;
        }
        if (groups?.data) {
          school.groups = groups.data;
        }
        fullSchoolUnits.push(school);
      }

      return response.send({ data: fullSchoolUnits, message: 'success' });
    } catch (e) {
      console.log(e);
      throw new HttpException(e.status || 500, e.message);
    }
  }
}
