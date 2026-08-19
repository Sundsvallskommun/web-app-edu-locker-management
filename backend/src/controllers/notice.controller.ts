import { NoticeDto } from '@/dtos/notice.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import schoolMiddleware from '@/middlewares/school.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { EmailService } from '@/services/email.service';
import { PupilDirectoryService } from '@/services/pupil-directory.service';
import { logger } from '@/utils/logger';
import { Response } from 'express';
import { Body, Controller, Param, Post, QueryParam, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@UseBefore(authMiddleware)
@Controller()
export class NoticeController {
  private readonly mailService = new EmailService();

  @Post('/notice/:schoolId')
  @OpenAPI({
    summary: 'Send locker information to pupil',
  })
  @UseBefore(schoolMiddleware, validationMiddleware(NoticeDto, 'body'))
  async createLockers(
    @Req() req: RequestWithUser,
    @Param('schoolId') schoolId: string,
    @QueryParam('includeComment') includeComment: boolean,
    @Body() body: NoticeDto,
    @Res() response: Response,
  ): Promise<Response> {
    const { username } = req.user;

    if (!username) {
      throw new HttpException(400, 'Bad Request');
    }

    // The recipient comes from the school's own pupil register, never from the body.
    // This denies with 403 when the pupil is not at this school, and the address it
    // returns is the pupil's real one - the mail carries locker location and the
    // active door code, so a client-chosen address would be a disclosure.
    const pupilDirectory = new PupilDirectoryService();
    const email = await pupilDirectory.resolveEmail(schoolId, body.pupilId, req.user);

    if (!email) {
      throw new HttpException(422, 'Email missing');
    }

    try {
      const lockerlabel = body.lockerIds?.length === 1 ? 'Ditt skåp:' : 'Dina skåp:';
      const message =
        body?.lockerIds?.length > 0
          ? `${body.message}

        ${lockerlabel}`
          : body.message;
      await this.mailService.sendEmail({ ...body, email, message }, schoolId, req.user, includeComment);
      return response.status(204).send();
    } catch (e) {
      logger.error('Error sending notice: ', e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }
}
