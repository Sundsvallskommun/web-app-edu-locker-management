import { CodeLockForm } from '@interfaces/codelock.interface';
import { SchoolLockerForm } from '@interfaces/locker.interface';
import { useCodeLock } from '@services/codelock-service';
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
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface EditCodesDialogProps {
  locker: SchoolLockerForm;
  show: boolean;
  onClose: (activeCodeId?: number) => void;
}

export const EditCodesDialog: React.FC<EditCodesDialogProps> = ({ locker, show, onClose }) => {
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

  useEffect(() => {
    if (data) {
      reset({ ...data, activeCodeId: data.activeCodeId.toString() });
    }
  }, [data]);

  const onSubmit = (data: CodeLockForm) => {
    if (!data.activeCodeId) {
      setError('activeCodeId', { message: t('codelocks:errors.no_active_code') });
    } else if (data.activeCodeId && !data[`code${data.activeCodeId}`]) {
      setError('activeCodeId', { message: t('codelocks:errors.no_active_code') });
    } else {
      clearErrors();
      const activeCodeId = parseInt(values.activeCodeId, 10);
      update({ ...values, activeCodeId }).then(() => {
        onClose(activeCodeId);
      });
    }
  };

  return (
    <Dialog
      show={show}
      onClose={() => onClose(1)}
      hideClosebutton={false}
      label={<h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0">{t('codelocks:edit_codes_for_lock')}</h1>}
      data-test="edit-codes-dialog"
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Content className="flex flex-col gap-24 mb-16">
            <p>{t('codelocks:edit_codes_helptext')}</p>
            <div className="flex gap-24 justify-evenly">
              <FormControl className="w-full grow shrink">
                <FormLabel>{t('lockers:properties.codeLockId')}</FormLabel>
                <Input
                  readOnly
                  size="md"
                  className="w-full"
                  type="text"
                  value={codeLockId}
                  data-test="edit-codes-codelockid"
                />
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
                      <Input data-test="edit-code-code1-input" {...register('code1')} />
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
                      <Input data-test="edit-code-code2-input" {...register('code2')} />
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
                      <Input data-test="edit-code-code3-input" {...register('code3')} />
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
                      <Input data-test="edit-code-code4-input" {...register('code4')} />
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
                      <Input data-test="edit-code-code5-input" {...register('code5')} />
                    </Table.Column>
                  </Table.Row>
                </Table.Body>
              </Table>
              <Divider />
            </div>
          </Dialog.Content>
          <Dialog.Buttons className="justify-evenly">
            <Button variant="secondary" onClick={() => onClose()} className="w-full grow shrink">
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
