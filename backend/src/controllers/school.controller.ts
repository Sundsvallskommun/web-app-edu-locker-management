import { APIS, MUNICIPALITY_ID } from '@/config';
import { SchoolWithUnits } from '@/data-contracts/education/data-contracts';
import { LockerBuilding } from '@/data-contracts/pupillocker/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { School, SchoolApiResponse, SchoolGroup } from '@/responses/school.response';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Controller, Get, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class SchoolController {
  private readonly apiService = new ApiService();
  private readonly lockerApi = APIS.find(api => api.name === 'pupillocker');
  private readonly eduApi = APIS.find(api => api.name === 'education');

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
      const allSchools = await this.apiService.get<SchoolWithUnits[]>({
        url: `${this.eduApi.name}/${this.eduApi.version}/${MUNICIPALITY_ID}/schoolunits`,
        params: {
          loginName: username,
        },
      });
      for (let unitId of schoolUnits) {
        const schoolData = allSchools.data.find(school => school.schoolId === unitId);

        const classes = await this.apiService.get<SchoolGroup[]>({
          url: `${this.eduApi.name}/${this.eduApi.version}/${MUNICIPALITY_ID}/schools/${unitId}/classes`,
        });

        const buildings = await this.apiService.get<LockerBuilding[]>({
          url: `${this.lockerApi.name}/${this.lockerApi.version}/${MUNICIPALITY_ID}/lockers/${unitId}/buildings`,
          params: {
            loginName: username,
          },
        });

        if (!schoolData) {
          throw new HttpException(500, 'Could not get school');
        }
        const school: School = schoolData;
        if (buildings?.data) {
          school.buildings = buildings.data;
        }
        if (classes?.data) {
          school.groups = classes.data;
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
