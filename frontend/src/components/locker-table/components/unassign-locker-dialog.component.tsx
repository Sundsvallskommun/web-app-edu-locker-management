import { LockerStatusUpdateStatusEnum, SchoolLocker } from '@data-contracts/backend/data-contracts';
import { useLockers } from '@services/locker-service';
import { Button, Dialog, Divider, FormControl, FormLabel, RadioButton } from '@sk-web-gui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface UnassignLockerDialogProps {
  lockers: SchoolLocker[];
  show: boolean;
  onClose: () => void;
}

export const UnassignLockerDialog: React.FC<UnassignLockerDialogProps> = ({ lockers, show, onClose }) => {
  const { t } = useTranslation();
  const { unassign } = useLockers();

  const [status, setStatus] = useState<LockerStatusUpdateStatusEnum>(LockerStatusUpdateStatusEnum.FREE);
  const pupils = lockers.reduce((pupils: string[], locker) => {
    if (!locker?.assignedTo) {
      return pupils;
    }

    const pupil = `${locker.assignedTo.pupilName} (${locker.assignedTo.className})`;

    if (pupils.includes(pupil)) {
      return pupils;
    }

    return [...pupils, pupil];
  }, []);

  const isSingle = pupils.length === 1;

  const heading =
    isSingle ?
      t('lockers:do_you_want_to_unassign_locker', {
        locker: lockers.length > 1 ? `${lockers[0].name} ${t('common:and')} ${lockers[0].name}` : lockers[0].name,
      })
    : t('lockers:do_you_want_to_unassign', { locker: t('lockers:count', { count: lockers.length }) });

  const handleUnassign = () => {
    unassign(
      lockers.map((locker) => locker.lockerId),
      status
    );
    onClose();
  };
  return (
    <Dialog
      show={show}
      hideClosebutton={false}
      disableCloseOutside={false}
      label={t('lockers:unassign_locker_for', { pupil: t('pupils:name', { count: pupils.length }) })}
      onClose={onClose}
    >
      <Dialog.Content className="gap-24">
        <header>
          <h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0 p-0">{heading}</h1>
        </header>
        <div>
          <p>{t('lockers:assignment_will_be_removed_for')}</p>
          <ul>
            {pupils.map((pupil) => (
              <li key={pupil}>{pupil}</li>
            ))}
          </ul>
        </div>
        <FormControl fieldset>
          <FormLabel>{t('lockers:choose_new_status')}</FormLabel>
          <RadioButton
            name="status"
            checked={status === LockerStatusUpdateStatusEnum.FREE}
            value={LockerStatusUpdateStatusEnum.FREE}
            onChange={(e) => setStatus(e.target.value as LockerStatusUpdateStatusEnum)}
          >
            {t('lockers:empty')}
          </RadioButton>
          <RadioButton
            name="status"
            checked={status === LockerStatusUpdateStatusEnum.EMPTY}
            value={LockerStatusUpdateStatusEnum.EMPTY}
            onChange={(e) => setStatus(e.target.value as LockerStatusUpdateStatusEnum)}
          >
            {t('lockers:needs_cleaning')}
          </RadioButton>
        </FormControl>
        <Divider />
      </Dialog.Content>
      <Dialog.Buttons className="justify-evenly">
        <Button variant="secondary" onClick={() => onClose()} className="w-auto grow">
          {capitalize(t('common:cancel'))}
        </Button>
        <Button variant="primary" color="error" onClick={() => handleUnassign()} className="w-auto grow">
          {capitalize(t('lockers:unassign_locker'))}
        </Button>
      </Dialog.Buttons>
    </Dialog>
  );
};