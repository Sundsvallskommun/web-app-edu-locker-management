import {
  CodeLockLocker,
  EditCodeLockRequest,
  PupilsLockerResponseOrderBy,
  PupilsLockerResponsePagedOffsetResponse,
  SortDirection,
} from '@/data-contracts/education/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import schoolMiddleware from '@/middlewares/school.middleware';
import { CodeLockApiResponse, UpdateCodeLock } from '@/responses/codelock.response';
import { PupilApiResponse } from '@/responses/pupil.response';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Response } from 'express';
import { Body, Controller, Get, Param, Patch, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class CodeLockController {
  private apiService = new ApiService();

  @Get('/codelocks/:unitId/:lockId')
  @OpenAPI({
    summary: 'Get one codelock',
  })
  @ResponseSchema(CodeLockApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async getCodeLock(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Param('lockId') lockId: string,
    @Res() response: Response<CodeLockApiResponse>,
  ): Promise<Response<CodeLockApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.apiService.get<CodeLockLocker>({
        url: `education/1.0/codelock/${unitId}/${lockId}`,
        params: {
          loginName: username,
        },
      });
      if (res.data) {
        return response.send({ message: 'success', data: res.data });
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.status || 500, e.message);
    }
  }

  @Patch('/codelocks/:unitId/:lockId')
  @OpenAPI({
    summary: 'Update a codelock',
  })
  @ResponseSchema(CodeLockApiResponse)
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  async updateCodeLock(
    @Req() req: RequestWithUser,
    @Param('unitId') unitId: string,
    @Param('lockId') lockId: string,
    @Body() body: UpdateCodeLock,
    @Res() response: Response<CodeLockApiResponse>,
  ): Promise<Response<CodeLockApiResponse>> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const update = await this.apiService.patch({
        url: `education/1.0/codelock/${unitId}/${lockId}`,
        data: body,
        params: {
          loginName: username,
        },
      });
      if (update) {
        const res = await this.apiService.get<CodeLockLocker>({
          url: `education/1.0/codelock/${unitId}/${lockId}`,
          params: {
            loginName: username,
          },
        });
        if (res.data) {
          return response.send({ message: 'success', data: res.data });
        }
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.status || 500, e.message);
    }
  }
}
