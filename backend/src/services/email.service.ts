import { APIS, MUNICIPALITY_ID, NODE_ENV, REPLY_EMAIL, SENDER_EMAIL, SENDER_NAME, TEST_EMAIL } from '@/config';
import { SchoolWithUnits } from '@/data-contracts/education/data-contracts';
import { EmailRequest, MessageResult } from '@/data-contracts/messaging/data-contracts';
import { GetLockersModel, LockType } from '@/data-contracts/pupillocker/data-contracts';
import { NoticeDto } from '@/dtos/notice.dto';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@/interfaces/users.interface';
import { logger } from '@/utils/logger';
import ApiService from './api.service';

interface EmailResponse extends NoticeDto {
  schoolName: string;
  lockers: GetLockersModel[];
}
export class EmailService {
  private readonly apiService = new ApiService();
  private readonly api = APIS.find(api => api.name === 'messaging');
  private readonly lockerApi = APIS.find(api => api.name === 'pupillocker');
  private readonly eduApi = APIS.find(api => api.name === 'education');

  public async sendEmail(data: NoticeDto, schoolId: string, user?: User): Promise<EmailResponse> {
    const lockerIds = data.lockerIds || [];
    let lockers: string[] = [];
    let fullLockers: GetLockersModel[] = [];
    for (let index = 0; index < lockerIds?.length; index++) {
      try {
        const res = await this.apiService.get<GetLockersModel>({
          url: `${this.lockerApi.name}/${this.lockerApi.version}/${MUNICIPALITY_ID}/locker/${schoolId}/${lockerIds[index]}`,
          params: {
            loginName: user?.username,
          },
        });
        if (res?.data && res.data.schoolId === schoolId) {
          fullLockers.push(res.data);
          lockers.push(`
                    Skåp ${res.data.name}:
                    Byggnad: ${res.data.building}
                    Våning: ${res.data.buildingFloor}
                    Lås: ${res.data.lockType === LockType.Kodlas ? 'Kod -' + res.data.activeCode : res.data.lockType}
                    `);
        }
      } catch (e) {
        console.error('Kunde inte hämta skåp', e);
        logger.error('Email Service - Error getting locker: ', e);
      }
    }

    try {
      const schoolres = await this.apiService.get<SchoolWithUnits>({
        url: `${this.eduApi.name}/${this.eduApi.version}/${MUNICIPALITY_ID}/schoolunits/${schoolId}`,
      });

      const message = `
          Här kommer information angående dina skåp på ${schoolres.data.schoolName}.
          ${data?.message ? '\n' + data.message + '\n' : ''}
          ${lockers?.length > 0 ? lockers.join('\n\n') : ''}
          `;

      await this.apiService.post<MessageResult, EmailRequest>(
        {
          emailAddress: NODE_ENV === 'production' ? data.email : TEST_EMAIL,
          subject: `Ang. skåp på ${schoolres.data.schoolName}`,
          message,
          sender: {
            name: SENDER_NAME ?? `${user?.givenName} ${user?.surname}`,
            address: SENDER_EMAIL,
            replyTo: REPLY_EMAIL,
          },
        },
        {
          url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/email`,
          headers: {
            'X-Sent-By': user?.username,
          },
        },
      );
      return {
        schoolName: schoolres.data.schoolName,
        lockers: fullLockers,
        ...data,
      };
    } catch (e) {
      logger.error('Email Service - Error sending email: ', e);
      throw new HttpException(e?.status || 500, e.message);
    }
  }
}
