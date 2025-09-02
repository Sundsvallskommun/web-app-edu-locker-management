import { NoticeModal } from '@components/notice-modal/notice-modal.component';
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

  const locker = watch();

  const assignedTo = watch('assignedTo');
  const pupilName = watch('assignedTo.pupilName');
  const className = watch('assignedTo.className');
  const newAssign = watch('toAssign');

  const pupil = {
    personId: assignedTo?.personId ?? '',
    email: assignedTo?.email ?? '',
    name: pupilName ?? '',
    lockers: [{ lockerId: locker?.lockerId ?? '', lockerName: locker?.name ?? '' }],
    teachers: [],
  };
  const { t } = useTranslation();
  const [unassign, setUnassign] = useState<boolean>(false);
  const [assign, setAssign] = useState<boolean>(false);
  const [notice, setNotice] = useState<boolean>(false);

  const handleAssignment = () => {
    if (pupilName) {
      setUnassign(true);
    } else {
      setAssign(true);
    }
  };

  const handleUnassign = (status: LockerStatus) => {
    setValue('assignedTo', undefined);
    setValue('status', status);
    setUnassign(false);
  };

  const handleAssign = (assigned?: Pupil) => {
    if (assigned) {
      setValue('assignedTo', { pupilName: assigned.name, className: assigned.className });
      setValue('toAssign', assigned);
    }
    setAssign(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <FormControl className="w-full grow shrink" readOnly>
        <FormLabel>{t('lockers:properties.assignedTo')}</FormLabel>
        <Input
          data-test="locker-edit-pupil"
          className="w-full"
          value={
            pupilName ?
              `${pupilName} (${className || t('pupils:missing_class')})`
            : t('lockers:properties.assignedTo_none')
          }
        />
      </FormControl>
      <div className="flex gap-24 justify-evenly w-full">
        <Button
          className="w-full grow shrink"
          variant="tertiary"
          disabled={!pupilName || !!newAssign?.personId || !assignedTo?.email}
          onClick={() => setNotice(true)}
          data-test="edit-locker-pupil-notice"
        >
          {t('notice:notice_pupil')}
        </Button>
        <Button
          onClick={() => handleAssignment()}
          variant={pupilName ? 'secondary' : 'primary'}
          color="vattjom"
          className="w-full grow shrink"
          data-test="edit-locker-pupil-assignment"
        >
          {pupilName ?
            t('lockers:unassign_locker_for', { pupil: t('pupils:name_one') })
          : t('lockers:assign_locker_to_pupil')}
        </Button>
      </div>
      <div className="w-full shrink grow flex flex-col h-0">
        <NoticeModal show={notice} onClose={() => setNotice(false)} pupil={pupil} schoolId={locker.schoolId ?? ''} />
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
