import { NoticeDto } from '@/dtos/notice.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import schoolMiddleware from '@/middlewares/school.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { EmailService } from '@/services/email.service';
import { logger } from '@/utils/logger';
import { Response } from 'express';
import { Body, Controller, Param, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class NoticeController {
  private mailService = new EmailService();

  @Post('/notice/:schoolId')
  @OpenAPI({
    summary: 'Send locker information to pupil',
  })
  @UseBefore(authMiddleware)
  @UseBefore(schoolMiddleware)
  @UseBefore(validationMiddleware(NoticeDto, 'body'))
  async createLockers(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @Body() body: NoticeDto,
    @Res() response: Response,
  ): Promise<Response> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const message =
        body?.lockerIds?.length > 0
          ? `${body.message}

        ${body.lockerIds.length === 1 ? 'Ditt skåp:' : 'Dina skåp:'}`
          : body.message;
      await this.mailService.sendEmail({ ...body, message }, schoolId, req.user);
      return response.status(204).send();
    } catch (e) {
      logger.error('Error sending notice: ', e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }
}
