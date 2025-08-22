import { APIS, MUNICIPALITY_ID } from '@/config';
import { CodeLockLocker, CreateCodeLockRequest, EditCodeLockRequest, GetLockersModel } from '@/data-contracts/pupillocker/data-contracts';
import { CreateCodeLock, UpdateCodeLock } from '@/dtos/codelock.dto';

import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { CodeLockApiResponse, CodeLocksApiResponse } from '@/responses/codelock.response';
import ApiService from '@/services/api.service';
import { EmailService } from '@/services/email.service';
import { logger } from '@/utils/logger';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Body, Controller, Get, Param, Patch, Post, QueryParam, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class CodeLockController {
  private readonly apiService = new ApiService();
  private readonly api = APIS.find(api => api.name === 'pupillocker');
  private readonly emailService = new EmailService();

  @Get('/codelocks/:schoolId')
  @OpenAPI({
    summary: 'Get all available codelocks for a unit',
  })
  @ResponseSchema(CodeLocksApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getCodeLocks(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Res() response: Response<CodeLocksApiResponse>,
  ): Promise<Response<CodeLocksApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<CodeLockLocker[]>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/codelocks/${schoolId}`,
        params: {
          loginName: username,
          onlyAvailable: true,
        },
      });
      if (res.data) {
        return response.send({ message: 'success', data: res.data });
      }
    } catch (e) {
      if (e?.httpCode === 404 || e?.status === 404) {
        return response.status(200).send({ message: 'no codelocks found', data: [] });
      } else {
        logger.error('Error getting code locks: ', e);
        throw new HttpException(e.status || 500, e.message);
      }
    }
  }

  @Get('/codelocks/:schoolId/:lockId')
  @OpenAPI({
    summary: 'Get one codelock',
  })
  @ResponseSchema(CodeLockApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getCodeLock(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Param('lockId') lockId: string,
    @Res() response: Response<CodeLockApiResponse>,
  ): Promise<Response<CodeLockApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<CodeLockLocker>({
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/codelock/${schoolId}/${lockId}`,
        params: {
          loginName: username,
        },
      });
      if (res.data) {
        return response.send({ message: 'success', data: res.data });
      }
    } catch (e) {
      logger.error('Error getting code lock: ', e);
      throw new HttpException(e.status || 500, e.message);
    }
  }

  @Patch('/codelocks/:schoolId/:lockId')
  @OpenAPI({
    summary: 'Update a codelock',
  })
  @ResponseSchema(CodeLockApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(UpdateCodeLock, 'body'))
  async updateCodeLock(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Param('lockId') lockId: string,
    @QueryParam('notice') notice: boolean,
    @Body() body: UpdateCodeLock,
    @Res() response: Response<CodeLockApiResponse>,
  ): Promise<Response<CodeLockApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const update = await this.apiService.patch<unknown, EditCodeLockRequest>(body, {
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/codelock/${schoolId}/${lockId}`,
        params: {
          loginName: username,
        },
      });
      if (update) {
        const res = await this.apiService.get<CodeLockLocker>({
          url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/codelock/${schoolId}/${lockId}`,
          params: {
            loginName: username,
          },
        });

        if (notice && res?.data?.lockerId) {
          try {
            const lockerRes = await this.apiService.get<GetLockersModel>({
              url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/locker/${schoolId}/${res.data.lockerId}`,
              params: {
                loginName: username,
              },
            });

            if (lockerRes?.data?.assignedTo?.email) {
              await this.emailService.sendEmail(
                {
                  email: lockerRes.data.assignedTo.email,
                  pupilId: lockerRes.data.assignedTo?.personId,
                  lockerIds: [res.data.lockerId],
                  message: `Ett lås har ändrats på ditt skåp:`,
                },
                schoolId,
                req.user,
              );
            }
          } catch (e) {
            logger.error('Error sending notice: ', e);
          }
        }
        if (res.data) {
          return response.send({ message: 'success', data: res.data });
        }
      }
    } catch (e) {
      logger.error('Error updating code lock: ', e);
      throw new HttpException(e.status || 500, e.message);
    }
  }

  @Post('/codelocks/:schoolId')
  @OpenAPI({
    summary: 'Create a new codelock',
  })
  @ResponseSchema(CodeLockApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(CreateCodeLock, 'body'))
  async createCodeLock(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Body() body: CreateCodeLock,
    @Res() response: Response<CodeLockApiResponse>,
  ): Promise<Response<CodeLockApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const update = await this.apiService.post<unknown, CreateCodeLockRequest>(body, {
        url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/codelock/${schoolId}`,
        params: {
          loginName: username,
        },
      });
      if (update) {
        const res = await this.apiService.get<CodeLockLocker>({
          url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/codelock/${schoolId}/${body.codeLockId}`,
          params: {
            loginName: username,
          },
        });
        if (res.data) {
          return response.send({ message: 'success', data: res.data });
        }
      }
    } catch (e) {
      logger.error('Error creating code lock: ', e);
      throw new HttpException(e.status || 500, e.message);
    }
  }
}
