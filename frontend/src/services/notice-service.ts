import { NoticeDto } from '@data-contracts/backend/data-contracts';
import { apiService } from './api-service';
import { useEffect, useState } from 'react';
import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';

const postNotice = (unitId: string, body: NoticeDto) => {
  return apiService.post(`/notice/${unitId}`, body);
};

export const useNotice = (unitId: string) => {
  const [schoolId, setSchoolId] = useState<string>(unitId);
  const message = useSnackbar();
  const { t } = useTranslation();

  useEffect(() => {
    setSchoolId(unitId);
  }, [unitId]);

  const sendNotice = (body: NoticeDto) =>
    postNotice(schoolId, body)
      .then(() => {
        message({ status: 'info', message: t('notice:notice_sent'), icon: Mail });
      })
      .catch(() => {
        message({ status: 'error', message: t('notice:notice_failed') });
      });

  return { sendNotice };
};
