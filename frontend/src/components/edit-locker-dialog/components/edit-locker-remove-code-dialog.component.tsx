import { SchoolLocker } from '@data-contracts/backend/data-contracts';
import { Button, Dialog } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
interface EditLockerRemoveCodeDialogProps {
  show: boolean;
  onClose: (remove?: boolean) => void;
}

export const EditLockerRemoveCodeDialog: React.FC<EditLockerRemoveCodeDialogProps> = ({ show, onClose }) => {
  const { watch } = useFormContext<SchoolLocker>();
  const { t } = useTranslation();
  const name = watch('name');
  const codeLockId = watch('codeLockId');

  return (
    <Dialog
      className="max-w-[42rem]"
      show={show}
      onClose={onClose}
      label={t('lockers:remove_codelock_from_locker')}
      disableCloseOutside={false}
      hideClosebutton={false}
      data-test="edit-locker-remove-codelock-dialog"
    >
      <Dialog.Content className="flex flex-col pt-8 pb-16 gap-24">
        <header>
          <h1 className="text-h4-sm md:text-h4-md xl:text-h4-lg">
            {t('lockers:remove_codelock_from_locker_with_names', { codelock: codeLockId, locker: name })}
          </h1>
        </header>
        <p>{t('lockers:remove_codelock_information')}</p>
      </Dialog.Content>

      <Dialog.Buttons className="flex justify-evenly gap-12">
        <Button variant="secondary" onClick={() => onClose(false)} className="grow">
          {capitalize(t('common:cancel'))}
        </Button>
        <Button
          data-test="edit-locker-remove-codelock-submit"
          variant="primary"
          color="error"
          onClick={() => onClose(true)}
          className="grow"
        >
          {capitalize(t('lockers:remove_codelock'))}
        </Button>
      </Dialog.Buttons>
    </Dialog>
  );
};
