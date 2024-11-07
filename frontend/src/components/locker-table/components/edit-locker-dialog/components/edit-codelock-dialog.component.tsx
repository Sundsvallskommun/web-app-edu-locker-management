import { CodeLock, SchoolLocker } from '@data-contracts/backend/data-contracts';
import { CodeLockForm } from '@interfaces/codelock.interface';
import { SchoolLockerForm } from '@interfaces/locker.interface';
import { createCodeLock, useCodeLock } from '@services/codelock-service';
import {
  Button,
  Dialog,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  RadioButton,
  Table,
} from '@sk-web-gui/react';
import { useCrudHelper } from '@utils/use-crud-helpers';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface EditCodesDialogProps {
  locker: SchoolLockerForm | SchoolLocker;
  show: boolean;
  onCloseEdit?: (activeCodeId?: number) => void;
  onCloseNew?: (codeLock?: CodeLock) => void;
  isNew?: boolean;
}

export const EditCodeLockDialog: React.FC<EditCodesDialogProps> = ({
  locker,
  show,
  onCloseEdit,
  onCloseNew,
  isNew,
}) => {
  const { codeLockId, unitId, name } = locker;
  const form = useForm<CodeLockForm>();
  const {
    register,
    reset,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form;
  const { data, update } = useCodeLock(unitId, codeLockId);
  const values = watch();
  const { t } = useTranslation();
  const { handleCreate } = useCrudHelper('codelocks');

  useEffect(() => {
    if (!isNew && data) {
      reset({ ...data, activeCodeId: data.activeCodeId.toString() });
    } else {
      reset({ activeCodeId: '', code1: '', code2: '', code3: '', code4: '', code5: '', codeLockId: '' });
    }
  }, [data, isNew]);

  const onSubmit = (data: CodeLockForm) => {
    const { codeLockId, lockerId, ...updateValues } = data;
    if (!data.activeCodeId) {
      setError('activeCodeId', { message: t('codelocks:errors.no_active_code') });
    } else if (data.activeCodeId && !data[`code${data.activeCodeId}`]) {
      setError('activeCodeId', { message: t('codelocks:errors.no_active_code') });
    } else {
      clearErrors();
      const activeCodeId = parseInt(data.activeCodeId, 10);
      if (isNew) {
        handleCreate(() =>
          createCodeLock(unitId, { ...updateValues, activeCodeId, codeLockId }).catch((e) => {
            if (e?.response?.data?.message.includes(`CodeLock (${data.codeLockId})`)) {
              setError('codeLockId', { message: t('codelocks:errors.name_unavailable') });
            }
            throw e;
          })
        ).then((res) => {
          if (res) {
            onCloseNew(res);
          }
        });
      } else {
        update({ ...updateValues, activeCodeId }).then(() => {
          onCloseEdit(activeCodeId);
        });
      }
    }
  };

  return (
    <Dialog
      show={show}
      onClose={() => (isNew ? onCloseNew() : onCloseEdit())}
      hideClosebutton={false}
      label={
        <h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0">
          {isNew ? t('codelocks:new_codelock_for_locker') : t('codelocks:edit_codes_for_lock')}
        </h1>
      }
      data-test="edit-codes-dialog"
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Content className="flex flex-col gap-24 mb-16">
            {!isNew && <p>{t('codelocks:edit_codes_helptext')}</p>}
            <div className="flex gap-24 justify-evenly">
              <FormControl className="w-full grow shrink" invalid={!!errors?.codeLockId}>
                <FormLabel>{t('lockers:properties.codeLockId')}</FormLabel>
                <Input
                  required={isNew}
                  readOnly={!isNew}
                  size="md"
                  className="w-full"
                  type="text"
                  {...register('codeLockId')}
                  data-test="edit-codes-codelockid"
                />
                {errors?.codeLockId && <FormErrorMessage>{errors.codeLockId.message}</FormErrorMessage>}
              </FormControl>
              <FormControl className="w-full grow shrink">
                <FormLabel>{t('lockers:properties.name')}</FormLabel>
                <Input
                  readOnly
                  size="md"
                  className="w-full"
                  type="text"
                  value={name}
                  data-test="edit-codes-locker-name"
                />
              </FormControl>
            </div>
            <div>
              <Table className="code-table">
                <Table.Header>
                  <Table.HeaderColumn>{t('codelocks:properties.codeNr')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('codelocks:properties.code')}</Table.HeaderColumn>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Column>
                      <RadioButton
                        data-test="edit-code-code1-radio"
                        {...register('activeCodeId')}
                        value="1"
                        disabled={!values?.code1}
                      >
                        {t('codelocks:properties.codeNr')} 1
                      </RadioButton>
                    </Table.Column>
                    <Table.Column>
                      <Input
                        placeholder={t('codelocks:placeholder.code')}
                        data-test="edit-code-code1-input"
                        {...register('code1')}
                      />
                    </Table.Column>
                  </Table.Row>
                  <Table.Row>
                    <Table.Column>
                      <RadioButton
                        data-test="edit-code-code2-radio"
                        {...register('activeCodeId')}
                        value="2"
                        disabled={!values?.code2}
                      >
                        {t('codelocks:properties.codeNr')} 2
                      </RadioButton>
                    </Table.Column>
                    <Table.Column>
                      <Input
                        placeholder={t('codelocks:placeholder.code')}
                        data-test="edit-code-code2-input"
                        {...register('code2')}
                      />
                    </Table.Column>
                  </Table.Row>
                  <Table.Row>
                    <Table.Column>
                      <RadioButton
                        data-test="edit-code-code3-radio"
                        {...register('activeCodeId')}
                        value="3"
                        disabled={!values?.code3}
                      >
                        {t('codelocks:properties.codeNr')} 3
                      </RadioButton>
                    </Table.Column>
                    <Table.Column>
                      <Input
                        placeholder={t('codelocks:placeholder.code')}
                        data-test="edit-code-code3-input"
                        {...register('code3')}
                      />
                    </Table.Column>
                  </Table.Row>
                  <Table.Row>
                    <Table.Column>
                      <RadioButton
                        data-test="edit-code-code4-radio"
                        {...register('activeCodeId')}
                        value="4"
                        disabled={!values?.code4}
                      >
                        {t('codelocks:properties.codeNr')} 4
                      </RadioButton>
                    </Table.Column>
                    <Table.Column>
                      <Input
                        placeholder={t('codelocks:placeholder.code')}
                        data-test="edit-code-code4-input"
                        {...register('code4')}
                      />
                    </Table.Column>
                  </Table.Row>
                  <Table.Row>
                    <Table.Column>
                      <RadioButton
                        data-test="edit-code-code5-radio"
                        {...register('activeCodeId')}
                        value="5"
                        disabled={!values?.code5}
                      >
                        {t('codelocks:properties.codeNr')} 5
                      </RadioButton>
                    </Table.Column>
                    <Table.Column>
                      <Input
                        placeholder={t('codelocks:placeholder.code')}
                        data-test="edit-code-code5-input"
                        {...register('code5')}
                      />
                    </Table.Column>
                  </Table.Row>
                </Table.Body>
              </Table>
              <Divider />
            </div>
          </Dialog.Content>
          <Dialog.Buttons className="justify-evenly">
            <Button
              variant="secondary"
              onClick={() => (isNew ? onCloseNew() : onCloseEdit())}
              className="w-full grow shrink"
            >
              {capitalize(t('common:cancel'))}
            </Button>
            <Button
              data-test="edit-code-submit"
              variant="primary"
              color="vattjom"
              type="submit"
              className="w-full grow shrink"
              aria-describedby="error-message"
            >
              {capitalize(t('common:save_changes'))}
            </Button>
          </Dialog.Buttons>
          <div id="error-message">
            {errors.activeCodeId && (
              <FormErrorMessage className="text-error-text-primary">{errors.activeCodeId.message}</FormErrorMessage>
            )}
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};
