import { APIS, MUNICIPALITY_ID } from '@/config';
import {
  AssignLockerRequest,
  EditLockerRequest,
  EditLockerResponse,
  EditLockersStatusRequest,
  GetLockersModel,
  GetLockersModelPagedOffsetResponse,
} from '@/data-contracts/pupillocker/data-contracts';
import { CreateLockerBody, EditLockerBody, LockerAssignBody, LockerStatusUpdate, UnassignLockerBody } from '@/dtos/locker.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import {
  LockerEditResponse,
  LockerUnassignResponse,
  SchoolLocker,
  SchoolLockerApiResponse,
  SchoolLockerEditApiResponse,
  SchoolLockerQueryParams,
  SchoolLockerUnassignApiResponse,
  SchoolLockerUpdateApiResponse,
  SingleLockerEditResponse,
  SingleSchoolLockerApiResponse,
} from '@/responses/locker.response';
import ApiService from '@/services/api.service';
import { EmailService } from '@/services/email.service';
import { logger } from '@/utils/logger';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, QueryParam, QueryParams, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class LockerController {
  private apiService = new ApiService();
  private api = APIS.find(api => api.name === 'pupillocker');
  private emailService = new EmailService();

  @Get('/lockers/:schoolId')
  @OpenAPI({
    summary: 'Get all lockers for a school',
  })
  @ResponseSchema(SchoolLockerApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getSchoolLockers(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
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
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/${schoolId}`,
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

  @Get('/lockers/:schoolId/:lockerId')
  @OpenAPI({
    summary: 'Get a locker from a school',
  })
  @ResponseSchema(SingleSchoolLockerApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getSchoolLocker(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Param('lockerId') lockerId: string,
    @Res() response: Response<SingleSchoolLockerApiResponse>,
  ): Promise<Response<SingleSchoolLockerApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<GetLockersModel>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${schoolId}/${lockerId}`,
        params: {
          loginName: username,
        },
      });

      return response.send({ data: res.data as SchoolLocker, message: 'success' });
    } catch (e) {
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/status/:schoolId')
  @OpenAPI({
    summary: 'Change the status for lockers at a school',
  })
  @ResponseSchema(SchoolLockerUpdateApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(LockerStatusUpdate, 'body'))
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Body() body: LockerStatusUpdate,
    @Res() response: Response<SchoolLockerUpdateApiResponse>,
  ): Promise<Response<SchoolLockerUpdateApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<LockerEditResponse, EditLockersStatusRequest>(body, {
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/status/${schoolId}?loginName=${username}`,
      });
      return response.send({ message: 'success', data: res.data });
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Post('/lockers/:schoolId')
  @OpenAPI({
    summary: 'Create lockers',
  })
  @ResponseSchema(SchoolLockerUpdateApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(CreateLockerBody, 'body'))
  async createLockers(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Body() body: CreateLockerBody,
    @Res() response: Response<SchoolLockerUpdateApiResponse>,
  ): Promise<Response<SchoolLockerUpdateApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.post<EditLockerResponse>(body, {
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/${schoolId}`,
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

  @Patch('/lockers/assign/:schoolId')
  @OpenAPI({
    summary: 'Assign pupils to lockers',
  })
  @ResponseSchema(SchoolLockerUpdateApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(LockerAssignBody, 'body'))
  async assignLockers(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @QueryParam('notice') notice: boolean,
    @Body() body: LockerAssignBody,
    @Res() response: Response<SchoolLockerUpdateApiResponse>,
  ): Promise<Response<SchoolLockerUpdateApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<EditLockerResponse, AssignLockerRequest[]>(body.data, {
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/assigntopupil/${schoolId}`,
        params: {
          loginName: username,
        },
      });
      const data = { ...res.data, failedNoticedPupils: [], noticedPupils: [] } as LockerEditResponse;

      if (notice) {
        for (let index = 0; index < body.data.length; index++) {
          const pupil = body.data[index];
          if (data.successfulLockers.map(locker => locker.lockerId).includes(pupil.lockerId)) {
            if (pupil.email) {
              try {
                this.emailService.sendEmail(
                  {
                    email: pupil.email,
                    message: `Du har blivit tilldelat ett nytt skåp:`,
                    pupilId: pupil.personId,
                    lockerIds: [pupil.lockerId],
                  },
                  schoolId,
                  req.user,
                );
                data.noticedPupils.push({ pupilId: pupil.personId });
              } catch (e) {
                logger.error('Error sending email', e);
                data.failedNoticedPupils.push({ pupilId: pupil.personId, reason: 'Server error' });
              }
            } else {
              data.failedNoticedPupils.push({ pupilId: pupil.personId, reason: 'Email missing' });
            }
          }
        }
      }

      return response.send({ message: 'success', data } as SchoolLockerUpdateApiResponse);
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/unassign/:schoolId')
  @OpenAPI({
    summary: 'Unassign pupils from lockers',
  })
  @ResponseSchema(SchoolLockerUnassignApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(UnassignLockerBody, 'body'))
  async unassignLockers(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @QueryParam('notice') notice: boolean,
    @Body() body: UnassignLockerBody,
    @Res() response: Response<SchoolLockerUnassignApiResponse>,
  ): Promise<Response<SchoolLockerUnassignApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.patch<LockerUnassignResponse, LockerStatusUpdate>(
        { status: body.status, lockerIds: body.lockers.map(locker => locker.lockerId) },
        {
          url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/lockers/unassign/${schoolId}?loginName=${username}`,
        },
      );
      const data = { ...res.data, noticedPupils: [], failedNoticedPupils: [] } as LockerUnassignResponse;
      if (notice) {
        for (let index = 0; index < body.lockers.length; index++) {
          const pupil = body.lockers[index];
          if (data.successfulLockerIds.includes(pupil.lockerId) && pupil.pupilId) {
            if (pupil.email) {
              try {
                const res = await this.apiService.get<GetLockersModel>({
                  url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${schoolId}/${pupil.lockerId}`,
                  params: {
                    loginName: username,
                  },
                });
                this.emailService.sendEmail(
                  {
                    email: pupil.email,
                    message: `Ett skåp har blivit uppsagt.
                     ${res.data.name} är inte längre tilldelat till dig.`,
                    pupilId: pupil.pupilId,
                  },
                  schoolId,
                  req.user,
                );
                data.noticedPupils.push({ pupilId: pupil.pupilId });
              } catch (e) {
                logger.error('Error sending email', e);
                data.failedNoticedPupils.push({ pupilId: pupil.pupilId, reason: 'Server error' });
              }
            } else {
              data.failedNoticedPupils.push({ pupilId: pupil.pupilId, reason: 'Email missing' });
            }
          }
        }
      }
      return response.send({ message: 'success', data: res.data });
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Patch('/lockers/:schoolId/:lockerId')
  @OpenAPI({
    summary: 'Update locker information',
  })
  @ResponseSchema(SchoolLockerEditApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(EditLockerBody, 'body'))
  async updateLocker(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Param('lockerId') lockerId: string,
    @QueryParam('notice') notice: boolean,
    @Body() body: EditLockerBody,
    @Res() response: Response<SchoolLockerEditApiResponse>,
  ): Promise<Response<SchoolLockerEditApiResponse>> {
    const { username } = req.user;
    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    const data: EditLockerRequest = {
      name: body?.name,
      lockType: body?.lockType,
      codeLockId: body?.codeLockId,
      building: body?.building,
      buildingFloor: body?.buildingFloor,
      status: body?.status,
    };

    try {
      const res = await this.apiService.patch<null, EditLockerRequest>(data, {
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${schoolId}/${lockerId}`,
        params: {
          loginName: username,
        },
      });
      const responseData: SingleLockerEditResponse = {
        lockerId,
      };
      if (notice && body.pupilId && data.status === 'Tilldelad') {
        if (body.pupilEmail) {
          try {
            this.emailService.sendEmail(
              {
                email: body.pupilEmail,
                message: `Ett av dina skåp har ändrats:`,
                pupilId: body.pupilId,
                lockerIds: [lockerId],
              },
              schoolId,
              req.user,
            );
            responseData.noticed = true;
          } catch (e) {
            logger.error('Error sending email', e);
            responseData.noticed = false;
            responseData.noticeFailReason = 'Server error';
          }
        } else {
          responseData.noticed = false;
          responseData.noticeFailReason = 'Email missing';
        }
      }

      if (responseData) {
        return response.send({ message: 'success', data: responseData });
      }
    } catch (e) {
      throw new HttpException(e?.status || 500, e.message);
    }
  }

  @Delete('/lockers/:schoolId/:lockerId')
  @OpenAPI({
    summary: 'Remove a locker from a school',
  })
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async removeLocker(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Param('lockerId') lockerId: string,
    @Res() response: Response<Boolean>,
  ): Promise<Response<Boolean>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      await this.apiService.delete({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${schoolId}/${lockerId}?loginName=${username}`,
      });
      return response.send(true);
    } catch (e) {
      console.log(e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }
}
