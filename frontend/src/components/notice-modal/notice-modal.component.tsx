import { Pupil } from '@data-contracts/backend/data-contracts';
import { useNotice } from '@services/notice-service';
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  MetaCard,
  Modal,
  Textarea,
} from '@sk-web-gui/react';
import { Mail } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NoticeModalLockerPreview } from './components/notice-modal-locker-preview.component';

interface NoticeModalProps {
  show: boolean;
  onClose: () => void;
  pupil: Pupil;
  schoolId: string;
  preSelectLockers?: string[];
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ show, onClose, pupil, schoolId, preSelectLockers }) => {
  const { t } = useTranslation();
  const [selectedLockers, setSelectedLockers] = useState<string[]>(
    preSelectLockers || pupil.lockers?.map((locker) => locker.lockerId) || []
  );
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSelectLocker = (lockerId: string) => {
    if (selectedLockers.includes(lockerId)) {
      setSelectedLockers(selectedLockers.filter((id) => id !== lockerId));
    } else {
      setSelectedLockers([...selectedLockers, lockerId]);
      setError('');
    }
  };

  useEffect(() => {
    if (message) {
      setError('');
    }
  }, [message]);

  const { sendNotice } = useNotice(schoolId);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message && (!selectedLockers || selectedLockers.length < 1)) {
      setError(t('notice:dto.error'));
    } else {
      setError('');
      sendNotice({
        pupilId: pupil.personId,
        email: pupil.email,
        lockerIds: selectedLockers,
        message,
      }).then(() => {
        onClose();
      });
    }
  };

  return (
    <Modal show={show} onClose={onClose} label={t('notice:notice_pupil')} className="max-w-[80rem]">
      <form onSubmit={handleSubmit}>
        <Modal.Content>
          <header>
            <h1>{t('notice:send_notice_to', { name: pupil.name })}</h1>
          </header>
          <FormControl fieldset>
            <FormLabel>{t('notice:dto.lockerIds')}</FormLabel>
            {pupil?.lockers?.length > 0 ?
              <Checkbox.Group direction="row">
                {pupil.lockers?.map((locker) => (
                  <Checkbox
                    key={locker.lockerId}
                    value={locker.lockerId}
                    checked={selectedLockers.includes(locker.lockerId)}
                    onChange={() => handleSelectLocker(locker.lockerId)}
                  >
                    {locker.lockerName}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            : <p>{t('notice:no_lockers')}</p>}
          </FormControl>
          <FormControl className="w-full">
            <FormLabel>{t('notice:dto.message')}</FormLabel>
            <Textarea
              value={message}
              placeholder={t('notice:dto.message_placeholder')}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
              rows={3}
            />
          </FormControl>
          <div>
            <FormLabel>{t('notice:preview')}</FormLabel>
            <div className="sk-meta-card" data-color="mono">
              <Icon className="sk-meta-card-text-icon" size={36} icon={<Mail />}></Icon>
              <MetaCard.Body className="w-full gap-8 flex flex-col">
                <MetaCard.Header>
                  <p>
                    <strong>{t('notice:dto.email')}: </strong>
                    {pupil.email}
                  </p>
                </MetaCard.Header>
                <Divider />
                <p className="text-small">{message}</p>
                {selectedLockers?.length > 0 && (
                  <>
                    <label id="lockerlabel" className="text-label-small">
                      {t('notice:your_lockers', { count: selectedLockers.length })}:
                    </label>
                    <ul aria-labelledby="lockerlabel">
                      {pupil.lockers
                        ?.filter((locker) => selectedLockers.includes(locker.lockerId))
                        ?.map((locker) => (
                          <li key={locker.lockerId} className="text-label-small">
                            {t('lockers:locker_name', { name: locker.lockerName })}:{' '}
                            <NoticeModalLockerPreview lockerId={locker.lockerId} schoolId={schoolId} />
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </MetaCard.Body>
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer className="flex-col">
          <div className="flex flex-row gap-12">
            <Button type="button" onClick={onClose} variant="secondary" className="capitalize">
              {t('common:cancel')}
            </Button>
            <Button
              type="submit"
              variant={error ? 'tertiary' : 'primary'}
              aria-describedby={error && 'error-message'}
              className="capitalize"
              color="vattjom"
            >
              {t('common:send')}
            </Button>
          </div>
          {error && <FormErrorMessage id="error-message">{error}</FormErrorMessage>}
        </Modal.Footer>
      </form>
    </Modal>
  );
};
