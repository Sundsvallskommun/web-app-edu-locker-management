import { EditLockerBodyLockTypeEnum, SchoolLocker } from '@data-contracts/backend/data-contracts';
import { useLockers } from '@services/locker-service';
import { Button, Dialog, Divider, FormControl, FormLabel, Input, RadioButton } from '@sk-web-gui/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { EditLockerAssignPupil } from './components/edit-locker-assign-pupil.component';
import { EditLockerBuildings } from './components/edit-locker-buildings.component';
import { EditLockerCodeLock } from './components/edit-locker-codelock.component';
import { useCodeLock } from '@services/codelock-service';
import { SchoolLockerForm } from '@interfaces/locker.interface';

interface EditLockerDialogProps {
  show: boolean;
  onClose: () => void;
  locker: SchoolLocker;
}

export const EditLockerDialog: React.FC<EditLockerDialogProps> = ({ show, onClose, locker }) => {
  const { t } = useTranslation();
  const form = useForm<SchoolLockerForm>();
  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { isDirty },
  } = form;
  const codeLockId = watch('codeLockId');
  const { update, refresh, unassign, assign } = useLockers();
  const { update: updateCodeLock, data: codeLock } = useCodeLock(locker?.unitId, codeLockId);

  const lockType = watch('lockType');

  const handleClose = () => {
    refresh();
    onClose();
  };

  useEffect(() => {
    if (locker) {
      reset({ ...locker, activeCodeId: locker.activeCodeId.toString() } as SchoolLockerForm);
    }
  }, [locker]);

  const onSubmit = (data: SchoolLockerForm) => {
    const lockType =
      data.lockType === EditLockerBodyLockTypeEnum.Kodlas && !data.codeLockId ?
        EditLockerBodyLockTypeEnum.Inget
      : (data.lockType as EditLockerBodyLockTypeEnum);

    const codeLockId = lockType === EditLockerBodyLockTypeEnum.Kodlas ? data.codeLockId : '';

    const activeCodeId = codeLockId ? parseInt(data.activeCodeId) : null;

    const status =
      data?.assignedTo ? ''
      : data.status !== locker.status ? data.status
      : null;

    if (
      codeLockId &&
      (codeLockId.toString() !== locker?.codeLockId.toString() ||
        activeCodeId.toString() !== codeLock?.activeCodeId.toString())
    ) {
      updateCodeLock({ activeCodeId });
    }

    const shouldUnassign =
      (!!locker.assignedTo && locker.assignedTo.toString() !== data?.assignedTo?.toString()) || !!data?.assignId;
    const shouldAssign = !!data?.assignId;

    if (shouldUnassign) {
      unassign([locker.lockerId], data.status);
    }

    if (shouldAssign) {
      assign([{ lockerId: locker.lockerId, personId: data.assignId }]);
    }

    if (isDirty) {
      const patchData = {
        name: data.name,
        lockType: lockType,
        codeLockId: codeLockId !== locker.codeLockId ? codeLockId : null,
        building: data.building,
        buildingFloor: data.buildingFloor,
        status,
      };

      update(locker.lockerId, patchData).then((res) => {
        if (res) {
          handleClose();
        }
      });
    } else {
      handleClose();
    }
  };

  return !locker ?
      <></>
    : <Dialog
        show={show}
        hideClosebutton={false}
        onClose={handleClose}
        disableCloseOutside={false}
        label={t('lockers:edit_settings')}
        data-test="edit-locker-dialog"
      >
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Dialog.Content className="gap-24 flex flex-col">
              <header>
                <h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0">{locker?.name}</h1>
              </header>
              <EditLockerBuildings />
              <div className="flex gap-24 justify-evenly">
                <FormControl className="w-full grow shrink">
                  <FormLabel>{t('lockers:properties.name')}</FormLabel>
                  <Input size="md" className="w-full" type="text" {...register('name')} data-test="locker-edit-name" />
                </FormControl>
                <FormControl fieldset className="w-full grow shrink">
                  <FormLabel>{t('lockers:properties.lockType')}</FormLabel>
                  <RadioButton.Group inline className="w-full">
                    <RadioButton
                      {...register('lockType')}
                      value={EditLockerBodyLockTypeEnum.Kodlas}
                      data-test="locker-edit-locktype-code"
                    >
                      {t('lockers:properties.lockType-code')}
                    </RadioButton>
                    <RadioButton
                      {...register('lockType')}
                      value={EditLockerBodyLockTypeEnum.Hanglas}
                      data-test="locker-edit-locktype-key"
                    >
                      {t('lockers:properties.lockType-key')}
                    </RadioButton>
                  </RadioButton.Group>
                </FormControl>
              </div>
              {lockType === 'Kodlås' && <EditLockerCodeLock />}
              <Divider />
              <EditLockerAssignPupil />
              <Divider />
            </Dialog.Content>
            <Dialog.Buttons className="justify-evenly">
              <Button variant="secondary" onClick={() => handleClose()} className="w-full grow shrink">
                {capitalize(t('common:cancel'))}
              </Button>
              <Button
                data-test="edit-locker-submit"
                variant="primary"
                color="vattjom"
                type="submit"
                className="w-full grow shrink"
              >
                {capitalize(t('common:save_changes'))}
              </Button>
            </Dialog.Buttons>
          </form>
        </FormProvider>
      </Dialog>;
};
