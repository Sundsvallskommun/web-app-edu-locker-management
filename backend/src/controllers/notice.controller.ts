import { NoticeDto } from '@/dtos/notice.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import schoolMiddleware from '@/middlewares/school.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { EmailService } from '@/services/email.service';
import { holdsLocker, PupilDirectoryService } from '@/services/pupil-directory.service';
import { logger } from '@/utils/logger';
import { deny } from '@/utils/ownership';
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

    // The mail contains the lockers' door codes, so the request is refused (403) unless:
    // - the pupil is at this school, and
    // - every locker in it is the pupil's own. (The email service only checks that a
    //   locker is at this school, which would let one pupil get another's door code.)
    // The address comes from the pupil register, never from body.email.
    const pupil = await new PupilDirectoryService().assertPupilAtSchool(schoolId, body.pupilId, req.user);

    for (const lockerId of body.lockerIds ?? []) {
      if (!holdsLocker(pupil, lockerId)) {
        deny('locker', lockerId, schoolId);
      }
    }

    const email = pupil.email;

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
