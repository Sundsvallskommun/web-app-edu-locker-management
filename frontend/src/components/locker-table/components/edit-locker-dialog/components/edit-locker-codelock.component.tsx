import { CodeLock } from '@data-contracts/backend/data-contracts';
import { SchoolLockerForm } from '@interfaces/locker.interface';
import { useCodeLock, useCodeLocks } from '@services/codelock-service';
import { Button, Combobox, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { codesFromCodeLock } from '@utils/codes-from-codelock.util';
import { XCircle } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { EditCodesDialog } from './edit-codes-dialog.component';
import { EditLockerRemoveCodeDialog } from './edit-locker-remove-code-dialog.component';

export const EditLockerCodeLock: React.FC = () => {
  const { t } = useTranslation();
  const { watch, setValue, setError, clearErrors } = useFormContext<SchoolLockerForm>();
  const [isReset, setIsReset] = useState<boolean>(false);
  const codeLockId = watch('codeLockId');
  const unitId = watch('unitId');
  const codelockRef = useRef(null);
  const activeCode = watch('activeCodeId');
  const { data, refresh } = useCodeLock(unitId, codeLockId);
  const [showRemove, setShowRemove] = useState<boolean>(false);
  const [showEditCodes, setShowEditCodes] = useState<boolean>(false);

  const handleResetCodeLockId = () => {
    setError('codeLockId', { message: 'Busy removing' });
    setShowRemove(true);
  };

  const locker = watch();

  useEffect(() => {
    if (isReset && codelockRef.current) {
      codelockRef.current.focus();
      setIsReset(false);
    }
  }, [codelockRef, isReset]);

  const handleChangeActiveCode = (event: ChangeEvent<HTMLSelectElement>) => {
    const activeCodeId = event.target.value;
    setValue('activeCodeId', activeCodeId);
  };

  const handleCloseRemove = (removed?: boolean) => {
    if (removed) {
      refreshLocks();
    }
    clearErrors('codeLockId');
    setShowRemove(false);
  };

  const codes = !data ? undefined : codesFromCodeLock(data);
  const { data: locks, refresh: refreshLocks } = useCodeLocks(unitId);

  const handleSelectCodeLock = (lock: CodeLock) => {
    setValue('activeCodeId', lock.activeCodeId.toString());
    setValue('codeLockId', lock.codeLockId);
  };

  const handleEditCodes = () => {
    setError('activeCodeId', { message: 'Busy editiing' });
    setShowEditCodes(true);
  };

  const handleCloseEditCodes = (activeCodeId?: number) => {
    clearErrors('activeCodeId');
    if (activeCodeId) {
      setValue('activeCodeId', activeCodeId.toString());
      refresh();
    }
    setShowEditCodes(false);
  };

  return (
    <>
      <div className="flex gap-24 justify-evenly">
        <FormControl className="w-full grow shrink">
          <FormLabel>{t('lockers:properties.codeLockId')}</FormLabel>
          {codeLockId ?
            <Input.Group>
              <Input
                readOnly
                size="md"
                className="w-full"
                type="text"
                value={codeLockId}
                data-test="locker-edit-codelockid-set"
              />
              <Input.RightAddin>
                <Button
                  rounded
                  iconButton
                  variant="tertiary"
                  size="sm"
                  showBackground={false}
                  data-test="locker-edit-codelockid-reset"
                  onClick={() => handleResetCodeLockId()}
                >
                  <Icon icon={<XCircle />} />
                </Button>
              </Input.RightAddin>
            </Input.Group>
          : <Combobox value={codeLockId} className="w-full" disabled={!locks || locks?.length < 1}>
              <Combobox.Input ref={codelockRef} className="w-full" data-test="locker-edit-codelockid-unset" />
              <Combobox.List data-test="locker-edit-codelockid-unset-list">
                {locks &&
                  locks?.map((lock) => (
                    <Combobox.Option
                      key={`lock-${lock.codeLockId}`}
                      onChange={() => handleSelectCodeLock(lock)}
                      value={lock.codeLockId}
                    >
                      {lock.codeLockId}
                    </Combobox.Option>
                  ))}
              </Combobox.List>
            </Combobox>
          }
          <EditCodesDialog show={showEditCodes} onClose={handleCloseEditCodes} locker={locker} />
          <EditLockerRemoveCodeDialog show={showRemove} onClose={() => handleCloseRemove(false)} />
        </FormControl>
        <FormControl className="w-full grow shrink" disabled={!codeLockId || !codes}>
          <div className="flex justify-between">
            <FormLabel>{t('lockers:properties.activeCodeId')}</FormLabel>
            {codeLockId && codes && (
              <Button
                data-test="locker-edit-edit-codes"
                variant="link"
                className="text-small"
                onClick={handleEditCodes}
              >
                {t('codelocks:edit_codes')}
              </Button>
            )}
          </div>
          <Select
            className="w-full"
            value={activeCode?.toString()}
            onChange={handleChangeActiveCode}
            data-test="locker-edit-code"
          >
            {codes?.map((code, index) => (
              <Select.Option key={`code-${index}-${code.code}`} value={code.codeNr?.toString()}>
                {capitalize(t('codelocks:code'))} {code.codeNr} - {code.code}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
