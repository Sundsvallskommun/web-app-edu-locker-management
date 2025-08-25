import { useLocker } from '@services/locker-service/use-locker';

interface NoticeModalLockerPreviewProps {
  lockerId: string;
  schoolId: string;
}

export const NoticeModalLockerPreview: React.FC<NoticeModalLockerPreviewProps> = ({ lockerId, schoolId }) => {
  const { data } = useLocker(schoolId, lockerId);

  return (
    <ul className="mb-12 font-normal">
      <li className="text-small">
        <strong>Byggnad: </strong>
        {data?.building}
      </li>
      <li className="text-small">
        <strong>Våning: </strong>
        {data?.buildingFloor}
      </li>
      <li className="text-small">
        <strong>Lås: </strong>
        {data?.lockType === 'Kodlås' ? `Kod - ${data?.activeCode}` : data?.lockType}
      </li>
    </ul>
  );
};
