import { useLocker } from '@services/locker-service/use-locker';
import { useTranslation } from 'react-i18next';

interface NoticeModalLockerPreviewProps {
  lockerId: string;
  schoolId: string;
  showComment: boolean;
}

export const NoticeModalLockerPreview: React.FC<NoticeModalLockerPreviewProps> = ({
  lockerId,
  schoolId,
  showComment,
}) => {
  const { data } = useLocker(schoolId, lockerId);
  const { t } = useTranslation();
  return (
    <ul className="mb-12 font-normal" data-test={`locker-preview-${lockerId}`}>
      <li className="text-small">
        <strong>{t('lockers:properties.building')}: </strong>
        {data?.building}
      </li>
      <li className="text-small">
        <strong>{t('lockers:properties.buildingFloor')}: </strong>
        {data?.buildingFloor}
      </li>
      <li className="text-small">
        <strong>{t('lockers:properties.lock')}: </strong>
        {data?.lockType === 'Kodlås' ? `Kod - ${data?.activeCode}` : data?.lockType}
      </li>
      {showComment && (
        <li className="text-small">
          <strong>{t('lockers:properties.comment')}: </strong>
          {data?.comment}
        </li>
      )}
    </ul>
  );
};
