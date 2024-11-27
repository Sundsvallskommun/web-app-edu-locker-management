import { Pupil } from '@data-contracts/backend/data-contracts';
import { LockerStatus, SchoolLockerForm } from '@interfaces/locker.interface';
import { Button, FormControl, FormLabel, Input } from '@sk-web-gui/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AssignLockerDialog } from '../../locker-table/components/assign-locker-dialog.component';
import { UnassignLockerDialog } from '../../locker-table/components/unassign-locker-dialog.component';

export const EditLockerAssignPupil: React.FC = () => {
  const { watch, setValue } = useFormContext<SchoolLockerForm>();

  const pupilName = watch('assignedTo.pupilName');
  const className = watch('assignedTo.className');
  const { t } = useTranslation();
  const [unassign, setUnassign] = useState<boolean>(false);
  const [assign, setAssign] = useState<boolean>(false);

  const locker = watch();

  const handleAssignment = () => {
    if (pupilName) {
      setUnassign(true);
    } else {
      setAssign(true);
    }
  };

  const handleUnassign = (status: LockerStatus) => {
    setValue('assignedTo', null);
    setValue('status', status);
    setUnassign(false);
  };

  const handleAssign = (assigned?: Pupil) => {
    if (assigned) {
      setValue('assignedTo', { pupilName: assigned.name, className: assigned.className });
      setValue('assignId', assigned.personId);
    }
    setAssign(false);
  };
  return (
    <div className="flex gap-24 justify-evenly items-end">
      <FormControl className="w-full grow shrink" readOnly>
        <FormLabel>{t('lockers:properties.assignedTo')}</FormLabel>
        <Input
          data-test="locker-edit-pupil"
          className="w-full"
          value={
            pupilName ? `${pupilName}${className ? ` (${className})` : ''}` : t('lockers:properties.assignedTo_none')
          }
        />
      </FormControl>
      <div className="w-full shrink grow flex flex-col">
        <Button
          onClick={() => handleAssignment()}
          variant={pupilName ? 'secondary' : 'primary'}
          color="vattjom"
          className="w-full"
          data-test="edit-locker-pupil-assignment"
        >
          {pupilName ?
            t('lockers:unassign_locker_for', { pupil: t('pupils:name_one') })
          : t('lockers:assign_locker_to_pupil')}
        </Button>
        <UnassignLockerDialog
          show={unassign}
          lockers={[locker]}
          onClose={() => setUnassign(false)}
          onUnassign={handleUnassign}
        />
        <AssignLockerDialog
          show={assign}
          showCode={false}
          locker={locker}
          onClose={() => setAssign(false)}
          onAssign={handleAssign}
        />
      </div>
    </div>
  );
};
