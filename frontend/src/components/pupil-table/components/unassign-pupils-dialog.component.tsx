import { Pupil, PupilLocker } from '@data-contracts/backend/data-contracts';
import { LockerStatus } from '@interfaces/locker.interface';
import { useLockers } from '@services/locker-service';
import { usePupils } from '@services/pupil-service';
import { Button, Dialog, Divider, FormControl, FormLabel, RadioButton } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface UnassignPupilsDialogProps {
  pupils: Pupil[];
  show: boolean;
  onClose: () => void;
}

export const UnassignPupilsDialog: React.FC<UnassignPupilsDialogProps> = ({ pupils, show, onClose }) => {
  const { t } = useTranslation();
  const { unassign, setSchoolUnit, schoolUnit } = useLockers();
  const { schoolUnit: pupilSchoolunit } = usePupils();

  useEffect(() => {
    if (pupilSchoolunit !== schoolUnit) {
      setSchoolUnit(pupilSchoolunit);
    }
  }, [pupilSchoolunit, schoolUnit]);

  const [status, setStatus] = useState<LockerStatus>('Ledigt');
  const lockers: PupilLocker[] = pupils.reduce((lockers: Pupil['lockers'], pupil) => {
    if (!pupil?.lockers) {
      return lockers;
    }
    return [...lockers, ...pupil.lockers];
  }, []);

  const isSingle = pupils.length === 1;

  const heading =
    isSingle ?
      t('lockers:do_you_want_to_unassign_locker', {
        locker:
          lockers.length > 1 ?
            `${lockers[0].lockerName} ${t('common:and')} ${lockers[1].lockerName}`
          : lockers[0].lockerName,
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
      data-test="unassign-locker-dialog"
    >
      <Dialog.Content className="gap-24">
        <header>
          <h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0 p-0">{heading}</h1>
        </header>
        <div>
          <p>{t('lockers:assignment_will_be_removed_for')}</p>
          <ul>
            {pupils.map((pupil) => (
              <li key={pupil.personId}>{`${pupil.name} (${pupil?.className})`}</li>
            ))}
          </ul>
        </div>
        <FormControl fieldset>
          <FormLabel>{t('lockers:choose_new_status')}</FormLabel>
          <RadioButton
            name="status"
            checked={status === 'Ledigt'}
            value={'Ledigt'}
            onChange={(e) => setStatus(e.target.value as LockerStatus)}
          >
            {t('lockers:empty')}
          </RadioButton>
          <RadioButton
            name="status"
            checked={status === 'Ska Tömmas'}
            value={'Ska Tömmas'}
            onChange={(e) => setStatus(e.target.value as LockerStatus)}
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
